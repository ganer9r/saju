import { describe, it, expect, beforeEach } from 'vitest';
import { SajuAnalyzer, AnalysisError } from './analyzer';
import { MockLLMProvider } from '../../llm/providers/mock';
import type { UserInfo } from '../types';
import type { SajuData } from '../types';
import type { AnalysisRequest } from '../types/report';
import { ERROR_CODES } from '../types/report';

describe('SajuAnalyzer', () => {
	let analyzer: SajuAnalyzer;
	let mockProvider: MockLLMProvider;

	beforeEach(() => {
		mockProvider = new MockLLMProvider();
		analyzer = new SajuAnalyzer(mockProvider);
	});

	const createTestUserInfo = (): UserInfo => ({
		gender: 'male',
		birthDate: '1990-01-15',
		birthTime: '14:30',
		calendarType: 'solar',
		isLeapMonth: false,
		name: '홍길동'
	});

	const createTestSajuResult = (): SajuData => ({
		year: '庚午',
		month: '丁丑',
		day: '甲寅',
		hour: '辛未'
	});

	describe('analyze', () => {
		it('should successfully analyze saju', async () => {
			const request: AnalysisRequest = {
				userInfo: createTestUserInfo(),
				sajuResult: createTestSajuResult()
			};

			const result = await analyzer.analyze(request);

			expect(result).toBeDefined();
			expect(result.metadata).toBeDefined();
			expect(result.content).toBeDefined();
			expect(result.rawLLMResponse).toBeDefined();
			expect(result.metadata.id).toMatch(/\d{4}-\d{2}-\d{2}-\d{4}/);
		});

		it('should include all required content sections', async () => {
			const request: AnalysisRequest = {
				userInfo: createTestUserInfo(),
				sajuResult: createTestSajuResult()
			};

			const result = await analyzer.analyze(request);

			expect(result.content.summary).toBeDefined();
			expect(result.content.strongestElement).toBeDefined();
			expect(result.content.personalityImpact).toBeDefined();
			expect(result.content.relationships).toBeDefined();
			expect(result.content.problems).toBeDefined();
			expect(result.content.harmony).toBeDefined();
			expect(result.content.fiveYearOutlook).toBeDefined();
			expect(result.content.conclusion).toBeDefined();
		});

		it('should handle custom LLM options', async () => {
			const request: AnalysisRequest = {
				userInfo: createTestUserInfo(),
				sajuResult: createTestSajuResult(),
				options: {
					temperature: 0.5,
					maxTokens: 4000,
					timeout: 120000
				}
			};

			const result = await analyzer.analyze(request);
			expect(result).toBeDefined();
		});
	});

	describe('input validation', () => {
		it('should throw error for missing birth date', async () => {
			const userInfo = createTestUserInfo();
			userInfo.birthDate = '';

			const request: AnalysisRequest = {
				userInfo,
				sajuResult: createTestSajuResult()
			};

			await expect(analyzer.analyze(request)).rejects.toThrow(AnalysisError);
			await expect(analyzer.analyze(request)).rejects.toHaveProperty('code', ERROR_CODES.INVALID_INPUT);
		});

		it('should throw error for missing gender', async () => {
			const userInfo = createTestUserInfo();
			userInfo.gender = '' as any;

			const request: AnalysisRequest = {
				userInfo,
				sajuResult: createTestSajuResult()
			};

			await expect(analyzer.analyze(request)).rejects.toThrow(AnalysisError);
		});

		it('should throw error for invalid saju result', async () => {
			const sajuResult = createTestSajuResult();
			sajuResult.year = null as any;

			const request: AnalysisRequest = {
				userInfo: createTestUserInfo(),
				sajuResult
			};

			await expect(analyzer.analyze(request)).rejects.toThrow(AnalysisError);
			await expect(analyzer.analyze(request)).rejects.toHaveProperty('code', ERROR_CODES.SAJU_CALCULATION_FAILED);
		});
	});

	describe('LLM error handling', () => {
		it('should handle LLM timeout', async () => {
			mockProvider.setShouldFail(true);

			const request: AnalysisRequest = {
				userInfo: createTestUserInfo(),
				sajuResult: createTestSajuResult()
			};

			await expect(analyzer.analyze(request)).rejects.toThrow(AnalysisError);
		});

		it('should handle LLM response parsing error', async () => {
			// 파싱 실패를 테스트하기 위해 형식이 잘못된 응답 설정
			mockProvider.setMockResponse('default', 'Invalid response format without sections');
			mockProvider.setMockResponse('male', 'Invalid response format without sections');
			mockProvider.setMockResponse('female', 'Invalid response format without sections');

			const request: AnalysisRequest = {
				userInfo: createTestUserInfo(),
				sajuResult: createTestSajuResult()
			};

			const result = await analyzer.analyze(request);
			// 파싱에 실패해도 빈 문자열로 처리
			expect(result.content.summary).toBe('');
		});
	});

	describe('metadata generation', () => {
		it('should generate valid report ID', async () => {
			const request: AnalysisRequest = {
				userInfo: createTestUserInfo(),
				sajuResult: createTestSajuResult()
			};

			const result = await analyzer.analyze(request);
			
			expect(result.metadata.id).toMatch(/^\d{4}-\d{2}-\d{2}-\d{4}$/);
		});

		it('should include correct metadata', async () => {
			const request: AnalysisRequest = {
				userInfo: createTestUserInfo(),
				sajuResult: createTestSajuResult()
			};

			const result = await analyzer.analyze(request);

			expect(result.metadata.createdAt).toBeInstanceOf(Date);
			expect(result.metadata.llmProvider).toBe('mock');
			expect(result.metadata.analysisVersion).toBeDefined();
			expect(result.metadata.userInfo).toEqual(request.userInfo);
			expect(result.metadata.sajuResult).toEqual(request.sajuResult);
		});
	});

	describe('response parsing', () => {
		it('should parse sections correctly', async () => {
			// MockProvider가 이미 'male' 키에 대해 적절한 테스트 응답을 가지고 있음
			// userInfo.gender='male' -> 프롬프트에 '남성' 포함 -> 'male' 응답 사용
			const request: AnalysisRequest = {
				userInfo: createTestUserInfo(),
				sajuResult: createTestSajuResult()
			};

			const result = await analyzer.analyze(request);
			console.log('result', result);

			// MockProvider의 'male' 응답 확인
			expect(result.content.summary).toBe('테스트 남성 응답');
			expect(result.content.strongestElement).toBe('테스트 남성 오행');
			expect(result.content.personalityImpact).toBe('테스트 남성 성격');
			expect(result.content.relationships).toBe('테스트 남성 관계');
			expect(result.content.problems).toBe('테스트 남성 문제');
			expect(result.content.harmony).toBe('테스트 남성 조화');
			expect(result.content.fiveYearOutlook).toBe('테스트 남성 전망');
			expect(result.content.conclusion).toBe('테스트 남성 마무리');
		});

		it('should handle missing sections gracefully', async () => {
			// 일부 섹션만 있는 응답 설정
			mockProvider.setMockResponse('male', '### 사주 한마디\n부분 테스트');

			const request: AnalysisRequest = {
				userInfo: createTestUserInfo(),
				sajuResult: createTestSajuResult()
			};

			const result = await analyzer.analyze(request);

			expect(result.content.summary).toBe('부분 테스트');
			// 나머지 섹션들은 빈 문자열이어야 함
			expect(result.content.strongestElement).toBe('');
			expect(result.content.personalityImpact).toBe('');
			expect(result.content.relationships).toBe('');
			expect(result.content.problems).toBe('');
		});
	});
});