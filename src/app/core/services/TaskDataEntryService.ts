import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import 'rxjs/add/operator/map';
import { formatDate } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable()
export class TaskDataEntryService {

    public authorizationUrl: string = '';
    today = new Date();
    jstoday = '';

    constructor(private http: HttpClient) {
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


    public getTaskMasterData(UniqueId: string, TaskIds: string, FacilityId: string, TowerId: string, FrequencyId: string
        , TrafficId: string, ApplicableFacilityId: string): Observable<any> {
        let params = new HttpParams().set("tableName", "TaskTransaction")
            .set("method", "getTask");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            TaskDetails: {
                UniqueId: UniqueId, TaskIds: TaskIds, FacilityId: FacilityId, TowerId: TowerId, FrequencyId: FrequencyId
                , TrafficId: TrafficId, ApplicableFacilityId: ApplicableFacilityId
            }
        });
        return this.http.post(environment.taskGetUrl, data, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getTaskDetailsData(pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number, TaskIds: string
        , ServiceProviderId: string, DutyManagerName: string, TransactionDate: string): Observable<any> {
        let params = new HttpParams().set("table", "TaskTransaction")
            .set("method", "getTaskMainPage");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            TaskDetails: {
                pageNumber: pageNumber, sortColumn: sortColumn, sortDirection: sortDirection, pageSize: pageSize, TaskIds: TaskIds
                , ServiceProviderId: ServiceProviderId, DutyManagerName: DutyManagerName, TransactionDate: TransactionDate
            }
        });
        return this.http.post(environment.scoreGetUrl, data, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getTaskDataByFilter(countryIds: Array<number>, cityIds: Array<number>, facilityIds: Array<number>, trafficIds: Array<number>
        , frequencyIds: Array<number>, pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number): Observable<any> {
        return this.http.get('../data/data.json')
            .map(data => {
                return data;
            });
    }

    searchTask(term: string, facilityIds: string): Observable<string[]> {
        debugger;
        if (term === '') {
            return of([]);
        }
        let params = new HttpParams().set("tableName", "Task")
            .set("filterBy", "true")
            .set("method", "searchTask")
            .set("taskCode", term)
            .set("facilityIds", facilityIds)
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        const data = this.http.get<string[]>(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
        return data;
    }


    public getTaskDetails(facilityId: number, towerId: number, floorId: number,month:number,year:number): Observable<any> {
        debugger;
        let params = new HttpParams().set("tableName", "Task")
            .set("filterBy", "true")
            .set("method", "getTaskDetails")
            .set("facilityId", facilityId.toString())
            .set("towerId", towerId.toString())
            .set("floorId", floorId.toString())
            .set("month", month.toString())
            .set("year", year.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public saveTask(taskIds: string, serviceProviderId: number, dutyManagerName: string, transactionDate: string, enterPriseID: string, date: string): Observable<any> {
        debugger;
        let params = new HttpParams().set("table", "TaskDetails");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            TaskDetails: {
                TaskId: taskIds, ServiceProviderId: serviceProviderId, DutyManagerNm: dutyManagerName, TransactionDt: transactionDate
                , IsActive: true, CreatedBy: enterPriseID, CreateDttm: date, UpdatedBy: enterPriseID, UpdatedDttm: date
            }
        }
        );
        //console.log("Signed URL for upload : " + data);
        return this.http.post(environment.scoreGetUrl, data, httpOptions);
    }

    public getTask(taskIds: string, serviceProviderId: number, dutyManagerName: string, transactionDate: string): Observable<any> {
        let params = new HttpParams().set("table", "TaskTransaction")
            .set("method", "getTask");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            TaskDetails: {
                TaskIds: taskIds, ServiceProviderId: serviceProviderId, DutyManagerName: ""
                , TransactionDate: transactionDate
            }
        }
        );
        return this.http.post(environment.scoreGetUrl, data, httpOptions)
            .map(data => {
                return data;
            });
    }

    public downloadTaskMasterData(facilityIds: string): Observable<any> {
        let params = new HttpParams().set("tableName", "DownloadTaskByFacility")
            .set("facilityIds", facilityIds);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };

        return this.http.get(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }
}
