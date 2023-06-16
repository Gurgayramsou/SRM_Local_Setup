import { Injectable,Inject } from '@angular/core';
import { AuthenticationResult,PopupRequest,InteractionStatus, RedirectRequest } from '@azure/msal-browser';
import { AppConfig } from '../services/app.config';
import { OAuthService } from 'angular-oauth2-oidc';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Location } from "@angular/common";
import { filter, takeUntil } from 'rxjs/operators';
import { RebarAuthModule } from './rebar.auth.module';
import {InteractionRequiredAuthError} from '@azure/msal-browser'
import { MsalService, MsalBroadcastService,  MSAL_GUARD_CONFIG,MsalGuardConfiguration,MsalCustomNavigationClient
} from '@azure/msal-angular';
import { environment } from '../../../environments/environment';




@Injectable({
  providedIn: RebarAuthModule
})
export class RebarAuthService {
  private readonly destroying$ = new Subject<void>();
  isIframe = false;
  loginDisplay = false;
  configData: any = null;

 /* constructor(private auth: MsalService, config: AppConfig) {
    this.configData = config.getConfig();
    // this.auth.handleRedirectCallback((authError, response) => {
    //   if (authError) {
    //     console.error('Redirect Error: ', authError.errorMessage);
    //     return;
    //   }

    //   console.log('Redirect Success: ', response.accessToken);
    // });
  }
*/

  constructor(
    config: AppConfig,
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private auth: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private router: Router,
    private location: Location
  ) {
    this.configData = config.getConfig();
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this.destroying$)
      )
      .subscribe(() => {
        this.setLoginDisplay();
        this.checkAndSetActiveAccount();
      });
  }

  setLoginDisplay() {
    this.loginDisplay = this.auth.instance.getAllAccounts().length > 0;
  }
  public IsUserAuthenticated(): boolean {
   return this.auth.instance.getAllAccounts().length > 0;
  }

  public authenticationEnabled(): boolean {
    return environment.providers !== 'mock';
  }
  checkAndSetActiveAccount(): void {
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
     */
     let activeAccount = this.auth.instance.getActiveAccount();

    if (!activeAccount && this.auth.instance.getAllAccounts().length > 0) {
      let accounts = this.auth.instance.getAllAccounts();
      this.auth.instance.setActiveAccount(accounts[0]);
    }
  }
    
  public login(): void {
    if (environment.providers !== 'mock') {
      const activeAccount = this.auth.instance.getActiveAccount();
      console.log(this.msalGuardConfig.authRequest);
      if (!activeAccount) {
        if (this.auth.instance.getAllAccounts().length > 0) {
          const accounts = this.auth.instance.getAllAccounts();
          this.auth.instance.setActiveAccount(accounts[0]);
        } else {
          if (this.msalGuardConfig.authRequest) {
            this.auth.loginRedirect({
              ...this.msalGuardConfig.authRequest,
            } as RedirectRequest);
          } else {
            this.auth.loginRedirect();
          }
        }
      }
    }
  }

  public getToken(): string {
    let accessToken :any;
    const account = this.auth.instance.getAllAccounts()[0];
    console.log("Inside get token method");
    console.log(account);
    const accessTokenRequest = {
      scopes: ["bf5b431f-79d8-433d-87b6-c12633999a33/.default"],
      account: account
  }
  this.auth.instance.acquireTokenSilent(accessTokenRequest).then(function(accessTokenResponse) {
    // Acquire token silent success
    // Call API with token
    let idtoken = accessTokenResponse.idToken;
    let accessToken = accessTokenResponse.accessToken;
    console.log("Inside access" +accessToken);
    //console.log("Inside access id  : " +idtoken);
   // var token="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik1yNS1BVWliZkJpaTdOZDFqQmViYXhib1hXMCIsImtpZCI6Ik1yNS1BVWliZkJpaTdOZDFqQmViYXhib1hXMCJ9.eyJhdWQiOiJlODkzY2VkYy0wM2E3LTQzZTgtYWY4NC0yNjhjNTZiYWRkMWEiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9mMzIxMWQwZS0xMjViLTQyYzMtODZkYi0zMjJiMTlhNjVhMjIvIiwiaWF0IjoxNjQ2MzkxNjEyLCJuYmYiOjE2NDYzOTE2MTIsImV4cCI6MTY0NjM5NjQ3OSwiYWNyIjoiMSIsImFpbyI6IkFWUUFxLzhUQUFBQXdGN0F0U1YvV2hiekl5TmRGUWhuY29vNXI0ZlRST0Z3SGc1REFwYWcyQTB4OEFXdnAwQ21pTHgzaTJaRFFHZVlCN3E2Y0lEcDlZVG1xSEFkODBqYit4cWRNOHRYbXduOW5KZDgyTU9YSkhRPSIsImFtciI6WyJwd2QiLCJtZmEiXSwiYXBwaWQiOiJlODkzY2VkYy0wM2E3LTQzZTgtYWY4NC0yNjhjNTZiYWRkMWEiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6IkJpc2h0IiwiZ2l2ZW5fbmFtZSI6IkhpbWFuc2h1IiwiaXBhZGRyIjoiMTU3LjM4LjEyMC4yNyIsIm5hbWUiOiJCaXNodCwgSGltYW5zaHUiLCJvaWQiOiIzYTNiMmJmNy1jMTlhLTQ1YjItOTU2OC1hOGMxZjAyMzViNGMiLCJvbnByZW1fc2lkIjoiUy0xLTUtMjEtODYxNTY3NTAxLTQxMzAyNzMyMi0xODAxNjc0NTMxLTM0Mjg3MDEiLCJyaCI6IjAuQVNZQURoMGg4MXNTdzBLRzJ6SXJHYVphSXR6T2staW5BLWhEcjRRbWpGYTYzUm9tQUdNLiIsInNjcCI6IlVzZXIuUmVhZCIsInN1YiI6IkZiSWM4X0NtTzlncVFZWVIxOGcwSE5COTJJQVROanVvZDFwbXFkM3NzN1UiLCJ0aWQiOiJmMzIxMWQwZS0xMjViLTQyYzMtODZkYi0zMjJiMTlhNjVhMjIiLCJ1bmlxdWVfbmFtZSI6ImhpbWFuc2h1LmJpc2h0QGRzLmRldi5hY2NlbnR1cmUuY29tIiwidXBuIjoiaGltYW5zaHUuYmlzaHRAZHMuZGV2LmFjY2VudHVyZS5jb20iLCJ1dGkiOiJJNTRobHgwQlkwdUhNMXl4aGwwY0FBIiwidmVyIjoiMS4wIn0.g00lS3lxTUMfOgOLSPnwJRBgwUpCVrSanMkSDJbnnNeAr-0SEobroiRgm1V0CazyNovZw0RUiMh80p-P1uRAxVpQA5AKRD_2n7xoH1qaZ4znkZG6nkg6QYljASedUb_WM6GJiEDQvG6iP3QMNzRdl7VSl4liDgKDAHfXyzHucq9BWhkSK5kiDZ1Sh2wWMTXuAJ1LDb9M7Hq8nruIuNc8Uu9_kBRYQ_jnZT9KUrmiMrifa6S7CId7v1llPM2S6i8S2exWPH6aBYCj9585xOTIeSp1_Q-r7xWFwfR_A5nThWdEqC39r0UJMKeq-1821WIKDiLmkc4tq6Kwz2UJcxAWaA";
    
    sessionStorage.setItem('access_token', accessToken);
    //sessionStorage.setItem('id_token', accessToken);
    //sessionStorage.setItem('access_token', token);
    // Call your API with token
    
}).catch(function (error) {
    //Acquire token silent failure, and send an interactive request
    console.log(error);
    if (error instanceof InteractionRequiredAuthError) {
      this.auth.instance.acquireTokenRedirect(accessTokenRequest);
    }
});
console.log("Outside access" +accessToken);
  return accessToken;
    //return sessionStorage.getItem("msal.idtoken");
}
  public getUser(): string | undefined {
    var name=this.auth.instance.getAllAccounts()[0]?.username;
    console.log(this.auth.instance.getAllAccounts()[0]?.username);
    return this.auth.instance.getAllAccounts()[0]?.username;
  }
  
/*   public setup(): void {
     debugger;
    if (this.authenticationEnabled()) {
      debugger;
      this.setupConfiguration();
      this.oauthService.tryLogin({});
      this.removeHashFromUrl();
    }
  }
  
  public handleAuthentication(): boolean {
    if (this.authenticationDisabled() || this.oauthService.hasValidAccessToken()) {
      return true;
    }
    this.oauthService.clearHashAfterLogin = true;
    this.oauthService.initImplicitFlow();
    return false;
  }
  
  public IsAuthenticated(): boolean {
    return this.oauthService.hasValidAccessToken()
  }
  
  //Fix for removing #id_token part from url once it has been stored in the app
  public removeHashFromUrl(): void {
    if (window.location.href.indexOf('#') >= 0) {
      window.location.hash = '';
    }

  }
  
  public getUserClaims(): any {
    var claims = this.oauthService.getIdentityClaims() as any;
    //console.log('<<<  Claims >>>>' + JSON.stringify(claims));
    //console.log('<<<  Claims sub (User EmailId) >>>>' + claims["sub"]);   
    return claims["sub"];
  }

  public authenticationEnabled(): boolean {
    return this.configData.eso.enabled === true;
  }

  private authenticationDisabled(): boolean {
    return !this.authenticationEnabled();
  }
  
  private setupConfiguration() {
    debugger;
    this.oauthService.skipIssuerCheck = true;
    this.oauthService.clearHashAfterLogin = true;
    this.oauthService.issuer = this.configData.eso.issuer;
    this.oauthService.loginUrl = this.configData.eso.loginUrl;
    this.oauthService.logoutUrl = this.configData.eso.logoutUrl;
    this.oauthService.redirectUri = this.configData.eso.redirectUri;
    this.oauthService.clientId = this.configData.eso.clientId;
    this.oauthService.scope = this.configData.eso.scope;
    this.oauthService.responseType = this.configData.eso.responseType;
    this.oauthService.oidc = this.configData.eso.oidc;
    this.oauthService.setStorage(sessionStorage);
  }*/

  public getUserClaims(): any {
    var claims;// = this.auth.getAuthorityInstance() oauthService.getIdentityClaims() as any;
    //console.log('<<<  Claims >>>>' + JSON.stringify(claims));
    //console.log('<<<  Claims sub (User EmailId) >>>>' + claims["sub"]);   
    return claims["sub"];
  }
}
