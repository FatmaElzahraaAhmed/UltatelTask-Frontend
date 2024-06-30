import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  passwordErrorMessage = '';
  showAnchorTag = false;
  emailErrorMessage = '';
  loginForm: FormGroup;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.loginForm.get('email')?.valueChanges.subscribe(() => {
      this.emailErrorMessage = '';
      this.showAnchorTag = false;
    });
    this.loginForm.get('password')?.valueChanges.subscribe(() => {
      this.passwordErrorMessage = '';
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  markAllAsTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if ((control as FormGroup).controls) {
        this.markAllAsTouched(control as FormGroup);
      }
    });
  }

  onSubmit() {
    this.emailErrorMessage = '';
    this.passwordErrorMessage = '';
    this.showAnchorTag = false;

    if (this.loginForm.valid) {
      const user = this.loginForm.value;

      this.authService.login(user).pipe(
        catchError((error) => {
          switch (error.error.message) {
            case 'Email not confirmed':
              this.emailErrorMessage = 'Email not confirmed';
              break;
            case "Email doesn't exist":
              this.emailErrorMessage = `Email doesn't exist`;
              this.showAnchorTag = true;
              break;
            case 'Wrong Password':
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Wrong Password',
              }).then(() => {
                this.loginForm.get('password')?.reset();
              });
              break;
            case 'email must be an email':
              this.emailErrorMessage = 'Valid Email is required';
              break;
            default:
              console.error('Unhandled error:', error);
              break;
          }
          return throwError(() => new Error('test'));
        })
      ).subscribe((response) => {
        if (response.accessToken) {
          localStorage.setItem('token', response.accessToken);
          this.router.navigate(['/home']);
        }
      });
    } else {
      this.markAllAsTouched(this.loginForm);
    }
  }}
