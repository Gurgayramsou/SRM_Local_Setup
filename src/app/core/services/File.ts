import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { environment } from '../../../environments/environment';
import { observable } from 'rxjs';

@Injectable()
export class FileService {

  BUCKET = environment.bucketName;

  public authorizationUrl: string = '';
  constructor(private http: HttpClient) {
    //   if (location.href.toLocaleLowerCase().indexOf("local") != -1) {
    //       this.authorizationUrl = environment.authorizationLocal;
    //   }
    //   else {
    //       this.authorizationUrl = sessionStorage["access_token"];
    //       console.log("dev authorization" + this.authorizationUrl);
    //   }
  }


  uploadfile(base64String,FileName) {
    let params = new HttpParams().set("bucketName", this.BUCKET)
    .set("fileName", FileName);
    const httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': "application/json",
            'Authorization': "Bearer " + sessionStorage["access_token"]
        }),
        params: params
    };

    var data = JSON.stringify({
        base64String

    });
    return this.http.post(environment.S3UploadServiceURL, data, httpOptions);
  }

  getFile(FileName: string) {

    let params = new HttpParams().set("bucketName", this.BUCKET)
    .set("fileName",FileName)
    .set("operation", "Download");
      const httpOptions = {
          headers: new HttpHeaders({
              'Content-Type': "application/json",
              'Authorization': "Bearer " + sessionStorage["access_token"]
          }),
          params: params
      };
      return this.http.get(environment.S3UploadServiceURL, httpOptions)
          .map(data => {
            return data["body"];
          });

    }

    getFileName(FileName: string) {

        let params = new HttpParams().set("bucketName", this.BUCKET)
        .set("fileName",FileName)
        .set("operation", "GetFile");
          const httpOptions = {
              headers: new HttpHeaders({
                  'Content-Type': "application/json",
                  'Authorization': "Bearer " + sessionStorage["access_token"]
              }),
              params: params
          };
          return this.http.get(environment.S3UploadServiceURL, httpOptions)
              .map(data => {
                return data;
              });
    
        }
  

  deleteFile(FileName) {
    let params = new HttpParams().set("bucketName", this.BUCKET)
    .set("fileName", FileName);
    const httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': "application/json",
            'Authorization': "Bearer " + sessionStorage["access_token"]
        }),
        params: params
    };

      return this.http.delete(environment.S3UploadServiceURL, httpOptions)
          .map(data => {
              return data;
          });
  }
}

export class FileUpload {
    name: string;
    url: string;

    constructor(name: string, url: string) {
        this.name = name;
        this.url = url;
    }
}
