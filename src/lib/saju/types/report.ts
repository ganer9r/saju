import type { UserInfo, SajuData } from './index';

/**
 * 사주 분석 레포트 메타데이터
 */
export interface ReportMetadata {
	id: string;
	createdAt: Date;
	userInfo: UserInfo;
	sajuResult: SajuData;
	llmProvider: string;
	analysisVersion: string;
}

/**
 * 사주 분석 레포트 내용
 */
export interface ReportContent {
	summary: string;
	strongestElement: string;
	personalityImpact: string;
	relationships: string;
	problems: string;
	harmony: string;
	fiveYearOutlook: string;
	conclusion: string;
}

/**
 * 완전한 사주 분석 레포트
 */
export interface SajuReport {
	metadata: ReportMetadata;
	content: ReportContent;
	rawLLMResponse: string;
}

/**
 * 레포트 저장 형식
 */
export interface StoredReport {
	id: string;
	createdAt: string;
	userInfo: UserInfo;
	sajuResult: SajuData;
	content: ReportContent;
	metadata: {
		llmProvider: string;
		analysisVersion: string;
	};
	rawLLMResponse: string;
}

/**
 * 분석 요청 데이터
 */
export interface AnalysisRequest {
	userInfo: UserInfo;
	sajuResult: SajuData;
	options?: {
		llmProvider?: string;
		temperature?: number;
		maxTokens?: number;
		timeout?: number;
	};
}

/**
 * 분석 응답 데이터
 */
export interface AnalysisResponse {
	reportId: string;
	status: 'success' | 'error';
	message?: string;
	report?: SajuReport;
	error?: {
		code: string;
		message: string;
		details?: any;
	};
}

/**
 * 레포트 조회 응답
 */
export interface ReportGetResponse {
	status: 'found' | 'not_found' | 'error';
	report?: SajuReport;
	error?: {
		code: string;
		message: string;
	};
}

/**
 * 분석 버전 정보
 */
export const ANALYSIS_VERSION = '1.0.0';

/**
 * 에러 코드 정의
 */
export const ERROR_CODES = {
	INVALID_INPUT: 'INVALID_INPUT',
	SAJU_CALCULATION_FAILED: 'SAJU_CALCULATION_FAILED',
	LLM_REQUEST_FAILED: 'LLM_REQUEST_FAILED',
	LLM_TIMEOUT: 'LLM_TIMEOUT',
	LLM_PARSE_FAILED: 'LLM_PARSE_FAILED',
	STORAGE_ERROR: 'STORAGE_ERROR',
	REPORT_NOT_FOUND: 'REPORT_NOT_FOUND',
	SERVER_ERROR: 'SERVER_ERROR'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];