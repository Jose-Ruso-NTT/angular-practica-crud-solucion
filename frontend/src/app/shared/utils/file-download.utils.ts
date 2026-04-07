function padTimestampPart(value: number): string {
  return value.toString().padStart(2, '0');
}

export function formatDownloadTimestamp(date = new Date()): string {
  const year = date.getFullYear();
  const month = padTimestampPart(date.getMonth() + 1);
  const day = padTimestampPart(date.getDate());
  const hours = padTimestampPart(date.getHours());
  const minutes = padTimestampPart(date.getMinutes());
  const seconds = padTimestampPart(date.getSeconds());

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
