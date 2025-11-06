import type { ChatOptions } from './types';

export const LLM_GPT_MODELS = {
	GPT_5: 'gpt-5',
	GPT_5_MINI: 'gpt-5-mini',
	O3: 'o3',
	GPT_4_MINI: 'gpt-4.1-mini'
} as const;

export const LLM_CLAUDE_MODELS = {
	OPUS: 'claude-opus',
	SONNET: 'claude-sonnet',
	HAIKU: 'claude-haiku',
} as const;

export const LLM_GEMINI_MODELS = {
	PRO: 'gemini-pro',
	FLASH: 'gemini-flash',
} as const;

export type GPTModelType = typeof LLM_GPT_MODELS[keyof typeof LLM_GPT_MODELS];
export type ClaudeModelType = typeof LLM_CLAUDE_MODELS[keyof typeof LLM_CLAUDE_MODELS];
export type GeminiModelType = typeof LLM_GEMINI_MODELS[keyof typeof LLM_GEMINI_MODELS];

/**
 * 모든 LLM 모델 타입의 유니온
 */
export type AllLLMModelType = GPTModelType | ClaudeModelType | GeminiModelType;

/**
 * 모델별 상세 설정 정보
 */
export const MODEL_CONFIGS: Record<AllLLMModelType, ChatOptions> = {
	// GPT Models
	[LLM_GPT_MODELS.GPT_5]: {
		model: 'gpt-5',
		maxCompletionTokens: 16000,
	},
	
	[LLM_GPT_MODELS.GPT_5_MINI]: {
		model: 'gpt-5-mini',
		maxCompletionTokens: 12000,
	},
	
	[LLM_GPT_MODELS.O3]: {
		model: 'o3',
		temperature: 0.7,
		maxCompletionTokens: 12000,
	},
	
	[LLM_GPT_MODELS.GPT_4_MINI]: {
		model: 'gpt-4.1-mini',
		temperature: 0.7,
		maxTokens: 8000,
	},
	
	// Claude Models
	[LLM_CLAUDE_MODELS.OPUS]: {
		model: 'claude-opus-4-1-20250805',
		temperature: 0.7,
		maxTokens: 8000,
	},
	
	[LLM_CLAUDE_MODELS.SONNET]: {
		model: 'claude-sonnet-4-20250514',
		temperature: 0.7,
		maxTokens: 12000,
	},
	
	[LLM_CLAUDE_MODELS.HAIKU]: {
		model: 'claude-3-5-haiku-20241022',
		temperature: 0.7,
		maxTokens: 8000,
	},
	
	// Gemini Models
	[LLM_GEMINI_MODELS.PRO]: {
		model: 'gemini-2.5-pro',
		temperature: 0.7,
		maxTokens: 12000,
	},
	
	[LLM_GEMINI_MODELS.FLASH]: {
		model: 'gemini-2.5-flash',
		temperature: 0.7,
		maxTokens: 12000,
	}
};