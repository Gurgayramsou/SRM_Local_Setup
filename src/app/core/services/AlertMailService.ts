import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
//import { enterView } from '@angular/core/src/render3/instructions';


@Injectable()
export class AlertMailService {
    public authorizationUrl: string = '';
    constructor(private http: HttpClient) {
        // if (location.href.toLocaleLowerCase().indexOf("local") != -1) {
        //     this.authorizationUrl = environment.authorizationLocal;
        // }
        // else {
        //     this.authorizationUrl = sessionStorage["access_token"];
        //     console.log("dev authorization" + this.authorizationUrl);
        // }
    }
    public getMailBodyData(scenario:String): Observable<any> {
        let textFileURL = '../data/MailerTemplates' + scenario + '.txt';
        return this.http.get(textFileURL)
            .map(data => {
                return data;
            });
    }

    public SendEmail(Body: String,Subject: String,To: String,Cc: String,scenario:String): Observable<AlertData> {
        debugger;
        let params = new HttpParams().set("MethodName", "SendMail");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params:params
        };
        if(environment.testEnv)//If not production
        {
           // Body = Body +"<table><tr>To Recepients: " + To + "</tr><br><br><tr>Cc Recepients : "+Cc + "</tr></table>";
            //To= ;
            Cc=environment.TestMailIDs;
        }
        var data = JSON.stringify({
            AlertData: {
                Body : Body,
                Subject : Subject,
                From : environment.alertfromID,
                To : To,
                Cc : Cc,
                Bcc : "",
                MailContentType : "HTML",
                Module : scenario,
                MailImportance : "0",
                ShortMsgTxt : scenario,
                CreateUserId : sessionStorage["LoggedinUser"],
                AttachmentList : ""
            }
        }
        );
        return this.http.post<AlertData>(environment.alertserviceUrl, data, httpOptions);
    }
}
export class AlertData {

    //Fields 
    Body: String
    Subject: String
    From: String
    To: String
    Cc: String
    Bcc: String
    MailContentType: String
    Module: String
    MailImportance: String
    ShortMsgTxt: String
    CreateUserId: String
    AttachmentList: String
}
