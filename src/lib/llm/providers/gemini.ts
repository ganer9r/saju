import type { LLMProvider, ChatOptions, ChatResponse } from '../types';
import { LLMTimeoutError, mergeChatOptions } from '../types';
import { MODEL_CONFIGS, type AllLLMModelType } from '../models';
import { env } from '$env/dynamic/private';

/**
 * Gemini HTTP Provider
 * Raw HTTP 요청을 통한 Google Gemini API 호출
 */
export class GeminiProvider implements LLMProvider {
	public readonly name = 'gemini';
	private apiKey: string;
	private baseUrl: string;
	private modelType: AllLLMModelType;
	private defaultOptions: ChatOptions;
	
	constructor(modelType: AllLLMModelType, baseUrl?: string) {
		this.modelType = modelType;
		this.defaultOptions = MODEL_CONFIGS[modelType];
		this.apiKey = env.GOOGLE_AI_API_KEY;
		this.baseUrl = baseUrl || 'https://generativelanguage.googleapis.com';
		
		if (!this.apiKey) {
			throw new Error('GOOGLE_AI_API_KEY 환경변수가 설정되지 않았습니다.');
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
				fetch(`${this.baseUrl}/v1beta/models/${model}:generateContent`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'x-goog-api-key': this.apiKey
					},
					body: JSON.stringify({
						contents: [{
							parts: [{ text: prompt }]
						}],
						generationConfig: {
							temperature,
							maxOutputTokens: maxTokens
						}
					})
				}),
				timeout || 300000
			);
			
			if (!response.ok) {
				const error = await response.text();
				throw new Error(`Gemini API 오류 (${response.status}): ${error}`);
			}
			
			const data = await response.json();
			
			// 응답 검증
			if (!data.candidates || !data.candidates[0]) {
				throw new Error('Gemini API 응답에 후보가 없습니다.');
			}
			
			return {
				content: data.candidates[0].content.parts[0].text,
				model: model || this.modelType,
				usage: data.usageMetadata ? {
					prompt_tokens: data.usageMetadata.promptTokenCount || 0,
					completion_tokens: data.usageMetadata.candidatesTokenCount || 0,
					total_tokens: data.usageMetadata.totalTokenCount || 0
				} : undefined
			};
			
		} catch (error: any) {
			if (error.name === 'LLMTimeoutError') {
				throw error;
			}
			
			throw new Error(`Gemini API 호출 중 오류: ${error.message}`);
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

