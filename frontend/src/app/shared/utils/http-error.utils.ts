import { HttpErrorResponse } from '@angular/common/http';

export type BackendErrorCode =
  | 'CAR_DUPLICATE_LICENSE_PLATE_IN_REQUEST'
  | 'CAR_DUPLICATE_LICENSE_PLATE'
  | 'CAR_DUPLICATE_BRAND_MODEL'
  | 'DOCUMENT_FILE_TOO_LARGE'
  | 'DOCUMENT_UPLOAD_ERROR';

interface BackendErrorPayload {
  statusCode?: number;
  error?: string;
  code?: BackendErrorCode;
  message?: unknown;
  details?: {
    licensePlate?: string;
    brandName?: string;
    modelName?: string;
    [key: string]: unknown;
  };
  licensePlate?: string;
  brandName?: string;
  modelName?: string;
}

function getPayloadDetail(payload: BackendErrorPayload, key: string): unknown {
  return payload.details?.[key] ?? payload[key as keyof BackendErrorPayload];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(bytes % (1024 * 1024) === 0 ? 0 : 1)} MB`;
}

function extractBackendPayload(payload: unknown): BackendErrorPayload | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  return payload as BackendErrorPayload;
}

function extractBackendMessage(payload: unknown): string | null {
  if (!payload) {
    return null;
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (typeof payload === 'object' && 'message' in payload) {
    const value = (payload as { message?: unknown }).message;
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string').join(' ');
    }

    if (typeof value === 'string') {
      return value;
    }
  }

  return null;
}

function translateConflictMessage(payload: BackendErrorPayload): string | null {
  if (payload.statusCode !== 409 || !payload.code) {
    return null;
  }

  if (payload.code === 'CAR_DUPLICATE_BRAND_MODEL') {
    const brandName = getPayloadDetail(payload, 'brandName');
    const modelName = getPayloadDetail(payload, 'modelName');

    if (typeof brandName === 'string' && typeof modelName === 'string') {
      return `Ya existe un coche registrado para ${brandName} ${modelName}. Solo puede existir un coche por combinación de marca y modelo.`;
    }

    return 'Ya existe un coche registrado con esa combinación de marca y modelo.';
  }

  if (payload.code === 'CAR_DUPLICATE_LICENSE_PLATE') {
    return 'La matricula ya esta registrada en otro coche.';
  }

  if (payload.code === 'CAR_DUPLICATE_LICENSE_PLATE_IN_REQUEST') {
    return 'La matricula esta repetida en otra unidad del formulario.';
  }

  if (payload.code === 'DOCUMENT_FILE_TOO_LARGE') {
    const maxFileSizeBytes = getPayloadDetail(payload, 'maxFileSizeBytes');

    if (typeof maxFileSizeBytes === 'number') {
      return `El archivo supera el tamaño máximo permitido de ${formatFileSize(maxFileSizeBytes)}.`;
    }

    return 'El archivo supera el tamaño máximo permitido.';
  }

  if (payload.code === 'DOCUMENT_UPLOAD_ERROR') {
    return 'No se ha podido procesar el archivo subido.';
  }

  return null;
}

export function getHttpErrorPayload(error: unknown): BackendErrorPayload | null {
  if (!(error instanceof HttpErrorResponse)) {
    return null;
  }

  return extractBackendPayload(error.error);
}

export function getHttpErrorCode(error: unknown): BackendErrorCode | null {
  return getHttpErrorPayload(error)?.code ?? null;
}

export function getHttpErrorDetail<T = unknown>(error: unknown, key: string): T | null {
  const payload = getHttpErrorPayload(error);
  const value = payload ? getPayloadDetail(payload, key) : null;

  return (value as T | null) ?? null;
}

export function getHttpErrorLicensePlate(error: unknown): string | null {
  const licensePlate = getHttpErrorDetail(error, 'licensePlate');

  return typeof licensePlate === 'string' ? licensePlate : null;
}

export function getHttpErrorMessage(
  error: unknown,
  fallback = 'Ha ocurrido un error inesperado.',
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  const backendPayload = extractBackendPayload(error.error);
  const translatedConflictMessage = backendPayload
    ? translateConflictMessage(backendPayload)
    : null;

  if (translatedConflictMessage) {
    return translatedConflictMessage;
  }

  const backendMessage = extractBackendMessage(error.error);
  if (backendMessage) {
    return backendMessage;
  }

  if (error.status === 0) {
    return 'No se ha podido conectar con el backend.';
  }

  if (error.status === 401) {
    return 'La sesión no es valida. Inicia sesión de nuevo.';
  }

  if (error.status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }

  if (error.status === 404) {
    return 'No se ha encontrado el recurso solicitado.';
  }

  return fallback;
}

export function hasHttpStatus(error: unknown, status: number): boolean {
  return error instanceof HttpErrorResponse && error.status === status;
}
