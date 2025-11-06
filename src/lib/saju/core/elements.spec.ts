import { describe, it, expect } from 'vitest';
import { analyzeElements } from './elements';
import type { SajuData } from '../types';

describe('analyzeElements', () => {
  describe('Elements 객체 반환', () => {
    it('Elements 객체의 5가지 오행 속성을 포함해야 한다', () => {
      const sajuData: SajuData = {
        year: '甲子',  // 목, 수
        month: '丙寅', // 화, 목
        day: '戊辰',   // 토, 토
        hour: '庚申',  // 금, 금
      };

      const result = analyzeElements(sajuData);
      
      expect(result).toHaveProperty('wood');
      expect(result).toHaveProperty('fire');
      expect(result).toHaveProperty('earth');
      expect(result).toHaveProperty('metal');
      expect(result).toHaveProperty('water');
      
      expect(typeof result.wood).toBe('number');
      expect(typeof result.fire).toBe('number');
      expect(typeof result.earth).toBe('number');
      expect(typeof result.metal).toBe('number');
      expect(typeof result.water).toBe('number');
    });

    it('오행을 정확히 계산해야 한다', () => {
      const sajuData: SajuData = {
        year: '甲子',  // 목, 수
        month: '丙寅', // 화, 목
        day: '戊辰',   // 토, 토
        hour: '庚申',  // 금, 금
      };

      const result = analyzeElements(sajuData);
      
      expect(result.wood).toBe(2);
      expect(result.fire).toBe(1);
      expect(result.earth).toBe(2);
      expect(result.metal).toBe(2);
      expect(result.water).toBe(1);
    });

    it('없는 오행은 0으로 표시해야 한다', () => {
      const sajuData: SajuData = {
        year: '甲寅',  // 목, 목
        month: '乙卯', // 목, 목
        day: '丙午',   // 화, 화
        hour: '丁巳',  // 화, 화
      };

      const result = analyzeElements(sajuData);
      
      expect(result.wood).toBe(4);
      expect(result.fire).toBe(4);
      expect(result.earth).toBe(0);
      expect(result.metal).toBe(0);
      expect(result.water).toBe(0);
    });
  });

  describe('미상 데이터 처리', () => {
    it('모든 데이터가 미상인 경우 0으로 반환해야 한다', () => {
      const sajuData: SajuData = {
        year: '미상',
        month: '미상',
        day: '미상',
        hour: '미상'
      };

      const result = analyzeElements(sajuData);
      
      expect(result.wood).toBe(0);
      expect(result.fire).toBe(0);
      expect(result.earth).toBe(0);
      expect(result.metal).toBe(0);
      expect(result.water).toBe(0);
    });
  });
});