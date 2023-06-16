import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import 'rxjs/add/operator/map';
import { map } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { environment } from '../../../environments/environment';
import { DatePipe } from '@angular/common'
import { configuration } from '../../../config/configuration';

@Injectable()
export class ScoreService {

    public authorizationUrl: string = '';
    today = new Date();
    jstoday = '';
    constructor(private http: HttpClient, private datepipe: DatePipe) {
        console.log('ScoreService');
        this.jstoday = formatDate(this.today, 'dd-MM-yyyy hh:mm:ss a', 'en-US', '+0530');
        // if (location.href.toLocaleLowerCase().indexOf("local") != -1) {
        //     this.authorizationUrl = environment.authorizationLocal;
        // }
        // else {
        //     this.authorizationUrl = sessionStorage["access_token"];
        //     console.log("dev authorization" + this.authorizationUrl);
        // }
    }

    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': "application/json",
            'Authorization': "Bearer " + sessionStorage["access_token"]
        })
    };

    public getSubmitScoreData(pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number, enterpriseId: string, PackageFacilityFilter: string): Observable<any> {
        let params = new HttpParams().set("table", "SubmitScoreDetails")
            .set("method", "getSubmitScoreData");
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
                , enterpriseId: enterpriseId, PackageFacilityFilter: PackageFacilityFilter
            }
        }
        );
        return this.http.post(environment.scoreGetUrl, data, httpOptions);
    }

    public getSubmitScoreDataByFilter(transactionCode: string, packageTypeIds: Array<number>, facilityIds: Array<number>, vendorIds: Array<number>, statusIds: Array<number>
        , transactionDate: string, pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number, enterpriseId: string
        , PackageFacilityFilter: string, MonthYearFilter: string): Observable<any> {
        debugger;
        let params = new HttpParams().set("table", "SubmitScoreDetails")
            .set("method", "getSubmitScoreDataByFilter")
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
                , MonthYearFilter: MonthYearFilter
            }
        }
        );
        return this.http.post(environment.scoreGetUrl, data, httpOptions);
    }

    //Get All Fequecny details for a Package
    public getFrequencyDetialsByPackage(packageTypeId: number): Observable<FrequencyDetails[]> {
        let params = new HttpParams().set("tableName", "PackageFrequency")
            .set("packageTypeId", packageTypeId.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<FrequencyDetails[]>(environment.packageGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    //Get Comma Separated Frequency for a Package
    public getFrequencyByPackage(packageTypeId: number): Observable<any> {
        let params = new HttpParams().set("tableName", "AllFrequencyByPackage")
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

    //Get Fequecny details from FrequencySLAs Table based on Date
    public getFrequencyDetialsByCurrentDate(date: string): Observable<any> {
        let params = new HttpParams().set("table", "FrequencySLAs")
            .set("filterBy", "true")
            .set("method", "getFrequencyDetialsByCurrentDate")
            .set("date", date);
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
        // return this.http.get<FrequencyDetails[]>('../data/frequency.json')
        //     .map(data => {
        //         return data;
        //     });
    }
   
    //Get Fequecny details from FrequencySLAs Table based on Date
    public getFrequencyDetialsByDate(periodDate: string): Observable<any> {
        let params = new HttpParams().set("table", "FrequencySLAs")
            .set("filterBy", "true")
            .set("method", "getFrequencyDetialsByDate")
            .set("date", periodDate);
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
        // return this.http.get<FrequencyDetails[]>('../data/frequency.json')
        //     .map(data => {
        //         return data;
        //     });
    }

    //Get Missed Transaction Date based on Package
    public getMissedTransactionDate(packageTypeId: number, facilityId: number, vendorId: number): Observable<any> {
        let params = new HttpParams().set("table", "TransactionMissed")
            .set("filterBy", "true")
            .set("method", "getMissedTransactionDate")
            .set("packageTypeId", packageTypeId.toString())
            .set("facilityId", facilityId.toString())
            .set("vendorId", vendorId.toString());
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
    
    //Get Function and OLA details for a Package and Frequency
    public getFunctionOLADetials(packageTypeId: number, frequecyId: number): Observable<any> {
        let params = new HttpParams().set("tableName", "FunctionOLA")
            .set("packageTypeId", packageTypeId.toString())
            .set("frequencyId", frequecyId.toString());
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
        // return this.http.get<any>('../data/createScore.json')
        //     .map(data => {
        //         return data;
        //     });
    }

    //Get Transaction
    public getTransaction(packaeId: number, vendorId: number, facilityId: number, periodDate: string): Observable<any> {
        debugger;
        let params = new HttpParams().set("table", "Transaction")
            .set("filterBy", "true")
            .set("method", "getTransaction")
            .set("packaeId", packaeId.toString())
            .set("vendorId", vendorId.toString())
            .set("facilityId", facilityId.toString())
            .set("periodDate", periodDate.toString());
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

    //Get TransactionCode
    public getTransactionCode(transactionId: number): Observable<any> {
        let params = new HttpParams().set("table", "Transaction")
            .set("filterBy", "true")
            .set("method", "getTransactionCode")
            .set("transactionId", transactionId.toString());
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

    //Get TransactionStatus
    public getTransactionStatus(transactionId: number): Observable<any> {
        let params = new HttpParams().set("table", "Transaction")
            .set("filterBy", "true")
            .set("method", "getTransactionStatus")
            .set("transactionId", transactionId.toString());
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

    //Get Transaction Details
    public getTransactionDetials(transactionId: number): Observable<any> {
        let params = new HttpParams().set("table", "TransactionDetails")
            .set("filterBy", "true")
            .set("method", "getTransactionDetials")
            .set("transactionId", transactionId.toString());
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

    public getSubmitScoreDetials(transactionId: number, pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number): Observable<any> {
        let params = new HttpParams().set("table", "TransactionDetails")
            .set("filterBy", "true")
            .set("method", "getTransactionDetials")
            .set("transactionId", transactionId.toString());
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
        // return this.http.get<any>('../data/createScore.json')
        //     .map(data => {
        //         return data;
        //     });
    }

    public getScoreCard(transactionId: number): Observable<any> {
        let params = new HttpParams().set("table", "TransactionDetails")
            .set("filterBy", "true")
            .set("method", "getScoreCard")
            .set("transactionId", transactionId.toString());
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

    public getMonthlyScoreCard(TransactionId: number, ServiceProviderId: number, PackageId: number, FacilityId: number, TransactionStartDt: string, TransactionEndDt: string): Observable<any> {
        let params = new HttpParams().set("table", "TransactionDetails")
            .set("filterBy", "true")
            .set("method", "getMonthlyScoreCard")
            .set("ServiceProviderId", ServiceProviderId.toString())
            .set("PackageId", PackageId.toString())
            .set("FacilityId", FacilityId.toString())
            .set("TransactionStartDt", TransactionStartDt)
            .set("TransactionEndDt", TransactionEndDt)
            .set("TransactionId", TransactionId.toString());
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

    public getMonthlyScoreCardEdit(TransactionId: number, ServiceProviderId: number, PackageId: number, FacilityId: number, TransactionStartDt: string, TransactionEndDt: string): Observable<any> {
        let params = new HttpParams().set("table", "TransactionDetails")
            .set("filterBy", "true")
            .set("method", "getMonthlyScoreCardEdit")
            .set("ServiceProviderId", ServiceProviderId.toString())
            .set("PackageId", PackageId.toString())
            .set("FacilityId", FacilityId.toString())
            .set("TransactionStartDt", TransactionStartDt)
            .set("TransactionEndDt", TransactionEndDt)
            .set("TransactionId", TransactionId.toString());
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

    public getFunctionDetials(packageTypeId: number): Observable<any> {
        let params = new HttpParams().set("tableName", "PackageFunction")
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

    public getPenaltyByPackage(serviceProviderId: number, packageTypeId: number, TotalWeightageScore: number): Observable<any> {
        let params = new HttpParams().set("table", "Penalty")
            .set("filterBy", "true")
            .set("method", "getPenaltyByPackage")
            .set("serviceProviderId", serviceProviderId.toString())
            .set("packageTypeId", packageTypeId.toString())
            .set("TotalWeightageScore", TotalWeightageScore.toString());
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
    // search(term: string): Observable<string[]> {
    //     debugger;
    //     if (term === '') {
    //         return of([]);
    //     }
    //     // return this.http.get(WIKI_URL, {params: PARAMS.set('search', term)}).pipe(
    //     //     map(response => response[1])
    //     //   );
    //     const data = this.http.get<string[]>('../data/packaeId.json')
    //         .map(data => {
    //             return data;
    //         });
    //     return data;
    //     //return states;
    // }

    searchTransaction(term: string, PackageFacilityFilter: string): Observable<string[]> {
        //debugger;
        if (term === '') {
            return of([]);
        }
        let params = new HttpParams().set("table", "Transaction")
            .set("filterBy", "true")
            .set("method", "searchTransaction")
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
    public getMonthYear():Observable<any>{
        debugger;
        let currentdate = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
        let params = new HttpParams().set("table", "GetMonthtYear")
        .set('currentdate',currentdate.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params:params
        };
        return this.http.get(environment.scoreGetUrl,httpOptions)
        .map(data => {
            return data;
        });
    }
    saveTransaction(transactionRefNo: string, packageTypeId: number, vendorId: number, facilityId: number, statusId: number, periodDate: string, TransactionDetails: any, EnterpriseId: string): Observable<any> {
        debugger;
        let params = new HttpParams().set("table", "Transaction");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        var data = JSON.stringify({
            Transaction: {
                TransactionRefNo: transactionRefNo, PackageId: packageTypeId, ServiceProviderId: vendorId, FacilityId: facilityId
                , StatusId: statusId, TransactionDt: periodDate, IsEditable: true, CreatedBy: EnterpriseId
                , CreateDttm: currentDate, UpdatedBy: EnterpriseId, UpdatedDttm: currentDate, TransactionDetails: TransactionDetails
            }
        }
        );
        return this.http.post(environment.scoreGetUrl, data, httpOptions);
    }

    updateTransaction(TransactionId: number, statusId: any, enterpriseId: string, currentDate: string): Observable<any> {
        let params = new HttpParams().set("table", "Transaction")
            .set("method", "updateTransaction");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            Transaction: {
                TransactionId: TransactionId, StatusId: statusId, IsEditable: false, UpdatedBy: enterpriseId, UpdatedDttm: currentDate
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

    updateTransactionCode(TransactionId: number, TransactionCode: string, enterpriseId: string, currentDate: string): Observable<any> {
        let params = new HttpParams().set("table", "Transaction")
            .set("method", "updateTransactionCode");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            Transaction: {
                TransactionId: TransactionId, TransactionCode: TransactionCode, IsEditable: true, UpdatedBy: enterpriseId, UpdatedDttm: currentDate
            }
        }
        );
        return this.http.put(environment.scoreGetUrl, data, httpOptions);
    }


    saveTransactionDetails(TransactionId: number, TransactionDetails: any): Observable<any> {
        let params = new HttpParams().set("table", "TransactionDetails");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            TransactionDetails: TransactionDetails
        }
        );
        return this.http.post(environment.scoreGetUrl, data, httpOptions);
    }

    updateTransactionDetails(TransactionId: number, TransactionDetails: any): Observable<any> {
        let params = new HttpParams().set("table", "TransactionDetails");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            TransactionDetails: TransactionDetails
        }
        );
        return this.http.put(environment.scoreGetUrl, data, httpOptions);
    }

    saveTransactionAuditLog(TransactionId: number): Observable<any> {
        let params = new HttpParams().set("table", "TransactionAuditLog");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            Transaction: {
                TransactionId: TransactionId
            }
        }
        );
        return this.http.post(environment.scoreGetUrl, data, httpOptions);
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
                TransactionId: TransactionId, RemarkDesc: RemarkDesc, RemarkBy: remarksBy //RemarkBy: "JLL"
                , CreatedBy: enterpriseId, CreateDttm: currentDate, UpdatedBy: enterpriseId, UpdatedDttm: currentDate
            }
        }
        );
        return this.http.post(environment.scoreGetUrl, data, httpOptions);
    }

    getRemarks(TransactionId: number, remarksBy:string): Observable<any> {
        let params = new HttpParams().set("table", "Remarks")
            .set("method", "getRemarks")
            .set("TransactionId", TransactionId.toString())
            .set("roleName", remarksBy);
           // .set("roleName", "JLL");
           
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

    getRemarksDetails(TransactionId: number): Observable<any> {
        let params = new HttpParams().set("table", "Remarks")
            .set("method", "getRemarksDetails")
            .set("TransactionId", TransactionId.toString());
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

    getTransactionAuditLogByTransactionId(TransactionId: number): Observable<any> {
        let params = new HttpParams().set("table", "TransactionAuditLog")
            .set("method", "getTransactionAuditLogByTransactionId")
            .set("TransactionId", TransactionId.toString());
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

    getTaskDetailsByVendor(vendorId: number, date: string): Observable<any> {
        let params = new HttpParams().set("table", "TaskDetails")
            .set("filterBy", "true")
            .set("method", "getTaskDetailsByVendor")
            .set("serviceProviderId", vendorId.toString())
            .set("date", date);
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

    getTaskMasterByFacility(facilityId: number,month:number,year:number): Observable<any> {
        let params = new HttpParams().set("tableName", "Task")
            .set("filterBy", "true")
            .set("method", "getTaskMasterByFacility")
            .set("facilityId", facilityId.toString())
            .set("month", month.toString())
            .set("year", year.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<any>(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    getWCFacilityWise(facilityId: number): Observable<any> {
        let params = new HttpParams().set("tableName", "WCFacilityWise")
            .set("facilityId", facilityId.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<any>(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    getAchivedData(facilityID: number, ServiceproviderId: number,monthstart:number,yearstart:number): Observable<any> {
        debugger;
        let params = new HttpParams().set("table", "GetAchievedData")
            .set("FacilityAliasID",facilityID.toString() )
            .set("YearStart", yearstart.toString())
            .set("ServiceProviderID", ServiceproviderId.toString())
            .set("MonthStart", monthstart.toString());
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

    getWCFacilityTowerWise(facilityId: number,month:number,year:number): Observable<any> {
        let params = new HttpParams().set("tableName", "WCFacilityTowerWise")
            .set("facilityId", facilityId.toString())
            .set("month", month.toString())
            .set("year", year.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<any>(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }
    getWCFacilityTowerTaskWise(facilityId: number, TaskId: Array<number>): Observable<any> {
        debugger;
        let params = new HttpParams().set("tableName", "WCFacilityTowerTaskWise")
        //.set("facilityId", facilityId.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            Task: {
                TaskIds: TaskId.toString(), FacilityId: facilityId
            }
        });
        // return this.http.get<any>(environment.taskGetUrl, httpOptions)
        //     .map(data => {
        //         return data;
        //     });
        return this.http.post(environment.taskGetUrl, data, httpOptions);
    }
    
    getUnitPriceWC(serviceProviderId: number): Observable<any> {
        let params = new HttpParams().set("table", "UnitPrice")
            .set("method", "UnitPriceWC")
            .set("serviceProviderId", serviceProviderId.toString());
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
    getTaskIds(serviceProviderId: number, TransactionDt: string): Observable<any> {
        let params = new HttpParams().set("table", "TaskDetails")
            .set("filterBy", "true")
            .set("method", "getTaskIds")
            .set("serviceProviderId", serviceProviderId.toString())
            .set("TransactionDt", TransactionDt);
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

    public getStatusForEntireMonth(PackageId: number,ServiceProviderId: number,FacilityId: number,TransactionDt: string, TransactionId: number): Observable<any> {
        let params = new HttpParams().set("table", "getStatusForEntireMonth")
        .set("PackageId", PackageId.toString())
        .set("ServiceProviderId", ServiceProviderId.toString())
        .set("FacilityId", FacilityId.toString())
        .set("TransactionDt", TransactionDt)
        .set("TransactionId", TransactionId.toString());
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

    public getDraftStatus(): Observable<any> {
        let params = new HttpParams().set("table", "Status")
            .set("filterBy", "true")
            .set("StatusNm", "Draft");
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

    public CheckIsScoreSubmittedForSelectedDates(DatesSelected: Array<string>, packageId: number, facilityId: number): Observable<any> {
        let params = new HttpParams().set("table", "CheckIsScoreSubmittedForSelectedDates")
            .set("DatesSelected", DatesSelected != undefined ? DatesSelected.toString() : '')
            .set("PackageId", packageId.toString())
            .set("FacilityId", facilityId.toString());

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
    public CheckIsScoreAlreadyEnabledForSelectedDates(DatesSelected: Array<string>, packageId: number, facilityId: number): Observable<any> {
        let params = new HttpParams().set("table", "CheckIsScoreAlreadyEnabledForSelectedDates")
            .set("DatesSelected", DatesSelected != undefined ? DatesSelected.toString() : '')
            .set("PackageId", packageId.toString())
            .set("FacilityId", facilityId.toString());

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
    

    public EnableTransactioMissedDates(DatesSelected: Array<string>, enterpriseId: string, packageId: number, facilityId: number): Observable<any> {
        let params = new HttpParams().set("table", "CheckIsScoreSubmittedForSelectedDates")
            .set("DatesSelected", DatesSelected.toString());
        let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            TransactionMissed: {
                updateBy: enterpriseId, updateddttm: currentDate, IsActive: true, PackageId: packageId, FacilityId: facilityId
            }
        }
        );
        return this.http.put(environment.scoreGetUrl, data, httpOptions);
    }
    searchTransactionDashBoard(term: string): Observable<string[]> {
        //debugger;
        if (term === '') {
            return of([]);
        }
        let params = new HttpParams().set("table", "Transaction")
            .set("filterBy", "true")
            .set("method", "searchTransactionForDashBoard")
            .set("transactionRefNo", term);
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
    public getMonthlyScore(): Observable<any> {
        let params = new HttpParams().set("table","MonthlyScore")
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
    public getWCFacilityTowerFloorTaskWise(facilityId: number, TaskId: Array<number>): Observable<any> {
        let params = new HttpParams().set("tableName", "FloorwiseTask")
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            Task: {
                TaskIds: TaskId.toString(), FacilityId: facilityId
            }
        });
        return this.http.post(environment.taskGetUrl, data, httpOptions);
    }
    public getPenaltyStructureByPackageIdvendorId(serviceProviderId: number,packageTypeId: number): Observable<any> {
        let params = new HttpParams().set("table", "PenaltyStructure")
            .set("ServiceProviderId", serviceProviderId.toString())
            .set("PackageId", packageTypeId.toString())
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
    public getPenaltyByFunctionPackage(serviceProviderId: number, packageTypeId: number, packagedetails:any): Observable<any> {
        debugger;
        let params = new HttpParams().set("table", "PenaltyOfWellness")
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            Packagedetails: {
                serviceProviderId: serviceProviderId, packageTypeId: packageTypeId, packagedetails: packagedetails
                }
        });
        return this.http.post(environment.scoreGetUrl, data, httpOptions);
    }
}
const WIKI_URL = 'https://en.wikipedia.org/w/api.php';
const PARAMS = new HttpParams({
    fromObject: {
        action: 'opensearch',
        format: 'json',
        origin: '*'
    }
});
const states = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'District Of Columbia', 'Federated States Of Micronesia', 'Florida', 'Georgia',
    'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
    'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
    'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
    'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island',
    'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Islands', 'Virginia',
    'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

export class ScoreData {
    packageId: number;
    packageCode: string;
    facility: string;
    facilityId: number;
    monthYear: string;
    status: string;
    vendor: string;
    date: string;
}

export class FrequencyDetails {
    frequencyId: number;
    frequencyName: string;
    isDraftAllowed: string;
}

export class CreateScoreDetails {
    totalRecordCount: number;
    transactionDetialId: number;
    functionId: number;
    functionName: string;
    olaId: string;
    olaName: string;
    ratingMet: boolean;
    ratingNotMet: boolean;
    ratingNA: boolean;
}