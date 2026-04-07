import {
  extractYearFromDateTimeInput,
  isoToLocalDateTimeInput,
  localDateTimeInputToIso,
} from '@shared/utils/date.utils';

describe('date utils', () => {
  it('preserves the year for datetime-local values on New Year boundaries', () => {
    expect(extractYearFromDateTimeInput('2015-01-01T00:00')).toBe(2015);
  });

  it('extracts the year from backend ISO datetimes', () => {
    expect(extractYearFromDateTimeInput('2015-01-01T00:00:00.000Z')).toBe(2015);
  });

  it('maps backend ISO datetimes to datetime-local input values', () => {
    expect(isoToLocalDateTimeInput('2015-01-01T00:00:00.000Z')).toBe('2015-01-01T00:00');
  });

  it('maps datetime-local input values back to backend ISO datetimes', () => {
    expect(localDateTimeInputToIso('2015-01-01T00:00')).toBe('2015-01-01T00:00:00.000Z');
  });
});
