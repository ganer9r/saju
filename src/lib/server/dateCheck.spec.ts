import { describe, it, expect } from 'vitest';
import { findMansesBySolarDate, findMansesByLunarDate, findMansesByLunarDateAndLeap } from './db';

describe('Date Ganji Check', () => {
	describe('양력 계산', () => {
		it('양력 간지 확인', () => {
			const solarTestCases = [
				{
					date: '1994-12-22',
					expected: {
						year: '甲戌',
						month: '丙子', 
						day: '壬午',
						description: '1985년 크리스마스'
					}
				},
				{
					date: '1990-02-22',
					expected: {
						year: '庚午',
						month: '戊寅',
						day: '戊午'
					}
				},
				{
					date: '2011-04-21',
					expected: {
						year: '辛卯',
						month: '壬辰',
						day: '丙午',
					}
				},
				{
					date: '1954-02-02',
					expected: {
						year: '癸巳',
						month: '乙丑',
						day: '己丑',
					}
				},
				{
					date: '2045-11-22',
					expected: {
						year: '乙丑',
						month: '丁亥',
						day: '庚辰',
						description: '1900년대 초기'
					}
				}
			];

			solarTestCases.forEach(({ date, expected }, index) => {
				const result = findMansesBySolarDate(date);
				
				if (!result) {
					throw new Error(`No data found for ${date}`);
				}

				const actual = {
					date, // 출력용으로 포함
					year: result.yearHanja,
					month: result.monthHanja,
					day: result.dayHanja
				};
				
				// date는 제외하고 특정 속성들만 비교
				expect(actual).toMatchObject({
					year: expected.year,
					month: expected.month,
					day: expected.day
				});
			});
		});
	});

	describe('음력 계산', () => {
		it('음력 간지 확인', () => {
			// 음력 날짜들 (음력 날짜로 직접 DB 조회)
			const lunarTestCases = [
				{
					lunarDate: '1984-10-15',
					lunarDescription: '음력 1984년 10월 15일 (평달)',
					expected: {
						year: '甲子',
						month: '乙亥',
						day: '乙巳'
					},
					isLeapMonth: false
				},
				{
					lunarDate: '1984-10-15',
					lunarDescription: '음력 1984년 10월 15일 (윤달)',
					expected: {
						year: '甲子',
						month: '丙子',
						day: '乙亥'
					},
					isLeapMonth: true
				},
				{
					lunarDate: '1995-06-25',
					expected: {
						year: '乙亥',
						month: '癸未',
						day: '甲寅'
					},
					isLeapMonth: false
				},
				{
					lunarDate: '1999-11-28',
					expected: {
						year: '己卯',
						month: '丙子',
						day: '辛酉'
					},
					isLeapMonth: false
				},
				{
					lunarDate: '1950-05-19',
					expected: {
						year: '庚寅',
						month: '壬午',
						day: '庚子'
					},
					isLeapMonth: false
				},
				{
					lunarDate: '2025-06-25',
					expected: {
						year: '乙巳',
						month: '甲申',
						day: '己未'
					},
					isLeapMonth: true
				}
			];

			lunarTestCases.forEach(({ lunarDate, lunarDescription, expected, isLeapMonth }, index) => {
				const result = findMansesByLunarDateAndLeap(lunarDate, isLeapMonth);
				
				if (!result) {
					console.log('❌ FAIL: DB에서 데이터를 찾을 수 없음');
					throw new Error(`No data found for lunar date ${lunarDate} (leap: ${isLeapMonth})`);
				}

				const actual = {
					lunarDate, // 출력용으로 포함
					year: result.yearHanja,
					month: result.monthHanja,
					day: result.dayHanja,
					leapMonth: result.leapMonth
				};
				
				// lunarDate는 제외하고 특정 속성들만 비교
				expect(actual).toMatchObject({
					year: expected.year,
					month: expected.month,
					day: expected.day,
					leapMonth: isLeapMonth ? 1 : 0
				});

			});
		});
	});
});