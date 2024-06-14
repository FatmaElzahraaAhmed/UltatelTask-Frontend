// import { Injectable } from '@angular/core';
// import {
//   HttpErrorResponse,
//   HttpEvent,
//   HttpHandler,
//   HttpInterceptor,
//   HttpRequest,
// } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError, switchMap } from 'rxjs/operators';
// import { AuthService } from './services/auth.service';
// import { Router } from '@angular/router';
// import { MatSnackBar } from '@angular/material/snack-bar';

// @Injectable()
// export class Interceptor implements HttpInterceptor {
//   constructor(
//     private authService: AuthService,
//     private router: Router,
//     private _snackBar: MatSnackBar
//   ) {}

//   intercept(
//     req: HttpRequest<any>,
//     next: HttpHandler
//   ): Observable<HttpEvent<any>> {
//     const authReq = this.addAuthHeader(req);

//     return next.handle(authReq).pipe(
//       catchError((error) => {
//         if (error instanceof HttpErrorResponse && error.status === 401) {
//           return this.handleUnauthorizedError(req, next);
//         } else {
//           return throwError(error);
//         }
//       })
//     );
//   }

//   private addAuthHeader(req: HttpRequest<any>): HttpRequest<any> {
//     const accessToken = this.authService.getAccessToken();

//     if (accessToken) {
//       return req.clone({
//         setHeaders: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });
//     }

//     return req;
//   }

//   private handleUnauthorizedError(
//     req: HttpRequest<any>,
//     next: HttpHandler
//   ): Observable<HttpEvent<any>> {
//     const refreshToken: any = localStorage.getItem('refreshToken');

//     return this.authService.refreshToken(refreshToken).pipe(
//       switchMap(() => {
//         const authReq = this.addAuthHeader(req); 
//         return next.handle(authReq);
//       }),
//       catchError((refreshError) => {
//         return throwError(refreshError);
//       })
//     );
//   }
// }
