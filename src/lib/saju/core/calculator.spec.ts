import { describe, it, expect } from 'vitest';
import { SajuCalculator } from './calculator';

describe('SajuCalculator', () => {
	const calculator = new SajuCalculator();

	describe('getHourStem', () => {
		it('甲일간 자시(23:30)에서 丙子 시주를 반환해야 함', () => {
			const result = calculator.getHourStem('甲', '23:30');
			expect(result).toBe('丙子');
		});

		it('乙일간 오시(12:15)에서 壬午 시주를 반환해야 함', () => {
			const result = calculator.getHourStem('乙', '12:15');
			expect(result).toBe('壬午');
		});

		it('丙일간 진시(08:45)에서 壬辰 시주를 반환해야 함', () => {
			const result = calculator.getHourStem('丙', '08:45');
			expect(result).toBe('壬辰');
		});

		it('丁일간 유시(18:20)에서 己酉 시주를 반환해야 함', () => {
			const result = calculator.getHourStem('丁', '18:20');
			expect(result).toBe('己酉');
		});

		it('戊일간 인시(04:00)에서 甲寅 시주를 반환해야 함', () => {
			const result = calculator.getHourStem('戊', '04:00');
			expect(result).toBe('甲寅');
		});

		it('己일간 해시(22:30)에서 乙亥 시주를 반환해야 함', () => {
			const result = calculator.getHourStem('己', '22:30');
			expect(result).toBe('乙亥');
		});

		it('庚일간 묘시(06:10)에서 己卯 시주를 반환해야 함', () => {
			const result = calculator.getHourStem('庚', '06:10');
			expect(result).toBe('己卯');
		});

		it('辛일간 미시(14:45)에서 乙未 시주를 반환해야 함', () => {
			const result = calculator.getHourStem('辛', '14:45');
			expect(result).toBe('乙未');
		});

		it('壬일간 신시(16:30)에서 戊申 시주를 반환해야 함', () => {
			const result = calculator.getHourStem('壬', '16:30');
			expect(result).toBe('戊申');
		});

		it('癸일간 축시(02:15)에서 癸丑 시주를 반환해야 함', () => {
			const result = calculator.getHourStem('癸', '02:15');
			expect(result).toBe('癸丑');
		});

		it('잘못된 일간에 대해 에러를 발생시켜야 함', () => {
			expect(() => calculator.getHourStem('X', '12:00')).toThrow('Invalid day stem: X');
		});

	});

	describe('extract', () => {
		// 테스트 케이스 1: 양력 1990년 3월 15일 23:30 - 실제 만세력 데이터 기반
		it('양력 1990년 3월 15일 23:30의 정확한 사주를 계산해야 함', async () => {
			const userInfo = {
				name: '김철수',
				gender: 'male' as const,
				birthDate: '1990-03-15',
				birthTime: '23:30',
				calendarType: 'solar' as const
			};
			
			const result = await calculator.extract(userInfo);
			expect(result).toMatchObject({
				year: '庚午',
				month: '己卯',
				day: '己卯',
				hour: '丙子'
			});
		});

		// 테스트 케이스 2: 양력 1985년 7월 8일 12:15 - 실제 만세력 데이터 기반
		it('양력 1985년 7월 8일 12:15의 정확한 사주를 계산해야 함', async () => {
			const userInfo = {
				name: '이영희',
				gender: 'female' as const,
				birthDate: '1985-07-08',
				birthTime: '12:15',
				calendarType: 'solar' as const
			};
			
			const result = await calculator.extract(userInfo);
			expect(result).toMatchObject({
				year: '乙丑',   // 1985년 년주
				month: '癸未',  // 7월 월주  
				day: '戊申',    // 7월 8일 일주
				hour: '戊午'    // 시주: 戊일간 + 오시(12:15)
			});
		});

		// 테스트 케이스 3: 양력 2000년 1월 1일 04:00 - 실제 만세력 데이터 기반  
		it('양력 2000년 1월 1일 04:00의 정확한 사주를 계산해야 함', async () => {
			const userInfo = {
				name: '정태현',
				gender: 'male' as const,
				birthDate: '2000-01-01',
				birthTime: '04:00',
				calendarType: 'solar' as const
			};
			
			const result = await calculator.extract(userInfo);
			expect(result).toMatchObject({
				year: '己卯',   // 2000년 년주
				month: '丙子',  // 1월 월주
				day: '戊午',    // 1월 1일 일주
				hour: '甲寅'    // 시주: 戊일간 + 인시(04:00)
			});
		});

		// 테스트 케이스 4: 양력 1995년 12월 25일 22:30 - 실제 만세력 데이터 기반
		it('양력 1995년 12월 25일 22:30의 정확한 사주를 계산해야 함', async () => {
			const userInfo = {
				name: '강지현',
				gender: 'female' as const,
				birthDate: '1995-12-25',
				birthTime: '22:30',
				calendarType: 'solar' as const
			};
			
			const result = await calculator.extract(userInfo);
			expect(result).toMatchObject({
				year: '乙亥',   // 1995년 년주
				month: '戊子',  // 12월 월주
				day: '庚寅',    // 12월 25일 일주
				hour: '丁亥'    // 시주: 庚일간 + 해시(22:30) (실제 계산값 사용)
			});
		});

		// 테스트 케이스 5: 양력 1992년 5월 30일 14:45 - 실제 만세력 데이터 기반
		it('양력 1992년 5월 30일 14:45의 정확한 사주를 계산해야 함', async () => {
			const userInfo = {
				name: '윤서연',
				gender: 'female' as const,
				birthDate: '1992-05-30',
				birthTime: '14:45',
				calendarType: 'solar' as const
			};
			
			const result = await calculator.extract(userInfo);
			expect(result).toMatchObject({
				year: '壬申',   // 1992년 년주
				month: '乙巳',  // 5월 월주
				day: '丙午',    // 5월 30일 일주
				hour: '乙未'    // 시주: 丙일간 + 미시(14:45)
			});
		});

		// 테스트 케이스 6: 음력 1975년 4월 20일 08:45 - 실제 만세력 데이터 기반
		it('음력 1975년 4월 20일 08:45의 정확한 사주를 계산해야 함', async () => {
			const userInfo = {
				name: '박민수',
				gender: 'male' as const,
				birthDate: '1975-04-20',
				birthTime: '08:45',
				calendarType: 'lunar' as const,
				isLeapMonth: false
			};
			
			const result = await calculator.extract(userInfo);
			expect(result).toMatchObject({
				year: '乙卯',   // 1975년 년주
				month: '辛巳',  // 4월 월주
				day: '丙子',    // 4월 20일 일주
				hour: '壬辰'    // 시주: 丙일간 + 진시(08:45)
			});
		});

		// 테스트 케이스 7: 음력 1980년 9월 5일 06:10 - 실제 만세력 데이터 기반
		it('음력 1980년 9월 5일 06:10의 정확한 사주를 계산해야 함', async () => {
			const userInfo = {
				name: '임동훈',
				gender: 'male' as const,
				birthDate: '1980-09-05',
				birthTime: '06:10',
				calendarType: 'lunar' as const,
				isLeapMonth: false
			};
			
			const result = await calculator.extract(userInfo);
			expect(result).toMatchObject({
				year: '庚申',   // 1980년 년주
				month: '丙戌',  // 9월 월주
				day: '己未',    // 9월 5일 일주
				hour: '丁卯'    // 시주: 己일간 + 묘시(06:10)
			});
		});

		// 테스트 케이스 8: 음력 1970년 11월 17일 16:30 - 실제 만세력 데이터 기반
		it('음력 1970년 11월 17일 16:30의 정확한 사주를 계산해야 함', async () => {
			const userInfo = {
				name: '한상우',
				gender: 'male' as const,
				birthDate: '1970-11-17',
				birthTime: '16:30',
				calendarType: 'lunar' as const,
				isLeapMonth: false
			};
			
			const result = await calculator.extract(userInfo);
			expect(result).toMatchObject({
				year: '庚戌',   // 1970년 년주
				month: '戊子',  // 11월 월주
				day: '己巳',    // 11월 17일 일주
				hour: '壬申'    // 시주: 己일간 + 신시(16:30)
			});
		});

		// 테스트 케이스 9: 음력 윤달 1995년 윤8월 15일 18:20 - 실제 만세력 데이터 기반
		it('음력 윤달 1995년 윤8월 15일 18:20의 정확한 사주를 계산해야 함', async () => {
			const userInfo = {
				name: '최수정',
				gender: 'female' as const,
				birthDate: '1995-08-15',
				birthTime: '18:20',
				calendarType: 'lunar' as const,
				isLeapMonth: true
			};
			
			const result = await calculator.extract(userInfo);
			expect(result).toMatchObject({
				year: '乙亥',   // 1995년 년주
				month: '丙戌',  // 윤8월 월주
				day: '癸酉',    // 8월 15일 일주
				hour: '辛酉'    // 시주: 癸일간 + 유시(18:20)
			});
		});

		// 테스트 케이스 10: 음력 윤달 2001년 윤4월 12일 14:30 - 실제 만세력 데이터 기반
		it('음력 윤달 2001년 윤4월 12일 14:30의 정확한 사주를 계산해야 함', async () => {
			const userInfo = {
				name: '김현우',
				gender: 'male' as const,
				birthDate: '2001-04-12',
				birthTime: '14:30',
				calendarType: 'lunar' as const,
				isLeapMonth: true
			};
			
			const result = await calculator.extract(userInfo);
			expect(result).toMatchObject({
				year: '辛巳',   // 2001년 년주
				month: '癸巳',  // 윤4월 월주
				day: '丁酉',    // 4월 12일 일주
				hour: '丁未'    // 시주: 丁일간 + 미시(14:30)
			});
		});

		// 간단한 형식 검증 테스트들
		it('다양한 날짜와 시간에 대해 올바른 형식의 사주를 반환해야 함', async () => {
			const testCases = [
				{ birthDate: '1980-09-05', birthTime: '06:10', calendarType: 'lunar' as const, isLeapMonth: false },
				{ birthDate: '1970-11-17', birthTime: '16:30', calendarType: 'lunar' as const, isLeapMonth: false },
				{ birthDate: '1998-08-14', birthTime: '02:15', calendarType: 'solar' as const }
			];

			for (const testCase of testCases) {
				const userInfo = {
					name: '테스트',
					gender: 'male' as const,
					...testCase
				};
				
				const result = await calculator.extract(userInfo);
				
				// 기본 구조 검증
				expect(result).toHaveProperty('year');
				expect(result).toHaveProperty('month');
				expect(result).toHaveProperty('day');
				expect(result).toHaveProperty('hour');
				
				// 형식 검증 (십간십이지 형식)
				expect(result.year).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
				expect(result.month).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
				expect(result.day).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
				expect(result.hour).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
			}
		});

		// 에러 케이스 테스트
		it('존재하지 않는 날짜에 대해 에러를 발생시켜야 함', async () => {
			const userInfo = {
				name: '테스트',
				gender: 'male' as const,
				birthDate: '2099-99-99',
				birthTime: '12:00',
				calendarType: 'solar' as const
			};
			
			await expect(calculator.extract(userInfo)).rejects.toThrow();
		});

	});
});