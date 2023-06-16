import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../core/services/DataService';
import {
    FacilityMaster, StatusMaster, VendorMaster, FrequencyMaster, PackageTypeMaster, FilterDetails, RatingMaster, CityMaster
    , MonthYear, FacilityCityCountryMaster, FacilityAliasMaster
} from '../../../core/services/Data';
import {saveAs} from 'file-saver';
import { PagerService } from '../../../core/services/PagerService';
import { NgbModal, NgbActiveModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { ScoreService, FrequencyDetails, CreateScoreDetails } from '../../../core/services/ScoreService';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap, switchMap, catchError, delay } from 'rxjs/operators';
import { forkJoin } from "rxjs";
import { DatePipe } from '@angular/common'
import { ApprovalService } from '../../../core/services/ApprovalService';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { configuration } from '../../../../config/configuration';
import { AlertData, AlertMailService } from '../../../core/services/AlertMailService';
import { ActivatedRoute } from "@angular/router";
import { environment } from '../../../../environments/environment';
import { FileService, FileUpload } from '../../../core/services/File';

@Component({
    selector: 'rebar-approval',
    templateUrl: './approval.html',
    styleUrls: ['./approval.css']
})

export class ApprovalComponent implements OnInit {
    message = 'ZL/SDL View';

    constructor(private dataService: DataService, private pagerService: PagerService, private scoreDataService: ScoreService,
        private modalService: NgbModal, private datepipe: DatePipe, private approvalDataService: ApprovalService, private calendar: NgbCalendar
        , private alertMailService: AlertMailService, private route: ActivatedRoute, private fileService: FileService) {
        this.pageSize = this.selectedPageSize;
        this.pageSizeSubmit = this.selectedPageSizeSubmit;
        this.pageSizeView = this.selectedPageSizeView;
        if (location.href.toLocaleLowerCase().indexOf("local") != -1) {
            this.loggedEnterpriseId = 'sumit.al.sharma';
        }
        else {
            this.loggedEnterpriseId = sessionStorage["LoggedinUser"];
        }
    }


    //#region #region Main page Property

    //loading property
    loadingSymbol: boolean = true;
    noAccessMessage: string = configuration.NoAccessMessage;
    fullAccess: boolean = true;

    remarksBy: string = "";
    enterpriseId: string = "";
    loggedEnterpriseId: string = "";
    approveTransactionId: string = "-1";

    //paging proprty
    pager: any = {};
    count: number = 0;
    pageNumber: number = this.pagerService.pageNumber;
    pageSize: number = this.pagerService.pageSize;

    //pagingoption property
    pageOptions = this.pagerService.pageOptions;
    selectedPageSize: number = this.pagerService.selectedPageSize;

    //sorting property
    sortColumn: string = "TransactionDt";
    sortDirection: string = "desc";
    defaultSort: boolean = true;

    //filter property
    filterCount: number = 5;
    showMoreText: string = "Show More";
    showLessText: string = "Show Less";

    isActiveRole: string = "All";

    userData: any = null;
    userData1: any = null;
    packageFacilityDetails: any = null;
    PackageFacilityFilter: any = null;
    PackageFacilityAliasFilter: any = null;
    public cityDetails: CityMaster[];
    public facilityDetails: FacilityMaster[];
    public TotalFacilityDetails: FacilityMaster[];
    public cityFacilityDetails: any;
    public statusDetails: StatusMaster[];
    public vendorDetails: VendorMaster[];
    public frequencyDetails: FrequencyMaster[];
    public packageTypeDetails: PackageTypeMaster[];
    public ratingDetails: RatingMaster[];
    public monthYearDetails: MonthYear[];
    public facilityCityCountryDetails: FacilityCityCountryMaster[];
    public facilityAliasDetails: FacilityAliasMaster[];

    //#endregion


    //#region Filter Property

    //property used to toggle the filter
    public showPackageId: boolean = false;
    public showPackageType: boolean = false;
    public showCity: boolean = false;
    public showFacility: boolean = false;
    public showVendor: boolean = false;
    public showTransactionDate: boolean = false;
    public showStatus: boolean = false;
    public showFrequency: boolean = false;
    public showMonthYear: boolean = false;
    public enableClearAll: boolean = false;

    //property used to toggle the show more filter details
    public showMorePackageType: string = this.showMoreText;
    public showMoreCity: string = this.showMoreText;
    public showMoreFacility: string = this.showMoreText;
    public showMoreVendor: string = this.showMoreText;
    public showMoreStatus: string = this.showMoreText;
    public showMoreFrequency: string = this.showMoreText;
    public showMoreMonthYear: string = this.showMoreText;

    //property used to show count of filter
    public packageTypeCount: number = this.filterCount;
    public cityCount: number = this.filterCount;
    public facilityCount: number = this.filterCount;
    public vendorCount: number = this.filterCount;
    public statusCount: number = this.filterCount;
    public frequencyCount: number = this.filterCount;
    public monthYearCount: number = this.filterCount;

    //property used to store the selcted filter values
    public filteredArray: FilterDetails[];
    public selectedTransactionCode: string = "";
    public selectedPackageTypeIds: Array<number>;
    public selectedCityIds: Array<number>;
    public selectedFacilityIds: Array<number>;
    public selectedVendorIds: Array<number>;
    public selectedTransactionDate: NgbDateStruct;
    public selectedTransactionDateToday = this.calendar.getToday();
    public selectedStatusIds: Array<number>;
    public selectedFrequencyIds: Array<number>;
    public selectedMonthYearIds: Array<number>;

    //#endregion


    //#region Filter Methods

    //#region method used to toggle the filter
    togglePackageId() {
        this.showPackageId = !this.showPackageId;
    }
    togglePackageType() {
        this.showPackageType = !this.showPackageType;
    }
    toggleCity() {
        this.showCity = !this.showCity;
    }
    toggleFacility() {
        this.showFacility = !this.showFacility;
    }
    toggleVendor() {
        this.showVendor = !this.showVendor;
    }
    toggleTransactionDate() {
        this.showTransactionDate = !this.showTransactionDate;
    }
    toggleStatus() {
        this.showStatus = !this.showStatus;
    }
    toggleFrequency() {
        this.showFrequency = !this.showFrequency;
    }
    toggleMonthYear() {
        this.showMonthYear = !this.showMonthYear;
    }
    //#endregion

    //#region method used to toggle the show more filter details and filter count
    displayMoreFacility() {
        this.showMoreFacility = this.showMoreFacility == this.showMoreText ? this.showLessText : this.showMoreText;
        this.facilityCount = this.showMoreFacility == this.showMoreText ? this.filterCount : this.facilityDetails.length;
    }

    displayMoreCity() {
        this.showMoreCity = this.showMoreCity == this.showMoreText ? this.showLessText : this.showMoreText;
        this.cityCount = this.showMoreCity == this.showMoreText ? this.filterCount : this.cityDetails.length;
    }

    displayMoreStatus() {
        this.showMoreStatus = this.showMoreStatus == this.showMoreText ? this.showLessText : this.showMoreText;
        this.statusCount = this.showMoreStatus == this.showMoreText ? this.filterCount : this.statusDetails.length;
    }

    displayMoreVendor() {
        this.showMoreVendor = this.showMoreVendor == this.showMoreText ? this.showLessText : this.showMoreText;
        this.vendorCount = this.showMoreVendor == this.showMoreText ? this.filterCount : this.vendorDetails.length;
    }

    displayMoreFrequency() {
        this.showMoreFrequency = this.showMoreFrequency == this.showMoreText ? this.showLessText : this.showMoreText;
        this.frequencyCount = this.showMoreFrequency == this.showMoreText ? this.filterCount : this.frequencyDetails.length;
    }

    displayMorePackageType() {
        this.showMorePackageType = this.showMorePackageType == this.showMoreText ? this.showLessText : this.showMoreText;
        this.packageTypeCount = this.showMorePackageType == this.showMoreText ? this.filterCount : this.packageTypeDetails.length;
    }

    displayMoreMonthYear() {
        this.showMoreMonthYear = this.showMoreMonthYear == this.showMoreText ? this.showLessText : this.showMoreText;
        this.monthYearCount = this.showMoreMonthYear == this.showMoreText ? this.filterCount : this.monthYearDetails.length;
    }
    //#endregion

    //#region clear filter selection
    //method to clear all the selected filters
    clearAllFilter() {
        this.filteredArray = [];
        this.selectedTransactionCode = "";
        this.selectedPackageTypeIds = [];
        this.selectedCityIds = [];
        this.selectedFacilityIds = [];
        this.selectedVendorIds = [];
        this.selectedTransactionDate = null;
        this.selectedStatusIds = [];
        this.selectedFrequencyIds = [];
        this.selectedMonthYearIds = [];
        this.packageTypeDetails.forEach(
            x => { x.selected = false; }
        );
        this.cityDetails.forEach(
            x => { x.selected = false; }
        );
        this.facilityDetails.forEach(
            x => { x.selected = false; }
        );
        this.vendorDetails.forEach(
            x => { x.selected = false; }
        );
        this.statusDetails.forEach(
            x => { x.selected = false; }
        );
        this.frequencyDetails.forEach(
            x => { x.selected = false; }
        );
        this.monthYearDetails.forEach(
            x => { x.selected = false; }
        );
        this.enableClearAll = false;
        this.getFilteredData();
    }

    //method to clear single selected filter
    deleteFilter(e) {

        if (e.filterName == "transactionCode") {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "transactionCode");
            this.filteredArray.splice(index, 1);
            this.selectedTransactionCode = "";
        }
        else if (e.filterName == "transactionDate") {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "transactionDate");
            this.filteredArray.splice(index, 1);
            this.selectedTransactionDate = null;
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.text == e.text);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }

            if (e.filterName == "packageType") {
                debugger;
                const indexPackage: number = this.selectedPackageTypeIds.indexOf(e.value);
                if (index !== -1) {
                    this.selectedPackageTypeIds.splice(indexPackage, 1);
                    this.packageTypeDetails[this.packageTypeDetails.findIndex(item => item.packageId == e.value)].selected = false;
                }
            }
            else if (e.filterName == "city") {
                const indexCity: number = this.selectedCityIds.indexOf(e.value);
                if (index !== -1) {
                    this.selectedCityIds.splice(indexCity, 1);
                    this.cityDetails[this.cityDetails.findIndex(item => item.cityId == e.value)].selected = false;
                }
            }
            else if (e.filterName == "facility") {
                const indexFacility: number = this.selectedFacilityIds.indexOf(e.value);
                if (index !== -1) {
                    this.selectedFacilityIds.splice(indexFacility, 1);
                    this.facilityDetails[this.facilityDetails.findIndex(item => item.facilityId == e.value)].selected = false;
                }
            }
            else if (e.filterName == "vendor") {
                const indexVendor: number = this.selectedVendorIds.indexOf(e.value);
                if (index !== -1) {
                    this.selectedVendorIds.splice(indexVendor, 1);
                    this.vendorDetails[this.vendorDetails.findIndex(item => item.vendorId == e.value)].selected = false;
                }
            }
            else if (e.filterName == "status") {
                const indexStatus: number = this.selectedStatusIds.indexOf(e.value);
                if (index !== -1) {
                    this.selectedStatusIds.splice(indexStatus, 1);
                    this.statusDetails[this.statusDetails.findIndex(item => item.statusId == e.value)].selected = false;
                }
            }
            else if (e.filterName == "frequency") {
                const indexFrequency: number = this.selectedFrequencyIds.indexOf(e.value);
                if (index !== -1) {
                    this.selectedFrequencyIds.splice(indexFrequency, 1);
                    this.frequencyDetails[this.frequencyDetails.findIndex(item => item.frequencyId == e.value)].selected = false;
                }
            }
            else if (e.filterName == "monthYear") {
                const indexMonthYear: number = this.selectedMonthYearIds.indexOf(e.value);
                if (index !== -1) {
                    this.selectedMonthYearIds.splice(indexMonthYear, 1);
                    this.monthYearDetails[this.monthYearDetails.findIndex(item => item.MonthYearId == e.value)].selected = false;
                }
            }
        }
        this.getFilteredData();
    }
    //#endregion

    //#region method to select filter

    selectTransactionCode(e) {
        debugger;
        //e.preventDefault();
        const index: number = this.filteredArray != undefined ? this.filteredArray.findIndex(item => item.filterName == "transactionCode") : -1;
        if (index !== -1) {
            this.filteredArray.splice(index, 1);
        }
        if (this.filteredArray != undefined) {
            this.filteredArray.push({ value: -1, text: e.item, filterName: "transactionCode" });
        }
        else {
            this.filteredArray = [{ value: -1, text: e.item, filterName: "transactionCode" }]
        }
        this.selectedTransactionCode = e.item;
        //input.value = '';        
        this.getFilteredData();
    }

    searchTransactionCode() {
        debugger;
        if (this.selectedTransactionCode.trim() != "") {
            const index: number = this.filteredArray != undefined ? this.filteredArray.findIndex(item => item.filterName == "transactionCode") : -1;
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ value: -1, text: this.selectedTransactionCode.trim(), filterName: "transactionCode" });
            }
            else {
                this.filteredArray = [{ value: -1, text: this.selectedTransactionCode.trim(), filterName: "transactionCode" }]
            }
            this.getFilteredData();
        }
    }

    selectTransactionDate(e) {
        debugger;
        var date = new Date(e.year, e.month - 1, e.day);
        var transactionDate = this.datepipe.transform(date, 'yyyy-MM-dd');
        const index: number = this.filteredArray != undefined ? this.filteredArray.findIndex(item => item.filterName == "transactionDate") : -1;
        if (index !== -1) {
            this.filteredArray.splice(index, 1);
        }
        if (this.filteredArray != undefined) {
            this.filteredArray.push({ value: -1, text: transactionDate, filterName: "transactionDate" });
        }
        else {
            this.filteredArray = [{ value: -1, text: transactionDate, filterName: "transactionDate" }]
        }
        //this.selectedUniqueId = e; 
        this.getFilteredData();
    }

    selectPackageType(e) {
        if (e.selected) {
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ value: e.packageId, text: e.packageName, filterName: "packageType" });
            }
            else {
                this.filteredArray = [{ value: e.packageId, text: e.packageName, filterName: "packageType" }]
            }

            if (this.selectedPackageTypeIds != undefined) {
                this.selectedPackageTypeIds.push(e.packageId);
            }
            else {
                this.selectedPackageTypeIds = [e.packageId];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "packageType" && item.value == e.packageId);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexPackageType: number = this.selectedPackageTypeIds.indexOf(e.packageId);
            if (index !== -1) {
                this.selectedPackageTypeIds.splice(indexPackageType, 1);
            }
        }
        this.getFilteredData();
    }

    selectCity(e) {
        if (e.selected) {
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ value: e.cityId, text: e.cityName, filterName: "city" });
            }
            else {
                this.filteredArray = [{ value: e.cityId, text: e.cityName, filterName: "city" }]
            }

            if (this.selectedCityIds != undefined) {
                this.selectedCityIds.push(e.cityId);
            }
            else {
                this.selectedCityIds = [e.cityId];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "city" && item.value == e.cityId);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexCity: number = this.selectedCityIds.indexOf(e.cityId);
            if (index !== -1) {
                this.selectedCityIds.splice(indexCity, 1);
            }
        }
        // this.selectedFacilityIds = [];
        // if (this.selectedCityIds != undefined) {
        //     if(this.selectedCityIds.length !== 0){
        //         let facilityIds = this.cityFacilityDetails.filter(x => this.selectedCityIds.includes(x.CityId)).map(x=>x.FacilityId);
        //         this.facilityDetails = this.TotalFacilityDetails.filter(u => facilityIds.includes(u.facilityId));
        //     }
        //     else{
        //         let facilityIds = this.packageFacilityDetails.map(x=>x.FacilityId);
        //         this.facilityDetails = this.TotalFacilityDetails.filter(u => facilityIds.includes(u.facilityId));
        //     }
        // }
        this.getFilteredData();
    }

    selectFacility(e) {
        if (e.selected) {
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ value: e.facilityId, text: e.facilityName, filterName: "facility" });
            }
            else {
                this.filteredArray = [{ value: e.facilityId, text: e.facilityName, filterName: "facility" }]
            }

            if (this.selectedFacilityIds != undefined) {
                this.selectedFacilityIds.push(e.facilityId);
            }
            else {
                this.selectedFacilityIds = [e.facilityId];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "facility" && item.value == e.facilityId);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexFacility: number = this.selectedFacilityIds.indexOf(e.facilityId);
            if (index !== -1) {
                this.selectedFacilityIds.splice(indexFacility, 1);
            }
        }
        this.getFilteredData();
    }

    selectVendor(e) {
        if (e.selected) {
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ value: e.vendorId, text: e.vendorName, filterName: "vendor" });
            }
            else {
                this.filteredArray = [{ value: e.vendorId, text: e.vendorName, filterName: "vendor" }]
            }

            if (this.selectedVendorIds != undefined) {
                this.selectedVendorIds.push(e.vendorId);
            }
            else {
                this.selectedVendorIds = [e.vendorId];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "vendor" && item.value == e.vendorId);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexVendor: number = this.selectedVendorIds.indexOf(e.vendorId);
            if (index !== -1) {
                this.selectedVendorIds.splice(indexVendor, 1);
            }
        }
        this.getFilteredData();
    }

    selectStatus(e) {
        if (e.selected) {
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ value: e.statusId, text: e.statusName, filterName: "status" });
            }
            else {
                this.filteredArray = [{ value: e.statusId, text: e.statusName, filterName: "status" }]
            }

            if (this.selectedStatusIds != undefined) {
                this.selectedStatusIds.push(e.statusId);
            }
            else {
                this.selectedStatusIds = [e.statusId];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "status" && item.value == e.statusId);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexStatus: number = this.selectedStatusIds.indexOf(e.statusId);
            if (index !== -1) {
                this.selectedStatusIds.splice(indexStatus, 1);
            }
        }
        this.getFilteredData();
    }

    selectFrequency(e) {
        if (e.selected) {
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ value: e.frequencyId, text: e.frequencyName, filterName: "frequency" });
            }
            else {
                this.filteredArray = [{ value: e.frequencyId, text: e.frequencyName, filterName: "frequency" }]
            }

            if (this.selectedFrequencyIds != undefined) {
                this.selectedFrequencyIds.push(e.frequencyId);
            }
            else {
                this.selectedFrequencyIds = [e.frequencyId];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "frequency" && item.value == e.frequencyId);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexFrequency: number = this.selectedFrequencyIds.indexOf(e.frequencyId);
            if (index !== -1) {
                this.selectedFrequencyIds.splice(indexFrequency, 1);
            }
        }
        this.getFilteredData();
    }

    selectMonthYear(e) {
        if (e.selected) {
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ value: e.MonthYearId, text: e.MonthYearNm, filterName: "monthYear" });
            }
            else {
                this.filteredArray = [{ value: e.MonthYearId, text: e.MonthYearNm, filterName: "monthYear" }]
            }

            if (this.selectedMonthYearIds != undefined) {
                this.selectedMonthYearIds.push(e.MonthYearId);
            }
            else {
                this.selectedMonthYearIds = [e.MonthYearId];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "monthYear" && item.value == e.MonthYearId);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexMonthYear: number = this.selectedMonthYearIds.indexOf(e.MonthYearId);
            if (index !== -1) {
                this.selectedMonthYearIds.splice(indexMonthYear, 1);
            }
        }
        this.getFilteredData();
    }
    //#endregion

    //#endregion


    ngOnInit() {
        debugger;
        this.approveTransactionId = this.route.snapshot.paramMap.get("id");
        if (this.approveTransactionId == null) this.approveTransactionId = "-1";

        
        this.dataService.getMonthYear().subscribe(
            data => {
                this.monthYearDetails = data;
            }
        );
        this.dataService.getRatingDetials().subscribe(
            data => {
                this.ratingDetails = data;
            }
        );
        this.dataService.getStatusDetails().subscribe(
            data => {
                this.statusDetails = data.filter(x => x.statusName != configuration.Draft);
            }
        );
        this.dataService.getFrequencyDetails().subscribe(
            data => {
                this.frequencyDetails = data;
            }
        );
        let pagePath = location.pathname;
        if (this.approveTransactionId != "-1" && this.approveTransactionId != null) {
            pagePath = pagePath.substring(0, pagePath.lastIndexOf('/'))
        }
        this.dataService.getRoleNameForRemarksByColumn(this.loggedEnterpriseId, pagePath).subscribe(
            data => {
                if (data.length != 0) {
                    this.remarksBy = data[0].RoleName;
                    //console.log("Remarks By: " + this.remarksBy);
                }

            }
        );
        this.dataService.getPackageFacilityDetailsByPage(this.loggedEnterpriseId, pagePath).subscribe(
            data => {
                if (data.length != 0) {
                    this.packageFacilityDetails = data;
                    var PackageFacilityFilter = " AND (";
                    var ORCondition = "";
                    for (var i = 0; i < data.length; i++) {
                        var PackageId = data[i].PackageId;
                        var FacilityId = data[i].FacilityId;
                        PackageFacilityFilter = PackageFacilityFilter + ORCondition + "(PackageId=" + PackageId + " AND FacilityId=" + FacilityId + ")";
                        ORCondition = " OR ";
                    }
                    PackageFacilityFilter = PackageFacilityFilter + ")";
                    this.PackageFacilityFilter = PackageFacilityFilter;
                    this.PackageFacilityAliasFilter = PackageFacilityFilter.replace(/FacilityId/gi,"FacilityAliasId");
                    let facilityIds = this.packageFacilityDetails.map(x => x.FacilityId);
                    let packageIds = this.packageFacilityDetails.map(x => x.PackageId);
                    let FacilityDetails = this.dataService.getFacilityAliasDetails();
                    let VendorDetails = this.dataService.getVendorDetails();
                    let PackageTypeDetails = this.dataService.getPackageTypeDetails();
                    let Score = this.approvalDataService.getApprovalData(this.pageNumber, this.sortColumn, this.sortDirection, this.pageSize, this.enterpriseId, PackageFacilityFilter, this.approveTransactionId);
                    forkJoin([FacilityDetails, VendorDetails, PackageTypeDetails, Score]).subscribe(results => {
                        let facility = results[0];
                        let vendor = results[1];
                        let packages = results[2];
                        let socore = results[3];
                        this.TotalFacilityDetails = facility;
                        this.facilityDetails = facility.filter(u => facilityIds.includes(u.facilityId));
                        this.vendorDetails = vendor;
                        this.packageTypeDetails = packages.filter(u => packageIds.includes(u.packageId));
                        this.userData = socore;
                        this.count = this.userData[0][0].TotalRecordCount;
                        this.setPager();
                        this.loadingSymbol = false;
                    });

                    let FacilityCityCountryDetails = this.dataService.FacilityCityCountryDetails();
                    let FacilityAliasDetails = this.dataService.FacilityAliasDetails();
                    forkJoin([FacilityCityCountryDetails, FacilityAliasDetails]).subscribe(results => {
                        let FacilityCityCountry = results[0];
                        let FacilityAlias = results[1];
                        this.facilityCityCountryDetails = FacilityCityCountry;
                        this.facilityAliasDetails = FacilityAlias;
                        var cityDetails = [];
                        let appFacilityIds = Array.from(new Set(this.facilityAliasDetails.filter(x => facilityIds.includes(x.FacilityAliasId)).map(x => x.FacilityId)));
                        let cityIds = Array.from(new Set(this.facilityCityCountryDetails.filter(x => appFacilityIds.includes(x.FacilityId)).map(x => x.CityId)));
                        for (var i = 0; i < cityIds.length; i++) {
                            var CityId = this.facilityCityCountryDetails.find(x => x.CityId == cityIds[i]).CityId;
                            var CityName = this.facilityCityCountryDetails.find(x => x.CityId == cityIds[i]).CityName;
                            cityDetails.push({ cityId: CityId, cityName: CityName, selected: false });
                        }
                        this.cityDetails = cityDetails;
                    });

                    // let CityDetails = this.dataService.getCityDetails();
                    // let CityFacilityDetails = this.dataService.getCityFacilityDetailsByFacilityIds(facilityIds.toString());
                    // forkJoin([CityDetails, CityFacilityDetails]).subscribe(results => {
                    //     let city = results[0];
                    //     let cityFacility = results[1];
                    //     this.cityFacilityDetails = cityFacility;
                    //     let cityIds = Array.from(new Set(cityFacility.filter(u => facilityIds.includes(u.FacilityId)).map(x => x.CityId)));
                    //     this.cityDetails = city.filter(u => cityIds.includes(u.cityId));
                    // });               
                }
                else {
                    this.loadingSymbol = false;
                    this.fullAccess = false;
                }
            }
        );
    }

    //#region Grid Data
    //Called this method to get filtered data with role
    roleWiseView(e) {
        debugger;
        let role = e.target.text;
        this.isActiveRole = (role == "My Approval(s)") ? "My Approval(s)" : (role == "All" ? "All" : "");
        if (this.isActiveRole == "My Approval(s)") {
            this.enterpriseId = this.loggedEnterpriseId;
        }
        else {
            this.enterpriseId = "";
        }
        //this.reset();
        this.getFilteredData();
    }

    //reset paging and sorting to default
    reset() {
        this.pager = {};
        this.count = 0;
        this.pageNumber = this.pagerService.pageNumber;
        this.pageSize = this.pagerService.pageSize;
        this.selectedPageSize = this.pagerService.selectedPageSize;
        this.pageSize = this.selectedPageSize;
        this.sortColumn = "TransactionDt";
        this.sortDirection = "desc";
        this.defaultSort = true;
    }

    //Called this method to get filtered data
    public getFilteredData(): void {
        debugger;
        this.loadingSymbol = true;
        let length: number = this.filteredArray != undefined ? this.filteredArray.length : 0;
        if (length == 0) {
            this.enableClearAll = false;
            this.approvalDataService.getApprovalData(this.pageNumber, this.sortColumn, this.sortDirection, this.pageSize, this.enterpriseId, this.PackageFacilityFilter, this.approveTransactionId).subscribe(
                data => {
                    this.userData = data;
                    if (this.userData != null) {
                        this.count = this.userData[0][0].TotalRecordCount;
                    }
                    this.setPager();
                    this.loadingSymbol = false;
                }
            );
        }
        else {
            let selectedFacilityId = null;
            let data1 = [];
            if (this.selectedFacilityIds != undefined) {
                if (this.selectedFacilityIds.length != 0) {
                    data1.push(this.packageFacilityDetails.filter(u => this.selectedFacilityIds.includes(u.FacilityId)));
                    selectedFacilityId = [this.selectedFacilityIds.map(x => x)];
                }
            }
            else if (this.selectedCityIds != undefined) {
                if (this.selectedCityIds.length != 0) {
                    let facilityIds = this.facilityCityCountryDetails.filter(u => this.selectedCityIds.includes(u.CityId)).map(x => x.FacilityId);
                    let facilityAliasIds = this.facilityAliasDetails.filter(u => facilityIds.includes(u.FacilityId)).map(x => x.FacilityAliasId);
                    selectedFacilityId = [facilityAliasIds];
                    data1.push(this.packageFacilityDetails.filter(u => facilityAliasIds.includes(u.FacilityId)));
                }
            }
            if (this.selectedPackageTypeIds != undefined) {
                if (this.selectedPackageTypeIds.length != 0) {
                    data1.push(this.packageFacilityDetails.filter(u => this.selectedPackageTypeIds.includes(u.PackageId)));
                }
            }
            if (data1.length == 0) {
                data1.push(this.packageFacilityDetails);
            }
            let data = data1[0];
            //let data = this.selectedFacilityIds != undefined ? (this.selectedFacilityIds.length != 0 ? this.packageFacilityDetails.filter(u => this.selectedFacilityIds.includes(u.FacilityId)) : this.packageFacilityDetails) : this.packageFacilityDetails;
            //data = this.selectedPackageTypeIds != undefined ? (this.selectedPackageTypeIds.length != 0 ? this.packageFacilityDetails.filter(u => this.selectedPackageTypeIds.includes(u.PackageId)) : this.packageFacilityDetails) : this.packageFacilityDetails;
            var PackageFacilityFilter = " AND (";
            var ORCondition = "";
            for (var i = 0; i < data.length; i++) {
                var PackageId = data[i].PackageId;
                var FacilityId = data[i].FacilityId;
                PackageFacilityFilter = PackageFacilityFilter + ORCondition + "(PackageId=" + PackageId + " AND FacilityId=" + FacilityId + ")";
                ORCondition = " OR ";
            }
            PackageFacilityFilter = PackageFacilityFilter + ")";
            var transactionDate = "";
            if (this.selectedTransactionDate != null) {
                var date = new Date(this.selectedTransactionDate.year, this.selectedTransactionDate.month - 1, this.selectedTransactionDate.day);
                transactionDate = this.datepipe.transform(date, 'yyyy-MM-dd');
            }
            this.enableClearAll = true;



            let StartDttm = ""; let EndDttm = "";
            let MonthYearFilter = "";
            if (this.selectedMonthYearIds != undefined) {
                if (this.selectedMonthYearIds.length != 0) {
                    MonthYearFilter = "  AND (";
                    var ORCondition1 = "";
                    for (var i = 0; i < this.selectedMonthYearIds.length; i++) {
                        StartDttm = this.monthYearDetails.filter(u => u.MonthYearId == this.selectedMonthYearIds[i]).map(x => x.StartDttm).toString();
                        EndDttm = this.monthYearDetails.filter(u => u.MonthYearId == this.selectedMonthYearIds[i]).map(x => x.EndDttm).toString();
                        MonthYearFilter = MonthYearFilter + ORCondition1 + "(TransactionDt between '" + StartDttm + "' AND '" + EndDttm + "')";
                        ORCondition1 = " OR ";
                    }
                    MonthYearFilter = MonthYearFilter + ")";
                }
            }
            this.approvalDataService.getApprovalDataByFilter(this.selectedTransactionCode, this.selectedPackageTypeIds, selectedFacilityId, this.selectedVendorIds, this.selectedStatusIds
                , transactionDate, this.pageNumber, this.sortColumn, this.sortDirection, this.pageSize, this.enterpriseId, PackageFacilityFilter, MonthYearFilter, this.approveTransactionId).subscribe(
                    data => {
                        this.userData = data;
                        if (this.userData != null) {
                            this.count = this.userData[0][0].TotalRecordCount;
                        }
                        this.setPager();
                        this.loadingSymbol = false;
                    }
                );
        }
    }

    setPager() {
        debugger;
        this.pager = this.pagerService.getPager(this.count, this.pageNumber, this.pageSize);
        //var data = this.userData[0].Transaction.slice(this.pager.startIndex, this.pager.endIndex + 1);
        const userData1 = this.userData[0][0].Transaction;//data;
        const facilityDetails = this.facilityDetails;
        const statusDetails = this.statusDetails;
        const vendorDetails = this.vendorDetails;
        const packageTypeDetails = this.packageTypeDetails;
        const result1 = userData1.map(val => {
            return Object.assign({}, val, facilityDetails.filter(v => v.facilityId === val.FacilityId)[0],
                vendorDetails.filter(v => v.vendorId === val.ServiceProviderId)[0], packageTypeDetails.filter(v => v.packageId === val.PackageId)[0]);
        });
        this.userData1 = result1;
        this.userData1.forEach((x) => {
            var dt=new Date(x.SubmittedOn);
            dt.setHours(dt.getHours()-5);
            dt.setMinutes(dt.getMinutes()-30);
            x.SubmittedOn=new Date(dt).toUTCString();
        });
    }

    //Called this method on sorting
    sorting(sortColumn: string) {
        if (this.defaultSort && this.sortColumn == sortColumn) {
            this.sortColumn = sortColumn;
            this.sortDirection = "asc";
            this.defaultSort = false;
        }
        else {
            this.defaultSort = false;
        }
        if (this.sortColumn != sortColumn) {
            this.sortColumn = sortColumn;
            this.sortDirection = "asc";
        }
        else {
            this.sortColumn = sortColumn;
            this.sortDirection = this.sortDirection == "asc" ? "desc" : "asc";
        }
        this.getFilteredData();
    }

    //Called this method on paging
    setPage(page: number) {
        debugger;
        this.pageNumber = page;
        this.getFilteredData();
    }

    //Called this method on page option changes
    onPagingOptionsChange(e: number) {
        debugger;
        this.selectedPageSize = +e;
        this.pageSize = this.selectedPageSize;
        this.pageNumber = 1;
        this.getFilteredData();
    }

    //#endregion


    //#region Edit

    //create/edit popup fields  
    loadingSymbolForSubmitModal: boolean = false;
    createEditScoreHeader: string = "";
    transactionId: number = -1;
    transactionRefNo: string;
    statusName: string;
    packageName: string;
    facilityName: string;
    vendorName: string;
    periodDate: string;
    facilityId: number = -1;
    packageTypeId: number = -1;
    vendorId: number = -1;
    submitScoreData: any;
    submitScoreDataDisplay: any;
    scoreCard: any;
    TotalWeightageScore: number;
    penalty: number;
    comments: string;
    showKPIScoreCard: boolean = false;
    showWC: boolean = false;
    functionOLADetails: any;
    functionDetails: any;
    uploadedFile: string;

    //paging proprty
    pagerSubmit: any = {};
    countSubmit: number = 0;
    pageNumberSubmit: number = this.pagerService.pageNumberView;
    pageSizeSubmit: number = this.pagerService.pageSizeView;

    //pagingoption property
    pageOptionsSubmit = this.pagerService.pageOptionsView;
    selectedPageSizeSubmit: number = this.pagerService.selectedPageSizeView;

    //sorting property
    sortColumnSubmit: string = "OLADate";
    sortDirectionSubmit: string = "asc";
    defaultSortSubmit: boolean = true;

    editScore(submitScoreModal, e) {
        debugger;
        this.loadingSymbolForSubmitModal = true;
        this.createEditScoreHeader = e.TransactionRefNo;
        this.transactionId = e.TransactionId;
        this.transactionRefNo = e.TransactionRefNo;
        this.statusName = e.StatusNm;
        this.packageName = e.packageName;
        this.facilityName = e.facilityName;
        this.vendorName = e.vendorName;
        this.periodDate = this.datepipe.transform(e.TransactionDt, 'yyyy-MM-dd');
        this.packageTypeId = e.PackageId;
        this.vendorId = e.ServiceProviderId;
        this.facilityId = e.FacilityId;
        var date: Date = new Date(this.periodDate);
        var year: number = date.getFullYear();
        var month: number = date.getMonth();
        var lastDay: Date = new Date(year, month + 1, 0);
        var firstDay: Date = new Date(year, month, 1);
        this.getSubmitData();
        this.scoreDataService.getFunctionOLADetials(this.packageTypeId, -1).subscribe(
            data => {
                let DailyWeeklYFortnightlyContains = data.filter(x => x.Frequency == configuration.Daily || x.Frequency == configuration.Weekly || x.Frequency == configuration.Fortnightly).length;
                this.getScoreCard(firstDay, lastDay, date, DailyWeeklYFortnightlyContains);
            }
        );
        //this.getScoreCard(firstDay, lastDay, date);
        if (this.packageName == configuration.Carpet && lastDay.getDate() == date.getDate()) {
            this.getWCDetails(firstDay, lastDay);
        }
        this.fileService.getFileName(e.TransactionRefNo).subscribe(
            data => {
                if (data['Contents'].length > 0) {
                    this.uploadedFile = data['Contents'][0].Key.substring(data['Contents'][0].Key.lastIndexOf('/') + 1);;
                }
            });
        this.modalService.open(submitScoreModal, { backdrop: 'static', keyboard: false, windowClass: "edit" });
    }

    //Called this method to get filtered data
    getSubmitData() {
        debugger;
        let functionOlaDetails = this.scoreDataService.getFunctionOLADetials(this.packageTypeId, -1);
        let transactionDetails = this.scoreDataService.getTransactionDetials(this.transactionId);//this.scoreDataService.getSubmitScoreDetials(this.transactionId, this.pageNumber, this.sortColumn, this.sortDirection, this.pageSize);
        forkJoin([functionOlaDetails, transactionDetails]).subscribe(results => {
            let functionOla = results[0];
            let transactions = results[1];
            this.functionOLADetails = functionOla;
            const transaction = transactions.map(val => {
                return Object.assign({}, val, this.ratingDetails.filter(v => v.RatingId === val.RatingId)[0]);
            });
            const functionOLA = functionOla.map(val => {
                return Object.assign({}, val, this.frequencyDetails.filter(v => v.frequencyId === val.FrequencyId)[0]);
            });
            const result = transaction.map(val => {
                return Object.assign({}, val, functionOLA.filter(v => v.FunctionId === val.FunctionId && v.OLAId == val.OLAId)[0]);
            });
            this.submitScoreData = result;
            this.countSubmit = this.submitScoreData.length;
            this.setPagerSubmit();
        });
    }

    //Get KPI ScoreCard in Submit Score popup
    getScoreCard(firstDay: Date, lastDay: Date, date: Date, DailyWeeklYFortnightlyContains: number) {
        debugger;
        if (lastDay.getDate() == date.getDate() && DailyWeeklYFortnightlyContains !== 0) {
            let sundayCount: number = 0;
            for (var i = 1; i <= lastDay.getDate(); i++) {
                var newDate = new Date(lastDay.getFullYear(), lastDay.getMonth(), i)
                if (newDate.getDay() == 0) {
                    sundayCount += 1;
                }
            }
            var transactionStartDate = this.datepipe.transform(firstDay, 'yyyy-MM-dd');
            var transactionEndDate = this.datepipe.transform(lastDay, 'yyyy-MM-dd');
            let getFunctionOLADetials = this.scoreDataService.getFunctionOLADetials(this.packageTypeId, -1);
            let getFunctionDetials = this.scoreDataService.getFunctionDetials(this.packageTypeId);
            let getMonthlyScoreCard = this.scoreDataService.getMonthlyScoreCard(this.transactionId, this.vendorId, this.packageTypeId, this.facilityId, transactionStartDate, transactionEndDate)
            forkJoin([getFunctionOLADetials, getFunctionDetials, getMonthlyScoreCard]).subscribe(
                results => {
                    this.functionOLADetails = results[0];
                    this.functionDetails = results[1];
                    let transactions = results[2];
                    const result = transactions.map(val => {
                        return Object.assign({}, val, this.functionOLADetails.filter(v => v.FunctionId === val.FunctionId && v.OLAId === val.OLAId)[0]
                            , this.ratingDetails.filter(v => v.RatingId === val.RatingId)[0]);
                    });
                    var finalResult = [];
                    var functionIds = Array.from(new Set(result.map(x => x.FunctionId))).map(x => x);
                    var OLAIds = Array.from(new Set(result.map(x => x.OLAId))).map(x => x);
                    var applicableFunctionOLADetails = this.functionOLADetails.filter(u => OLAIds.includes(u.OLAId));
                    //let optionalOLAScoredNA = result.findIndex(x => x.RatingNm == configuration.NA);
                    var functionDetails = [];
                    // if (optionalOLAScoredNA != -1) {
                    //     var weightageSum = 0;
                    //     var NAfunctionIds = Array.from(new Set(result.filter(x => x.RatingNm == configuration.NA).map(x => x.FunctionId)));
                    //     var weightageSum = 0;
                    //     for (var i = 0; i < NAfunctionIds.length; i++) {
                    //         weightageSum += this.functionDetails.find(x => x.FunctionId == NAfunctionIds[i]).Weightage
                    //     }
                    //     var notOptionalFunctionLength = Array.from(new Set(applicableFunctionOLADetails.filter(x => x.IsOptional == 0).map(x => x.FunctionId))).length;
                    //     var avgWeightage = notOptionalFunctionLength != 0 ? weightageSum / notOptionalFunctionLength : 0;
                    // }
                    for (var i = 0; i < this.functionDetails.length; i++) {
                        var fun =
                        {
                            FunctionId: this.functionDetails[i].FunctionId,
                            FunctionNm: this.functionDetails[i].FunctionNm,
                            //Weightage: optionalOLAScoredNA == -1 ? this.functionDetails[i].Weightage : (NAfunctionIds.findIndex(x => x == this.functionDetails[i].FunctionId) == -1 ? this.functionDetails[i].Weightage + avgWeightage : 0),
                            Weightage: this.functionDetails[i].Weightage,
                            OLACnt: applicableFunctionOLADetails.filter(x => x.FunctionId == this.functionDetails[i].FunctionId).length,
                            IsOptional: this.functionDetails[i].IsOptional
                        };
                        functionDetails.push(fun);
                    }
                    for (var i = 0; i < functionIds.length; i++) {
                        var FunctionNm = result.find(x => x.FunctionId == functionIds[i]).FunctionNm;
                        var Weightage = functionDetails.find(x => x.FunctionId == functionIds[i]).Weightage;
                        var OLACnt = functionDetails.find(x => x.FunctionId == functionIds[i]).OLACnt;;
                        var Score = 0;
                        Score = Score + (result.filter(x => x.Frequency == configuration.Daily && x.FunctionId == functionIds[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / lastDay.getDate()) * Weightage / OLACnt / 100;
                        Score = Score + (result.filter(x => x.Frequency == configuration.Weekly && x.FunctionId == functionIds[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / sundayCount) * Weightage / OLACnt / 100;
                        Score = Score + (result.filter(x => x.Frequency == configuration.Fortnightly && x.FunctionId == functionIds[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / 2) * Weightage / OLACnt / 100;
                        Score = Score + (result.filter(x => x.Frequency !== configuration.Daily && x.Frequency !== configuration.Weekly && x.Frequency !== configuration.Fortnightly && x.FunctionId == functionIds[i])
                            .reduce((sum, Score) => sum + Score.RatingScore, 0)) * Weightage / OLACnt / 100;
                        finalResult.push({ FunctionId: functionIds[i], FunctionNm: FunctionNm, ScoreWeightage: Weightage, Score: Score });
                    }
                    this.TotalWeightageScore = finalResult.reduce((sum, Score) => sum + Score.Score, 0);
                    this.scoreCard = finalResult;
                    var getPenaltyByPackage =this.scoreDataService.getPenaltyByPackage(this.vendorId, this.packageTypeId, this.TotalWeightageScore);
                    var getPenaltyStructure =this.scoreDataService.getPenaltyStructureByPackageIdvendorId(this.vendorId, this.packageTypeId);
                    forkJoin([getPenaltyByPackage,getPenaltyStructure]).subscribe(
                        data => {
                            if (data[0].length !=0 && data[0][0].length != 0) {
                                this.penalty = data[0][0].Penalty;
                            }
                            else {
                                this.penalty = 0;
                            }
                            if(data[1].length != 0){
                                this.penaltyStructure=data[1];
                            }
                            
                        }
                    );
                    this.loadingSymbolForSubmitModal = false;
                }
            );
        }
        else {
            let getFunctionDetials = this.scoreDataService.getFunctionDetials(this.packageTypeId);
            let getScoreCard = this.scoreDataService.getScoreCard(this.transactionId);
            forkJoin([getFunctionDetials, getScoreCard]).subscribe(results => {
                let functionOla = results[0];
                let transactions = results[1];
                this.functionDetails = functionOla;
                const result = transactions.map(val => {
                    return Object.assign({}, val, this.functionDetails.filter(v => v.FunctionId === val.FunctionId)[0]);
                });
                this.TotalWeightageScore = transactions.reduce((sum, Score) => sum + Score.Score, 0);
                this.scoreCard = result;
                var getPenaltyByPackage =this.scoreDataService.getPenaltyByPackage(this.vendorId, this.packageTypeId, this.TotalWeightageScore);
                    var getPenaltyStructure =this.scoreDataService.getPenaltyStructureByPackageIdvendorId(this.vendorId, this.packageTypeId);
                    forkJoin([getPenaltyByPackage,getPenaltyStructure]).subscribe(
                        data => {
                            if (data[0].length !=0 && data[0][0].length != 0) {
                                this.penalty = data[0][0].Penalty;
                            }
                            else {
                                this.penalty = 0;
                            }
                            if(data[1].length != 0){
                                this.penaltyStructure=data[1];
                            }
                            
                        }
                    );
                this.loadingSymbolForSubmitModal = false;
            }
            );
        }
    }

    //WC properties
    WCCertificate: any;
    WCFacilityWise: any;
    WCFacilityWiseKeys: any;
    EditWCFacilityTowerWise: any;
    list_items: any;
    keys: any;
    //Get WC Details in Submit Score popup
    getWCDetails(firstDay: Date, lastDay: Date) {
        debugger;
        let sundayCount: number = 0;
        for (var i = 1; i <= lastDay.getDate(); i++) {
            var newDate = new Date(lastDay.getFullYear(), lastDay.getMonth(), i)
            if (newDate.getDay() == 0) {
                sundayCount += 1;
            }
        }
        var date = this.datepipe.transform(this.periodDate, 'yyyy-MM-dd');
        let getTaskIds = this.scoreDataService.getTaskIds(this.vendorId, date);
        let getTaskMasterByFacility = this.scoreDataService.getTaskMasterByFacility(this.facilityId,lastDay.getMonth()+1,lastDay.getFullYear());
        forkJoin([getTaskIds, getTaskMasterByFacility]).subscribe(results => {
            let taskDetails = results[0];
            let taskMaster = results[1];
            var taskDetailsTaskIds = taskMaster.map(x => x.TaskId);
            let taskMasterTaskIds = taskDetails.filter(u =>
                taskDetailsTaskIds.includes(u.TaskId)
            );
            let getWCFacilityTowerWise = this.scoreDataService.getWCFacilityTowerWise(this.facilityId,lastDay.getMonth()+1,lastDay.getFullYear());
            let getWCFacilityTowerTaskWise = this.scoreDataService.getWCFacilityTowerTaskWise(this.facilityId, taskMasterTaskIds.map(x => x.TaskId));
            let getUnitPriceWC = this.scoreDataService.getUnitPriceWC(this.vendorId);
            let getAchive=this.scoreDataService.getAchivedData(this.facilityId,this.vendorId,lastDay.getMonth()+1,lastDay.getFullYear());
            forkJoin([getWCFacilityTowerWise, getWCFacilityTowerTaskWise, getUnitPriceWC,getAchive]).subscribe(results => {
                let WCFacilityTowerWise = results[0][0];
                let WCFacilityTowerTaskWise = results[1][0];
                let UnitPriceWC = results[2];
                let AchivedArea=results[3];
                let acchivedvaccuming= AchivedArea.find(x=>x.WorkType=="Vaccuming")!=undefined?AchivedArea.find(x=>x.WorkType=="Vaccuming").AchievedArea:0;
                let acchivedEng= AchivedArea.find(x=>x.WorkType=="Encapulisation")!=undefined?AchivedArea.find(x=>x.WorkType=="Encapulisation").AchievedArea:0;
                let acchivedHot= AchivedArea.find(x=>x.WorkType=="Hot Water Extraction")!=undefined?AchivedArea.find(x=>x.WorkType=="Hot Water Extraction").AchievedArea:0;
                this.EditWCFacilityTowerWise = [];
                var Area = null;
                for (var i = 0; i < WCFacilityTowerWise.length; i++) {
                    let total = WCFacilityTowerWise[i].TowerDetails.map(x => x).filter(x => x.TOWERNm == "Total");
                    if (total.length != 0) {
                        var fun =
                        {
                            TowerId: WCFacilityTowerWise[i].TowerId,
                            TowerNm: WCFacilityTowerWise[i].TowerNm,
                            HighVaccumingTarget: total[0].High * lastDay.getDate(),
                            LowVaccumingTarget: total[0].Low * sundayCount,
                            HighEncapulisationTarget: total[0].High / 3,
                            LowEncapulisationTarget: total[0].Low / 6,
                            HighHotWaterExtractionTarget: total[0].High / 6,
                            LowHotWaterExtractionTarget: total[0].Low / 12,
                            TowerDetails: WCFacilityTowerWise[i].TowerDetails.map(val => {
                                return Object.assign({}, val, WCFacilityTowerTaskWise.find(x => x.TowerId == WCFacilityTowerWise[i].TowerId).TowerDetails.filter(v => v.TowerId === val.TowerId && v.FloorId == val.FloorId)[0]);
                            })
                        };
                        this.EditWCFacilityTowerWise.push(fun);
                    }
                    else{
                        this.EditWCFacilityTowerWise.push(WCFacilityTowerWise[i]);
                    }

                        if (Area == null) {
                            Area = this.EditWCFacilityTowerWise[i].TowerDetails.filter(x => x.TOWERNm == "Total");
                        } else {
                            let ar = this.EditWCFacilityTowerWise[i].TowerDetails.filter(x => x.TOWERNm == "Total");
                            Area = Area.concat(ar);
                        }
                    
                    
                } 
                let HighArea = Area.reduce((sum, area) => sum + area.High, 0);
                let LowArea = Area.reduce((sum, area) => sum + area.Low, 0);
                let HighVaccumingArea = Area.reduce((sum, area) => sum + (area.HighVaccuming != undefined ? area.HighVaccuming : 0), 0);
                let LowVaccumingArea = Area.reduce((sum, area) => sum + (area.LowVaccuming != undefined ? area.LowVaccuming : 0), 0);
                let HighEncapulisationArea = Area.reduce((sum, area) => sum + (area.HighEncapulisation != undefined ? area.HighEncapulisation : 0), 0);
                let LowEncapulisationArea = Area.reduce((sum, area) => sum + (area.LowEncapulisation != undefined ? area.LowEncapulisation : 0), 0);
                let HighHotWaterExtraction = Area.reduce((sum, area) => sum + (area.HighHotWaterExtraction != undefined ? area.HighHotWaterExtraction : 0), 0);
                let LowHotWaterExtraction = Area.reduce((sum, area) => sum + (area.LowHotWaterExtraction != undefined ? area.LowHotWaterExtraction : 0), 0);
                this.WCCertificate = [];
                let UnitPriceVaccuming = null; let UnitPriceEncapulisation = null; let UnitPriceHotWaterExtraction = null;
                if (UnitPriceWC.length != 0) {
                    UnitPriceVaccuming = UnitPriceWC.find(x => x.WorkType == "Vaccuming").UnitPrice;
                    UnitPriceEncapulisation = UnitPriceWC.find(x => x.WorkType == "Encapulisation").UnitPrice;
                    UnitPriceHotWaterExtraction = UnitPriceWC.find(x => x.WorkType == "Hot Water Extraction").UnitPrice;
                }
                this.WCCertificate.push({
                    CleaningType: "Vaccuming", TargetSqft: HighArea * lastDay.getDate() + LowArea * sundayCount,
                    SqftAchieved:  acchivedvaccuming, UnitPrice: UnitPriceVaccuming,
                    TotalPrice: acchivedvaccuming * UnitPriceVaccuming
                });
                this.WCCertificate.push({
                    CleaningType: "Encapulisation", TargetSqft: HighArea / 3 + LowArea / 6,
                    SqftAchieved: acchivedEng, UnitPrice: UnitPriceEncapulisation,
                    TotalPrice: acchivedEng * UnitPriceEncapulisation
                })
                this.WCCertificate.push({
                    CleaningType: "Hot Water Extraction", TargetSqft: HighArea / 6 + LowArea / 12,
                    SqftAchieved: acchivedHot, UnitPrice: UnitPriceHotWaterExtraction,
                    TotalPrice: acchivedHot * UnitPriceHotWaterExtraction
                })
                this.WCCertificate.push({
                    CleaningType: "Total", TargetSqft: HighArea * lastDay.getDate() + LowArea * sundayCount +  (HighArea / 3 + LowArea / 6)+( HighArea / 6 + LowArea / 12),
                    SqftAchieved:acchivedvaccuming+acchivedEng+acchivedHot, UnitPrice: null,
                    TotalPrice: acchivedvaccuming * UnitPriceVaccuming +
                         acchivedEng* UnitPriceEncapulisation +
                        acchivedHot * UnitPriceHotWaterExtraction
                })
            
            });
        });
        this.scoreDataService.getWCFacilityWise(this.facilityId).subscribe(
            data => {
                this.WCFacilityWise = data;
                this.WCFacilityWiseKeys = Object.keys(this.WCFacilityWise[0]);
                this.list_items = data;
                this.keys = Object.keys(this.list_items[0]); // Get the column names                 
            }
        )
    }

    setPagerSubmit() {
        debugger;
        this.pagerSubmit = this.pagerService.getPager(this.countSubmit, this.pageNumberSubmit, this.pageSizeSubmit);
        if (this.sortDirectionSubmit == "asc") {
            this.submitScoreDataDisplay = this.submitScoreData.sort((a, b) => a[this.sortColumnSubmit].localeCompare(b[this.sortColumnSubmit])).slice(this.pagerSubmit.startIndex, this.pagerSubmit.endIndex + 1);
        }
        else if (this.sortDirectionSubmit == "desc") {
            this.submitScoreDataDisplay = this.submitScoreData.sort((a, b) => b[this.sortColumnSubmit].localeCompare(a[this.sortColumnSubmit])).slice(this.pagerSubmit.startIndex, this.pagerSubmit.endIndex + 1);
        }
    }

    //Called this method on sorting
    sortingSubmit(sortColumn: string) {
        if (this.defaultSortSubmit && this.sortColumnSubmit == sortColumn) {
            this.sortColumnSubmit = sortColumn;
            this.sortDirectionSubmit = "asc";
            this.defaultSortSubmit = false;
        }
        else {
            this.defaultSortSubmit = false;
        }
        if (this.sortColumnSubmit != sortColumn) {
            this.sortColumnSubmit = sortColumn;
            this.sortDirectionSubmit = "asc";
        }
        else {
            this.sortColumnSubmit = sortColumn;
            this.sortDirectionSubmit = this.sortDirectionSubmit == "asc" ? "desc" : "asc";
        }
        this.setPagerSubmit();
    }

    //Called this method on paging
    setPageSubmit(page: number) {
        debugger;
        this.pageNumberSubmit = page;
        this.setPagerSubmit();
    }

    //Called this method on page option changes
    onPagingOptionsChangeSubmit(e: number) {
        debugger;
        this.selectedPageSizeSubmit = +e;
        this.pageSizeSubmit = this.selectedPageSizeSubmit;
        this.pageNumberSubmit = 1;
        this.setPagerSubmit();
    }

    approveScore() {
        debugger;
        this.loadingSymbolForSubmitModal = true;
        if (this.comments == "" || this.comments == null) {
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            modalRef.componentInstance.title = configuration.Mandatory;
            modalRef.componentInstance.message = configuration.SubmitValidation;
            this.loadingSymbolForSubmitModal = false;
        }
        else {
            this.confirm(configuration.Confirm, configuration.ConfirmApprove)
                .then((confirmed) => {
                    console.log(confirmed);
                    if (confirmed) {
                        this.scoreDataService.getTransactionStatus(this.transactionId).subscribe(
                            data => {
                                let currentStatusId = this.statusDetails.find(x => x.statusName == this.statusName).statusId;
                                if (data != currentStatusId) {
                                    const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                    modalRef.componentInstance.title = configuration.Alert;
                                    modalRef.componentInstance.message = configuration.TransactionApproveRevalidate;
                                    this.loadingSymbolForSubmitModal = false;
                                }
                                else {
                                    let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
                                    var statusId = this.statusDetails.find(x => x.statusName == configuration.ZLSDLApproved).statusId;
                                    let saveRemarks = this.approvalDataService.saveRemarks(this.transactionId, this.comments, this.loggedEnterpriseId, currentDate, this.remarksBy);
                                    let updateTransaction = this.approvalDataService.updateTransactionStatus(this.transactionId, statusId);
                                    let getCategoryNameByPackageId = this.dataService.getCategoryNameByPackageId(this.packageTypeId);
                                    forkJoin([saveRemarks, updateTransaction, getCategoryNameByPackageId]).subscribe(results => {
                                        //const d = results[0];
                                        //this.loadingSymbolForSubmitModal = false;
                                        var date1 = this.periodDate.toString();
                                        let transactionDate1 = this.datepipe.transform(date1, 'dd-MM-yyyy');
                                        let packageName = this.packageName;
                                        let transactionId = this.transactionId;
                                        let transactionRefNo = this.transactionRefNo;

                                        let categoryName = results[2][0].CategoryNm;
                                        let RoleIds: Array<String> = [];
                                        let GroupRoleName: string = "";
                                        if (categoryName == configuration.CategoryME) {
                                            RoleIds.push(configuration.RoleZL, configuration.RoleMELead, configuration.RoleCE, configuration.RoleSRMAdmin);
                                            GroupRoleName = configuration.RoleDEGroup;
                                        }
                                        else if (categoryName == configuration.CategorySoftServices) {
                                            RoleIds.push(configuration.RoleSDL, configuration.RoleWM, configuration.RoleCityLead, configuration.RoleSRMAdmin);
                                            GroupRoleName = configuration.RoleDMGroup;
                                        }
                                        let CCIds = this.dataService.GetMailerDetails(this.facilityId, this.packageTypeId, RoleIds);
                                        let VendorIds = this.dataService.getVendorEnterpriseId(this.facilityId, this.packageTypeId, this.vendorId);
                                        let GetGroupMailerDetails = this.dataService.GetGroupMailerDetails(this.facilityId, GroupRoleName);
                                        forkJoin([CCIds, VendorIds, GetGroupMailerDetails]).subscribe(data => {
                                            let To = data[1][0].EnterpriseId + ";";
                                            let Cc = "";
                                            let CcData = data[0];
                                            let groupData = data[2];
                                            for (var i = 0; i < groupData.length; i++) {
                                                if(groupData[i]["EnterpriseId"]!="" )
                                                Cc = Cc + groupData[i]["EnterpriseId"] + ";";
                                            }
                                            for (var i = 0; i < CcData.length; i++) {
                                                Cc = Cc + CcData[i]["EnterpriseId"] + ";";
                                            }
                                            To = Array.from(new Set(To.split(';'))).join(";").toString();
                                            Cc = Array.from(new Set(Cc.split(';'))).join(";").toString();
                                            var subject = transactionRefNo;
                                            let body = "<table>"
                                                + "<tr>Dear Users,</tr><br><br>"
                                                + "<tr>Please find below the score card/WCC for " + transactionDate1 + " for " + packageName + ". The detailed breakup is given below. </tr>"
                                                + "<tr>Kindly acknowledge the same in 2 working days.</tr>"
                                                + "<br>"
                                                + "<tr>Please use below link for details:</tr>"
                                                + "<tr><a href=" + environment.VendorURL + transactionId + ">Agree</a><tr>"
                                                + "<br><br>"
                                                + "<tr>Regards,</tr><br>"
                                                + "<tr>Service Relationship Management Team.</tr>"
                                                + "</table>";

                                            //Trigger Mails to Vendor for Approval
                                            this.alertMailService.SendEmail(body, subject, To, Cc, "ZLapproves").subscribe(
                                                data => {
                                                   
                                                });

                                            var subject1 = transactionRefNo + " - Approved";
                                            let body1 = "<table>"
                                                + "<tr>Dear Users,</tr><br><br>"
                                                + "<tr>Approved/Rejected : Approved</tr><br><br>"
                                                + "<tr>Regards,</tr><br>"
                                                + "<tr>Service Relationship Management Team.</tr>"
                                                + "</table>";
                                            var To1 = "";
                                            var Cc1 = "";
                                            if (categoryName == configuration.CategoryME) {
                                                for (var i = 0; i < groupData.length; i++) {
                                                    if(groupData[i]["EnterpriseId"]!=""){
                                                    Cc1 = Cc1 + groupData[i]["EnterpriseId"] + ";";
                                                    }
                                                }
                                                for (var i = 0; i < CcData.length; i++) {
                                                    if (CcData[i]["RoleNm"] == configuration.RoleCE)
                                                        To1 = To1 + CcData[i]["EnterpriseId"] + ";";
                                                    if (CcData[i]["RoleNm"] == configuration.RoleZL
                                                        || CcData[i]["RoleNm"] == configuration.RoleMELead || CcData[i]["RoleNm"] == configuration.RoleSRMAdmin)
                                                        Cc1 = Cc1 + CcData[i]["EnterpriseId"] + ";";
                                                }
                                            }
                                            else if (categoryName == configuration.CategorySoftServices) {
                                                for (var i = 0; i < groupData.length; i++) {
                                                    if(groupData[i]["EnterpriseId"]!=""){
                                                        Cc1 = Cc1 + groupData[i]["EnterpriseId"] + ";";
                                                        }
                                                }
                                                for (var i = 0; i < CcData.length; i++) {
                                                    if (CcData[i]["RoleNm"] == configuration.RoleWM)
                                                        To1 = To1 + CcData[i]["EnterpriseId"] + ";";
                                                    if (CcData[i]["RoleNm"] == configuration.RoleSDL
                                                        || CcData[i]["RoleNm"] == configuration.RoleCityLead || CcData[i]["RoleNm"] == configuration.RoleSRMAdmin)
                                                        Cc1 = Cc1 + CcData[i]["EnterpriseId"] + ";";
                                                }
                                            }
                                            To1 = Array.from(new Set(To1.split(';'))).join(";").toString();
                                            Cc1 = Array.from(new Set(Cc1.split(';'))).join(";").toString();
                                            //Trigger Mails to JLL for Appproval Acknowledgement
                                            this.alertMailService.SendEmail(body1, subject1, To1, Cc1, "ZLapprovesack").subscribe(
                                                data => {
                                                    debugger;
                                                    console.log(data);

                                                });                                            
                                        }
                                        );

                                        this.loadingSymbolForSubmitModal = false;
                                            this.getFilteredData();
                                            this.close(configuration.Success, configuration.TransactionApproved)
                                                .then((confirmed) => {
                                                    this.dismissSubmitScoreModal();
                                                })
                                                .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));

                                    });
                                }
                            }
                        );
                    }
                    else {
                        this.loadingSymbolForSubmitModal = false;
                    }
                })
                .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
        }
    }

    public confirm(title: string, message: string): Promise<boolean> {
        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.message = message;
        return modalRef.result;
    }

    public close(title: string, message: string): Promise<boolean> {
        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.message = message;
        return modalRef.result;
    }

    rejectScore() {
        this.loadingSymbolForSubmitModal = true;
        if (this.comments == "" || this.comments == null) {
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            modalRef.componentInstance.title = configuration.Mandatory;
            modalRef.componentInstance.message = configuration.SubmitValidation;
            this.loadingSymbolForSubmitModal = false;
        }
        else {
            this.confirm(configuration.Confirm, configuration.ConfirmReject)
                .then((confirmed) => {
                    console.log(confirmed);
                    if (confirmed) {
                        this.scoreDataService.getTransactionStatus(this.transactionId).subscribe(
                            data => {
                                let currentStatusId = this.statusDetails.find(x => x.statusName == this.statusName).statusId;
                                if (data != currentStatusId) {
                                    const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                    modalRef.componentInstance.title = configuration.Alert;
                                    modalRef.componentInstance.message = configuration.TransactionApproveRevalidate;
                                    this.loadingSymbolForSubmitModal = false;
                                }
                                else {
                                    let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
                                    var statusId = this.statusDetails.find(x => x.statusName == configuration.ZLSDLRejected).statusId;
                                    var date: Date = new Date(this.periodDate);
                                    var year: number = date.getFullYear();
                                    var month: number = date.getMonth();
                                    var lastDay: Date = new Date(year, month + 1, 0);
                                    let DailyWeeklYFortnightlyContains = this.functionOLADetails.filter(x => x.Frequency == configuration.Daily || x.Frequency == configuration.Weekly || x.Frequency == configuration.Fortnightly).length;
                                    if (lastDay.getDate() == date.getDate() && DailyWeeklYFortnightlyContains !== 0) {
                                        console.log("Bulk");
                                        let periodDate = this.datepipe.transform(this.periodDate, 'yyyy-MM-dd');
                                        let saveRemarks = this.approvalDataService.saveRemarksBulk(this.packageTypeId, this.vendorId, this.facilityId, periodDate, this.comments, this.loggedEnterpriseId, currentDate, this.remarksBy);
                                        let updateTransaction = this.approvalDataService.updateTransactionStatusBulk(this.packageTypeId, this.vendorId, this.facilityId, periodDate, statusId);
                                        let getCategoryNameByPackageId = this.dataService.getCategoryNameByPackageId(this.packageTypeId);
                                        forkJoin([saveRemarks, updateTransaction, getCategoryNameByPackageId]).subscribe(results => {
                                            //const d = results[0];
                                            //this.loadingSymbolForSubmitModal = false;

                                            let transactionRefNo = this.transactionRefNo;
                                            let comments = this.comments;

                                            let categoryName = results[2][0].CategoryNm;
                                            let RoleIds: Array<String> = [];
                                            let GroupRoleName: string = "";
                                            if (categoryName == configuration.CategoryME) {
                                                RoleIds.push(configuration.RoleZL, configuration.RoleMELead, configuration.RoleCE, configuration.RoleSRMAdmin);
                                                GroupRoleName = configuration.RoleDEGroup;
                                            }
                                            else if (categoryName == configuration.CategorySoftServices) {
                                                RoleIds.push(configuration.RoleSDL, configuration.RoleWM, configuration.RoleCityLead, configuration.RoleSRMAdmin);
                                                GroupRoleName = configuration.RoleDMGroup;
                                            }
                                            let GetMailerDetails = this.dataService.GetMailerDetails(this.facilityId, this.packageTypeId, RoleIds);
                                            let GetGroupMailerDetails = this.dataService.GetGroupMailerDetails(this.facilityId, GroupRoleName);
                                            forkJoin([GetMailerDetails, GetGroupMailerDetails]).subscribe(results => {
                                                let ids = results[0];
                                                let groupIds = results[1];
                                                var subject = transactionRefNo + " - Rejected";
                                                let body = "<table>"
                                                    + "<tr>Dear Users,</tr><br><br>"
                                                    + "<tr>Approved/Rejected : Rejected </tr><br>"
                                                    + "<tr>Comments : " + comments + "</tr><br><br>"
                                                    + "<tr>Regards,</tr><br>"
                                                    + "<tr>Service Relationship Management Team.</tr>"
                                                    + "</table>";
                                                var To = "";
                                                var Cc = "";
                                                if (categoryName == configuration.CategoryME) {
                                                    for (var i = 0; i < groupIds.length; i++) {
                                                        if(groupIds[i]["EnterpriseId"]!=""){
                                                            Cc = Cc + groupIds[i]["EnterpriseId"] + ";";
                                                            }
                                                    }
                                                    for (var i = 0; i < ids.length; i++) {
                                                        if (ids[i]["RoleNm"] == configuration.RoleCE)
                                                            To = To + ids[i]["EnterpriseId"] + ";";
                                                        if (ids[i]["RoleNm"] == configuration.RoleZL
                                                            || ids[i]["RoleNm"] == configuration.RoleMELead || ids[i]["RoleNm"] == configuration.RoleSRMAdmin)
                                                            Cc = Cc + ids[i]["EnterpriseId"] + ";";
                                                    }
                                                }
                                                else if (categoryName == configuration.CategorySoftServices) {
                                                    for (var i = 0; i < groupIds.length; i++) {
                                                        if(groupIds[i]["EnterpriseId"]!=""){
                                                        Cc = Cc + groupIds[i]["EnterpriseId"] + ";";
                                                        }
                                                    }
                                                    for (var i = 0; i < ids.length; i++) {
                                                        if (ids[i]["RoleNm"] == configuration.RoleWM)
                                                            To = To + ids[i]["EnterpriseId"] + ";";
                                                        if (ids[i]["RoleNm"] == configuration.RoleSDL
                                                            || ids[i]["RoleNm"] == configuration.RoleCityLead || ids[i]["RoleNm"] == configuration.RoleSRMAdmin)
                                                            Cc = Cc + ids[i]["EnterpriseId"] + ";";
                                                    }
                                                }
                                                To = Array.from(new Set(To.split(';'))).join(";").toString();
                                                Cc = Array.from(new Set(Cc.split(';'))).join(";").toString();
                                                this.alertMailService.SendEmail(body, subject, To, Cc, "ZLapprovesack").subscribe(
                                                    data => {
                                                        debugger;
                                                        console.log(data);

                                                    });
                                            });

                                            this.loadingSymbolForSubmitModal = false;
                                            this.getFilteredData();
                                            this.close(configuration.Success, configuration.TransactionRejected)
                                                .then((confirmed) => {
                                                    this.dismissSubmitScoreModal();
                                                })
                                                .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));


                                        });
                                    }
                                    else {
                                        console.log("NotBulk");
                                        let saveRemarks = this.approvalDataService.saveRemarks(this.transactionId, this.comments, this.loggedEnterpriseId, currentDate, this.remarksBy);
                                        let updateTransaction = this.approvalDataService.updateTransactionStatus(this.transactionId, statusId);
                                        let getCategoryNameByPackageId = this.dataService.getCategoryNameByPackageId(this.packageTypeId);
                                        forkJoin([saveRemarks, updateTransaction, getCategoryNameByPackageId]).subscribe(results => {

                                            let transactionRefNo = this.transactionRefNo;
                                            let comments = this.comments;

                                            let categoryName = results[2][0].CategoryNm;
                                            let RoleIds: Array<String> = [];
                                            let GroupRoleName: string = "";
                                            if (categoryName == configuration.CategoryME) {
                                                RoleIds.push(configuration.RoleZL, configuration.RoleMELead, configuration.RoleCE, configuration.RoleSRMAdmin);
                                                GroupRoleName = configuration.RoleDEGroup;
                                            }
                                            else if (categoryName == configuration.CategorySoftServices) {
                                                RoleIds.push(configuration.RoleSDL, configuration.RoleWM, configuration.RoleCityLead, configuration.RoleSRMAdmin);
                                                GroupRoleName = configuration.RoleDMGroup;
                                            }
                                            let GetMailerDetails = this.dataService.GetMailerDetails(this.facilityId, this.packageTypeId, RoleIds);
                                            let GetGroupMailerDetails = this.dataService.GetGroupMailerDetails(this.facilityId, GroupRoleName);
                                            forkJoin([GetMailerDetails, GetGroupMailerDetails]).subscribe(results => {
                                                let ids = results[0];
                                                let groupIds = results[1];
                                                var subject = transactionRefNo + " - Rejected";
                                                let body = "<table>"
                                                    + "<tr>Dear Users,</tr><br><br>"
                                                    + "<tr>Approved/Rejected : Rejected </tr><br>"
                                                    + "<tr>Comments : " + comments + "</tr><br><br>"
                                                    + "<tr>Regards,</tr><br>"
                                                    + "<tr>Service Relationship Management Team.</tr>"
                                                    + "</table>";
                                                var To = "";
                                                var Cc = "";
                                                if (categoryName == configuration.CategoryME) {
                                                    for (var i = 0; i < groupIds.length; i++) {
                                                        if(groupIds[i]["EnterpriseId"]!=""){
                                                            Cc = Cc + groupIds[i]["EnterpriseId"] + ";";
                                                            }
                                                    }
                                                    for (var i = 0; i < ids.length; i++) {
                                                        if (ids[i]["RoleNm"] == configuration.RoleCE)
                                                            To = To + ids[i]["EnterpriseId"] + ";";
                                                        if (ids[i]["RoleNm"] == configuration.RoleZL
                                                            || ids[i]["RoleNm"] == configuration.RoleMELead || ids[i]["RoleNm"] == configuration.RoleSRMAdmin)
                                                            Cc = Cc + ids[i]["EnterpriseId"] + ";";
                                                    }
                                                }
                                                else if (categoryName == configuration.CategorySoftServices) {
                                                    for (var i = 0; i < groupIds.length; i++) {
                                                        if(groupIds[i]["EnterpriseId"]!=""){
                                                            Cc = Cc + groupIds[i]["EnterpriseId"] + ";";
                                                            }
                                                    }
                                                    for (var i = 0; i < ids.length; i++) {
                                                        if (ids[i]["RoleNm"] == configuration.RoleWM)
                                                            To = To + ids[i]["EnterpriseId"] + ";";
                                                        if (ids[i]["RoleNm"] == configuration.RoleSDL
                                                            || ids[i]["RoleNm"] == configuration.RoleCityLead || ids[i]["RoleNm"] == configuration.RoleSRMAdmin)
                                                            Cc = Cc + ids[i]["EnterpriseId"] + ";";
                                                    }
                                                }
                                                To = Array.from(new Set(To.split(';'))).join(";").toString();
                                                Cc = Array.from(new Set(Cc.split(';'))).join(";").toString();
                                                this.alertMailService.SendEmail(body, subject, To, Cc, "ZLapprovesack").subscribe(
                                                    data => {
                                                        debugger;
                                                        console.log(data);

                                                    });
                                            });

                                            this.loadingSymbolForSubmitModal = false;
                                            this.getFilteredData();
                                            this.close(configuration.Success, configuration.TransactionRejected)
                                                .then((confirmed) => {
                                                    this.dismissSubmitScoreModal();
                                                })
                                                .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));

                                        });
                                    }
                                }
                            }
                        );
                    }
                    else {
                        this.loadingSymbolForSubmitModal = false;
                    }
                })
                .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));

        }
    }

    dismissSubmitScoreModal() {
        this.loadingSymbolForSubmitModal = false;
        this.pagerSubmit = {};
        this.countSubmit = 0;
        this.pageNumberSubmit = this.pagerService.pageNumberView;
        this.pageSizeSubmit = this.pagerService.pageSizeView;
        this.selectedPageSizeSubmit = this.pagerService.selectedPageSizeView;
        this.pageSizeSubmit = this.selectedPageSizeSubmit;
        this.sortColumnSubmit = "OLADate";
        this.sortDirectionSubmit = "asc";
        this.defaultSortSubmit = true;
        this.submitScoreData = null;
        this.submitScoreDataDisplay = null;
        this.scoreCard = null;
        this.comments = "";
        this.showKPIScoreCard = false;
        this.showWC = false;
        this.functionOLADetails = null;
        this.functionDetails = null;
        this.uploadedFile = null;
        this.viewWCFacilityWise=null;
        this.WCFacilityWise=null;
        this.penaltyStructure=null;
        this.modalService.dismissAll();
    }

    toggleKPIScoreCard() {
        this.showKPIScoreCard = !this.showKPIScoreCard;
    }

    toggleWC() {
        this.showWC = !this.showWC;
    }

    downloadfile() {
        debugger;
        var that = this;
        this.fileService.getFile(this.uploadedFile).subscribe(
            data => {
                var sliceSize = 512;
                var byteCharacters = window.atob(data); //method which converts base64 to binary
                var byteArrays = [
                ];
                for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    var slice = byteCharacters.slice(offset, offset + sliceSize);
                    var byteNumbers = new Array(slice.length);
                    for (var i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }
                    var byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }
                var blob = new Blob(byteArrays, {
                    type: 'application/msword'
                });
                saveAs(blob, that.uploadedFile);
            });

    }
    //#endregion


    //#region View 

    loadingSymbolForViewModal: boolean = false;
    viewScoreHeader: string = "";
    viewTransactionId: number = -1;
    viewPackageName: string;
    viewFacilityName: string;
    viewVendorName: string;
    viewPeriodDate: string;
    viewPackageTypeId: number = -1;
    viewVendorId: number = -1;
    viewFacilityId: number = -1;
    viewScoreData: any;
    viewScoreDataDisplay: any;
    viewScoreCard: any;
    viewTotalWeightageScore: number;
    viewPenalty: number;
    viewComments: string;
    showViewKPIScoreCard: boolean = false;
    showViewWC: boolean = false;
    viewFunctionOLADetails: any;
    viewFunctionDetails: any;
    viewuploadedFileName: string;

    //paging proprty
    pagerView: any = {};
    countView: number = 0;
    pageNumberView: number = this.pagerService.pageNumberView;
    pageSizeView: number = this.pagerService.pageSizeView;

    //pagingoption property
    pageOptionsView = this.pagerService.pageOptionsView;
    selectedPageSizeView: number = this.pagerService.selectedPageSizeView;

    //sorting property
    sortColumnView: string = "OLADate";
    sortDirectionView: string = "asc";
    defaultSortView: boolean = true;

    penaltyStructure=null;


    viewScore(viewScoreModal, e) {
        debugger;
        this.loadingSymbolForViewModal = true;
        this.viewScoreHeader = e.TransactionRefNo;
        this.viewTransactionId = e.TransactionId;
        this.viewPackageName = e.packageName;
        this.viewFacilityName = e.facilityName;
        this.viewVendorName = e.vendorName;
        this.viewPackageTypeId = e.PackageId;
        this.viewVendorId = e.ServiceProviderId;
        this.viewFacilityId = e.FacilityId;
        this.viewPeriodDate = this.datepipe.transform(e.TransactionDt, 'yyyy-MM-dd');
        var date: Date = new Date(this.viewPeriodDate);
        var year: number = date.getFullYear();
        var month: number = date.getMonth();
        var lastDay: Date = new Date(year, month + 1, 0);
        var firstDay: Date = new Date(year, month, 1);
        this.getViewData();
        this.scoreDataService.getFunctionOLADetials(this.viewPackageTypeId, -1).subscribe(
            data => {
                let DailyWeeklYFortnightlyContains = data.filter(x => x.Frequency == configuration.Daily || x.Frequency == configuration.Weekly || x.Frequency == configuration.Fortnightly).length;
                this.getViewScoreCard(firstDay, lastDay, date, DailyWeeklYFortnightlyContains);
            }
        );
        //this.getViewScoreCard(firstDay, lastDay, date);
        if (this.viewPackageName == configuration.Carpet && lastDay.getDate() == date.getDate()) {
            this.getViewWCDetails(firstDay, lastDay);
        }
        this.fileService.getFileName(e.TransactionRefNo).subscribe(
            data => {
                if (data['Contents'].length > 0) {
                    this.viewuploadedFileName = data['Contents'][0].Key.substring(data['Contents'][0].Key.lastIndexOf('/') + 1);;
                }
            });
        this.modalService.open(viewScoreModal, { backdrop: 'static', keyboard: false, windowClass: "edit" });
    }

    //Called this method to get filtered data
    getViewData() {
        let functionOlaDetails = this.scoreDataService.getFunctionOLADetials(this.viewPackageTypeId, -1);
        let transactionDetails = this.scoreDataService.getTransactionDetials(this.viewTransactionId);
        forkJoin([functionOlaDetails, transactionDetails]).subscribe(results => {
            let functionOla = results[0];
            let transactions = results[1];
            this.viewFunctionOLADetails = functionOla;
            const transaction = transactions.map(val => {
                return Object.assign({}, val, this.ratingDetails.filter(v => v.RatingId === val.RatingId)[0]);
            });
            const functionOLA = functionOla.map(val => {
                return Object.assign({}, val, this.frequencyDetails.filter(v => v.frequencyId === val.FrequencyId)[0]);
            });
            const result = transaction.map(val => {
                return Object.assign({}, val, functionOLA.filter(v => v.FunctionId === val.FunctionId && v.OLAId == val.OLAId)[0]);
            });
            this.viewScoreData = result;
            this.countView = this.viewScoreData.length;
            this.setPagerView();
        });
    }

    getViewScoreCard(firstDay: Date, lastDay: Date, date: Date, DailyWeeklYFortnightlyContains: number) {
        debugger;
        if (lastDay.getDate() == date.getDate() && DailyWeeklYFortnightlyContains !== 0) {
            let sundayCount: number = 0;
            for (var i = 1; i <= lastDay.getDate(); i++) {
                var newDate = new Date(lastDay.getFullYear(), lastDay.getMonth(), i)
                if (newDate.getDay() == 0) {
                    sundayCount += 1;
                }
            }
            var transactionStartDate = this.datepipe.transform(firstDay, 'yyyy-MM-dd');
            var transactionEndDate = this.datepipe.transform(lastDay, 'yyyy-MM-dd');
            let getFunctionOLADetials = this.scoreDataService.getFunctionOLADetials(this.viewPackageTypeId, -1);
            let getFunctionDetials = this.scoreDataService.getFunctionDetials(this.viewPackageTypeId);
            let getMonthlyScoreCard = this.scoreDataService.getMonthlyScoreCard(this.viewTransactionId, this.viewVendorId, this.viewPackageTypeId, this.viewFacilityId, transactionStartDate, transactionEndDate);
            forkJoin([getFunctionOLADetials, getFunctionDetials, getMonthlyScoreCard]).subscribe(
                results => {
                    this.viewFunctionOLADetails = results[0];
                    this.viewFunctionDetails = results[1];
                    let transactions = results[2];
                    const result = transactions.map(val => {
                        return Object.assign({}, val, this.viewFunctionOLADetails.filter(v => v.FunctionId === val.FunctionId && v.OLAId === val.OLAId)[0]
                            , this.ratingDetails.filter(v => v.RatingId === val.RatingId)[0]);
                    });
                    var finalResult = [];
                    var functionIds = Array.from(new Set(result.map(x => x.FunctionId))).map(x => x);
                    var OLAIds = Array.from(new Set(result.map(x => x.OLAId))).map(x => x);
                    var applicableFunctionOLADetails = this.viewFunctionOLADetails.filter(u => OLAIds.includes(u.OLAId));
                    //let optionalOLAScoredNA = result.findIndex(x => x.RatingNm == configuration.NA);
                    var functionDetails = [];
                    // if (optionalOLAScoredNA != -1) {
                    //     var weightageSum = 0;
                    //     var NAfunctionIds = Array.from(new Set(result.filter(x => x.RatingNm == configuration.NA).map(x => x.FunctionId)));
                    //     var weightageSum = 0;
                    //     for (var i = 0; i < NAfunctionIds.length; i++) {
                    //         weightageSum += this.viewFunctionDetails.find(x => x.FunctionId == NAfunctionIds[i]).Weightage
                    //     }
                    //     var notOptionalFunctionLength = Array.from(new Set(applicableFunctionOLADetails.filter(x => x.IsOptional == 0).map(x => x.FunctionId))).length;
                    //     var avgWeightage = notOptionalFunctionLength != 0 ? weightageSum / notOptionalFunctionLength : 0;
                    // }
                    for (var i = 0; i < this.viewFunctionDetails.length; i++) {
                        var fun =
                        {
                            FunctionId: this.viewFunctionDetails[i].FunctionId,
                            FunctionNm: this.viewFunctionDetails[i].FunctionNm,
                            //Weightage: optionalOLAScoredNA == -1 ? this.viewFunctionDetails[i].Weightage : (NAfunctionIds.findIndex(x => x == this.viewFunctionDetails[i].FunctionId) == -1 ? this.viewFunctionDetails[i].Weightage + avgWeightage : 0),
                            Weightage: this.viewFunctionDetails[i].Weightage,
                            OLACnt: applicableFunctionOLADetails.filter(x => x.FunctionId == this.viewFunctionDetails[i].FunctionId).length,
                            IsOptional: this.viewFunctionDetails[i].IsOptional
                        };
                        functionDetails.push(fun);
                    }
                    for (var i = 0; i < functionIds.length; i++) {
                        var FunctionNm = result.find(x => x.FunctionId == functionIds[i]).FunctionNm;
                        var Weightage = functionDetails.find(x => x.FunctionId == functionIds[i]).Weightage;
                        var OLACnt = functionDetails.find(x => x.FunctionId == functionIds[i]).OLACnt;;
                        var Score = 0;
                        Score = Score + (result.filter(x => x.Frequency == configuration.Daily && x.FunctionId == functionIds[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / lastDay.getDate()) * Weightage / OLACnt / 100;
                        Score = Score + (result.filter(x => x.Frequency == configuration.Weekly && x.FunctionId == functionIds[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / sundayCount) * Weightage / OLACnt / 100;
                        Score = Score + (result.filter(x => x.Frequency == configuration.Fortnightly && x.FunctionId == functionIds[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / 2) * Weightage / OLACnt / 100;
                        Score = Score + (result.filter(x => x.Frequency !== configuration.Daily && x.Frequency !== configuration.Weekly && x.Frequency !== configuration.Fortnightly && x.FunctionId == functionIds[i])
                            .reduce((sum, Score) => sum + Score.RatingScore, 0)) * Weightage / OLACnt / 100;
                        finalResult.push({ FunctionId: functionIds[i], FunctionNm: FunctionNm, ScoreWeightage: Weightage, Score: Score });
                    }
                    this.viewTotalWeightageScore = finalResult.reduce((sum, Score) => sum + Score.Score, 0);
                    this.viewScoreCard = finalResult;
                    var getPenaltyByPackage =this.scoreDataService.getPenaltyByPackage(this.viewVendorId, this.viewPackageTypeId, this.viewTotalWeightageScore);
                    var getPenaltyStructure =this.scoreDataService.getPenaltyStructureByPackageIdvendorId(this.viewVendorId, this.viewPackageTypeId);
                    forkJoin([getPenaltyByPackage,getPenaltyStructure]).subscribe(
                        data => { 
                            if (data[0].length !=0 && data[0][0].length != 0) {
                                this.viewPenalty = data[0][0].Penalty;
                            }
                            else {
                                this.viewPenalty = 0;
                            }
                            if(data[1].length !=0){
                                this.penaltyStructure=data[1];
                            }
                            else{
                                this.penaltyStructure=null;
                            }
                        }
                    );
                    this.loadingSymbolForViewModal = false;
                }
            );
        }
        else {
            let getFunctionDetials = this.scoreDataService.getFunctionDetials(this.viewPackageTypeId);
            let getScoreCard = this.scoreDataService.getScoreCard(this.viewTransactionId);
            forkJoin([getFunctionDetials, getScoreCard]).subscribe(results => {
                let functionOla = results[0];
                let transactions = results[1];
                this.viewFunctionDetails = functionOla;
                const result = transactions.map(val => {
                    return Object.assign({}, val, functionOla.filter(v => v.FunctionId === val.FunctionId)[0]);
                });
                this.viewTotalWeightageScore = transactions.reduce((sum, Score) => sum + Score.Score, 0);
                this.viewScoreCard = result;
                var getPenaltyByPackage =this.scoreDataService.getPenaltyByPackage(this.viewVendorId, this.viewPackageTypeId, this.viewTotalWeightageScore);
                    var getPenaltyStructure =this.scoreDataService.getPenaltyStructureByPackageIdvendorId(this.viewVendorId, this.viewPackageTypeId);
                    forkJoin([getPenaltyByPackage,getPenaltyStructure]).subscribe(
                        data => {
                            debugger;   
                            if (data[0].length !=0 && data[0][0].length != 0) {
                                this.viewPenalty = data[0][0].Penalty;
                            }
                            else {
                                this.viewPenalty = 0;
                            }
                            if(data[1].length !=0){
                                this.penaltyStructure=data[1];
                            }
                            else{
                                this.penaltyStructure=null;
                            }
                        }
                    );
                this.loadingSymbolForViewModal = false;
            });
        }
        let remarksBy = configuration.RoleZL + ',' + configuration.RoleSDL;
        console.log(remarksBy);
        this.approvalDataService.getRemarks(this.viewTransactionId, remarksBy).subscribe(
            data => {
                if (data.length != 0) {
                    this.viewComments = data[0].RemarkDesc;
                }
                else {
                    this.viewComments = null;
                }
            }
        );
    }

    //WC properties
    viewWCCertificate: any;
    viewWCFacilityWise: any;
    viewWCFacilityWiseKeys: any;
    viewWCFacilityTowerWise: any;
    viewlist_items: any;
    viewkeys: any;
    submitTask:any;

    //Get WC Details in Submit Score popup
    getViewWCDetails(firstDay: Date, lastDay: Date) {
        debugger;
        let sundayCount: number = 0;
        for (var i = 1; i <= lastDay.getDate(); i++) {
            var newDate = new Date(lastDay.getFullYear(), lastDay.getMonth(), i)
            if (newDate.getDay() == 0) {
                sundayCount += 1;
            }
        }
        var date = this.datepipe.transform(this.viewPeriodDate, 'yyyy-MM-dd');
        let getTaskIds = this.scoreDataService.getTaskIds(this.viewVendorId, date);
        let getTaskMasterByFacility = this.scoreDataService.getTaskMasterByFacility(this.viewFacilityId,lastDay.getMonth()+1,lastDay.getFullYear());
        forkJoin([getTaskIds, getTaskMasterByFacility]).subscribe(results => {
            let taskDetails = results[0];
            let taskMaster = results[1];
            var taskDetailsTaskIds = taskMaster.map(x => x.TaskId);
            let taskMasterTaskIds = taskDetails.filter(u =>
                taskDetailsTaskIds.includes(u.TaskId)
            );
            let getWCFacilityTowerWise = this.scoreDataService.getWCFacilityTowerWise(this.viewFacilityId,lastDay.getMonth()+1,lastDay.getFullYear());
            let getWCFacilityTowerTaskWise = this.scoreDataService.getWCFacilityTowerTaskWise(this.viewFacilityId, taskMasterTaskIds.map(x => x.TaskId));
            let getUnitPriceWC = this.scoreDataService.getUnitPriceWC(this.viewVendorId);
            let getAchive=this.scoreDataService.getAchivedData(this.viewFacilityId,this.viewVendorId,lastDay.getMonth()+1,lastDay.getFullYear());
            forkJoin([getWCFacilityTowerWise, getWCFacilityTowerTaskWise, getUnitPriceWC,getAchive]).subscribe(results => {
                let WCFacilityTowerWise = results[0][0];
                let WCFacilityTowerTaskWise = results[1][0];
                let UnitPriceWC = results[2];
                let AchivedArea=results[3];
                let acchivedvaccuming= AchivedArea.find(x=>x.WorkType=="Vaccuming")!=undefined?AchivedArea.find(x=>x.WorkType=="Vaccuming").AchievedArea:0;
                let acchivedEng= AchivedArea.find(x=>x.WorkType=="Encapulisation")!=undefined?AchivedArea.find(x=>x.WorkType=="Encapulisation").AchievedArea:0;
                let acchivedHot= AchivedArea.find(x=>x.WorkType=="Hot Water Extraction")!=undefined?AchivedArea.find(x=>x.WorkType=="Hot Water Extraction").AchievedArea:0;
                this.viewWCFacilityTowerWise = [];
                var Area = null;
                for (var i = 0; i < WCFacilityTowerWise.length; i++) {
                    let total = WCFacilityTowerWise[i].TowerDetails.map(x => x).filter(x => x.TOWERNm == "Total");
                    if (total.length != 0) {
                        var fun =
                        {
                            TowerId: WCFacilityTowerWise[i].TowerId,
                            TowerNm: WCFacilityTowerWise[i].TowerNm,
                            HighVaccumingTarget: total[0].High * lastDay.getDate(),
                            LowVaccumingTarget: total[0].Low * sundayCount,
                            HighEncapulisationTarget: total[0].High / 3,
                            LowEncapulisationTarget: total[0].Low / 6,
                            HighHotWaterExtractionTarget: total[0].High / 6,
                            LowHotWaterExtractionTarget: total[0].Low / 12,
                            TowerDetails: WCFacilityTowerWise[i].TowerDetails.map(val => {
                                return Object.assign({}, val, WCFacilityTowerTaskWise.find(x => x.TowerId == WCFacilityTowerWise[i].TowerId).TowerDetails.filter(v => v.TowerId === val.TowerId && v.FloorId == val.FloorId)[0]);
                            })
                        };
                        this.viewWCFacilityTowerWise.push(fun);
                    }
                    else{
                        this.viewWCFacilityTowerWise.push(WCFacilityTowerWise[i]);

                    }
                        if (Area == null) {
                            Area = this.viewWCFacilityTowerWise[i].TowerDetails.filter(x => x.TOWERNm == "Total");
                        } else {
                            let ar = this.viewWCFacilityTowerWise[i].TowerDetails.filter(x => x.TOWERNm == "Total");
                            Area = Area.concat(ar);
                        }
                   
                }   
                let HighArea = Area.reduce((sum, area) => sum + area.High, 0);
                let LowArea = Area.reduce((sum, area) => sum + area.Low, 0);
                let HighVaccumingArea = Area.reduce((sum, area) => sum + (area.HighVaccuming != undefined ? area.HighVaccuming : 0), 0);
                let LowVaccumingArea = Area.reduce((sum, area) => sum + (area.LowVaccuming != undefined ? area.LowVaccuming : 0), 0);
                let HighEncapulisationArea = Area.reduce((sum, area) => sum + (area.HighEncapulisation != undefined ? area.HighEncapulisation : 0), 0);
                let LowEncapulisationArea = Area.reduce((sum, area) => sum + (area.LowEncapulisation != undefined ? area.LowEncapulisation : 0), 0);
                let HighHotWaterExtraction = Area.reduce((sum, area) => sum + (area.HighHotWaterExtraction != undefined ? area.HighHotWaterExtraction : 0), 0);
                let LowHotWaterExtraction = Area.reduce((sum, area) => sum + (area.LowHotWaterExtraction != undefined ? area.LowHotWaterExtraction : 0), 0);
                this.viewWCCertificate = [];
                let UnitPriceVaccuming = null; let UnitPriceEncapulisation = null; let UnitPriceHotWaterExtraction = null;
                if (UnitPriceWC.length != 0) {
                    UnitPriceVaccuming = UnitPriceWC.find(x => x.WorkType == "Vaccuming").UnitPrice;
                    UnitPriceEncapulisation = UnitPriceWC.find(x => x.WorkType == "Encapulisation").UnitPrice;
                    UnitPriceHotWaterExtraction = UnitPriceWC.find(x => x.WorkType == "Hot Water Extraction").UnitPrice;
                }
                this.viewWCCertificate.push({
                    CleaningType: "Vaccuming", TargetSqft: HighArea * lastDay.getDate() + LowArea * sundayCount,
                    SqftAchieved:  acchivedvaccuming, UnitPrice: UnitPriceVaccuming,
                    TotalPrice: acchivedvaccuming * UnitPriceVaccuming
                });
                this.viewWCCertificate.push({
                    CleaningType: "Encapulisation", TargetSqft: HighArea / 3 + LowArea / 6,
                    SqftAchieved: acchivedEng, UnitPrice: UnitPriceEncapulisation,
                    TotalPrice: acchivedEng * UnitPriceEncapulisation
                })
                this.viewWCCertificate.push({
                    CleaningType: "Hot Water Extraction", TargetSqft: HighArea / 6 + LowArea / 12,
                    SqftAchieved: acchivedHot, UnitPrice: UnitPriceHotWaterExtraction,
                    TotalPrice: acchivedHot * UnitPriceHotWaterExtraction
                })
                this.viewWCCertificate.push({
                    CleaningType: "Total", TargetSqft: HighArea * lastDay.getDate() + LowArea * sundayCount +  (HighArea / 3 + LowArea / 6)+( HighArea / 6 + LowArea / 12),
                    SqftAchieved:acchivedvaccuming+acchivedEng+acchivedHot, UnitPrice: null,
                    TotalPrice: acchivedvaccuming * UnitPriceVaccuming +
                         acchivedEng* UnitPriceEncapulisation +
                        acchivedHot * UnitPriceHotWaterExtraction
                })
            });
        });
        this.scoreDataService.getWCFacilityWise(this.viewFacilityId).subscribe(
            data => {
                this.viewWCFacilityWise = data;
                this.viewWCFacilityWiseKeys = Object.keys(this.viewWCFacilityWise[0]);
                this.viewlist_items = data;
                this.viewkeys = Object.keys(this.viewlist_items[0]); // Get the column names                 
            }
        )
    }

    setPagerView() {
        debugger;
        this.pagerView = this.pagerService.getPager(this.countView, this.pageNumberView, this.pageSizeView);
        if (this.sortDirectionView == "asc") {
            this.viewScoreDataDisplay = this.viewScoreData.sort((a, b) => a[this.sortColumnView].localeCompare(b[this.sortColumnView])).slice(this.pagerView.startIndex, this.pagerView.endIndex + 1);
        }
        else if (this.sortDirectionView == "desc") {
            this.viewScoreDataDisplay = this.viewScoreData.sort((a, b) => b[this.sortColumnView].localeCompare(a[this.sortColumnView])).slice(this.pagerView.startIndex, this.pagerView.endIndex + 1);
        }

    }

    //Called this method on sorting
    sortingView(sortColumn: string) {
        if (this.defaultSortView && this.sortColumnView == sortColumn) {
            this.sortColumnView = sortColumn;
            this.sortDirectionView = "asc";
            this.defaultSortView = false;
        }
        else {
            this.defaultSortView = false;
        }
        if (this.sortColumnView != sortColumn) {
            this.sortColumnView = sortColumn;
            this.sortDirectionView = "asc";
        }
        else {
            this.sortColumnView = sortColumn;
            this.sortDirectionView = this.sortDirectionView == "asc" ? "desc" : "asc";
        }
        this.setPagerView();
    }

    //Called this method on paging
    setPageView(page: number) {
        debugger;
        this.pageNumberView = page;
        this.setPagerView();
    }

    //Called this method on page option changes
    onPagingOptionsChangeView(e: number) {
        debugger;
        this.selectedPageSizeView = +e;
        this.pageSizeView = this.selectedPageSizeView;
        this.pageNumberView = 1;
        this.setPagerView();
    }

    dismissViewModal() {
        this.pagerView = {};
        this.countView = 0;
        this.pageNumberView = this.pagerService.pageNumberView;
        this.pageSizeView = this.pagerService.pageSizeView;
        this.selectedPageSizeView = this.pagerService.selectedPageSizeView;
        this.pageSizeView = this.selectedPageSizeView;
        this.sortColumnView = "OLADate";
        this.sortDirectionView = "asc";
        this.defaultSortView = true;
        this.viewScoreData = null;
        this.viewScoreDataDisplay = null;
        this.viewScoreCard = null;
        this.viewComments = "";
        this.showViewKPIScoreCard = false;
        this.showViewWC = false;
        this.viewFunctionOLADetails = null;
        this.viewFunctionDetails = null;
        this.viewuploadedFileName = null;
        this.viewWCFacilityWise=null;
        this.modalService.dismissAll();
    }

    toggleViewKPIScoreCard() {
        this.showViewKPIScoreCard = !this.showViewKPIScoreCard;
    }

    toggleViewWC() {
        this.showViewWC = !this.showViewWC;
    }

    downloadViewfile() {
        debugger;
        var that = this;
        this.fileService.getFile(this.viewuploadedFileName).subscribe(
            data => {
                var sliceSize = 512;
                var byteCharacters = window.atob(data); //method which converts base64 to binary
                var byteArrays = [
                ];
                for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    var slice = byteCharacters.slice(offset, offset + sliceSize);
                    var byteNumbers = new Array(slice.length);
                    for (var i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }
                    var byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }
                var blob = new Blob(byteArrays, {
                    type: 'application/msword'
                });
                saveAs(blob, that.viewuploadedFileName);
            });

    }
    //#endregion


    //#region Approval Flow

    loadingSymbolForApprovalModal: boolean = false;
    approvalTransactionId: number = -1;
    approvalTransactionRefNo: string = "";
    approvalPackageName: string;
    approvalFacility: string;
    approvalVendor: string;
    approvalPeriodDate: string;
    approvalDetails: any;
    approvalFlow(approvalFlowModel, e) {
        this.loadingSymbolForApprovalModal = true;
        this.approvalTransactionId = e.TransactionId;
        this.approvalTransactionRefNo = e.TransactionRefNo;
        this.approvalPackageName = e.packageName;
        this.approvalFacility = e.facilityName;
        this.approvalVendor = e.vendorName;
        this.approvalPeriodDate = this.datepipe.transform(e.TransactionDt, 'yyyy-MM-dd');
        this.scoreDataService.getRemarksDetails(this.approvalTransactionId).subscribe(
            data => {
                this.approvalDetails = data;
                this.approvalDetails.forEach((x) => {
                    var dt=new Date(x.UpdatedDttm);
                    dt.setHours(dt.getHours()-5);
                    dt.setMinutes(dt.getMinutes()-30);
                    x.UpdatedDttm=new Date(dt).toUTCString();
                });
                this.loadingSymbolForApprovalModal = false;
            }
        );
        this.modalService.open(approvalFlowModel, { backdrop: 'static', keyboard: false, windowClass: "edit" });
    }

    dismissApprovalModal() {
        this.approvalTransactionId = -1;
        this.approvalTransactionRefNo = "";
        this.approvalPackageName = "";
        this.approvalFacility = "";
        this.approvalVendor = "";
        this.approvalPeriodDate = null;
        this.approvalDetails = null;
        this.modalService.dismissAll();
    }
    //#endregion



    
    search = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            //tap(() => this.searching = true),
            switchMap(term => term.trim().length < 3 ? [] :
                this.approvalDataService.searchTransaction(term.trim(), this.PackageFacilityAliasFilter).pipe(
                    //tap(() => this.searchFailed = false),
                    catchError(() => {
                        //this.searchFailed = true;
                        return of([]);
                    }))
            ),
            //tap(() => this.searching = false)
        )

}

