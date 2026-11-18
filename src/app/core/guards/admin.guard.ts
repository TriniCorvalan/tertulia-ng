import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated() && auth.isAdmin()) {
    return true;
  }
  if (!auth.isAuthenticated()) {
    return inject(Router).createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }
  return inject(Router).createUrlTree(['/inicio']);
};
