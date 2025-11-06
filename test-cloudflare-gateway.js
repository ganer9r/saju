/**
 * Cloudflare Gateway 테스트 스크립트
 * 
 * 실행 방법:
 * 1. .env 파일에 환경변수 설정
 * 2. node test-cloudflare-gateway.js
 */

import { createCloudflareGatewayLLM } from './src/lib/llm/factory.js';

async function testCloudflareGateway() {
	console.log('🚀 Cloudflare AI Gateway 테스트 시작...\n');

	try {
		// Gateway LLM 인스턴스 생성
		const gatewayLLM = createCloudflareGatewayLLM({
			defaultModel: 'gpt-4o-mini'  // 비용 효율적인 모델로 테스트
		});

		console.log('✅ Gateway LLM 인스턴스 생성 완료');
		console.log(`📝 사용 모델: gpt-4o-mini`);
		console.log(`🌐 Gateway URL: https://gateway.ai.cloudflare.com/v1/31ba06e5a3caf3c37eb6232d5bb47c24/fortune/openai\n`);

		// 간단한 채팅 테스트
		console.log('💬 채팅 테스트 시작...');
		const response = await gatewayLLM.chat('안녕하세요! 간단히 인사해주세요.', {
			maxTokens: 50
		});

		console.log('✅ 응답 수신 완료!');
		console.log('📄 응답 내용:');
		console.log(response.content);
		console.log('\n📊 토큰 사용량:');
		if (response.usage) {
			console.log(`- 프롬프트: ${response.usage.prompt_tokens} 토큰`);
			console.log(`- 완성: ${response.usage.completion_tokens} 토큰`);
			console.log(`- 총합: ${response.usage.total_tokens} 토큰`);
		}
		console.log(`🔧 사용된 모델: ${response.model}`);

		console.log('\n🎉 테스트 성공! Cloudflare 대시보드에서 요청을 확인해보세요.');
		console.log('🔗 대시보드: https://dash.cloudflare.com/ai-gateway');

	} catch (error) {
		console.error('❌ 테스트 실패:', error.message);
		console.log('\n🔧 문제 해결 방법:');
		console.log('1. .env 파일에 다음 환경변수가 설정되어 있는지 확인:');
		console.log('   - CLOUDFLARE_ACCOUNT_ID');
		console.log('   - CLOUDFLARE_GATEWAY_NAME');
		console.log('   - OPENAI_API_KEY');
		console.log('2. Cloudflare AI Gateway가 활성화되어 있는지 확인');
		console.log('3. 네트워크 연결 상태 확인');
	}
}

// 테스트 실행
testCloudflareGateway();