import type { LLMProvider, ChatOptions, ChatResponse } from '../types';
import { LLMTimeoutError, mergeChatOptions } from '../types';
import { MODEL_CONFIGS, type AllLLMModelType } from '../models';
import { env } from '$env/dynamic/private';

/**
 * Claude HTTP Provider
 * Raw HTTP 요청을 통한 Anthropic Claude API 호출
 */
export class ClaudeProvider implements LLMProvider {
	public readonly name = 'claude';
	private apiKey: string;
	private baseUrl: string;
	private modelType: AllLLMModelType;
	private defaultOptions: ChatOptions;
	
	constructor(modelType: AllLLMModelType, baseUrl?: string) {
		this.modelType = modelType;
		this.defaultOptions = MODEL_CONFIGS[modelType];
		this.apiKey = env.ANTHROPIC_API_KEY;
		this.baseUrl = baseUrl || 'https://api.anthropic.com';
		
		if (!this.apiKey) {
			throw new Error('ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.');
		}
	}
	
	/**
	 * 채팅 완성 요청
	 */
	async chat(prompt: string, options?: ChatOptions): Promise<ChatResponse> {
		// 기본 설정과 사용자 옵션 병합
		const mergedOptions = mergeChatOptions(this.defaultOptions, options);
		const { model, temperature, maxTokens, timeout } = mergedOptions;
		
		try {
			const response = await this.withTimeout(
				fetch(`${this.baseUrl}/v1/messages`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-API-Key': this.apiKey,
						'anthropic-version': '2023-06-01'
					},
					body: JSON.stringify({
						model,
						messages: [{ role: 'user', content: prompt }],
						max_tokens: maxTokens,
						temperature
					})
				}),
				timeout || 300000
			);
			
			if (!response.ok) {
				const error = await response.text();
				throw new Error(`Claude API 오류 (${response.status}): ${error}`);
			}
			
			const data = await response.json();
			
			return {
				content: data.content[0].text,
				model: model || data.model,
				usage: data.usage ? {
					prompt_tokens: data.usage.input_tokens,
					completion_tokens: data.usage.output_tokens,
					total_tokens: data.usage.input_tokens + data.usage.output_tokens
				} : undefined
			};
			
		} catch (error: any) {
			if (error.name === 'LLMTimeoutError') {
				throw error;
			}
			
			throw new Error(`Claude API 호출 중 오류: ${error.message}`);
		}
	}
	
	/**
	 * API 키 유효성 검증
	 */
	async validateAPIKey(): Promise<boolean> {
		try {
			await this.chat('test', { maxTokens: 5 });
			return true;
		} catch {
			return false;
		}
	}
	
	/**
	 * 타임아웃 처리
	 */
	private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(() => {
				reject(new LLMTimeoutError(this.name, timeoutMs));
			}, timeoutMs);
		});
		
		return Promise.race([promise, timeoutPromise]);
	}
}

