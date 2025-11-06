import Database from 'better-sqlite3';
import path from 'node:path';

// SQLite DB를 사용한 데이터 로더
export interface MansesRecord {
  id: number;
  solarDate: string;
  lunarDate: string;
  season: string | null;
  seasonStartTime: string | null;
  leapMonth: number | null;
  yearSky: string | null;
  yearGround: string | null;
  monthSky: string | null;
  monthGround: string | null;
  daySky: string | null;
  dayGround: string | null;
  createdAt: string;
  updatedAt: string;
  // 계산된 필드 추가 (사주 계산용)
  yearHanja?: string;
  monthHanja?: string;
  dayHanja?: string;
}

let db: Database.Database | null = null;

function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data/manses.db');
    db = new Database(dbPath);
    
    // WAL 모드 설정 (성능 향상)
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA synchronous = NORMAL');
    db.exec('PRAGMA cache_size = 1000');
    
    // 프로세스 종료시 DB 닫기
    process.on('exit', () => db?.close());
    process.on('SIGHUP', () => process.exit(128 + 1));
    process.on('SIGINT', () => process.exit(128 + 2));
    process.on('SIGTERM', () => process.exit(128 + 15));
  }
  return db;
}

export function loadMansesData(): MansesRecord[] {
  try {
    const database = getDatabase();
    const stmt = database.prepare('SELECT * FROM manses ORDER BY id LIMIT 1000');
    const records = stmt.all() as MansesRecord[];
    
    // 사주 계산용 필드 추가
    records.forEach(record => {
      record.yearHanja = record.yearSky || '' + record.yearGround || '';
      record.monthHanja = record.monthSky || '' + record.monthGround || '';
      record.dayHanja = record.daySky || '' + record.dayGround || '';
    });
    
    console.log(`Loaded ${records.length} manses records from SQLite`);
    return records;
  } catch (error) {
    console.error('Error loading manses data from SQLite:', error);
    return [];
  }
}

export function findMansesBySolarDate(solarDate: string): MansesRecord | undefined {
  try {
    const database = getDatabase();
    const stmt = database.prepare('SELECT * FROM manses WHERE solarDate = ? LIMIT 1');
    const record = stmt.get(solarDate) as MansesRecord | undefined;
    
    if (record) {
      // 사주 계산용 필드 추가
      record.yearHanja = (record.yearSky || '') + (record.yearGround || '');
      record.monthHanja = (record.monthSky || '') + (record.monthGround || '');
      record.dayHanja = (record.daySky || '') + (record.dayGround || '');
    }
    
    return record;
  } catch (error) {
    console.error('Error finding manse by solar date:', error);
    return undefined;
  }
}

export function findMansesByLunarDate(lunarDate: string): MansesRecord | undefined {
  try {
    const database = getDatabase();
    const stmt = database.prepare('SELECT * FROM manses WHERE lunarDate = ? LIMIT 1');
    const record = stmt.get(lunarDate) as MansesRecord | undefined;
    
    if (record) {
      // 사주 계산용 필드 추가
      record.yearHanja = (record.yearSky || '') + (record.yearGround || '');
      record.monthHanja = (record.monthSky || '') + (record.monthGround || '');
      record.dayHanja = (record.daySky || '') + (record.dayGround || '');
    }
    
    return record;
  } catch (error) {
    console.error('Error finding manse by lunar date:', error);
    return undefined;
  }
}

export function findMansesByLunarDateAndLeap(lunarDate: string, isLeapMonth: boolean): MansesRecord | undefined {
  try {
    const database = getDatabase();
    const leapValue = isLeapMonth ? 1 : 0;
    const stmt = database.prepare('SELECT * FROM manses WHERE lunarDate = ? AND (leapMonth = ? OR (leapMonth IS NULL AND ? = 0)) LIMIT 1');
    const record = stmt.get(lunarDate, leapValue, leapValue) as MansesRecord | undefined;
    
    if (record) {
      // 사주 계산용 필드 추가
      record.yearHanja = (record.yearSky || '') + (record.yearGround || '');
      record.monthHanja = (record.monthSky || '') + (record.monthGround || '');
      record.dayHanja = (record.daySky || '') + (record.dayGround || '');
    }
    
    return record;
  } catch (error) {
    console.error('Error finding manse by lunar date and leap:', error);
    return undefined;
  }
}

