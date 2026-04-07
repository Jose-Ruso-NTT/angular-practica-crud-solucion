import {
  buildTimestampedFileName,
  formatDownloadTimestamp,
} from '@shared/utils/file-download.utils';

describe('file download utils', () => {
  const date = new Date(2026, 2, 29, 15, 4, 5);

  it('formats the download timestamp using local date parts', () => {
    expect(formatDownloadTimestamp(date)).toBe('20260329-150405');
  });

  it('appends the timestamp before the extension', () => {
    expect(buildTimestampedFileName('cars.xlsx', date)).toBe('cars-20260329-150405.xlsx');
  });

  it('appends the timestamp when the file has no extension', () => {
    expect(buildTimestampedFileName('documento', date)).toBe('documento-20260329-150405');
  });
});
