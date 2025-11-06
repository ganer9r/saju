# 사주풀이 서비스 TODO List

## 🎯 프로젝트 목표
사용자의 생년월일시를 입력받아 LLM을 통해 사주 분석 레포트를 제공하는 웹 서비스 구현

---

## 📋 사전 준비

### 환경 설정
- [x] `.env` 파일 생성
  - **DoD**: 환경변수 파일이 생성되고 .gitignore에 추가됨
- [ ] LLM API 키 설정 (추후 추가)
  - `ANTHROPIC_API_KEY`
  - `OPENAI_API_KEY` (선택)
  - `GOOGLE_API_KEY` (선택)
  - **DoD**: API 키가 환경변수에 설정됨
- [x] 프로젝트 디렉토리 구조 생성
  - **DoD**: PRD에 명시된 디렉토리 구조가 모두 생성됨

### 테스트 데이터 준비
- [x] 테스트용 사용자 정보 샘플 작성
  - **DoD**: 최소 3개의 테스트 케이스 준비 (양력, 음력, 시간미상)

#### 테스트 데이터 샘플
```json
{
  "testUsers": [
    {
      "name": "홍길동",
      "gender": "male",
      "birthDate": "1990-01-15",
      "birthTime": "14:30",
      "calendarType": "solar",
      "isLeapMonth": false
    },
    {
      "name": "김영희",
      "gender": "female",
      "birthDate": "1985-08-20",
      "birthTime": "unknown",
      "calendarType": "solar",
      "isLeapMonth": false
    },
    {
      "name": "이철수",
      "gender": "male",
      "birthDate": "1992-05-10",
      "birthTime": "09:15",
      "calendarType": "lunar",
      "isLeapMonth": false
    }
  ]
}
```

---

## Phase 1: UI 구현 🎨

### 1.1 입력 폼 페이지 (`/saju`)
- [x] 라우트 생성 (`src/routes/saju/+page.svelte`)
  - **DoD**: `/saju` 경로 접속 시 페이지 표시
  - **예상 시간**: 30분

- [x] 입력 폼 구현
  - [x] 이름 입력 필드 (선택)
  - [x] 성별 선택 라디오 버튼
  - [x] 달력 구분 토글 (양력/음력)
  - [x] 윤달 체크박스 (음력 선택 시)
  - [x] 생년월일 date picker
  - [x] 출생시간 time picker
  - [x] 출생시간 모름 체크박스
  - **DoD**: 모든 입력 필드가 작동하며 상태가 올바르게 관리됨
  - **예상 시간**: 2시간

- [x] 폼 검증 구현
  - [x] 필수 필드 검증
  - [x] 날짜/시간 형식 검증
  - [x] 에러 메시지 표시
  - **DoD**: 잘못된 입력 시 적절한 에러 메시지 표시
  - **예상 시간**: 1시간

- [x] 로딩 상태 UI
  - [x] 로딩 오버레이 컴포넌트
  - [x] 진행 상태 메시지
  - [x] 스피너 애니메이션
  - **DoD**: 분석 중 로딩 화면이 표시됨
  - **예상 시간**: 1시간

- [x] 제출 핸들러
  - [x] API 호출 로직 (임시)
  - [x] 응답 처리 (임시)
  - [x] 레포트 페이지로 리다이렉션
  - **DoD**: 폼 제출 시 API 호출 후 레포트 페이지로 이동
  - **예상 시간**: 1시간

### 1.2 레포트 표시 페이지 (`/saju/report`)
- [x] 라우트 생성 (`src/routes/saju/report/+page.svelte`)
  - **DoD**: `/saju/report?id=xxx` 경로로 접속 가능
  - **예상 시간**: 30분

- [x] 레포트 레이아웃 구현
  - [x] 헤더 섹션 (이름, 생년월일시)
  - [x] 사주팔자 표시 (년/월/일/시)
  - [x] 사주 한마디 섹션
  - [x] 오행 분석 섹션
  - [x] 성격 영향 섹션
  - [x] 대인관계 섹션
  - [x] 문제점 섹션
  - [x] 조화 방법 섹션
  - [x] 5년 전망 섹션
  - [x] 마무리 섹션
  - **DoD**: 모든 섹션이 구조화되어 표시됨
  - **예상 시간**: 3시간

- [x] 공유 기능
  - [x] URL 복사 버튼
  - [x] 복사 완료 알림
  - **DoD**: URL 복사 시 클립보드에 저장되고 알림 표시
  - **예상 시간**: 30분

- [x] 새 분석 버튼
  - [x] 입력 페이지로 이동
  - **DoD**: 버튼 클릭 시 `/saju`로 이동
  - **예상 시간**: 15분

- [x] 반응형 디자인
  - [x] 모바일 레이아웃
  - [x] 태블릿 레이아웃
  - [x] 데스크톱 레이아웃
  - **DoD**: 모든 디바이스에서 적절히 표시됨
  - **예상 시간**: 2시간

---

## Phase 2: 백엔드 기초 ⚙️

### 2.1 LLM 프로바이더 시스템
- [x] 타입 정의 (`src/lib/llm/types.ts`)
  - [x] LLMProvider 인터페이스
  - [x] LLMContext 타입
  - [x] LLMConfig 타입
  - **DoD**: TypeScript 타입이 정의되고 컴파일 에러 없음
  - **예상 시간**: 30분

- [x] Claude 프로바이더 구현 (`src/lib/llm/providers/claude.ts`)
  - [x] API 클라이언트 초기화
  - [x] generateReport 메서드
  - [x] validateAPIKey 메서드
  - [x] 에러 처리
  - [x] 타임아웃 처리 (5분)
  - [x] 재시도 로직 (3회)
  - **DoD**: Claude API 호출이 정상 작동
  - **예상 시간**: 2시간

- [x] OpenAI 프로바이더 구현 (`src/lib/llm/providers/openai.ts`)
  - [x] API 클라이언트 초기화
  - [x] generateReport 메서드
  - [x] validateAPIKey 메서드
  - **DoD**: OpenAI API 호출이 정상 작동
  - **예상 시간**: 1시간

- [x] Gemini 프로바이더 구현 (`src/lib/llm/providers/gemini.ts`)
  - [x] API 클라이언트 초기화
  - [x] generateReport 메서드
  - [x] validateAPIKey 메서드
  - **DoD**: Gemini API 호출이 정상 작동
  - **예상 시간**: 1시간

- [x] 프로바이더 팩토리 (`src/lib/llm/factory.ts`)
  - [x] 프로바이더 생성 로직
  - [x] 환경변수 기반 선택
  - **DoD**: 설정에 따라 적절한 프로바이더 반환
  - **예상 시간**: 1시간

### 2.2 프롬프트 관리 시스템
- [x] 사주 분석 프롬프트 작성 (`src/lib/saju/prompts/saju-basic.md`)
  - [x] 프롬프트 템플릿 구조
  - [x] 변수 플레이스홀더
  - [x] 분석 지시사항
  - **DoD**: 완전한 프롬프트 템플릿 작성됨
  - **예상 시간**: 2시간

- [x] 프롬프트 로더 구현 (`src/lib/saju/prompts/index.ts`)
  - [x] 파일 읽기 로직
  - [x] 변수 치환 로직
  - [x] 캐싱 메커니즘
  - **DoD**: 프롬프트를 로드하고 변수를 치환할 수 있음
  - **예상 시간**: 1시간

---

## Phase 3: 서비스 통합 🔗

### 3.1 사주 분석 서비스
- [x] 타입 확장 (`src/lib/saju/types/report.ts`)
  - [x] SajuReport 인터페이스
  - [x] ReportContent 타입
  - [x] ReportMetadata 타입
  - **DoD**: 레포트 관련 타입 정의 완료
  - **예상 시간**: 30분

- [x] 분석 서비스 구현 (`src/lib/saju/services/analyzer.ts`)
  - [x] SajuAnalyzer 클래스
  - [x] analyze 메서드
  - [x] LLM 응답 파싱
  - [x] 에러 처리
  - **DoD**: 사주 데이터를 받아 LLM 분석 결과 반환
  - **예상 시간**: 2시간

- [x] 파일 저장 서비스 (`src/lib/saju/services/storage.ts`)
  - [x] ReportStorage 클래스
  - [x] save 메서드
  - [x] get 메서드
  - [x] exists 메서드
  - [x] 디렉토리 자동 생성
  - **DoD**: 레포트를 파일로 저장하고 조회할 수 있음
  - **예상 시간**: 1시간

### 3.2 API 엔드포인트
- [x] 사주 분석 API (`src/routes/api/saju/analyze/+server.ts`)
  - [x] POST 핸들러
  - [x] 입력 검증
  - [x] 중복 체크 (캐싱)
  - [x] 사주 계산 호출
  - [x] LLM 분석 호출
  - [x] 레포트 저장
  - [x] 응답 반환
  - **DoD**: POST 요청으로 사주 분석 완료
  - **예상 시간**: 2시간

- [x] 레포트 조회 API (`src/routes/api/saju/report/[id]/+server.ts`)
  - [x] GET 핸들러
  - [x] 파일 읽기
  - [x] 404 처리
  - [x] 응답 반환
  - **DoD**: GET 요청으로 레포트 조회 가능
  - **예상 시간**: 1시간

---

## Phase 4: 테스트 및 개선 🧪

### 4.1 단위 테스트
- [x] SajuCalculator 테스트
  - [x] 양력 계산 테스트
  - [x] 음력 계산 테스트
  - [x] 시간 미상 처리 테스트
  - **DoD**: 모든 테스트 케이스 통과
  - **예상 시간**: 1시간

- [x] LLM Provider 모킹
  - [x] Mock Provider 구현
  - [x] 테스트용 고정 응답
  - **DoD**: LLM 없이 테스트 가능
  - **예상 시간**: 1시간

- [x] 서비스 레이어 테스트
  - [x] Analyzer 테스트
  - [x] Storage 테스트
  - **DoD**: 서비스 로직 테스트 통과
  - **예상 시간**: 1시간

### 4.2 통합 테스트
- [x] API 엔드포인트 테스트
  - [x] 분석 API 테스트
  - [x] 조회 API 테스트
  - [x] 에러 케이스 테스트
  - **DoD**: API 통합 테스트 통과
  - **예상 시간**: 1시간

### 4.3 E2E 테스트
- [x] 사용자 시나리오 테스트
  - [x] 정상 플로우 테스트
  - [x] 에러 처리 테스트
  - [x] 반응형 테스트
  - **DoD**: 주요 사용자 시나리오 테스트 통과
  - **예상 시간**: 2시간

### 4.4 최종 점검
- [x] 코드 리뷰
  - [x] TypeScript strict 모드 확인
  - [x] ESLint 에러 해결
  - [x] Prettier 포맷팅
  - **DoD**: 코드 품질 기준 충족
  - **예상 시간**: 1시간

- [x] 문서 업데이트
  - [x] README.md 작성
  - [x] API 문서 작성
  - [x] 환경 설정 가이드
  - **DoD**: 필요한 문서 모두 작성됨
  - **예상 시간**: 1시간

- [x] 성능 테스트
  - [x] 로딩 시간 측정
  - [x] LLM 응답 시간 확인
  - [x] 메모리 사용량 체크
  - **DoD**: 성능 요구사항 충족
  - **예상 시간**: 1시간

---

## 📊 진행 상황

### 전체 진행률
- [x] Phase 1: UI 구현 (100%) ✅
- [x] Phase 2: 백엔드 기초 (100%) ✅
- [x] Phase 3: 서비스 통합 (100%) ✅
- [x] Phase 4: 테스트 및 개선 (100%) ✅

### 예상 총 소요 시간
- Phase 1: 약 11시간
- Phase 2: 약 8시간
- Phase 3: 약 6시간
- Phase 4: 약 8시간
- **총계: 약 33시간**

---

## 📝 참고사항

1. **우선순위**: Phase 순서대로 진행하되, 블로킹 이슈가 있으면 다음 작업 진행
2. **API 키**: LLM API 키는 실제 구현 시점에 추가
3. **테스트**: 각 Phase 완료 후 관련 테스트 작성
4. **문서화**: 코드 작성과 동시에 주석 및 문서 작성

---

## 🚨 리스크 및 대응

| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| LLM API 응답 지연 | 높음 | 타임아웃 설정, 재시도 로직 |
| 만세력 DB 데이터 오류 | 중간 | 테스트 케이스로 검증 |
| 파일 시스템 권한 문제 | 낮음 | 디렉토리 자동 생성 로직 |
| API 키 노출 | 높음 | 환경변수 사용, .gitignore 설정 |

---

*Last Updated: 2024-01-XX*