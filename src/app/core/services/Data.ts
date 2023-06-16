export class FilterDetails {
    value: number;
    text: string;
    filterName: string;
}

export class MenuMaster {
    MenuId:Number;
    MenuCd: string;
    MenuDescription: string;
    MenuURL:string;
    subMenu: [];
}

export class SampleDetails{
    functionNM : string;
}

export class StatusMaster {
    statusId: number;
    statusName: string;
    selected: boolean;
}

export class VendorMaster {
    vendorId: number;
    vendorName: string;
    selected: boolean;
}

export class FrequencyMaster {
    frequencyId: number;
    frequencyName: string;
    selected: boolean;
}

export class CategoryMaster {
    categoryId: number;
    categoryName: string;
    selected: boolean;
}

export class PackageTypeMaster {
    packageId: number;
    packageName: string;
    selected: boolean;
}

export class FunctionMaster {
    functionId: number;
    functionName: string;
    selected: boolean;
}

export class CountryMaster {
    countryId: number;
    countryName: string;
    selected: boolean;
}

export class ZoneMaster {
    zoneName: string;
    selected: boolean;
}

export class CityMaster {
    cityId: number;
    cityName: string;
    selected: boolean;
}

export class FacilityMaster {
    facilityId: number;
    facilityName: string;
    selected: boolean;
}

export class TowerMaster {
    towerId: number;
    towerName: string;
    selected: boolean;
}

export class FloorMaster {
    floorId: number;
    floorName: string;
    selected: boolean;
}

export class TrafficMaster {
    trafficId: number;
    trafficName: string;
    selected: boolean;
}

export class FunctionData {
    functionId: number;
    functionName: string;
    weightage : number;
    isEdit : boolean;
}

export class DutyManager {
    dutyManagerName: string;
    selected: boolean;
}

export class RatingMaster {
    RatingId: number;
    RatingNm: string;
    Score: number;
}


export class MonthYear {
    MonthYearId: number;
    MonthYearNm: string;
    StartDttm: string;
    EndDttm: string;
    selected: boolean;
}


export class RoleMaster {
    RoleId: number;
    RoleNm: string;
    selected: boolean;

}

export class FacilityAliasMaster {
    FacilityAliasId: number;
    FacilityAliasName: string;
    FacilityId: number;
}

export class FacilityCityCountryMaster{
    FacilityId: number;
    FacilityName: string;
    CityId: number;
    CityName: string;
    CountryId: number;
    CountryName: string;
}

export class PackageMaster {
    packageId: number;
    packageName: string;
    statusId: number;
    selected: boolean;
}

export class PackageFacilityAliasVendorMaster {
    PackageId: number;
    FacilityAliasId: number;
    ServiceProviderId: number;
}

export class PackageFacilityAliasMaster {
    PackageId: number;
    FacilityAliasId: number;
}

export class PackageCategoryMaster {
    packageId: number;
    packageName: string;
    categoryId: number;
    categoryName: string;
}

export class PackageFacilityAliasCategoryMaster {
    PackageId: number;
    FacilityAliasId: number;
    CategoryId: number;
    CategoryName: string;
}