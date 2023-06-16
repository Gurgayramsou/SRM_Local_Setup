import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RoleMaster, FacilityMaster } from './Data';
import { environment } from '../../../environments/environment';
import { DatePipe } from '@angular/common'

@Injectable()

export class RoleMasterService {
    public authorizationUrl: string = '';
    constructor(private http: HttpClient, private datepipe: DatePipe) {
    }

    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': "application/json",
            'Authorization': "Bearer " + sessionStorage["access_token"]
        })
    };

    public getRoleDetails(): Observable<RoleDeatials[]> {
        let params = new HttpParams().set("table", "RoleDetails");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<RoleDeatials[]>(environment.accountGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public saveRoleDetails(roleName: string, enterpriseId: string): Observable<any> {
        debugger;
        let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        let params = new HttpParams().set("table", "SaveRoleMaster");
        var data = JSON.stringify({
            Role: {
                RoleName: roleName, EnterpriseId: enterpriseId, DateTime: currentDate
            }
        });
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.post(environment.accountGetUrl, data, httpOptions);
    }

    public updateRoleDetails(roleId: number, statusId: number, enterpriseId: string): Observable<any> {
        debugger;
        let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        let params = new HttpParams().set("table", "UpdateRoleMaster");
        var data = JSON.stringify({
            Role: {
                RoleId: roleId, StatusId: statusId, EnterpriseId: enterpriseId, DateTime: currentDate
            }
        });
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.put(environment.accountGetUrl, data, httpOptions);
    }


    public getRoleMenuDetails(): Observable<RoleMenuDeatials[]> {
        let params = new HttpParams().set("table", "RoleMenuDeatials");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<RoleMenuDeatials[]>(environment.accountGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }
}

export class RoleDeatials {
    RoleId: number;
    RoleName: string;
    StatusId: boolean;
    StatusName: string;
    UpdatedBy: string;
    UpdatedDate: string;
}

export class RoleMenuDeatials {
    RoleId: number;
    RoleName: string;
    MenuId: number;
    MenuName: string;
    SubMenuName: string;
    MenuOrder: number;
}