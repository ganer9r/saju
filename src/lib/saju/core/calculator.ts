import { findMansesBySolarDate, findMansesByLunarDateAndLeap, type MansesRecord } from '$lib/server/db';
import type { UserInfo, SajuData } from '../types';
import { CALENDAR_TYPE } from '../types';

/**
 * 사주명리학의 사주 계산을 담당하는 클래스입니다.
 * 사용자의 출생 정보를 바탕으로 년월일시의 사주 데이터를 추출합니다.
 */
export class SajuCalculator {
	/** 십간 배열 (甲부터 癸까지) */
	private readonly STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

	/**
	 * 일간의 다음날 일간을 계산합니다.
	 * 60갑자 순환에서 다음날은 천간이 하나씩 증가합니다.
	 * @param currentDayStem 현재 일간
	 * @returns 다음날 일간
	 */
	private getNextDayStem(currentDayStem: string): string {
		const currentIndex = this.STEMS.indexOf(currentDayStem as any);
		if (currentIndex === -1) {
			throw new Error(`Invalid stem: ${currentDayStem}`);
		}
		return this.STEMS[(currentIndex + 1) % 10];
	}
	private readonly BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
	
	/** 일간 그룹별 시간 천간 매핑 테이블 */
	private readonly HOUR_STEM_MAP: Record<string, readonly string[]> = {
		'甲己': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
		'乙庚': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
		'丙辛': ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
		'丁壬': ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
		'戊癸': ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
	};

	/** 일간을 그룹으로 분류하는 매핑 테이블 */
	private readonly DAY_GROUP_MAP: Record<string, string> = {
		'甲': '甲己', '己': '甲己',
		'乙': '乙庚', '庚': '乙庚', 
		'丙': '丙辛', '辛': '丙辛',
		'丁': '丁壬', '壬': '丁壬',
		'戊': '戊癸', '癸': '戊癸'
	};

	/** 시간대별 지지 매핑 (23:30-01:30: 子, 01:30-03:30: 丑, ...) */
	private readonly TIME_TO_BRANCH_MAP = [
		{ startHour: 23, startMin: 30, endHour: 1, endMin: 30, branch: '子' },  // 23:30-01:29
		{ startHour: 1, startMin: 30, endHour: 3, endMin: 30, branch: '丑' },   // 01:30-03:29
		{ startHour: 3, startMin: 30, endHour: 5, endMin: 30, branch: '寅' },   // 03:30-05:29
		{ startHour: 5, startMin: 30, endHour: 7, endMin: 30, branch: '卯' },   // 05:30-07:29
		{ startHour: 7, startMin: 30, endHour: 9, endMin: 30, branch: '辰' },   // 07:30-09:29
		{ startHour: 9, startMin: 30, endHour: 11, endMin: 30, branch: '巳' },  // 09:30-11:29
		{ startHour: 11, startMin: 30, endHour: 13, endMin: 30, branch: '午' }, // 11:30-13:29
		{ startHour: 13, startMin: 30, endHour: 15, endMin: 30, branch: '未' }, // 13:30-15:29
		{ startHour: 15, startMin: 30, endHour: 17, endMin: 30, branch: '申' }, // 15:30-17:29
		{ startHour: 17, startMin: 30, endHour: 19, endMin: 30, branch: '酉' }, // 17:30-19:29
		{ startHour: 19, startMin: 30, endHour: 21, endMin: 30, branch: '戌' }, // 19:30-21:29
		{ startHour: 21, startMin: 30, endHour: 23, endMin: 30, branch: '亥' }  // 21:30-23:29
	] as const;

	/**
	 * 시간을 파싱하여 숫자로 변환합니다.
	 * @param birthTime 출생시간 문자열 (HH:mm 형식)
	 * @returns 시간(hour)과 분(minute) 객체
	 */
	private parseTime(birthTime: string): { hour: number; minute: number } {
		const [hourStr, minuteStr] = birthTime.split(':');
		return {
			hour: parseInt(hourStr, 10),
			minute: parseInt(minuteStr, 10)
		};
	}

	/**
	 * TIME_TO_BRANCH_MAP을 이용하여 시간으로부터 해당하는 지지를 계산합니다.
	 * @param birthTime 출생시간 문자열 (HH:mm 형식)
	 * @returns 시지 한자
	 */
	private getHourBranch(birthTime: string): string {
		const { hour, minute } = this.parseTime(birthTime);
		const totalMinutes = hour * 60 + minute;
		
		// TIME_TO_BRANCH_MAP을 이용하여 해당하는 지지 찾기
		for (const timeRange of this.TIME_TO_BRANCH_MAP) {
			let startMinutes, endMinutes;
			
			if (timeRange.startHour === 23) {
				// 자시는 특별 케이스: 23:30 ~ 01:29 (다음날로 넘어감)
				startMinutes = timeRange.startHour * 60 + timeRange.startMin;
				endMinutes = (timeRange.endHour + 24) * 60 + timeRange.endMin;
				
				if (totalMinutes >= startMinutes || totalMinutes < timeRange.endHour * 60 + timeRange.endMin) {
					return timeRange.branch;
				}
			} else {
				// 일반적인 케이스
				startMinutes = timeRange.startHour * 60 + timeRange.startMin;
				endMinutes = timeRange.endHour * 60 + timeRange.endMin;
				
				if (totalMinutes >= startMinutes && totalMinutes < endMinutes) {
					return timeRange.branch;
				}
			}
		}
		
		throw new Error(`Invalid time: ${hour}:${minute}`);
	}

	/**
	 * 일간과 시간을 이용하여 시주(천간+지지)를 계산합니다.
	 * @param dayStemHanja 일주의 천간 한자 (예: '甲', '乙', '丙' 등)
	 * @param birthTime 출생시간 문자열 (HH:mm 형식)
	 * @returns 시주 한자 2글자 (천간+지지)
	 * @throws {Error} 유효하지 않은 일간 또는 시간 형식인 경우
	 */
	getHourStem(dayStemHanja: string, birthTime: string): string {
		const { hour, minute } = this.parseTime(birthTime);
		
		// 23:30 이후는 다음날로 간주하여 다음날 일간을 사용
		let effectiveDayStem = dayStemHanja;
		if (hour === 23 && minute >= 30) {
			effectiveDayStem = this.getNextDayStem(dayStemHanja);
		}
		
		// 시간으로부터 시지 계산 (TIME_TO_BRANCH_MAP 사용)
		const hourBranch = this.getHourBranch(birthTime);
		
		// 유효한 일간으로부터 그룹 찾기
		const dayGroup = this.DAY_GROUP_MAP[effectiveDayStem];
		if (!dayGroup) {
			throw new Error(`Invalid day stem: ${effectiveDayStem}`);
		}
		
		// 시지 인덱스 찾기
		const hourIndex = this.BRANCHES.indexOf(hourBranch as any);
		if (hourIndex === -1) {
			throw new Error(`Invalid hour branch: ${hourBranch}`);
		}
		
		// 시간 천간 계산
		const hourStem = this.HOUR_STEM_MAP[dayGroup][hourIndex];
		return hourStem + hourBranch;
	}

	async extract(userInfo: UserInfo): Promise<SajuData> {
		// 1. DB에서 만세력 데이터 조회 (음력/양력 구분)
		let mansesData: MansesRecord | undefined;
		
		if (userInfo.calendarType === CALENDAR_TYPE.Lunar) {
			// 음력인 경우 윤달 정보와 함께 조회
			const isLeap = userInfo.isLeapMonth || false;
			mansesData = findMansesByLunarDateAndLeap(userInfo.birthDate, isLeap);
		} else {
			// 양력인 경우 (기본값)
			mansesData = findMansesBySolarDate(userInfo.birthDate);
		}

		if (!mansesData) {
			throw new Error(`No manse data found for date: ${userInfo.birthDate} (calendar: ${userInfo.calendarType || CALENDAR_TYPE.Solar})`);
		}

		// 2. 시주 계산 (일간과 시간으로부터)
		const hourPillar = this.getHourStem(mansesData.dayHanja!.charAt(0), userInfo.birthTime);

		// 3. 사주 네 기둥 반환 (년월일시 각각 한자 2글자)
		return {
			year: mansesData.yearHanja!, // 년주 (천간+지지)
			month: mansesData.monthHanja!, // 월주 (천간+지지)
			day: mansesData.dayHanja!, // 일주 (천간+지지)
			hour: hourPillar // 시주 (천간+지지)
		};
	}
}