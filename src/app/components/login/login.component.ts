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

      this.authService.login(user).subscribe(
        (response) => {
          if (response.accessToken) {
            localStorage.setItem('token', response.accessToken);
            this.router.navigate(['/home']);
          }
        },
        (error) => {
          if (error.error.message == 'Email not confirmed') {
            this.emailErrorMessage = 'Email not confirmed';
          } else if (error.error.message == "Email doesn't exist") {
            this.emailErrorMessage = `Email doesn't exist`;
            this.showAnchorTag = true;
          } else if (error.error.message == 'Wrong Password') {
            this.passwordErrorMessage = 'Wrong Password';
          }
        }
      );
    } else {
      this.markAllAsTouched(this.loginForm);
    }
  }
}
