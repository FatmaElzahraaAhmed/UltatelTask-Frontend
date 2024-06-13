import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'https://ultateltask-backend-production.up.railway.app/user';

  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, user);
  }
  
  resendConfirmationEmail(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/resend-confirmation-email`, { email });
  }
 
}
