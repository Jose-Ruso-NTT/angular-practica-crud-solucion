function padDatePart(value: number): string {
  return value.toString().padStart(2, '0');
}

export function isoToLocalDateTimeInput(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  // `datetime-local` has no timezone, so we preserve the UTC wall-clock parts
  // coming from the backend ISO value instead of converting them to the browser timezone.
  const year = date.getUTCFullYear();
  const month = padDatePart(date.getUTCMonth() + 1);
  const day = padDatePart(date.getUTCDate());
  const hours = padDatePart(date.getUTCHours());
  const minutes = padDatePart(date.getUTCMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function extractYearFromDateTimeInput(value: string): number | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return value.endsWith('Z') ? date.getUTCFullYear() : date.getFullYear();
}

export function localDateTimeInputToIso(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      0,
      0,
    ),
  ).toISOString();
}

export function formatBytes(value: number): string {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}
