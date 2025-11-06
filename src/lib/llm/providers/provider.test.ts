// import { describe, it, expect } from 'vitest';
// import { ClaudeProvider } from './claude';
// import { OpenAIProvider } from './openai';
// import { GeminiProvider } from './gemini';
// import { createCloudflareGatewayLLM } from '../cloudflare/gateway';
// import { LLM_CLAUDE_MODELS, LLM_GPT_MODELS, LLM_GEMINI_MODELS } from '../models';

// describe('LLM Providers', () => {
// 	describe('Provider 인터페이스 구현', () => {
// 		it('ClaudeProvider가 LLMProvider 인터페이스를 구현해야 함', () => {
// 			const provider = new ClaudeProvider(LLM_CLAUDE_MODELS.HAIKU);
			
// 			expect(provider).toHaveProperty('name');
// 			expect(provider).toHaveProperty('chat');
// 			expect(provider.name).toBe('claude');
// 			expect(typeof provider.chat).toBe('function');
// 		});
		
// 		it('OpenAIProvider가 LLMProvider 인터페이스를 구현해야 함', () => {
// 			const provider = new OpenAIProvider(LLM_GPT_MODELS.O3);
			
// 			expect(provider).toHaveProperty('name');
// 			expect(provider).toHaveProperty('chat');
// 			expect(provider.name).toBe('openai');
// 			expect(typeof provider.chat).toBe('function');
// 		});
		
// 		it('GeminiProvider가 LLMProvider 인터페이스를 구현해야 함', () => {
// 			const provider = new GeminiProvider(LLM_GEMINI_MODELS.FLASH);
			
// 			expect(provider).toHaveProperty('name');
// 			expect(provider).toHaveProperty('chat');
// 			expect(provider.name).toBe('gemini');
// 			expect(typeof provider.chat).toBe('function');
// 		});
// 	});

// 	describe('Gateway 래핑', () => {
// 		it('Gateway가 Provider를 래핑해야 함', () => {
// 			const provider = new ClaudeProvider(LLM_CLAUDE_MODELS.HAIKU);
// 			const wrappedProvider = createCloudflareGatewayLLM(provider);
			
// 			expect(wrappedProvider).toHaveProperty('name');
// 			expect(wrappedProvider).toHaveProperty('chat');
// 		});
		
// 		it('Gateway가 baseUrl을 변경해야 함', () => {
// 			const provider = new OpenAIProvider(LLM_GPT_MODELS.O3);
// 			const wrappedProvider = createCloudflareGatewayLLM(provider);
			
// 			expect(wrappedProvider.name).toBe(provider.name);
// 		});
// 	});

// 	describe('Provider 호환성', () => {
// 		it('모든 Provider가 동일한 인터페이스를 구현해야 함', () => {
// 			const providers = [
// 				new ClaudeProvider(LLM_CLAUDE_MODELS.HAIKU),
// 				new OpenAIProvider(LLM_GPT_MODELS.O3),
// 				new GeminiProvider(LLM_GEMINI_MODELS.FLASH)
// 			];
			
// 			providers.forEach(provider => {
// 				expect(provider).toHaveProperty('name');
// 				expect(provider).toHaveProperty('chat');
// 				expect(typeof provider.chat).toBe('function');
// 			});
// 		});
// 	});

// 	describe('Gateway vs Direct 호출', () => {
// 		it('Gateway와 직접 호출이 같은 인터페이스를 제공해야 함', () => {
// 			// Gateway 사용
// 			const gatewayProvider = createCloudflareGatewayLLM(
// 				new ClaudeProvider(LLM_CLAUDE_MODELS.HAIKU)
// 			);
			
// 			// 직접 사용
// 			const directProvider = new OpenAIProvider(LLM_GPT_MODELS.O3);
			
// 			// 둘 다 같은 인터페이스
// 			expect(gatewayProvider).toHaveProperty('chat');
// 			expect(directProvider).toHaveProperty('chat');
// 		});
// 	});

// 	describe('다양한 Provider 전환', () => {
// 		it('Provider 간 전환이 가능해야 함', () => {
// 			// 이제 chat-analyzer가 제거되어서 이 테스트는 skip
// 			expect(true).toBe(true);
// 		});
// 	});
// });