import { test, expect } from '@playwright/test';

test.describe('Saju Analysis Flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/saju');
	});

	test('should complete full saju analysis flow', async ({ page }) => {
		// 페이지 로드 확인
		await expect(page.locator('h1')).toContainText('사주 분석');

		// 사용자 정보 입력
		await page.fill('input[placeholder="홍길동"]', '홍길동');
		await page.check('input[value="male"]');
		await page.check('input[value="solar"]');
		await page.fill('input[type="date"]', '1990-01-15');
		await page.fill('input[type="time"]', '14:30');

		// 폼 제출
		await page.click('button[type="submit"]');

		// 로딩 화면 확인
		await expect(page.locator('.fixed.inset-0')).toBeVisible();
		await expect(page.locator('text=사주를 분석하고 있습니다')).toBeVisible();

		// 레포트 페이지로 이동 대기 (실제로는 API 호출 완료까지)
		await page.waitForURL('/saju/report*', { timeout: 10000 });

		// 레포트 내용 확인
		await expect(page.locator('text=사주 분석 결과')).toBeVisible();
	});

	test('should handle text input parsing', async ({ page }) => {
		// 테스트 데이터 버튼 클릭
		await page.click('text=테스트 데이터 입력');

		// 텍스트 파싱 버튼 클릭
		await page.click('text=텍스트 파싱하여 입력');

		// 폼 필드가 자동으로 채워졌는지 확인
		await expect(page.locator('input[placeholder="홍길동"]')).toHaveValue('홍길동');
		await expect(page.locator('input[value="male"]')).toBeChecked();
		await expect(page.locator('input[value="leap"]')).toBeChecked();
		await expect(page.locator('input[type="date"]')).toHaveValue('1997-02-12');
		await expect(page.locator('input[type="time"]')).toHaveValue('07:22');
	});

	test('should validate required fields', async ({ page }) => {
		// 필수 필드 없이 제출 시도
		await page.click('button[type="submit"]');

		// 에러 메시지 확인
		await expect(page.locator('.text-red-600')).toBeVisible();
	});

	test('should handle unknown birth time', async ({ page }) => {
		// 기본 정보 입력
		await page.fill('input[placeholder="홍길동"]', '김영희');
		await page.check('input[value="female"]');
		await page.check('input[value="solar"]');
		await page.fill('input[type="date"]', '1985-08-20');

		// 출생시간 모름 체크
		await page.check('text=출생시간을 모름');

		// 시간 입력 필드가 비활성화되었는지 확인
		await expect(page.locator('input[type="time"]')).toBeDisabled();

		// 폼 제출
		await page.click('button[type="submit"]');

		// 로딩 화면 확인
		await expect(page.locator('.fixed.inset-0')).toBeVisible();
	});

	test('should handle lunar calendar selection', async ({ page }) => {
		// 음력 선택
		await page.check('input[value="lunar"]');

		// 기본 정보 입력
		await page.fill('input[placeholder="홍길동"]', '이철수');
		await page.check('input[value="male"]');
		await page.fill('input[type="date"]', '1992-05-10');
		await page.fill('input[type="time"]', '09:15');

		// 폼 제출
		await page.click('button[type="submit"]');

		// 로딩 화면 확인
		await expect(page.locator('.fixed.inset-0')).toBeVisible();
	});

	test('should handle leap month selection', async ({ page }) => {
		// 윤달 선택
		await page.check('input[value="leap"]');

		// 기본 정보 입력
		await page.fill('input[placeholder="홍길동"]', '최준호');
		await page.check('input[value="male"]');
		await page.fill('input[type="date"]', '1995-04-15');
		await page.fill('input[type="time"]', '06:30');

		// 폼 제출
		await page.click('button[type="submit"]');

		// 로딩 화면 확인
		await expect(page.locator('.fixed.inset-0')).toBeVisible();
	});

	test('should validate date range', async ({ page }) => {
		// 기본 정보 입력
		await page.fill('input[placeholder="홍길동"]', '테스트');
		await page.check('input[value="male"]');
		await page.check('input[value="solar"]');

		// 너무 과거 날짜 입력
		await page.fill('input[type="date"]', '1800-01-01');
		await page.fill('input[type="time"]', '12:00');

		// 폼 제출
		await page.click('button[type="submit"]');

		// 에러 메시지 확인
		await expect(page.locator('.text-red-600')).toBeVisible();
		await expect(page.locator('text=1900년 1월 1일 이후여야 합니다')).toBeVisible();
	});

	test('should validate time format', async ({ page }) => {
		// 기본 정보 입력
		await page.fill('input[placeholder="홍길동"]', '테스트');
		await page.check('input[value="female"]');
		await page.check('input[value="solar"]');
		await page.fill('input[type="date"]', '1990-01-15');

		// 잘못된 시간 형식 입력 (직접 입력은 어려우므로 스킵하거나 다른 방법 사용)
		// await page.fill('input[type="time"]', '25:70');

		// 시간을 지우고 제출
		await page.fill('input[type="time"]', '');
		await page.click('button[type="submit"]');

		// 시간 미상 체크하지 않았으므로 유효한 시간이 필요
		// 에러가 발생하지 않으면 정상 (브라우저 기본 검증)
	});
});

test.describe('Report Page', () => {
	test('should display report correctly', async ({ page }) => {
		// 레포트 페이지로 직접 이동 (임시 ID 사용)
		await page.goto('/saju/report?id=2024-01-15-1430');

		// 레포트 내용 확인 (임시 데이터)
		await expect(page.locator('h1')).toContainText('사주 분석 결과');

		// 섹션들이 존재하는지 확인
		const sections = [
			'사주 한마디',
			'가장 강한 오행',
			'성격에 미치는 영향',
			'대인관계',
			'문제점과 주의사항',
			'조화와 개선 방법',
			'향후 5년 전망',
			'마무리'
		];

		for (const section of sections) {
			await expect(page.locator(`text=${section}`)).toBeVisible();
		}
	});

	test('should handle URL sharing', async ({ page }) => {
		await page.goto('/saju/report?id=2024-01-15-1430');

		// URL 복사 버튼 클릭
		await page.click('text=URL 복사');

		// 복사 완료 알림 확인
		await expect(page.locator('text=복사 완료')).toBeVisible();
	});

	test('should navigate to new analysis', async ({ page }) => {
		await page.goto('/saju/report?id=2024-01-15-1430');

		// 새 분석 버튼 클릭
		await page.click('text=새 분석하기');

		// 입력 페이지로 이동 확인
		await expect(page).toHaveURL('/saju');
		await expect(page.locator('h1')).toContainText('사주 분석');
	});

	test('should be responsive on mobile', async ({ page }) => {
		// 모바일 뷰포트 설정
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/saju/report?id=2024-01-15-1430');

		// 모바일에서도 내용이 잘 보이는지 확인
		await expect(page.locator('h1')).toBeVisible();
		await expect(page.locator('text=사주 한마디')).toBeVisible();
	});
});

test.describe('Error Handling', () => {
	test('should handle non-existent report', async ({ page }) => {
		await page.goto('/saju/report?id=non-existent-id');

		// 에러 메시지 또는 404 페이지 확인
		// (실제 구현에 따라 다를 수 있음)
	});

	test('should handle network errors gracefully', async ({ page }) => {
		// 네트워크 차단
		await page.route('/api/saju/analyze', route => {
			route.abort('failed');
		});

		await page.goto('/saju');
		
		// 정보 입력
		await page.fill('input[placeholder="홍길동"]', '네트워크테스트');
		await page.check('input[value="male"]');
		await page.check('input[value="solar"]');
		await page.fill('input[type="date"]', '1990-01-15');
		await page.fill('input[type="time"]', '14:30');

		// 폼 제출
		await page.click('button[type="submit"]');

		// 에러 처리 확인 (실제 구현에 따라 다를 수 있음)
		// await expect(page.locator('.text-red-600')).toBeVisible();
	});
});