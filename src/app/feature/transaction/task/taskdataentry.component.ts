import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../core/services/DataService';
import {
    CountryMaster, CityMaster, FacilityMaster, TowerMaster, FloorMaster, TrafficMaster,
    FrequencyMaster, FilterDetails, VendorMaster, DutyManager, PackageFacilityAliasVendorMaster
} from '../../../core/services/Data';
import { PagerService } from '../../../core/services/PagerService';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { TaskDataEntryService } from '../../../core/services/TaskDataEntryService';
import {TaskMasterService} from '../../../core/services/TaskMasterService'
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap, switchMap, catchError } from 'rxjs/operators';
import { NgbDateStruct, NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { forkJoin } from "rxjs";
import { configuration } from '../../../../config/configuration';
import { ExcelFileService } from '../../../core/services/ExcelFileService';

@Component({
    selector: 'rebar-taskdataentry',
    templateUrl: './taskdataentry.html',
    styleUrls: ['./taskdataentry.css']
})

export class TaskDataEntryComponent implements OnInit {
    message = 'Task Data Entry';

    constructor(private dataService: DataService, private pagerService: PagerService, private taskDataEntryService: TaskDataEntryService,
        private modalService: NgbModal, private calendar: NgbCalendar, private datepipe: DatePipe, private excelService: ExcelFileService,private taskMasterService:TaskMasterService) {
        this.pageSize = this.selectedPageSize;
        if (location.href.toLocaleLowerCase().indexOf("local") != -1) {
            this.loggedEnterpriseId = 'sumit.al.sharma';
        }
        else {
            this.loggedEnterpriseId = sessionStorage["LoggedinUser"];
        }
    }


    //#region Main page Property
    loggedEnterpriseId: string = "";
    noAccessMessage: string = configuration.NoAccessMessage;
    fullAccess: boolean = true;

    //loading property    
    loadingSymbol: boolean = true;

    //paging proprty
    pager: any = {};
    count: number = 0;
    pageNumber: number = this.pagerService.pageNumber;
    pageSize: number = this.pagerService.pageSize;

    //pagingoption property
    pageOptions = this.pagerService.pageOptions;
    selectedPageSize: number = this.pagerService.selectedPageSize;

    //sorting property
    sortColumn: string = "TaskDetailsId";
    sortDirection: string = "desc";
    defaultSort: boolean = true;

    //filter property
    filterCount: number = 5;
    showMoreText: string = "Show More";
    showLessText: string = "Show Less";

    taskData: any = null;
    taskDataDisplay: any = null;
    packageFacilityDetails: any = null;
    public vendorDetails: VendorMaster[];
    public dutyManagerDetails: DutyManager[];
    public cityDetails: CityMaster[];
    public facilityDetails: FacilityMaster[];
    public towerDetails: TowerMaster[];
    public frequencyDetails: FrequencyMaster[];
    public trafficDetails: TrafficMaster[];
    public countryDetails: CountryMaster[];

    packageIdsForTask: any;
    packageFacilityVendorDetails: PackageFacilityAliasVendorMaster[] = null;

    //#endregion

    //#region Filter Property

    //property used to toggle the filter
    public showUniqueId: boolean = false;
    public showVendor: boolean = false;
    public showDutyManager: boolean = false;
    public showDate: boolean = false;
    public showCity: boolean = false;
    public showFacility: boolean = false;
    public showTower: boolean = false;
    public showFrequency: boolean = false;
    public showTraffic: boolean = false;
    public enableClearAll: boolean = false;
    public showCountry: boolean = false;

    //property used to toggle the show more filter details
    public showMoreVendor: string = this.showMoreText;
    public showMoreDutyManager: string = this.showMoreText;
    public showMoreCity: string = this.showMoreText;
    public showMoreFacility: string = this.showMoreText;
    public showMoreTower: string = this.showMoreText;
    public showMoreFrequency: string = this.showMoreText;
    public showMoreTraffic: string = this.showMoreText;
    public showMoreCountry: string = this.showMoreText;

    //property used to show count of filter
    public vendorCount: number = this.filterCount;
    public dutyManagerCount: number = this.filterCount;
    public cityCount: number = this.filterCount;
    public facilityCount: number = this.filterCount;
    public towerCount: number = this.filterCount;
    public frequencyCount: number = this.filterCount;
    public trafficCount: number = this.filterCount;
    public countryCount: number = this.filterCount;

    //property used to store the selcted filter values
    public filteredArray: FilterDetails[];
    public selectedUniqueId: string = "";
    public selectedDate: NgbDateStruct;
    public selectedDatetoday = this.calendar.getToday();
    public selectedVendorIds: Array<number>;
    public selectedDutyManager: Array<string>;
    public selectedCityIds: Array<number>;
    public selectedFacilityIds: Array<number>;
    public selectedTowerIds: Array<number>;
    public selectedFrequencyIds: Array<number>;
    public selectedTrafficIds: Array<number>;
    public selectedCountryIds: Array<number>;

    //#endregion

    //#region Filter Methods

    //#region method used to toggle the filter
    toggleUniqueId() {
        this.showUniqueId = !this.showUniqueId;
    }
    toggleVendor() {
        this.showVendor = !this.showVendor;
    }
    toggleDutyManager() {
        this.showDutyManager = !this.showDutyManager;
    }
    toggleDate() {
        this.showDate = !this.showDate;
    }
    toggleCity() {
        this.showCity = !this.showCity;
    }
    toggleTower() {
        this.showTower = !this.showTower;
    }
    toggleFacility() {
        this.showFacility = !this.showFacility;
    }
    toggleFrequency() {
        this.showFrequency = !this.showFrequency;
    }
    toggleTraffic() {
        this.showTraffic = !this.showTraffic;
    }
    toggleCountry() {
        this.showCountry = !this.showCountry;
    }
    //#endregion

    //#region method used to toggle the show more filter details and filter count
    displayMoreVendor() {
        debugger;
        this.showMoreVendor = this.showMoreVendor == this.showMoreText ? this.showLessText : this.showMoreText;
        this.vendorCount = this.showMoreVendor == this.showMoreText ? this.filterCount : this.vendorDetails.length;
    }

    displayMoreDutyManager() {
        this.showMoreDutyManager = this.showMoreDutyManager == this.showMoreText ? this.showLessText : this.showMoreText;
        this.dutyManagerCount = this.showMoreDutyManager == this.showMoreText ? this.filterCount : this.dutyManagerDetails.length;
    }

    displayMoreCity() {
        this.showMoreCity = this.showMoreCity == this.showMoreText ? this.showLessText : this.showMoreText;
        this.cityCount = this.showMoreCity == this.showMoreText ? this.filterCount : this.cityDetails.length;
    }

    displayMoreFacility() {
        this.showMoreFacility = this.showMoreFacility == this.showMoreText ? this.showLessText : this.showMoreText;
        this.facilityCount = this.showMoreFacility == this.showMoreText ? this.filterCount : this.facilityDetails.length;
    }

    displayMoreFrequency() {
        this.showMoreFrequency = this.showMoreFrequency == this.showMoreText ? this.showLessText : this.showMoreText;
        this.frequencyCount = this.showMoreFrequency == this.showMoreText ? this.filterCount : this.frequencyDetails.length;
    }

    displayMoreTraffic() {
        this.showMoreTraffic = this.showMoreTraffic == this.showMoreText ? this.showLessText : this.showMoreText;
        this.trafficCount = this.showMoreTraffic == this.showMoreText ? this.filterCount : this.trafficDetails.length;
    }
    displayMoreCountry() {
        this.showMoreCountry = this.showMoreCountry == this.showMoreText ? this.showLessText : this.showMoreText;
        this.countryCount = this.showMoreCountry == this.showMoreText ? this.filterCount : this.countryDetails.length;
    }

    //#endregion

    //#region clear filter selection
    //method to clear all the selected filters
    clearAllFilter() {
        this.filteredArray = [];
        this.selectedUniqueId = "";
        this.selectedVendorIds = [];
        this.selectedDutyManager = [];
        this.selectedDate = null;
        this.selectedCityIds = [];
        this.selectedFacilityIds = [];
        this.selectedTowerIds = [];
        this.selectedFrequencyIds = [];
        this.selectedTrafficIds = [];
        this.selectedCountryIds = [];

        this.vendorDetails.forEach(
            x => { x.selected = false; }
        );
        this.dutyManagerDetails.forEach(
            x => { x.selected = false; }
        );
        this.cityDetails.forEach(
            x => { x.selected = false; }
        );
        this.facilityDetails.forEach(
            x => { x.selected = false; }
        );
        this.towerDetails.forEach(
            x => { x.selected = false; }
        );
        this.frequencyDetails.forEach(
            x => { x.selected = false; }
        );
        this.trafficDetails.forEach(
            x => { x.selected = false; }
        );
        this.countryDetails.forEach(
            x => { x.selected = false; }
        );

        this.enableClearAll = false;
        this.getFilteredData();
    }

    //method to clear single selected filter
    deleteFilter(e) {
        if (e.filterName == "uniqueId") {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "uniqueId");
            this.filteredArray.splice(index, 1);
            this.selectedUniqueId = "";
        }
        else if (e.filterName == "date") {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "uniqueId");
            this.filteredArray.splice(index, 1);
            this.selectedDate = null;
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.text == e.text);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            if (e.filterName == "vendor") {
                const indexVendor: number = this.selectedVendorIds.indexOf(e.value);
                if (index !== -1) {
                    this.selectedVendorIds.splice(indexVendor, 1);
                    this.vendorDetails[this.vendorDetails.findIndex(item => item.vendorId == e.value)].selected = false;
                }
            }
            else if (e.filterName == "dutyManager") {
                const indexDutyManager: number = this.selectedDutyManager.indexOf(e.value);
                if (index !== -1) {
                    this.selectedDutyManager.splice(indexDutyManager, 1);
                    this.dutyManagerDetails[this.dutyManagerDetails.findIndex(item => item.dutyManagerName == e.value)].selected = false;
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
            else if (e.filterName == "tower") {
                const indexTower: number = this.selectedTowerIds.indexOf(e.value);
                if (index !== -1) {
                    this.selectedTowerIds.splice(indexTower, 1);
                    this.towerDetails[this.towerDetails.findIndex(item => item.towerId == e.value)].selected = false;
                }
            }
            else if (e.filterName == "frequency") {
                const indexFrequency: number = this.selectedFrequencyIds.indexOf(e.value);
                if (index !== -1) {
                    this.selectedFrequencyIds.splice(indexFrequency, 1);
                    this.frequencyDetails[this.frequencyDetails.findIndex(item => item.frequencyId == e.value)].selected = false;
                }
            }
            else if (e.filterName == "traffic") {
                const indexTraffic: number = this.selectedTrafficIds.indexOf(e.value);
                if (index !== -1) {
                    this.selectedTrafficIds.splice(indexTraffic, 1);
                    this.trafficDetails[this.trafficDetails.findIndex(item => item.trafficId == e.value)].selected = false;
                }
            }
            else if (e.filterName == "country") {
                const indexCountry: number = this.selectedCountryIds.indexOf(e.value);
                if (index !== -1) {
                    this.selectedCountryIds.splice(indexCountry, 1);
                    this.countryDetails[this.countryDetails.findIndex(item => item.countryId == e.value)].selected = false;
                }
            }
        }
        this.getFilteredData();
    }
    //#endregion

    //#region method to select filter

    selectUniqueId(e) {
        debugger;
        //e.preventDefault();
        const index: number = this.filteredArray != undefined ? this.filteredArray.findIndex(item => item.filterName == "uniqueId") : -1;
        if (index !== -1) {
            this.filteredArray.splice(index, 1);
        }
        if (this.filteredArray != undefined) {
            this.filteredArray.push({ value: -1, text: e.item, filterName: "uniqueId" });
        }
        else {
            this.filteredArray = [{ value: -1, text: e.item, filterName: "uniqueId" }]
        }
        this.selectedUniqueId = e.item;
        //input.value = '';        
        this.getFilteredData();
    }

    searchUniqueId() {
        debugger;
        if(this.selectedUniqueId.trim() != ""){
            const index: number = this.filteredArray != undefined ? this.filteredArray.findIndex(item => item.filterName == "uniqueId") : -1;
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ value: -1, text: this.selectedUniqueId.trim(), filterName: "uniqueId" });
            }
            else {
                this.filteredArray = [{ value: -1, text: this.selectedUniqueId.trim(), filterName: "uniqueId" }]
            }
            this.getFilteredData();
        }        
    }
    datechange(e){
        this.taskDetails = null;
        this.selectedTaskIds = [];
        this.noTaskMessage = "";
    }

    onDateSelect(e) {
        debugger;
        var date = new Date(e.year, e.month - 1, e.day);
        var transactionDate = this.datepipe.transform(date, 'yyyy-MM-dd');
        const index: number = this.filteredArray != undefined ? this.filteredArray.findIndex(item => item.filterName == "date") : -1;
        if (index !== -1) {
            this.filteredArray.splice(index, 1);
        }
        if (this.filteredArray != undefined) {
            this.filteredArray.push({ value: -1, text: transactionDate, filterName: "date" });
        }
        else {
            this.filteredArray = [{ value: -1, text: transactionDate, filterName: "date" }]
        }
        //this.selectedUniqueId = e; 
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

    selectDutyManager(e) {
        if (e.selected) {
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ value: e.dutyManagerName, text: e.dutyManagerName, filterName: "dutyManager" });
            }
            else {
                this.filteredArray = [{ value: e.dutyManagerName, text: e.dutyManagerName, filterName: "dutyManager" }]
            }

            if (this.selectedDutyManager != undefined) {
                this.selectedDutyManager.push(e.dutyManagerName);
            }
            else {
                this.selectedDutyManager = [e.dutyManagerName];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "dutyManager" && item.value == e.dutyManagerName);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexCountry: number = this.selectedDutyManager.indexOf(e.dutyManagerName);
            if (index !== -1) {
                this.selectedDutyManager.splice(indexCountry, 1);
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
        this.facilityDetails = [];
        this.selectedFacilityIds = [];
        this.dataService.getFacilityDetailsByCityIds(this.selectedCityIds.toString()).subscribe(
            data => {
                this.facilityDetails = data;
            }
        );
        this.towerDetails = [];
        this.selectedTowerIds = [];
        this.dataService.getTowerDetailsByCityIds(this.selectedCityIds.toString()).subscribe(
            data => {
                this.towerDetails = data;
            }
        );
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
        // this.towerDetails = [];
        // this.selectedTowerIds = [];
        // this.dataService.getTowerDetailsByFacilityIds(this.selectedCityIds.toString()).subscribe(
        //     data => {
        //         this.towerDetails = data;
        //     }
        // );
        this.getFilteredData();
    }

    selectTower(e) {
        if (e.selected) {
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ value: e.towerId, text: e.towerName, filterName: "tower" });
            }
            else {
                this.filteredArray = [{ value: e.towerId, text: e.towerName, filterName: "tower" }]
            }

            if (this.selectedTowerIds != undefined) {
                this.selectedTowerIds.push(e.towerId);
            }
            else {
                this.selectedTowerIds = [e.towerId];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "tower" && item.value == e.towerId);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexTower: number = this.selectedTowerIds.indexOf(e.towerId);
            if (index !== -1) {
                this.selectedTowerIds.splice(indexTower, 1);
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

    selectTraffic(e) {
        if (e.selected) {
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ value: e.trafficId, text: e.trafficName, filterName: "traffic" });
            }
            else {
                this.filteredArray = [{ value: e.trafficId, text: e.trafficName, filterName: "traffic" }]
            }

            if (this.selectedTrafficIds != undefined) {
                this.selectedTrafficIds.push(e.trafficId);
            }
            else {
                this.selectedTrafficIds = [e.trafficId];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "traffic" && item.value == e.trafficId);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexTraffic: number = this.selectedTrafficIds.indexOf(e.trafficId);
            if (index !== -1) {
                this.selectedTrafficIds.splice(indexTraffic, 1);
            }
        }
        this.getFilteredData();
    }

    selectCountry(e) {
        if (e.selected) {
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ value: e.countryId, text: e.countryName, filterName: "country" });
            }
            else {
                this.filteredArray = [{ value: e.countryId, text: e.countryName, filterName: "country" }]
            }

            if (this.selectedCountryIds != undefined) {
                this.selectedCountryIds.push(e.countryId);
            }
            else {
                this.selectedCountryIds = [e.countryId];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "country" && item.value == e.countryId);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexCountry: number = this.selectedCountryIds.indexOf(e.countryId);
            if (index !== -1) {
                this.selectedCountryIds.splice(indexCountry, 1);
            }
        }
        this.getFilteredData();
    }
    //#endregion

    //#endregion


    ngOnInit() {
        debugger;
        this.loadingSymbol = true;
        let getFacilityDetails = this.dataService.getFacilityAliasDetails();
        let getPackageFacilityDetailsByPage = this.dataService.getPackageFacilityDetailsByPage(this.loggedEnterpriseId, location.pathname);
        forkJoin([getFacilityDetails, getPackageFacilityDetailsByPage]).subscribe(data => {
            let facilityDetails = data[0];
            this.packageFacilityDetails = data[1];
            if (this.packageFacilityDetails.length != 0) {
                let facilityIds = this.packageFacilityDetails.map(x => x.FacilityId);
                this.facilityDetails = facilityDetails.filter(u => facilityIds.includes(u.facilityId));
                let getVendorDetails = this.dataService.getVendorDetails();
                let getTaskMasterData = this.taskDataEntryService.getTaskMasterData("", "", "", "", "", "", facilityIds.toString());
                forkJoin([getVendorDetails, getTaskMasterData]).subscribe(results => {
                    this.vendorDetails = results[0];
                    var taskMasterData = results[1];
                    if (taskMasterData.length != 0) {
                        let taskIds = taskMasterData.map(x => x.TaskId).toString();
                        this.taskDataEntryService.getTaskDetailsData(this.pageNumber, this.sortColumn, this.sortDirection, this.pageSize, taskIds, "", "", "").subscribe(
                            data => {
                                var taskDetailsData = data;
                                var tasks = taskMasterData.map(val => {
                                    return Object.assign({}, val, this.frequencyDetails.filter(v => v.frequencyId === val.FrequencyId)[0]
                                        , this.facilityDetails.filter(v => v.facilityId === val.FacilityId)[0]);
                                });
                                this.taskData = taskDetailsData[0][0].Transaction.map(val => {
                                    return Object.assign({}, val, tasks.filter(v => v.TaskId === val.TaskId)[0]
                                        , this.vendorDetails.filter(v => v.vendorId === val.ServiceProviderId)[0]);
                                });
                                this.count = taskDetailsData[0][0].TotalRecordCount;
                                this.setPager();
                                this.loadingSymbol = false;
                            }
                        );
                    }
                    else {
                        this.taskDataDisplay = [];
                        this.loadingSymbol = false;
                    }
                });
                this.dataService.getDutyManagerDetails(facilityIds.toString()).subscribe(
                    data => {
                        this.dutyManagerDetails = data;
                    }
                );
            }
            else {
                this.loadingSymbol = false;
                this.fullAccess = false;
            }
        });

        this.dataService.getCountryDetails().subscribe(
            data => {
                this.countryDetails = data;
            }
        );
        this.dataService.getCityDetails().subscribe(
            data => {
                this.cityDetails = data;
            }
        );
        this.dataService.getTowerDetails().subscribe(
            data => {
                this.towerDetails = data;
            }
        );
        this.dataService.getFrequencyDetails().subscribe(
            data => {
                this.frequencyDetails = data;
            }
        );
        this.dataService.getTrafficDetails().subscribe(
            data => {
                this.trafficDetails = data;
            }
        );
        this.dataService.getPackageIdsForTaskPage(configuration.TasksPackage).subscribe(
            data => {
                this.packageIdsForTask = data;
            }
        );
        this.dataService.PackageFacilityAliasVendorMapping().subscribe(
            data => {
                this.packageFacilityVendorDetails = data;
            }
        );
    }

    exportAsXLSX(): void {
        this.loadingSymbol = true;
        this.taskDataEntryService.downloadTaskMasterData(this.facilityDetails.map(x => x.facilityId).toString()).subscribe(
            data => {
                debugger;                
                const result1 = data.map(val => {
                    return Object.assign({}, val, this.frequencyDetails.filter(v => v.frequencyId === val.FrequencyId)[0]
                        , this.facilityDetails.filter(v => v.facilityId === val.FacilityAliasId)[0])
                });
                const final = result1.map(function (data) {
                    return {
                        'UNIQUE ID': data.TaskCd, 'SITE': data.facilityName, 'TOWER': data.TowerNm, 'FLOOR': data.FloorNm,
                        'LOCATION': data.Location, 'TRAFFIC': data.TrafficType, 'AREA': data.Area, 'FREQUENCY': data.frequencyName,
                        'WORK TYPE': data.WorkType
                    };
                })
                this.excelService.exportAsExcelFile(final, 'TaskMaster ');
                this.loadingSymbol = false;
            }
        );
    }

    //#region Grid Data

    //Called this method to get filtered data
    public getFilteredData(): void {
        debugger;
        this.loadingSymbol = true;
        let length: number = this.filteredArray != undefined ? this.filteredArray.length : 0;
        let facilityIds = this.facilityDetails.map(x => x.facilityId);
        if (length == 0) {
            this.enableClearAll = false;
            this.taskDataEntryService.getTaskMasterData("", "", "", "", "", "", facilityIds.toString()).subscribe(
                data => {
                    var taskMasterData = data;
                    if (taskMasterData.length != 0) {
                        let taskIds = taskMasterData.map(x => x.TaskId).toString();
                        this.taskDataEntryService.getTaskDetailsData(this.pageNumber, this.sortColumn, this.sortDirection, this.pageSize, taskIds, "", "", "").subscribe(
                            data => {
                                var taskDetailsData = data;
                                this.taskData = data;
                                var tasks = taskMasterData.map(val => {
                                    return Object.assign({}, val, this.frequencyDetails.filter(v => v.frequencyId === val.FrequencyId)[0]
                                        , this.facilityDetails.filter(v => v.facilityId === val.FacilityId)[0]);
                                });
                                this.taskData = taskDetailsData[0][0].Transaction.map(val => {
                                    return Object.assign({}, val, tasks.filter(v => v.TaskId === val.TaskId)[0]
                                        , this.vendorDetails.filter(v => v.vendorId === val.ServiceProviderId)[0]);
                                });
                                this.count = taskDetailsData[0][0].TotalRecordCount;
                                this.setPager();
                                this.loadingSymbol = false;
                            }
                        );
                    }
                    else {
                        this.taskDataDisplay = [];
                        this.loadingSymbol = false;
                    }
                }
            );
        } else {
            this.enableClearAll = true;
            var selectedUniqueId = this.selectedUniqueId != undefined ? this.selectedUniqueId : '';
            var FacilityId = this.selectedFacilityIds != undefined ? this.selectedFacilityIds.toString() : '';
            var TowerId = this.selectedTowerIds != undefined ? this.selectedTowerIds.toString() : '';
            var FrequencyId = this.selectedFrequencyIds != undefined ? this.selectedFrequencyIds.toString() : '';
            var TrafficId = this.selectedTrafficIds != undefined ? this.selectedTrafficIds.toString() : '';
            var ServiceProviderId = this.selectedVendorIds != undefined ? this.selectedVendorIds.toString() : '';
            var DutyManagerName = this.selectedDutyManager != undefined ? this.selectedDutyManager.toString() : '';
            var date = this.selectedDate != undefined ? new Date(this.selectedDate.year, this.selectedDate.month - 1, this.selectedDate.day) : "";
            var TransactionDate = date != "" ? this.datepipe.transform(date, 'yyyy-MM-dd') : "";
            this.taskDataEntryService.getTaskMasterData(selectedUniqueId, "", FacilityId, TowerId, FrequencyId, TrafficId, facilityIds.toString()).subscribe(
                data => {
                    var taskMasterData = data;
                    if (taskMasterData.length != 0) {
                        var taskIds = taskMasterData.map(x => x.TaskId);
                        this.taskDataEntryService.getTaskDetailsData(this.pageNumber, this.sortColumn, this.sortDirection, this.pageSize
                            , taskIds, ServiceProviderId, DutyManagerName, TransactionDate).subscribe(
                                data => {
                                    var taskDetailsData = data;
                                    this.taskData = data;
                                    var tasks = taskMasterData.map(val => {
                                        return Object.assign({}, val, this.frequencyDetails.filter(v => v.frequencyId === val.FrequencyId)[0]
                                            , this.facilityDetails.filter(v => v.facilityId === val.FacilityId)[0]);
                                    });
                                    this.taskData = taskDetailsData[0][0].Transaction.map(val => {
                                        return Object.assign({}, val, tasks.filter(v => v.TaskId === val.TaskId)[0]
                                            , this.vendorDetails.filter(v => v.vendorId === val.ServiceProviderId)[0]);
                                    });
                                    this.count = taskDetailsData[0][0].TotalRecordCount;
                                    this.setPager();
                                    this.loadingSymbol = false;
                                }
                            );
                    }
                    else {
                        this.taskDataDisplay = [];
                        this.loadingSymbol = false;
                    }
                }
            )
        }
    }

    setPager() {
        debugger;
        this.pager = this.pagerService.getPager(this.count, this.pageNumber, this.pageSize);
        //this.taskDataDisplay = this.taskData.slice(this.pager.startIndex, this.pager.endIndex + 1);
        this.taskDataDisplay = this.taskData;
        this.taskDataDisplay.forEach((x) => {
            var dt=new Date(x.CreateDttm);
            dt.setHours(dt.getHours()-5);
            dt.setMinutes(dt.getMinutes()-30);
            x.CreateDttm=new Date(dt).toUTCString();
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
        this.setPager();
    }

    //Called this method on paging
    setPage(page: number) {
        debugger;
        this.pageNumber = page;
        this.getFilteredData();
        this.setPager();
    }

    //Called this method on page option changes
    onPagingOptionsChange(e: number) {
        debugger;
        this.selectedPageSize = +e;
        this.pageSize = this.selectedPageSize;
        this.pageNumber = 1;
        this.getFilteredData();
        this.setPager();
    }

    //reset paging and sorting to default
    reset() {
        this.pager = {};
        this.count = 0;
        this.pageNumber = this.pagerService.pageNumber;
        this.pageSize = this.pagerService.pageSize;
        this.selectedPageSize = this.pagerService.selectedPageSize;
        this.sortColumn = "CreateDttm";
        this.sortDirection = "desc";
        this.defaultSort = true;
    }
    //#endregion


    //#region Create Task Master Pop up

    //create popup fields   
    loadingSymbolForModal: boolean = false;
    createVendorDetails: any;
    createFacilityDetails: any;
    createTowerDetails: any;
    createFloorDetails: any;
    vendorId: number = -1;
    dutyManager: string;
    //periodDate: Date = new Date();
    facilityId: number = -1;
    towerId: number = -1;
    floorId: number = -1;
    taskDetails: any;
    noTaskMessage: string = "";
    selectedTaskIds: any[];
    disableCreateButton: boolean = false;

    periodDate: NgbDateStruct;
    today = this.calendar.getToday();
    todayDate = new Date();
    lastDate = this.todayDate.setDate(this.todayDate.getDate() - 1);
    year: number = this.todayDate.getFullYear();
    month: number = this.todayDate.getMonth() + 1;
    day: number = this.todayDate.getDate();

    createTask(createScoreModal) {
        debugger;
        this.createVendorDetails = [];//this.vendorDetails;
        this.createFacilityDetails = this.facilityDetails;
        this.createTowerDetails = [];
        this.createFloorDetails = [];
        this.dutyManager = this.loggedEnterpriseId;
        this.modalService.open(createScoreModal, { backdrop: 'static', keyboard: false, windowClass: "edit" });
    }


    onCreateFacilityChange() {
        this.towerId = -1;
        this.createTowerDetails = [];
        this.floorId = -1;
        this.createFloorDetails = [];
        this.vendorId = -1;
        this.createVendorDetails = [];
        if (this.facilityId !== -1) {
            this.loadingSymbolForModal = true;
            this.dataService.getTowerDetailsByFacilityId(this.facilityId).subscribe(
                data => {
                    this.createTowerDetails = data;
                    this.loadingSymbolForModal = false;
                }
            );
            let packageIds = Array.from(new Set(this.packageIdsForTask.map(x => x.PackageId)));
            let vendorIds = Array.from(new Set(this.packageFacilityVendorDetails
                .filter(x => x.FacilityAliasId == this.facilityId && packageIds.includes(x.PackageId))
                .map(x => x.ServiceProviderId)));
            this.createVendorDetails = this.vendorDetails.filter(x=>vendorIds.includes(x.vendorId));
        }
    }

    onCreateTowerChange() {
        this.floorId = -1;
        this.createFloorDetails = [];
        if (this.towerId !== -1) {
            this.loadingSymbolForModal = true;
            this.dataService.getFloorDetailsByTowerId(this.towerId, this.facilityId).subscribe(
                data => {
                    this.createFloorDetails = data;
                    this.loadingSymbolForModal = false;
                }
            );
        }
    }

    clearSelection() {
        this.vendorId = -1;
        this.facilityId = -1;
        this.towerId = -1;
        this.floorId = -1;
        this.periodDate = null;
        this.createVendorDetails = [];
        this.createTowerDetails = [];
        this.createFloorDetails = [];
        this.taskDetails = null;
        this.selectedTaskIds = [];
        this.noTaskMessage = "";
        this.disableCreateButton = false;
    }

    addTask() {
        debugger;
        this.noTaskMessage = "";
        this.taskDetails = null;
        this.selectedTaskIds = [];
        this.disableCreateButton = false;
        this.loadingSymbolForModal = true;
        if (this.vendorId == -1 || this.periodDate == null || this.periodDate == undefined || this.facilityId == -1 || this.towerId == -1 || this.floorId == -1) {
            //alert("Please select all mandatory fileds.");
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            //const modalRef = this.modalService.open(AlertComponent, { centered: true, windowClass: 'modal-adaptive-s1', size: 'sm' });
            modalRef.componentInstance.title = configuration.Mandatory;
            modalRef.componentInstance.message = configuration.MandatoryMessage;
            this.loadingSymbolForModal = false;

        }
        else {
            debugger;
            var date = new Date(this.periodDate.year, this.periodDate.month - 1, this.periodDate.day);
            var transactionDate = this.datepipe.transform(date, 'yyyy-MM-dd');

            this.taskDataEntryService.getTaskDetails(this.facilityId, this.towerId, this.floorId,this.periodDate.month,this.periodDate.year).subscribe(
                data => {
                             if (data.length != 0 && data[0][0].Task.length!=0 ) {
                                var taskData = data[0];
                                var taskIds = [];
                                for (var i = 0; i < taskData.length; i++) {
                                      taskData[i].Task.forEach(x => {
                                        taskIds.push(x.TaskId);
                                    })
                                }
                                this.taskDetails = [];
                                this.taskDataEntryService.getTask(taskIds.toString(), this.vendorId, this.dutyManager, transactionDate).subscribe(
                                    data => {
                                        var validRow = data;
                                        if (validRow.length != 0) {
                                            let length = 0;
                                            validRow.forEach(x => { x.selected = true; x.disabled = true });
                                            for (var i = 0; i < taskData.length; i++) {
                                                var tasks = taskData[i].Task.map(val => {
                                                    return Object.assign({}, val, this.frequencyDetails.filter(v => v.frequencyId === val.FrequencyId)[0]
                                                        , validRow.filter(v => v.TaskId === val.TaskId)[0]);
                                                });
                                                var taskIds = taskData[i].Task.map(x => x.TaskId);
                                                var transactionTask = validRow.filter(u =>
                                                    taskIds.includes(u.TaskId)
                                                );
                                                length = length + taskIds.length;
                                                let selected = false; let disabled = false;
                                                if (taskIds.length == transactionTask.length) {
                                                    selected = true; disabled = true;
                                                }
                                                this.taskDetails.push({ FloorId: taskData[i].FloorId, FloorNm: taskData[i].FloorNm, Task: tasks, selected: selected, disabled: disabled });
                                            }
                                            if (length == validRow.length) {
                                                this.disableCreateButton = true;
                                            }
                                        }
                                        else {
                                            for (var i = 0; i < taskData.length; i++) {
                                                var tasks = taskData[i].Task.map(val => {
                                                    return Object.assign({}, val, this.frequencyDetails.filter(v => v.frequencyId === val.FrequencyId)[0]);
                                                });
                                                this.taskDetails.push({ FloorId: taskData[i].FloorId, FloorNm: taskData[i].FloorNm, Task: tasks });
                                            }
                                        }
                                        this.loadingSymbolForModal = false;
                                    }
                                );
                            }
                            else {
                                this.loadingSymbolForModal = false;
                                this.noTaskMessage = configuration.NoTaskMessage;
                            }
                       
                   
                }
            );
        }
    }

    dismissCreateTaskModal() {
        this.loadingSymbolForModal = false;
        this.vendorId = -1;
        this.facilityId = -1;
        this.towerId = -1;
        this.floorId = -1;
        this.periodDate = null;
        this.createTowerDetails = [];
        this.createFloorDetails = [];
        this.taskDetails = null;
        this.noTaskMessage = "";
        this.disableCreateButton = false;
        this.selectedTaskIds = [];
        this.modalService.dismissAll();
    }

    selectTaskIds(e) {
        debugger;
        if (e.target.checked) {
            if (this.selectedTaskIds != undefined) {
                this.selectedTaskIds.push(+e.target.value);
            }
            else {
                this.selectedTaskIds = [+e.target.value];
            }
        }
        else {
            const index: number = this.selectedTaskIds.indexOf(+e.target.value);
            if (index !== -1) {
                this.selectedTaskIds.splice(index, 1);
            }
        }

    }

    selectAllTaskIds(e) {
        debugger;
        var task = this.taskDetails;
        task = task.filter(x => x.FloorId == e.target.value);
        if (e.target.checked) {
            task[0].Task.filter(x => x.disabled == "" || x.disabled == undefined).forEach(
                x => {
                    x.selected = true;
                    if (this.selectedTaskIds != undefined) {
                        this.selectedTaskIds.push(x.TaskId);
                    }
                    else {
                        this.selectedTaskIds = [x.TaskId];
                    }
                }
            );
            this.selectedTaskIds = Array.from(new Set(this.selectedTaskIds));
        }
        else {
            task[0].Task.filter(x => x.disabled == "" || x.disabled == undefined).forEach(
                x => {
                    x.selected = false;
                    const index: number = this.selectedTaskIds.indexOf(x.TaskId);
                    if (index !== -1) {
                        this.selectedTaskIds.splice(index, 1);
                    }
                }
            );
            this.selectedTaskIds = [];
        }
        //this.selectedTaskIds.push(id);
    }

    saveTask() {
        debugger;
        if (this.selectedTaskIds.length == 0) {
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            modalRef.componentInstance.title = configuration.Mandatory;
            modalRef.componentInstance.message = configuration.TaskSaveValidation;
        }
        else {
            this.confirm(configuration.Confirm, configuration.ConfirmTaskAdd)
                .then((confirmed) => {
                    console.log(confirmed);
                    if (confirmed) {
                        debugger;
                        this.loadingSymbolForModal = true;
                        var date1 = new Date(this.periodDate.year, this.periodDate.month - 1, this.periodDate.day);
                        var transactionDate1 = this.datepipe.transform(date1, 'yyyy-MM-dd');
                        this.taskDataEntryService.getTask(this.selectedTaskIds.toString(), this.vendorId, this.dutyManager, transactionDate1).subscribe(
                            data => {
                                var validRow = data;
                                if (validRow.length != 0) {
                                    const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                    modalRef.componentInstance.title = configuration.Alert;
                                    modalRef.componentInstance.message = configuration.TaskSaveReValidation;
                                    this.loadingSymbolForModal = false;
                                }
                                else {
                                    var date = new Date(this.periodDate.year, this.periodDate.month - 1, this.periodDate.day);
                                    var transactionDate = this.datepipe.transform(date, 'yyyy-MM-dd');
                                    var currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
                                    this.taskDataEntryService.saveTask(this.selectedTaskIds.toString(), this.vendorId, this.dutyManager, transactionDate, this.loggedEnterpriseId, currentDate).subscribe(
                                        data => {
                                            var data = data;
                                            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                            modalRef.componentInstance.title = configuration.Success;
                                            modalRef.componentInstance.message = configuration.SaveMessage;
                                            this.loadingSymbolForModal = false;
                                            this.addTask();
                                            this.getFilteredData();
                                        }
                                    );
                                }
                            }
                        );
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

    clearTask() {
        this.selectedTaskIds = [];
        this.taskDetails.forEach(
            x => {
                x.selected = false;
                x.Task.filter(x => x.disabled == "" || x.disabled == undefined).forEach(
                    y => { y.selected = false; }
                )
            }
        );
    }

    //#endregion

    search = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            //tap(() => this.searching = true),
            switchMap(term => term.trim().length < 3 ? []
                : this.taskDataEntryService.searchTask(term.trim(), this.facilityDetails.map(x => x.facilityId).toString()).pipe(
                    //tap(() => this.searchFailed = false),
                    catchError(() => {
                        //this.searchFailed = true;
                        return of([]);
                    }))
            ),
            //tap(() => this.searching = false)
        )
}


