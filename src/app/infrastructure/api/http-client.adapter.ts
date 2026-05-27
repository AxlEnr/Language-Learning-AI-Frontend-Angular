import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HttpClientAdapter {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  get<T>(path: string, requireAuth = true): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, { headers: this.headers(requireAuth) });
  }

  post<T>(path: string, body: unknown, requireAuth = true): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body, { headers: this.headers(requireAuth) });
  }

  put<T>(path: string, body: unknown, requireAuth = true): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body, { headers: this.headers(requireAuth) });
  }

  delete<T>(path: string, requireAuth = true): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`, { headers: this.headers(requireAuth) });
  }

  private headers(requireAuth: boolean): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json' });
    if (requireAuth) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  }
}
