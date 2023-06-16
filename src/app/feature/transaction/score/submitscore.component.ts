import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataService } from '../../../core/services/DataService';
import {
    FacilityMaster, StatusMaster, VendorMaster, FrequencyMaster, PackageTypeMaster, FilterDetails, RatingMaster, MonthYear
    , PackageMaster, PackageFacilityAliasVendorMaster, PackageFacilityAliasMaster
} from '../../../core/services/Data';
import { PagerService } from '../../../core/services/PagerService';
import { NgbModal, NgbActiveModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { ScoreService, FrequencyDetails, CreateScoreDetails } from '../../../core/services/ScoreService';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap, switchMap, catchError, delay } from 'rxjs/operators';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from "rxjs";
import { DatePipe } from '@angular/common'
import { FileService, FileUpload } from '../../../core/services/File';
import { configuration } from '../../../../config/configuration';
import { saveAs } from "file-saver";
//import * as XLSX from 'xlsx';
import { AlertData, AlertMailService } from '../../../core/services/AlertMailService';
import { environment } from '../../../../environments/environment';
//var fs = require('fs');

@Component({
    selector: 'rebar-submitscore',
    templateUrl: './submitscore.html',
    styleUrls: ['./submitscore.css']
})

export class SubmitScoreComponent implements OnInit {
    message = 'Submit Score';
    //@ViewChild('TABLE') table: ElementRef;
    //download() {
    //    debugger;
    //    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table.nativeElement);
    //    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    //    XLSX.utils.book_append_sheet(wb, ws, 'WC');
    //    console.log(this.table.nativeElement);
    //    /* save to file */
    //    XLSX.writeFile(wb, 'Test.xlsx');
    //}

    constructor(private dataService: DataService, private pagerService: PagerService, private scoreDataService: ScoreService,
        private modalService: NgbModal, private calendar: NgbCalendar, private datepipe: DatePipe, private fileService: FileService
        , private alertMailService: AlertMailService) {
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

    enterpriseId: string = "";
    loggedEnterpriseId: string = "";
    remarksBy: string = "";
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

    isActiveRole: string = "Ops";

    userData: any = null;
    userData1: any = null;
    packageFacilityDetails: any = null;
    PackageFacilityFilter: any = null;
    PackageFacilityAliasFilter: any = null;
    public facilityDetails: FacilityMaster[];
    public statusDetails: StatusMaster[];
    public vendorDetails: VendorMaster[];
    public frequencyDetails: FrequencyMaster[];
    public packageTypeDetails: PackageMaster[];
    public packageDetails: PackageMaster[];
    public ratingDetails: RatingMaster[];
    public monthYearDetails: MonthYear[];
    packageFacilityVendorDetails: PackageFacilityAliasVendorMaster[] = null;
    packageFacilityMapping: PackageFacilityAliasMaster[] = null;
    txtFrequencyDetail: string = "";

    //#endregion


    //#region Filter Property

    //property used to toggle the filter
    public showPackageId: boolean = false;
    public showPackageType: boolean = false;
    public showFacility: boolean = false;
    public showVendor: boolean = false;
    public showTransactionDate: boolean = false;
    public showStatus: boolean = false;
    public showFrequency: boolean = false;
    public showMonthYear: boolean = false;
    public enableClearAll: boolean = false;

    //property used to toggle the show more filter details
    public showMorePackageType: string = this.showMoreText;
    public showMoreFacility: string = this.showMoreText;
    public showMoreVendor: string = this.showMoreText;
    public showMoreStatus: string = this.showMoreText;
    public showMoreFrequency: string = this.showMoreText;
    public showMoreMonthYear: string = this.showMoreText;

    //property used to show count of filter
    public packageTypeCount: number = this.filterCount;
    public facilityCount: number = this.filterCount;
    public vendorCount: number = this.filterCount;
    public statusCount: number = this.filterCount;
    public frequencyCount: number = this.filterCount;
    public monthYearCount: number = this.filterCount;

    //property used to store the selcted filter values
    public filteredArray: FilterDetails[];
    public selectedTransactionCode: string = "";
    public selectedPackageTypeIds: Array<number>;
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
        this.packageTypeCount = this.showMorePackageType == this.showMoreText ? this.filterCount : this.packageDetails.length;
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
        this.selectedFacilityIds = [];
        this.selectedVendorIds = [];
        this.selectedTransactionDate = null;
        this.selectedStatusIds = [];
        this.selectedFrequencyIds = [];
        this.selectedMonthYearIds = [];
        this.packageDetails.forEach(
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
                const indexPackage: number = this.selectedPackageTypeIds.indexOf(e.value);
                if (index !== -1) {
                    this.selectedPackageTypeIds.splice(indexPackage, 1);
                    this.packageDetails[this.packageDetails.findIndex(item => item.packageId == e.value)].selected = false;
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
        // console.log(location);
        // console.log(sessionStorage);
        // var city = [{cityId:1, cityName:"A1", facilityName:"F1", facilityId:1},{cityId:1, cityName:"A1", facilityName:"F2", facilityId:2},
        // {cityId:2, cityName:"A2", facilityName:"F3", facilityId:3},{cityId:2, cityName:"A2", facilityName:"F4", facilityId:4}]
        // let facilityIds = [1,2]
        // let x = Array.from(new Set(city.filter(x=> facilityIds.includes(x.facilityId)).map(function(city){
        //     return {cityId: city.cityId, cityName: city.cityName};
        // })));

        // var groups = city.reduce(function(obj,item){
        //     obj[item.cityId] = obj[item.cityId] || [];
        //     obj[item.cityId].push(item.facilityName, item.facilityId);
        //     return obj;
        // }, {});
        // var myArray = Object.keys(groups).map(function(key){
        //     return {cityId: key, cityName: groups[key]};
        // });
        // console.log(myArray);

        // console.log(x);
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
        this.dataService.getFrequencyDetails().subscribe(
            data => {
                this.frequencyDetails = data;
            }
        );
        this.getRoleName();

        // let getPackageFacilityDetailsByPage = this.dataService.getPackageFacilityDetailsByPage(this.loggedEnterpriseId, location.pathname);
        // let PackageFacilityAliasMapping = this.dataService.PackageFacilityAliasMapping();
        // forkJoin([getPackageFacilityDetailsByPage, PackageFacilityAliasMapping]).subscribe(
        //     results => {
        //         var data = results[0];
        //         this.packageFacilityMapping = results[1];
        //         if (data.length != 0) {
        //             let fullAccessIndex = data.findIndex(x => x.ConfigCd == configuration.FullAccess);
        //             this.packageFacilityDetails = fullAccessIndex != -1 ? this.packageFacilityMapping : data;
        //             var PackageFacilityFilter = " AND (";
        //             var ORCondition = "";
        //             for (var i = 0; i < data.length; i++) {
        //                 var PackageId = data[i].PackageId;
        //                 var FacilityId = data[i].FacilityId;
        //                 PackageFacilityFilter = PackageFacilityFilter + ORCondition + "(PackageId=" + PackageId + " AND FacilityId=" + FacilityId + ")";
        //                 ORCondition = " OR ";
        //             }
        //             PackageFacilityFilter = PackageFacilityFilter + ")";
        //             this.PackageFacilityFilter = PackageFacilityFilter;
        //             let facilityIds = this.packageFacilityDetails.map(x => x.FacilityId);
        //             let packageIds = this.packageFacilityDetails.map(x => x.PackageId);
        //             let FacilityDetails = this.dataService.getFacilityAliasDetails();
        //             let VendorDetails = this.dataService.getVendorDetails();
        //             let PackageTypeDetails = this.dataService.getPackageDetails();
        //             let getStatusDetails = this.dataService.getStatusDetails();
        //             let Score = this.scoreDataService.getSubmitScoreData(this.pageNumber, this.sortColumn, this.sortDirection, this.pageSize, this.enterpriseId, PackageFacilityFilter);
        //             forkJoin([FacilityDetails, VendorDetails, PackageTypeDetails, Score, getStatusDetails]).subscribe(results => {
        //                 let facility = results[0];
        //                 let vendor = results[1];
        //                 let packages = results[2];
        //                 let score = results[3];
        //                 let stausNames = results[4];
        //                 this.packageDetails = packages.filter(u => packageIds.includes(u.packageId));
        //                 this.statusDetails = stausNames;
        //                 this.facilityDetails = facility.filter(u => facilityIds.includes(u.facilityId));
        //                 this.vendorDetails = vendor;
        //                 let submittdStatusId = stausNames.filter(x => x.statusName == configuration.Submitted).map(x => x.statusId)[0];
        //                 this.packageTypeDetails = packages.filter(u => packageIds.includes(u.packageId) && u.statusId == submittdStatusId);
        //                 this.userData = score;
        //                 this.count = this.userData[0][0].TotalRecordCount;
        //                 this.setPager();
        //                 this.loadingSymbol = false;
        //                 this.dataService.PackageFacilityAliasVendorMapping().subscribe(
        //                     data => {
        //                         this.packageFacilityVendorDetails = data;
        //                         //console.log(data);
        //                     }
        //                 );
        //             });
        //         }
        //         else {
        //             this.loadingSymbol = false;
        //             this.fullAccess = false;
        //         }
        //     });
        this.dataService.getPackageFacilityDetailsByPage(this.loggedEnterpriseId, location.pathname).subscribe(
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
                    this.PackageFacilityAliasFilter = PackageFacilityFilter.replace(/FacilityId/gi, "FacilityAliasId");
                    let facilityIds = this.packageFacilityDetails.map(x => x.FacilityId);
                    let packageIds = this.packageFacilityDetails.map(x => x.PackageId);
                    let FacilityDetails = this.dataService.getFacilityAliasDetails();
                    let VendorDetails = this.dataService.getVendorDetails();
                    let PackageTypeDetails = this.dataService.getPackageDetails();
                    let getStatusDetails = this.dataService.getStatusDetails();
                    let Score = this.scoreDataService.getSubmitScoreData(this.pageNumber, this.sortColumn, this.sortDirection, this.pageSize, this.enterpriseId, PackageFacilityFilter);
                    forkJoin([FacilityDetails, VendorDetails, PackageTypeDetails, Score, getStatusDetails]).subscribe(results => {
                        let facility = results[0];
                        let vendor = results[1];
                        let packages = results[2];
                        let score = results[3];
                        let stausNames = results[4];
                        this.packageDetails = packages.filter(u => packageIds.includes(u.packageId));
                        this.statusDetails = stausNames;
                        this.facilityDetails = facility.filter(u => facilityIds.includes(u.facilityId));
                        this.vendorDetails = vendor;
                        let submittdStatusId = stausNames.filter(x => x.statusName == configuration.Submitted).map(x => x.statusId)[0];
                        this.packageTypeDetails = packages.filter(u => packageIds.includes(u.packageId) && u.statusId == submittdStatusId);
                        this.userData = score;
                        this.count = this.userData[0][0].TotalRecordCount;
                        this.setPager();
                        this.loadingSymbol = false;
                        this.dataService.PackageFacilityAliasVendorMapping().subscribe(
                            data => {
                                this.packageFacilityVendorDetails = data;
                                //console.log(data);
                            }
                        );
                        this.dataService.PackageFacilityAliasMapping().subscribe(
                            data => {
                                this.packageFacilityMapping = data;
                                //console.log(data);
                            }
                        );
                    });
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
        let role = e.target.text;
        this.isActiveRole = (role == "My Submission(s)") ? "My Submission(s)" : (role == "Ops" ? "Ops" : "");
        if (this.isActiveRole == "My Submission(s)") {
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
        this.loadingSymbol = true;
        let length: number = this.filteredArray != undefined ? this.filteredArray.length : 0;
        if (length == 0) {
            this.enableClearAll = false;
            this.scoreDataService.getSubmitScoreData(this.pageNumber, this.sortColumn, this.sortDirection, this.pageSize, this.enterpriseId, this.PackageFacilityFilter).subscribe(
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
            let data1 = [];
            if (this.selectedFacilityIds != undefined) {
                if (this.selectedFacilityIds.length != 0) {
                    data1.push(this.packageFacilityDetails.filter(u => this.selectedFacilityIds.includes(u.FacilityId)));
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
            //this.PackageFacilityFilter = PackageFacilityFilter;
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
            this.scoreDataService.getSubmitScoreDataByFilter(this.selectedTransactionCode, this.selectedPackageTypeIds, this.selectedFacilityIds, this.selectedVendorIds, this.selectedStatusIds
                , transactionDate, this.pageNumber, this.sortColumn, this.sortDirection, this.pageSize, this.enterpriseId, PackageFacilityFilter, MonthYearFilter).subscribe(
                    data => {
                        this.userData = data;
                        if (this.userData != null) {
                            this.count = this.userData[0][0].TotalRecordCount;
                        }
                        this.setPager();
                        this.loadingSymbol = false
                    }
                );
        }
    }

    setPager() {
        this.pager = this.pagerService.getPager(this.count, this.pageNumber, this.pageSize);
        //var data = this.userData[0].Transaction.slice(this.pager.startIndex, this.pager.endIndex + 1);
        const userData1 = this.userData[0][0].Transaction;//data;
        const facilityDetails = this.facilityDetails;
        const vendorDetails = this.vendorDetails;
        const packageTypeDetails = this.packageDetails;
        const result1 = userData1.map(val => {
            return Object.assign({}, val, facilityDetails.filter(v => v.facilityId === val.FacilityId)[0],
                vendorDetails.filter(v => v.vendorId === val.ServiceProviderId)[0], packageTypeDetails.filter(v => v.packageId === val.PackageId)[0]);
        });
        this.userData1 = result1;
        this.userData1.forEach((x) => {
            var dt=new Date(x.UpdatedDttm);
            dt.setHours(dt.getHours()-5);
            dt.setMinutes(dt.getMinutes()-30);
            x.UpdatedDttm=new Date(dt).toUTCString();
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
        this.pageNumber = page;
        this.getFilteredData();
    }

    //Called this method on page option changes
    onPagingOptionsChange(e: number) {
        this.selectedPageSize = +e;
        this.pageSize = this.selectedPageSize;
        this.pageNumber = 1;
        this.getFilteredData();
    }

    //#endregion


    //#region Create score

    //#region create/edit/submit popup fields
    ShowSaveButton: boolean = false;
    loadingSymbolForCreateModal: boolean = false;
    loadingSymbolForSubmitModal: boolean = false;
    createPackageTypeDetails: PackageMaster[];
    createFacilityDetails: FacilityMaster[];
    createVendorDetails: VendorMaster[];
    createEditScoreHeader: string = "Create Scores";
    isCreate: boolean = true;
    facilityId: number = -1;
    facilityName: string;
    packageTypeId: number = -1;
    packageName: string;
    vendorId: number = -1;
    vendorName: string;
    periodDateId: any = -1;
    periodDateDropDown: any = [];
    statusName: any = configuration.Draft;
    transactionId: number = -1;
    transactionRefNo: string;
    existingTransactionMessageAlert: string = "";
    editableOnReject: boolean = true;
    functionDetails: any;
    frequencyDetialsByPackage: FrequencyDetails[];
    functionOLADetails: any;
    applicabeFunctionOLADetails: any;
    OLADetails: any;
    editFrequencyDetails: FrequencyDetails[];
    activeFrequency: string;
    activeFrequencyId: number;
    transactionDetails: any;
    editScoreData: any;//CreateScoreDetails[];
    editScoreDataDisplay: any;
    submitScoreData: any;
    submitScoreDataDisplay: any;
    scoreCard: any;
    TotalWeightageScore: number;
    penalty: number;
    comments: string;
    showKPIScoreCard: boolean = false;
    showWC: boolean = false;
    penaltyStructure=null;
    //#endregion

    //Open the popup for creating score
    createScore(createScoreModal) {
        this.createPackageTypeDetails = this.packageTypeDetails;
        this.createFacilityDetails = null;
        this.createVendorDetails = null;
        this.isCreate = true;
        this.statusName = configuration.Draft;
        this.createEditScoreHeader = "Create Scores";
        this.modalService.open(createScoreModal, { backdrop: 'static', keyboard: false, windowClass: "edit" });
    }

    //Celar the selection of create score filters
    cancelSelection() {
        this.createPackageTypeDetails = this.packageTypeDetails;
        this.createFacilityDetails = null;
        this.createVendorDetails = null;
        this.facilityId = -1;
        this.packageTypeId = -1;
        this.packageName = null;
        this.vendorId = -1;
        this.periodDateId = -1;
        this.periodDateDropDown = [];
        this.functionDetails = null;
        this.frequencyDetialsByPackage = null;
        this.functionOLADetails = null;
        this.editFrequencyDetails = null;
        this.activeFrequency = null;
        this.activeFrequencyId = null;
        this.transactionDetails = null;
        this.editScoreData = null;
        this.editScoreDataDisplay = null;
        this.existingTransactionMessageAlert = "";
        this.transactionId = -1;
        this.transactionRefNo = null;
        this.txtFrequencyDetail = "";
    }

    perioPickerChange() {
        this.editFrequencyDetails = null;
        this.editScoreData = null;
    }

    packageChange() {
        this.periodDateId = -1;
        this.periodDateDropDown = [];
        this.editFrequencyDetails = null;
        this.editScoreData = null;
        this.facilityId = -1;
        this.vendorId = -1;
        this.createFacilityDetails = null;
        this.createVendorDetails = null;
        if (this.packageTypeId != -1) {
            let facilityIds1 = this.packageFacilityMapping.filter(x => x.PackageId == this.packageTypeId).map(x => x.FacilityAliasId);
            let facilityIds = this.packageFacilityDetails.filter(x => x.PackageId == this.packageTypeId).map(x => x.FacilityId);
            this.createFacilityDetails = this.facilityDetails.filter(u => facilityIds.includes(u.facilityId) && facilityIds1.includes(u.facilityId));
            let vendorIds = this.packageFacilityVendorDetails.filter(x => facilityIds.includes(x.FacilityAliasId) && x.PackageId == this.packageTypeId).map(x => x.ServiceProviderId);
            this.createVendorDetails = this.vendorDetails.filter(u => vendorIds.includes(u.vendorId));
            this.scoreDataService.getFrequencyByPackage(this.packageTypeId).subscribe(
                data => {
                    this.txtFrequencyDetail = data[0].Frequency;
                }
            );
        }
        else {
            this.facilityId = -1;
            this.vendorId = -1;
            this.createFacilityDetails = null;
            this.createVendorDetails = null;
            this.txtFrequencyDetail = "";
        }
    }

    facilityChange() {
        this.periodDateId = -1;
        this.periodDateDropDown = [];
        this.editFrequencyDetails = null;
        this.editScoreData = null;
        if (this.facilityId != -1) {
            let vendorIds = this.packageFacilityVendorDetails.filter(x => x.PackageId == this.packageTypeId && x.FacilityAliasId == this.facilityId)
                .map(x => x.ServiceProviderId);
            this.createVendorDetails = this.vendorDetails.filter(u => vendorIds.includes(u.vendorId));
        }
        else {
            this.vendorId = -1;
            let facilityIds = this.packageFacilityDetails.filter(x => x.PackageId == this.packageTypeId).map(x => x.FacilityId);
            let vendorIds = this.packageFacilityVendorDetails.filter(x => facilityIds.includes(x.FacilityAliasId) && x.PackageId == this.packageTypeId).map(x => x.ServiceProviderId);
            this.createVendorDetails = this.vendorDetails.filter(u => vendorIds.includes(u.vendorId));
        }
        if (this.packageTypeId != -1 && this.facilityId != -1 && this.vendorId != -1) {
            this.getEnabledDate();
        }
    }

    vendorChange() {
        this.periodDateId = -1;
        this.periodDateDropDown = [];
        this.editFrequencyDetails = null;
        this.editScoreData = null;
        if (this.vendorId != -1) {
            let facilityIds = this.packageFacilityVendorDetails.filter(x => x.PackageId == this.packageTypeId && x.ServiceProviderId == this.vendorId)
                .map(x => x.FacilityAliasId);
            let facilityIds1 = this.packageFacilityDetails.filter(x => x.PackageId == this.packageTypeId).map(x => x.FacilityId);
            this.createFacilityDetails = this.facilityDetails.filter(u => facilityIds.includes(u.facilityId) && facilityIds1.includes(u.facilityId));
        }
        else {
            this.facilityId = -1;
            let facilityIds1 = this.packageFacilityMapping.filter(x => x.PackageId == this.packageTypeId).map(x => x.FacilityAliasId);
            let facilityIds = this.packageFacilityDetails.filter(x => x.PackageId == this.packageTypeId).map(x => x.FacilityId);
            this.createFacilityDetails = this.facilityDetails.filter(u => facilityIds.includes(u.facilityId) && facilityIds1.includes(u.facilityId));
        }
        if (this.packageTypeId != -1 && this.facilityId != -1 && this.vendorId != -1) {
            //console.log("A"+this.periodDateDropDown);
            this.getEnabledDate();
            //console.log("B"+this.periodDateDropDown);
        }
    }

    //Loading dates in Period Date fileds
    getEnabledDate() {
        if (this.packageTypeId != -1 && this.facilityId != -1 && this.vendorId != -1) {
            this.loadingSymbolForCreateModal = true;
            var currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
            let getFrequencyDetialsByPackage = this.scoreDataService.getFrequencyDetialsByPackage(this.packageTypeId);
            let getFrequencyDetialsByCurrentDate = this.scoreDataService.getFrequencyDetialsByCurrentDate(currentDate);
            let getMissedTransactionDate = this.scoreDataService.getMissedTransactionDate(this.packageTypeId, this.facilityId, this.vendorId);
            forkJoin([getFrequencyDetialsByPackage, getFrequencyDetialsByCurrentDate, getMissedTransactionDate]).subscribe(results => {
                let frequencyByPackage = results[0];
                let frequencyByCurrentDate = results[1];
                let data = results[2];
                if (data.length != 0)
                this.periodDateDropDown = this.periodDateDropDown.concat(data);
                this.frequencyDetialsByPackage = frequencyByPackage;
                var frequencyIds = frequencyByPackage.map(x => x.frequencyId);
                var frequencyByDate = frequencyByCurrentDate.filter(u => frequencyIds.includes(u.FrequencyId));
                const frequencyDate = frequencyByPackage.map(val => {
                    return Object.assign({}, val, frequencyByCurrentDate.filter(v => v.FrequencyId === val.frequencyId)[0]);
                });
                this.getEnabledDates(frequencyByDate, frequencyByCurrentDate, frequencyDate);
                //console.log("C"+this.periodDateDropDown);
                this.loadingSymbolForCreateModal = false;
            });
        }
    }
    getEnabledDates(data, frequencyByCurrentDate, frequencyDate) {
        const indexDailyFrequency: number = frequencyDate.findIndex(item => item.frequencyName == configuration.Daily);
        const indexWeeklyFrequency: number = frequencyDate.findIndex(item => item.frequencyName == configuration.Weekly);
        const indexFortnightlyFrequency: number = frequencyDate.findIndex(item => item.frequencyName == configuration.Fortnightly);
        const indexMonthlyFrequency: number = frequencyDate.findIndex(item => item.frequencyName == configuration.Monthly);
        const indexBiMonthlyFrequency: number = frequencyDate.findIndex(item => item.frequencyName == configuration.BiMonthly);
        const indexQuaterlyFrequency: number = frequencyDate.findIndex(item => item.frequencyName == configuration.Quaterly);
        const indexHalfYearlyFrequency: number = frequencyDate.findIndex(item => item.frequencyName == configuration.HalfYearly);
        const indexYearlyFrequency: number = frequencyDate.findIndex(item => item.frequencyName == configuration.Yearly);
        if (indexDailyFrequency !== -1) {
            const dailyDate = new Date();
            dailyDate.setDate(dailyDate.getDate() - 1);
            this.periodDateDropDown.push(dailyDate);
        }
        else if (indexWeeklyFrequency !== -1) {
            var now: Date = new Date(); 
            var dayNo: number = now.getDay();
            const weeklyDate = new Date();
            if (dayNo == 0) {
                this.periodDateDropDown.push(weeklyDate);
            }
            else if (dayNo == 1) {
                const weeklyDate1 = new Date();
                weeklyDate.setDate(weeklyDate.getDate() - 1);
                this.periodDateDropDown.push(weeklyDate);
                weeklyDate1.setDate(weeklyDate1.getDate() + (7 - dayNo));
                this.periodDateDropDown.push(weeklyDate1);
            }
            else {
                weeklyDate.setDate(weeklyDate.getDate() + (7 - dayNo))
                this.periodDateDropDown.push(weeklyDate);
            }
            var year: number = now.getFullYear();
            var month: number = now.getMonth();
            if (indexFortnightlyFrequency !== -1) {
                let lastDay: Date = new Date(data.filter(x => x.FrequencyNm == configuration.Fortnightly).map(x => x.EndDttm));
                let lastDayDayNo: number = lastDay.getDay();
                if (lastDayDayNo != 0) { this.periodDateDropDown.push(lastDay) };
            }
            else if (indexMonthlyFrequency !== -1) {
               // let lastDay: Date = new Date(year, month + 1, 0);
               let lastDay: Date = new Date(data.filter(x => x.FrequencyNm == configuration.Monthly).map(x => x.EndDttm));
                let lastDayDayNo: number = lastDay.getDay();
                if (lastDayDayNo != 0) { this.periodDateDropDown.push(lastDay) };
            }
            else if (indexBiMonthlyFrequency !== -1) {
                //let lastDay: Date = new Date(year, month + 2, 0);
                let lastDay: Date = new Date(data.filter(x => x.FrequencyNm == configuration.BiMonthly).map(x => x.EndDttm));
                let lastDayDayNo: number = lastDay.getDay();
                if (lastDayDayNo != 0) { this.periodDateDropDown.push(lastDay) };
                if (indexQuaterlyFrequency !== -1) {
                    if (data.findIndex(x => x.QuarterNm == "Q1") != -1 || data.findIndex(x => x.QuarterNm == "Q3") != -1) {
                       // let lastDay: Date = new Date(year, month + 3, 0);
                        let lastDay: Date = new Date(data.filter(x => x.FrequencyNm == configuration.Quaterly).map(x => x.EndDttm));
                        let lastDayDayNo: number = lastDay.getDay();
                        if (lastDayDayNo != 0) { this.periodDateDropDown.push(lastDay) };
                       
                    }
                }
            }
            else if (indexQuaterlyFrequency !== -1) {
                //let lastDay: Date = new Date(year, month + 3, 0);
                let lastDay: Date = new Date(data.filter(x => x.FrequencyNm == configuration.Quaterly).map(x => x.EndDttm));
                 let lastDayDayNo: number = lastDay.getDay();
                if (lastDayDayNo != 0) { this.periodDateDropDown.push(lastDay) };
            }
            else if (indexHalfYearlyFrequency !== -1) {
                //let lastDay: Date = new Date(year, month + 6, 0);
                let lastDay: Date = new Date(data.filter(x => x.FrequencyNm == configuration.HalfYearly).map(x => x.EndDttm));
                let lastDayDayNo: number = lastDay.getDay();
                if (lastDayDayNo != 0) { this.periodDateDropDown.push(lastDay) };
            }
            else if (indexYearlyFrequency !== -1) {
                    if (data.findIndex(x => x.QuarterNm == "Q4") != -1) {
                    //let lastDay: Date = new Date(year, month + 12, 0);
                    let lastDay: Date = new Date(data.filter(x => x.FrequencyNm == configuration.Yearly).map(x => x.EndDttm));
                    let lastDayDayNo: number = lastDay.getDay();
                    if (lastDayDayNo != 0) { this.periodDateDropDown.push(lastDay) };
                }
            }
        }
        else if (indexFortnightlyFrequency !== -1) {
            var date = data.filter(x => x.FrequencyNm == configuration.Fortnightly).map(x => x.EndDttm);
            date.forEach(x => { this.periodDateDropDown.push(x) });
        }
        else if (indexMonthlyFrequency !== -1) {
            var date = data.filter(x => x.FrequencyNm == configuration.Monthly).map(x => x.EndDttm);
            date.forEach(x => { this.periodDateDropDown.push(x) });
        }
        else if (indexBiMonthlyFrequency !== -1) {
            var date = data.filter(x => x.FrequencyNm == configuration.BiMonthly).map(x => x.EndDttm);
            date.forEach(x => { this.periodDateDropDown.push(x) });
            if (indexQuaterlyFrequency !== -1) {
                if (frequencyByCurrentDate.findIndex(x => x.QuarterNm == "Q1") != -1 || frequencyByCurrentDate.findIndex(x => x.QuarterNm == "Q3") != -1) {
                    var date = data.filter(x => x.FrequencyNm == configuration.Quaterly).map(x => x.EndDttm);
                    date.forEach(x => { this.periodDateDropDown.push(x) });
                }
            }
        }
        else if (indexQuaterlyFrequency !== -1) {
            var date = data.filter(x => x.FrequencyNm == configuration.Quaterly).map(x => x.EndDttm);
            date.forEach(x => { this.periodDateDropDown.push(x) });
        }
        else if (indexHalfYearlyFrequency !== -1) {
            var date = data.filter(x => x.FrequencyNm == configuration.HalfYearly).map(x => x.EndDttm);
            date.forEach(x => { this.periodDateDropDown.push(x) });
        }
        else if (indexYearlyFrequency !== -1) {
            if (frequencyByCurrentDate.findIndex(x => x.QuarterNm == "Q4") != -1) {
                var date = data.filter(x => x.FrequencyNm == configuration.Yearly).map(x => x.EndDttm);
                date.forEach(x => { this.periodDateDropDown.push(x) });
            }
        }
        // if (indexFortnightlyFrequency !== -1) {
        //     var date = data.filter(x => x.FrequencyNm == configuration.Fortnightly).map(x => x.EndDttm);
        //     date.forEach(x => { this.periodDateDropDown.push(x) });
        // }
        var perioddates = [];
        this.periodDateDropDown.forEach(x => perioddates.push(this.datepipe.transform(x, "yyyy-MM-dd")));
        var dates = Array.from(new Set(perioddates)).map(x => x);
        this.periodDateDropDown = [];
        this.periodDateDropDown = dates.sort();
    }   

    //Getting all function OLA details when clicked on Select 
    addScore() {
        this.loadingSymbolForCreateModal = true;
        this.ShowSaveButton = false;
        if (this.facilityId == -1 || this.packageTypeId == -1 || this.vendorId == -1 || this.periodDateId == -1) {
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            modalRef.componentInstance.title = configuration.Mandatory;
            modalRef.componentInstance.message = configuration.MandatoryMessage;
            this.loadingSymbolForCreateModal = false;
        }
        else {
            this.editFrequencyDetails = null;
            this.editScoreData = null;
            this.existingTransactionMessageAlert = "";
            this.transactionId = -1;
            this.packageName = this.packageTypeDetails.find(x => x.packageId == this.packageTypeId).packageName;
            this.facilityName = this.facilityDetails.find(x => x.facilityId == this.facilityId).facilityName;
            this.vendorName = this.vendorDetails.find(x => x.vendorId == this.vendorId).vendorName;
            var transactionDate = this.datepipe.transform(this.periodDateId, 'yyyy-MM-dd');
            this.scoreDataService.getTransaction(this.packageTypeId, this.vendorId, this.facilityId, transactionDate).subscribe(
                data => {
                    if (data.length == 0) {
                        this.getCreateScore();
                    }
                    else {
                        this.transactionId = data[0].TransactionId;
                        this.existingTransactionMessageAlert = data[0].TransactionRefNo;
                        this.loadingSymbolForCreateModal = false;
                    }
                }
            )
            this.scoreDataService.getFunctionDetials(this.packageTypeId).subscribe(
                data => {
                    this.functionDetails = data;
                }
            );
        }
    }
    getCreateScore() {
        var transactionDate = this.datepipe.transform(this.periodDateId, 'yyyy-MM-dd');
        var date: Date = new Date(transactionDate);
        var dayNo: number = date.getDay();
        const dailyDate = new Date();
        dailyDate.setDate(dailyDate.getDate() - 1);
       var today: Date = new Date(this.datepipe.transform(dailyDate, 'yyyy-MM-dd'));
        var timeDiff = Math.round(today.getTime() - date.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        let getFunctionOLADetials = this.scoreDataService.getFunctionOLADetials(this.packageTypeId, -1);
        let getFrequencyDetialsByDate = this.scoreDataService.getFrequencyDetialsByDate(transactionDate);
        forkJoin([getFunctionOLADetials, getFrequencyDetialsByDate]).subscribe(results => {
            let functionOla = results[0];
            let frequencyDetails = results[1];
            this.functionOLADetails = functionOla;
            var frequencyIds = frequencyDetails.map(x => x.FrequencyId);
            if (this.frequencyDetialsByPackage.findIndex(item => item.frequencyName == configuration.Daily) !== -1) {
                frequencyIds.push(this.frequencyDetialsByPackage.find(item => item.frequencyName == configuration.Daily).frequencyId)
            }
            if (this.frequencyDetialsByPackage.findIndex(item => item.frequencyName == configuration.Weekly) !== -1 && dayNo == 0) {
                frequencyIds.push(this.frequencyDetialsByPackage.find(item => item.frequencyName == configuration.Weekly).frequencyId)
            }
            let result=this.frequencyDetialsByPackage.filter(u =>
                frequencyIds.includes(u.frequencyId)
            );
            // if (result.findIndex(item => item.frequencyName == configuration.Fortnightly) !== -1 && diffDays < 0) {
            //     let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd');   
            //     if((new Date(currentDate).getMonth()>new Date(transactionDate).getMonth())||(new Date(currentDate).getDate()-new Date(transactionDate).getDate()>0))
            //     {
            //         if (this.frequencyDetialsByPackage.findIndex(item => item.frequencyName == configuration.Weekly) !== -1 && dayNo == 0) {
            //             frequencyIds.push(this.frequencyDetialsByPackage.find(item => item.frequencyName == configuration.Weekly).frequencyId)
            //         }
            //         result=this.frequencyDetialsByPackage.filter(u =>
            //             frequencyIds.includes(u.frequencyId));
            //     }
            //     else
            //     {
            //             result = null;
            //             this.ShowSaveButton = true;
            //             result=this.frequencyDetialsByPackage.filter(u => u.frequencyId ==
            //                 this.frequencyDetialsByPackage.find(item => item.frequencyName == configuration.Fortnightly).frequencyId
            //             )
            //     }
            // }
            
            this.editFrequencyDetails = result;
            this.activeFrequency = this.editFrequencyDetails[0].frequencyName;
            this.activeFrequencyId = this.editFrequencyDetails[0].frequencyId;
            const result1 = functionOla.filter(x => x.FrequencyId == this.activeFrequencyId);
            this.editScoreData = result1.sort((a, b) => a.OLADate.localeCompare(b.OLADate));
            let applicableFrequecnyIds = this.editFrequencyDetails.map(x => x.frequencyId);
            this.applicabeFunctionOLADetails = this.functionOLADetails.filter(u =>
                applicableFrequecnyIds.includes(u.FrequencyId)
            );
            this.loadingSymbolForCreateModal = false;
        });
    }


    //Getting all function OLA details when clicked on Frequency
    frequencyWiseScore(e) {
        this.loadingSymbolForCreateModal = true;
        this.activeFrequencyId = e.target.id;
        this.activeFrequency = e.target.text;
        if (this.isCreate) {
            //this.getCreateScore();
            const result = this.applicabeFunctionOLADetails.filter(x => x.FrequencyId == this.activeFrequencyId);
            this.editScoreData = result.sort((a, b) => a.OLADate.localeCompare(b.OLADate));
        }
        else {
            var activeTransation = this.transactionDetails;
            var activeFunctionOLA = this.applicabeFunctionOLADetails.filter(x => x.FrequencyId == this.activeFrequencyId);
            this.editScoreData = activeFunctionOLA.sort((a, b) => a.OLADate.localeCompare(b.OLADate));
            console.log(this.editScoreData);
            // if (activeTransation.length == 0) {
            //     this.editScoreData = activeFunctionOLA;
            // }
            // else {
            //     // const transaction1 = activeTransation.map(val => {
            //     //     return Object.assign({}, val, this.ratingDetails.filter(v => v.RatingId === val.RatingId)[0]);
            //     // });
            //     const result = activeFunctionOLA.map(val => {
            //         return Object.assign({}, val, activeTransation.filter(v => v.FunctionId === val.FunctionId && v.OLAId == val.OLAId)[0]);
            //     });
            //     this.editScoreData = result;
            // }
        }
        this.loadingSymbolForCreateModal = false;
    }

    //When OLA get selected
    optionalOLA(item) {
        //debugger;
        if (this.editFrequencyDetails.findIndex(item => item.frequencyName == configuration.Fortnightly) !== -1 && item.IsOptional == 1) {
            this.applicabeFunctionOLADetails.find(x => x.OLAId == item.OLAId).RatingNm = item.RatingNm;
            var transactionLength = this.transactionDetails != undefined ? this.transactionDetails.length : 0;
            if (transactionLength == 0) {
                if (item.RatingNm == configuration.NA) {
                    this.editScoreData.filter(x => x.FunctionId == item.FunctionId).forEach(x => { x.RatingNm = configuration.NA; });
                    this.applicabeFunctionOLADetails.filter(x => x.FunctionId == item.FunctionId).forEach(x => { x.RatingNm = configuration.NA; });
                }
                else {
                    this.editScoreData.filter(x => x.FunctionId == item.FunctionId && x.RatingNm == configuration.NA).forEach(x => { x.RatingNm = ""; });
                    this.applicabeFunctionOLADetails.filter(x => x.FunctionId == item.FunctionId && x.RatingNm == configuration.NA).forEach(x => { x.RatingNm = ""; });
                }
            }
            else {
                var frequencyIds = this.editFrequencyDetails.map(x => x.frequencyId != this.activeFrequencyId);
                var functionOLA = this.functionOLADetails.filter(x => frequencyIds.includes(x.FrequencyId));
                var functionIds = functionOLA.map(x => x.OLAId);
                var transactions = this.transactionDetails.filter(x => functionIds.includes(x.OLAId));
                var NAIndex = transactions.findIndex(x => x.RatingNm == configuration.NA);
                var NotNAIndex = transactions.findIndex(x => x.RatingNm !== configuration.NA);
                if (item.RatingNm == configuration.NA) {
                    if (NotNAIndex !== -1) {
                        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                        modalRef.componentInstance.title = configuration.Alert;
                        modalRef.componentInstance.message = configuration.OLANotNAValidation;
                    }
                    else {
                        this.editScoreData.filter(x => x.FunctionId == item.FunctionId).forEach(x => { x.RatingNm = configuration.NA; });
                    }
                }
                else {
                    if (NAIndex !== -1) {
                        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                        modalRef.componentInstance.title = configuration.Alert;
                        modalRef.componentInstance.message = configuration.OLANAValidation;
                    }
                    else {
                        this.editScoreData.filter(x => x.FunctionId == item.FunctionId && x.RatingNm == configuration.NA).forEach(x => { x.RatingNm = ""; });
                    }
                }
            }
        }
        else {
            this.applicabeFunctionOLADetails.find(x => x.OLAId == item.OLAId).RatingNm = item.RatingNm;
            if (item.IsOptional == 1) {
                if (item.RatingNm == configuration.NA) {
                    this.editScoreData.filter(x => x.FunctionId == item.FunctionId).forEach(x => { x.RatingNm = configuration.NA; });
                    this.applicabeFunctionOLADetails.filter(x => x.FunctionId == item.FunctionId).forEach(x => { x.RatingNm = configuration.NA; });
                }
                else {
                    this.editScoreData.filter(x => x.FunctionId == item.FunctionId && x.RatingNm == configuration.NA).forEach(x => { x.RatingNm = ""; });
                    this.applicabeFunctionOLADetails.filter(x => x.FunctionId == item.FunctionId && x.RatingNm == configuration.NA).forEach(x => { x.RatingNm = ""; });
                }
            }
        }
    }

    //Save/Update data
    saveScore() {
        this.loadingSymbolForCreateModal = true;
        if (this.transactionId !== -1) {
            this.saveScoreCall();
        }
        else {
            var transactionDate = this.datepipe.transform(this.periodDateId, 'yyyy-MM-dd');
            this.scoreDataService.getTransaction(this.packageTypeId, this.vendorId, this.facilityId, transactionDate).subscribe(
                data => {
                    if (data.length == 0) {
                        this.saveScoreCall();
                    }
                    else {
                        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                        modalRef.componentInstance.title = configuration.Alert;
                        modalRef.componentInstance.message = "ScoreCard " + data[0].TransactionRefNo + " is already created for this selection.";
                        this.loadingSymbolForSubmitModal = false;
                    }
                }
            )
        }
    }

    saveScoreCall() {
        //this.createEditScoreHeader = "Edit Scores";
        if (this.editScoreData.findIndex(x => x.RatingNm == undefined || x.RatingNm == "") == -1) {
            let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
            if (this.isCreate) {
                //#region Create
                var packageName = this.packageTypeDetails.find(x => x.packageId == this.packageTypeId).packageName;
                var facility = this.facilityDetails.find(x => x.facilityId == this.facilityId).facilityName;
                var vendor = this.vendorDetails.find(x => x.vendorId == this.vendorId).vendorName;
                var date = this.periodDateId.toString();
                var transactionDate = this.datepipe.transform(date, 'yyyy-MM-dd');
                let transdate = this.datepipe.transform(date, 'dd-MM-yyyy');
                var transactionRefNo = packageName.replace(/\s/g, "") + '_' + facility.replace(/\s/g, "") + '_' + vendor.replace(/\s/g, "") + '_' + transdate;
                var statusId = this.statusDetails.find(x => x.statusName == configuration.Draft).statusId;
                var functionDetails = [];
                var frequencyIds = this.editFrequencyDetails.map(x => x.frequencyId);
                var applicableFunctionOLADetails = this.functionOLADetails.filter(u => frequencyIds.includes(u.FrequencyId));
                let optionalOLAScoredNA = this.editScoreData.findIndex(x => x.RatingNm == configuration.NA);
                if (optionalOLAScoredNA != -1) {
                    //var functions = this.editScoreData.filter(x=>x.RatingNm == configuration.NotMet).map(x=>x.FunctionId);
                    // const uniqueNames = Object.keys(
                    //     this.editScoreData.filter(x=>x.RatingNm == configuration.NotMet).map(u => u.FunctionId).reduce((un, u) => ({ ...un, u }),{})
                    //   );
                    var functions = Array.from(new Set(this.editScoreData.filter(x => x.RatingNm == configuration.NA).map(x => x.FunctionId)));
                    //var optionFunction = this.functionDetails.filter(x=>x.IsOptional == 1).reduce((ty, u) => ty + u, 0);
                    var weightageSum = 0;
                    for (var i = 0; i < functions.length; i++) {
                        weightageSum += this.functionDetails.find(x => x.FunctionId == functions[i]).Weightage
                    }
                    var notOptionalFunctionLength = Array.from(new Set(applicableFunctionOLADetails.filter(x => x.IsOptional == 0).map(x => x.FunctionId))).length;
                    var avgWeightage = notOptionalFunctionLength != 0 ? weightageSum / notOptionalFunctionLength : 0;
                    for (var i = 0; i < this.functionDetails.length; i++) {
                        var fun =
                        {   
                            FunctionId: this.functionDetails[i].FunctionId,
                            FunctionNm: this.functionDetails[i].FunctionNm,
                            Weightage: functions.findIndex(x => x == this.functionDetails[i].FunctionId) == -1 ? this.functionDetails[i].Weightage + avgWeightage : 0,
                            OLACnt: applicableFunctionOLADetails.filter(x => x.FunctionId == this.functionDetails[i].FunctionId).length,
                            IsOptional: this.functionDetails[i].IsOptional
                        };
                        functionDetails.push(fun);
                    }
                }
                else {
                    functionDetails = this.functionDetails;
                }
                var TransactionDetails = [];
                for (var i = 0; i < this.editScoreData.length; i++) {
                    var data =
                    {
                        FunctionId: this.editScoreData[i].FunctionId,
                        OLAId: this.editScoreData[i].OLAId,
                        RatingId: this.ratingDetails.find(x => x.RatingNm == this.editScoreData[i].RatingNm).RatingId,
                        ScoreWeightage: functionDetails.find(x => x.FunctionId == this.editScoreData[i].FunctionId).Weightage / applicableFunctionOLADetails.filter(x => x.FunctionId == this.editScoreData[i].FunctionId).length,
                        Score: (this.editScoreData[i].RatingNm == configuration.NotMet || this.editScoreData[i].RatingNm == configuration.NA) ? 0 : (functionDetails.find(x => x.FunctionId == this.editScoreData[i].FunctionId).Weightage / applicableFunctionOLADetails.filter(x => x.FunctionId == this.editScoreData[i].FunctionId).length) * this.ratingDetails.find(x => x.RatingNm == this.editScoreData[i].RatingNm).Score / 100,
                        CreatedBy: this.loggedEnterpriseId, CreateDttm: currentDate, UpdatedBy: this.loggedEnterpriseId, UpdatedDttm: currentDate
                    };
                    TransactionDetails.push(data);
                }
                this.scoreDataService.saveTransaction(transactionRefNo, this.packageTypeId, this.vendorId, this.facilityId, statusId, transactionDate, TransactionDetails, this.loggedEnterpriseId).subscribe(
                    data => {
                        const d = data;
                        if (data == -1) {
                            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                            modalRef.componentInstance.title = configuration.Alert;
                            modalRef.componentInstance.message = "ScoreCard " + transactionRefNo + " is already created for this selection.";
                            this.loadingSymbolForSubmitModal = false;
                        }
                        else {
                            this.transactionId = data;
                            this.getTransactionAfterUpdate();
                            this.scoreDataService.getTransactionCode(this.transactionId).subscribe(
                                data => {
                                    this.transactionRefNo = data;
                                    this.createEditScoreHeader = "Edit Scores: " + data;
                                    this.loadingSymbolForCreateModal = false;
                                }
                            );
                            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                            modalRef.componentInstance.title = configuration.Success;
                            modalRef.componentInstance.message = configuration.SaveMessage;
                            this.getFilteredData();
                        }

                    }
                );
                this.isCreate = false;
                //#endregion
            }
            else {
                //#region Edit/Update
                if (this.editableOnReject == true) {
                    //#region new Score
                    var functionDetails = [];
                    var frequencyIds = this.editFrequencyDetails.map(x => x.frequencyId);
                    var applicableFunctionOLADetails = this.functionOLADetails.filter(u => frequencyIds.includes(u.FrequencyId));
                    let optionalOLAScoredNA = this.editScoreData.findIndex(x => x.RatingNm == configuration.NA);
                    if (optionalOLAScoredNA != -1) {
                        var functions = Array.from(new Set(this.editScoreData.filter(x => x.RatingNm == configuration.NA).map(x => x.FunctionId)));
                        var weightageSum = 0;
                        for (var i = 0; i < functions.length; i++) {
                            weightageSum += this.functionDetails.find(x => x.FunctionId == functions[i]).Weightage
                        }
                        var notOptionalFunctionLength = Array.from(new Set(applicableFunctionOLADetails.filter(x => x.IsOptional == 0).map(x => x.FunctionId))).length;
                        var avgWeightage = notOptionalFunctionLength != 0 ? weightageSum / notOptionalFunctionLength : 0;
                        for (var i = 0; i < this.functionDetails.length; i++) {
                            var fun =
                            {
                                FunctionId: this.functionDetails[i].FunctionId,
                                FunctionNm: this.functionDetails[i].FunctionNm,
                                Weightage: functions.findIndex(x => x == this.functionDetails[i].FunctionId) == -1 ? this.functionDetails[i].Weightage + avgWeightage : 0,
                                OLACnt: applicableFunctionOLADetails.filter(x => x.FunctionId == this.functionDetails[i].FunctionId).length,
                                IsOptional: this.functionDetails[i].IsOptional
                            };
                            functionDetails.push(fun);
                        }
                    }
                    else {
                        functionDetails = this.functionDetails;
                    }
                    var TransactionDetails = [];
                    var newTransaction = this.editScoreData.filter(x => x.TransactionId != this.transactionId);
                    var oldTransaction = this.editScoreData.filter(x => x.TransactionId == this.transactionId);
                    for (var i = 0; i < newTransaction.length; i++) {
                        let length = applicableFunctionOLADetails.filter(x => x.FunctionId == newTransaction[i].FunctionId).length;
                        let weightage = functionDetails.find(x => x.FunctionId == newTransaction[i].FunctionId).Weightage;
                        var data1 =
                        {
                            TransactionId: this.transactionId,
                            FunctionId: newTransaction[i].FunctionId,
                            OLAId: newTransaction[i].OLAId,
                            RatingId: this.ratingDetails.find(x => x.RatingNm == newTransaction[i].RatingNm).RatingId,
                            ScoreWeightage: weightage / length,
                            Score: (newTransaction[i].RatingNm == configuration.NotMet || newTransaction[i].RatingNm == configuration.NA) ? 0 : (weightage / length) * this.ratingDetails.find(x => x.RatingNm == newTransaction[i].RatingNm).Score / 100,
                            CreatedBy: this.loggedEnterpriseId, CreateDttm: currentDate, UpdatedBy: this.loggedEnterpriseId, UpdatedDttm: currentDate
                        };
                        TransactionDetails.push(data1);
                    }
                    var TransactionDetails1 = [];
                    for (var i = 0; i < oldTransaction.length; i++) {
                        let length = applicableFunctionOLADetails.filter(x => x.FunctionId == oldTransaction[i].FunctionId).length;
                        let weightage = functionDetails.find(x => x.FunctionId == oldTransaction[i].FunctionId).Weightage;
                        var data2 =
                        {
                            TransactionId: this.transactionId,
                            TransactionDetailsId: oldTransaction[i].TransactionDetailsId,
                            RatingId: this.ratingDetails.find(x => x.RatingNm == oldTransaction[i].RatingNm).RatingId,
                            ScoreWeightage: weightage / length,
                            Score: (oldTransaction[i].RatingNm == configuration.NotMet || oldTransaction[i].RatingNm == configuration.NA) ? 0 : (weightage / length) * this.ratingDetails.find(x => x.RatingNm == oldTransaction[i].RatingNm).Score / 100,
                            UpdatedBy: this.loggedEnterpriseId, UpdatedDttm: currentDate
                        };
                        TransactionDetails1.push(data2);
                    }
                    if (oldTransaction.length != 0 && newTransaction.length != 0) {
                        let saveTransactionDetails = this.scoreDataService.saveTransactionDetails(this.transactionId, TransactionDetails);
                        let updateTransactionDetails = this.scoreDataService.updateTransactionDetails(this.transactionId, TransactionDetails1);
                        forkJoin([saveTransactionDetails, updateTransactionDetails]).subscribe(results => {
                            const d = results[0];
                            const d1 = results[1];
                            this.getTransactionAfterUpdate();
                            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                            modalRef.componentInstance.title = configuration.Success;
                            modalRef.componentInstance.message = configuration.UpdateMessage;
                            this.getFilteredData();
                        });
                    }
                    else if (oldTransaction.length != 0) {
                        this.scoreDataService.updateTransactionDetails(this.transactionId, TransactionDetails1).subscribe(
                            data => {
                                const d = data;
                                this.getTransactionAfterUpdate();
                                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                modalRef.componentInstance.title = configuration.Success;
                                modalRef.componentInstance.message = configuration.UpdateMessage;
                                this.getFilteredData();
                            }
                        );
                    }
                    else if (newTransaction.length != 0) {
                        this.scoreDataService.saveTransactionDetails(this.transactionId, TransactionDetails).subscribe(
                            data => {
                                const d = data;
                                this.getTransactionAfterUpdate();
                                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                modalRef.componentInstance.title = configuration.Success;
                                modalRef.componentInstance.message = configuration.SaveMessage;
                                this.getFilteredData();
                            }
                        );
                    }
                    //#endregion
                }
                else {
                    //#region Rejected Score
                    this.scoreDataService.saveTransactionAuditLog(this.transactionId).subscribe(
                        data => {
                            var savedData = data;
                            var transactionCode = this.transactionRefNo;
                            let indexofVersion = this.transactionRefNo.indexOf("-V");
                            if (indexofVersion != -1) {
                                var versionNo1 = this.transactionRefNo.slice(indexofVersion + 2, this.transactionRefNo.length);
                                let version = +versionNo1 + 1;
                                transactionCode = this.transactionRefNo.slice(0, indexofVersion + 2) + version;
                            }
                            else {
                                transactionCode = transactionCode + "-V1";
                            }
                            this.scoreDataService.updateTransactionCode(this.transactionId, transactionCode, this.loggedEnterpriseId, currentDate).subscribe(
                                data => {
                                    var d = data;
                                    this.createEditScoreHeader = "Edit Scores: " + transactionCode;
                                    this.getFilteredData();
                                }
                            );
                            var functionDetails = [];
                            var frequencyIds = this.editFrequencyDetails.map(x => x.frequencyId);
                            var applicableFunctionOLADetails = this.functionOLADetails.filter(u => frequencyIds.includes(u.FrequencyId));
                            let optionalOLAScoredNA = this.editScoreData.findIndex(x => x.RatingNm == configuration.NA);
                            if (optionalOLAScoredNA != -1) {
                                var functions = Array.from(new Set(this.editScoreData.filter(x => x.RatingNm == configuration.NA).map(x => x.FunctionId)));
                                var weightageSum = 0;
                                for (var i = 0; i < functions.length; i++) {
                                    weightageSum += this.functionDetails.find(x => x.FunctionId == functions[i]).Weightage
                                }
                                var notOptionalFunctionLength = Array.from(new Set(applicableFunctionOLADetails.filter(x => x.IsOptional == 0).map(x => x.FunctionId))).length;
                                var avgWeightage = notOptionalFunctionLength != 0 ? weightageSum / notOptionalFunctionLength : 0;
                                for (var i = 0; i < this.functionDetails.length; i++) {
                                    var fun =
                                    {
                                        FunctionId: this.functionDetails[i].FunctionId,
                                        FunctionNm: this.functionDetails[i].FunctionNm,
                                        Weightage: functions.findIndex(x => x == this.functionDetails[i].FunctionId) == -1 ? this.functionDetails[i].Weightage + avgWeightage : 0,
                                        OLACnt: applicableFunctionOLADetails.filter(x => x.FunctionId == this.functionDetails[i].FunctionId).length,
                                        IsOptional: this.functionDetails[i].IsOptional
                                    };
                                    functionDetails.push(fun);
                                }
                            }
                            else {
                                functionDetails = this.functionDetails;
                            }
                            var TransactionDetails = [];
                            var newTransaction = this.editScoreData.filter(x => x.TransactionId != this.transactionId);
                            var oldTransaction = this.editScoreData.filter(x => x.TransactionId == this.transactionId);
                            for (var i = 0; i < newTransaction.length; i++) {
                                var data1 =
                                {
                                    TransactionId: this.transactionId,
                                    FunctionId: newTransaction[i].FunctionId,
                                    OLAId: newTransaction[i].OLAId,
                                    RatingId: this.ratingDetails.find(x => x.RatingNm == newTransaction[i].RatingNm).RatingId,
                                    ScoreWeightage: functionDetails.find(x => x.FunctionId == newTransaction[i].FunctionId).Weightage / applicableFunctionOLADetails.filter(x => x.FunctionId == newTransaction[i].FunctionId).length,
                                    Score: (newTransaction[i].RatingNm == configuration.NotMet || newTransaction[i].RatingNm == configuration.NA) ? 0 : (functionDetails.find(x => x.FunctionId == newTransaction[i].FunctionId).Weightage / applicableFunctionOLADetails.filter(x => x.FunctionId == newTransaction[i].FunctionId).length) * this.ratingDetails.find(x => x.RatingNm == newTransaction[i].RatingNm).Score / 100,
                                    CreatedBy: this.loggedEnterpriseId, CreateDttm: currentDate, UpdatedBy: this.loggedEnterpriseId, UpdatedDttm: currentDate
                                };
                                TransactionDetails.push(data1);
                            }
                            var TransactionDetails1 = [];
                            for (var i = 0; i < oldTransaction.length; i++) {
                                var data2 =
                                {
                                    TransactionId: this.transactionId,
                                    TransactionDetailsId: oldTransaction[i].TransactionDetailsId,
                                    RatingId: this.ratingDetails.find(x => x.RatingNm == oldTransaction[i].RatingNm).RatingId,
                                    ScoreWeightage: functionDetails.find(x => x.FunctionId == oldTransaction[i].FunctionId).Weightage / applicableFunctionOLADetails.filter(x => x.FunctionId == oldTransaction[i].FunctionId).length,
                                    Score: (oldTransaction[i].RatingNm == configuration.NotMet || oldTransaction[i].RatingNm == configuration.NA) ? 0 : (functionDetails.find(x => x.FunctionId == oldTransaction[i].FunctionId).Weightage / applicableFunctionOLADetails.filter(x => x.FunctionId == oldTransaction[i].FunctionId).length) * this.ratingDetails.find(x => x.RatingNm == oldTransaction[i].RatingNm).Score / 100,
                                    UpdatedBy: this.loggedEnterpriseId, UpdatedDttm: currentDate
                                };
                                TransactionDetails1.push(data2);
                            }
                            if (oldTransaction.length != 0 && newTransaction.length != 0) {
                                let saveTransactionDetails = this.scoreDataService.saveTransactionDetails(this.transactionId, TransactionDetails);
                                let updateTransactionDetails = this.scoreDataService.updateTransactionDetails(this.transactionId, TransactionDetails1);
                                forkJoin([saveTransactionDetails, updateTransactionDetails]).subscribe(results => {
                                    const d = results[0];
                                    const d1 = results[1];
                                    this.getTransactionAfterUpdate();
                                    const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                    modalRef.componentInstance.title = configuration.Success;
                                    modalRef.componentInstance.message = configuration.SaveMessage;
                                    this.editableOnReject = true;
                                });
                            }
                            else if (oldTransaction.length != 0) {
                                this.scoreDataService.updateTransactionDetails(this.transactionId, TransactionDetails1).subscribe(
                                    data => {
                                        const d = data;
                                        this.getTransactionAfterUpdate();
                                        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                        modalRef.componentInstance.title = configuration.Success;
                                        modalRef.componentInstance.message = configuration.SaveMessage;
                                        this.editableOnReject = true;
                                    }
                                );
                            }
                            else if (newTransaction.length != 0) {
                                this.scoreDataService.saveTransactionDetails(this.transactionId, TransactionDetails).subscribe(
                                    data => {
                                        const d = data;
                                        this.getTransactionAfterUpdate();
                                        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                        modalRef.componentInstance.title = configuration.Success;
                                        modalRef.componentInstance.message = configuration.SaveMessage;
                                        this.editableOnReject = true;
                                    }
                                );
                            }
                        }
                    );
                    //#endregion
                }
                //#endregion
            }
        }
        else {
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            modalRef.componentInstance.title = configuration.Mandatory;
            modalRef.componentInstance.message = configuration.OLAMandatorySelection;
            this.loadingSymbolForCreateModal = false;
        }
    }

    getTransactionAfterUpdate() {
        debugger;
        this.scoreDataService.getTransactionDetials(this.transactionId).subscribe(
            data => {
                this.transactionDetails = data;
                //this.editableOnReject = data.map(x => x.IsEditable);
                //this.transactionRefNo = data.map(x => x.TransactionRefNo);
                var activeTransation = this.transactionDetails;
                //this.createEditScoreHeader = "Edit Scores: " + this.transactionRefNo;
                var activeFunctionOLA = this.functionOLADetails.filter(x => x.FrequencyId == this.activeFrequencyId);
                if (activeTransation.length == 0) {
                    this.editScoreData = activeFunctionOLA;
                }
                else {
                    const transaction1 = activeTransation.map(val => {
                        return Object.assign({}, val, this.ratingDetails.filter(v => v.RatingId === val.RatingId)[0]);
                    });
                    const result = activeFunctionOLA.map(val => {
                        return Object.assign({}, val, transaction1.filter(v => v.FunctionId === val.FunctionId && v.OLAId == val.OLAId)[0]);
                    });
                    this.editScoreData = result;
                }
                this.loadingSymbolForCreateModal = false;
            }
        );
    }

    //Clear the OLA feedback 
    clearScore() {
        //debugger;
        var lenghtTransaction = this.transactionDetails != undefined ? this.transactionDetails.length : 0;
        var activeFunctionOLA = this.applicabeFunctionOLADetails.filter(x => x.FrequencyId == this.activeFrequencyId);
        if (lenghtTransaction == 0) {
            this.editScoreData = activeFunctionOLA.sort((a, b) => a.OLADate.localeCompare(b.OLADate));
            this.editScoreData.forEach(
                x => { x.RatingNm = "" }
            )
            this.applicabeFunctionOLADetails.forEach(
                x => { x.RatingNm = "" }
            )
        }
        else {
            const transaction1 = this.transactionDetails.map(val => {
                return Object.assign({}, val, this.ratingDetails.filter(v => v.RatingId === val.RatingId)[0]);
            });
            const result = activeFunctionOLA.map(val => {
                return Object.assign({}, val, transaction1.filter(v => v.FunctionId === val.FunctionId && v.OLAId == val.OLAId)[0]);
            });
            this.applicabeFunctionOLADetails = this.applicabeFunctionOLADetails.map(val => {
                return Object.assign({}, val, result.filter(v => v.FunctionId === val.FunctionId && v.OLAId == val.OLAId)[0]);
            });
            this.editScoreData = result.sort((a, b) => a.OLADate.localeCompare(b.OLADate));
        }
    }   

    //OPen popup when clicked on Edit of a row
    editScore(createScoreModal, e) {
        debugger;
        this.ShowSaveButton = false;
        this.loadingSymbolForCreateModal = true;
        this.editableOnReject = e.IsEditable;
        this.createPackageTypeDetails = this.packageDetails.filter(x => x.packageId == e.PackageId);
        this.createFacilityDetails = this.facilityDetails;
        this.createVendorDetails = this.vendorDetails;
        this.isCreate = false;
        this.createEditScoreHeader = "Edit Scores: " + e.TransactionRefNo;
        this.transactionId = e.TransactionId;
        this.transactionRefNo = e.TransactionRefNo;
        this.packageTypeId = e.PackageId;
        this.packageName = e.packageName;
        this.vendorId = e.ServiceProviderId;
        this.vendorName = e.vendorName;
        this.facilityId = e.FacilityId;
        this.facilityName = e.facilityName;
        this.statusName = e.StatusNm;
        this.periodDateId = this.datepipe.transform(e.TransactionDt, 'yyyy-MM-dd');
        this.periodDateDropDown.push(this.periodDateId);
        var transactionDate = this.datepipe.transform(this.periodDateId, 'yyyy-MM-dd');
        var date: Date = new Date(transactionDate);
        var dayNo: number = date.getDay();
        const dailyDate = new Date();
        dailyDate.setDate(dailyDate.getDate() - 1);
        var today: Date = new Date(this.datepipe.transform(dailyDate, 'yyyy-MM-dd'));
        var timeDiff = Math.round(today.getTime() - date.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        let getFrequencyDetialsByPackage = this.scoreDataService.getFrequencyDetialsByPackage(this.packageTypeId);
        let getFrequencyDetialsByCurrentDate = this.scoreDataService.getFrequencyDetialsByDate(this.periodDateId);
        let getFunctionOLADetials = this.scoreDataService.getFunctionOLADetials(this.packageTypeId, -1);
        let getTransactionDetials = this.scoreDataService.getTransactionDetials(this.transactionId);
        forkJoin([getFrequencyDetialsByPackage, getFrequencyDetialsByCurrentDate, getFunctionOLADetials, getTransactionDetials]).subscribe(results => {
            let frequencyByPackage = results[0];
            let frequencyByDate = results[1];
            let functionOla = results[2];
            let transaction = results[3];
            this.frequencyDetialsByPackage = frequencyByPackage;
            this.functionOLADetails = functionOla;
            this.transactionDetails = transaction;
            var frequencyIds = frequencyByDate.map(x => x.FrequencyId);
            if (this.frequencyDetialsByPackage.findIndex(item => item.frequencyName == configuration.Daily) !== -1) {
                frequencyIds.push(this.frequencyDetialsByPackage.find(item => item.frequencyName == configuration.Daily).frequencyId)
            }
            if (this.frequencyDetialsByPackage.findIndex(item => item.frequencyName == configuration.Weekly) !== -1 && dayNo == 0) {
                frequencyIds.push(this.frequencyDetialsByPackage.find(item => item.frequencyName == configuration.Weekly).frequencyId)
            }
            let editFrequency = this.frequencyDetialsByPackage.filter(u =>
                frequencyIds.includes(u.frequencyId)
            );
            // if (editFrequency.findIndex(item => item.frequencyName == configuration.Fortnightly) !== -1 && diffDays <= 0 && this.statusName == configuration.Draft) {
            //     let currentDate=this.datepipe.transform(new Date(), 'yyyy-MM-dd'); 
            //     if((new Date(currentDate).getMonth()>new Date(transactionDate).getMonth())||(new Date(currentDate).getDate()-new Date(transactionDate).getDate()>0))
            //     {
            //         if (this.frequencyDetialsByPackage.findIndex(item => item.frequencyName == configuration.Weekly) !== -1 && dayNo == 0) {
            //             frequencyIds.push(this.frequencyDetialsByPackage.find(item => item.frequencyName == configuration.Weekly).frequencyId)
            //         }
            //         editFrequency=this.frequencyDetialsByPackage.filter(u =>
            //             frequencyIds.includes(u.frequencyId));
            //             if(e.StatusNm == configuration.Draft){
            //                 var notfortnightly=editFrequency.filter(u=>u.frequencyName!==configuration.Fortnightly);
            //                 for(let k=0;k<notfortnightly.length;k++){
            //                 for(let i=0;i<functionOla.length;i++){
            //                     var obj={
            //                         TransactionId:transaction[0].TransactionId,
            //                         FunctionId:functionOla[i].FrequencyId==notfortnightly[k].frequencyId?functionOla[i].FunctionId:"",
            //                         OLAId:functionOla[i].FrequencyId==notfortnightly[k].frequencyId?functionOla[i].OLAId:"",
            //                     } 
            //                     if(functionOla[i].FrequencyId==notfortnightly[k].frequencyId){
            //                     transaction.push(obj);
            //                     }
            //                 }
            //             }
            //     }
            // }
            //     else    
            //     {
            //         editFrequency = null;
            //         this.ShowSaveButton = true;
            //         editFrequency = this.frequencyDetialsByPackage.filter(u => u.frequencyId ==
            //             this.frequencyDetialsByPackage.find(item => item.frequencyName == configuration.Fortnightly).frequencyId
            //         );
            //     }
              
            // }
          
           if (e.StatusNm !== configuration.Draft) {
                let transactionOLAIds = transaction.map(x => x.OLAId);
                let transactionFrequencyIds = functionOla.filter(x => transactionOLAIds.includes(x.OLAId)).map(x => x.FrequencyId);
                this.editFrequencyDetails = editFrequency.filter(x => transactionFrequencyIds.includes(x.frequencyId));
            }
            else {
                this.editFrequencyDetails = editFrequency;
            }
            this.activeFrequency = this.editFrequencyDetails[0].frequencyName;
            this.activeFrequencyId = this.editFrequencyDetails[0].frequencyId;
            if (transaction.length == 0) {
                this.editScoreData = functionOla.filter(x => x.FrequencyId == this.activeFrequencyId);
                this.editScoreData = this.editScoreData.sort((a, b) => a.OLADate.localeCompare(b.OLADate));
                this.applicabeFunctionOLADetails = functionOla;
            }
            else {
                let transactionOLAIds = transaction.map(x => x.OLAId);
                var activeFunctionOLA = functionOla.filter(x => x.FrequencyId == this.activeFrequencyId && transactionOLAIds.includes(x.OLAId));
                const transaction1 = transaction.map(val => {
                    return Object.assign({}, val, this.ratingDetails.filter(v => v.RatingId === val.RatingId)[0]);
                });
                const result = activeFunctionOLA.map(val => {
                    return Object.assign({}, val, transaction1.filter(v => v.FunctionId === val.FunctionId && v.OLAId == val.OLAId)[0]);
                });
                this.editScoreData = result.sort((a, b) => a.OLADate.localeCompare(b.OLADate));
                let applicableFrequecnyIds = this.editFrequencyDetails.map(x => x.frequencyId);
                this.applicabeFunctionOLADetails = functionOla.map(val => {
                    return Object.assign({}, val, transaction1.filter(v => v.FunctionId === val.FunctionId && v.OLAId == val.OLAId)[0]);
                }).filter(u =>
                    applicableFrequecnyIds.includes(u.FrequencyId) && transactionOLAIds.includes(u.OLAId)
                );
            }
            this.loadingSymbolForCreateModal = false;
        });
        this.scoreDataService.getFunctionDetials(this.packageTypeId).subscribe(
            data => {
                this.functionDetails = data;
            }
        );
        this.modalService.open(createScoreModal, { backdrop: 'static', keyboard: false, windowClass: "edit" });
    }

    //Redirect to Submit Score popup
    redirectSubmitPage(submitScoreModal) {
        debugger;
        this.loadingSymbolForCreateModal = true;
        if (this.transactionId == -1) {
            var packageName = this.packageTypeDetails.find(x => x.packageId == this.packageTypeId).packageName;
            var facility = this.facilityDetails.find(x => x.facilityId == this.facilityId).facilityName;
            var vendor = this.vendorDetails.find(x => x.vendorId == this.vendorId).vendorName;
            var dt = this.periodDateId.toString();
            let transdate = this.datepipe.transform(dt, 'dd-MM-yyyy');
            var transactionRefNo = packageName.replace(/\s/g, "") + '_' + facility.replace(/\s/g, "") + '_' + vendor.replace(/\s/g, "") + '_' + transdate;
            this.transactionRefNo = transactionRefNo;
            this.facilityName = facility;
            this.packageName = packageName;
        }

        var transactionDate = this.datepipe.transform(this.periodDateId, 'yyyy-MM-dd');
        var periodDate: Date = new Date(transactionDate);   
        var today: Date = new Date(this.datepipe.transform(new Date(), 'yyyy-MM-dd'));
        var nextPeriodDate = this.datepipe.transform(new Date(periodDate.getFullYear(), periodDate.getMonth(), periodDate.getDate() + 1), 'dd-MMM-yyyy')
        //var periodDateString = this.datepipe.transform(periodDate, 'yyyy-MM-dd');
        //var todayString = this.datepipe.transform(today, 'yyyy-MM-dd');

        if (this.applicabeFunctionOLADetails.findIndex(x => x.RatingNm == undefined || x.RatingNm == "") !== -1) {
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            modalRef.componentInstance.title = configuration.Alert;
            modalRef.componentInstance.message = configuration.GenerateScoreValidationOLA;
            this.loadingSymbolForCreateModal = false;
        }
        // else if (this.editFrequencyDetails.filter(x => x.frequencyName == configuration.Fortnightly).length !== 0 && periodDate >= today) {
        //     const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
        //     modalRef.componentInstance.title = configuration.Alert;
        //     modalRef.componentInstance.message = configuration.FornightPackageValidation + " " + nextPeriodDate;
        //     this.loadingSymbolForCreateModal = false;
        // }
        else if (this.packageName == configuration.Carpet) {
           
            var date = this.datepipe.transform(this.periodDateId, 'yyyy-MM-dd');
            let getTaskDetailsByVendor = this.scoreDataService.getTaskDetailsByVendor(this.vendorId, date);
            let getTaskMasterByFacility = this.scoreDataService.getTaskMasterByFacility(this.facilityId,new Date(date).getMonth()+1,new Date(date).getFullYear());
            forkJoin([getTaskDetailsByVendor, getTaskMasterByFacility]).subscribe(results => {
              
                let taskDetails = results[0];
                let taskMaster = results[1];
                if (taskDetails.length != 0) {
                    var taskIds = taskMaster.map(x => x.TaskId);
                    const data = taskDetails.filter(u =>
                        taskIds.includes(u.TaskId)
                    );
                    if (data.length == 0) {
                        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                        modalRef.componentInstance.title = configuration.Alert;
                        modalRef.componentInstance.message = configuration.GenerateScoreValidationTask;
                    }
                    else {
                        this.SubmitPage(submitScoreModal);
                    }
                }
                else {
                    const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                    modalRef.componentInstance.title = configuration.Alert;
                    modalRef.componentInstance.message = configuration.GenerateScoreValidationTask;
                }
                this.loadingSymbolForCreateModal = false;
            });
        }
        else {
            this.SubmitPage(submitScoreModal);
            this.loadingSymbolForCreateModal = false;
        }
    }

    SubmitPage(submitScoreModal) {
        this.loadingSymbolForSubmitModal = true;
        this.showKPIScoreCard = false;
        this.showWC = false;
        //this.clearScore();
        this.modalService.dismissAll();
        var transactionDate = this.datepipe.transform(this.periodDateId, 'yyyy-MM-dd');
        var date: Date = new Date(transactionDate);
        var year: number = date.getFullYear();
        var month: number = date.getMonth();
        var lastDay: Date = new Date(year, month + 1, 0);
        var firstDay: Date = new Date(year, month, 1);
        this.getSubmitData();
        this.getScoreCard(firstDay, lastDay, date);
        //this.getWCDetails(firstDay, lastDay);
        if (this.packageName == configuration.Carpet && lastDay.getDate() == date.getDate()) {
            this.getWCDetails(firstDay, lastDay);
        }
        this.modalService.open(submitScoreModal, { backdrop: 'static', keyboard: false, windowClass: "edit" });
        //this.loadingSymbolForSubmitModal = false;
    }

    //Back to Edit Score popup
    backtoCreateScoreModal(createScoreModal) {
        this.loadingSymbolForCreateModal = true;
        this.modalService.dismissAll();
        this.modalService.open(createScoreModal, { backdrop: 'static', keyboard: false, windowClass: "edit" });
        this.loadingSymbolForCreateModal = false;
    }

    //Dismiss Create/Edit Score popup
    dismissCreateScoreModal() {
        this.loadingSymbolForCreateModal = false;
        this.txtFrequencyDetail = "";
        this.facilityId = -1;
        this.facilityName = null;
        this.packageTypeId = -1;
        this.packageName = null;
        this.vendorId = -1;
        this.vendorName = null;
        this.periodDateId = -1;
        this.periodDateDropDown = [];
        this.functionDetails = null;
        this.frequencyDetialsByPackage = null;
        this.functionOLADetails = null;
        this.applicabeFunctionOLADetails = null;
        this.editFrequencyDetails = null;
        this.activeFrequency = null;
        this.activeFrequencyId = null;
        this.transactionDetails = null;
        this.editScoreData = null;
        this.editScoreDataDisplay = null;
        this.submitScoreData = null;
        this.submitScoreDataDisplay = null;
        this.scoreCard = null;
        this.TotalWeightageScore = null;
        this.penalty = 0;
        this.transactionId = -1;
        this.transactionRefNo = null;
        this.comments = null;
        this.existingTransactionMessageAlert = "";
        this.showKPIScoreCard = false;
        this.showWC = false;
        this.editableOnReject = true;
        this.pagerSubmit = {};
        this.countSubmit = 0;
        this.pageNumberSubmit = this.pagerService.pageNumberView;
        this.pageSizeSubmit = this.pagerService.pageSizeView;
        this.selectedPageSizeSubmit = this.pagerService.selectedPageSizeView;
        this.pageSizeSubmit = this.selectedPageSizeSubmit;
        this.sortColumnSubmit = "OLADate";
        this.sortDirectionSubmit = "asc";
        this.defaultSortSubmit = true; 
        this.viewWCFacilityWise=null;
        this.penaltyStructure=null;
        this.modalService.dismissAll();
    }

    //Toggle KPI ScoreCard Grid
    toggleKPIScoreCard() {
        this.showKPIScoreCard = !this.showKPIScoreCard;
    }

    //Toggle KPI WC Grid
    toggleWC() {
        this.showWC = !this.showWC;
    }

    //Get OLA Details in Submit Score popup
    getSubmitData() {
        debugger;
        let applicabeFunctionOLADetails = this.applicabeFunctionOLADetails;
        this.submitScoreData = applicabeFunctionOLADetails.map(val => {
            return Object.assign({}, val
                , this.frequencyDetails.filter(v => v.frequencyId === val.FrequencyId)[0]);
        });
        this.countSubmit = this.submitScoreData.length;
        this.setPagerSubmit();
    }
    
    //Get KPI ScoreCard in Submit Score popup
    getScoreCard(firstDay: Date, lastDay: Date, date: Date) {
        debugger;
        var functionDetails = [];
        var functionIds = Array.from(new Set(this.applicabeFunctionOLADetails.map(x => x.FunctionId))).map(x => x);
        let optionalOLAScoredNA = this.applicabeFunctionOLADetails.findIndex(x => x.RatingNm == configuration.NA);
        if (optionalOLAScoredNA != -1) {
            var NAFunctionIds = Array.from(new Set(this.applicabeFunctionOLADetails.filter(x => x.RatingNm == configuration.NA).map(x => x.FunctionId)));
            var weightageSum = 0;
            for (var i = 0; i < NAFunctionIds.length; i++) {
                weightageSum += this.functionDetails.find(x => x.FunctionId == NAFunctionIds[i]).Weightage
            }
            //var notOptionalFunctionLength = Array.from(new Set(this.applicabeFunctionOLADetails.filter(x => x.IsOptional == 0).map(x => x.FunctionId))).length;
            var notOptionalFunctionLength = Array.from(new Set(this.applicabeFunctionOLADetails.filter(x => x.RatingNm !== configuration.NA).map(x => x.FunctionId))).length;
            //If Package contains Service Function
            var serviceFunctionLength = Array.from(new Set(this.applicabeFunctionOLADetails.filter(x => x.FunctionNm.toLowerCase().includes("service".toLowerCase())&& x.RatingNm!=configuration.NA).map(x => x.FunctionId))).length;
            if(serviceFunctionLength != 0){
                notOptionalFunctionLength = serviceFunctionLength;
            }
            var avgWeightage = notOptionalFunctionLength != 0 ? weightageSum / notOptionalFunctionLength : 0;
        }
        for (var i = 0; i < functionIds.length; i++) {
            var funcNm = this.functionDetails.find(x => x.FunctionId == functionIds[i]).FunctionNm;
            var weightage = this.functionDetails.find(x => x.FunctionId == functionIds[i]).Weightage;
            var fun =
            {
                FunctionId: this.functionDetails.find(x => x.FunctionId == functionIds[i]).FunctionId,
                FunctionNm: this.functionDetails.find(x => x.FunctionId == functionIds[i]).FunctionNm,
                Weightage: optionalOLAScoredNA == -1 ?  weightage: (NAFunctionIds.findIndex(x => x == functionIds[i]) == -1 ? (serviceFunctionLength != 0 ?  (funcNm.toLowerCase().includes("service".toLowerCase()) ? weightage + avgWeightage: weightage) : weightage + avgWeightage) : 0),
                OLACnt: this.applicabeFunctionOLADetails.filter(x => x.FunctionId == functionIds[i]).length,
                IsOptional: this.functionDetails.find(x => x.FunctionId == functionIds[i]).IsOptional
            };
            functionDetails.push(fun);
        }
        var OLADetails = [];
        for (var i = 0; i < this.applicabeFunctionOLADetails.length; i++) {
            var TransactionId = this.applicabeFunctionOLADetails[i].TransactionId;
            var TransactionDetailsId = this.applicabeFunctionOLADetails[i].TransactionDetailsId;
            var FunctionId = this.applicabeFunctionOLADetails[i].FunctionId;
            var FunctionNm = this.applicabeFunctionOLADetails[i].FunctionNm;
            var OLAId = this.applicabeFunctionOLADetails[i].OLAId;
            var OLANm = this.applicabeFunctionOLADetails[i].OLANm;
            var IsOptional = this.applicabeFunctionOLADetails[i].IsOptional;
            var FrequencyId = this.applicabeFunctionOLADetails[i].FrequencyId;
            var Frequency = this.applicabeFunctionOLADetails[i].Frequency;
            var RatingId = this.ratingDetails.find(x => x.RatingNm == this.applicabeFunctionOLADetails[i].RatingNm).RatingId;
            var RatingScore = this.ratingDetails.find(x => x.RatingNm == this.applicabeFunctionOLADetails[i].RatingNm).Score;
            var Weightage = functionDetails.find(x => x.FunctionId == this.applicabeFunctionOLADetails[i].FunctionId).Weightage;
            var OLACnt = functionDetails.find(x => x.FunctionId == this.applicabeFunctionOLADetails[i].FunctionId).OLACnt;
            var ScoreWeightage = Weightage / OLACnt;
            var Score = (ScoreWeightage * RatingScore) / 100;   
            OLADetails.push({
                TransactionId: TransactionId, TransactionDetailsId: TransactionDetailsId,
                FunctionId: FunctionId, FunctionNm: FunctionNm, OLAId: OLAId, OLANm: OLANm, IsOptional: IsOptional,
                FrequencyId: FrequencyId, Frequency: Frequency, RatingId: RatingId, RatingScore: RatingScore, Weightage: Weightage,
                OLACnt: OLACnt, ScoreWeightage: ScoreWeightage, Score: Score
            });
        }
        this.OLADetails = OLADetails;
        var finalResult = [];
        for (var i = 0; i < functionIds.length; i++) {
            var FunctionNm = OLADetails.find(x => x.FunctionId == functionIds[i]).FunctionNm;
            var Weightage = OLADetails.find(x => x.FunctionId == functionIds[i]).Weightage;
            let Score = OLADetails.filter(x => x.FunctionId == functionIds[i]).reduce((sum, Score) => sum + Score.Score, 0);
            finalResult.push({ FunctionId: functionIds[i], FunctionNm: FunctionNm, Weightage: Weightage, Score: Score });
        }
        this.TotalWeightageScore = finalResult.reduce((sum, Score) => sum + Score.Score, 0);
        this.scoreCard = finalResult;
        var getPenaltyByPackage =this.scoreDataService.getPenaltyByPackage(this.vendorId, this.packageTypeId, this.TotalWeightageScore);
        var getPenaltyStructure =this.scoreDataService.getPenaltyStructureByPackageIdvendorId(this.vendorId, this.packageTypeId);
        forkJoin([getPenaltyByPackage,getPenaltyStructure]).subscribe(
            data => {
                if (data[0].length != 0 && data[0][0].length != 0) {
                    this.penalty = data[0][0].Penalty;
                }
                else {
                    this.penalty = 0;
                }
                if(data[1]!=0){
                    this.penaltyStructure=data[1];
                }
                
            }
        );
        let DailyWeeklYFortnightlyContains = this.functionOLADetails.filter(x => x.Frequency == configuration.Daily || x.Frequency == configuration.Weekly || x.Frequency == configuration.Fortnightly).length;
        if (lastDay.getDate() == date.getDate() && DailyWeeklYFortnightlyContains !== 0) {
            let sundayCount = 0;
            for (var i = 1; i <= lastDay.getDate(); i++) {
                var newDate = new Date(lastDay.getFullYear(), lastDay.getMonth(), i)
                if (newDate.getDay() == 0) {
                    sundayCount += 1;
                }
            }
            var functionDetails1 = [];
            var functionIds11 = Array.from(new Set(this.applicabeFunctionOLADetails.map(x => x.FunctionId))).map(x => x);
            var functionIds12 = Array.from(new Set(this.functionOLADetails.filter(x => x.Frequency == configuration.Daily || x.Frequency == configuration.Weekly || x.Frequency == configuration.Fortnightly).map(x => x.FunctionId))).map(x => x);
            var functionIds1 = Array.from(new Set(functionIds11.concat(functionIds12)));
            var OLAIds1 = Array.from(new Set(this.applicabeFunctionOLADetails.map(x => x.OLAId))).map(x => x);
            var OLAIds12 = Array.from(new Set(this.functionOLADetails.filter(x => x.Frequency == configuration.Daily || x.Frequency == configuration.Weekly || x.Frequency == configuration.Fortnightly).map(x => x.OLAId))).map(x => x);
            var appFunDetails = this.functionOLADetails.filter(u => OLAIds1.includes(u.OLAId) || OLAIds12.includes(u.OLAId));
            for (var i = 0; i < functionIds1.length; i++) {
                var fun =
                {
                    FunctionId: this.functionDetails.find(x => x.FunctionId == functionIds1[i]).FunctionId,
                    FunctionNm: this.functionDetails.find(x => x.FunctionId == functionIds1[i]).FunctionNm,
                    Weightage: this.functionDetails.find(x => x.FunctionId == functionIds1[i]).Weightage,
                    OLACnt: appFunDetails.filter(x => x.FunctionId == functionIds1[i]).length,
                    IsOptional: this.functionDetails.find(x => x.FunctionId == functionIds1[i]).IsOptional
                };
                functionDetails1.push(fun);
            }
            var transactionStartDate = this.datepipe.transform(firstDay, 'yyyy-MM-dd');
            var exceptLastDate = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() - 1)
            var transactionEndDate = this.datepipe.transform(exceptLastDate, 'yyyy-MM-dd');
            this.scoreDataService.getMonthlyScoreCardEdit(this.transactionId, this.vendorId, this.packageTypeId, this.facilityId, transactionStartDate, transactionEndDate).subscribe(
                data => {
                    let transactions = data;
                    if (transactions.length !== 0) {
                        const result = transactions.map(val => {
                            return Object.assign({}, val, this.functionOLADetails.filter(v => v.FunctionId === val.FunctionId && v.OLAId === val.OLAId)[0]
                                , this.ratingDetails.filter(v => v.RatingId === val.RatingId)[0]);
                        });
                        var finalResult1 = [];
                        if (this.transactionId == -1 || this.transactionId == null) {
                            for (var i = 0; i < functionIds1.length; i++) {
                                var FunctionNm = functionDetails1.find(x => x.FunctionId == functionIds1[i]).FunctionNm;
                                var Weightage = functionDetails1.find(x => x.FunctionId == functionIds1[i]).Weightage;
                                var OLACnt = functionDetails1.find(x => x.FunctionId == functionIds1[i]).OLACnt;
                                var ScoringWeightage = Weightage / OLACnt;
                                var Score = 0;
                                Score = Score + (result.filter(x => x.Frequency == configuration.Daily && x.FunctionId == functionIds1[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / lastDay.getDate()) * ScoringWeightage / 100;
                                Score = Score + (result.filter(x => x.Frequency == configuration.Weekly && x.FunctionId == functionIds1[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / sundayCount) * ScoringWeightage / 100;
                                Score = Score + (result.filter(x => x.Frequency == configuration.Fortnightly && x.FunctionId == functionIds1[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / 2) * ScoringWeightage / 100;
                                Score = Score + (result.filter(x => x.Frequency !== configuration.Daily && x.Frequency !== configuration.Weekly && x.Frequency !== configuration.Fortnightly && x.FunctionId == functionIds[i])
                                    .reduce((sum, Score) => sum + Score.RatingScore, 0)) * ScoringWeightage / 100;
                                Score = Score + (this.OLADetails.filter(x => x.Frequency == configuration.Daily && x.FunctionId == functionIds1[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / lastDay.getDate()) * ScoringWeightage / 100;
                                Score = Score + (this.OLADetails.filter(x => x.Frequency == configuration.Weekly && x.FunctionId == functionIds1[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / sundayCount) * ScoringWeightage / 100;
                                Score = Score + (this.OLADetails.filter(x => x.Frequency == configuration.Fortnightly && x.FunctionId == functionIds1[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / 2) * ScoringWeightage / 100;
                                Score = Score + (this.OLADetails.filter(x => x.Frequency !== configuration.Daily && x.Frequency !== configuration.Weekly && x.Frequency !== configuration.Fortnightly && x.FunctionId == functionIds[i])
                                    .reduce((sum, Score) => sum + Score.RatingScore, 0)) * ScoringWeightage / 100;
                                finalResult1.push({ FunctionId: functionIds1[i], FunctionNm: FunctionNm, Weightage: Weightage, Score: Score });
                            }
                        }
                        else {
                            for (var i = 0; i < functionIds1.length; i++) {
                                var FunctionNm = functionDetails1.find(x => x.FunctionId == functionIds1[i]).FunctionNm;
                                var Weightage = functionDetails1.find(x => x.FunctionId == functionIds1[i]).Weightage;
                                var OLACnt = functionDetails1.find(x => x.FunctionId == functionIds1[i]).OLACnt;
                                var ScoringWeightage = Weightage / OLACnt;
                                var Score = 0;
                                Score = Score + (result.filter(x => x.Frequency == configuration.Daily && x.FunctionId == functionIds1[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / lastDay.getDate()) * ScoringWeightage / 100;
                                Score = Score + (result.filter(x => x.Frequency == configuration.Weekly && x.FunctionId == functionIds1[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / sundayCount) * ScoringWeightage / 100;
                                Score = Score + (result.filter(x => x.Frequency == configuration.Fortnightly && x.FunctionId == functionIds1[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / 2) * ScoringWeightage / 100;
                                Score = Score + (result.filter(x => x.Frequency !== configuration.Daily && x.Frequency !== configuration.Weekly && x.Frequency !== configuration.Fortnightly && x.FunctionId == functionIds[i])
                                    .reduce((sum, Score) => sum + Score.RatingScore, 0)) * ScoringWeightage / 100;
                                Score = Score + (this.OLADetails.filter(x => x.Frequency == configuration.Daily && x.FunctionId == functionIds1[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / lastDay.getDate()) * ScoringWeightage / 100;
                                Score = Score + (this.OLADetails.filter(x => x.Frequency == configuration.Weekly && x.FunctionId == functionIds1[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / sundayCount) * ScoringWeightage / 100;
                                Score = Score + (this.OLADetails.filter(x => x.Frequency == configuration.Fortnightly && x.FunctionId == functionIds1[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / 2) * ScoringWeightage / 100;
                                Score = Score + (this.OLADetails.filter(x => x.Frequency !== configuration.Daily && x.Frequency !== configuration.Weekly && x.Frequency !== configuration.Fortnightly && x.FunctionId == functionIds[i])
                                    .reduce((sum, Score) => sum + Score.RatingScore, 0)) * ScoringWeightage / 100;
                                finalResult1.push({ FunctionId: functionIds1[i], FunctionNm: FunctionNm, Weightage: Weightage, Score: Score });
                            }
                        }
                        this.TotalWeightageScore = null;
                        this.TotalWeightageScore = finalResult1.reduce((sum, Score) => sum + Score.Score, 0);
                        this.scoreCard = null;
                        this.scoreCard = finalResult1;
                        this.penalty = 0;
                        var getPenaltyByPackage =this.scoreDataService.getPenaltyByPackage(this.vendorId, this.packageTypeId, this.TotalWeightageScore);
                        var getPenaltyStructure =this.scoreDataService.getPenaltyStructureByPackageIdvendorId(this.vendorId, this.packageTypeId);
                        forkJoin([getPenaltyByPackage,getPenaltyStructure]).subscribe(
                            data => {
                                if (data[0].length != 0 && data[0][0].length != 0) {
                                    this.penalty = data[0][0].Penalty;
                                }
                                else {
                                    this.penalty = 0;
                                }
                                if(data[1]!=0){
                                    this.penaltyStructure=data[1];
                                }
                                
                            }
                        );
                    }
                    else{
                        var finalResult1 = [];
                        for (var i = 0; i < functionIds1.length; i++) {
                            var FunctionNm = functionDetails1.find(x => x.FunctionId == functionIds1[i]).FunctionNm;
                            var Weightage = functionDetails1.find(x => x.FunctionId == functionIds1[i]).Weightage;
                            var OLACnt = functionDetails1.find(x => x.FunctionId == functionIds1[i]).OLACnt;
                            var ScoringWeightage = Weightage / OLACnt;
                            var Score = 0;
                            Score = Score + (this.OLADetails.filter(x => x.Frequency == configuration.Daily && x.FunctionId == functionIds1[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / lastDay.getDate()) * ScoringWeightage / 100;
                            Score = Score + (this.OLADetails.filter(x => x.Frequency == configuration.Weekly && x.FunctionId == functionIds1[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / sundayCount) * ScoringWeightage / 100;
                            Score = Score + (this.OLADetails.filter(x => x.Frequency == configuration.Fortnightly && x.FunctionId == functionIds1[i]).reduce((sum, Score) => sum + Score.RatingScore, 0) / 2) * ScoringWeightage / 100;
                            Score = Score + (this.OLADetails.filter(x => x.Frequency !== configuration.Daily && x.Frequency !== configuration.Weekly && x.Frequency !== configuration.Fortnightly && x.FunctionId == functionIds[i])
                                .reduce((sum, Score) => sum + Score.RatingScore, 0)) * ScoringWeightage / 100;
                            finalResult1.push({ FunctionId: functionIds1[i], FunctionNm: FunctionNm, Weightage: Weightage, Score: Score });
                        }
                        this.TotalWeightageScore = null;
                        this.TotalWeightageScore = finalResult1.reduce((sum, Score) => sum + Score.Score, 0);
                        this.scoreCard = null;
                        this.scoreCard = finalResult1;
                        this.penalty = 0;
                        var getPenaltyByPackage =this.scoreDataService.getPenaltyByPackage(this.vendorId, this.packageTypeId, this.TotalWeightageScore);
                        var getPenaltyStructure =this.scoreDataService.getPenaltyStructureByPackageIdvendorId(this.vendorId, this.packageTypeId);
                        forkJoin([getPenaltyByPackage,getPenaltyStructure]).subscribe(
                            data => {
                                if (data[0].length != 0 && data[0][0].length != 0) {
                                    this.penalty = data[0][0].Penalty;
                                }
                                else {
                                    this.penalty = 0;
                                }
                                if(data[1]!=0){
                                    this.penaltyStructure=data[1];
                                }
                                
                            }
                        );
                    }
                    this.loadingSymbolForSubmitModal = false;
                }
            );
        }
        this.loadingSymbolForSubmitModal = false;
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
        var date = this.datepipe.transform(this.periodDateId, 'yyyy-MM-dd');
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
                        this.EditWCFacilityTowerWise.push(WCFacilityTowerWise[i])
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
                console.log('view');
                console.log(HighArea);
                console.log(LowArea);
                console.log(Area);
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
                debugger;
                this.WCFacilityWise = data;
                this.WCFacilityWiseKeys = Object.keys(this.WCFacilityWise[0]);
                this.list_items = data;
                this.keys = Object.keys(this.list_items[0]); // Get the column names                 
            }
        );
    }

    //FInal Submission of a Score Package
    submitScore() {
        this.loadingSymbolForSubmitModal = true;
        if (this.comments == "" || this.comments == null) {
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            modalRef.componentInstance.title = configuration.Mandatory;
            modalRef.componentInstance.message = configuration.SubmitValidation;
            this.loadingSymbolForSubmitModal = false;
        }
        else {
            var transactionDate = this.datepipe.transform(this.periodDateId, 'yyyy-MM-dd');
            var date: Date = new Date(transactionDate);
            var year: number = date.getFullYear();
            var month: number = date.getMonth();
            var lastDay: Date = new Date(year, month + 1, 0);
            let DailyWeeklYFortnightlyContains = this.functionOLADetails.filter(x => x.Frequency == configuration.Daily || x.Frequency == configuration.Weekly || x.Frequency == configuration.Fortnightly).length;
            if (lastDay.getDate() == date.getDate() && this.statusName != configuration.Draft && DailyWeeklYFortnightlyContains !== 0) {
                var message = configuration.ConfirmSubmissionMontly;
                this.confirm(configuration.Confirm, message)
                    .then((confirmed) => {
                        console.log(confirmed);
                        if (confirmed) {
                            debugger;
                            if (this.transactionId !== -1) {
                                this.scoreDataService.getTransactionStatus(this.transactionId).subscribe(
                                    data => {
                                        let statusId = this.statusDetails.find(x => x.statusName == this.statusName).statusId;
                                        if (data != statusId) {
                                            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                            modalRef.componentInstance.title = configuration.Alert;
                                            modalRef.componentInstance.message = configuration.TransactionSubmitRevalidate;
                                            this.loadingSymbolForSubmitModal = false;
                                        }
                                        else {
                                            this.SaveRejectedMonthlyTransaction();
                                        }
                                    }
                                );
                            }
                            else {
                                var transactionDate = this.datepipe.transform(this.periodDateId, 'yyyy-MM-dd');
                                this.scoreDataService.getTransaction(this.packageTypeId, this.vendorId, this.facilityId, transactionDate).subscribe(
                                    data => {
                                        if (data.length == 0) {
                                            this.SaveRejectedMonthlyTransaction();
                                        }
                                        else {
                                            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                            modalRef.componentInstance.title = configuration.Alert;
                                            modalRef.componentInstance.message = "ScoreCard " + data[0].TransactionRefNo + " is already created for this selection.";
                                            this.loadingSymbolForSubmitModal = false;
                                        }
                                    }
                                )
                            }
                        }
                        else {
                            this.loadingSymbolForSubmitModal = false;
                        }
                    })
                    .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));

            }
            else {
                this.confirm(configuration.Confirm, configuration.ConfirmSubmission)
                    .then((confirmed) => {
                        console.log(confirmed);
                        if (confirmed) {
                            if (this.transactionId !== -1) {
                                this.scoreDataService.getTransactionStatus(this.transactionId).subscribe(
                                    data => {
                                        debugger;
                                        let statusId = this.statusDetails.find(x => x.statusName == this.statusName).statusId;
                                        if (data != statusId) {
                                            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                            modalRef.componentInstance.title = configuration.Alert;
                                            modalRef.componentInstance.message = configuration.TransactionSubmitRevalidate;
                                            this.loadingSymbolForSubmitModal = false;
                                        }
                                        else {
                                            if (this.statusName != configuration.Draft) {
                                                this.SaveRejectedTransaction();
                                            }
                                            else {
                                                this.SaveUpdateTransaction();
                                            }
                                        }
                                    }
                                );
                            }
                            else {
                                var transactionDate = this.datepipe.transform(this.periodDateId, 'yyyy-MM-dd');
                                this.scoreDataService.getTransaction(this.packageTypeId, this.vendorId, this.facilityId, transactionDate).subscribe(
                                    data => {
                                        if (data.length == 0) {
                                            if (this.statusName != configuration.Draft) {
                                                this.SaveRejectedTransaction();
                                            }
                                            else {
                                                this.SaveUpdateTransaction();
                                            }
                                        }
                                        else {
                                            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                            modalRef.componentInstance.title = configuration.Alert;
                                            modalRef.componentInstance.message = "ScoreCard " + data[0].TransactionRefNo + " is already created for this selection.";
                                            this.loadingSymbolForSubmitModal = false;
                                        }
                                    }
                                )
                            }
                        }
                        else {
                            this.loadingSymbolForSubmitModal = false;
                        }
                    })
                    .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));

            }
        }
    }

    public SaveUpdateTransaction() {
        let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        if (this.transactionId !== -1) {
            //#region new Score
            var TransactionDetails = [];
            var newTransaction = this.OLADetails.filter(x => x.TransactionDetailsId === undefined || x.TransactionDetailsId === "");
            var oldTransaction = this.OLADetails.filter(x => x.TransactionDetailsId !== undefined && x.TransactionDetailsId !== "");
            for (var i = 0; i < newTransaction.length; i++) {
                var data1 =
                {
                    TransactionId: this.transactionId,
                    FunctionId: newTransaction[i].FunctionId,
                    OLAId: newTransaction[i].OLAId,
                    RatingId: newTransaction[i].RatingId,
                    ScoreWeightage: newTransaction[i].ScoreWeightage,
                    Score: newTransaction[i].Score,
                    CreatedBy: this.loggedEnterpriseId, CreateDttm: currentDate, UpdatedBy: this.loggedEnterpriseId, UpdatedDttm: currentDate
                };
                TransactionDetails.push(data1);
            }
            var TransactionDetails1 = [];
            for (var i = 0; i < oldTransaction.length; i++) {
                debugger;
                var data2 =
                {
                    TransactionId: this.transactionId,
                    TransactionDetailsId: oldTransaction[i].TransactionDetailsId,
                    RatingId: oldTransaction[i].RatingId,
                    ScoreWeightage: oldTransaction[i].ScoreWeightage,
                    Score: oldTransaction[i].Score,
                    UpdatedBy: this.loggedEnterpriseId, UpdatedDttm: currentDate
                };
                TransactionDetails1.push(data2);
            }
            if (oldTransaction.length != 0 && newTransaction.length != 0) {
                let saveTransactionDetails = this.scoreDataService.saveTransactionDetails(this.transactionId, TransactionDetails);
                let updateTransactionDetails = this.scoreDataService.updateTransactionDetails(this.transactionId, TransactionDetails1);
                forkJoin([saveTransactionDetails, updateTransactionDetails]).subscribe(results => {
                    const d = results[0];
                    const d1 = results[1];
                    this.saveRemarks();
                });
            }
            else if (oldTransaction.length != 0) {
                this.scoreDataService.updateTransactionDetails(this.transactionId, TransactionDetails1).subscribe(
                    data => {
                        const d = data;
                        this.saveRemarks();
                    }
                );
            }
            else if (newTransaction.length != 0) {
                this.scoreDataService.saveTransactionDetails(this.transactionId, TransactionDetails).subscribe(
                    data => {
                        const d = data;
                        this.saveRemarks();
                    }
                );
            }
            //#endregion
        }
        else {
            //#region new Score
            var packageName = this.packageTypeDetails.find(x => x.packageId == this.packageTypeId).packageName;
            var facility = this.facilityDetails.find(x => x.facilityId == this.facilityId).facilityName;
            var vendor = this.vendorDetails.find(x => x.vendorId == this.vendorId).vendorName;
            var date = this.periodDateId.toString();
            var transactionDate = this.datepipe.transform(date, 'yyyy-MM-dd');
            let transdate = this.datepipe.transform(date, 'dd-MM-yyyy');
            var transactionRefNo = packageName.replace(/\s/g, "") + '_' + facility.replace(/\s/g, "") + '_' + vendor.replace(/\s/g, "") + '_' + transdate;
            var statusId = this.statusDetails.find(x => x.statusName == configuration.Draft).statusId;
            this.transactionRefNo = transactionRefNo;
            var TransactionDetails = [];
            for (var i = 0; i < this.OLADetails.length; i++) {
                var data =
                {
                    Frequency:this.OLADetails[i].Frequency,
                    FunctionId: this.OLADetails[i].FunctionId,
                    OLAId: this.OLADetails[i].OLAId,
                    RatingId: this.OLADetails[i].RatingId,
                    ScoreWeightage: this.OLADetails[i].ScoreWeightage,
                    Score: this.OLADetails[i].Score,
                    CreatedBy: this.loggedEnterpriseId, CreateDttm: currentDate, UpdatedBy: this.loggedEnterpriseId, UpdatedDttm: currentDate
                };
                    TransactionDetails.push(data);
            }
            this.scoreDataService.saveTransaction(transactionRefNo, this.packageTypeId, this.vendorId, this.facilityId, statusId, transactionDate, TransactionDetails, this.loggedEnterpriseId).subscribe(
                data => {
                    const d = data;
                    if (data == -1) {
                        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                        modalRef.componentInstance.title = configuration.Alert;
                        modalRef.componentInstance.message = "ScoreCard " + this.transactionRefNo + " is already created for this selection.";
                        this.loadingSymbolForSubmitModal = false;
                    }
                    else {
                        var date: Date = new Date(transactionDate);
                        var year: number = date.getFullYear();
                        var month: number = date.getMonth();
                        var lastDay: Date = new Date(year, month + 1, 0);
                        if(lastDay.getDate()==date.getDate()){
                            var statusId = this.statusDetails.find(x => x.statusName == configuration.NewSubmission).statusId;
                            this.scoreDataService.updateTransactionStatusBulk(this.packageTypeId, this.vendorId, this.facilityId, transactionDate, statusId).subscribe(
                                data=>{
                                }
                            )
                        }
                        this.transactionId = data;
                        this.saveRemarks();
                    }
                }
            );
            //#endregion
        }
    }
    public SaveRejectedTransaction() {
        let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        this.scoreDataService.saveTransactionAuditLog(this.transactionId).subscribe(
            data => {
                var savedData = data;
                var transactionCode = this.transactionRefNo;
                let indexofVersion = this.transactionRefNo.indexOf("-V");
                if (indexofVersion != -1) {
                    var versionNo1 = this.transactionRefNo.slice(indexofVersion + 2, this.transactionRefNo.length);
                    let version = +versionNo1 + 1;
                    transactionCode = this.transactionRefNo.slice(0, indexofVersion + 2) + version;
                }
                else {
                    transactionCode = transactionCode + "-V1";
                }
                this.scoreDataService.updateTransactionCode(this.transactionId, transactionCode, this.loggedEnterpriseId, currentDate).subscribe(
                    data => {
                        var d = data;
                        this.createEditScoreHeader = "Edit Scores: " + transactionCode;
                        this.getFilteredData();
                    }
                );

                this.transactionRefNo = transactionCode;
                var TransactionDetails = [];
                var newTransaction = this.OLADetails.filter(x => x.TransactionDetailsId === undefined || x.TransactionDetailsId === "");
                var oldTransaction = this.OLADetails.filter(x => x.TransactionDetailsId !== undefined && x.TransactionDetailsId !== "");
                for (var i = 0; i < newTransaction.length; i++) {
                    var data1 =
                    {
                        TransactionId: this.transactionId,
                        FunctionId: newTransaction[i].FunctionId,
                        OLAId: newTransaction[i].OLAId,
                        RatingId: newTransaction[i].RatingId,
                        ScoreWeightage: newTransaction[i].ScoreWeightage,
                        Score: newTransaction[i].Score,
                        CreatedBy: this.loggedEnterpriseId, CreateDttm: currentDate, UpdatedBy: this.loggedEnterpriseId, UpdatedDttm: currentDate
                    };
                    TransactionDetails.push(data1);
                }
                var TransactionDetails1 = [];
                for (var i = 0; i < oldTransaction.length; i++) {
                    var data2 =
                    {
                        TransactionId: this.transactionId,
                        TransactionDetailsId: oldTransaction[i].TransactionDetailsId,
                        RatingId: oldTransaction[i].RatingId,
                        ScoreWeightage: oldTransaction[i].ScoreWeightage,
                        Score: oldTransaction[i].Score,
                        UpdatedBy: this.loggedEnterpriseId, UpdatedDttm: currentDate
                    };
                    TransactionDetails1.push(data2);
                }
                if (oldTransaction.length != 0 && newTransaction.length != 0) {
                    let saveTransactionDetails = this.scoreDataService.saveTransactionDetails(this.transactionId, TransactionDetails);
                    let updateTransactionDetails = this.scoreDataService.updateTransactionDetails(this.transactionId, TransactionDetails1);
                    forkJoin([saveTransactionDetails, updateTransactionDetails]).subscribe(results => {
                        const d = results[0];
                        const d1 = results[1];
                        this.saveRemarks();
                    });
                }
                else if (oldTransaction.length != 0) {
                    this.scoreDataService.updateTransactionDetails(this.transactionId, TransactionDetails1).subscribe(
                        data => {
                            const d = data;
                            this.saveRemarks();
                        }
                    );
                }
                else if (newTransaction.length != 0) {
                    this.scoreDataService.saveTransactionDetails(this.transactionId, TransactionDetails).subscribe(
                        data => {
                            const d = data;
                            this.saveRemarks();
                        }
                    );
                }
            }
        );
    }
    public saveRemarks() {
        var transactionDate = this.datepipe.transform(this.periodDateId, 'yyyy-MM-dd');
        var date: Date = new Date(transactionDate);
        var year: number = date.getFullYear();  
        var month: number = date.getMonth();
        var lastDay: Date = new Date(year, month + 1, 0);

        let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        var statusId = this.statusDetails.find(x => x.statusName == configuration.NewSubmission).statusId;
        let saveRemarks = this.scoreDataService.saveRemarks(this.transactionId, this.comments, this.loggedEnterpriseId, currentDate, this.remarksBy);
        let updateTransaction = this.scoreDataService.updateTransaction(this.transactionId, statusId, this.loggedEnterpriseId, currentDate);
        let getCategoryNameByPackageId = this.dataService.getCategoryNameByPackageId(this.packageTypeId);
        forkJoin([saveRemarks, updateTransaction, getCategoryNameByPackageId]).subscribe(results => {
            //const d = results[0];
            //this.loadingSymbolForSubmitModal = false;
            if (lastDay.getDate() == date.getDate()) {
                var date1 = this.periodDateId.toString();
                let transactionDate1 = this.datepipe.transform(date1, 'dd-MM-yyyy');
                let packageName = this.packageName;
                let vendorName = this.vendorName;
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

                let GetMailerDetails = this.dataService.GetMailerDetails(this.facilityId, this.packageTypeId, RoleIds);
                let GetGroupMailerDetails = this.dataService.GetGroupMailerDetails(this.facilityId, GroupRoleName);
                forkJoin([GetMailerDetails, GetGroupMailerDetails]).subscribe(results => {
                    let data = results[0];
                    let data1 = results[1];
                    let To = "";
                    let Cc = "";
                    if (categoryName == configuration.CategoryME) {
                        for (var i = 0; i < data1.length; i++) {
                            if(data1[i]["EnterpriseId"]!=""){
                            Cc = Cc + data1[i]["EnterpriseId"] + ";";
                            }
                        }
                        for (var i = 0; i < data.length; i++) {
                            if (data[i]["RoleNm"] == configuration.RoleZL)
                                To = To + data[i]["EnterpriseId"] + ";";
                            if (data[i]["RoleNm"] == configuration.RoleCE
                                || data[i]["RoleNm"] == configuration.RoleMELead || data[i]["RoleNm"] == configuration.RoleSRMAdmin)
                                Cc = Cc + data[i]["EnterpriseId"] + ";";
                        }
                    }
                    else if (categoryName == configuration.CategorySoftServices) {
                        for (var i = 0; i < data1.length; i++) {
                            if(data1[i]["EnterpriseId"]!=""){
                            Cc = Cc + data1[i]["EnterpriseId"] + ";";
                            }
                        }
                        for (var i = 0; i < data.length; i++) {
                            if (data[i]["RoleNm"] == configuration.RoleSDL)
                                To = To + data[i]["EnterpriseId"] + ";";
                            if (data[i]["RoleNm"] == configuration.RoleWM
                                || data[i]["RoleNm"] == configuration.RoleCityLead || data[i]["RoleNm"] == configuration.RoleSRMAdmin)
                                Cc = Cc + data[i]["EnterpriseId"] + ";";
                        }
                    }
                    To = Array.from(new Set(To.split(';'))).join(";").toString();
                    Cc = Array.from(new Set(Cc.split(';'))).join(";").toString();
                    var subject = transactionRefNo + " - For Approval";
                    let body = "<table>"
                        + "<tr>Dear Users,</tr><br><br>"
                        + "<tr>Please find below the " + transactionDate1 + " scorecard for " + packageName + " for " + vendorName + ".</tr>"
                        + "<tr>For your review and action, please use below link:</tr>"
                        + "<br>"
                        + "<tr><a href=" + environment.ZLSDLURL + transactionId + ">Approve/Reject</a><tr>"
                        + "<br><br>"
                        + "<tr>Regards,</tr><br>"
                        + "<tr>Service Relationship Management Team.</tr>"
                        + "</table>";
                    this.alertMailService.SendEmail(body, subject, To, Cc, "ActionRequiredbyZL").subscribe(
                        data => {
                          console.log(data);
                        });
                });
            }

            this.loadingSymbolForSubmitModal = false;
            this.getFilteredData();
            this.close()
                .then((confirmed) => {
                    this.dismissCreateScoreModal();
                })
                .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));

        });
    }

    public SaveRejectedMonthlyTransaction() {

        let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        this.scoreDataService.saveTransactionAuditLog(this.transactionId).subscribe(
            data => {
                var savedData = data;
                var transactionCode = this.transactionRefNo;
                let indexofVersion = this.transactionRefNo.indexOf("-V");
                if (indexofVersion != -1) {
                    var versionNo1 = this.transactionRefNo.slice(indexofVersion + 2, this.transactionRefNo.length);
                    let version = +versionNo1 + 1;
                    transactionCode = this.transactionRefNo.slice(0, indexofVersion + 2) + version;
                }
                else {
                    transactionCode = transactionCode + "-V1";
                }
                this.scoreDataService.updateTransactionCode(this.transactionId, transactionCode, this.loggedEnterpriseId, currentDate).subscribe(
                    data => {
                        var d = data;
                        this.createEditScoreHeader = "Edit Scores: " + transactionCode;
                        this.getFilteredData();
                    }
                );

                this.transactionRefNo = transactionCode;
                var TransactionDetails = [];
                var newTransaction = this.OLADetails.filter(x => x.TransactionDetailsId === undefined || x.TransactionDetailsId === "");
                var oldTransaction = this.OLADetails.filter(x => x.TransactionDetailsId !== undefined && x.TransactionDetailsId !== "");
                for (var i = 0; i < newTransaction.length; i++) {
                    var data1 =
                    {
                        TransactionId: this.transactionId,
                        FunctionId: newTransaction[i].FunctionId,
                        OLAId: newTransaction[i].OLAId,
                        RatingId: newTransaction[i].RatingId,
                        ScoreWeightage: newTransaction[i].ScoreWeightage,
                        Score: newTransaction[i].Score,
                        CreatedBy: this.loggedEnterpriseId, CreateDttm: currentDate, UpdatedBy: this.loggedEnterpriseId, UpdatedDttm: currentDate
                    };
                    TransactionDetails.push(data1);
                }
                var TransactionDetails1 = [];
                for (var i = 0; i < oldTransaction.length; i++) {
                    var data2 =
                    {
                        TransactionId: this.transactionId,
                        TransactionDetailsId: oldTransaction[i].TransactionDetailsId,
                        RatingId: oldTransaction[i].RatingId,
                        ScoreWeightage: oldTransaction[i].ScoreWeightage,
                        Score: oldTransaction[i].Score,
                        UpdatedBy: this.loggedEnterpriseId, UpdatedDttm: currentDate
                    };
                    TransactionDetails1.push(data2);
                }
                if (oldTransaction.length != 0 && newTransaction.length != 0) {
                    let saveTransactionDetails = this.scoreDataService.saveTransactionDetails(this.transactionId, TransactionDetails);
                    let updateTransactionDetails = this.scoreDataService.updateTransactionDetails(this.transactionId, TransactionDetails1);
                    forkJoin([saveTransactionDetails, updateTransactionDetails]).subscribe(results => {
                        const d = results[0];
                        const d1 = results[1];
                        this.saveRemarksMonthly();
                    });
                }
                else if (oldTransaction.length != 0) {
                    this.scoreDataService.updateTransactionDetails(this.transactionId, TransactionDetails1).subscribe(
                        data => {
                            const d = data;
                            this.saveRemarksMonthly();
                        }
                    );
                }
                else if (newTransaction.length != 0) {
                    this.scoreDataService.saveTransactionDetails(this.transactionId, TransactionDetails).subscribe(
                        data => {
                            const d = data;
                            this.saveRemarksMonthly();
                        }
                    );
                }
            }
        );
    }
    public saveRemarksMonthly() {
        let currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
        var statusId = this.statusDetails.find(x => x.statusName == configuration.NewSubmission).statusId;
        let saveRemarks = this.scoreDataService.saveRemarks(this.transactionId, this.comments, this.loggedEnterpriseId, currentDate, this.remarksBy);
        let periodDate = this.datepipe.transform(this.periodDateId, 'yyyy-MM-dd');
        let updateTransaction = this.scoreDataService.updateTransactionStatusBulk(this.packageTypeId, this.vendorId, this.facilityId, periodDate, statusId);
        let getCategoryNameByPackageId = this.dataService.getCategoryNameByPackageId(this.packageTypeId);
        forkJoin([saveRemarks, updateTransaction, getCategoryNameByPackageId]).subscribe(results => {
            //const d = results[0];
            //this.loadingSymbolForSubmitModal = false;
            var date1 = this.periodDateId.toString();
            let transactionDate1 = this.datepipe.transform(date1, 'dd-MM-yyyy');
            let packageName = this.packageName;
            let vendorName = this.vendorName;
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

            let GetMailerDetails = this.dataService.GetMailerDetails(this.facilityId, this.packageTypeId, RoleIds);
            let GetGroupMailerDetails = this.dataService.GetGroupMailerDetails(this.facilityId, GroupRoleName);
            forkJoin([GetMailerDetails, GetGroupMailerDetails]).subscribe(results => {
                let data = results[0];
                let data1 = results[1];
                let To = "";
                let Cc = "";
                if (categoryName == configuration.CategoryME) {
                    for (var i = 0; i < data1.length; i++) {
                        Cc = Cc + data1[i]["EnterpriseId"] + ";";
                    }
                    for (var i = 0; i < data.length; i++) {
                        if (data[i]["RoleNm"] == configuration.RoleZL)
                            To = To + data[i]["EnterpriseId"] + ";";
                        if (data[i]["RoleNm"] == configuration.RoleCE
                            || data[i]["RoleNm"] == configuration.RoleMELead || data[i]["RoleNm"] == configuration.RoleSRMAdmin)
                            Cc = Cc + data[i]["EnterpriseId"] + ";";
                    }
                }
                else if (categoryName == configuration.CategorySoftServices) {
                    for (var i = 0; i < data1.length; i++) {
                        Cc = Cc + data1[i]["EnterpriseId"] + ";";
                    }
                    for (var i = 0; i < data.length; i++) {
                        if (data[i]["RoleNm"] == configuration.RoleSDL)
                            To = To + data[i]["EnterpriseId"] + ";";
                        if (data[i]["RoleNm"] == configuration.RoleWM
                            || data[i]["RoleNm"] == configuration.RoleCityLead || data[i]["RoleNm"] == configuration.RoleSRMAdmin)
                            Cc = Cc + data[i]["EnterpriseId"] + ";";
                    }
                }
                To = Array.from(new Set(To.split(';'))).join(";").toString();
                Cc = Array.from(new Set(Cc.split(';'))).join(";").toString();
                var subject = transactionRefNo + " - For Approval";
                let body = "<table>"
                    + "<tr>Dear Users,</tr><br><br>"
                    + "<tr>Please find below the " + transactionDate1 + " scorecard for " + packageName + " for " + vendorName + ".</tr>"
                    + "<tr>For your review and action, please use below link:</tr>"
                    + "<br>"
                    + "<tr><a href=" + environment.ZLSDLURL + transactionId + ">Approve/Reject</a><tr>"
                    + "<br><br>"
                    + "<tr>Regards,</tr><br>"
                    + "<tr>Service Relationship Management Team.</tr>"
                    + "</table>";
                this.alertMailService.SendEmail(body, subject, To, Cc, "ActionRequiredbyZL").subscribe(
                    data => {
                        console.log(data);
                    });
            });

            this.loadingSymbolForSubmitModal = false;
            this.getFilteredData();
            this.close()
                .then((confirmed) => {
                    this.dismissCreateScoreModal();
                })
                .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));

            //             }
            //         );
            //     }
            // );

        });
    }

    public confirm(title: string, message: string): Promise<boolean> {
        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.message = message;
        return modalRef.result;
    }

    public close(): Promise<boolean> {
        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
        modalRef.componentInstance.title = configuration.Success;
        modalRef.componentInstance.message = configuration.TransactionSubmission;
        return modalRef.result;
    }

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


    setPagerSubmit() {
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
        this.getSubmitData();
    }

    //Called this method on paging
    setPageSubmit(page: number) {
        this.pageNumberSubmit = page;
        this.getSubmitData();
    }

    //Called this method on page option changes
    onPagingOptionsChangeSubmit(e: number) {
        this.selectedPageSizeSubmit = +e;
        this.pageSizeSubmit = this.selectedPageSizeSubmit;
        this.pageNumberSubmit = 1;
        this.getSubmitData();
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


    viewScore(viewScoreModal, e) {
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
        //this.getViewWCDetails(firstDay, lastDay);
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
                    debugger;
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
                    for (var i = 0; i < functionIds.length; i++) {
                        var fun =
                        {
                            FunctionId: this.viewFunctionDetails.find(x => x.FunctionId == functionIds[i]).FunctionId,
                            FunctionNm: this.viewFunctionDetails.find(x => x.FunctionId == functionIds[i]).FunctionNm,
                            //Weightage: optionalOLAScoredNA == -1 ? this.viewFunctionDetails.find(x => x.FunctionId == functionIds[i]).Weightage : (NAfunctionIds.findIndex(x => x == functionIds[i]) == -1 ? this.viewFunctionDetails.find(x => x.FunctionId == functionIds[i]).Weightage + avgWeightage : 0),
                            Weightage: this.viewFunctionDetails.find(x => x.FunctionId == functionIds[i]).Weightage,
                            OLACnt: applicableFunctionOLADetails.filter(x => x.FunctionId == functionIds[i]).length,
                            IsOptional: this.viewFunctionDetails.find(x => x.FunctionId == functionIds[i]).IsOptional
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
                            if (data[0].length != 0 && data[0][0].length != 0) {
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
                const result = transactions.map(val => {
                    return Object.assign({}, val, functionOla.filter(v => v.FunctionId === val.FunctionId)[0]);
                });
                this.viewTotalWeightageScore = transactions.reduce((sum, Score) => sum + Score.Score, 0);
                this.viewScoreCard = result;
                var getPenaltyByPackage =this.scoreDataService.getPenaltyByPackage(this.viewVendorId, this.viewPackageTypeId, this.viewTotalWeightageScore);
                    var getPenaltyStructure =this.scoreDataService.getPenaltyStructureByPackageIdvendorId(this.viewVendorId, this.viewPackageTypeId);
                    forkJoin([getPenaltyByPackage,getPenaltyStructure]).subscribe(
                        data => {
                            if (data[0].length != 0 && data[0][0].length != 0) {
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
        //this.scoreDataService.getRemarks(this.viewTransactionId).subscribe(
        let remarksBy = configuration.RoleDE + ',' + configuration.RoleCE + ',' + configuration.RoleWM + ',' + configuration.RoleDM;
        console.log(remarksBy);
        this.scoreDataService.getRemarks(this.viewTransactionId, remarksBy).subscribe(
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
    submitTask:any;
    viewlist_items: any;
    viewkeys: any;

    //Get WC Details in Submit Score popup
    // getViewWCDetails(firstDay: Date, lastDay: Date) {
    //     debugger;
    //     let sundayCount: number = 0;
    //     for (var i = 1; i <= lastDay.getDate(); i++) {
    //         var newDate = new Date(lastDay.getFullYear(), lastDay.getMonth(), i)
    //         if (newDate.getDay() == 0) {
    //             sundayCount += 1;
    //         }
    //     }
    //     var date = this.datepipe.transform(this.viewPeriodDate, 'yyyy-MM-dd');
    //     let getTaskIds = this.scoreDataService.getTaskIds(this.viewVendorId, date);
    //     let getTaskMasterByFacility = this.scoreDataService.getTaskMasterByFacility(this.viewFacilityId,lastDay.getMonth(),lastDay.getFullYear());
    //     forkJoin([getTaskIds, getTaskMasterByFacility]).subscribe(results => {
    //         let taskDetails = results[0];
    //         let taskMaster = results[1];
    //         var taskDetailsTaskIds = taskMaster.map(x => x.TaskId);
    //         let taskMasterTaskIds = taskDetails.filter(u =>
    //             taskDetailsTaskIds.includes(u.TaskId)
    //         );
    //         let getWCFacilityTowerWise = this.scoreDataService.getWCFacilityTowerWise(this.viewFacilityId,lastDay.getMonth(),lastDay.getFullYear());
    //         let getWCFacilityTowerTaskWise = this.scoreDataService.getWCFacilityTowerFloorTaskWise(this.viewFacilityId, taskMasterTaskIds.map(x => x.TaskId));
    //         let getUnitPriceWC = this.scoreDataService.getUnitPriceWC(this.viewVendorId);
    //         let getfacilityTastTower=this.scoreDataService.getWCFacilityTowerTaskWise(this.viewFacilityId, taskMasterTaskIds.map(x => x.TaskId));
    //         forkJoin([getWCFacilityTowerWise, getWCFacilityTowerTaskWise, getUnitPriceWC,getfacilityTastTower]).subscribe(results => {
    //             let WCFacilityTowerWise = results[0][0];
    //             debugger;
    //             let WCFacilityTowerTaskWise = results[1];
    //             let WCFacilityTowerTaskWiseTotal=results[3];
    //             let obj=[];
    //             for (let i=0;i<taskMasterTaskIds.length;i++) {
    //                 let count=1;
    //                 if(!obj.includes(taskMasterTaskIds[i].TaskId)){
    //                 for (let j=i+1;j<taskMasterTaskIds.length;j++) { 
    //                     if (taskMasterTaskIds[i].TaskId==taskMasterTaskIds[j].TaskId)
    //                     {
    //                         if(!obj.includes(taskMasterTaskIds[i].TaskId))
    //                         {
    //                         obj.push(taskMasterTaskIds[i].TaskId)
    //                         }
    //                         count++;
    //                     }
    //                 }
    //                 if(count>1){
    //                 for(let k=0;k<WCFacilityTowerTaskWise.length;k++){
    //                     if(WCFacilityTowerTaskWise[k].TaskId==taskMasterTaskIds[i].TaskId)
    //                     {
    //                         WCFacilityTowerTaskWise[k].Area= WCFacilityTowerTaskWise[k].Area*count;
                            
    //                     }
    //                 }
    //                 }
    //             }
    //             }
    //             this.submitTask=[];
    //             for(let k=0;k<WCFacilityTowerTaskWise.length;k++){
    //                 var data={
    //                     TowerId: WCFacilityTowerTaskWise[k].TowerId,
    //                     TowerNm: WCFacilityTowerTaskWise[k].TOWERNm,
    //                     FloorId:WCFacilityTowerTaskWise[k].FloorId, 
    //                     FloorNm:WCFacilityTowerTaskWise[k].FloorNm,
    //                     HighVaccuming: WCFacilityTowerTaskWise[k].WorkType=='Vaccuming' && WCFacilityTowerTaskWise[k].TrafficType=='High' ? WCFacilityTowerTaskWise[k].Area:null,
    //                     LowVaccuming: WCFacilityTowerTaskWise[k].WorkType=='Vaccuming' && WCFacilityTowerTaskWise[k].TrafficType=='Low' ? WCFacilityTowerTaskWise[k].Area:null,
    //                     HighEncapulisation: WCFacilityTowerTaskWise[k].WorkType=='Encapulisation' && WCFacilityTowerTaskWise[k].TrafficType=='High' ? WCFacilityTowerTaskWise[k].Area:null,
    //                     LowEncapulisation: WCFacilityTowerTaskWise[k].WorkType=='Encapulisation' && WCFacilityTowerTaskWise[k].TrafficType=='Low' ? WCFacilityTowerTaskWise[k].Area:null,
    //                     HighHotWaterExtraction: WCFacilityTowerTaskWise[k].WorkType=='Hot Water Extraction' && WCFacilityTowerTaskWise[k].TrafficType=='High' ? WCFacilityTowerTaskWise[k].Area:null,
    //                     LowHotWaterExtraction: WCFacilityTowerTaskWise[k].WorkType=='Hot Water Extraction' && WCFacilityTowerTaskWise[k].TrafficType=='Low' ? WCFacilityTowerTaskWise[k].Area:null,
                    
    //             }
    //                 this.submitTask.push(data);
    //             }
    //            let towerdetails=[];
    //            var obj12={
    //                TowerId:0,
    //                FloorId:0
    //            }
    //            towerdetails.push(obj12);
    //             for(let h=0;h<this.submitTask.length;h++){
    //                 for(let m=h+1;m<this.submitTask.length;m++){
    //                    if(towerdetails.filter(x=>x.TowerId!=this.submitTask[h].TowerId && x.FloorId!=this.submitTask[h].FloorId).length=0){
    //                     if(this.submitTask[h].TowerId==this.submitTask[m].TowerId && this.submitTask[h].FloorId==this.submitTask[m].FloorId){
    //                         this.submitTask[h].HighVaccuming+=this.submitTask[m].HighVaccuming;
    //                         this.submitTask[m].HighVaccuming=null;
    //                         this.submitTask[h].LowVaccuming+=this.submitTask[m].LowVaccuming;
    //                         this.submitTask[m].LowVaccuming=null;
    //                         this.submitTask[h].HighEncapulisation+=this.submitTask[m].HighEncapulisation;
    //                         this.submitTask[m].HighEncapulisation=null;
    //                         this.submitTask[h].LowEncapulisation+=this.submitTask[m].LowEncapulisation;
    //                         this.submitTask[m].LowEncapulisation=null;
    //                         this.submitTask[h].HighHotWaterExtraction+=this.submitTask[m].HighHotWaterExtraction;
    //                         this.submitTask[m].HighHotWaterExtraction=null;
    //                         this.submitTask[h].LowHotWaterExtraction+=this.submitTask[m].LowHotWaterExtraction;
    //                         this.submitTask[m].LowHotWaterExtraction=null;
                          
    //                     }
    //                 }
    //                     console.log(this.submitTask[0])
    //             }
    //             if(!towerdetails.find(x=>x.TowerId==this.submitTask[h].TowerId && x.FloorId==this.submitTask[h].FloorId)){
    //                 var objt={
    //                     TowerId:this.submitTask[h].TowerId,
    //                     FloorId:this.submitTask[h].FloorId
    //                 }
    //                 towerdetails.push(objt);
                   
    //             }
    //             }
               
    //             let UnitPriceWC = results[2];
    //             this.viewWCFacilityTowerWise = [];
    //             var Area = null;
    //             if(WCFacilityTowerWise[0].TowerDetails.length==0)
    //             {
    //                 WCFacilityTowerWise[0].TowerDetails=WCFacilityTowerTaskWiseTotal[0][0].TowerDetails
    //             }
    //             for (var i = 0; i < WCFacilityTowerWise.length; i++) {

    //                 let total = WCFacilityTowerWise[i].TowerDetails.map(x => x).filter(x => x.TOWERNm == "Total");
    //                 if (total.length != 0) {
    //                     var fun =
    //                     {
    //                         TowerId: WCFacilityTowerWise[i].TowerId,
    //                         TowerNm: WCFacilityTowerWise[i].TowerNm,
    //                         HighVaccumingTarget: total[0].High * lastDay.getDate(),
    //                         LowVaccumingTarget: total[0].Low * sundayCount,
    //                         HighEncapulisationTarget: total[0].High / 3,
    //                         LowEncapulisationTarget: total[0].Low / 6,
    //                         HighHotWaterExtractionTarget: total[0].High / 6,
    //                         LowHotWaterExtractionTarget: total[0].Low / 12,
    //                         TowerDetails: WCFacilityTowerWise[i].TowerDetails.map(val => {
    //                             return Object.assign({}, val, this.submitTask.find(x => x.TowerId == WCFacilityTowerWise[i].TowerId && val.FloorId==x.FloorId));
    //                         })
    //                     };
    //                     this.viewWCFacilityTowerWise.push(fun);
    //                     if (Area == null) {
    //                         Area = this.viewWCFacilityTowerWise[i].TowerDetails.filter(x => x.TOWERNm == "Total").map(val => {
    //                             return Object.assign({}, val, this.submitTask.find(x => x.TowerId == WCFacilityTowerWise[i].TowerId));
    //                         });
    //                     } else {
    //                         let ar = this.viewWCFacilityTowerWise[i].TowerDetails.filter(x => x.TOWERNm == "Total").map(val => {
    //                             return Object.assign({}, val, this.submitTask.find(x => x.TowerId == WCFacilityTowerWise[i].TowerId));
    //                         });
    //                         Area = Area.concat(ar);
    //                     }
    //                 }
    //                 else{
    //                     this.viewWCFacilityTowerWise.push(WCFacilityTowerWise[i])
    //                 }
    //             }       
    //             let HighArea = Area.reduce((sum, area) => sum + area.High, 0);
    //             let LowArea = Area.reduce((sum, area) => sum + area.Low, 0);
    //             let HighVaccumingArea = this.submitTask.reduce((sum, area) => sum + (area.HighVaccuming != undefined ? area.HighVaccuming : 0), 0);
    //             let LowVaccumingArea = this.submitTask.reduce((sum, area) => sum + (area.LowVaccuming != undefined ? area.LowVaccuming : 0), 0);
    //             let HighEncapulisationArea = this.submitTask.reduce((sum, area) => sum + (area.HighEncapulisation != undefined ? area.HighEncapulisation : 0), 0);
    //             let LowEncapulisationArea = this.submitTask.reduce((sum, area) => sum + (area.LowEncapulisation != undefined ? area.LowEncapulisation : 0), 0);
    //             let HighHotWaterExtraction = this.submitTask.reduce((sum, area) => sum + (area.HighHotWaterExtraction != undefined ? area.HighHotWaterExtraction : 0), 0);
    //             let LowHotWaterExtraction = this.submitTask.reduce((sum, area) => sum + (area.LowHotWaterExtraction != undefined ? area.LowHotWaterExtraction : 0), 0);
                
    //             this.viewWCCertificate = [];
    //             let UnitPriceVaccuming = null; let UnitPriceEncapulisation = null; let UnitPriceHotWaterExtraction = null;
    //             if (UnitPriceWC.length != 0) {
    //                 UnitPriceVaccuming = UnitPriceWC.find(x => x.WorkType == "Vaccuming").UnitPrice;
    //                 UnitPriceEncapulisation = UnitPriceWC.find(x => x.WorkType == "Encapulisation").UnitPrice;
    //                 UnitPriceHotWaterExtraction = UnitPriceWC.find(x => x.WorkType == "Hot Water Extraction").UnitPrice;
    //             }
    //             this.viewWCCertificate.push({
    //                 CleaningType: "Vaccuming", TargetSqft: HighArea * lastDay.getDate() + LowArea * sundayCount,
    //                 SqftAchieved: HighVaccumingArea + LowVaccumingArea, UnitPrice: UnitPriceVaccuming,
    //                 TotalPrice: (HighVaccumingArea + LowVaccumingArea) * UnitPriceVaccuming
    //             });
    //             this.viewWCCertificate.push({
    //                 CleaningType: "Encapulisation", TargetSqft: HighArea / 3 + LowArea / 6,
    //                 SqftAchieved: HighEncapulisationArea + LowEncapulisationArea, UnitPrice: UnitPriceEncapulisation,
    //                 TotalPrice: (HighEncapulisationArea + LowEncapulisationArea) * UnitPriceEncapulisation
    //             })
    //             this.viewWCCertificate.push({
    //                 CleaningType: "Hot Water Extraction", TargetSqft: HighArea / 6 + LowArea / 12,
    //                 SqftAchieved: HighHotWaterExtraction + LowHotWaterExtraction, UnitPrice: UnitPriceHotWaterExtraction,
    //                 TotalPrice: (HighHotWaterExtraction + LowHotWaterExtraction) * UnitPriceHotWaterExtraction
    //             })
    //             this.viewWCCertificate.push({
    //                 CleaningType: "Total", TargetSqft: HighArea * lastDay.getDate() + LowArea * sundayCount +  (HighArea / 3 + LowArea / 6)+( HighArea / 6 + LowArea / 12),
    //                 SqftAchieved: HighVaccumingArea + LowVaccumingArea + HighEncapulisationArea + LowEncapulisationArea + HighHotWaterExtraction + LowHotWaterExtraction, UnitPrice: null,
    //                 TotalPrice: (HighVaccumingArea + LowVaccumingArea) * UnitPriceVaccuming +
    //                     (HighEncapulisationArea + LowEncapulisationArea) * UnitPriceEncapulisation +
    //                     (HighHotWaterExtraction + LowHotWaterExtraction) * UnitPriceHotWaterExtraction
    //             })
    //         });
    //     });
    //     this.scoreDataService.getWCFacilityWise(this.viewFacilityId).subscribe(
    //         data => {
    //             this.viewWCFacilityWise = data;
    //             this.viewWCFacilityWiseKeys = Object.keys(this.viewWCFacilityWise[0]);
    //             this.viewlist_items = data;
    //             this.viewkeys = Object.keys(this.viewlist_items[0]); // Get the column names                 
    //         }
    //     )
    // }
    getViewWCDetails(firstDay: Date, lastDay: Date) {
        debugger;
        console.log();
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
                console.log(WCFacilityTowerWise)
                let WCFacilityTowerTaskWise = results[1][0];
                console.log('tower task wise')
                console.log(WCFacilityTowerTaskWise)
                debugger;
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
                            else{​​​​

                            this.viewWCFacilityTowerWise.push(WCFacilityTowerWise[i])
  
                         }​​​​
  
                         if (Area == null) {​​​​
  
                          Area = this.viewWCFacilityTowerWise[i].TowerDetails.filter(x => x.TOWERNm == "Total");
  
                      }​​​​
  
                       else {​​​​
  
                          let ar = this.viewWCFacilityTowerWise[i].TowerDetails.filter(x => x.TOWERNm == "Total");
  
                          Area = Area.concat(ar);
  
                      }​​​​
                }
                console.log(this.viewWCFacilityTowerWise);
                console.log(Area);
                let HighArea = Area.reduce((sum, area) => sum + area.High, 0);
                let LowArea = Area.reduce((sum, area) => sum + area.Low, 0);
                console.log('high area '+HighArea);
                console.log('low area '+ LowArea);
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
        this.pagerView = this.pagerService.getPager(this.countView, this.pageNumberView, this.pageSizeView);
        if (this.sortDirectionView == "asc") {
            this.viewScoreDataDisplay = this.viewScoreData.sort((a, b) => a[this.sortColumnView].localeCompare(b[this.sortColumnView])).slice(this.pagerView.startIndex, this.pagerView.endIndex + 1);
            console.log(this.viewScoreDataDisplay);
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
        this.pageNumberView = page;
        this.setPagerView();
    }

    //Called this method on page option changes
    onPagingOptionsChangeView(e: number) {
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
        this.WCFacilityWise=null;
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


    //#region File Uploda/Dowload 

    selectedFiles: FileList;
    showInputFile: boolean = true;
    showFile: boolean = false;
    uploadedFileName: string;

    selectFile(event) {
        if (event.target.files.length == 0) {
            this.selectedFiles = null;
        }
        else {
            this.selectedFiles = event.target.files;
        }
    }

    upload() {
        var allowedFileExtensions = ["pdf", "xlsx", "docx"];
        var maxFileSize = 5242880;
        var allowedName = this.transactionRefNo;
        var size = this.selectedFiles[0].size;
        var ext = this.selectedFiles[0].name.substring(this.selectedFiles[0].name.lastIndexOf('.') + 1);
        var type = this.selectedFiles[0].type;
        // if (allowedName != this.selectedFiles[0].name.substring(0, this.selectedFiles[0].name.lastIndexOf('.'))) {
        //     alert("File name is incorrect, correct the file name. File name should be same as Package Id (" + allowedName + ")")
        // }
        if (allowedFileExtensions.findIndex(x => x == ext) == -1) {
            //alert("Invalid File Type (only .xlsx/.csv/.docx files are allowed)");
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            modalRef.componentInstance.title = configuration.Alert;
            modalRef.componentInstance.message = "Invalid File Type (only .xlsx/.csv/.docx files are allowed)";
        }
        else if (size > maxFileSize) {
            //alert("File size should not exceed 5 MB");
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            modalRef.componentInstance.title = configuration.Alert;
            modalRef.componentInstance.message = "File size should not exceed 5 MB";
        }
        else {
            const file = this.selectedFiles.item(0);
            var that = this;
            var reader = new FileReader();
            // Closure to capture the file information.
            reader.onload = (function (theFile) {
                return function (e) {
                    that.processFile(e);
                };

            })(file);
            // Read in the image file as a data URL.
            //reader.readAsBinaryString(file);
            reader.readAsArrayBuffer(file);
        }
    }
    processFile(e) {
        var binaryData = "";
        var bytes = new Uint8Array(e.target.result);
        var length = bytes.byteLength;

        for (var i = 0; i < length; i++) {
            binaryData += String.fromCharCode(bytes[i]);
        }

        //var binaryData = e.target.result;
        //Converting Binary Data to base 64
        var base64String = window.btoa(binaryData);
        var that = this;
        this.fileService.uploadfile(base64String, this.transactionRefNo).subscribe(
            data => {
                that.uploadedFileName = data.toString();
                that.showFiles(true);
                that.selectedFiles = null;
                that.showInputFile = false;
                //console.log(base64String);

            });


    }
    showFiles(enable: boolean) {
        this.showFile = enable;
    }
    downloadfile() {
        var that = this;
        this.fileService.getFile(this.uploadedFileName).subscribe(
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
                saveAs(blob, that.uploadedFileName);
            });

    }
    delete() {
        var that = this;
        this.fileService.deleteFile(this.uploadedFileName).subscribe(
            data => {
                that.showFile = false;
                that.showInputFile = true;
            });
    }


    //#endregion

    // Get Role Name for Remarks By Column
    getRoleName() {
        this.dataService.getRoleNameForRemarksByColumn(this.loggedEnterpriseId, location.pathname).subscribe(
            data => {
                if (data.length != 0) {
                    this.remarksBy = data[0].RoleName;
                    console.log("Remarks By: " + this.remarksBy);
                }

            }
        );

    }


    //   search = (text$: Observable<string>) =>
    //     text$.pipe(      
    //       debounceTime(200),
    //       distinctUntilChanged(),
    //       map(term => term.length < 2 ? []
    //         : states.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    //     )
    search = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            //tap(() => this.searching = true),
            switchMap(term => term.trim().length < 3 ? []
                : this.scoreDataService.searchTransaction(term.trim(), this.PackageFacilityAliasFilter).pipe(
                    //tap(() => this.searchFailed = false),
                    catchError(() => {
                        //this.searchFailed = true;
                        return of([]);
                    }))
            ),
            //tap(() => this.searching = false)
            //tap(() => this.selectedTransactionCode="")
        )
   
    // dates1 : Array<Date>;
    // now : Date= new Date();
    // dayNo : number = this.now.getDay();
    // dateNo : number = this.now.getDate();
    // monthNo : number = this.now.getMonth();
    // frequecnyConfig(){
    //     debugger;
    //     const dailyDate =new Date();
    //     dailyDate.setDate(dailyDate.getDate()-1);
    //     this.dates1= [dailyDate];

    //     const weeklyDate =new Date();
    //     if(this.dayNo == 0){
    //         this.dates1.push(weeklyDate)
    //     }
    //     else{
    //         weeklyDate.setDate(weeklyDate.getDate()+(7-this.dayNo))
    //         this.dates1.push(weeklyDate)
    //     }

    //     let fortnightlyDate =new Date();
    //     if(this.dayNo <= 15 ){
    //         fortnightlyDate.setDate(fortnightlyDate.getDate()+(15-this.dateNo))
    //         this.dates1.push(fortnightlyDate)
    //     }
    //     else{
    //         fortnightlyDate = new Date(this.now.getFullYear(), this.now.getMonth() + 1, 0)
    //         this.dates1.push(fortnightlyDate)
    //     }
    // }


}

