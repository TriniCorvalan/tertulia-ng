import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recuperar-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar-password.html',
  styleUrl: './recuperar-password.css',
})
export class RecuperarPassword {
  protected readonly sent = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sent.set(true);
  }
}
