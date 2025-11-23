
import { inject } from "@angular/core";
import { CanMatchFn, Route, Router, UrlSegment } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { firstValueFrom, filter } from "rxjs";

export const NotAuthenticatedGuard: CanMatchFn = async (
  route: Route,
  segments: UrlSegment[]
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Espera a que authStatus deje de ser 'checking'
  const status = await firstValueFrom(
    authService.authStatus$.pipe(filter(s => s !== 'checking'))
  );

  if (status === 'authenticated') {
    router.navigateByUrl('/');
    return false;
  }

  return true;
};
