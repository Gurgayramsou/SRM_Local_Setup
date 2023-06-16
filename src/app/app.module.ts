import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA, APP_INITIALIZER } from '@angular/core';
//import { AuthModule } from './core/auth/auth.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './root/app.component';
//import { AppConfig } from './core/auth/app.config';
import { AppConfig } from './core/services/app.config';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { routing, LowerCaseUrlSerializer } from './app.routing';
import { DataService } from './core/services/DataService';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { PagerService } from './core/services/PagerService';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from './shared/alert/alert.component';
import { ApprovalService } from './core/services/ApprovalService';
import { ScoreService } from './core/services/ScoreService';
import { TaskDataEntryService } from './core/services/TaskDataEntryService';
import { VendorService } from './core/services/VendorService';
import { PackageService } from './core/services/PackageService';
import { TaskMasterService } from './core/services/TaskMasterService';
import { UrlSerializer } from '@angular/router';
import { DatePipe } from '@angular/common';
import { JwtModule } from '@auth0/angular-jwt';
import { FileService } from './core/services/File';
import { AlertMailService } from './core/services/AlertMailService';
import { RoleMappingService } from './core/services/RoleMappingService';
//import { AuthInterceptor } from './core/auth/auth.interceptor';
import { RebarInterceptor } from './core/services/RebarInterceptor';
import { OrderModule } from 'ngx-order-pipe';
import { ExcelFileService } from './core/services/ExcelFileService';
import { CacheInterceptor } from './core/services/CacheInterceptor';
import { TitleService } from './shared/title/title.service';
import { RoleMasterService } from './core/services/RoleMasterService';
import { FacilityService } from './core/services/FacilityServices';
import { RebarAuthService } from './core/auth/rebar.auth.service';
import { CookieService } from 'ngx-cookie-service';
import { RebarAuthModule ,REBAR_AUTH_GUARD, MSALInstanceFactory,MSALGuardConfigFactory,MSALInterceptorConfigFactory} from './core/auth/rebar.auth.module';
import {
    MsalModule,
    MsalInterceptor,
    MsalGuard, MSAL_GUARD_CONFIG, MsalService, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG,
  MsalBroadcastService, MsalRedirectComponent 
} from '@azure/msal-angular';
import { OAuthService, UrlHelperService , OAuthLogger} from 'angular-oauth2-oidc';

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    HeaderComponent,
    FooterComponent,
    AlertComponent
  ],

  schemas: [
    NO_ERRORS_SCHEMA
  ],

  imports: [
    JwtModule, BrowserModule, FormsModule, ReactiveFormsModule, HttpClientModule, routing, NgbModule, OrderModule,MsalModule
  ],
  providers: [[OAuthLogger],
    {
      provide: UrlSerializer,
      useClass: LowerCaseUrlSerializer,
    },
    AppConfig, DataService, PagerService, NgbActiveModal,
    {
      provide: APP_INITIALIZER,
      useFactory: (config: AppConfig) => () => config.load(),
      deps: [AppConfig], multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory,
      //deps: [AppConfig]
    },
    {
      provide: REBAR_AUTH_GUARD,
      useClass: MsalGuard,
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
     // deps: [AppConfig]
      },

    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory//,
     // deps: [AppConfig],
    },
    ApprovalService,
    ScoreService,
    TaskDataEntryService,
    VendorService,
    PackageService,
    TaskMasterService,
    DatePipe,
    RoleMappingService,
    FileService,
    AlertMailService,
    ExcelFileService,
    TitleService,
    RoleMasterService,
    FacilityService,
    CookieService,MsalBroadcastService,MsalGuard,MsalService,
    OAuthService,UrlHelperService , RebarAuthService
  ],
  bootstrap: [AppComponent, MsalRedirectComponent],
  entryComponents: [
    AlertComponent
  ]
})
export class AppModule { }
