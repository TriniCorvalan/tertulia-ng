import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import {
  passwordErrorMessage,
  passwordStrengthValidator,
  passwordsMatchValidator,
} from '../../core/validators/password.validator';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly passwordErrorMessage = passwordErrorMessage;

  protected readonly form = inject(FormBuilder).nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordStrengthValidator()]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator() },
  );

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.submitting.set(true);
    const { nombre, email, password } = this.form.getRawValue();
    this.auth.register({ nombre, email, password }).subscribe({
      next: () => {
        this.auth.login({ email, password }).subscribe({
          next: () => void this.router.navigateByUrl('/inicio'),
          error: () => {
            this.submitting.set(false);
            void this.router.navigateByUrl('/login');
          },
        });
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err?.error?.error ?? 'No se pudo registrar. Revisá el email o ms-usuarios.';
        this.error.set(typeof msg === 'string' ? msg : 'No se pudo registrar.');
      },
    });
  }
}
