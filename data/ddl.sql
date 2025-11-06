CREATE TABLE IF NOT EXISTS `manses` (
  `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  `solarDate` TEXT NOT NULL,
  `lunarDate` TEXT NOT NULL,
  `season` TEXT,
  `seasonStartTime` TEXT,
  `leapMonth` INTEGER,
  `yearSky` TEXT,
  `yearGround` TEXT,
  `monthSky` TEXT,
  `monthGround` TEXT,
  `daySky` TEXT,
  `dayGround` TEXT,
  `createdAt` TEXT NOT NULL,
  `updatedAt` TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_solar_date ON manses(solarDate);
