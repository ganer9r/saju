import type { LLMProvider, ChatOptions, ChatResponse } from '../types';

/**
 * 테스트용 Mock LLM 프로바이더
 */
export class MockLLMProvider implements LLMProvider {
	public readonly name = 'mock';
	private mockResponses: Record<string, string> = {};
	private shouldFail = false;
	private delay = 0;

	constructor() {
		this.setupDefaultResponses();
	}

	/**
	 * Mock 응답 설정
	 */
	setMockResponse(key: string, response: string): void {
		this.mockResponses[key] = response;
	}

	/**
	 * 실패 모드 설정
	 */
	setShouldFail(fail: boolean): void {
		this.shouldFail = fail;
	}

	/**
	 * 응답 지연 설정
	 */
	setDelay(ms: number): void {
		this.delay = ms;
	}

	/**
	 * 채팅 완성 요청 (범용)
	 */
	async chat(prompt: string, options?: ChatOptions): Promise<ChatResponse> {
		if (this.delay > 0) {
			await new Promise(resolve => setTimeout(resolve, this.delay));
		}

		if (this.shouldFail) {
			throw new Error('Mock LLM Provider 실패');
		}

		// 프롬프트에서 키워드 추출하여 적절한 응답 반환
		const responseKey = this.extractResponseKey(prompt);
		const content = this.mockResponses[responseKey] || this.mockResponses['default'];
		
		return {
			content,
			model: options?.model || 'mock-model',
			usage: {
				prompt_tokens: prompt.length / 4, // 대략적인 토큰 계산
				completion_tokens: content.length / 4,
				total_tokens: (prompt.length + content.length) / 4
			}
		};
	}


	/**
	 * API 키 유효성 검증
	 */
	async validateAPIKey(): Promise<boolean> {
		return !this.shouldFail;
	}

	/**
	 * 기본 응답 설정
	 */
	private setupDefaultResponses(): void {
		this.mockResponses['default'] = `
### 사주 한마디
테스트 일반 응답

### 가장 강한 오행 분석
테스트 일반 오행

### 성격에 미치는 영향
테스트 일반 성격

### 대인관계
테스트 일반 관계

### 문제점과 주의사항
테스트 일반 문제

### 조화와 개선 방법
테스트 일반 조화

### 향후 5년 전망
테스트 일반 전망

### 마무리
테스트 일반 마무리
`;

		// 'male' 응답 독립적 설정
		this.mockResponses['male'] = `
### 사주 한마디
테스트 남성 응답

### 가장 강한 오행 분석
테스트 남성 오행

### 성격에 미치는 영향
테스트 남성 성격

### 대인관계
테스트 남성 관계

### 문제점과 주의사항
테스트 남성 문제

### 조화와 개선 방법
테스트 남성 조화

### 향후 5년 전망
테스트 남성 전망

### 마무리
테스트 남성 마무리
`;

		this.mockResponses['female'] = `
### 사주 한마디
테스트 여성 응답

### 가장 강한 오행 분석
테스트 여성 오행

### 성격에 미치는 영향
테스트 여성 성격

### 대인관계
테스트 여성 관계

### 문제점과 주의사항
테스트 여성 문제

### 조화와 개선 방법
테스트 여성 조화

### 향후 5년 전망
테스트 여성 전망

### 마무리
`;
	}

	/**
	 * 프롬프트에서 응답 키 추출
	 */
	private extractResponseKey(prompt: string): string {
		// 한글 또는 영어로 성별 체크
		if (prompt.includes('남성') || prompt.includes('male')) return 'male';
		if (prompt.includes('여성') || prompt.includes('female')) return 'female';
		return 'default';
	}

	/**
	 * 응답 초기화
	 */
	reset(): void {
		this.shouldFail = false;
		this.delay = 0;
		this.setupDefaultResponses();
	}
}