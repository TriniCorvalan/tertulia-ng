import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Reglas (≥4): min 8, max 64, letra+número, carácter especial. */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');
    if (!value) {
      return null;
    }

    const errors: ValidationErrors = {};
    if (value.length < 8) {
      errors['passwordMinLength'] = true;
    }
    if (value.length > 64) {
      errors['passwordMaxLength'] = true;
    }
    if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
      errors['passwordLetterNumber'] = true;
    }
    if (!/[^A-Za-z0-9]/.test(value)) {
      errors['passwordSpecial'] = true;
    }

    return Object.keys(errors).length ? errors : null;
  };
}

export function passwordsMatchValidator(
  passwordKey = 'password',
  confirmKey = 'confirmPassword',
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value;
    const confirm = group.get(confirmKey)?.value;
    if (password == null || confirm == null || confirm === '') {
      return null;
    }
    return password === confirm ? null : { passwordMismatch: true };
  };
}

export function passwordErrorMessage(errors: ValidationErrors | null): string | null {
  if (!errors) {
    return null;
  }
  if (errors['required']) {
    return 'La contraseña es obligatoria.';
  }
  if (errors['passwordMinLength']) {
    return 'Mínimo 8 caracteres.';
  }
  if (errors['passwordMaxLength']) {
    return 'Máximo 64 caracteres.';
  }
  if (errors['passwordLetterNumber']) {
    return 'Debe incluir letras y números.';
  }
  if (errors['passwordSpecial']) {
    return 'Debe incluir al menos un carácter especial.';
  }
  return 'Contraseña inválida.';
}
