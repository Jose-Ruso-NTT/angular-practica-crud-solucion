import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api.config';
import { LoginRequest, LoginResponse, UserProfile } from '@shared/models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, payload);
  }

  me(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${API_BASE_URL}/auth/me`);
  }
}
