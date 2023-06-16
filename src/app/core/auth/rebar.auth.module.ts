import { NgModule, ModuleWithProviders, InjectionToken , Provider} from '@angular/core';

import {
  MsalGuard,
  MsalInterceptor,
  MsalBroadcastService,
  MsalInterceptorConfiguration,
  MsalModule,
  MsalService,
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalGuardConfiguration,
} from '@azure/msal-angular';
import {
  IPublicClientApplication,
  PublicClientApplication,
  InteractionType,
  BrowserCacheLocation,
  LogLevel,
  BrowserAuthOptions,
  stubbedPublicClientApplication,
} from '@azure/msal-browser';
import { AppConfig } from '../services/app.config';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
//import { LogLevel, Configuration } from 'msal';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { environment } from '../../../environments/environment';
import { OAuthService } from 'angular-oauth2-oidc';

export const REBAR_AUTH_GUARD = new InjectionToken<string>('REBAR_AUTH_GUARD');
const isIE =
window.navigator.userAgent.indexOf('MSIE ') > -1 ||
window.navigator.userAgent.indexOf('Trident/') > -1; // Remove this line to use Angular Universal
export function loggerCallback(logLevel: LogLevel, message: string): void {
  console.log(message);
}

export function MSALInstanceFactory(
  config: AppConfig
): IPublicClientApplication {
  console.log(config);
  //console.log(config.getConfig());
  //const msal = config.config["msal"] as Record<string, BrowserAuthOptions>;
  //let msalAuth;

  // if (msal) {
  //  msalAuth = msal.auth;
  // } else {
  //   console.error('Configure msal in ' + AppConfig.configPath);
  // }

  return new PublicClientApplication({
    //auth: msalAuth as BrowserAuthOptions,
   auth: {
    clientId: "bf5b431f-79d8-433d-87b6-c12633999a33", //actual clientid
    authority:"https://login.microsoftonline.com/f3211d0e-125b-42c3-86db-322b19a65a22/",
    redirectUri: "https://localhost:44345/",
  },
    cache: {
      cacheLocation:  BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: isIE, // set to true for IE 11. Remove this line to use Angular Universal
    },
    system: {
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false,
      },
    },
  });
}
export function MSALInterceptorConfigFactory(
  config: AppConfig
): MsalInterceptorConfiguration {
  
 console.log(config);
  // const msal = config.config.msal as Record<
  //   string,
  //   Record<
  //     string,
  //     Record<string, Iterable<readonly [unknown, unknown]> | unknown>
  //   >
  // >;
 //console.log(msal);
 const protectedResourceMap = new Map<string, Array<string>>();
 // protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', ['user.read']); // Prod environment. Uncomment to use.
 protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', ['e893cedc-03a7-43e8-af84-268c56badd1a/.default']);
  //  const protectedResourceMap = new Map(
  //    msal['auth']['framework']['protectedResourceMap'] as Iterable<
  //      readonly [string, string[]]
  //    >
  //  );

  console.log(protectedResourceMap);
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['bf5b431f-79d8-433d-87b6-c12633999a33/.default'],
    },
    loginFailedRoute: '/login-failed',
  };
}
/*
  When running locally `npm run start:local` or `npm run test` or `npm run e2e`
  use mock values, to turn off security.  This is set at build time.
*/


interface IConfigMap {
  [key: string]: Provider[];
}
export const PROVIDERS: IConfigMap = {
  mock: [
    {
      provide: MSAL_GUARD_CONFIG,
      useValue: { client: 'mock', authority: 'mock' },
    },
    {
      provide: REBAR_AUTH_GUARD,
      useValue: emptyGuard
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useValue: {},
    },
    {
      provide: MSAL_INSTANCE,
      useValue: stubbedPublicClientApplication,
    },
    MsalService,
  ] as Provider[],
  app: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory//,
    //  deps: [AppConfig],
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory,
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory//,
     // deps: [AppConfig],
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    { provide: REBAR_AUTH_GUARD, useClass: MsalGuard },
  ] as Provider[],
};
/*
export const PROVIDERS = {
  mock: [
    {
      provide: MSAL_CONFIG,
      useValue: { client: 'mock', authority: 'mock' }
    },
    {
      provide: REBAR_AUTH_GUARD,
      useValue: emptyGuard
    },
    {
      provide: MSAL_CONFIG_ANGULAR,
      useValue: {}
    },
    MsalService
  ],
  app: [
    {
      provide: MSAL_CONFIG,
      useFactory: MSALConfigFactory,
      deps: [AppConfig]
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    {
      provide: MSAL_CONFIG_ANGULAR,
      useFactory: MSALAngularConfigFactory,
      deps: [AppConfig]
    },
    MsalService,
    { provide: REBAR_AUTH_GUARD, useClass: MsalGuard }
  ]
};*/


@NgModule({
  imports: [MsalModule]
})
export class RebarAuthModule {

  static forRoot(): ModuleWithProviders<RebarAuthModule> {
    return {
      ngModule: RebarAuthModule,
      providers: PROVIDERS[environment.providers],
    };
  }
}
/*
@NgModule({
  imports: [MsalModule]
})
export class RebarAuthModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: RebarAuthModule
      //providers: PROVIDERS[environment.providers]
    };
  }
}

export function MSALAngularConfigFactory(
  config: AppConfig
): MsalAngularConfiguration {
  const msal = config.config.msal;
  let auth;
  let framework;

  if (msal) {
    auth = msal.auth;
  }
  if (auth) {
    framework = auth.framework;
  }

  return framework || {};
}

export function MSALConfigFactory(config: AppConfig): Configuration {
  const cfg = Object.assign({}, config.config.msal, {
    level: LogLevel.Verbose,
    piiLoggingEnabled: false
  });
  return cfg;
}
*/
export function emptyGuard(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) {
  return true;
}
