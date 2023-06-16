import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';
import { configuration } from '../../../config/configuration';

@Injectable()
export class VendorService {

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

    public getVendorData(pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number, enterpriseId: string, PackageFacilityFilter: string, VendorIdFilter: string, transactionId : string): Observable<any> {
        let params = new HttpParams().set("table", "VendorDetails")
            .set("method", "getVendorData");
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
                , enterpriseId: enterpriseId, PackageFacilityFilter: PackageFacilityFilter, VendorIdFilter: VendorIdFilter, TransactionId: transactionId
            }
        }
        );
        return this.http.post(environment.scoreGetUrl, data, httpOptions);
    }

    public getVendorDataByFilter(transactionCode: string, packageTypeIds: Array<number>, facilityIds: Array<number>, vendorIds: Array<number>, statusIds: Array<number>
        , transactionDate: string, pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number, enterpriseId: string, PackageFacilityFilter: string
        , VendorIdFilter: string, MonthYearFilter: string, transactionId : string): Observable<any> {
        debugger;
        let params = new HttpParams().set("table", "VendorDetails")
            .set("method", "getVendorDataByFilter")
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
                facilityIds: facilityIds1, vendorIds: vendorIds1, transactionDate: transactionDate, statusIds: statusIds1
                , VendorIdFilter: VendorIdFilter, MonthYearFilter: MonthYearFilter, TransactionId: transactionId
            }
        }
        );
        return this.http.post(environment.scoreGetUrl, data, httpOptions);
    }

    public getSubmitScoreData(pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number, enterpriseId: string, facilityIds: Array<number>): Observable<any> {
        
        let params = new HttpParams().set("table", "VendorDetails")
            .set("filterBy", "true")
            .set("method", "getSubmitScoreData")
            .set("pageNumber", pageNumber.toString())
            .set("sortColumn", sortColumn)
            .set("sortDirection", sortDirection)
            .set("pageSize", pageSize.toString())
            .set("enterpriseId", enterpriseId)
            .set("facilityIds", "");
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

    public getSubmitScoreDataByFilter(transactionCode: string, packageTypeIds: Array<number>, facilityIds: Array<number>, vendorIds: Array<number>, statusIds: Array<number>
        , transactionDate: string, frequencyIds: Array<number>, pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number, enterpriseId: string, applicableFacilityIds: Array<number>): Observable<any> {
       
        let params = new HttpParams().set("table", "VendorDetails")
            .set("filterBy", "true")
            .set("method", "getSubmitScoreDataByFilter")
            .set("pageNumber", pageNumber.toString())
            .set("sortColumn", sortColumn)
            .set("sortDirection", sortDirection)
            .set("pageSize", pageSize.toString())
            .set("transactionCode", transactionCode)
            .set("packageTypeIds", packageTypeIds != undefined ? packageTypeIds.toString() : '')
            .set("facilityIds", facilityIds != undefined ? facilityIds.toString() : '')
            .set("vendorIds", vendorIds != undefined ? vendorIds.toString() : '')
            .set("transactionDate", transactionDate)
            .set("statusIds", statusIds != undefined ? statusIds.toString() : '')
            .set("enterpriseId", enterpriseId)
            .set("applicableFacilityIds", "");
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

    saveRemarks(TransactionId: number, RemarkDesc: string, enterpriseId: string, currentDate: string, remarksBy: string): Observable<any> {
        let params = new HttpParams().set("table", "Remarks");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            Remarks: {
                TransactionId: TransactionId, RemarkDesc: RemarkDesc, RemarkBy: remarksBy //RemarkBy: "Vendor"
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
            //.set("roleName", "Vendor");
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

    searchTransaction(term: string, PackageFacilityFilter: string, vendorIds: string): Observable<string[]> {
        //debugger;
        if (term === '') {
            return of([]);
        }
        let params = new HttpParams().set("table", "Transaction")
            .set("filterBy", "true")
            .set("method", "searchTransactionForVendor")
            .set("transactionRefNo", term)
            .set("PackageFacilityFilter", PackageFacilityFilter)
            .set("vendorIds", vendorIds);
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
}
