export type Gender = 'male' | 'female';

export const CALENDAR_TYPE = {
	Solar: 'solar',
	Lunar: 'lunar'
} as const;

export type CalendarType = typeof CALENDAR_TYPE[keyof typeof CALENDAR_TYPE];

export type UserInfo = {
	gender: Gender;
	birthDate: string; // "YYYY-MM-DD"
	birthTime: string; // "HH:mm"
	calendarType?: CalendarType;
	isLeapMonth?: boolean; // 음력인 경우 윤달 여부, 양력인 경우 무시됨
	name?: string;
};

export type SajuData = {
	year: string;   // 년주 한자 2글자 (천간+지지)
	month: string;  // 월주 한자 2글자 (천간+지지)
	day: string;    // 일주 한자 2글자 (천간+지지)
	hour: string;   // 시주 한자 2글자 (천간+지지)
};