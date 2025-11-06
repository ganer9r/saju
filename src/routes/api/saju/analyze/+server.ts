import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SajuCalculator } from '$lib/saju/core/calculator';
import { createAnalyzer, AnalysisError } from '$lib/saju/services/analyzer';
import { createStorage, StorageError } from '$lib/saju/services/storage';
import type { UserInfo } from '$lib/saju/types';
import type { AnalysisRequest, AnalysisResponse } from '$lib/saju/types/report';
import { ERROR_CODES } from '$lib/saju/types/report';

export const POST: RequestHandler = async ({ request }) => {
	try {
		// 1. 요청 데이터 파싱
		const requestData = await request.json();
		const userInfo: UserInfo = requestData.userInfo;
		const options = requestData.options || {};

		// 2. 입력 검증
		if (!userInfo || !userInfo.birthDate || !userInfo.gender) {
			return json({
				reportId: '',
				status: 'error',
				error: {
					code: ERROR_CODES.INVALID_INPUT,
					message: '필수 입력 정보가 누락되었습니다.'
				}
			}, { status: 400 });
		}

		// 3. 사주 계산
		let sajuResult;
		try {
			const calculator = new SajuCalculator();
			sajuResult = await calculator.extract(userInfo);
		} catch (error: any) {
			return json({
				reportId: '',
				status: 'error',
				error: {
					code: ERROR_CODES.SAJU_CALCULATION_FAILED,
					message: '사주 계산에 실패했습니다.',
					details: error.message
				}
			}, { status: 400 });
		}

		// 4. 중복 체크 (캐싱)
		const storage = createStorage();
		const cacheKey = generateCacheKey(userInfo, sajuResult);
		const existingReport = await storage.get(cacheKey);
		
		if (existingReport) {
			return json({
				reportId: existingReport.metadata.id,
				status: 'success',
				report: existingReport
			});
		}

		// 5. 분석 요청 구성
		const analysisRequest: AnalysisRequest = {
			userInfo,
			sajuResult,
			options
		};

		// 6. LLM 분석 실행
		const analyzer = createAnalyzer();
		let report;
		
		try {
			report = await analyzer.analyze(analysisRequest);
		} catch (error: any) {
			if (error instanceof AnalysisError) {
				return json({
					reportId: '',
					status: 'error',
					error: {
						code: error.code,
						message: error.message,
						details: error.details
					}
				}, { status: getStatusCodeForError(error.code) });
			}
			
			return json({
				reportId: '',
				status: 'error',
				error: {
					code: ERROR_CODES.SERVER_ERROR,
					message: '분석 중 오류가 발생했습니다.',
					details: error.message
				}
			}, { status: 500 });
		}

		// 7. 레포트 저장
		try {
			await storage.save(report);
		} catch (error: any) {
			if (error instanceof StorageError) {
				return json({
					reportId: report.metadata.id,
					status: 'error',
					error: {
						code: error.code,
						message: error.message,
						details: error.details
					}
				}, { status: 500 });
			}
		}

		// 8. 성공 응답
		return json({
			reportId: report.metadata.id,
			status: 'success',
			report
		});

	} catch (error: any) {
		console.error('Saju analysis API error:', error);
		
		return json({
			reportId: '',
			status: 'error',
			error: {
				code: ERROR_CODES.SERVER_ERROR,
				message: '서버 오류가 발생했습니다.'
			}
		}, { status: 500 });
	}
};

/**
 * 캐시 키 생성 (중복 분석 방지용)
 */
function generateCacheKey(userInfo: UserInfo, sajuResult: any): string {
	// 동일한 사주 정보에 대한 중복 분석 방지
	const keyData = {
		birthDate: userInfo.birthDate,
		birthTime: userInfo.birthTime,
		gender: userInfo.gender,
		calendarType: userInfo.calendarType,
		isLeapMonth: userInfo.isLeapMonth
	};
	
	const keyString = JSON.stringify(keyData);
	
	// 간단한 해시 생성 (실제로는 더 견고한 해싱 알고리즘 사용 권장)
	let hash = 0;
	for (let i = 0; i < keyString.length; i++) {
		const char = keyString.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash;
	}
	
	const now = new Date();
	const datePrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
	
	return `${datePrefix}-${Math.abs(hash).toString(36)}`;
}

/**
 * 에러 코드에 따른 HTTP 상태 코드 반환
 */
function getStatusCodeForError(errorCode: string): number {
	switch (errorCode) {
		case ERROR_CODES.INVALID_INPUT:
		case ERROR_CODES.SAJU_CALCULATION_FAILED:
			return 400;
		case ERROR_CODES.LLM_REQUEST_FAILED:
		case ERROR_CODES.LLM_PARSE_FAILED:
			return 502;
		case ERROR_CODES.LLM_TIMEOUT:
			return 408;
		case ERROR_CODES.STORAGE_ERROR:
		case ERROR_CODES.SERVER_ERROR:
		default:
			return 500;
	}
}