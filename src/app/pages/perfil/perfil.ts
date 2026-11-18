import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import {
  passwordErrorMessage,
  passwordStrengthValidator,
  passwordsMatchValidator,
} from '../../core/validators/password.validator';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly passwordErrorMessage = passwordErrorMessage;
  protected readonly currentUser = this.auth.currentUser;

  protected readonly form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [passwordStrengthValidator()]],
      confirmPassword: [''],
    },
    { validators: passwordsMatchValidator() },
  );

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.form.patchValue({
        nombre: user.nombre,
        email: user.email,
      });
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const user = this.auth.currentUser();
    if (!user) {
      this.error.set('Debes iniciar sesión.');
      return;
    }

    const { nombre, email, password } = this.form.getRawValue();
    const body = password.trim()
      ? { nombre: nombre.trim(), email: email.trim(), password }
      : { nombre: nombre.trim(), email: email.trim() };

    this.error.set(null);
    this.success.set(null);
    this.submitting.set(true);
    this.auth.updatePerfil(user.id, body).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set('Perfil actualizado.');
        this.form.patchValue({ password: '', confirmPassword: '' });
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err?.error?.error ?? 'No se pudo actualizar el perfil.';
        this.error.set(typeof msg === 'string' ? msg : 'No se pudo actualizar el perfil.');
      },
    });
  }
}
