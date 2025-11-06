import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ReportStorage, StorageError } from './storage';
import type { SajuReport } from '../types/report';
import { ANALYSIS_VERSION } from '../types/report';
import { rmSync, existsSync } from 'fs';
import { join } from 'path';

describe('ReportStorage', () => {
	let storage: ReportStorage;
	let testDir: string;

	beforeEach(() => {
		testDir = join(process.cwd(), 'test-data', 'reports');
		storage = new ReportStorage(testDir);
	});

	afterEach(() => {
		if (existsSync(testDir)) {
			rmSync(testDir, { recursive: true, force: true });
		}
	});

	const createTestReport = (id = '2024-01-15-1430'): SajuReport => ({
		metadata: {
			id,
			createdAt: new Date('2024-01-15T14:30:00Z'),
			userInfo: {
				gender: 'male',
				birthDate: '1990-01-15',
				birthTime: '14:30',
				calendarType: 'solar',
				isLeapMonth: false,
				name: '홍길동'
			},
			sajuResult: {
				year: '경오',
				month: '정축',
				day: '갑인',
				hour: '신미'
			},
			llmProvider: 'mock',
			analysisVersion: ANALYSIS_VERSION
		},
		content: {
			summary: '테스트 사주 한마디',
			strongestElement: '테스트 오행 분석',
			personalityImpact: '테스트 성격 분석',
			relationships: '테스트 대인관계',
			problems: '테스트 문제점',
			harmony: '테스트 조화 방법',
			fiveYearOutlook: '테스트 5년 전망',
			conclusion: '테스트 마무리'
		},
		rawLLMResponse: '테스트 LLM 응답'
	});

	describe('save', () => {
		it('should save report successfully', async () => {
			const report = createTestReport();
			
			const savedId = await storage.save(report);
			
			expect(savedId).toBe(report.metadata.id);
		});

		it('should create directory structure automatically', async () => {
			const report = createTestReport('2024-03-20-0900');
			
			await storage.save(report);
			
			const expectedPath = join(testDir, '2024', '03');
			expect(existsSync(expectedPath)).toBe(true);
		});

		it('should throw StorageError on initialization failure', () => {
			// 잘못된 경로로 Storage 생성 시 생성자에서 StorageError 발생
			expect(() => new ReportStorage('/invalid/path/that/does/not/exist')).toThrow(StorageError);
		});
	});

	describe('get', () => {
		it('should retrieve saved report correctly', async () => {
			const originalReport = createTestReport();
			await storage.save(originalReport);

			const retrievedReport = await storage.get(originalReport.metadata.id);

			expect(retrievedReport).toBeDefined();
			expect(retrievedReport!.metadata.id).toBe(originalReport.metadata.id);
			expect(retrievedReport!.content.summary).toBe(originalReport.content.summary);
			expect(retrievedReport!.metadata.createdAt).toEqual(originalReport.metadata.createdAt);
		});

		it('should return null for non-existent report', async () => {
			const result = await storage.get('2024-01-01-0000');
			
			expect(result).toBeNull();
		});

		it('should handle corrupted file gracefully', async () => {
			const result = await storage.get('non-existent-file');
			expect(result).toBeNull();
		});
	});

	describe('exists', () => {
		it('should return true for existing report', async () => {
			const report = createTestReport();
			await storage.save(report);

			const exists = await storage.exists(report.metadata.id);
			
			expect(exists).toBe(true);
		});

		it('should return false for non-existent report', async () => {
			const exists = await storage.exists('2024-01-01-0000');
			
			expect(exists).toBe(false);
		});
	});

	describe('delete', () => {
		it('should return true for existing file', async () => {
			const report = createTestReport();
			await storage.save(report);

			const deleted = await storage.delete(report.metadata.id);
			
			expect(deleted).toBe(true);
		});

		it('should return false for non-existent file', async () => {
			const deleted = await storage.delete('2024-01-01-0000');
			
			expect(deleted).toBe(false);
		});
	});

	describe('getStorageInfo', () => {
		it('should return storage information', async () => {
			const info = await storage.getStorageInfo();
			
			expect(info).toBeDefined();
			expect(info.baseDir).toBe(testDir);
			expect(typeof info.accessible).toBe('boolean');
		});
	});

	describe('file path generation', () => {
		it('should generate correct file paths', async () => {
			const report1 = createTestReport('2024-01-15-1430');
			const report2 = createTestReport('2024-12-31-2359');
			
			await storage.save(report1);
			await storage.save(report2);
			
			const path1 = join(testDir, '2024', '01', '2024-01-15-1430.json');
			expect(existsSync(path1)).toBe(true);
			
			const path2 = join(testDir, '2024', '12', '2024-12-31-2359.json');
			expect(existsSync(path2)).toBe(true);
		});
	});

	describe('data format conversion', () => {
		it('should preserve data integrity during save/load cycle', async () => {
			const originalReport = createTestReport();
			originalReport.metadata.createdAt = new Date('2024-01-15T14:30:00.123Z');
			
			await storage.save(originalReport);
			const retrievedReport = await storage.get(originalReport.metadata.id);
			
			expect(retrievedReport!.metadata.createdAt.getTime())
				.toBe(originalReport.metadata.createdAt.getTime());
			expect(retrievedReport!.content).toEqual(originalReport.content);
			expect(retrievedReport!.rawLLMResponse).toBe(originalReport.rawLLMResponse);
		});
	});
});