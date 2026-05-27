import { HttpInterceptorFn, HttpErrorResponse, HttpContextToken } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { ToastService } from '../../shared/toast.service';
import { throwError } from 'rxjs';

export const SKIP_TOAST = new HttpContextToken<boolean>(() => false);

export const toastInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const skipToast = req.context.get(SKIP_TOAST);
  const method = req.method.toUpperCase();
  const isMutation = method === 'POST' || method === 'PUT' || method === 'DELETE';

  return next(req).pipe(
    tap(() => {
    }),
    catchError((error: HttpErrorResponse) => {
      if (!skipToast) {
        const message = error.error?.message || 'Ha ocurrido un error, intente de nuevo';
        toast.error(message);
      }
      return throwError(() => error);
    }),
  );
};