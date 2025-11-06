import type { SajuData } from '../types';

/**
 * 오행 분포 인터페이스 (SAJU.md 기준)
 */
export interface Elements {
  /** 목(木) */
  wood: number;
  /** 화(火) */
  fire: number;
  /** 토(土) */
  earth: number;
  /** 금(金) */
  metal: number;
  /** 수(水) */
  water: number;
}

/**
 * 천간과 지지를 오행으로 매핑
 */
const HEAVENLY_STEM_ELEMENTS: Record<string, string> = {
  '甲': '목', '乙': '목',
  '丙': '화', '丁': '화',
  '戊': '토', '己': '토',
  '庚': '금', '辛': '금',
  '壬': '수', '癸': '수'
};

const EARTHLY_BRANCH_ELEMENTS: Record<string, string> = {
  '子': '수', '丑': '토', '寅': '목', '卯': '목',
  '辰': '토', '巳': '화', '午': '화', '未': '토',
  '申': '금', '酉': '금', '戌': '토', '亥': '수'
};

/**
 * 사주 데이터에서 오행 분포를 계산하는 메인 함수
 */
export function analyzeElements(sajuData: SajuData): Elements {
  // 오행 개수 계산
  const counts = countElements(sajuData);
  
  return {
    wood: counts['목'],
    fire: counts['화'],
    earth: counts['토'],
    metal: counts['금'],
    water: counts['수']
  };
}

/**
 * 사주 데이터에서 오행 개수를 계산
 */
function countElements(sajuData: SajuData): Record<string, number> {
  const counts: Record<string, number> = {
    '목': 0, '화': 0, '토': 0, '금': 0, '수': 0
  };

  // 각 기둥에서 오행 추출
  const pillars = [sajuData.year, sajuData.month, sajuData.day, sajuData.hour];
  
  pillars.forEach(pillar => {
    if (pillar && pillar !== '미상' && pillar.length >= 2) {
      const heavenlyStem = pillar.charAt(0);
      const earthlyBranch = pillar.charAt(1);
      
      const stemElement = HEAVENLY_STEM_ELEMENTS[heavenlyStem];
      const branchElement = EARTHLY_BRANCH_ELEMENTS[earthlyBranch];
      
      if (stemElement && counts[stemElement] !== undefined) {
        counts[stemElement]++;
      }
      if (branchElement && counts[branchElement] !== undefined) {
        counts[branchElement]++;
      }
    }
  });

  return counts;
}