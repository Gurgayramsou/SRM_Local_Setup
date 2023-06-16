import { Injectable } from '@angular/core';
import { OAuthService, OAuthEvent } from 'angular-oauth2-oidc';
import { AppConfig } from './app.config';
import { Router, NavigationEnd } from '@angular/router';


@Injectable()
export class AuthService {

    configData: any = null;
    private isRouteRestored = false;
    private storage: any;
    constructor(private oauthService: OAuthService, private config: AppConfig,
        private router: Router) {
        this.configData = config.getConfig();
        this.storage = sessionStorage;
    }

    public setup(): void {
        if (this.authenticationEnabled()) {
            this.setupConfiguration();
            this.oauthService.events.subscribe(({ type }: OAuthEvent) => {
                switch (type) {
                    case 'token_received':
                        this.removeHashFromUrl();
                        break;
                }
            });
            this.oauthService.tryLogin({});
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
        return this.oauthService.hasValidAccessToken();
    }

    // Fix for removing #id_token part from url once it has been stored in the app
    public removeHashFromUrl(): void {
        if (window.location.href.indexOf('#') >= 0) {
            window.location.hash = '';
        }

        this.router.events
            .subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    this.reStoreFirstRoute();
                }
            });

    }
    // Re-store first route from session storage after ESO redirect
    reStoreFirstRoute() {
        debugger;
        const currentRoute = this.router.url.substring(1,this.router.url.length);//.split('/')[1];
        const item = this.storage.getItem('route');
        if (!this.isRouteRestored) {
            if (item != null && item != '') {
                const route: string = item;
                this.router.navigate([item]);
                if (currentRoute == route) {
                    this.isRouteRestored = true;
                }
            }
        }
    }

    public getUserClaims(): any {
        const claims = this.oauthService.getIdentityClaims() as any;
        console.log('<<<  Claims >>>>' + JSON.stringify(claims));
        console.log('<<<  given_name >>>>' + claims.given_name);
        return claims;

    }


    public authenticationEnabled(): boolean {
        return this.configData.eso.enabled === true;
    }

    private authenticationDisabled(): boolean {
        return !this.authenticationEnabled();
    }

    private setupConfiguration() {
        debugger;
        this.oauthService.configure({
            skipIssuerCheck: true,
            clearHashAfterLogin: true,
            issuer: this.configData.eso.issuer,
            loginUrl: this.configData.eso.loginUrl,
            oidc: this.configData.eso.oidc,
            logoutUrl: this.configData.eso.logoutUrl,
            redirectUri: this.configData.eso.redirectUri,
            clientId: this.configData.eso.clientId,
            scope: this.configData.eso.scope,
            responseType: this.configData.eso.responseType
        });
        this.oauthService.setStorage(sessionStorage);
    }
}
