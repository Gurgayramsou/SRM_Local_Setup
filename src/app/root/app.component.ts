import { Observable,Subject } from 'rxjs';
import { Component, enableProdMode, OnInit } from '@angular/core';
//import { AuthService } from '../core/auth/auth.service';   
import { AppConfig } from '../core/services/app.config';
import { RebarAuthService } from '../core/auth/rebar.auth.service';
import { InteractionStatus } from '@azure/msal-browser';
import { filter, takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import { JwtHelperService } from "@auth0/angular-jwt";
import { DataService } from '../core/services/DataService';
import { Router } from '@angular/router';
import {TitleService} from '../shared/title/title.service';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
//var ClientOAuth2 = require('client-oauth2')
enableProdMode();
@Component({
    selector: 'rebar-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    isVisible: boolean;
    isNotAuthorized: boolean = false;
    private storage: any;
    private cookieUrl: string;
    private requestUrl: string;
    private jwtToken: string;
    private details: CookieDetails;
    constructor(private router: Router, 
        private cookieService: CookieService, 
        private authservice: RebarAuthService, 
        private msalBroadcastService: MsalBroadcastService,
        private auth: MsalService,
        private http: HttpClient, 
        private service: DataService, 
        private titleService: TitleService) {
        this.storage = sessionStorage;
        console.log('app component');

    }

     ngOnInit() {
        // Trigger login flow
        console.log('init of app component-updated');
        this.titleService.boot();
       
        if (this.authservice.getUser() == undefined) {
            this.authservice.login();
            console.log(sessionStorage['route']);
            this.router.navigateByUrl('');
            this.storeRoute();            
        }
     
        console.log('After setup');
        if (!this.authservice.authenticationEnabled()) {
            this.isVisible = true;
        } else if ((this.authservice.authenticationEnabled() && this.authservice.getUser() !== undefined) == true) {
            this.isVisible = true;
       
                
        }  
            if (this.authservice.getUser() !== undefined) {
                if (this.authservice.getUser().toLowerCase().includes("@external"))
                {                    
                const userName = this.authservice.getUser();
                sessionStorage.setItem('LoggedinUserName',userName);
                sessionStorage.setItem('userName', userName);            
                sessionStorage.setItem('LoggedinUser', userName);
                localStorage.setItem('userName', userName);
                }
                else
                {
                const userName = this.authservice.getUser().split('@');
                var rawtoken1 = this.authservice.getToken();
                this.isVisible = true;   
                sessionStorage.setItem('LoggedinUserName',userName[0]);
                  sessionStorage.setItem('userName', userName[0]);            
                  sessionStorage.setItem('LoggedinUser', userName[0]);
                  localStorage.setItem('userName', userName[0]);
                }
        }
        const helper = new JwtHelperService();
        var rawtoken = this.authservice.getToken();      
        if (this.authservice.getUser() !== undefined) {
            if(sessionStorage["access_token"]==undefined)
            {
            setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
            this.service.IsUserAvailable(sessionStorage["LoggedinUser"]).subscribe(
                data => {
                    if (data != null) {
                        if (data[0].totalCount == 0) {
                            this.isVisible = false;
                            this.isNotAuthorized = true;
                        }
                    }
                });
        }

    } 
    storeRoute() {
        const route = location.pathname + location.search;
        if (route != undefined && route != '') {
            const path = route.substring(1,route.length);
            if (path != null && path != '') {
                this.storage.setItem('route', path);
            }

        }
    }








    // ngOnInit() {
    //     debugger;
    //     console.log('init of app component-updated');
    //  this.titleService.boot();
    //     if (!this.authservice.IsUserAuthenticated()) {
    //         // if(sessionStorage["FirstTimeAuthentication"] == "" || sessionStorage["FirstTimeAuthentication"] == null || sessionStorage["FirstTimeAuthentication"] == undefined )
    //         // sessionStorage.setItem('FirstTimeAuthentication', "true");
    //         console.log(sessionStorage['route']);
    //         //location.href = '';
    //         this.router.navigateByUrl('');
    //     }
    //     // else
    //     // {
    //     //     sessionStorage.setItem('FirstTimeAuthentication', "false");
    //     // }
    //     // Trigger login flow     
    //     this.authservice.login();
    //     // Store first route in session storage so that in can be restored once request comes back from ESO
    //     if (!this.authservice.IsUserAuthenticated()) {
    //         debugger;
    //         this.storeRoute();
    //     }
    //     console.log('After setup');
    //     const helper = new JwtHelperService();
    //     // if (sessionStorage["msal.idtoken"] != null && sessionStorage["msal.idtoken"] != undefined && sessionStorage["msal.idtoken"] != "") {
    //     //     console.log(sessionStorage["msal.idtoken"]);
    //     //     varrawtoken = this.getToken();
    //     //     sessionStorage.setItem('access_token', rawtoken);
    //     //     constdecodedToken = helper.decodeToken(rawtoken);
    //     //     varfields = decodedToken["preferred_username"].split('@');
    //     //     localStorage.setItem('UserName', fields[0]);
    //     //     sessionStorage.setItem('LoggedinUser', fields[0]);

    //     //     console.log(fields[0]);
    //     // }
    //     //sessionStorage.setItem('access_token', environment.authorizationLocal);
    //     if (sessionStorage["msal.idtoken"] != null && sessionStorage["msal.idtoken"] != undefined && sessionStorage["msal.idtoken"] != "") {
    //         debugger;
    //         console.log(sessionStorage["msal.idtoken"]);
    //         //nikhil code
    //         var rawtoken = this.getToken();
    //         sessionStorage.setItem('access_token', rawtoken);      
    //         const decodedToken = helper.decodeToken(rawtoken);



    //         //SRM code

    //         //var rawtoken = environment.authorizationLocal; //sessionStorage["access_token"];        

    //         if (!decodedToken["preferred_username"].toLowerCase().includes("@external")) {
    //             var fields = decodedToken["preferred_username"].split('@');
    //             sessionStorage.setItem('userName', fields[0]);
    //             sessionStorage.setItem('LoggedinUser', fields[0]);
    //         }
    //         else {
    //             var fields = decodedToken["preferred_username"];
    //             sessionStorage.setItem('userName', fields);
    //             sessionStorage.setItem('LoggedinUser', fields);
    //         }

    //     }
    //     //store cloudfront cookies once configured.
    //     // this.getCookieDeatails(rawtoken).then(async data => {
    //     //     this.details = data;
    //     //     this.SetCookies()
    //     // });

    //     if (!this.authservice.authenticationEnabled()) {
    //         this.isVisible = true;
    //     } else if ((this.authservice.authenticationEnabled() && this.authservice.IsUserAuthenticated()) == true) {
    //         this.isVisible = true;
    //     }

    //     this.service.IsUserAvailable(sessionStorage["LoggedinUser"]).subscribe(
    //         data => {
    //             if (data != null) {
    //                 if (data[0].totalCount == 0) {
    //                     this.isVisible = false;
    //                     this.isNotAuthorized = true;
    //                 }
    //             }
    //         });
    // }

    // storeRoute() {
    //     const route = location.pathname + location.search;
    //     //console.log(route);
    //     if (route != undefined && route != '') {
    //         const path = route.substring(1, route.length);
    //         if (path != null && path != '') {
    //             this.storage.setItem('route', path);
    //         }

    //     }
    // }

    // SetCookies(): void {
    //     this.cookieService.set('CloudFront-Key-Pair-Id', this.details.KeyPairId, null, null, null, true);
    //     this.cookieService.set('CloudFront-Policy', this.details.Policy, null, null, null, true);
    //     this.cookieService.set('CloudFront-Signature', this.details.Signature, null, null, null, true);
    // }
    //Call Rebar cookie service to set the cookies to access private content
    // public getCookieDeatails(accesstoken: any): Promise<CookieDetails> {
    //this.cookieUrl = environment.CookieUrl;
    //     this.jwtToken = 'Bearer ' + accesstoken
    //     const httpOptions = {
    //         headers: new HttpHeaders({
    //             'Content-Type': 'application/json',
    //             'Authorization': this.jwtToken
    //         })
    //     };
    //     return this.http.get<CookieDetails>(this.cookieUrl, httpOptions)
    //         .map(data => {
    //             return data;
    //         }).toPromise();

    // }
    // private getToken(): string {
    //     return sessionStorage.getItem("msal.idtoken");
    // }

}
export class CookieDetails {
    Domain: string;
    KeyPairId: string;
    Policy: string;
    Signature: string;
}