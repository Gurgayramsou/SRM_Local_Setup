import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RoleMaster, FacilityMaster, PackageTypeMaster} from './Data';
import { environment } from '../../../environments/environment';

@Injectable()

export class RoleMappingService
{
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

    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': "application/json",
            'Authorization': "Bearer " + sessionStorage["access_token"]
        })
    };

    public getRoleDetails(): Observable<RoleMaster[]> {
        let params = new HttpParams().set("table", "Role");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<RoleMaster[]>(environment.accountGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public CheckEnterpriseId(enterpriseId: string): Observable<any> {
        debugger;
        let params = new HttpParams().set("table", "CheckEnterpriseId")
            .set("EnterpriseId", enterpriseId.trim());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get(environment.accountGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public CheckRoleUserMappingExists(roleId:number,userId:number): Observable<any> {
       // debugger;
        let params = new HttpParams().set("table", "CheckRoleUserMappingExists")
            .set("RoleId", roleId.toString())
            .set("UserId", userId.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get(environment.accountGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public CheckVendorUserMappingExists(vendorId:number,userId:number): Observable<any> {
        // debugger;
         let params = new HttpParams().set("table", "CheckUserSPMappingExists")
             .set("VendorId", vendorId.toString())
             .set("UserId", userId.toString());
         const httpOptions = {
             headers: new HttpHeaders({
                 'Content-Type': "application/json",
                 'Authorization': "Bearer " + sessionStorage["access_token"]
             }),
             params: params
         };
         return this.http.get(environment.accountGetUrl, httpOptions)
             .map(data => {
                 return data;
             });
     }

    public CheckUserFacilityMappingExists(roleId:number,userId:number,PackageFacilityFilter: string): Observable<any> {
     debugger;
         let params = new HttpParams().set("table", "CheckUserFacilityMappingExists");
            // .set("RoleId", roleId.toString())
             //.set("UserId", userId.toString())
             //.set("PackageFacilityFilter", PackageFacilityFilter);
          var data = JSON.stringify({
            UserFacilityMapping: {
                     RoleId: roleId, UserId: userId, PackageFacilityFilter:PackageFacilityFilter
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

    public UpdateRecordInUserFacilityMapping(userId: number, packageId:number, roleId:number, facilityId: number,updatedBy:string, updatedDate:string, isActive:number ): Observable<any> {
        let params = new HttpParams().set("table", "UpdateRecordAsActiveOrInActive");
        var data = JSON.stringify({
            UserFacilityMapping: {
                UserId: userId, PackageId: packageId, RoleId: roleId, FacilityId: facilityId, UpdatedBy: updatedBy, UpdatedDttm: updatedDate, IsActive: isActive
            }
        }
        );
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        //console.log("Signed URL for upload : " + data);
        return this.http.put(environment.accountGetUrl, data, httpOptions);
    }

    public DeleteRecordInUserFacilityTable(userId: number, roleId:number, updatedBy:string, updatedDate:string, isActive:number ): Observable<any> {
       debugger;
        let params = new HttpParams().set("table", "DeleteRecordInUserFacility");
        var data = JSON.stringify({
            UserFacilityMapping: {
                UserId: userId, RoleId: roleId, UpdatedBy: updatedBy, UpdatedDttm: updatedDate, IsActive: isActive
            }
        }
        );
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.put(environment.accountGetUrl, data, httpOptions);
    }
    public DeleteRole(userId: number, roleId:number, updatedBy:string, updatedDate:string, isActive:number ): Observable<any> {
        debugger;
        let params = new HttpParams().set("table", "DeleteRole");
        var data = JSON.stringify({
            RoleUserMapping: {
                RoleId: roleId, UserId: userId, UpdatedBy: updatedBy, UpdatedDttm: updatedDate, IsActive: isActive
            }
        }
        );
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.put(environment.accountGetUrl, data, httpOptions);
    }

    public DeleteVendorUserMapping(userId: number, vendorId:number, updatedBy:string, updatedDate:string, isActive:number ): Observable<any> {
        debugger;
        let params = new HttpParams().set("table", "DeleteVendorUserMapping");
        var data = JSON.stringify({
            UserSPMapping: {
                VendorId: vendorId, UserId: userId, UpdatedBy: updatedBy, UpdatedDttm: updatedDate, IsActive: isActive
            }
        }
        );
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.put(environment.accountGetUrl, data, httpOptions);
    }

    public InsertEnterpriseId(enterpriseId: string, emailId: string, createdDate:string ): Observable<any> {
        let params = new HttpParams().set("table", "Users");
        var data = JSON.stringify({
            Users: {
                EnterpriseId: enterpriseId, EmailId: emailId, IsActive: 1, CreatedBy: enterpriseId, CreateDttm: createdDate, UpdatedBy: enterpriseId, UpdatedDttm: createdDate
            }
        }
        );
        //var data = {"Users":{"EnterpriseId":"surabhi.handa","EmailId":"surabhi.handa@accenture.com","IsActive":1,"CreatedBy":"surabhi.handa","CreateDttm":"2019/05/08","UpdatedBy":"surabhi.handa","UpdatedDttm":"2019/05/08"}};
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        //console.log("Signed URL for upload : " + data);
        return this.http.post(environment.accountGetUrl, data, httpOptions);
    }

    public InsertDataIntoRoleUserMapping(roleId: number, userId: number, createdBy: string, createdDate:string ): Observable<any> 
    {
        debugger;
        let params = new HttpParams().set("table", "RoleUserMapping");
        var data = JSON.stringify({
            RoleUserMapping: {
                 RoleId: roleId, UserId: userId, IsActive: 1, CreatedBy: createdBy, CreateDttm: createdDate, UpdatedBy: createdBy, UpdatedDttm: createdDate
            }
        });
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        //console.log("Signed URL for upload : " + data);
        return this.http.post(environment.accountGetUrl, data, httpOptions);
    }

    public InsertDataIntoUserFacilityMapping(SaveRoleMappingDetails:any): Observable<any> 
    {
        debugger;
        let params = new HttpParams().set("table", "UserFacilityMapping");
        var data = JSON.stringify({
            UserFacilityMapping: SaveRoleMappingDetails
        });
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        //console.log("Signed URL for upload : " + data);
        return this.http.post(environment.accountGetUrl, data, httpOptions);
    }

    public getRoleMappingGridData(pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number, enterpriseId: string): Observable<any> {
        let params = new HttpParams().set("table", "GetRoleMappingGridData")
            .set("method", "BindGridDetails")
            .set("pageNumber", pageNumber.toString())
            .set("sortColumn", sortColumn.toString())
            .set("sortDirection", sortDirection.toString())
            .set("pageSize", pageSize.toString())
            .set("enterpriseId",enterpriseId);
        //var data = AuthService.getUserClaims(); 
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get(environment.accountGetUrl, httpOptions)
            //this.http.get('../data/package.json')
            .map(data => {
                return data;
            });
    }

    public getRoleMappingGridDataOnAction(pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number, roleId: number, enterpriseId: string): Observable<any> {
        debugger;
        let params = new HttpParams().set("table", "GetRoleMappingGridDataOnAction")
            .set("method", "BindGridDetailsOnAction")
            .set("pageNumber", pageNumber.toString())
            .set("sortColumn", sortColumn.toString())
            .set("sortDirection", sortDirection.toString())
            .set("pageSize", pageSize.toString())
            .set("roleId", roleId.toString())
            .set("enterpriseId", enterpriseId);
        //var data = AuthService.getUserClaims(); 
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get(environment.accountGetUrl, httpOptions)
            //this.http.get('../data/package.json')
            .map(data => {
                return data;
            });
    }

    public getRoleMappingGridDataByFilter(enterpriseId:string, roleIds: Array<number>
        , pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number): Observable<any> {
        let params = new HttpParams().set("table", "GetRoleMappingGridData")
            .set("filterBy", "true")
            .set("method", "BindGridDetailsOnFilter")
            .set("pageNumber", pageNumber.toString())
            .set("sortColumn", sortColumn)
            .set("sortDirection", sortDirection)
            .set("pageSize", pageSize.toString())
            .set("enterpriseId", enterpriseId != undefined ? enterpriseId : "")
            //.set("packageTypeIds", packageTypeIds != undefined ? packageTypeIds.toString() : "")
            //.set("facilityIds", facilityIds != undefined ? facilityIds.toString() : "")
            .set("roleIds", roleIds != undefined ? roleIds.toString() : "");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<any>(environment.accountGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    searchEnterprise(term: string): Observable<any> {
        debugger;
        if (term === '') {
            return of([]);
        }
        let params = new HttpParams().set("table", "SearchEnterpriseId")
            .set("filterBy", "true")
            .set("method", "searchEnterprise")
            .set("enterpriseId", term);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        const data = this.http.get<any>(environment.accountGetUrl, httpOptions)
            .map(data => {
                return data;
                
            });
        return data;
    }

     
    public validateEnterpriseId(enterpriseId:string): Observable<any> {
        let params = new HttpParams().set("table", "MRDRToken")
        .set("enterpriseId", enterpriseId.toString());

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<any>(environment.accountGetUrl, httpOptions)
        .map(data => {
            return data;
        });
    }


    public getFacilityAliasIdsByPackage(packageId:number): Observable<any> {
        let params = new HttpParams().set("tableName", "FacilityAliasIdsByPackageId")
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

    public getFacilityAliasDetails(): Observable<FacilityMaster[]> {
        debugger;
        let params = new HttpParams().set("table", "FacilityAlias");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<FacilityMaster[]>(environment.accountGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getFacilityAliasDetailsByfacilityIds(facilityIds:Array<number>): Observable<FacilityMaster[]> {
        let params = new HttpParams().set("table", "FacilityAliasDetailsByFacilityId")
        .set("facilityIds", facilityIds != undefined ? facilityIds.toString() : "");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<FacilityMaster[]>(environment.accountGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public InsertDataIntoUserSPMapping(vendorId: number, userId: number, createdBy: string, createdDate:string ): Observable<any> 
    {
        debugger;
        let params = new HttpParams().set("table", "UserSPMapping");
        var data = JSON.stringify({
            UserSPMapping: {
                UserId: userId, ServiceProviderId:vendorId, IsActive: 1, CreatedBy: createdBy, CreateDttm: createdDate, UpdatedBy: createdBy, UpdatedDttm: createdDate
            }
        });
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        //console.log("Signed URL for upload : " + data);
        return this.http.post(environment.accountGetUrl, data, httpOptions);
    }

    public getCityNames(userId: number, roleId: number): Observable<any> {
        let params = new HttpParams().set("table", "GetCityName")
            .set("userId", userId.toString())
            .set("roleId", roleId.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<any>(environment.accountGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public DeleteCityMapping(userId: number, roleId:number, cityName: string, updatedBy:string, updatedDate:string, isActive:number ): Observable<any> {
        debugger;
        let params = new HttpParams().set("table", "DeleteCityMapping");
        var data = JSON.stringify({
            UserFacilityMapping: {
                RoleId: roleId, UserId: userId, CityName:cityName, UpdatedBy: updatedBy, UpdatedDttm: updatedDate, IsActive: isActive
            }
        }
        );
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.put(environment.accountGetUrl, data, httpOptions);
    }


}