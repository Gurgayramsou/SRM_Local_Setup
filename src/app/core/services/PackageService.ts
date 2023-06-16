import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import { Session } from 'protractor';
//import { DOCUMENT } from '@angular/platform-browser';
import { formatDate, DatePipe } from '@angular/common';
//import { AuthService } from '../auth/auth.service';



@Injectable()
export class PackageService {

    public authorizationUrl: string = '';
    today = new Date();
    jstoday = '';
    constructor(private http: HttpClient, private datepipe: DatePipe) {
        console.log('PackageService');
        // if (location.href.toLocaleLowerCase().indexOf("local") != -1) {
        //     this.authorizationUrl = environment.authorizationLocal;


        // }
        // else {
        //     this.authorizationUrl = sessionStorage["access_token"];
        //     console.log("dev authorization" + this.authorizationUrl);
        // }
    }

    public getSampleFunction(pageNumber: number): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            })
        };
        return this.http.get(environment.packageGetUrl, httpOptions)
            //this.http.get('../data/package.json')
            .map(data => {
                return data;
            });
    }

    public InsertIntoFunctionAndPackageFunctionMapping(packageId: number, functionName: string, weightage: string,enterpriseId:string,statusId:number): Observable<any> {
        let params = new HttpParams().set("tableName", "FunctionAndPackageMapping");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        // let now = new Date();

        var data = JSON.stringify({
            FunctionAndPackageMapping: {
                FunctionName: functionName, PackageId: packageId, Weightage: weightage, IsActive: true, CreatedBy: enterpriseId, CreateDttm: currentDate,UpdatedBy:enterpriseId, UpdatedDttm: currentDate,StatusId:statusId
            }

        });
        return this.http.post(environment.packageGetUrl, data, httpOptions)
            //this.http.get('../data/package.json')
            .map(data => {
                return data;
            });
    }


    public getPackageData(pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number): Observable<any> {
        let params = new HttpParams().set("tableName", "PackageDetails")
            .set("method", "BindPackageDetails")
            .set("pageNumber", pageNumber.toString())
            .set("sortColumn", sortColumn.toString())
            .set("sortDirection", sortDirection.toString())
            .set("pageSize", pageSize.toString());
        //var data = AuthService.getUserClaims(); 
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get(environment.packageGetUrl, httpOptions)
            //this.http.get('../data/package.json')
            .map(data => {
                return data;
            });
    }

    public getPackageDataByFilter(packageTypeIds: Array<number>, functionIds: Array<number>, frequencyIds: Array<number>
        , pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number,date:string): Observable<any> {
        let params = new HttpParams().set("tableName", "PackageDetails")
            .set("filterBy", "true")
            .set("method", "BindPackageDetailsOnFilter")
            .set("pageNumber", pageNumber.toString())
            .set("sortColumn", sortColumn)
            .set("sortDirection", sortDirection)
            .set("pageSize", pageSize.toString())
            .set("packageTypeIds", packageTypeIds != undefined ? packageTypeIds.toString() : "")
            .set("functionIds", functionIds != undefined ? functionIds.toString() : "")
            .set("frequencyIds", frequencyIds != undefined ? frequencyIds.toString() : "")
            .set("createdDate", date != "" ? date.toString() : "");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<any>(environment.packageGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getViewPackageData(packageTypeId: number, functionId: number, pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number): Observable<any> {
        return this.http.get('../data/package.json')
            .map(data => {
                return data;
            });
    }

    public getEditPackageData(packageTypeId: number, functionId: number, pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number): Observable<any> {
        return this.http.get('../data/package.json')
            .map(data => {
                return data;
            });
    }

    public insertIntoOlaMaster(functionId:number, frequencyId:number, txtOLAName:string, rdOptionalOLA, txtArtetacts:string, packageTypeId:number,enterpriseId:string): Observable<any> {
        let params = new HttpParams().set("tableName", "OLAMaster");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        rdOptionalOLA = rdOptionalOLA == "Yes" ? true : false;
        let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        var data = JSON.stringify({
            OLAMaster: {
                OLANm: txtOLAName, Artefacts: txtArtetacts, IsOptional: rdOptionalOLA, PackageId: packageTypeId, FunctionId: functionId, FrequencyId: frequencyId, IsActive: true, CreatedBy: enterpriseId, CreateDttm: currentDate, UpdatedBy: enterpriseId, UpdatedDttm: currentDate
            }

        });
        //console.log("Signed URL for upload : " + data);
        return this.http.post(environment.packageGetUrl, data, httpOptions);

    }

    public getOlaRecordsToDisplay(packageId: number, functionId: number, pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number): Observable<any> {
        let params = new HttpParams().set("tableName", "OlaMasterRecords")
            .set("filterBy", "True")
            .set("PackageId", packageId.toString())
            .set("FunctionId", functionId.toString())
            .set("pageNumber", pageNumber.toString())
            .set("sortColumn", sortColumn.toString())
            .set("sortDirection", sortDirection.toString())
            .set("pageSize", pageSize.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<any>(environment.packageGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public CheckFunctionName(functionName: string): Observable<any> {
        let params = new HttpParams().set("tableName", "CheckFunctionName")
            .set("FunctionName", functionName.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<any>(environment.packageGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public CheckWeigtage(functionName: string, packageId: number,functionId:number): Observable<any> {
        let params = new HttpParams().set("tableName", "CheckWeigtage")
            .set("FunctionName", functionName.toString())
            .set("PackageId", packageId.toString())
            .set("FunctionId", functionId.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<any>(environment.packageGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public CheckForMapping(packageId: number, functionName: string): Observable<any> {
        let params = new HttpParams().set("tableName", "PackageFunctionMappingExists")
            .set("FunctionName", functionName.toString())
            .set("PackageId", packageId.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<any>(environment.packageGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public GetFunctionByPackageDetails(packageTypeId: number): Observable<any> {
        let params = new HttpParams().set("tableName", "PackageFunctionById")
            .set("packageTypeId", packageTypeId.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<any>(environment.packageGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public UpdateFunction(packageId: number, functionId: number, weightage: number,enterprisedId:string): Observable<any> {
        let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        let params = new HttpParams().set("tableName", "WeightageUpdate")
            .set("method", "PackageFunctionMapping");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            PackageFunctionMapping: {
                PackageId: packageId, FunctionId: functionId, UpdatedDttm: currentDate, UpdatedBy: enterprisedId,Weightage:weightage
            }
        }
        );
        return this.http.put(environment.packageGetUrl, data, httpOptions);
    }

   public IncrementOlaCount(packageId: number, functionId: number, olaCount: number,enterprisedId:string): Observable<any> {
        let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        let params = new HttpParams().set("tableName", "UpdateOlaCount")
            .set("method", "PackageFunctionMapping");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            PackageFunctionMapping: {
                PackageId: packageId, FunctionId: functionId, UpdatedDttm: currentDate, UpdatedBy: enterprisedId,OlaCount:olaCount
            }
        }
        );
        return this.http.put(environment.packageGetUrl, data, httpOptions);
    }

    public CheckOptionalOla(packageId: number,functionId:number): Observable<any> {
        let params = new HttpParams().set("tableName", "OptionalOlaCheck")
            .set("PackageId", packageId.toString())
            .set("FunctionId", functionId.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<any>(environment.packageGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public updateOlaDetails(olaId:number,artefacts:string,olaName:string,enterprisedId:string):Observable<any>{
        let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        let params = new HttpParams().set("tableName", "OLAMaster");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            OlaMaster: {
                OlaName: olaName, Artefacts: artefacts, UpdatedDttm: currentDate, UpdatedBy: enterprisedId,OlaId:olaId
            }
        }
        );
        return this.http.put(environment.packageGetUrl, data, httpOptions);
    }

    public CreatePackageValidation(packageId):Observable<any>{
        let params = new HttpParams().set("tableName", "CreatePackageValidation")
        .set("packageId", packageId.toString());
    const httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': "application/json",
            'Authorization': "Bearer " + sessionStorage["access_token"]
        }),
        params: params
    };
    return this.http.get<any>(environment.packageGetUrl, httpOptions)
        .map(data => {
            return data;
        });
    }


    public UpdatePackage(packageId: number,enterprisedId:string): Observable<any> {
        let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        let params = new HttpParams().set("tableName", "Package")
            .set("method", "PackageFunctionMapping");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            PackageFunctionMapping: {
                PackageId: packageId, FunctionId: 1, UpdatedDttm: currentDate, UpdatedBy: enterprisedId
            }
        }
        );
        return this.http.put(environment.packageGetUrl, data, httpOptions);
    }

    public UpdatePackageCreate(packageId: number,enterprisedId:string): Observable<any> {
        let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        let params = new HttpParams().set("tableName", "createPackage")
            .set("method", "PackageFunctionMapping");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            PackageFunctionMapping: {
                PackageId: packageId, FunctionId: 1, UpdatedDttm: currentDate, UpdatedBy: enterprisedId
            }
        }
        );
        return this.http.put(environment.packageGetUrl, data, httpOptions);
    }

    public FunctionIdForOlaCreation(packageId:number):Observable<any>{
        let params = new HttpParams().set("tableName", "FunctionIdForOlaCreation")
        .set("packageId", packageId.toString());
    const httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': "application/json",
            'Authorization': "Bearer " + sessionStorage["access_token"]
        }),
        params: params
    };
    return this.http.get<any>(environment.packageGetUrl, httpOptions)
        .map(data => {
            return data;
        });
    }

    public SubmitPackageValidation(statusId: number,packageId:number): Observable<any> {
        let params = new HttpParams().set("tableName", "SubmitPackageValidation")
            .set("statusId", statusId.toString())
            .set("packageId",packageId.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<any>(environment.packageGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public PackageSubmission(packageId: number,enterprisedId:string,statusId:number): Observable<any> {
        let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        let params = new HttpParams().set("tableName", "updateStatus")
            .set("method", "PackageFunctionMapping");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            PackageFunctionMapping: {
                PackageId: packageId, FunctionId: 1, UpdatedDttm: currentDate, UpdatedBy: enterprisedId,StatusId:statusId
            }
        }
        );
        return this.http.put(environment.packageGetUrl, data, httpOptions);
    }



}
