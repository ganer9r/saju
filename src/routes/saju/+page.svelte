<script lang="ts">
	import type { UserInfo } from '$lib/saju/types';
	import { goto } from '$app/navigation';
	import { CALENDAR_TYPE } from '$lib/saju/types';
	
	let userInfo: UserInfo = {
		gender: 'male',
		birthDate: '',
		birthTime: '',
		calendarType: CALENDAR_TYPE.Solar,
		isLeapMonth: false,
		name: ''
	};
	
	// 달력 구분을 위한 별도 변수 (양력/음력/윤달)
	let calendarChoice = 'solar'; // 'solar', 'lunar', 'leap'
	
	let unknownTime = false;
	let isLoading = false;
	let error = '';
	let textInput = '';

	// 텍스트 파싱해서 폼에 입력
	function parseTextInput() {
		const lines = textInput.trim().split('\n').map(line => line.trim()).filter(line => line);
		
		if (lines.length < 4) {
			error = '최소 4줄 이상 입력해주세요 (이름, 성별, 달력구분, 생년월일)';
			return;
		}

		const [name, gender, calendar, ...rest] = lines;
		
		// 이름
		userInfo.name = name;
		
		// 성별
		if (gender === '남성' || gender === '남') {
			userInfo.gender = 'male';
		} else if (gender === '여성' || gender === '여') {
			userInfo.gender = 'female';
		} else {
			error = '성별은 "남성" 또는 "여성"으로 입력해주세요';
			return;
		}
		
		// 달력 구분 및 윤달
		if (calendar === '양력') {
			calendarChoice = 'solar';
			userInfo.calendarType = CALENDAR_TYPE.Solar;
			userInfo.isLeapMonth = false;
		} else if (calendar === '음력') {
			calendarChoice = 'lunar';
			userInfo.calendarType = CALENDAR_TYPE.Lunar;
			userInfo.isLeapMonth = false;
		} else if (calendar === '음력(윤달)' || calendar === '윤달') {
			calendarChoice = 'leap';
			userInfo.calendarType = CALENDAR_TYPE.Lunar;
			userInfo.isLeapMonth = true;
		} else {
			error = '달력 구분은 "양력", "음력", "윤달" 중 하나로 입력해주세요';
			return;
		}
		
		// 윤달이 별도 줄에 있는 경우 처리
		let dateIndex = 3;
		if (rest.length > 0 && (rest[0] === '윤달' || rest[0] === '윤월')) {
			calendarChoice = 'leap';
			userInfo.calendarType = CALENDAR_TYPE.Lunar;
			userInfo.isLeapMonth = true;
			dateIndex = 4;
		}
		
		// 생년월일 (4번째 또는 5번째 줄)
		const birthDate = lines[dateIndex];
		if (birthDate && /^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
			userInfo.birthDate = birthDate;
		} else {
			error = '생년월일은 YYYY-MM-DD 형식으로 입력해주세요';
			return;
		}
		
		// 출생시간 (있는 경우)
		const birthTime = lines[dateIndex + 1];
		if (birthTime) {
			if (/^\d{2}:\d{2}$/.test(birthTime)) {
				userInfo.birthTime = birthTime;
				unknownTime = false;
			} else if (birthTime === '미상' || birthTime === '모름') {
				userInfo.birthTime = '';
				unknownTime = true;
			}
		}
		
		error = '';
		textInput = '';
	}

	// 테스트 데이터 자동 입력
	function fillTestData() {
		textInput = `홍길동
남성
윤달
1997-02-12
07:22`;
		parseTextInput();
	}

	function validateForm(): string | null {
		// 필수 필드 검증
		if (!userInfo.gender) {
			return '성별을 선택해주세요.';
		}
		
		if (!userInfo.birthDate) {
			return '생년월일을 입력해주세요.';
		}
		
		if (!userInfo.calendarType) {
			return '달력 구분을 선택해주세요.';
		}

		// 생년월일 범위 검증 (1900-01-01 ~ 현재)
		const birthDate = new Date(userInfo.birthDate);
		const currentDate = new Date();
		const minDate = new Date('1900-01-01');
		
		if (birthDate < minDate) {
			return '생년월일은 1900년 1월 1일 이후여야 합니다.';
		}
		
		if (birthDate > currentDate) {
			return '생년월일은 현재 날짜 이전이어야 합니다.';
		}

		// 출생시간 검증 (시간미상이 아닌 경우)
		if (!unknownTime && userInfo.birthTime) {
			const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
			if (!timeRegex.test(userInfo.birthTime)) {
				return '올바른 출생시간 형식이 아닙니다. (HH:mm)';
			}
		}

		// 이름 길이 검증 (선택사항이지만 입력했다면)
		if (userInfo.name && userInfo.name.length > 50) {
			return '이름은 50자 이하로 입력해주세요.';
		}

		return null;
	}

	async function handleSubmit() {
		error = '';
		
		// 폼 검증
		const validationError = validateForm();
		if (validationError) {
			error = validationError;
			return;
		}

		// 시간 미상 처리
		const submitData = {
			...userInfo,
			birthTime: unknownTime ? 'unknown' : userInfo.birthTime
		};

		console.log('Form submitted:', submitData);
		
		isLoading = true;
		
		try {
			const response = await fetch('/api/saju/analyze', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userInfo: submitData
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error?.message || `HTTP ${response.status}: 서버 오류가 발생했습니다.`);
			}

			const result = await response.json();
			
			if (result.status === 'success') {
				goto(`/saju/report?id=${result.reportId}`);
			} else {
				throw new Error(result.error?.message || '분석 중 오류가 발생했습니다.');
			}
		} catch (err) {
			console.error('API Error:', err);
			error = (err instanceof Error ? err.message : String(err)) || '네트워크 오류가 발생했습니다. 다시 시도해주세요.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="container mx-auto max-w-2xl p-6">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-3xl font-bold">사주 분석</h1>
		<button
			type="button"
			on:click={fillTestData}
			class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
		>
			테스트 데이터 입력
		</button>
	</div>
	
	<!-- 텍스트 일괄 입력 -->
	<div class="mb-6 p-4 bg-gray-50 rounded-lg">
		<label for="text-input" class="block text-sm font-medium mb-2">
			텍스트 일괄 입력 (선택)
		</label>
		<textarea
			id="text-input"
			bind:value={textInput}
			placeholder="홍길동&#10;남성&#10;윤달&#10;1997-02-12&#10;07:22"
			class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
			rows="5"
		></textarea>
		<button
			type="button"
			on:click={parseTextInput}
			class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
		>
			텍스트 파싱하여 입력
		</button>
	</div>
	
	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<!-- 이름 입력 (선택) -->
		<div>
			<label for="name-input" class="block text-sm font-medium mb-2">
				이름 (선택)
			</label>
			<input
				id="name-input"
				type="text"
				bind:value={userInfo.name}
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				placeholder="홍길동"
			/>
		</div>

		<!-- 성별 선택 -->
		<div>
			<fieldset>
				<legend class="block text-sm font-medium mb-2">
					성별 *
				</legend>
				<div class="flex gap-4">
				<label class="flex items-center">
					<input
						type="radio"
						bind:group={userInfo.gender}
						value="male"
						class="mr-2 text-blue-600"
					/>
					남성
				</label>
				<label class="flex items-center">
					<input
						type="radio"
						bind:group={userInfo.gender}
						value="female"
						class="mr-2 text-blue-600"
					/>
					여성
				</label>
				</div>
			</fieldset>
		</div>

		<!-- 달력 구분 -->
		<div>
			<fieldset>
				<legend class="block text-sm font-medium mb-2">
					달력 구분 *
				</legend>
				<div class="flex flex-col gap-2">
				<label class="flex items-center">
					<input
						type="radio"
						bind:group={calendarChoice}
						value="solar"
						on:change={() => {
							userInfo.calendarType = CALENDAR_TYPE.Solar;
							userInfo.isLeapMonth = false;
						}}
						class="mr-2 text-blue-600"
					/>
					양력
				</label>
				<label class="flex items-center">
					<input
						type="radio"
						bind:group={calendarChoice}
						value="lunar"
						on:change={() => {
							userInfo.calendarType = CALENDAR_TYPE.Lunar;
							userInfo.isLeapMonth = false;
						}}
						class="mr-2 text-blue-600"
					/>
					음력
				</label>
				<label class="flex items-center">
					<input
						type="radio"
						bind:group={calendarChoice}
						value="leap"
						on:change={() => {
							userInfo.calendarType = CALENDAR_TYPE.Lunar;
							userInfo.isLeapMonth = true;
						}}
						class="mr-2 text-blue-600"
					/>
					음력 (윤달)
				</label>
				</div>
			</fieldset>
		</div>

		<!-- 생년월일 -->
		<div>
			<label for="birth-date" class="block text-sm font-medium mb-2">
				생년월일 *
			</label>
			<input
				id="birth-date"
				type="date"
				bind:value={userInfo.birthDate}
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
			/>
		</div>

		<!-- 출생시간 -->
		<div>
			<fieldset>
				<legend class="block text-sm font-medium mb-2">
					출생시간
				</legend>
				<div class="space-y-2">
					<input
						id="birth-time"
						type="time"
						bind:value={userInfo.birthTime}
						disabled={unknownTime}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
				/>
				<label class="flex items-center">
					<input
						type="checkbox"
						bind:checked={unknownTime}
						on:change={() => {
							if (unknownTime) {
								userInfo.birthTime = '';
							}
						}}
						class="mr-2 text-blue-600"
					/>
					출생시간을 모름
				</label>
				</div>
			</fieldset>
		</div>

		{#if error}
			<div class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
				{error}
			</div>
		{/if}

		<button
			type="submit"
			disabled={isLoading}
			class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
		>
			{isLoading ? '분석 중...' : '사주 분석하기'}
		</button>
	</form>
</div>

{#if isLoading}
	<!-- 로딩 화면 오버레이 -->
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white p-8 rounded-lg max-w-md mx-4">
			<div class="text-center">
				<!-- 스피너 애니메이션 -->
				<div class="relative mb-4">
					<div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
					<div class="absolute inset-0 flex items-center justify-center">
						<div class="text-blue-600 text-sm font-medium">분석중</div>
					</div>
				</div>
				
				<!-- 진행 상태 메시지 -->
				<h2 class="text-xl font-semibold mb-2 text-gray-800">사주를 분석하고 있습니다</h2>
				<div class="space-y-2 text-gray-600">
					<p class="text-sm">📅 생년월일시를 바탕으로 사주팔자를 계산중입니다</p>
					<p class="text-sm">🔮 전문 사주명리학 지식으로 운세를 분석중입니다</p>
					<p class="text-sm">📝 맞춤형 레포트를 생성중입니다</p>
				</div>
				<p class="mt-4 text-xs text-gray-500">
					약 1-2분 정도 소요됩니다. 잠시만 기다려주세요.
				</p>
			</div>
		</div>
	</div>
{/if}