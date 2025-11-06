import { ClaudeProvider } from '../../llm/providers/claude';
import { createSajuAnalysisPrompt } from '../prompts';
import type { LLMProvider } from '../../llm/types';
import type {
	SajuReport,
	ReportContent,
	AnalysisRequest,
	ErrorCode,
	ReportMetadata
} from '../types/report';
import { ANALYSIS_VERSION, ERROR_CODES } from '../types/report';
import { GeminiProvider } from '$lib/llm/providers/gemini';
import { OpenAIProvider } from '$lib/llm/providers/openai';
import { LLM_CLAUDE_MODELS, LLM_GEMINI_MODELS, LLM_GPT_MODELS } from '$lib/llm/models';
import { CloudflareAiGateway } from '$lib/llm/cloudflare/gateway';

/**
 * 사주 분석 서비스
 */
export class SajuAnalyzer {
	private llmProvider: LLMProvider;

	constructor(llmProvider?: LLMProvider) {
		// 새로운 CloudflareAiGateway 클래스를 사용
		this.llmProvider = llmProvider || new CloudflareAiGateway(
			new OpenAIProvider(LLM_GPT_MODELS.GPT_4_MINI)
		);
	}

	/**
	 * 사주 분석 실행
	 * 모든 비즈니스 로직이 여기에 집중됨
	 */
	async analyze(request: AnalysisRequest): Promise<SajuReport> {
		try {
			// 1. 입력 검증
			this.validateInput(request);

			// 2. 사주 분석 레포트 생성
			const rawResponse = await this.generateReport(request);

			// 3. 응답 파싱
			const content = this.parseResponse(rawResponse);

			// 4. 메타데이터 생성
			const metadata = this.createMetadata(request);

			// 5. 최종 레포트 구성
			const report: SajuReport = {
				metadata,
				content,
				rawLLMResponse: rawResponse
			};

			return report;

		} catch (error: any) {
			throw this.handleError(error);
		}
	}

	/**
	 * 사주 분석 레포트 생성 (비즈니스 로직)
	 * LLM Provider는 단순히 텍스트 생성만 담당
	 */
	private async generateReport(request: AnalysisRequest): Promise<string> {
		// 1. 사주 전용 프롬프트 생성
		const prompt = createSajuAnalysisPrompt(request.userInfo, request.sajuResult);

		// 2. LLM을 통한 텍스트 생성 (필요시에만 옵션 전달)
		const response = await this.llmProvider.chat(prompt, request.options);
		
		return response.content;
	}


	/**
	 * 입력 데이터 검증
	 */
	private validateInput(request: AnalysisRequest): void {
		const { userInfo, sajuResult } = request;

		// 필수 사용자 정보 검증
		if (!userInfo.birthDate) {
			throw new AnalysisError(ERROR_CODES.INVALID_INPUT, '생년월일이 필요합니다.');
		}

		if (!userInfo.gender) {
			throw new AnalysisError(ERROR_CODES.INVALID_INPUT, '성별이 필요합니다.');
		}

		// 사주 결과 검증
		if (!sajuResult.year || !sajuResult.month || !sajuResult.day || !sajuResult.hour) {
			throw new AnalysisError(ERROR_CODES.SAJU_CALCULATION_FAILED, '사주 계산 결과가 유효하지 않습니다.');
		}
	}

	/**
	 * LLM 응답 파싱
	 */
	private parseResponse(rawResponse: string): ReportContent {
		try {
			// 섹션별로 텍스트 추출
			const sections = this.extractSections(rawResponse);

			return {
				summary: sections['사주 한마디'] || '',
				strongestElement: sections['가장 강한 오행 분석'] || '',
				personalityImpact: sections['성격에 미치는 영향'] || '',
				relationships: sections['대인관계'] || '',
				problems: sections['문제점과 주의사항'] || '',
				harmony: sections['조화와 개선 방법'] || '',
				fiveYearOutlook: sections['향후 5년 전망'] || '',
				conclusion: sections['마무리'] || ''
			};

		} catch (error) {
			throw new AnalysisError(
				ERROR_CODES.LLM_PARSE_FAILED,
				'LLM 응답을 파싱할 수 없습니다.',
				{ rawResponse, error }
			);
		}
	}

	/**
	 * 응답에서 섹션별 텍스트 추출
	 */
	private extractSections(text: string): Record<string, string> {
		const sections: Record<string, string> = {};
		const lines = text.split('\n');
		let currentSection = '';
		let currentContent: string[] = [];

		for (const line of lines) {
			// ### 제목 형태의 섹션 헤더 감지
			const headerMatch = line.match(/^###\s*(?:\d+\.\s*)?(.+)$/);
			
			if (headerMatch) {
				// 이전 섹션 저장
				if (currentSection && currentContent.length > 0) {
					sections[currentSection] = currentContent.join('\n').trim();
				}
				
				// 새 섹션 시작
				currentSection = headerMatch[1].trim();
				currentContent = [];
			} else if (currentSection && line.trim()) {
				// 현재 섹션에 내용 추가
				currentContent.push(line);
			}
		}

		// 마지막 섹션 저장
		if (currentSection && currentContent.length > 0) {
			sections[currentSection] = currentContent.join('\n').trim();
		}

		return sections;
	}

	/**
	 * 레포트 메타데이터 생성
	 */
	private createMetadata(request: AnalysisRequest): ReportMetadata {
		const now = new Date();
		const id = this.generateReportId(now);

		return {
			id,
			createdAt: now,
			userInfo: request.userInfo,
			sajuResult: request.sajuResult,
			llmProvider: this.llmProvider.name,
			analysisVersion: ANALYSIS_VERSION
		};
	}

	/**
	 * 레포트 ID 생성
	 */
	private generateReportId(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hour = String(date.getHours()).padStart(2, '0');
		const minute = String(date.getMinutes()).padStart(2, '0');
		
		return `${year}-${month}-${day}-${hour}${minute}`;
	}

	/**
	 * 에러 처리
	 */
	private handleError(error: any): Error {
		if (error instanceof AnalysisError) {
			return error;
		}

		// LLM 타임아웃 에러
		if (error.name === 'LLMTimeoutError') {
			return new AnalysisError(
				ERROR_CODES.LLM_TIMEOUT,
				`LLM 요청이 시간 초과되었습니다 (${error.provider}, ${error.timeout}ms)`
			);
		}

		// LLM 관련 에러
		if (error.message?.includes('API')) {
			return new AnalysisError(
				ERROR_CODES.LLM_REQUEST_FAILED,
				`LLM 요청 실패: ${error.message}`
			);
		}

		// 기타 에러
		return new AnalysisError(
			ERROR_CODES.SERVER_ERROR,
			`분석 중 예상치 못한 오류가 발생했습니다: ${error.message}`
		);
	}
}

/**
 * 분석 관련 에러 클래스
 */
export class AnalysisError extends Error {
	constructor(
		public code: ErrorCode,
		message: string,
		public details?: any
	) {
		super(message);
		this.name = 'AnalysisError';
	}
}

/**
 * 편의를 위한 기본 분석기 생성 함수
 */
export function createAnalyzer(llmProvider?: LLMProvider): SajuAnalyzer {
	return new SajuAnalyzer(llmProvider);
}