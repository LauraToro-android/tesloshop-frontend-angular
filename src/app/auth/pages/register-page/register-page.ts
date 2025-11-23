import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-register-page',
  imports: [ ReactiveFormsModule ],
  templateUrl: './register-page.html',
})
export class RegisterPage { 
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  public registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).+$/)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
  },
  {
    validators: [
      (form) => {
        const pass = form.get('password')?.value;
        const confirm = form.get('confirmPassword')?.value;

        if (pass !== confirm) {
          return { passwordsNotMatching: true};
        }
        return null;
      }
    ]
  });

  public errorMessage: string | null = null;

  register() {
    this.errorMessage = null;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { fullName, email, password } = this.registerForm.value;

    this.authService.register(fullName!, email!, password!)
      .subscribe(success => {
        if (success) {
          this.router.navigateByUrl('/');
        } else {
          this.errorMessage = 'No se pudo crear el usuario';
        }
      });
  }
}
