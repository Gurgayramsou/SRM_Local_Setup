import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';
import { configuration } from '../../../config/configuration';


@Injectable()
export class ApprovalService {

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

    public getApprovalData(pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number, enterpriseId: string, PackageFacilityFilter: string, transactionId : string): Observable<any> {
        let params = new HttpParams().set("table", "ApprovalDetails")
            .set("method", "getApprovalData");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            Transaction: {
                pageNumber: pageNumber, sortColumn: sortColumn, sortDirection: sortDirection, pageSize: pageSize
                , enterpriseId: enterpriseId, PackageFacilityFilter: PackageFacilityFilter, TransactionId: transactionId
            }
        }
        );
        return this.http.post(environment.scoreGetUrl, data, httpOptions);
    }

    public getApprovalDataByFilter(transactionCode: string, packageTypeIds: Array<number>, facilityIds: Array<number>, vendorIds: Array<number>, statusIds: Array<number>
        , transactionDate: string, pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number, enterpriseId: string, PackageFacilityFilter: string
        , MonthYearFilter: string, transactionId : string): Observable<any> {
        debugger;
        let params = new HttpParams().set("table", "ApprovalDetails")
            .set("method", "getApprovalDataByFilter")
        let packageTypeIds1 = packageTypeIds != undefined ? packageTypeIds.toString() : '';
        let facilityIds1 = facilityIds != undefined ? facilityIds.toString() : '';
        let vendorIds1 = vendorIds != undefined ? vendorIds.toString() : '';
        let statusIds1 = statusIds != undefined ? statusIds.toString() : '';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            Transaction: {
                pageNumber: pageNumber, sortColumn: sortColumn, sortDirection: sortDirection, pageSize: pageSize, enterpriseId: enterpriseId
                , PackageFacilityFilter: PackageFacilityFilter, transactionCode: transactionCode, packageTypeIds: packageTypeIds1,
                facilityIds: facilityIds1, vendorIds: vendorIds1, transactionDate: transactionDate, statusIds: statusIds1,
                MonthYearFilter: MonthYearFilter, TransactionId: transactionId
            }
        }
        );
        return this.http.post(environment.scoreGetUrl, data, httpOptions);
    }

    saveRemarks(TransactionId: number, RemarkDesc: string, enterpriseId: string, currentDate: string, remarksBy: string): Observable<any> {
        let params = new HttpParams().set("table", "Remarks")
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            Remarks: {
                TransactionId: TransactionId, RemarkDesc: RemarkDesc, RemarkBy: remarksBy //RemarkBy: "ZL/SDL"
                , CreatedBy: enterpriseId, CreateDttm: currentDate, UpdatedBy: enterpriseId, UpdatedDttm: currentDate
            }
        }
        );
        return this.http.post(environment.scoreGetUrl, data, httpOptions);
    }

    saveRemarksBulk(PackageId: number, VendorId: number, FacilityId: number, TransactionDate: string, RemarkDesc: string, enterpriseId: string, currentDate: string, remarksBy: string): Observable<any> {
        let params = new HttpParams().set("table", "saveRemarksBulk");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            Remarks: {
                PackageId: PackageId, VendorId: VendorId, FacilityId: FacilityId, TransactionDate: TransactionDate, RemarkDesc: RemarkDesc,
                RemarkBy: remarksBy, CreatedBy: enterpriseId, CreateDttm: currentDate, UpdatedBy: enterpriseId, UpdatedDttm: currentDate
            }
        }
        );
        return this.http.post(environment.scoreGetUrl, data, httpOptions);
    }

    updateTransactionStatus(TransactionId: number, statusId: any): Observable<any> {
        let params = new HttpParams().set("table", "Transaction")
            .set("method", "updateTransactionStatus");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            Transaction: {
                TransactionId: TransactionId, StatusId: statusId
            }
        }
        );
        return this.http.put(environment.scoreGetUrl, data, httpOptions);
    }

    updateTransactionStatusBulk(PackageId: number, VendorId: number, FacilityId: number, TransactionDate: string, statusId: any): Observable<any> {
        let params = new HttpParams().set("table", "Transaction")
            .set("method", "updateTransactionStatusBulk");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            Transaction: {
                PackageId: PackageId, VendorId: VendorId, FacilityId: FacilityId, TransactionDate: TransactionDate, StatusId: statusId
            }
        }
        );
        return this.http.put(environment.scoreGetUrl, data, httpOptions);
    }

    getRemarks(TransactionId: number, remarksBy:string): Observable<any> {
        let params = new HttpParams().set("table", "Remarks")
            .set("method", "getRemarks")
            .set("TransactionId", TransactionId.toString())
            .set("roleName", remarksBy);
            //.set("roleName", "ZL/SDL");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<any>(environment.scoreGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }


    public getPerforamanceDataByFilter(transactionCode: string, packageTypeIds: Array<number>, facilityIds: Array<number>, vendorIds: Array<number>, statusIds: Array<number>
        , transactionDate: string, pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number, enterpriseId: string
        , MonthYearFilter: string): Observable<any> {
        debugger;
        let params = new HttpParams().set("table", "DashBoardDetails")
            .set("method", "getPerforamanceDataByFilter")
        let packageTypeIds1 = packageTypeIds != undefined ? packageTypeIds.toString() : '';
        let facilityIds1 = facilityIds != undefined ? facilityIds.toString() : '';
        let vendorIds1 = vendorIds != undefined ? vendorIds.toString() : '';
        let statusIds1 = statusIds != undefined ? statusIds.toString() : '';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            Transaction: {
                pageNumber: pageNumber, sortColumn: sortColumn, sortDirection: sortDirection, pageSize: pageSize, enterpriseId: enterpriseId
                , transactionCode: transactionCode, packageTypeIds: packageTypeIds1,
                facilityIds: facilityIds1, vendorIds: vendorIds1, transactionDate: transactionDate, statusIds: statusIds1,
                MonthYearFilter: MonthYearFilter
            }
        }
        );
        return this.http.post(environment.scoreGetUrl, data, httpOptions);
    }

    public getDashboardData(pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number, enterpriseId: string): Observable<any> {
        let params = new HttpParams().set("table", "DashBoardDetails")
            .set("method", "getDashBoardData");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            Transaction: {
                pageNumber: pageNumber, sortColumn: sortColumn, sortDirection: sortDirection, pageSize: pageSize
                , enterpriseId: enterpriseId
            }
        }
        );
        return this.http.post(environment.scoreGetUrl, data, httpOptions);
    }

    searchTransaction(term: string, PackageFacilityFilter: string): Observable<string[]> {
        //debugger;
        if (term === '') {
            return of([]);
        }
        let params = new HttpParams().set("table", "Transaction")
            .set("filterBy", "true")
            .set("method", "searchTransactionForApproval")
            .set("transactionRefNo", term)
            .set("PackageFacilityFilter", PackageFacilityFilter);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        const data = this.http.get<string[]>(environment.scoreGetUrl, httpOptions)
            .map(data => {
                return data;
            });
        return data;
    }

    saveRemarksByAdmin(TransactionId: number, RemarkDesc: string, enterpriseId: string, currentDate: string, remarksBy: string): Observable<any> {
        let params = new HttpParams().set("table", "Remarks")
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            Remarks: {
                TransactionId: TransactionId, RemarkDesc: RemarkDesc, RemarkBy: remarksBy  //"SRM Admin"
                , CreatedBy: enterpriseId, CreateDttm: currentDate, UpdatedBy: enterpriseId, UpdatedDttm: currentDate
            }
        }
        );
        return this.http.post(environment.scoreGetUrl, data, httpOptions);
    }

    enableTransactionByAdmin(TransactionId: number): Observable<any> {
        let params = new HttpParams().set("table", "Transaction")
            .set("method", "enableTransactionByAdmin");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            Transaction: {
                TransactionId: TransactionId, IsEditable : true
            }
        }
        );
        return this.http.put(environment.scoreGetUrl, data, httpOptions);
    }
}
