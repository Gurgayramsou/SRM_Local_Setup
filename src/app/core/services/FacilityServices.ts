import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RoleMaster, FacilityMaster, PackageTypeMaster} from './Data';
import { environment } from '../../../environments/environment';
import { DatePipe } from '@angular/common'

@Injectable()

export class FacilityService
{
    constructor(private http: HttpClient,private datepipe: DatePipe) {
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
    public Getfacilitydetails(pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number):Observable<any>{
        debugger;
        let params = new HttpParams().set("table", "FacilityFacilityAliasDetails")
       // .set("method", "GetTaskMasterDetails")
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
        return this.http.get(environment.accountGetUrl, httpOptions)
            .map(data => {
                return data;
            });
    }
    public GetfacilitydetailsFilter(selectedCountryNames:Array<string>,selectedCityNames:Array<string>,SeletedfacilidyIds:Array<number>,selectedSiteIDs:Array<number>,pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number):Observable<any>{
        debugger;
        let params = new HttpParams().set("table", "FacilityFacilityAliasDetailsFilter") 
        .set("pageNumber", pageNumber.toString())
        .set("sortColumn", sortColumn.toString())
        .set("sortDirection", sortDirection.toString())
        .set("pageSize", pageSize.toString())
        .set("CountryNames",selectedCountryNames !=undefined ? selectedCountryNames.toString() : "")
        .set("CityNames",selectedCityNames !=undefined ? selectedCityNames.toString() : "")
        .set("FacilityIds", SeletedfacilidyIds !=undefined ? SeletedfacilidyIds.toString() : "")
        .set("SiteIds",selectedSiteIDs != undefined ? selectedSiteIDs.toString() : "");
        
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
    public GetZoneByCountryName(countryNm:string):Observable<any>{
        debugger;
        let params = new HttpParams().set("table", "ZoneDetailsByCountry")
        .set("CountryNm",countryNm);
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
    public GetViewFacilityDetails(countryNm:string,pageNumber: number, sortColumn: string, sortDirection: string, pageSize: number):Observable<any>{
        debugger;
        let params = new HttpParams().set("table", "GetfacilityDetailsByCountry")
        .set("CountryNm",countryNm!=undefined?countryNm:"")
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
        return this.http.get(environment.accountGetUrl, httpOptions)
            .map(data => {
                return data;
            }); 
    }
    public GetCityByZone(Zonename:string):Observable<any>{
        debugger;
        let params = new HttpParams().set("table", "CityByZone")
        .set("ZoneNm",Zonename)
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
    public CheckFacilityExist(facilityname:string):Observable<any>{
        debugger;
        let params = new HttpParams().set("method", "CheckFacilityExist")
        .set("Facilityname",facilityname)
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
    public AddFacilityAliasPackageMapping(SavePackageDetails:any): Observable<any> 
    {
        debugger;
        let params = new HttpParams().set("tableName", "FacilityAliasPackageCategoryMapping");
        var data = JSON.stringify({
            savePackagemaping: SavePackageDetails
        });
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        //console.log("Signed URL for upload : " + data);
        return this.http.post(environment.packageGetUrl, data, httpOptions);
    }
    public GetSRMAdmin(FacilityId:number): Observable<any> 
    {
        debugger;
        let params = new HttpParams().set("table", "GetSRMAdmin")
        .set("FacilityId",FacilityId.toString());
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        //console.log("Signed URL for upload : " + data);
        return this.http.get(environment.accountGetUrl, httpOptions)
            .map(data => {
                return data;
            }); 
    }
    public AddFacilityAliasFloorMapping(SaveFloorDetails:any): Observable<any> 
    {
        debugger;
        let params = new HttpParams().set("tableName", "FacilityTowerFloorMapping");
        var data = JSON.stringify({
            FacilityTowerFloorMapping: SaveFloorDetails
        });
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        //console.log("Signed URL for upload : " + data);
        return this.http.post(environment.taskGetUrl, data, httpOptions);
    }
    public gettowermappingFacilityid(facilityAliasId:number): Observable<any> {
        let params = new HttpParams().set("tableName", "FacilityTowerFloorMappingManager")
        .set("FacilityAliasID",facilityAliasId.toString());
       
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
    public UpdateDutymanagerinTask(FacilityAliasMappingId:Array<number>,DutyManager:string,DutyEngineer:string): Observable<any> 
    {
        debugger;
        let params = new HttpParams().set("tableName", "FacilityTowerFloorMappingManager")
        
        var data = JSON.stringify({
            FacilityAlias: {
                FacilityAliasMappingId:FacilityAliasMappingId.toString(),DutyManager:DutyManager!=null?DutyManager:"",DutyEngineer:DutyEngineer!=null?DutyEngineer:""
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
        return this.http.put(environment.taskGetUrl, data, httpOptions);
    }
    public CheckFacilityAliasExist(site:string):Observable<any>{
        debugger;
        let params = new HttpParams().set("method", "CheckFacilityAliasExist")
        .set("FacilityAliasNm",site)
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
    public AddFacility(facilityname:string,CountryNames:string,CityNames:string,Zonename:string,enterpriseId:string):Observable<any>{
        debugger;
        let currentDate: string = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        let facilityid;
        let params = new HttpParams().set("table", "Addfacility")
        var data = JSON.stringify({
            Facilitymapping: {
                FacilityName: facilityname,CityNm: CityNames,ZoneNm:Zonename, CountryNm:CountryNames,enterpriseId:enterpriseId,currentdate:currentDate
            }
        });
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.post(environment.accountGetUrl,data, httpOptions)
            .map(data => {
                return data;
            }); 
         
    }
    public AddFacilityInTask(facilityid:number,facilityname:string,CountryNames:string,CityNames:string,enterpriseId:string):Observable<any>{
        debugger;
        let currentDate: string = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        let params = new HttpParams().set("tableName", "Facility")
        var data_2=JSON.stringify({
            Facility: {
                FacilityId:facilityid,FacilityName: facilityname, CountryNm:CountryNames,CityNm: CityNames,EnterpriseId:enterpriseId,DateTime:currentDate
            }
        });
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.post(environment.taskGetUrl,data_2,httpOptions)
        .map(data=>{
            return data;
        })
    }
    public AddFacilityAlias(facilityAlias:string,facilityId:number,DutyManager:string,DutyEngineer:string,enterpriseId:string):Observable<any>{
       
        let currentDate: string = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        let params = new HttpParams().set("table", "AddSite")
        var data = JSON.stringify({
            FacilityAlias: {
                FacilityAliasNm: facilityAlias,FacilityID:facilityId.toString(), DutyEngineerGroupId:DutyEngineer!=undefined?DutyEngineer:"",DutyManagerGroupId: DutyManager!=undefined?DutyManager:"",enterpriseId:enterpriseId,currentdate:currentDate
            }
        });
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.post(environment.accountGetUrl,data, httpOptions)
            .map(data => {
                console.log(data);
                return data;
            }); 
    }
    public getCategory():Observable<any>{
        debugger;
        let params = new HttpParams().set("tableName", "Package")
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
    public UpdateSite(facilityAliasId:number,enterpriseId:string,Dutymanager:string,DutyEngineer:string):Observable<any>{
        debugger;
        let currentDate: string = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        let params = new HttpParams().set("table", "FacilityAlias")
        var data = JSON.stringify({
            FacilityAlias: {
                FacilityAliasId: facilityAliasId.toString(),enterpriseId:enterpriseId,currentdate:currentDate,DutyManager:Dutymanager!=null?Dutymanager:"",DutyEngineer:DutyEngineer!=null?DutyEngineer:""
            }
        });
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/json",
                'Authorization': "Bearer " + sessionStorage["access_token"]
            }),
            params: params
        };
        return this.http.put(environment.accountGetUrl,data, httpOptions)
            .map(data => {
                return data;
            }); 
    }
    
    public getPackageDetailsByFacilityID(site:number):Observable<any>{
        debugger;
        let params = new HttpParams().set("tableName", "GetPackagedetailsByFacilityAlias")
        .set("FacilityAliasID",site.toString())
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
    public getFloorId(site:number,towerId :number):Observable<any>{
        debugger;
        let params = new HttpParams().set("tableName", "CheckFloorMapping")
        .set("FacilityAliasID",site.toString())
        .set("TowerId",towerId.toString())
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
    public getManagersDetails(site:number):Observable<any>{
        debugger;
        let params = new HttpParams().set("table", "GetManager")
        .set("FacilityAliasID",site.toString())
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
    public getFacilityAliasDetailsByfacilityIds(site:number):Observable<any>{
        debugger;
        let params = new HttpParams().set("table", "FacilityAliasDetailsByID")
        .set("FacilityAliasID",site.toString())
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
    public getTowerFloodDetailsByFacilityAliasID(site:number,pageNumber:number,pageSize:number):Observable<any>{
        debugger;
        let params = new HttpParams().set("tableName", "GetFacilityTowerFloorDetails")
        .set("FacilityAliasID",site.toString())
        .set("pageNumber", pageNumber.toString())
        .set("pageSize", pageSize.toString());
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
    // public GetPackageNmByFacilityAliasID(site:number):Observable<any>{
    //     debugger;
    //     let params = new HttpParams().set("tableName", "GetPackageNameByFacilityID")
    //     .set("FacilityAliasID",site.toString())
    //     const httpOptions = {
    //         headers: new HttpHeaders({
    //             'Content-Type': "application/json",
    //             'Authorization': "Bearer " + sessionStorage["access_token"]
    //         }),
    //         params: params
    //     };
    //     return this.http.get(environment.packageGetUrl, httpOptions)
    //         .map(data => {
    //             return data;
    //         }); 
    // }
}