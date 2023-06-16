import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable,of } from 'rxjs';
import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';
import { formatDate, DatePipe } from '@angular/common';

@Injectable()
export class TaskMasterService {
    public authorizationUrl: string = '';
    constructor(private http: HttpClient, private datePipe : DatePipe) {
        // if (location.href.toLocaleLowerCase().indexOf("local") != -1) {
        //     this.authorizationUrl = environment.authorizationLocal;
        // }
        // else {
        //     this.authorizationUrl = sessionStorage["access_token"];
        //     console.log("dev authorization" + this.authorizationUrl);
        // }
    }
    
    public getActivetask(facilityid:number,towerId:number,floorId:number,month:number,year:number):Observable<any>{
        debugger;
        let params = new HttpParams().set("tableName", "GetDataForActive")
        .set("method", "GetTaskMasterDetails")
        .set("facilityid",facilityid.toString())
        .set("towerId",towerId.toString())
        .set("floorId",floorId.toString())
        .set("month",month.toString())
        .set("year",year.toString())
    const httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': "application/json",
            'Authorization': "Bearer " + sessionStorage["access_token"]
        }),
        params:params
    };
    //let headers = new HttpHeaders().set("")
   

    return this.http.get(environment.taskGetUrl,httpOptions)
        .map(data => {
            return data;
        });
    }

    public MapTask(Selectedids:any,month:number,year:number):Observable<any>{
        debugger;
        let params = new HttpParams().set("tableName", "TaskMonthYearMapping")
    const httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': "application/json",
            'Authorization': "Bearer " + sessionStorage["access_token"]
        }),
        params:params
    };
    var data = JSON.stringify({
        TaskMaster: {
          Taskids: Selectedids,month:month,year:year
        }
  
      });
      //console.log("Signed URL for upload : " + data);
      return this.http.post(environment.taskGetUrl, data, httpOptions); 
    }
    public CheckTaskYearMonthMappingExists(activeFacilityId:number,activeTowerId:number,activeFloorID:number,month:number,year:number):Observable<any>{
         let params = new HttpParams().set("tableName", "CheckTaskMonthYearMapping")
        .set("FacilityId",activeFacilityId.toString())
        .set("TowerId",activeTowerId.toString())
        .set("FloorId",activeFloorID.toString())
        .set("Month",month.toString())
        .set("Year",year.toString())
    const httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': "application/json",
            'Authorization': "Bearer " + sessionStorage["access_token"]
        }),
        params:params
    };
     return this.http.get(environment.taskGetUrl,httpOptions)
    .map(data => {
        return data;
    });
    }
    
    public saveTaskMasterData(facilityId:number,cityId:number,countryId:number,txtUniqueId:string,trafficId:number,towerId:number,floorId:number,txtLocation:string,frequencyId:number,txtWorkType:string,txtArea:string,enterPriseId:string): Observable<any> {
        let params = new HttpParams().set("tableName", "GetTaskMasterDetailsOnLoad");
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': "application/json",
              'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params:params
          };
          let currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
          var data = JSON.stringify({
            TaskMaster: {
              TaskCd: txtUniqueId,Location:txtLocation,WorkType:txtWorkType,Area:txtArea,FacilityId:facilityId,TowerId:towerId,FloorId:floorId,TrafficTypeId:trafficId,FrequencyId:frequencyId,IsActive:true,CreatedBy:enterPriseId,CreateDttm:currentDate,UpdatedBy:enterPriseId,UpdatedDttm:currentDate
            }
      
          });
          //console.log("Signed URL for upload : " + data);
          return this.http.post(environment.taskGetUrl, data, httpOptions); 
      
    }
    public getTaskMasterData(pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number): Observable<any> {
        let params = new HttpParams().set("tableName", "GetTaskMasterDetailsOnLoad")
            .set("method", "GetTaskMasterDetails")
            .set("pageNumber", pageNumber.toString())
            .set("sortColumn", sortColumn.toString())
            .set("sortDirection", sortDirection.toString())
            .set("pageSize", pageSize.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params:params
        };
        //let headers = new HttpHeaders().set("")
       

        return this.http.get(environment.taskGetUrl,httpOptions)
            .map(data => {
                return data;
            });
    }

    public getTaskMasterDataByFilter(countryIds: Array<number>, cityIds: Array<number>, facilityIds: Array<number>, trafficIds: Array<number>
        , frequencyIds: Array<number>, pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number,searchString:string, bulkfacilityIds:string): Observable<any> {
             let params = new HttpParams().set("tableName", "GetTaskMasterDetailsOnFilter")
            .set("method", "GetTaskMasterDetails")
            .set("pageNumber", pageNumber.toString())
            .set("sortColumn", sortColumn)
            .set("sortDirection", sortDirection)
            .set("taskcd", searchString != undefined ? searchString :"")
            .set("pageSize", pageSize.toString())
            .set("countryIds", countryIds != undefined ? countryIds.toString() : "")
            .set("cityIds", cityIds != undefined ? cityIds.toString() : "")
            .set("facilityIds", facilityIds != undefined ? facilityIds.toString() : "")
            .set("frequencyIds", frequencyIds != undefined ? frequencyIds.toString() : "")
            .set("trafficIds", trafficIds != undefined ? trafficIds.toString() : "")
            .set("bulkfacilityIds", bulkfacilityIds != undefined ? bulkfacilityIds.toString() : "");
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

    public getViewTaskMasterData(taskId: number): Observable<any> {
        return this.http.get('../taskmaster/taskmaster.json')
            .map(data => {
                return data;
            });
    }

    public CheckForDuplicateTasks(facilityId:number,towerId:number,floorId:number,txtLocation:string, txtWorkType:string,trafficId:number,frequencyId:number):Observable<any>{
        let params = new HttpParams().set("tableName", "CheckForDuplicateTasks")
            .set("facilityId", facilityId.toString())
            .set("method", "Create")
            .set("towerId", towerId.toString())
            .set("floorId", floorId.toString())
            .set("frequencyId", frequencyId.toString())
            .set("trafficId", trafficId.toString())
            .set("location", txtLocation)
            .set("workType", txtWorkType);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params:params
        };
        //let headers = new HttpHeaders().set("")
       

        return this.http.get(environment.taskGetUrl,httpOptions)
            .map(data => {
                return data;
            });
    }

    public GetTaskIdForTaskCdCreation(facilityId:number):Observable<any>{
        debugger;
        let params = new HttpParams().set("tableName", "GetTaskIdForTaskCdCreation")
            .set("facilityId", facilityId.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params:params
        };
        //let headers = new HttpHeaders().set("")
       
      return this.http.get(environment.taskGetUrl,httpOptions)
            .map(data => {
                return data;
            console.log(data);
               
            });
    }


    public deleteTask(taskId:number,enterprisedId:string):Observable<any>{
        let currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        let params = new HttpParams().set("tableName", "TaskMasterDelete")
                                    .set("method", "TaskMaster");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            TaskMaster: {
                TaskId: taskId, UpdatedDttm: currentDate, IsActive: false,UpdatedBy:enterprisedId
            }
        }
        );
        return this.http.put(environment.taskGetUrl, data, httpOptions);
    }

    public searchTask(term: string): Observable<string[]> {
        debugger;
        if (term === '') {
            return of([]);
        }
        let params = new HttpParams().set("tableName", "Task")
            .set("filterBy", "true")
            .set("method", "searchTaskMaster")
            .set("taskCode", term)
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
        //return states;
    }


    public updateTask(taskId:number,taskCd:string,location:string,area:number,worktype:string,trafficTypeId:number,frequencyId:number,enterprisedId:string):Observable<any>{
        let currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        let params = new HttpParams().set("tableName", "TaskMasterUpdate")
                                    .set("method", "TaskMaster");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        var data = JSON.stringify({
            TaskMaster: {
                TaskId: taskId, UpdatedDttm: currentDate,UpdatedBy:enterprisedId,TaskCd:taskCd,Location:location,WorkType:worktype,Area:area,
                TrafficTypeId:trafficTypeId,FrequencyId:frequencyId
            }
        }
        );
        return this.http.put(environment.taskGetUrl, data, httpOptions);
    }

    public GetTaskDetailsForViewMode(taskId:number):Observable<any>{
        let params = new HttpParams().set("tableName", "GetTaskDetailsForViewMode")
            .set("taskId", taskId.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params:params
        };
        //let headers = new HttpHeaders().set("")
       

        return this.http.get(environment.taskGetUrl,httpOptions)
            .map(data => {
                return data;
            });
    }

    public downloadTaskMasterData(): Observable<any> {
        let params = new HttpParams().set("tableName", "DownloadTask");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params:params
        };
        
        return this.http.get(environment.taskGetUrl,httpOptions)
            .map(data => {
                return data;
            });
    }
}
