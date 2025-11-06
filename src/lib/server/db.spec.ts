import { describe, it, expect } from 'vitest';
import { findMansesBySolarDate, loadMansesData } from './db';
import path from 'node:path';
import Database from 'better-sqlite3';

describe('Database Tests', () => {
	describe('Database Connection', () => {
		it('should connect to database and get total record count', () => {
			// Given
			const dbPath = path.join(process.cwd(), 'data/manses.db');
			const db = new Database(dbPath);

			// When
			const stmt = db.prepare('SELECT COUNT(*) as count FROM manses');
			const result = stmt.get() as { count: number };
			
			// Then
			console.log(`\n=== 전체 DB 레코드 수: ${result.count}개 ===`);
			expect(result.count).toBeGreaterThan(0);
			expect(typeof result.count).toBe('number');

			// Cleanup
			db.close();
		});
	});

	describe('findMansesBySolarDate', () => {
		it('should find manse data for existing date', () => {
			// Given
			const solarDate = '1900-05-15';

			// When
			const result = findMansesBySolarDate(solarDate);

			// Then
			expect(result).toBeDefined();
			console.log(`\n=== DB 테스트 결과: ${solarDate} ===`);
			console.log('년간:', result?.yearSky, '년지:', result?.yearGround);
			console.log('월간:', result?.monthSky, '월지:', result?.monthGround);
			console.log('일간:', result?.daySky, '일지:', result?.dayGround);
			console.log('년주:', result?.yearHanja);
			console.log('월주:', result?.monthHanja);
			console.log('일주:', result?.dayHanja);
		});

		it('should test multiple birth dates', () => {
			const testDates = [
				'1985-12-25',
				'1995-07-03', 
				'2000-01-01',
				'1900-03-20',
				'1950-06-15'
			];

			testDates.forEach(date => {
				// When
				const result = findMansesBySolarDate(date);

				// Then
				console.log(`\n=== ${date} ===`);
				if (result) {
					console.log('년주:', result.yearHanja, '월주:', result.monthHanja, '일주:', result.dayHanja);
					expect(result.yearSky).toBeDefined();
					expect(result.monthSky).toBeDefined();
					expect(result.daySky).toBeDefined();
				} else {
					console.log('❌ DB에서 데이터를 찾을 수 없음');
				}
			});
		});

		it('should return undefined for non-existing date', () => {
			// Given
			const nonExistingDate = '1800-01-01';

			// When
			const result = findMansesBySolarDate(nonExistingDate);

			// Then
			expect(result).toBeUndefined();
		});
	});

	describe('loadMansesData', () => {
		it('should load sample data from database', () => {
			// When
			const data = loadMansesData();

			// Then
			expect(data).toBeDefined();
			expect(Array.isArray(data)).toBe(true);
			console.log(`\n=== loadMansesData로 로드된 레코드 수: ${data.length}개 ===`);
			
			if (data.length > 0) {
				const sample = data[0];
				console.log('첫 번째 레코드:', {
					solarDate: sample.solarDate,
					yearSky: sample.yearSky,
					yearGround: sample.yearGround,
					monthSky: sample.monthSky,
					monthGround: sample.monthGround,
					daySky: sample.daySky,
					dayGround: sample.dayGround
				});
			}
		});
	});


});