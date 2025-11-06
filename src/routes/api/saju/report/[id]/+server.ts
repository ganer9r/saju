import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createStorage, StorageError } from '$lib/saju/services/storage';
import type { ReportGetResponse } from '$lib/saju/types/report';
import { ERROR_CODES } from '$lib/saju/types/report';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const reportId = params.id;

		// 1. 레포트 ID 검증
		if (!reportId) {
			return json({
				status: 'error',
				error: {
					code: ERROR_CODES.INVALID_INPUT,
					message: '레포트 ID가 필요합니다.'
				}
			}, { status: 400 });
		}

		// 2. 레포트 ID 형식 검증
		if (!isValidReportId(reportId)) {
			return json({
				status: 'error',
				error: {
					code: ERROR_CODES.INVALID_INPUT,
					message: '유효하지 않은 레포트 ID 형식입니다.'
				}
			}, { status: 400 });
		}

		// 3. 저장소에서 레포트 조회
		const storage = createStorage();
		let report;

		try {
			report = await storage.get(reportId);
		} catch (error: any) {
			if (error instanceof StorageError) {
				return json({
					status: 'error',
					error: {
						code: error.code,
						message: error.message
					}
				}, { status: 500 });
			}
			
			return json({
				status: 'error',
				error: {
					code: ERROR_CODES.SERVER_ERROR,
					message: '레포트 조회 중 오류가 발생했습니다.'
				}
			}, { status: 500 });
		}

		// 4. 레포트가 없는 경우
		if (!report) {
			return json({
				status: 'not_found',
				error: {
					code: ERROR_CODES.REPORT_NOT_FOUND,
					message: '요청한 레포트를 찾을 수 없습니다.'
				}
			}, { status: 404 });
		}

		// 5. 성공 응답
		return json({
			status: 'found',
			report
		});

	} catch (error: any) {
		console.error('Report retrieval API error:', error);
		
		return json({
			status: 'error',
			error: {
				code: ERROR_CODES.SERVER_ERROR,
				message: '서버 오류가 발생했습니다.'
			}
		}, { status: 500 });
	}
};

/**
 * 레포트 ID 형식 검증
 * 형식: YYYY-MM-DD-HHmm 또는 YYYY-MM-DD-{hash}
 */
function isValidReportId(reportId: string): boolean {
	// 기본 형식: YYYY-MM-DD-HHmm
	const basicPattern = /^\d{4}-\d{2}-\d{2}-\d{4}$/;
	
	// 해시 형식: YYYY-MM-DD-{hash}
	const hashPattern = /^\d{4}-\d{2}-\d{2}-[a-z0-9]+$/;
	
	return basicPattern.test(reportId) || hashPattern.test(reportId);
}

/**
 * 레포트 존재 여부만 확인하는 HEAD 메서드
 */
export const HEAD: RequestHandler = async ({ params }) => {
	try {
		const reportId = params.id;

		if (!reportId || !isValidReportId(reportId)) {
			return new Response(null, { status: 400 });
		}

		const storage = createStorage();
		const exists = await storage.exists(reportId);

		return new Response(null, { status: exists ? 200 : 404 });

	} catch (error: any) {
		console.error('Report HEAD API error:', error);
		return new Response(null, { status: 500 });
	}
};