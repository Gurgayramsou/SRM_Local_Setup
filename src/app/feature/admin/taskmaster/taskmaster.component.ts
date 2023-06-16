import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../core/services/DataService';
import {
    CountryMaster, CityMaster, FacilityMaster, TowerMaster, FloorMaster, TrafficMaster,
    FrequencyMaster, FilterDetails, FacilityCityCountryMaster, FacilityAliasMaster, MonthYear
} from '../../../core/services/Data';
import { PagerService } from '../../../core/services/PagerService';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { TaskMasterService } from '../../../core/services/TaskMasterService';
import {ScoreService} from '../../../core/services/ScoreService';
import {forkJoin, of} from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap, switchMap, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { configuration } from '../../../../config/configuration';
import { ExcelFileService } from '../../../core/services/ExcelFileService';
import { NgbDateStruct, NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'rebar-taskmaster',
    templateUrl: './taskmaster.html',
    styleUrls: ['./taskmaster.css']
})

export class TaskMasterComponent implements OnInit {
    message = 'Task Master';

    constructor(private dataService: DataService, private pagerService: PagerService, private taskMasterService: TaskMasterService,
        private modalService: NgbModal, private excelService: ExcelFileService,private scoreService:ScoreService) {
        this.pageSize = this.selectedPageSize;
        if (location.href.toLocaleLowerCase().indexOf("local") != -1) {
            this.enterPriseId = 'himanshu.bisht';
        }
        else {
            this.enterPriseId = sessionStorage["LoggedinUser"];
        }
    }

    //#region Main page Property

    //paging proprty
    pager: any = {};
    count: number = 0;
    pageNumber: number = this.pagerService.pageNumber;
    pageSize: number = this.pagerService.pageSize;

    //pagingoption property
    pageOptions = this.pagerService.pageOptions;
    selectedPageSize: number = this.pagerService.selectedPageSize;
    //loading property
    loadingSymbolForModal: boolean = false;
    loadingSymbol: boolean = true;
    //sorting property
    sortColumn: string = "CreatedBy";
    sortDirection: string = "desc";
    defaultSort: boolean = true;

    //filter property
    filterCount: number = 5;
    showMoreText: string = "Show More";
    showLessText: string = "Show Less";
    taskcd: string = "Auto Generated";
    taskMasterData: any = null;
    taskMasterDataDisplay: any = null;
    enterPriseId: string = 'y.narendra.venkata';
    public countryDetails: CountryMaster[];
    public cityDetails: CityMaster[];
    public facilityDetails: FacilityMaster[];
    public towerDetails: TowerMaster[];
    public floorDetails: FloorMaster[];
    public trafficDetails: TrafficMaster[];
    public frequencyDetails: FrequencyMaster[];
    public workingType: any = ["Encapulisation", "Vaccuming", "Hot Water Extraction"];
    public facilityCityCountryDetails: FacilityCityCountryMaster[];
    public facilityAliasDetails: FacilityAliasMaster[];
    selectedTaskIds: any[];

    //#endregion
    public frequencyDetailsForGrid: any;


    //#region Filter Property

    //property used to toggle the filter
    public showCountry: boolean = false;
    public showCity: boolean = false;
    public showFacility: boolean = false;
    public showTraffic: boolean = false;
    public showFrequency: boolean = false;
    public enableClearAll: boolean = false;
    public showUniqueId: boolean = false;
    public uniqueId: string = "";
    //property used to toggle the show more filter details
    public showMoreCountry: string = this.showMoreText;
    public showMoreCity: string = this.showMoreText;
    public showMoreFacility: string = this.showMoreText;
    public showMoreTraffic: string = this.showMoreText;
    public showMoreFrequency: string = this.showMoreText;

    //property used to show count of filter
    public countryCount: number = this.filterCount;
    public cityCount: number = this.filterCount;
    public facilityCount: number = this.filterCount;
    public trafficCount: number = this.filterCount;
    public frequencyCount: number = this.filterCount;


    //property used to store the selcted filter values
    public filteredArray: FilterDetails[];
    public selectedCountryIds: Array<number>;
    public selectedCityIds: Array<number>;
    public selectedFacilityIds: Array<number>;
    public selectedTrafficIds: Array<number>;
    public selectedFrequencyIds: Array<number>;

    //#endregion
    MandatoryMessage: string = "Please fill the mandatory fields.";
    OlaSaved: string = "Ola saves successfully";
    Mandatory: string = 'Mandatory';
    Success: string = 'Success';
    Information: string = 'Alert';
    Failure: string = 'Failure';

    //#region Filter Methods

    ////#region Main Page
    fullAccess: boolean = true;
    noAccessMessage: string = configuration.NoAccessMessage;
    ////#endregion

    //#region method used to toggle the filter
    toggleUniqueId() {
        this.showUniqueId = !this.showUniqueId;
    }
    toggleCountry() {
        this.showCountry = !this.showCountry;
    }
    toggleCity() {
        this.showCity = !this.showCity;
    }
    toggleFacility() {
        this.showFacility = !this.showFacility;
    }
    toggleTraffic() {
        this.showTraffic = !this.showTraffic;
    }
    toggleFrequency() {
        this.showFrequency = !this.showFrequency;
    }
    //#endregion

    //#region method used to toggle the show more filter details and filter count
    displayMoreCountry() {
        this.showMoreCountry = this.showMoreCountry == this.showMoreText ? this.showLessText : this.showMoreText;
        this.countryCount = this.showMoreCountry == this.showMoreText ? this.filterCount : this.countryDetails.length;
    }

    displayMoreCity() {
        this.showMoreCity = this.showMoreCity == this.showMoreText ? this.showLessText : this.showMoreText;
        this.cityCount = this.showMoreCity == this.showMoreText ? this.filterCount : this.cityDetails.length;
    }

    displayMoreFacility() {
        this.showMoreFacility = this.showMoreFacility == this.showMoreText ? this.showLessText : this.showMoreText;
        this.facilityCount = this.showMoreFacility == this.showMoreText ? this.filterCount : this.facilityDetails.length;
    }

    displayMoreTraffic() {
        this.showMoreTraffic = this.showMoreTraffic == this.showMoreText ? this.showLessText : this.showMoreText;
        this.trafficCount = this.showMoreTraffic == this.showMoreText ? this.filterCount : this.trafficDetails.length;
    }

    displayMoreFrequency() {
        this.showMoreFrequency = this.showMoreFrequency == this.showMoreText ? this.showLessText : this.showMoreText;
        this.frequencyCount = this.showMoreFrequency == this.showMoreText ? this.filterCount : this.frequencyDetails.length;
    }
    //#endregion

    //#region clear filter selection
    //method to clear all the selected filters
    clearAllFilter() {
        this.filteredArray = [];
        this.uniqueId = "";
        this.selectedCountryIds = [];
        this.selectedCityIds = [];
        this.selectedFacilityIds = [];
        this.selectedTrafficIds = [];
        this.selectedFrequencyIds = [];
        this.countryDetails.forEach(
            x => { x.selected = false; }
        );
        this.cityDetails.forEach(
            x => { x.selected = false; }
        );
        this.facilityDetails.forEach(
            x => { x.selected = false; }
        );
        this.trafficDetails.forEach(
            x => { x.selected = false; }
        );
        this.frequencyDetails.forEach(
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
            this.uniqueId = "";
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.text == e.text);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            if (e.filterName == "country") {
                const indexCountry: number = this.selectedCountryIds.indexOf(e.value);
                if (index !== -1) {
                    this.selectedCountryIds.splice(indexCountry, 1);
                    this.countryDetails[this.countryDetails.findIndex(item => item.countryId == e.value)].selected = false;
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
            else if (e.filterName == "traffic") {
                const indexTraffic: number = this.selectedTrafficIds.indexOf(e.value);
                if (index !== -1) {
                    this.selectedTrafficIds.splice(indexTraffic, 1);
                    this.trafficDetails[this.trafficDetails.findIndex(item => item.trafficId == e.value)].selected = false;
                }
            }
            else if (e.filterName == "frequency") {
                const indexFrequency: number = this.selectedFrequencyIds.indexOf(e.value);
                if (index !== -1) {
                    this.selectedFrequencyIds.splice(indexFrequency, 1);
                    this.frequencyDetails[this.frequencyDetails.findIndex(item => item.frequencyId == e.value)].selected = false;
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
        this.uniqueId = e.item;
        //input.value = '';        
        this.getFilteredData();
    }

    searchUniqueId() {
        if (this.uniqueId.trim() != "") {
            const index: number = this.filteredArray != undefined ? this.filteredArray.findIndex(item => item.filterName == "uniqueId") : -1;
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ value: -1, text: this.uniqueId.trim(), filterName: "uniqueId" });
            }
            else {
                this.filteredArray = [{ value: -1, text: this.uniqueId.trim(), filterName: "uniqueId" }]
            }       
            this.getFilteredData();
        }
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

    search = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            //tap(() => this.searching = true),
            switchMap(term =>
                this.taskMasterService.searchTask(term.trim()).pipe(
                    //tap(() => this.searchFailed = false),
                    catchError(() => {
                        //this.searchFailed = true;
                        return of([]);
                    }))
            ),
            //tap(() => this.searching = false)
        )
    //#endregion

    //#endregion
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

    ngOnInit() {
        this.dataService.CheckAdminRoleAccessForPages(this.enterPriseId, location.pathname).subscribe(
            data => {
                if (data.length != 0) {
                    this.loadingSymbol = true;
                    this.dataService.getCountryDetails().subscribe(
                        data => {
                            if (data != null && data.length > 0) {
                                this.countryDetails = data;
                            }
                        }
                    );
                    this.dataService.getCityDetails().subscribe(
                        data => {
                            if (data != null && data.length > 0) {
                                this.cityDetails = data;
                            }
                        }
                    );
                    // this.dataService.getFacilityDetails().subscribe(
                    //     data => {
                    //         if (data != null && data.length > 0) {
                    //             this.facilityDetails = data;
                    //         }
                    //     }
                    // );
                    this.dataService.getTrafficDetails().subscribe(
                        data => {
                            if (data != null && data.length > 0) {
                                this.trafficDetails = data;
                            }
                        }
                    );
                    this.GetGridDetails();
                    // this.dataService.getFrequencyDetails().subscribe(
                    //     data => {
                    //         if (data != null && data.length > 0) {
                    //             this.frequencyDetails = data;
                    //         }

                    //     }
                    // );
                }
                else {
                    this.loadingSymbol = false;
                    this.fullAccess = false;
                }

            });

        this.dataService.FacilityCityCountryDetails().subscribe(
            data => {
                this.facilityCityCountryDetails = data;
            }
        );
        this.dataService.FacilityAliasDetails().subscribe(
            data => {
                this.facilityAliasDetails = data;
            }
        );
    }
    
    MapTask(){
        var insertTaskIds =[];
        if(this.selectedTaskIds!=undefined && this.selectedTaskIds.length>0){
        this.loadingSymbolForModal=true;
        
        var message = 'Do you want to Save the Task?';
        this.confirm(configuration.Confirm, message).then((confirmed) =>{
            if(confirmed){
            this.taskMasterService.CheckTaskYearMonthMappingExists(this.activefacilityId,this.activeTowerId,this.activeFloorId,this.periodDate.getMonth()+1,this.periodDate.getFullYear()).subscribe(
                data=>{
                    debugger
                    for(var i=0;i<this.selectedTaskIds.length;i++){
                       let id=data.filter(x=>x.TaskId==this.selectedTaskIds[i]).length;
                       if(id==0){
                           insertTaskIds.push(this.selectedTaskIds[i])
                       }
                    }
                    if(insertTaskIds!=undefined && insertTaskIds.length>0){
                        this.taskMasterService.MapTask(this.selectedTaskIds,this.periodDate.getMonth()+1,this.periodDate.getFullYear()).subscribe(
                            data=>{
                                this.selectedTaskIds=[];
                                this.addTask();
                                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                modalRef.componentInstance.message = "Task saved successfully.";
                                modalRef.componentInstance.title = this.Success;
                                return;
                            }
                        )
                    }
                }
            )   
         }     
         else{
             this.loadingSymbolForModal=false;
         }  
        }).catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
    }
    else{
        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                modalRef.componentInstance.message = this.MandatoryMessage;
                modalRef.componentInstance.title = this.Mandatory;
                return;
    }
        
    }
    selectAllTaskIds(e) {
        debugger;
        var task = this.activetaskdetails;
       // task = task.filter(x => x.FloorId == e.target.value);
        if (e.target.checked) {
            task.filter(x=>x.disable==false ).forEach(
                x => {
                    x.selected = true;
                    if (this.selectedTaskIds != undefined) {
                        this.selectedTaskIds.push(x.taskId);
                    }
                    else {
                        this.selectedTaskIds = [x.taskId];
                    }
                }
            );
            this.selectedTaskIds = Array.from(new Set(this.selectedTaskIds));
        }
        else {
            task.filter(x=>x.disable==false ).forEach(
                x => {
                    x.selected = false;
                    const index: number = this.selectedTaskIds.indexOf(x.taskId);
                    if (index !== -1) {
                        this.selectedTaskIds.splice(index, 1);
                    }
                }
            );
            this.selectedTaskIds = [];
        }
        //this.selectedTaskIds.push(id);
    }
    public GetGridDetails(): void {
        let frequencyGridDetails = this.dataService.getFrequencyDetails();
        let facilityDetails = this.dataService.getFacilityAliasDetails();
        let taskDetails = this.taskMasterService.getTaskMasterData(this.pageNumber, this.sortColumn, this.sortDirection, this.pageSize);
        forkJoin([frequencyGridDetails, taskDetails, facilityDetails]).subscribe(results => {
            let frequencies = results[0];
            let gridDetails = results[1];
            let facilities = results[2];
            this.frequencyDetails = frequencies;
            this.frequencyDetailsForGrid = frequencies;
            this.taskMasterData = gridDetails;
            this.facilityDetails = facilities;
            if (this.taskMasterData != null) {
                this.count = this.taskMasterData[1][0].TotalRecordCount;
                this.setPager();
            }
        });
    }

    //#region Grid Data

    //Called this method to get filtered data
    public getFilteredData(): void {
        debugger;
        this.loadingSymbol = true;
        let length: number = this.filteredArray != null ? this.filteredArray.length : 0;
        if (length == 0 && (this.uniqueId == "" || this.uniqueId == undefined)) {
            this.enableClearAll = false;
            this.GetGridDetails();
        } else {
            this.enableClearAll = true;
            console.log()
            let faiclityId = this.selectedCountryIds != undefined ? this.facilityCityCountryDetails.filter(x => this.selectedCountryIds.includes(x.CountryId)).map(x => x.FacilityId) : [-1];
            let faiclityId1 = this.selectedCityIds != undefined ? this.facilityCityCountryDetails.filter(x => this.selectedCityIds.includes(x.CityId)).map(x => x.FacilityId) : [-1];
            console.log('site under facility '+ faiclityId1);
            console.log('country under facility '+ faiclityId);
           // console.log('site under facility '+ faiclityId1);
            var bulkfacilityIds = "";
            if (faiclityId1[0] != -1 && faiclityId1.length >= 1) {
                bulkfacilityIds = this.facilityAliasDetails.filter(x => faiclityId1.includes(x.FacilityId)).map(x=>x.FacilityAliasId).toString();
            }
            else if (faiclityId[0] != -1 && faiclityId.length >= 1) {
                bulkfacilityIds = this.facilityAliasDetails.filter(x => faiclityId.includes(x.FacilityId)).map(x=>x.FacilityAliasId).toString();
            }
            console.log(bulkfacilityIds);
            let frequencyFilterDetails = this.dataService.getFrequencyDetails();
            let taskDetails = this.taskMasterService.getTaskMasterDataByFilter(this.selectedCountryIds, this.selectedCityIds, this.selectedFacilityIds
                , this.selectedTrafficIds, this.selectedFrequencyIds, this.pageNumber, this.sortColumn, this.sortDirection
                , this.pageSize, this.uniqueId, bulkfacilityIds);
                forkJoin([frequencyFilterDetails, taskDetails]).subscribe(results => {
                let frequencies = results[0];
                let gridDetails = results[1];
                this.frequencyDetailsForGrid = frequencies;
                this.taskMasterData = gridDetails;
                if (this.taskMasterData != null) {
                    this.count = this.taskMasterData[1][0].TotalRecordCount;
                    this.setPager();
                }
            });
            // this.taskMasterService.getTaskMasterDataByFilter(this.selectedCountryIds, this.selectedCityIds, this.selectedFacilityIds, this.selectedTrafficIds
            //     , this.selectedFrequencyIds, this.pageNumber, this.sortColumn, this.sortDirection, this.pageSize).subscribe(
            //         data => {
            //             this.taskMasterData = data;
            //             if (this.taskMasterData != null) {
            //                 this.count = this.taskMasterData[1][0].TotalRecordCount;
            //             }
            //             this.setPager();
            //         }
            //     );
        }
    }

    public inputValidator(event: any) {
        if (event.target.value == "" || event.target.value == ".") {
            this.txtArea = "";
        }
    }
    createTowerDetails: any;
    createFloorDetails: any;
    createFacilitydetails:any;
    onCreateFacilityChange() {
        debugger;
        this.activeTowerId = -1;
        this.createTowerDetails = [];
        this.activeFloorId = -1;
        this.createFloorDetails = [];
       // this.vendorId = -1;
        //this.createVendorDetails = [];
        if (this.activefacilityId !== -1) {
            this.loadingSymbolForModal = true;
            this.dataService.getTowerDetailsByFacilityId(this.activefacilityId).subscribe(
                data => {
                    this.createTowerDetails = data;
                    console.log(this.createTowerDetails);
                    this.loadingSymbolForModal = false;
                }
            );
            // let packageIds = Array.from(new Set(this.packageIdsForTask.map(x => x.PackageId)));
            // let vendorIds = Array.from(new Set(this.packageFacilityVendorDetails
            //     .filter(x => x.FacilityAliasId == this.facilityId && packageIds.includes(x.PackageId))
            //     .map(x => x.ServiceProviderId)));
            // this.createVendorDetails = this.vendorDetails.filter(x=>vendorIds.includes(x.vendorId));
        }
    }
    //public inputValidatorLocation(event:any){
    //    if(event.target.value == "" || event.target.value == "."){
    //        this.txtLocation = "";
    //    } 
    //}

    setPager() {
        debugger;
       this.pager = this.pagerService.getPager(this.count, this.pageNumber, this.pageSize);
        this.taskMasterDataDisplay = this.taskMasterData[0];
        const gridDetails = this.taskMasterDataDisplay;
        const frequencyDetails = this.frequencyDetailsForGrid;
        const result1 = gridDetails.map(val => {
            return Object.assign({}, val, frequencyDetails.filter(v => v.frequencyId === val.FrequencyId)[0]
                , this.facilityDetails.filter(v => v.facilityId === val.FacilityId)[0])
        });
        this.taskMasterDataDisplay = result1;
        console.log(this.taskMasterDataDisplay);
        this.taskMasterDataDisplay.forEach((x) => {
            var dt=new Date(x.UpdatedOn);
                dt.setHours(dt.getHours()-5);
                dt.setMinutes(dt.getMinutes()-30);
            x.UpdatedOn=new Date(dt).toUTCString();
        });
        //console.log(JSON.stringify(this.taskMasterDataDisplay));
        this.loadingSymbol = false;
    }

    exportAsXLSX(): void {
        this.loadingSymbol = true;
        this.taskMasterService.downloadTaskMasterData().subscribe(
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

    //Called this method on sorting
    sorting(sortColumn: string) {
        debugger;
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


    //#region Create Task Master Pop up

    //property used for Create Modal
    txtUniqueId: string = null;
    trafficId: number = -1;
    countryId: number = -1;
    cityId: number = -1;
    facilityId: number = -1;
    towerId: number = -1;
    floorId: number = -1;
    frequencyId: number = -1;
    txtLocation: string = "";
    txtWorkType: string = "";
    txtArea: string = "";
    taskIdIncrement: number = 1;
    activeTowerId=-1;
    activeFloorId=-1;
    activefacilityId=-1;
    countryDetailsCreate: CountryMaster[];
    cityDetialsCreate: CityMaster[];
    facilityDetailsCreate: FacilityMaster[];
    towerDetailsCreate: TowerMaster[];
    floorDetailsCreate: FloorMaster[];
    datedetails:any[];
    trafficDetailsCreate: TrafficMaster[];
    frequencyDetailsCreate: FrequencyMaster[];
    periodDate:Date;

    opanCreateModal(createTaskMasterModal) {
        this.countryDetailsCreate = this.countryDetails;
        this.trafficDetailsCreate = this.trafficDetails;
        this.frequencyDetailsCreate = this.frequencyDetails;
        this.ClearTaskDetails();
        this.modalService.open(createTaskMasterModal, { backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });

    }
    openActivte(createTaskModal) {
        this.createFacilitydetails = this.facilityDetails;
        // this.trafficDetailsCreate = this.trafficDetails;
        // this.frequencyDetailsCreate = this.frequencyDetails;
        // this.ClearTaskDetails();
        this.modalService.open(createTaskModal, { backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });

    }
    clearSelection(){
        this.activefacilityId=-1;
        this.activeTowerId=-1;
        this.activeFloorId=-1;
        this.periodDate=null;
        this.activetaskdetails=null;
        this.SelectedDate=-1;
    }
    clearTask(){
        this.selectedTaskIds = [];
        this.activeall=this.Activedisable==true?true:false;
        this.activetaskdetails.filter(x=>x.disable==false).forEach(
            x => {
                x.selected = false;
                const index: number = this.selectedTaskIds.indexOf(x.TaskId);
                if (index !== -1) {
                    this.selectedTaskIds.splice(index, 1);
                }
            }
        );
    }
    activetaskdetails:any[];
    
    Activedisable:boolean;
    activeall:boolean;
    previosMonthData:boolean=false;
    addTask(){
        debugger;
        this.activetaskdetails=null;
        this.selectedTaskIds=[];
        if(this.activefacilityId !=-1 && this.activeTowerId!=-1 && this.activeFloorId!=-1 && this.SelectedDate!=-1)
            {      
                this.loadingSymbolForModal=true;
                   this.activeall=false;
                    this.taskMasterService.getActivetask(this.activefacilityId,this.activeTowerId,this.activeFloorId,this.periodDate.getMonth()+1,this.periodDate.getFullYear()).subscribe(
                        data=>{
                        this.activetaskdetails=data;
                        var today=new Date()
                       this.previosMonthData = today.getFullYear() <= this.periodDate.getFullYear() && today.getMonth()>=this.periodDate.getMonth()?true:false;
                        const frequencyDetails = this.frequencyDetailsForGrid;
                                this.activetaskdetails=this.activetaskdetails.map(val => {
                                    return Object.assign({}, val, frequencyDetails.filter(v => v.frequencyId === val.FrequencyId)[0]
                                        , this.facilityDetails.filter(v => v.facilityId === val.FacilityId)[0])
                                });;
                        this.taskMasterService.CheckTaskYearMonthMappingExists(this.activefacilityId,this.activeTowerId,this.activeFloorId,this.periodDate.getMonth()+1,this.periodDate.getFullYear()).subscribe(
                            data=>{ 
                                debugger;
                                for(var i=0;i<this.activetaskdetails.length;i++){
                                var selected = data.filter(x=>x.TaskId==this.activetaskdetails[i].taskId);
                                    if(selected.length>0){
                                        this.activetaskdetails[i].selected=true;
                                        this.activetaskdetails[i].disable=true;
                                    }
                                    else{
                                        this.activetaskdetails[i].selected=false
                                        this.activetaskdetails[i].disable=false;
                                    }
                                }
                                this.Activedisable=this.activetaskdetails.filter(x=>x.disable==false).length==0?true:false;
                                 if(this.previosMonthData){
                                     debugger;
                                 this.activetaskdetails=this.activetaskdetails.filter(x=>x.disable==true);
                                 }
                                if(this.Activedisable){
                                    this.activeall=true;
                                }
                                
                                this.loadingSymbolForModal=false;
                                console.log(this.activetaskdetails)
                            }
                        )
                        }
                    )
            }
            else{
                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                modalRef.componentInstance.message = this.MandatoryMessage;
                modalRef.componentInstance.title = this.Mandatory;
                return;
            }
    }
    onCreateTowerChange() {
        this.activeFloorId = -1;
        this.createFloorDetails = [];
        this.SelectedDate=-1;
        this.datedetails=null;
        if (this.activeTowerId !== -1) {
            this.loadingSymbolForModal = true;
            this.dataService.getFloorDetailsByTowerId(this.activeTowerId, this.activefacilityId).subscribe(
                data => {
                    this.createFloorDetails = data;
                    this.loadingSymbolForModal = false;
                }
            );
        }
    }
    createTaskDetailsMasterModal() {
        debugger;
        if (this.facilityId == -1 || this.cityId == -1 || this.towerId == -1 || this.frequencyId == -1 || this.trafficId == -1 || this.countryId == -1 || this.txtArea == null || this.txtArea == undefined || this.txtLocation == ""
            || this.txtWorkType == "" || this.floorId == -1 || this.txtWorkType == "-1" || this.txtArea == "") {
            //alert("Please select all mandatory fileds.");
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            modalRef.componentInstance.message = this.MandatoryMessage;
            modalRef.componentInstance.title = this.Mandatory;
            return;
        }
        else {
            if (Number(this.txtArea) == 0) {
                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                modalRef.componentInstance.message = configuration.AreaZero;
                modalRef.componentInstance.title = this.Information;
                return;
            }
            else {
                this.loadingSymbolForModal = true;
                debugger;
                this.taskMasterService.CheckForDuplicateTasks(this.facilityId, this.towerId, this.floorId, this.txtLocation, this.txtWorkType, this.trafficId, this.frequencyId).subscribe(
                   
                    data => {
                        if (data != null && data.length > 0) {
                            if (data[0].totalCount > 0) {
                                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });

                                modalRef.componentInstance.message = "Task already created.";
                                modalRef.componentInstance.title = this.Information;
                                this.loadingSymbolForModal = false;
                                return;
                            }
                            else {
                                debugger;
                                this.taskMasterService.GetTaskIdForTaskCdCreation(this.facilityId).subscribe(
                                    data => {
                                        if (data != null && data.length > 0) {
                                            debugger;
                                            this.taskIdIncrement = data[0].totalCount + 1;
                                            console.log(data[0]);
                                            this.taskCdGeneration();
                                            this.TaskCreation();
                                        }
                                    });
                            }
                        }

                    }
                );
            }

        }
    }
    ClearTaskDetails() {
        this.facilityDetailsCreate = null;
        this.towerDetailsCreate = null;
        this.cityDetialsCreate = null;
        this.floorDetailsCreate = null;
        this.txtArea = "";
        this.txtLocation = "";
        this.txtWorkType = "-1";
        this.txtUniqueId = "";
        this.frequencyId = -1;
        this.trafficId = -1;
        this.countryId = -1;
        this.cityId = -1;
        this.floorId = -1;
        this.facilityId = -1;
        this.towerId = -1;
        this.selectedTaskIds=null;
    


    }
    public taskCdGeneration(): void {
        debugger;
        const facilityName = this.facilityDetailsCreate.find(x => x.facilityId == this.facilityId).facilityName;
        const towerDetails: any = this.towerDetailsCreate;
        const floorDetails: any = this.floorDetailsCreate;
        const towerCd = towerDetails.find(x => x.TowerId == this.towerId).towerName;
        const floorCd = floorDetails.find(x => x.FloorId == this.floorId).floorName;
        const type = this.txtWorkType[0];
        if (this.taskIdIncrement < 10) {
            this.txtUniqueId = facilityName + towerCd + floorCd + '000' + this.taskIdIncrement + type;
        }
        else if (this.taskIdIncrement < 100) {
            this.txtUniqueId = facilityName + towerCd + floorCd + '00' + this.taskIdIncrement + type;
        }
        else if (this.taskIdIncrement < 1000) {
            this.txtUniqueId = facilityName + towerCd + floorCd + '0' + this.taskIdIncrement + type;
        }
        else {
            this.txtUniqueId = facilityName + towerCd + floorCd + this.taskIdIncrement + type;
        }
    }

    public TaskCreation(): void {
        this.taskMasterService.saveTaskMasterData(this.facilityId, this.cityId, this.countryId, this.txtUniqueId, this.trafficId, this.towerId, this.floorId, this.txtLocation, this.frequencyId, this.txtWorkType, this.txtArea, this.enterPriseId).subscribe(
            data => {
                if (data != null) {
                    this.loadingSymbolForModal = false;
                    this.getFilteredData();
                    this.ClearTaskDetails();
                    this.modalService.dismissAll();
                    const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                    modalRef.componentInstance.message = "Task saved successfully.";
                    modalRef.componentInstance.title = this.Success;
                    return;

                }
            });
    }
    onCountryChange() {
        this.loadingSymbolForModal = true;
        this.cityId = -1;
        this.facilityId = -1;
        this.towerId = -1;
        this.floorId = -1;
        this.cityDetialsCreate = null;
        this.facilityDetailsCreate = null;
        this.towerDetailsCreate = null;
        this.floorDetailsCreate = null;
        this.SelectedDate=-1;
        this.datedetails=null;
        let cityIds = Array.from(new Set(this.facilityCityCountryDetails.filter(x => x.CountryId == this.countryId).map(function (city) {
            return city.CityId;
        })));
        var cityDetails = [];
        for (var i = 0; i < cityIds.length; i++) {
            var CityId = this.facilityCityCountryDetails.find(x => x.CityId == cityIds[i]).CityId;
            var CityName = this.facilityCityCountryDetails.find(x => x.CityId == cityIds[i]).CityName;
            cityDetails.push({ cityId: CityId, cityName: CityName, selected: false });
        }
        this.cityDetialsCreate = cityDetails;
        this.loadingSymbolForModal = false;
        // this.dataService.getCityDetailsByCountryId(this.countryId).subscribe(
        //     data => {
        //         this.loadingSymbolForModal = false;
        //         this.cityDetialsCreate = data;
        //     }
        // );
    }

    onCityChange() {
        debugger;
        this.loadingSymbolForModal = true;
        this.facilityId = -1;
        this.towerId = -1;
        this.floorId = -1;
        this.facilityDetailsCreate = null;
        this.towerDetailsCreate = null;
        this.floorDetailsCreate = null;
        let facilityIds = this.facilityCityCountryDetails.filter(x => x.CityId == this.cityId).map(x => x.FacilityId);
        this.facilityDetailsCreate = this.facilityAliasDetails.filter(x => facilityIds.includes(x.FacilityId)).map(function (facility) {
            return { facilityId: facility.FacilityAliasId, facilityName: facility.FacilityAliasName, selected: false };
        });
        this.loadingSymbolForModal = false;
        // this.dataService.getFacilityDetailsByCityId(this.cityId).subscribe(
        //     data => {
        //         this.loadingSymbolForModal = false;
        //         this.facilityDetailsCreate = data;
        //     }
        // );
    }

    onFacilityChange() {
        this.loadingSymbolForModal = true;
        this.towerId = -1;
        this.floorId = -1;
        this.towerDetailsCreate = null;
        this.floorDetailsCreate = null;
        this.dataService.getTowerDetailsByFacilityId(this.facilityId).subscribe(
            data => {
                this.loadingSymbolForModal = false;
                this.towerDetailsCreate = data;
            }
        );
    }
    
    onTowerChange() {
        this.floorId = -1;
        this.floorDetailsCreate = null;
        this.loadingSymbolForModal = true;
        this.dataService.getFloorDetailsByTowerId(this.towerId, this.facilityId).subscribe(
            data => {
                this.loadingSymbolForModal = false;
                this.floorDetailsCreate = data;
            }
        );
    }
    SelectedDate=-1;
    onfloorchange(){
        this.SelectedDate=-1;
        this.datedetails=null
        this.loadingSymbolForModal=true;
        this.scoreService.getMonthYear().subscribe(
            data=>{
                debugger;
                this.datedetails=data;
                this.loadingSymbolForModal = false;
            }
        )
    }
    onDatechange(){
        debugger;
        this.loadingSymbolForModal=true;
        if(this.SelectedDate!=-1){
        var selected=this.datedetails.filter(x=>x.FrequencySLAId==this.SelectedDate)[0].StartDate;
        console.log(selected)
        this.periodDate=new Date(selected);
        this.loadingSymbolForModal=false;}
        else{
            this.periodDate=null;
            this.loadingSymbolForModal=false;
        }
    }

    dismissCreateTaskMasterModal() {
        this.modalService.dismissAll();
        this.clearSelection();
       // this.clearTask()
    }
    //#endregion
    deleteTask(taskId: number) {
        this.loadingSymbol = true;
        this.taskMasterService.deleteTask(taskId, this.enterPriseId).subscribe(
            data => {
                if (data != null) {
                    if (data.affectedRows == 1) {
                        this.getFilteredData();
                        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                        modalRef.componentInstance.message = "Task deleted successfully.";
                        modalRef.componentInstance.title = this.Success;
                        return;
                    }
                }
            }
        );

    }
    public confirm(title: string, message: string): Promise<boolean> {
        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.message = message;
        return modalRef.result;
    }
    //#region View Task Master Pop up

    viewObjcet: any = [];
    viewTaskMaster(viewTaskMasterModal, taskId) {
        debugger;
        this.loadingSymbol = true;
        let frequencyViewDetails = this.dataService.getFrequencyDetails();
        let taskViewDetails = this.taskMasterService.GetTaskDetailsForViewMode(taskId);
        forkJoin([frequencyViewDetails, taskViewDetails]).subscribe(results => {
            let frequencies = results[0];
            let viewDetails = results[1];
            let infraDetais = this.facilityAliasDetails.map(val => {
                return Object.assign({}, val, this.facilityCityCountryDetails.filter(v => v.FacilityId === val.FacilityId)[0]);
            });
            const result1 = viewDetails.map(val => {
                return Object.assign({}, val, frequencies.filter(v => v.frequencyId === val.FrequencyId)[0],
                    infraDetais.filter(v => v.FacilityAliasId === val.FacilityId)[0]);
            });
            this.viewObjcet = result1;
            this.loadingSymbol = false;
            this.modalService.open(viewTaskMasterModal, { backdropClass: 'light-blue-backdrop', backdrop: 'static', keyboard: false });
        });
    }
    dismissViewTaskMasterModal() {
        this.viewObjcet = [];
        this.modalService.dismissAll();
    }
    //#endregion

}


