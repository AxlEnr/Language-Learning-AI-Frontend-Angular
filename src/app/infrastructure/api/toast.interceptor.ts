import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { ToastService } from '../../shared/toast.service';
import { throwError } from 'rxjs';

export const toastInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const method = req.method.toUpperCase();
  const isMutation = method === 'POST' || method === 'PUT' || method === 'DELETE';

  return next(req).pipe(
    tap(() => {
      if (isMutation) {
        toast.success('Operación realizada con éxito');
      }
    }),
    catchError((error: HttpErrorResponse) => {
      const message = error.error?.message || 'Ha ocurrido un error, intente de nuevo';
      toast.error(message);
      return throwError(() => error);
    }),
  );
};