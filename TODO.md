# TODO - SAJU Core 모듈 TDD 구현

## 📋 TDD 진행 체크리스트

### 1. elements 모듈 리팩토링 ✅ 완료
- [x] elements.spec.ts 수정 - Elements 타입 테스트 작성
  - [x] wood, fire, earth, metal, water 속성 테스트
  - [x] 각 속성이 number 타입인지 확인
  - [x] 오행 합계 검증
- [x] elements.ts 수정 - Elements 인터페이스 정의 및 구현
  - [x] ElementsAnalysis → Elements 타입 변경
  - [x] 한글 출력 → 영문 키 변경

### 2. ten-gods (십성) 모듈
- [ ] ten-gods.spec.ts 작성
  - [ ] 천간 십성 계산 테스트
  - [ ] 지지 십성 계산 테스트
  - [ ] 일간 기준 관계 테스트
- [ ] ten-gods.ts 구현
  - [ ] TenGods 인터페이스 정의
  - [ ] analyzeTenGods 함수 구현

### 3. dayun (대운) 모듈
- [ ] dayun.spec.ts 작성
  - [ ] 대운 시작 나이 계산 테스트
  - [ ] 순행/역행 판단 테스트
  - [ ] 10년 단위 대운 기간 테스트
- [ ] dayun.ts 구현
  - [ ] Dayun, DayunPeriod 인터페이스 정의
  - [ ] calculateDayun 함수 구현

### 4. sinsals (신살) 모듈
- [ ] sinsals.spec.ts 작성
  - [ ] 역마살 판별 테스트
  - [ ] 도화살 판별 테스트
  - [ ] 화개살 판별 테스트
- [ ] sinsals.ts 구현
  - [ ] Sinsals 타입 정의
  - [ ] analyzeSinsals 함수 구현

### 5. yongshin (용신/격국) 모듈
- [ ] yongshin.spec.ts 작성
  - [ ] 용신 판별 테스트
  - [ ] 격국 분석 테스트
- [ ] yongshin.ts 구현
  - [ ] YongshinResult 인터페이스 정의
  - [ ] analyzeYongshin 함수 구현

### 6. hidden-stems (지장간) 모듈
- [ ] hidden-stems.spec.ts 작성
  - [ ] 12지지별 지장간 테스트
- [ ] hidden-stems.ts 구현
  - [ ] HiddenStems 인터페이스 정의
  - [ ] analyzeHiddenStems 함수 구현

### 7. yin-yang (음양) 모듈
- [ ] yin-yang.spec.ts 작성
  - [ ] 양 개수 계산 테스트
  - [ ] 음 개수 계산 테스트
- [ ] yin-yang.ts 구현
  - [ ] YinYang 인터페이스 정의
  - [ ] analyzeYinYang 함수 구현

### 8. helper-chars (천을귀인/공망) 모듈
- [ ] helper-chars.spec.ts 작성
  - [ ] 천을귀인 계산 테스트
  - [ ] 공망 계산 테스트
- [ ] helper-chars.ts 구현
  - [ ] HelperChars, EmptyChars 타입 정의
  - [ ] analyzeHelperChars, analyzeEmptyChars 함수 구현

## 📌 주요 원칙
- ✅ TDD: 테스트 먼저 작성 (Red → Green → Refactor)
- ✅ 타입은 각 파일 내부에 정의
- ✅ 한자는 그대로 유지
- ✅ 오행만 영문 키 사용 (wood, fire, earth, metal, water)
- ✅ 각 모듈 독립적으로 구현

## 🔄 진행 상태
- 시작일: 2025-09-24
- 현재 진행: elements 모듈 리팩토링 완료 ✅
- 다음 단계: ten-gods 모듈 TDD 구현 준비