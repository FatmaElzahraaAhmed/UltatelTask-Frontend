import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword: boolean = false;
  emailToken = '';
  emailResent=false;
  register = true;
  emailConfirmation = false;
  emailTaken = false;
  showConfirmPassword: boolean = false;
  passwordStrength = {
    class: '',
    lengthValid: false,
    hasNumber: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasSymbol: false,
  };

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      { validator: this.passwordMatchValidator }
    );
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
    }
  }

  markAllAsTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if ((control as FormGroup).controls) {
        this.markAllAsTouched(control as FormGroup);
      }
    });
  }

  checkPasswordStrength() {
    const password = this.registerForm.get('password')?.value;
    this.passwordStrength.lengthValid = password.length >= 8;

    this.passwordStrength.hasNumber = /[0-9]/.test(password);
    this.passwordStrength.hasUpperCase = /[A-Z]/.test(password);
    this.passwordStrength.hasLowerCase = /[a-z]/.test(password);
    this.passwordStrength.hasSymbol = /[^A-Za-z0-9]/.test(password);

    if (this.passwordStrength.lengthValid && this.countValidations() == 4) {
      this.passwordStrength.class = 'strong';
    } else if (
      this.passwordStrength.lengthValid &&
      this.countValidations() >= 2
    ) {
      this.passwordStrength.class = 'medium';
    } else if (this.passwordStrength.lengthValid) {
      this.passwordStrength.class = 'weak';
    } else {
      this.passwordStrength.class = 'very-weak';
    }
  }

  countValidations(): number {
    let count = 0;
    if (this.passwordStrength.hasNumber) count++;
    if (this.passwordStrength.hasUpperCase) count++;
    if (this.passwordStrength.hasLowerCase) count++;
    if (this.passwordStrength.hasSymbol) count++;
    return count;
  }
  onSubmit() {
    if (this.registerForm.valid) {
      const user = this.registerForm.value;

      this.authService.register(user).subscribe(
        (response) => {
          console.log(response);
          
          if (
            response.message ==
            'Registration successful. Please check your email to confirm your account.'
          ) {
            this.register = false;
            this.emailConfirmation = true;
            this.emailToken = response.emailToken;
          }
        },
        (error) => {
          if (error.error.message == 'Email is already taken') {
            this.emailTaken = true;
          } else {
            this.emailTaken = false;
          }
        }
      );
    } else {
      this.markAllAsTouched(this.registerForm);
    }
  }

  resendConfirmationEmail() {
    const email = this.registerForm.get('email')?.value;
    this.authService.resendConfirmationEmail(email).subscribe(
      (response) => {
        console.log(response);
        this.emailResent = true; 
      },
      (error) => {
        console.error(error);
      }
    );
  }
}
