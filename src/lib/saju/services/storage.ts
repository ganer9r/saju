import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import type { SajuReport, StoredReport, ErrorCode } from '../types/report';
import { ERROR_CODES } from '../types/report';

/**
 * 레포트 저장 서비스
 */
export class ReportStorage {
	private baseDir: string;

	constructor(baseDir?: string) {
		this.baseDir = baseDir || join(process.cwd(), 'data', 'reports');
		try {
			this.ensureDirectoryExists(this.baseDir);
		} catch (error: any) {
			throw new StorageError(
				ERROR_CODES.STORAGE_ERROR,
				`Storage 초기화 실패: ${error.message}`,
				{ baseDir: this.baseDir, error }
			);
		}
	}

	/**
	 * 레포트 저장
	 */
	async save(report: SajuReport): Promise<string> {
		try {
			const storedReport = this.convertToStoredFormat(report);
			const filePath = this.getFilePath(report.metadata.id);
			
			// 디렉토리 확인 및 생성
			this.ensureDirectoryExists(dirname(filePath));
			
			// 파일 저장
			const jsonContent = JSON.stringify(storedReport, null, 2);
			writeFileSync(filePath, jsonContent, 'utf-8');
			
			return report.metadata.id;

		} catch (error: any) {
			throw new StorageError(
				ERROR_CODES.STORAGE_ERROR,
				`레포트 저장 실패: ${error.message}`,
				{ reportId: report.metadata.id, error }
			);
		}
	}

	/**
	 * 레포트 조회
	 */
	async get(reportId: string): Promise<SajuReport | null> {
		try {
			const filePath = this.getFilePath(reportId);
			
			if (!existsSync(filePath)) {
				return null;
			}

			const jsonContent = readFileSync(filePath, 'utf-8');
			const storedReport: StoredReport = JSON.parse(jsonContent);
			
			return this.convertFromStoredFormat(storedReport);

		} catch (error: any) {
			if (error.code === 'ENOENT') {
				return null;
			}
			
			throw new StorageError(
				ERROR_CODES.STORAGE_ERROR,
				`레포트 조회 실패: ${error.message}`,
				{ reportId, error }
			);
		}
	}

	/**
	 * 레포트 존재 여부 확인
	 */
	async exists(reportId: string): Promise<boolean> {
		try {
			const filePath = this.getFilePath(reportId);
			return existsSync(filePath);
		} catch {
			return false;
		}
	}

	/**
	 * 레포트 삭제 (선택사항)
	 */
	async delete(reportId: string): Promise<boolean> {
		try {
			const filePath = this.getFilePath(reportId);
			
			if (!existsSync(filePath)) {
				return false;
			}

			// TODO: 실제로는 파일을 삭제하지 않고 archived 폴더로 이동하는 것이 좋을 수 있음
			// unlinkSync(filePath);
			return true;

		} catch (error: any) {
			throw new StorageError(
				ERROR_CODES.STORAGE_ERROR,
				`레포트 삭제 실패: ${error.message}`,
				{ reportId, error }
			);
		}
	}

	/**
	 * 파일 경로 생성
	 */
	private getFilePath(reportId: string): string {
		// reportId 형식: YYYY-MM-DD-HHmm
		// 파일 구조: data/reports/YYYY/MM/YYYY-MM-DD-HHmm.json
		
		const [year, month] = reportId.split('-');
		return join(this.baseDir, year, month, `${reportId}.json`);
	}

	/**
	 * 디렉토리 존재 확인 및 생성
	 */
	private ensureDirectoryExists(dirPath: string): void {
		if (!existsSync(dirPath)) {
			mkdirSync(dirPath, { recursive: true });
		}
	}

	/**
	 * SajuReport를 저장 형식으로 변환
	 */
	private convertToStoredFormat(report: SajuReport): StoredReport {
		return {
			id: report.metadata.id,
			createdAt: report.metadata.createdAt.toISOString(),
			userInfo: report.metadata.userInfo,
			sajuResult: report.metadata.sajuResult,
			content: report.content,
			metadata: {
				llmProvider: report.metadata.llmProvider,
				analysisVersion: report.metadata.analysisVersion
			},
			rawLLMResponse: report.rawLLMResponse
		};
	}

	/**
	 * 저장 형식을 SajuReport로 변환
	 */
	private convertFromStoredFormat(stored: StoredReport): SajuReport {
		return {
			metadata: {
				id: stored.id,
				createdAt: new Date(stored.createdAt),
				userInfo: stored.userInfo,
				sajuResult: stored.sajuResult,
				llmProvider: stored.metadata.llmProvider,
				analysisVersion: stored.metadata.analysisVersion
			},
			content: stored.content,
			rawLLMResponse: stored.rawLLMResponse
		};
	}

	/**
	 * 저장소 상태 확인
	 */
	async getStorageInfo(): Promise<{
		baseDir: string;
		accessible: boolean;
		totalReports?: number;
	}> {
		try {
			const accessible = existsSync(this.baseDir);
			
			// TODO: 실제 환경에서는 파일 개수를 세는 로직 추가 가능
			// const totalReports = await this.countTotalReports();
			
			return {
				baseDir: this.baseDir,
				accessible,
				// totalReports
			};
		} catch {
			return {
				baseDir: this.baseDir,
				accessible: false
			};
		}
	}
}

/**
 * 저장소 관련 에러 클래스
 */
export class StorageError extends Error {
	constructor(
		public code: ErrorCode,
		message: string,
		public details?: any
	) {
		super(message);
		this.name = 'StorageError';
	}
}

/**
 * 편의를 위한 기본 저장소 생성 함수
 */
export function createStorage(baseDir?: string): ReportStorage {
	return new ReportStorage(baseDir);
}