import type { UserInfo, SajuData } from '$lib/saju/types';

/**
 * LLM 프로바이더 인터페이스
 * 모든 LLM 프로바이더가 구현해야 하는 공통 인터페이스
 * 비즈니스 로직 없이 순수한 텍스트 생성만 담당
 */
export interface LLMProvider {
	/** 프로바이더 이름 */
	name: string;
	
	/**
	 * 채팅 완성 요청 (범용 텍스트 생성)
	 * @param prompt 입력 프롬프트
	 * @param options 요청 옵션
	 * @returns 표준화된 응답 결과
	 */
	chat(prompt: string, options?: ChatOptions): Promise<ChatResponse>;
	
	/**
	 * API 키 유효성 검증 (선택적)
	 * @returns API 키가 유효한지 여부
	 */
	validateAPIKey?(): Promise<boolean>;
}

/**
 * 채팅 완성 요청 옵션
 */
export interface ChatOptions {
	/** 사용할 모델 (선택사항, 각 프로바이더별 기본값 사용) */
	model?: string;
	
	/** 창의성 조절 (0.0 ~ 1.0, 기본값: 0.7) */
	temperature?: number;
	
	/** 최대 토큰 수 (기본값: 8000) */
	maxTokens?: number;

	/** 최대 완성 토큰 수 (기본값: 4000) */
	maxCompletionTokens?: number;
	
	/** 타임아웃 (밀리초, 기본값: 300000 = 5분) */
	timeout?: number;
}

/**
 * 채팅 완성 응답
 */
export interface ChatResponse {
	/** 응답 텍스트 */
	content: string;
	
	/** 사용된 모델명 */
	model: string;
	
	/** 토큰 사용량 (선택사항) */
	usage?: TokenUsage;
}

/**
 * 토큰 사용량 정보
 */
export interface TokenUsage {
	/** 프롬프트 토큰 수 */
	prompt_tokens: number;
	
	/** 완성 토큰 수 */
	completion_tokens: number;
	
	/** 총 토큰 수 */
	total_tokens: number;
}

/**
 * LLM 호출 시 전달되는 컨텍스트 정보 
 * @deprecated Analyzer 서비스에서 직접 ChatOptions 사용 권장
 */
export interface LLMContext {
	/** 사용자 입력 정보 */
	userInfo: UserInfo;
	
	/** 계산된 사주 데이터 */
	sajuData: SajuData;
	
	/** 창의성 조절 (0.0 ~ 1.0, 기본값: 0.7) */
	temperature?: number;
	
	/** 최대 토큰 수 (기본값: 8000) */
	maxTokens?: number;
	
	/** 타임아웃 (밀리초, 기본값: 300000 = 5분) */
	timeout?: number;
}

/**
 * LLM 프로바이더 설정
 */
export interface LLMConfig {
	/** 프로바이더 타입 */
	provider: 'claude' | 'openai' | 'gemini';
	
	/** API 키 */
	apiKey: string;
	
	/** 사용할 모델 (선택사항, 각 프로바이더별 기본값 사용) */
	model?: string;
	
	/** 창의성 조절 (0.0 ~ 1.0, 기본값: 0.7) */
	temperature?: number;
	
	/** 최대 토큰 수 (기본값: 8000) */
	maxTokens?: number;
	
	/** 타임아웃 (밀리초, 기본값: 300000 = 5분) */
	timeout?: number;
	
	/** 재시도 횟수 (기본값: 3) */
	retryCount?: number;
	
	/** 재시도 간격 (밀리초, 기본값: 1000) */
	retryDelay?: number;
}

/**
 * LLM 에러 타입
 */
export class LLMError extends Error {
	constructor(
		message: string,
		public provider: string,
		public originalError?: Error
	) {
		super(message);
		this.name = 'LLMError';
	}
}

/**
 * LLM 타임아웃 에러
 */
export class LLMTimeoutError extends LLMError {
	constructor(provider: string, timeout: number) {
		super(`LLM ${provider} 응답 시간 초과 (${timeout}ms)`, provider);
		this.name = 'LLMTimeoutError';
	}
}

/**
 * 두 ChatOptions를 병합하는 유틸리티 함수
 * 후자가 전자를 덮어씁니다.
 */
export function mergeChatOptions(base: ChatOptions, override?: ChatOptions): ChatOptions {
	if (!override) return base;
	
	return {
		...base,
		...override,
		// undefined 값은 기본값을 유지
		model: override.model ?? base.model,
		temperature: override.temperature ?? base.temperature,
		maxTokens: override.maxTokens ?? base.maxTokens,
		maxCompletionTokens: override.maxCompletionTokens ?? base.maxCompletionTokens,
		timeout: override.timeout ?? base.timeout
	};
}