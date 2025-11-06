import { readFileSync } from 'fs';
import { join } from 'path';
import type { UserInfo, SajuData } from '../types';
import { analyzeElements } from '../core/elements';
import { calculateAge, getCurrentDate } from '../core/utils';

/**
 * 프롬프트 변수 타입
 */
export interface PromptVariables {
	name: string;
	gender: string;
	birthDate: string;
	birthTime: string;
	calendarType: string;
	isLeapMonth?: boolean;
	year: string;
	yearHeavenlyStem: string;
	yearEarthlyBranch: string;
	month: string;
	monthHeavenlyStem: string;
	monthEarthlyBranch: string;
	day: string;
	dayHeavenlyStem: string;
	dayEarthlyBranch: string;
	hour: string;
	hourHeavenlyStem: string;
	hourEarthlyBranch: string;
	elements: string;
	currentDate: string;
	dayMasterElement: string;
	dominantElement: string;
	dominantPercentage: string;
	lackingElements: string;
	elementBalance: string;
	elementRelationships: string;
	age: string;
}

/**
 * 프롬프트 파일을 읽어오는 함수
 */
function loadPromptFile(filename: string): string {
	try {
		const promptPath = join(process.cwd(), 'src', 'lib', 'saju', 'prompts', filename);
		const content = readFileSync(promptPath, 'utf-8');
		return content;
	} catch (error) {
		throw new Error(`프롬프트 파일을 읽을 수 없습니다: ${filename}`);
	}
}

/**
 * 프롬프트 변수 치환 함수
 */
function substituteVariables(template: string, variables: PromptVariables): string {
	let result = template;

	// 기본 변수 치환
	Object.entries(variables).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
			result = result.replace(regex, String(value));
		}
	});

	// 조건부 블록 처리 ({{#if condition}}...{{/if}})
	result = result.replace(/\{\{\#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs, (match, condition, content) => {
		const value = variables[condition as keyof PromptVariables];
		return value ? content : '';
	});

	// 남은 미치환 변수들을 빈 문자열로 처리
	result = result.replace(/\{\{\w+\}\}/g, '');

	return result.trim();
}

/**
 * 사주 분석용 기본 프롬프트 생성
 */
export function createSajuAnalysisPrompt(userInfo: UserInfo, sajuData: SajuData): string {
	const template = loadPromptFile('saju-basic.md');

	// 달력 타입을 한국어로 변환
	const calendarTypeKorean = {
		solar: '양력',
		lunar: '음력'
	}[userInfo.calendarType || 'solar'] || '양력';

	// 출생시간 처리
	const birthTimeDisplay = userInfo.birthTime === 'unknown' ? '시간 미상' : userInfo.birthTime;

	// 성별을 한국어로 변환
	const genderKorean = userInfo.gender === 'male' ? '남성' : '여성';

	// 오행 분포 계산
	const elementsResult = analyzeElements(sajuData);

	const currentDate = getCurrentDate();
	const age = calculateAge(userInfo, currentDate) +'세';

	const variables: PromptVariables = {
		name: userInfo.name || '익명',
		gender: genderKorean,
		birthDate: userInfo.birthDate,
		birthTime: birthTimeDisplay,
		calendarType: calendarTypeKorean,
		isLeapMonth: userInfo.isLeapMonth,
		year: sajuData.year,
		yearHeavenlyStem: sajuData.year.charAt(0),
		yearEarthlyBranch: sajuData.year.charAt(1),
		month: sajuData.month,
		monthHeavenlyStem: sajuData.month.charAt(0),
		monthEarthlyBranch: sajuData.month.charAt(1),
		day: sajuData.day,
		dayHeavenlyStem: sajuData.day.charAt(0),
		dayEarthlyBranch: sajuData.day.charAt(1),
		hour: sajuData.hour,
		hourHeavenlyStem: sajuData.hour.charAt(0),
		hourEarthlyBranch: sajuData.hour.charAt(1),
		elements: JSON.stringify(elementsResult),
		currentDate: currentDate,
		dayMasterElement: '미상',
		dominantElement: '미상',
		dominantPercentage: '0',
		lackingElements: '미상',
		elementBalance: '미상',
		elementRelationships: '미상',
		age: age
	};

	return substituteVariables(template, variables);
}


/**
 * 사용 가능한 프롬프트 템플릿 목록
 */
export const AVAILABLE_PROMPTS = {
	SAJU_BASIC: 'saju-basic.md'
} as const;