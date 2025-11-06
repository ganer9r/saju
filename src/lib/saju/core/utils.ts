import type { UserInfo } from '../types';

/**
 * 사주 관련 공통 유틸리티 함수들
 */

/**
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getCurrentDate(): string {
	return new Date().toLocaleDateString('ko-KR', {
		timeZone: 'Asia/Seoul',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).replace(/\./g, '-').replace(/-$/, '');
}

/**
 * 생년월일로부터 만 나이를 계산합니다.
 * 사주팔자에서는 음력/양력 구분이 있지만, 나이 계산은 입력된 날짜 기준으로 합니다.
 * 
 * @param userInfo 사용자 정보 (birthDate 포함)
 * @param referenceDate 기준 날짜 (기본값: 오늘) YYYY-MM-DD 형식
 * @returns 만 나이
 */
export function calculateAge(userInfo: UserInfo, referenceDate?: string): number {
	const reference = referenceDate ? new Date(referenceDate) : new Date();
	
	// birthDate는 입력된 형태 그대로 사용
	// 음력인 경우에도 사용자가 입력한 날짜를 기준으로 계산
	// (실제로는 음력->양력 변환이 복잡하므로, 입력된 날짜 기준으로 계산)
	const birth = new Date(userInfo.birthDate);
	
	let age = reference.getFullYear() - birth.getFullYear();
	const monthDiff = reference.getMonth() - birth.getMonth();
	
	// 생일이 아직 지나지 않았으면 1세 차감
	if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birth.getDate())) {
		age--;
	}
	
	return age;
}
