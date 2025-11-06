<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	
	let reportId: string | null = null;
	let report: any = null;
	let loading = true;
	let error = '';

	onMount(async () => {
		reportId = $page.url.searchParams.get('id');
		
		if (!reportId) {
			error = '레포트 ID가 없습니다.';
			loading = false;
			return;
		}

		try {
			const response = await fetch(`/api/saju/report/${reportId}`);
			
			if (!response.ok) {
				if (response.status === 404) {
					throw new Error('레포트를 찾을 수 없습니다.');
				} else {
					throw new Error(`서버 오류가 발생했습니다. (${response.status})`);
				}
			}
			
			const result = await response.json();
			
			if (result.status === 'found') {
				report = result.report;
			} else {
				throw new Error(result.error?.message || '레포트를 가져올 수 없습니다.');
			}
			
		} catch (err: any) {
			console.error('Report fetch error:', err);
			error = err.message || '네트워크 오류가 발생했습니다.';
		} finally {
			loading = false;
		}
	});

	function shareReport() {
		const url = window.location.href;
		navigator.clipboard.writeText(url);
		alert('레포트 URL이 복사되었습니다.');
	}
</script>

<svelte:head>
	<title>{report?.metadata?.userInfo?.name || '사주'} 분석 레포트</title>
</svelte:head>

{#if loading}
	<div class="flex justify-center items-center min-h-screen">
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
	</div>
{:else if error}
	<div class="container mx-auto p-6">
		<div class="text-red-600 text-center">
			<h1 class="text-2xl font-bold mb-2">오류가 발생했습니다</h1>
			<p>{error}</p>
			<a href="/saju" class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
				새 분석하기
			</a>
		</div>
	</div>
{:else if report}
	<div class="container mx-auto max-w-4xl p-6">
		<!-- 헤더 -->
		<div class="mb-8 flex justify-between items-start">
			<div>
				<h1 class="text-3xl font-bold mb-2">
					{report.metadata?.userInfo?.name || '고객'}님의 사주 분석 레포트
				</h1>
				<p class="text-gray-600">
					{report.metadata?.userInfo?.birthDate} {report.metadata?.userInfo?.birthTime} 
					({report.metadata?.userInfo?.calendarType === 'lunar' ? '음력' : '양력'})
					{#if report.metadata?.userInfo?.isLeapMonth}(윤달){/if}
				</p>
			</div>
			<button
				on:click={shareReport}
				class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
			>
				공유하기
			</button>
		</div>

		<!-- 사주 기본 정보 -->
		<section class="bg-gray-50 p-6 rounded-lg mb-8">
			<h2 class="text-2xl font-semibold mb-4">사주 팔자</h2>
			<div class="grid grid-cols-4 gap-4 text-center">
				<div>
					<div class="text-sm text-gray-600">년주</div>
					<div class="text-2xl font-bold text-red-600">{report.metadata?.sajuResult?.year || '미상'}</div>
				</div>
				<div>
					<div class="text-sm text-gray-600">월주</div>
					<div class="text-2xl font-bold text-green-600">{report.metadata?.sajuResult?.month || '미상'}</div>
				</div>
				<div>
					<div class="text-sm text-gray-600">일주</div>
					<div class="text-2xl font-bold text-blue-600">{report.metadata?.sajuResult?.day || '미상'}</div>
				</div>
				<div>
					<div class="text-sm text-gray-600">시주</div>
					<div class="text-2xl font-bold text-purple-600">
						{report.metadata?.sajuResult?.hour || '미상'}
					</div>
				</div>
			</div>
		</section>

		<!-- 사주 한마디 -->
		<section class="mb-8 p-6 bg-blue-50 rounded-lg">
			<h2 class="text-xl font-semibold mb-2">📌 사주 한마디</h2>
			<div class="text-lg prose max-w-none">{@html report.content?.summary || '분석 중입니다...'}</div>
		</section>

		<!-- 레포트 내용 -->
		<div class="space-y-8">
			<section>
				<h2 class="text-2xl font-semibold mb-4">🔥 가장 강한 오행</h2>
				<div class="prose max-w-none">{@html report.content?.strongestElement || '분석 중입니다...'}</div>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">💫 성격적 영향</h2>
				<div class="prose max-w-none">{@html report.content?.personalityImpact || '분석 중입니다...'}</div>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">🤝 대인관계</h2>
				<div class="prose max-w-none">{@html report.content?.relationships || '분석 중입니다...'}</div>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">⚠️ 주의할 점</h2>
				<div class="prose max-w-none">{@html report.content?.problems || '분석 중입니다...'}</div>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">🌱 조화롭게 다스리는 법</h2>
				<div class="prose max-w-none">{@html report.content?.harmony || '분석 중입니다...'}</div>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">📅 향후 5년 전망</h2>
				<div class="prose max-w-none">{@html report.content?.fiveYearOutlook || '분석 중입니다...'}</div>
			</section>

			<section>
				<h2 class="text-2xl font-semibold mb-4">💝 마무리</h2>
				<div class="prose max-w-none">{@html report.content?.conclusion || '분석 중입니다...'}</div>
			</section>
		</div>

		<!-- 새 분석 버튼 -->
		<div class="text-center py-8 mt-12 border-t">
			<a
				href="/saju"
				class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
			>
				새로운 사주 분석하기
			</a>
		</div>
	</div>
{/if}

<style>
	:global(p) {
		margin-bottom: 1.5rem;
		line-height: 1.8;
		font-weight: 400;
		font-family: 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif;
		letter-spacing: -0.02em;
		color: #374151;
	}

	:global(b) {
		color: #1f2937;
		font-weight: 600;
	}
</style>