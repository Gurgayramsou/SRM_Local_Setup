import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OAuthModule } from 'angular-oauth2-oidc';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';

@NgModule({
  imports: [
    CommonModule,
    OAuthModule.forRoot()
  ],
  providers: [
    AuthGuard,
    AuthService,
    CookieService
  ]
})
export class AuthModule { }
