import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api.config';
import { CarDocument, UploadCarDocumentRequest } from '@shared/models/car.models';

@Injectable({ providedIn: 'root' })
export class CarDocumentsApiService {
  private readonly http = inject(HttpClient);

  getDocument(id: string): Observable<CarDocument> {
    return this.http.get<CarDocument>(`${API_BASE_URL}/cars/${id}/document`);
  }

  downloadDocument(id: string): Observable<Blob> {
    return this.http.get(`${API_BASE_URL}/cars/${id}/document/download`, {
      responseType: 'blob',
    });
  }

  uploadDocument(id: string, payload: UploadCarDocumentRequest): Observable<CarDocument> {
    const formData = new FormData();
    formData.append('file', payload.file);

    if (payload.title?.trim()) {
      formData.append('title', payload.title.trim());
    }

    if (payload.documentType?.trim()) {
      formData.append('documentType', payload.documentType);
    }

    if (payload.description?.trim()) {
      formData.append('description', payload.description.trim());
    }

    return this.http.post<CarDocument>(`${API_BASE_URL}/cars/${id}/document`, formData);
  }

  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/cars/${id}/document`);
  }
}
