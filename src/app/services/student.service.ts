import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private baseUrl = 'https://ultateltask-backend-production.up.railway.app/student';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
  getAllStudents(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${this.baseUrl}`, { headers });
  }

  getStudentById(studentId: number): Observable<any> {
    const headers = this.getHeaders();

    return this.http.get<any>(`${this.baseUrl}/${studentId}`, { headers });
  }

  createStudent(studentData: any): Observable<any> {
    const headers = this.getHeaders();

    return this.http.post<any>(`${this.baseUrl}`, studentData, { headers });
  }

  updateStudent(studentId: number, studentData: any): Observable<any> {
    const headers = this.getHeaders();

    return this.http.patch<any>(`${this.baseUrl}/${studentId}`, studentData, {
      headers,
    });
  }

  deleteStudent(studentId: number): Observable<any> {
    const headers = this.getHeaders();

    return this.http.delete<any>(`${this.baseUrl}/${studentId}`, { headers });
  }
}
