import { Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpRequest, HttpClient } from "@angular/common/http";
import { HttpInterceptor } from "@angular/common/http";
import { Observable } from 'rxjs/Rx';
import { merge } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JwtHelperService } from "@auth0/angular-jwt";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from '../../shared/alert/alert.component';
import { configuration } from '../../../config/configuration';
import { AuthService } from './auth.service';
import { OAuthService, OAuthEvent } from 'angular-oauth2-oidc';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(public http: HttpClient, private modalService: NgbModal, private authservice: AuthService,private oauthService: OAuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        //debugger;
        const helper = new JwtHelperService();
        var rawtoken = sessionStorage["access_token"];
        //var rawtoken = environment.authorizationLocal; //sessionStorage["access_token"];
        if (rawtoken != undefined) {
            let isTokenExpired = helper.isTokenExpired(rawtoken);
            if(isTokenExpired){
                this.confirm(configuration.Alert, configuration.SessionTimeOutMessage)
                .then((confirmed) => {
                    //window.location.reload();
                    //location.href = environment.LogoutURL;
                    //location.href = configuration.href; 
                    this.oauthService.logOut();
                })
                .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
                return;
            }
            else{
                return next.handle(req);
            }
        }
        else {
            return next.handle(req);
        }
    }
    public confirm(title: string, message: string): Promise<boolean> {
        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.message = message;
        return modalRef.result;
    }
}