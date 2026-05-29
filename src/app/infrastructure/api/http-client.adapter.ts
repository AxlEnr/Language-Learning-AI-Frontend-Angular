import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SKIP_TOAST } from './toast.interceptor';

export interface RequestOptions {
  requireAuth?: boolean;
  skipToast?: boolean;
}

@Injectable({ providedIn: 'root' })
export class HttpClientAdapter {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  get<T>(path: string, options?: RequestOptions): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, this.buildOptions(options));
  }

  post<T>(path: string, body: unknown, options?: RequestOptions): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body, this.buildOptions(options));
  }

  postFormData<T>(path: string, formData: FormData, options?: RequestOptions): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, formData, this.buildOptions(options, true));
  }

  put<T>(path: string, body: unknown, options?: RequestOptions): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body, this.buildOptions(options));
  }

  delete<T>(path: string, options?: RequestOptions): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`, this.buildOptions(options));
  }

  private buildOptions(options?: RequestOptions, isFormData = false): { headers: HttpHeaders; context: HttpContext } {
    const requireAuth = options?.requireAuth ?? true;
    const skipToast = options?.skipToast ?? false;
    const context = new HttpContext().set(SKIP_TOAST, skipToast);
    return { headers: this.headers(requireAuth, isFormData), context };
  }

  private headers(requireAuth: boolean, isFormData = false): HttpHeaders {
    let headers = new HttpHeaders();
    if (!isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }
    headers = headers.set('Accept', 'application/json');
    if (requireAuth) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  }
}