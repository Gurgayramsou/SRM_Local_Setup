import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    FacilityMaster, MenuMaster, FunctionMaster, CountryMaster, CityMaster, VendorMaster, FrequencyMaster, PackageTypeMaster,
    TowerMaster, FloorMaster, TrafficMaster, FunctionData, DutyManager, StatusMaster, RatingMaster, MonthYear
    , CategoryMaster, ZoneMaster, FacilityAliasMaster, FacilityCityCountryMaster, PackageMaster, PackageFacilityAliasVendorMaster
    , PackageFacilityAliasMaster, PackageCategoryMaster, PackageFacilityAliasCategoryMaster
} from './Data';
import { environment } from '../../../environments/environment';

@Injectable()
export class DataService {

    public authorizationUrl: string = '';
    constructor(private http: HttpClient) {
        console.log('DataService');
        // if (location.href.toLocaleLowerCase().indexOf("local") != -1) {
        //     this.authorizationUrl = environment.authorizationLocal;
        // }
        // else {
        //     this.authorizationUrl = sessionStorage["access_token"];
        //     console.log("dev authorization" + this.authorizationUrl);
        // }
    }

    public getData(): Observable<any> {
        return this.http.get('../data/data.json')
            .map(data => {
                return data;
            });
    }

    public getData1(): Observable<any> {
        return this.http.get('../data/data1.json')
            .map(data => {
                return data;
            });
    }

    public getData2(packageId: number): Observable<any> {
        //debugger;
        var data: any = null;
        data = this.http.get('../data/data.json')
            .map(data => {
                return data;
            });
        data = data.filter(x => x.packageId == packageId)
        return data;
    }

    //#region Account DB

    public getMenuMasterDetails(enterpriseId: string): Observable<any> {
        let params = new HttpParams().set("table", "GetMenuDetailsForUser")
            .set("EnterpriseId", enterpriseId)
            .set("method", "getSubMenuDetails");
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

    public getVendorDetails(): Observable<VendorMaster[]> {
        //debugger;
        let params = new HttpParams().set("table", "ServiceProvider")
            .set("filterBy", "true")
            .set("method", "getVendorDetails");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<VendorMaster[]>(environment.accountGetUrl, httpOptions)
            .map(data => {
                return data;
            });
        // return this.http.get<VendorMaster[]>('../data/vendor.json')
        //     .map(data => {
        //         return data;
        //     });
    }

    public getVendorDetailsByUser(enterpriseId: string): Observable<VendorMaster[]> {
        //debugger;
        let params = new HttpParams().set("table", "ServiceProvider")
            .set("filterBy", "true")
            .set("method", "getVendorDetailsByUser")
            .set("enterpriseId", enterpriseId);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<VendorMaster[]>(environment.accountGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getDutyManagerDetails(facilityIds: string): Observable<DutyManager[]> {
        let params = new HttpParams().set("table", "RoleUserMapping")
            .set("filterBy", "true")
            .set("method", "getDutyManagerDetails")
            .set("facilityIds", facilityIds);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<DutyManager[]>(environment.accountGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getPackageFacilityDetailsByPage(enterpriseId: string, pagePath: string): Observable<any> {
        //debugger;
        let params = new HttpParams().set("table", "PackageFacilityDetailsByPage")
            .set("enterpriseId", enterpriseId)
            .set("pagePath", pagePath);
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

    public checkPageAccessForReports(enterpriseId: string, pagePath: string): Observable<any> {
        //debugger;
        let params = new HttpParams().set("table", "CheckPageAccessForReports")
            .set("enterpriseId", enterpriseId)
            .set("pagePath", pagePath);
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

    public GetMailerDetails(facilityId: number, packageId: number, RoleIds: Array<String>): Observable<any> {
        let params = new HttpParams().set("table", "UserEnterpriseId")
            .set("method", "GetMailerDetails")
            .set("facilityId", facilityId.toString())
            .set("RoleIds", RoleIds.toString())
            .set("packageId", packageId.toString());
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

    public getVendorEnterpriseId(facilityId: number, packageId: number, vendorId: number): Observable<any> {
        let params = new HttpParams().set("table", "UserEnterpriseId")
            .set("method", "VendorEnterpriseId")
            .set("facilityId", facilityId.toString())
            .set("packageId", packageId.toString())
            .set("vendorId", vendorId.toString());
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

    public getJLLEnterpriseId(facilityId: number, packageId: number): Observable<any> {
        let params = new HttpParams().set("table", "UserEnterpriseId")
            .set("method", "JLLEnterpriseId")
            .set("facilityId", facilityId.toString())
            .set("packageId", packageId.toString());
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

    public getZLSDLEnterpriseId(facilityId: number, packageId: number): Observable<any> {
        let params = new HttpParams().set("table", "UserEnterpriseId")
            .set("method", "ZLSDLEnterpriseId")
            .set("facilityId", facilityId.toString())
            .set("packageId", packageId.toString());
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


    public getZoneDetailsByFacilityIds(facilityIds: string): Observable<ZoneMaster[]> {
        let params = new HttpParams().set("table", "ZoneDetailsByFacilityIds");
        params = params.set("facilityIds", facilityIds);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<ZoneMaster[]>(environment.accountGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getFacilityAliasDetails(): Observable<FacilityMaster[]> {
        //debugger;
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

    public FacilityAliasDetails(): Observable<FacilityAliasMaster[]> {
        //debugger;
        let params = new HttpParams().set("table", "FacilityAliasDetails");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<FacilityAliasMaster[]>(environment.accountGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public PackageFacilityAliasVendorMapping(): Observable<PackageFacilityAliasVendorMaster[]> {
        //debugger;
        let params = new HttpParams().set("table", "PackageFacilityAliasVendorMapping");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<PackageFacilityAliasVendorMaster[]>(environment.accountGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    //#endregion

    //#region Package DB

    public getFrequencyDetails(): Observable<any> {
        //debugger;
        let params = new HttpParams().set("tableName", "Frequency");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get(environment.packageGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getPackageTypeDetails(): Observable<PackageTypeMaster[]> {
        //debugger;
        let params = new HttpParams().set("tableName", "Package");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<PackageTypeMaster[]>(environment.packageGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getPackageStatusDetails(): Observable<any[]> {
        //debugger;
        let params = new HttpParams().set("tableName", "PackageStatusDetails");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<any[]>(environment.packageGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getFunctionDetails(): Observable<any> {
        let params = new HttpParams().set("tableName", "Function");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get(environment.packageGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getFunctionDetailsByPackageId(packageId: number): Observable<FunctionData[]> {
        let params = new HttpParams().set("tableName", "PackageFunctionMapping")
            .set("filterBy", "True")
            .set("DetailsBy", packageId.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<FunctionData[]>(environment.packageGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getCategoryNameByPackageId(packageId: number): Observable<any> {
        //debugger;
        let params = new HttpParams().set("tableName", "CategoryNameByPackageId")
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

    public getCategoryDetails(): Observable<CategoryMaster[]> {
        //debugger;
        let params = new HttpParams().set("tableName", "Category");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<CategoryMaster[]>(environment.packageGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getPackageDetailsByCategoryId(CategoryId: number): Observable<any> {
        //debugger;
        let params = new HttpParams().set("tableName", "PackageDetailsByCategoryId")
            .set("CategoryId", CategoryId.toString());
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

    public getPackageDetails(): Observable<PackageMaster[]> {
        //debugger;
        let params = new HttpParams().set("tableName", "PackageMaster");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<PackageMaster[]>(environment.packageGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getFacilityAliasDetailsByPackageId(packageId: number): Observable<FacilityMaster[]> {
        let params = new HttpParams().set("tableName", "PackageFunctionMapping")
            .set("filterBy", "True")
            .set("DetailsBy", packageId.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<FacilityMaster[]>(environment.packageGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getPackageIdsForTaskPage(configCode: string): Observable<any> {
        let params = new HttpParams().set("tableName", "PackageIdsForTaskPage")
            .set("configCode", configCode);
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

    public PackageFacilityAliasMapping(): Observable<PackageFacilityAliasMaster[]> {
        //debugger;
        let params = new HttpParams().set("tableName", "PackageFacilityAliasMapping");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<PackageFacilityAliasMaster[]>(environment.packageGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getPackageCategoryDetails(): Observable<PackageCategoryMaster[]> {
        //debugger;
        let params = new HttpParams().set("tableName", "PackageCategoryMaster");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<PackageCategoryMaster[]>(environment.packageGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getPackageFacilityAliasCategoryDetails(): Observable<PackageFacilityAliasCategoryMaster[]> {
        //debugger;
        let params = new HttpParams().set("tableName", "PackageFacilityAliasCategoryMapping");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<PackageFacilityAliasCategoryMaster[]>(environment.packageGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    //#endregion

    //#region ScoreDB

    public getStatusDetails(): Observable<StatusMaster[]> {
        //debugger;
        let params = new HttpParams().set("table", "Status");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<StatusMaster[]>(environment.scoreGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getRatingDetials(): Observable<RatingMaster[]> {
        let params = new HttpParams().set("table", "Rating");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<RatingMaster[]>(environment.scoreGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }
    //#endregion

    //#region Task DB

    public getCountryDetails(): Observable<CountryMaster[]> {
        let params = new HttpParams().set("tableName", "Country");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<CountryMaster[]>(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getCityDetails(): Observable<CityMaster[]> {
        debugger;
        let params = new HttpParams().set("tableName", "City");
        params = params.set("filterBy", "False");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<CityMaster[]>(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getCityDetailsByCountryId(countryId: number): Observable<CityMaster[]> {
        let params = new HttpParams().set("tableName", "City");
        params = params.set("filterBy", "True");
        params = params.set("DetailsBy", countryId.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<CityMaster[]>(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getFacilityDetails(): Observable<FacilityMaster[]> {
        //debugger;
        let params = new HttpParams().set("tableName", "Facility");
        params = params.set("filterBy", "False");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<FacilityMaster[]>(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getFacilityDetailsByCityId(cityId: number): Observable<FacilityMaster[]> {
        let params = new HttpParams().set("tableName", "Facility");
        params = params.set("filterBy", "True");
        params = params.set("DetailsBy", cityId.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<FacilityMaster[]>(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getFacilityDetailsByCityIds(cityIds: string): Observable<FacilityMaster[]> {
        let params = new HttpParams().set("tableName", "Facility");
        params = params.set("filterBy", "True");
        params = params.set("DetailsBy", cityIds);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<FacilityMaster[]>(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getTowerDetails(): Observable<TowerMaster[]> {
        let params = new HttpParams().set("tableName", "Tower");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<TowerMaster[]>(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getTowerDetailsByFacilityId(facilityId: number): Observable<TowerMaster[]> {
        let params = new HttpParams().set("tableName", "Tower");
        params = params.set("filterBy", "True");
        params = params.set("DetailsBy", facilityId.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<TowerMaster[]>(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getTowerDetailsByFacilityIds(facilityIds: string): Observable<TowerMaster[]> {
        let params = new HttpParams().set("tableName", "Tower");
        params = params.set("filterBy", "True");
        params = params.set("DetailsBy", facilityIds);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<TowerMaster[]>(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getTowerDetailsByCityIds(facilityIds: string): Observable<TowerMaster[]> {
        let params = new HttpParams().set("tableName", "Tower");
        params = params.set("filterBy", "True");
        params = params.set("columnName", "facility");
        params = params.set("DetailsBy", facilityIds);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<TowerMaster[]>(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getFloorDetails(): Observable<FloorMaster[]> {
        let params = new HttpParams().set("tableName", "Floor");
        params = params.set("filterBy", "False");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<FloorMaster[]>(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getFloorDetailsByTowerId(towerId: number, facilityId: number): Observable<any> {
        let params = new HttpParams().set("tableName", "Floor");
        params = params.set("filterBy", "True");
        params = params.set("DetailsBy", towerId.toString());
        params = params.set("FacilityId", facilityId.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<FloorMaster[]>(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getTrafficDetails(): Observable<TrafficMaster[]> {
        let params = new HttpParams().set("tableName", "TrafficType");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<TrafficMaster[]>(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public IsUserAvailable(userName: string): Observable<any> {
        let params = new HttpParams().set("table", "GetUserDetailsCount")
            .set("EnterpriseId", userName != undefined ? userName.toString() : "");
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

    public CheckAdminRoleAccessForPages(userName: string, pathName: string): Observable<any> {
        let params = new HttpParams().set("table", "CheckAdminRoleAccessForPages")
            .set("userName", userName.toString())
            .set("pagePath", pathName.toString());
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


    public getCityFacilityDetailsByFacilityIds(facilityIds: string): Observable<any> {
        debugger;
        let params = new HttpParams().set("tableName", "getCityFacilityDetailsByFacilityIds")
            .set("facilityIds", facilityIds);
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


    public GetGroupMailerDetails(facilityId: number, RoleName: string): Observable<any> {
        let params = new HttpParams().set("table", "GetGroupMailerDetails")
            .set("facilityId", facilityId.toString())
            .set("RoleName", RoleName);
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

    public getCityDetailsByFacilityIds(facilityIds: string): Observable<CityMaster[]> {
        debugger;
        let params = new HttpParams().set("tableName", "CityDetailsByFacilityIds")
            .set("facilityIds", facilityIds);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<CityMaster[]>(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getFacilityDetailsByFacilityIds(facilityIds: string): Observable<FacilityMaster[]> {
        debugger;
        let params = new HttpParams().set("tableName", "FacilityDetailsByFacilityIds")
            .set("facilityIds", facilityIds);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<FacilityMaster[]>(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public FacilityCityCountryDetails(): Observable<FacilityCityCountryMaster[]> {
        let params = new HttpParams().set("tableName", "FacilityCityCountryDetails");
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<FacilityCityCountryMaster[]>(environment.taskGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    //#endregion


    // public getMonthYear(): Observable<MonthYear[]> {
    //     return this.http.get<MonthYear[]>('../data/monthyear.json')
    //         .map(data => {
    //             return data;
    //         });
    // }

    public getMonthYear(): Observable<MonthYear[]> {
        let params = new HttpParams().set("table", "FrequencySLAs")
            .set("filterBy", "true")
            .set("method", "getMonthYear")
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<MonthYear[]>(environment.scoreGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getYear(): Observable<MonthYear[]> {
        let params = new HttpParams().set("table", "FrequencySLAs")
            .set("filterBy", "true")
            .set("method", "getYear")
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.get<MonthYear[]>(environment.scoreGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }

    public getRoleNameForRemarksByColumn(enterpriseId: string, pagePath: string): Observable<any> {
        let params = new HttpParams().set("table", "GetRoleNameForRemarksBy")
            .set("enterpriseId", enterpriseId)
            .set("pagePath", pagePath);
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
        // return this.http.get('../data/roleName.json')
        // .map(data => {
        //     return data;
        // });
    }

    public getRoleGridDetails(): Observable<any> {
        let params = new HttpParams().set("table", "GetRoleDetailsGrid")
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + this.authorizationUrl
            }),
            params: params
        };
        return this.http.get<any>(environment.accountGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }
}
