import type { LLMProvider, ChatOptions, ChatResponse } from '../types';
import { LLMTimeoutError, mergeChatOptions } from '../types';
import { MODEL_CONFIGS, type AllLLMModelType } from '../models';
import { env } from '$env/dynamic/private';

/**
 * OpenAI HTTP Provider
 * Raw HTTP 요청을 통한 OpenAI API 호출
 */
export class OpenAIProvider implements LLMProvider {
	public readonly name = 'openai';
	private apiKey: string;
	private baseUrl: string;
	private modelType: AllLLMModelType;
	private defaultOptions: ChatOptions;
	
	constructor(modelType: AllLLMModelType, baseUrl?: string) {
		this.modelType = modelType;
		this.defaultOptions = MODEL_CONFIGS[modelType];
		this.apiKey = env.OPENAI_API_KEY;
		this.baseUrl = baseUrl || 'https://api.openai.com/v1';
		
		if (!this.apiKey) {
			throw new Error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다.');
		}
	}
	
	/**
	 * 채팅 완성 요청
	 */
	async chat(prompt: string, options?: ChatOptions): Promise<ChatResponse> {
		// 기본 설정과 사용자 옵션 병합
		const mergedOptions = mergeChatOptions(this.defaultOptions, options);
		const { model, temperature, maxTokens, maxCompletionTokens, timeout } = mergedOptions;
		
		try {
			// 모델별 파라미터 설정
			const body: any = {
				model,
				messages: [{ role: 'user', content: prompt }]
			};
			
			// GPT-4와 o1 모델 구분
			const isGPT4 = model!.includes('gpt-4') && !model!.includes('gpt-4o');
			const isO1Model = model!.includes('o1') || model!.includes('o3');
			
			if (isGPT4) {
				// GPT-4: max_tokens, temperature 사용
				body.max_tokens = maxTokens;
				body.temperature = temperature;
			} else if (isO1Model) {
				// o1/o3 모델: max_completion_tokens만 사용 (temperature 지원 안함)
				body.max_completion_tokens = maxCompletionTokens || maxTokens;
			} else {
				// 기타 OpenAI 모델 (GPT-4o, GPT-5 등): max_completion_tokens, temperature 사용
				body.max_completion_tokens = maxCompletionTokens || maxTokens;
				body.temperature = temperature;
			}
			
			const response = await this.withTimeout(
				fetch(`${this.baseUrl}/chat/completions`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${this.apiKey}`
					},
					body: JSON.stringify(body)
				}),
				timeout || 300000
			);
			
			if (!response.ok) {
				const error = await response.text();
				throw new Error(`OpenAI API 오류 (${response.status}): ${error}`);
			}
			
			const data = await response.json();
			
			return {
				content: data.choices[0].message.content,
				model: data.model || model,
				usage: data.usage ? {
					prompt_tokens: data.usage.prompt_tokens,
					completion_tokens: data.usage.completion_tokens,
					total_tokens: data.usage.total_tokens
				} : undefined
			};
			
		} catch (error: any) {
			if (error.name === 'LLMTimeoutError') {
				throw error;
			}
			
			throw new Error(`OpenAI API 호출 중 오류: ${error.message}`);
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

