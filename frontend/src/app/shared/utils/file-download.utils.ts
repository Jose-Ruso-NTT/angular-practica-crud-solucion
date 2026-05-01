import { padDatePart } from '@shared/utils/date.utils';

export function formatBytes(value: number): string {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDownloadTimestamp(date = new Date()): string {
  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  const hours = padDatePart(date.getHours());
  const minutes = padDatePart(date.getMinutes());
  const seconds = padDatePart(date.getSeconds());

  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

export function buildTimestampedFileName(fileName: string, date = new Date()): string {
  const extensionIndex = fileName.lastIndexOf('.');
  const hasExtension = extensionIndex > 0;
  const baseName = hasExtension ? fileName.slice(0, extensionIndex) : fileName;
  const extension = hasExtension ? fileName.slice(extensionIndex) : '';

  return `${baseName}-${formatDownloadTimestamp(date)}${extension}`;
}

export function downloadBlob(blob: Blob, fileName: string, date = new Date()): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = buildTimestampedFileName(fileName, date);
  link.click();

  window.URL.revokeObjectURL(url);
}
