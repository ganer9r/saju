import type { LLMProvider, ChatOptions, ChatResponse } from '../types';
import { env } from '$env/dynamic/private';

/**
 * Cloudflare AI Gateway 래퍼 클래스
 * 기존 LLM Provider를 래핑하여 Cloudflare Gateway를 통해 요청을 라우팅
 * Provider의 모든 로직은 유지하고 URL만 Gateway로 변경
 */
export class CloudflareAiGateway implements LLMProvider {
	public readonly name: string;
	private provider: LLMProvider;
	private gatewayBase: string;
	
	constructor(provider: LLMProvider) {
		this.provider = provider;
		this.name = `cloudflare-gateway-${provider.name}`;
		
		const accountId = env.CLOUDFLARE_ACCOUNT_ID;
		const gatewayName = env.CLOUDFLARE_GATEWAY_NAME || 'fortune';
		
		if (!accountId) {
			throw new Error('CLOUDFLARE_ACCOUNT_ID 환경변수가 설정되지 않았습니다.');
		}
		
		this.gatewayBase = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayName}`;
		
		// Provider의 baseUrl을 Gateway URL로 교체
		this.updateProviderBaseUrl();
	}
	
	/**
	 * Provider의 baseUrl을 Cloudflare Gateway URL로 업데이트
	 */
	private updateProviderBaseUrl(): void {
		// Provider 인스턴스의 private 필드에 접근
		const providerWithUrl = this.provider as any;
		
		switch (this.provider.name) {
			case 'claude':
				providerWithUrl.baseUrl = `${this.gatewayBase}/anthropic`;
				break;
			case 'openai':
				providerWithUrl.baseUrl = `${this.gatewayBase}/openai`;
				break;
			case 'gemini':
				providerWithUrl.baseUrl = `${this.gatewayBase}/google-ai-studio`;
				break;
			default:
				console.warn(`Unknown provider: ${this.provider.name}, using original baseUrl`);
		}
	}
	
	/**
	 * 채팅 완성 요청 - 내부 provider에 위임
	 */
	async chat(prompt: string, options?: ChatOptions): Promise<ChatResponse> {
		// 모든 로직은 원래 provider가 처리
		// URL만 Gateway를 통해 라우팅됨
		return this.provider.chat(prompt, options);
	}
	
	/**
	 * API 키 유효성 검증 - 내부 provider에 위임
	 */
	async validateAPIKey(): Promise<boolean> {
		return this.provider.validateAPIKey?.() ?? true;
	}
}

/**
 * 헬퍼 함수 - 하위 호환성을 위해 유지
 * @deprecated CloudflareAiGateway 클래스를 직접 사용하세요
 */
export function createCloudflareGatewayLLM(provider: LLMProvider): LLMProvider {
	return new CloudflareAiGateway(provider);
}