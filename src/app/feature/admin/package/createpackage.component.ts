import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataService } from '../../../core/services/DataService';
import { FacilityMaster, FrequencyMaster, PackageTypeMaster, FunctionMaster, FilterDetails, FunctionData, StatusMaster } from '../../../core/services/Data';
import { PagerService } from '../../../core/services/PagerService';
import { NgbModal, NgbActiveModal, NgbCalendar, NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { PackageService } from '../../../core/services/PackageService';
import { ScoreService } from '../../../core/services/ScoreService';
import { forkJoin } from "rxjs";
import * as $ from 'jquery';
//import { elementStyleProp } from '@angular/core/src/render3';
import { DatePipe } from '@angular/common';
import { configuration } from '../../../../config/configuration';

@Component({
    selector: 'rebar-createpackage',
    templateUrl: './createpackage.html',
    styleUrls: ['./createpackage.css']
})

export class CreatePackageComponent implements OnInit {
    message = 'Create Package';

    constructor(private dataService: DataService, private pagerService: PagerService, private packageService: PackageService, private scoreService: ScoreService,
        private modalService: NgbModal, private cdRef: ChangeDetectorRef, private calendar: NgbCalendar, private datepipe: DatePipe) {
        console.log('create package');
            this.pageSize = this.selectedPageSize;
        if (location.href.toLocaleLowerCase().indexOf("local") != -1) {
            this.enterprisedId = 'y.narendra.venkata';
        }
        else {
            this.enterprisedId = sessionStorage["LoggedinUser"];
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

    //sorting property
    sortColumn: string = "packageType";
    sortDirection: string = "asc";
    defaultSort: boolean = true;

    //filter property
    filterCount: number = 5;
    showMoreText: string = "Show More";
    showLessText: string = "Show Less";
    loadingSymbolForModal: boolean = false;
    loadingSymbol: boolean = true;
    packageData: any = null;
    packageDataDisplay: any = null;
    optionalOla: boolean = true;
    modalTitleName: string = "";
    modalFunctionName: string = "";
    functionSaving: boolean = false;
    public showDate: boolean = false;

    //property used to store filter data
    public packageTypeDetails: PackageTypeMaster[];
    public functionDetails: FunctionMaster[];
    public functionDetailsByPackageId: any;
    public frequencyDetails: FrequencyMaster[];
    public statusDetails: StatusMaster[];
    //#endregion


    //#region Filter Property    

    //property used to toggle the filter
    public showPackageType: boolean = false;
    public showFunction: boolean = false;
    public showFrequency: boolean = false;
    public enableClearAll: boolean = false;
    public functionToggle: boolean = true;
    public toggleOla: boolean = false;

    //property used to toggle the show more filter details
    public showMorePackageType: string = this.showMoreText;
    public showMoreFunction: string = this.showMoreText;
    public showMoreFrequency: string = this.showMoreText;

    //property used to show count of filter
    public packageTypeCount: number = this.filterCount;
    public functionCount: number = this.filterCount;
    public frequencyCount: number = this.filterCount;

    //property used to store the selcted filter values
    public filteredArray: FilterDetails[];
    public selectedPackageTypeIds: Array<number>;
    public selectedFunctionIds: Array<number>;
    public selectedFrequencyIds: Array<number>;

    //#endregion
    public enterprisedId: string = sessionStorage["LoggedinUser"];
    public selectedDate: NgbDateStruct;
    public selectedDatetoday = this.calendar.getToday();
    today = this.calendar.getToday();

    //#region Filter Methods

    //#region method used to toggle the filter
    togglePackageType() {
        this.showPackageType = !this.showPackageType;
    }
    toggleFunction() {
        this.showFunction = !this.showFunction;
    }
    toggleFrequency() {
        this.showFrequency = !this.showFrequency;
    }
    toggleFunctionDetails() {
        //this.functionToggle = !this.functionToggle;
        this.toggleOla = false;
    }
    toggleOlaDetails() {
        this.toggleOla = !this.toggleOla;
    }
    toggleDate() {
        this.showDate = !this.showDate;
    }
    //#endregion
    //#region for messages
    MandatoryMessage: string = "Please fill the mandatory fields.";
    OlaSaved: string = "Ola saves successfully";
    Mandatory: string = 'Mandatory';
    Success: string = 'Success';
    Information: string = 'Alert';
    Failure: string = 'Failure';

    ////#region Main Page
    fullAccess: boolean = true;
    noAccessMessage: string = configuration.NoAccessMessage;
    ////#endregion

    //#endregion
    //#region method used to toggle the show more filter details and filter count
    displayMorePackageType() {
        this.showMorePackageType = this.showMorePackageType == this.showMoreText ? this.showLessText : this.showMoreText;
        this.packageTypeCount = this.showMorePackageType == this.showMoreText ? this.filterCount : this.packageTypeDetails.length;
    }

    displayMoreFunction() {
        this.showMoreFunction = this.showMoreFunction == this.showMoreText ? this.showLessText : this.showMoreText;
        this.functionCount = this.showMoreFunction == this.showMoreText ? this.filterCount : this.functionDetails.length;
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
        this.selectedPackageTypeIds = [];
        this.selectedFunctionIds = [];
        this.selectedFrequencyIds = [];
        this.selectedDate = null;
        this.packageTypeDetails.forEach(
            x => { x.selected = false; }
        );
        this.functionDetails.forEach(
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
        if (e.filterName == "date") {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "uniqueId");
            this.filteredArray.splice(index, 1);
            this.selectedDate = null;
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
            else if (e.filterName == "function") {
                const indexFacility: number = this.selectedFunctionIds.indexOf(e.value);
                if (index !== -1) {
                    this.selectedFunctionIds.splice(indexFacility, 1);
                    this.functionDetails[this.functionDetails.findIndex(item => item.functionId == e.value)].selected = false;
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

    selectFunction(e) {
        if (e.selected) {
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ value: e.functionId, text: e.functionName, filterName: "function" });
            }
            else {
                this.filteredArray = [{ value: e.functionId, text: e.functionName, filterName: "function" }]
            }

            if (this.selectedFunctionIds != undefined) {
                this.selectedFunctionIds.push(e.functionId);
            }
            else {
                this.selectedFunctionIds = [e.functionId];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "function" && item.value == e.functionId);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexFunction: number = this.selectedFunctionIds.indexOf(e.functionId);
            if (index !== -1) {
                this.selectedFunctionIds.splice(indexFunction, 1);
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
    //#endregion

    //#endregion


    ngOnInit() {
        //debugger;
        console.log('init of create package');
        this.dataService.CheckAdminRoleAccessForPages(this.enterprisedId, location.pathname).subscribe(
            data => {
                if (data.length != 0) {
                    this.loadingSymbol = true;
                    //this.GetPageOnLoad();
                    this.dataService.getPackageTypeDetails().subscribe(
                        data => {
                            this.packageTypeDetails = data;
                        }
                    );
                    this.dataService.getFunctionDetails().subscribe(
                        data => {
                            this.functionDetails = data;
                        }
                    );
                    this.dataService.getFrequencyDetails().subscribe(
                        data => {
                            this.frequencyDetails = data;
                        }
                    );
                    this.dataService.getStatusDetails().subscribe(
                        data => {
                            this.statusDetails = data;
                            this.GetPageOnLoad();
                        }
                    );

                }
                else {
                    this.loadingSymbol = false;
                    this.fullAccess = false;
                }
            }
        );
    }

    public GetPageOnLoad(): void {
        debugger;
        this.loadingSymbol = true;
        this.packageService.getPackageData(this.pageNumber, this.sortColumn, this.sortDirection, this.pageSize).subscribe(
            data => {
                this.packageData = data;
                if (this.packageData != null) {
                    this.count = this.packageData[1][0].totalRecordCount;
                    this.setPager();
                }
            }
        );
    }
    //#region Grid Data

    //Called this method to get filtered data
    public getFilteredData(): void {
        this.loadingSymbol = true;
        debugger;
        let length: number = this.filteredArray != null ? this.filteredArray.length : 0;
        if (length == 0) {
            this.enableClearAll = false;
            this.packageService.getPackageData(this.pageNumber, this.sortColumn, this.sortDirection, this.pageSize).subscribe(
                data => {
                    const statusDetails = this.statusDetails;
                    this.packageData = data;
                    if (this.packageData != null) {
                        this.count = this.packageData[1][0].totalRecordCount;//.length;
                    }
                    this.setPager();
                }
            );
        } else {
            this.enableClearAll = true;
            var date = this.selectedDate != undefined ? new Date(this.selectedDate.year, this.selectedDate.month - 1, this.selectedDate.day) : "";
            var selectDate = date != "" ? this.datepipe.transform(date, 'dd-MMM-yyyy') : "";
            this.packageService.getPackageDataByFilter(this.selectedPackageTypeIds, this.selectedFunctionIds, this.selectedFrequencyIds
                , this.pageNumber, this.sortColumn, this.sortDirection, this.pageSize, selectDate.toString()).subscribe(
                    data => {
                        this.packageData = data;
                        if (this.packageData != null) {
                            this.count = this.packageData[1][0].totalRecordCount;
                        }
                        this.setPager();
                    }
                );
        }
    }

    setPager() {
        //debugger;
        this.pager = this.pagerService.getPager(this.count, this.pageNumber, this.pageSize);
        this.packageDataDisplay = this.packageData[0].map(val => {
            return Object.assign({}, val, this.statusDetails.filter(v => v.statusId === val.StatusId)[0]);
        });
        this.packageDataDisplay.forEach((x) => {
            var dt=new Date(x.modifiedon);
            dt.setHours(dt.getHours()-5);
            dt.setMinutes(dt.getMinutes()-30);
            x.modifiedon=new Date(dt).toUTCString();
            var dt1=new Date(x.modifiedon);
            dt1.setHours(dt.getHours()-5);
            dt1.setMinutes(dt.getMinutes()-30);
            x.createdon=new Date(dt1).toUTCString();
        });
        this.loadingSymbol = false;
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
        //debugger;
        this.pageNumber = page;
        this.getFilteredData();
    }

    onDateSelect(e) {
        debugger;
        var date = new Date(e.year, e.month - 1, e.day);
        var transactionDate = this.datepipe.transform(date, 'dd-MMM-yyyy');
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


    //Called this method on page option changes
    onPagingOptionsChange(e: number) {
        debugger;
        this.selectedPageSize = +e;
        this.pageSize = this.selectedPageSize;
        this.pageNumber = 1;
        this.getFilteredData();
    }
    //#endregion


    //#region Create Package Modal

    //create popup fields
    public packageTypeId: number = -1;
    public packageTypeName: string = null;

    createPackage(createPackageModal) {
        //debugger;
        this.modalService.open(createPackageModal, { backdrop: 'static', keyboard: false, size: 'lg', windowClass: "create" });
    }

    //Called this method to get Package Name when Package Type is selected
    getPackgaeTypeName(e) {
        //debugger;
        this.packageTypeName = e.target.selectedOptions[0].text;//.forEach(x=>x.selcted==true);
    }

    dismissCreatePackageModal() {
        this.packageTypeId = -1;
        this.packageTypeName = null;
        this.modalService.dismissAll();
        this.getFilteredData();
    }
    //#endregion


    //#region Edit Package Modal

    editFunctionDetails: FunctionData[];
    editPackageName: string;
    editPackageId: number;
    txtWeightage: number;
    totalPackageCount: number = -1;
    functionId: number = -1;
    frequencyId: number = -1;
    txtOLAName: string = "";
    txtArtetacts: string = "";
    rdOptionalOLA: string = "Yes";
    txtOLANameEdit: string = "";
    txtArtetactsEdit: string = "";
    rdOptionalOLAEdit: string = "no";
    txtWeightageForValidation: string = "";
    txtFunctionName: string = "";
    isEditable: boolean = true;

    editPackage(editPackageModal, packageId, packageName, name, statusName) {
        debugger;
        this.ClearFunctionSelection();
        this.clearOLA();
        this.functionSaving = false;
        if (name == 'create') {
            if (this.packageTypeId == -1) {
                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                modalRef.componentInstance.message = this.MandatoryMessage;
                modalRef.componentInstance.title = this.Mandatory;
                return;
            }
            else {
                this.editFunctionDetails = null;
                this.loadingSymbolForModal = true;
                this.editPackageName = this.packageTypeName;
                this.modalTitleName = "Create Package";
                // this.packageTypeId = -1;
                this.packageTypeName = null;
                this.isEditable = true;
                this.packageService.CreatePackageValidation(this.packageTypeId).subscribe(
                    data => {
                        if (data != null) {
                            if (data.length > 0 && data[0].totalCount > 0) {
                                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                modalRef.componentInstance.message = "Package already created.";
                                modalRef.componentInstance.title = this.Information;
                                this.loadingSymbolForModal = false;
                                return;
                            }
                            else {
                                this.modalService.dismissAll();
                                this.totalPackageCount = 0;
                                this.openModalForCreate(this.packageTypeId, editPackageModal);
                            }
                        }
                    }
                );
            }
        }
        else if (name == 'edit') {
            this.modalTitleName = "Edit Package";
            this.editPackageName = packageName;
            this.packageTypeId = packageId;
            this.editFunctionDetails = null;
            if(statusName == configuration.Draft){
                this.isEditable = true;
            }
            else{
                this.isEditable = false;
            }
            this.openModalForCreate(this.packageTypeId, editPackageModal);
        }

    }

    submitCreatePackage() {
        this.loadingSymbolForModal = true;
        let statusId = this.statusDetails.find(x => x.statusName == configuration.Submitted).statusId;
        this.packageService.SubmitPackageValidation(statusId, this.packageTypeId).subscribe(
            data => {
                if (data != null) {
                    if (data[0].totalCount == 0) {
                        this.submitPackageValidation();
                    }
                    else {
                        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                        this.loadingSymbolForModal = false;
                        modalRef.componentInstance.message = configuration.SubmitPackageValidation;
                        modalRef.componentInstance.title = this.Information;
                        return;
                    }
                }
            }
        )
    }

    public submitPackageValidation(): void {
        this.packageService.CreatePackageValidation(this.packageTypeId).subscribe(
            data => {
                if (data != null) {
                    if (data[0].totalCount > 0) {
                        this.checkWeigatge(this.packageTypeId);
                    }
                    else {
                        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                        this.loadingSymbolForModal = false;
                        modalRef.componentInstance.message = configuration.AddOneFunction;
                        modalRef.componentInstance.title = this.Information;
                        return;
                    }
                }
            }
        );
    }

    public checkWeigatge(packageId: number): void {
        this.packageService.CheckWeigtage("", packageId, -1).subscribe(
            data => {
                if (data != null) {
                    data[0].totalWeightage = data[0].totalWeightage == null ? 0 : data[0].totalWeightage;
                    if (data[0].totalWeightage == 100) {
                        let statusId = this.statusDetails.find(x => x.statusName == configuration.Submitted).statusId;
                        this.PackageSubmission(statusId);
                    }
                    else {
                        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                        this.loadingSymbolForModal = false;
                        modalRef.componentInstance.message = configuration.WeightageMessage;
                        modalRef.componentInstance.title = this.Information;
                        return;
                    }
                }

            }
        )
    }

    public PackageSubmissionForSave(statusId: number): void {
        this.packageService.PackageSubmission(this.packageTypeId, this.enterprisedId, statusId).subscribe(
            data => {
                if (data.affectedRows > 0) {
                }
            }
        )
    }

    public PackageSubmission(statusId: number): void {
        this.packageService.PackageSubmission(this.packageTypeId, this.enterprisedId, statusId).subscribe(
            data => {
                if (data.affectedRows > 0) {
                    this.dismissCreatePackageModal();
                    const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                    this.loadingSymbolForModal = false;
                    modalRef.componentInstance.message = configuration.SubmitPackage;
                    modalRef.componentInstance.title = this.Success;
                    return;
                }
            }
        )
    }

    public inputValidator(event: any) {
        if (event.target.value == "") {
            this.txtWeightageForValidation = "";
        }
    }

    public inputValidatorNumber(event: any) {
        if (event.target.value == "") {
            this.txtWeightage = null;
        }
    }


    openModalForCreate(packageId, editPackageModal): void {
        this.editPackageId = packageId;
        this.loadingSymbolForModal = true;
        this.packageTypeId = packageId;
        this.GetFunctionDetails(packageId);
        this.getFunction(packageId);
        this.toggleOla = false;
        //this.getEditData();
        this.modalService.open(editPackageModal, { backdrop: 'static', keyboard: false, size: 'lg', windowClass: "edit" });
    }

    editFunction(functionId) {
        debugger;
        this.editFunctionDetails.filter(x => x.functionId == functionId).forEach(x => { this.txtWeightage = x.weightage });
        this.editFunctionDetails.filter(x => x.functionId == functionId).forEach(x => x.isEdit = true);
        this.editFunctionDetails.filter(x => x.functionId != functionId).forEach(x => x.isEdit = false);
    }

    editOlaDetails(olaId) {
        this.editPackageDataDisplay.filter(x => x.OLAId == olaId).forEach(x => x.isEdit = true);
        this.editPackageDataDisplay.filter(x => x.OLAId == olaId).forEach(x => { this.txtOLANameEdit = x.olaName });
        this.editPackageDataDisplay.filter(x => x.OLAId == olaId).forEach(x => { this.txtArtetactsEdit = x.Artefacts });
        //this.editPackageDataDisplay.filter(x => x.OLAId == olaId).forEach(x => { this.rdOptionalOLAEdit = x.isOptional });

    }

    resetOlaDetails(olaId) {
        debugger;
        this.editPackageDataDisplay.filter(x => x.OLAId == olaId).forEach(x => x.isEdit = false);
        this.editPackageDataDisplay.filter(x => x.OLAId == olaId).forEach(x => { this.txtOLANameEdit = x.olaName });
        this.editPackageDataDisplay.filter(x => x.OLAId == olaId).forEach(x => { this.txtArtetactsEdit = x.Artefacts });
        //this.editPackageDataDisplay.filter(x => x.OLAId == olaId).forEach(x => { this.rdOptionalOLAEdit = x.isOptional });
    }

    updateOlaDetails(olaId) {
        this.loadingSymbolForModal = true;
        const olaName = this.txtOLANameEdit;
        const artefacts = this.txtArtetactsEdit;
        if (olaName == "" || artefacts == "") {
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            this.loadingSymbolForModal = false;
            modalRef.componentInstance.message = "Please fill Artefacts and OlaName.";
            modalRef.componentInstance.title = this.Mandatory;
            return;
        }
        else {
            this.packageService.updateOlaDetails(olaId, this.txtArtetactsEdit, this.txtOLANameEdit, this.enterprisedId).subscribe(
                data => {
                    if (data != null) {
                        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                        modalRef.componentInstance.message = "OLA updated successfully.";
                        modalRef.componentInstance.title = this.Success;
                        let statusId = this.statusDetails.find(x => x.statusName == configuration.Draft).statusId;
                        this.resetOlaDetails(olaId);
                        this.updatePackage(this.packageTypeId);
                        this.PackageSubmissionForSave(statusId);
                        this.isEditable = true;
                        this.getEditData();
                        this.loadingSymbolForModal = false;
                        return;
                    }
                }

            );

        }
    }

    updateFunction(functionId, functionName) {
        debugger;
        this.loadingSymbolForModal = true;
        const packageId = this.editPackageId;
        const weightage = this.txtWeightage;
        if (this.txtWeightage == undefined || this.txtWeightage == null) {
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            modalRef.componentInstance.message = this.MandatoryMessage;
            modalRef.componentInstance.title = this.Mandatory;
            this.loadingSymbolForModal = false;
            return;
        }
        else {
            if (this.txtWeightage == 0) {
                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                modalRef.componentInstance.message = configuration.WeightageZero;
                modalRef.componentInstance.title = this.Information;
                this.loadingSymbolForModal = false;
                return;
            }
            else {
                this.packageService.CheckWeigtage(functionName, packageId, functionId).subscribe(
                    data => {
                        if (data != null) {
                            data[0].totalWeightage = data[0].totalWeightage == null ? 0 : data[0].totalWeightage;
                            const weight = data[0].totalWeightage + Number(weightage);
                            if (weight > 100) {
                                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                modalRef.componentInstance.message = configuration.WeigthageExceeds;
                                modalRef.componentInstance.title = this.Information;
                                this.loadingSymbolForModal = false;
                                return;
                            }
                            else {
                                let statusId = this.statusDetails.find(x => x.statusName == configuration.Draft).statusId;
                                this.packageService.UpdateFunction(packageId, functionId, weightage, this.enterprisedId).subscribe(
                                    data => {
                                        if (data != null) {
                                            this.GetFunctionDetails(packageId);
                                            this.PackageSubmissionForSave(statusId);
                                            this.updatePackage(this.packageTypeId);
                                            this.isEditable = true;
                                            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                            modalRef.componentInstance.message = configuration.FunctionUpdate;
                                            modalRef.componentInstance.title = this.Success;
                                            this.loadingSymbolForModal = false;
                                            return;
                                        }
                                    }
                                );

                            }
                        }

                    }
                );
            }

        }

    }

    resetFunction(functionId) {
        debugger;
        this.editFunctionDetails.filter(x => x.functionId == functionId).forEach(x => { this.txtWeightage = x.weightage });
        this.editFunctionDetails.filter(x => x.functionId == functionId).forEach(x => x.isEdit = false);
    }

    saveOLA() {
        debugger;
        this.loadingSymbolForModal = true;
        if (this.frequencyId == -1 || this.txtOLAName.trim() == "" || this.txtArtetacts.trim() == "" || this.rdOptionalOLA.trim() == "") {
            //alert("Please select all mandatory fileds.");
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            modalRef.componentInstance.message = this.MandatoryMessage;
            modalRef.componentInstance.title = this.Mandatory;
            this.loadingSymbolForModal = false;
            return;
        }
        else {
            if (this.editPackageDataDisplay != null) {
                if (this.editPackageDataDisplay.length > 0) {
                    const optionalOla = this.editPackageDataDisplay.find(x => x.PackageId == this.packageTypeId && x.FunctionId == this.functionId).isOptional;
                    if (optionalOla != this.rdOptionalOLA) {
                        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                        modalRef.componentInstance.message = "Please select Optional OLA as " + optionalOla + " to save the line item";
                        modalRef.componentInstance.title = this.Information;
                        this.loadingSymbolForModal = false;
                        return;
                    }
                    else {
                        this.InsertOla();
                    }
                }
                else {
                    this.InsertOla();
                }
            }
            else {
                this.InsertOla();
            }
        }
    }

    public InsertOla(): void {
        debugger;
        if (this.functionSaving) {
            let statusId = this.statusDetails.find(x => x.statusName == configuration.Draft).statusId;
            this.packageService.InsertIntoFunctionAndPackageFunctionMapping(this.packageTypeId, this.txtFunctionName, this.txtWeightageForValidation, this.enterprisedId, statusId).subscribe(
                data => {
                    if (data.affectedRows == 1) {
                        this.GetFunctionDetails(this.packageTypeId);
                        this.getFunction(this.packageTypeId);
                        this.updatePackage(this.packageTypeId);
                        this.PackageSubmissionForSave(statusId);
                        this.isEditable = true;
                        if (this.totalPackageCount == 0) {
                            this.updatePackageCreate(this.packageTypeId);
                        }
                        this.ClearFunctionSelection();

                        this.packageService.FunctionIdForOlaCreation(data.insertId).subscribe(
                            data => {
                                if (data != null) {
                                    this.functionId = data[0].FunctionId;
                                    this.functionSaving = false;
                                    this.AdditionOla();
                                }
                            }
                        );
                    }
                }
            );
        }
        else {
            let statusId = this.statusDetails.find(x => x.statusName == configuration.Draft).statusId;
            this.PackageSubmissionForSave(statusId);
            this.isEditable = true;
            this.AdditionOla();
        }
        // this.packageService.CheckWeigtage("", this.packageTypeId, -1).subscribe(
        //     data => {
        //         if (data != null) {
        //             data[0].totalWeightage = data[0].totalWeightage == null ? 0 : data[0].totalWeightage;
        //             if (this.functionSaving) {
        //                 data[0].totalWeightage = data[0].totalWeightage + Number(this.txtWeightageForValidation)
        //             }
        //             if (data[0].totalWeightage == 100) {

        //             }
        //             else {
        //                 const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
        //                 modalRef.componentInstance.message = "Weightage should be 100% for a package to save an OLA.";
        //                 modalRef.componentInstance.title = this.Mandatory;
        //                 this.loadingSymbolForModal = false;
        //                 this.functionSaving = false;
        //                 this.toggleOla = false;
        //                 return;
        //             }
        //         }
        //     }
        // );

    }

    public AdditionOla(): void {
        this.loadingSymbolForModal = true;
        this.packageService.insertIntoOlaMaster(this.functionId, this.frequencyId, this.txtOLAName, this.rdOptionalOLA, this.txtArtetacts, this.packageTypeId, this.enterprisedId).subscribe(
            data => {
                if (data != null) {
                    this.clearOLA();
                    this.getEditData();
                    this.IncrementOlaCount(this.functionId, this.packageTypeId, this.enterprisedId);                    
                    const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                    modalRef.componentInstance.message = "OLA saved successfully.";
                    modalRef.componentInstance.title = this.Success;
                    return;
                }
            }
        );
    }
    public IncrementOlaCount(functionId: number, packageId: number, enterprisedId: string): void {
        const olaCount = this.functionDetailsByPackageId.find(x => x.functionId == functionId).OLACnt;
        this.packageService.IncrementOlaCount(packageId, functionId, olaCount, enterprisedId).subscribe(
            data => {
            }
        );
    }

    clearOLA() {
        //this.functionId = -1;
        this.frequencyId = -1;
        this.txtOLAName = "";
        this.txtArtetacts = "";
        this.rdOptionalOLA = "Yes";

    }

    AddOLA(functionId, functionName) {
        this.toggleOla = true;
        this.functionSaving = false;
        this.functionId = functionId;
        this.modalFunctionName = functionName;
        this.editPackageDataDisplay = null;
        this.getEditData();
        this.clearOLA();
    }

    AddOLAForCreateFunction(functionName) {
        this.toggleOla = true;
        this.modalFunctionName = functionName;
        this.editPackageDataDisplay = null;
        this.clearOLA();
    }

    ClearFunctionSelection() {
        this.txtFunctionName = "";
        this.txtWeightageForValidation = "";
    }
    SaveFunctionName() {
        this.loadingSymbolForModal = true;
        if (this.txtFunctionName == "" || this.txtWeightageForValidation == "" || this.txtFunctionName.trim() == "") {
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            modalRef.componentInstance.message = this.MandatoryMessage;
            modalRef.componentInstance.title = this.Mandatory;
            this.loadingSymbolForModal = false;
            return;
        }
        else {
            if (Number(this.txtWeightageForValidation) == 0) {
                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                modalRef.componentInstance.message = configuration.WeightageZero;
                modalRef.componentInstance.title = this.Information;
                this.loadingSymbolForModal = false;
                return;
            }
            else {
                this.packageService.CheckWeigtage("", this.packageTypeId, -1).subscribe(
                    data => {
                        if (data != null) {
                            data[0].totalWeightage = data[0].totalWeightage == null ? 0 : data[0].totalWeightage;
                            const weight = data[0].totalWeightage + Number(this.txtWeightageForValidation);
                            if (weight > 100) {
                                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                modalRef.componentInstance.message = configuration.WeigthageExceeds;
                                modalRef.componentInstance.title = this.Information;
                                this.loadingSymbolForModal = false;
                                return;
                            }
                            else {
                                this.packageService.CheckForMapping(this.packageTypeId, this.txtFunctionName.trim()).subscribe(
                                    data => {
                                        if (data[0].totalCount > 0) {
                                            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                            modalRef.componentInstance.message = "Function already mapped to Package.";
                                            modalRef.componentInstance.title = this.Information;
                                            this.loadingSymbolForModal = false;
                                            return;
                                        }
                                        else {
                                            this.toggleOla = false;
                                            this.loadingSymbolForModal = false;
                                            this.functionSaving = true;
                                            this.AddOLAForCreateFunction(this.txtFunctionName.trim());
                                        }
                                    }
                                );

                            }
                        }

                    }
                );
            }

        }


    }
    public getFunction(packageId: number): void {
        this.packageService.GetFunctionByPackageDetails(packageId).subscribe(
            data => {
                this.functionDetailsByPackageId = data;
            }
        );
    }
    public GetFunctionDetails(packageId): void {
        this.dataService.getFunctionDetailsByPackageId(packageId).subscribe(
            data => {
                this.editFunctionDetails = data;
                this.editFunctionDetails.forEach(x => x.isEdit = false);
                this.cdRef.detectChanges();
                this.loadingSymbolForModal = false;
            }
        );
    }
    public updatePackage(packageId): void {
        this.packageService.UpdatePackage(packageId, this.enterprisedId).subscribe(
            data => {

            }
        );
    }

    public updatePackageCreate(packageId): void {
        this.packageService.UpdatePackageCreate(packageId, this.enterprisedId).subscribe(
            data => {

            }
        );
    }
    editPackageData: any = null;
    editPackageDataDisplay: any = null;
    //paging proprty
    pagerEdit: any = {};
    countEdit: number = 0;
    pageNumberEdit: number = this.pagerService.pageNumberView;
    pageSizeEdit: number = this.pagerService.pageSizeView;

    //sorting property
    sortColumnEdit: string = "Os.CreateDttm";
    sortDirectionEdit: string = "asc";
    defaultSortEdit: boolean = true;

    functionChange() {
        // if (this.functionId == -1) {
        //     this.editPackageData = null;
        //     this.editPackageDataDisplay = null;
        //     //paging proprty
        //     this.pagerEdit = {};
        //     this.countEdit = 0;
        // }
        // else {
        this.getEditData();
        //}
    }
    //Called this method to get filtered view data
    public getEditData(): void {
        this.loadingSymbolForModal = true;
        //debugger;
        const packageId: number = this.editPackageId;
        const functionId: number = this.functionId;
        this.packageService.getOlaRecordsToDisplay(packageId, functionId
            , this.pageNumberEdit, this.sortColumnEdit, this.sortDirectionEdit, this.pageSizeEdit).subscribe(
                data => {
                    this.editPackageData = data;
                    if (this.editPackageData != null) {
                        this.countEdit = this.editPackageData[1][0].totalRecordCount;
                    }
                    this.setPagerEdit();
                }
            );
        this.pagerView;
    }

    setPagerEdit() {
        debugger;
        this.pagerEdit = this.pagerService.getPager(this.countEdit, this.pageNumberEdit, this.pageSizeEdit);
        this.editPackageDataDisplay = this.editPackageData[0];
        this.rdOptionalOLA = this.editPackageData[0].length > 0 ? this.editPackageData[0][0].isOptional: "Yes";
        this.editPackageDataDisplay.forEach(x => x.isEdit = false);
        this.loadingSymbolForModal = false;
    }

    //Called this method on sorting
    sortingEdit(sortColumn: string) {
        if (this.defaultSortEdit && this.sortColumnEdit == sortColumn) {
            this.sortColumnEdit = sortColumn;
            this.sortDirectionEdit = "asc";
            this.defaultSortEdit = false;
        }
        else {
            this.defaultSortEdit = false;
        }
        if (this.sortColumnEdit != sortColumn) {
            this.sortColumnEdit = sortColumn;
            this.sortDirectionEdit = "asc";
        }
        else {
            this.sortColumnEdit = sortColumn;
            this.sortDirectionEdit = this.sortDirectionEdit == "asc" ? "desc" : "asc";
        }
        this.getEditData();
    }

    //Called this method on paging
    setPageEdit(page: number) {
        //debugger;
        this.pageNumberEdit = page;
        this.getEditData();
    }

    dismissEditPackageModal() {
        debugger;
        this.modalService.dismissAll();
    }
    //#endregion


    //#region View Package Details Modal

    public viewObjcet: any = [];
    viewPackageData: any = null;
    viewPackageDataDisplay: any = null;
    //paging proprty
    pagerView: any = {};
    countView: number = 0;
    pageNumberView: number = this.pagerService.pageNumberView;
    pageSizeView: number = this.pagerService.pageSizeView;

    //pagingoption property
    pageOptionsView = this.pagerService.pageOptionsView;
    selectedPageSizeView: number = this.pagerService.selectedPageSizeView;

    //sorting property
    sortColumnView: string = "Os.CreateDttm";
    sortDirectionView: string = "asc";
    defaultSortView: boolean = true;

    viewPackage(viewPackageModal, packageDetials) {
        debugger;
        this.viewObjcet = packageDetials;
        this.viewPackageDataDisplay = null;
        this.getViewData();
        this.modalService.open(viewPackageModal, { backdrop: 'static', keyboard: false, size: 'lg', windowClass: "view" });
    }

    //Called this method to get filtered view data
    public getViewData(): void {
        //debugger;
        this.loadingSymbolForModal = true;
        const packageId: number = this.viewObjcet.packageId;
        const functionId: number = -1
        this.packageService.getOlaRecordsToDisplay(packageId, functionId
            , this.pageNumberView, this.sortColumnView, this.sortDirectionView, this.pageSizeView).subscribe(
                data => {
                    this.viewPackageData = data;
                    if (this.viewPackageData != null) {
                        this.countView = this.viewPackageData[1][0].totalRecordCount;
                    }
                    this.setPagerView();
                }
            );
        this.pagerView;
    }

    setPagerView() {
        debugger;
        this.pagerView = this.pagerService.getPager(this.countView, this.pageNumberView, this.pageSizeView);
        this.viewPackageDataDisplay = this.viewPackageData[0];
        this.loadingSymbolForModal = false;
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
        this.getViewData();
    }

    //Called this method on paging
    setPageView(page: number) {
        //debugger;
        this.pageNumberView = page;
        this.getViewData();
    }

    //Called this method on page option changes
    onPagingOptionsChangeView(e: number) {
        debugger;
        this.selectedPageSizeView = +e;
        this.pageSizeView = this.selectedPageSizeView;
        this.pageNumberView = 1;
        this.getViewData();
    }

    dismissViewPackageModal() {
        this.viewObjcet = [];
        this.modalService.dismissAll();
    }
    //#endregion


    //#region Enable Missed Dates

    public facilityDetails: FacilityMaster[];
    public enablefacilityId: number = -1;
    public enablePackageTypeId: number = -1;
    periodDate: any;
    periodDateSecond: any;
    periodDateThird: any;
    dateGreater: boolean = false;
    public enabledDates: Array<string> = [];
    public dateTime: string = new Date().toISOString().split('T')[0];
    dateMax: Date = new Date();
    year: number = Number(this.dateTime.split('-')[0]);
    month: number = Number(this.dateTime.split('-')[1]);
    day: number = Number(this.dateTime.split('-')[2]);



    // maxDate:number;

    openEnablePastDateModal(enablePackageModal) {
        this.clearEnbalePackageModal();
        this.dataService.getFacilityAliasDetails().subscribe(
            data => {
                this.facilityDetails = data;
            }
        );
        this.modalService.open(enablePackageModal, { backdrop: 'static', keyboard: false, size: 'lg', windowClass: "enable" });
    }
    //    isDisabled(date: NgbDateStruct, current: {month: number}) {
    //     const d = new Date(date.year, date.month - 1, date.day);
    //     //return date.day==10 || d.getDay() === 0 || d.getDay() === 6;
    //      let dateTime = new Date().toISOString().split('T')[0];
    //     return  (date.month > Number(dateTime.split('-')[1]));
    //   }
    // getToday(): string {
    //     return new Date().toISOString().split('T')[0];
    //  }
    dismissEnbalePackageModal() {
        this.enablePackageTypeId = -1;
        this.enablefacilityId = -1;
        this.periodDate = "";
        this.periodDateSecond = "";
        this.periodDateThird = "";
        this.modalService.dismissAll();
    }
    clearEnbalePackageModal() {
        this.enablePackageTypeId = -1;
        this.enablefacilityId = -1;
        this.periodDate = "";
        this.periodDateSecond = "";
        this.periodDateThird = "";
    }
    clearDates() {
        this.periodDate = "";
        this.periodDateSecond = "";
        this.periodDateThird = "";
    }
    enablePastDates(enablePackageTypeId, enablefacilityId) {
        if (enablePackageTypeId == -1 || enablefacilityId == -1) {
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            modalRef.componentInstance.message = this.MandatoryMessage;
            modalRef.componentInstance.title = this.Mandatory;
            return;
        }
        else if ((this.periodDate == "" || this.periodDate == undefined) && (this.periodDateSecond == "" || this.periodDateSecond == undefined) && (this.periodDateThird == "" || this.periodDateThird == undefined)) {
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            modalRef.componentInstance.message = "Please add atleast one date to save.";
            modalRef.componentInstance.title = this.Mandatory;
            return;
        }
        else {
            //const date: NgbDate = new NgbDate(this.year, this.month, this.day);
            if (this.periodDate != "" && this.periodDate != undefined) {
                var date = this.periodDate != undefined ? new Date(this.periodDate.year, this.periodDate.month - 1, this.periodDate.day) : "";
                this.periodDate = date != "" ? this.datepipe.transform(date, 'yyyy-MM-dd') : "";
                // this.periodDate.month = this.periodDate.month < 10 ? "0" + this.periodDate.month : this.periodDate.month;
                // this.periodDate.day = this.periodDate.day < 10 ? "0" + this.periodDate.day : this.periodDate.day;
                // this.periodDate = this.periodDate.year + "-" + this.periodDate.month + "-" + this.periodDate.day;
            }
            if (this.periodDateSecond != "" && this.periodDateSecond != undefined) {
                var date = this.periodDate != undefined ? new Date(this.periodDateSecond.year, this.periodDateSecond.month - 1, this.periodDateSecond.day) : "";
                this.periodDateSecond = date != "" ? this.datepipe.transform(date, 'yyyy-MM-dd') : "";
            }
            if (this.periodDateThird != "" && this.periodDateThird != undefined) {
                var date = this.periodDate != undefined ? new Date(this.periodDateThird.year, this.periodDateThird.month - 1, this.periodDateThird.day) : "";
                this.periodDateThird = date != "" ? this.datepipe.transform(date, 'yyyy-MM-dd') : "";
            }
            this.dateGreater = (this.periodDate == undefined || this.periodDate == "") ? false : (this.periodDate > this.dateTime ? true : false)
            this.dateGreater = (this.periodDateSecond == undefined || this.periodDateSecond == "") ? false : (this.periodDateSecond > this.dateTime ? true : false)
            this.dateGreater = (this.periodDateThird == undefined || this.periodDateThird == "") ? false : (this.periodDateThird > this.dateTime ? true : false)
            // const value = date.before(NgbDate.from({ year: periodDate.year, month: periodDate.month, day: periodDate.day }));
            if (this.dateGreater) {
                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                modalRef.componentInstance.message = "One of the selected date's is greater than today.Period Date should be equal or less than today's date.";
                modalRef.componentInstance.title = this.Information;
                this.clearDates();
                return;
            }
            else {
                this.loadingSymbolForModal = true;
                this.enabledDates = [];
                if (this.enabledDates != undefined) {
                    (this.periodDate != undefined && this.periodDate != "") ? this.enabledDates.push(this.periodDate) : this.periodDate;
                    (this.periodDateThird != undefined && this.periodDateThird != "") ? this.enabledDates.push(this.periodDateThird) : this.periodDateThird;
                    (this.periodDateSecond != undefined && this.periodDateSecond != "") ? this.enabledDates.push(this.periodDateSecond) : this.periodDateSecond;
                    // this.enabledDates.push(this.periodDateThird);
                    // this.enabledDates.push(this.periodDate);
                    // this.enabledDates.push(this.periodDateSecond);
                }
                let firstItem = this.scoreService.CheckIsScoreSubmittedForSelectedDates(this.periodDate, this.enablePackageTypeId, this.enablefacilityId);
                let secondItem = this.scoreService.CheckIsScoreSubmittedForSelectedDates(this.periodDateSecond, this.enablePackageTypeId, this.enablefacilityId);
                let thirdItem = this.scoreService.CheckIsScoreSubmittedForSelectedDates(this.periodDateThird, this.enablePackageTypeId, this.enablefacilityId);

                forkJoin([firstItem, secondItem, thirdItem]).subscribe(results => {
                    let firstItem = results[0];
                    let secondItem = results[1];
                    let thirdItem = results[2];
                    let message = "";
                    if (firstItem[0].totalCount > 0) {
                        message = "Score submission  for " + this.periodDate + " is already done.";
                    }
                    if (secondItem[0].totalCount > 0) {
                        message = message == "" ? "Score submission for " + this.periodDateSecond + " is already done." : "Score submission for " + this.periodDateSecond + "," + this.periodDate + "  is already done.";
                    }
                    if (thirdItem[0].totalCount > 0) {
                        message = message == "" ? "Score submission for " + this.periodDateThird + " is already done." : "Score submission for " + this.periodDateSecond + "," + this.periodDate + "," + this.periodDateThird + " is already done.";
                    }
                    if (message != "") {
                        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                        modalRef.componentInstance.message = message
                        modalRef.componentInstance.title = this.Information;
                        this.clearDates();
                        this.loadingSymbolForModal = false;
                        return;
                    }
                    else {
                        let firstItem = this.scoreService.CheckIsScoreAlreadyEnabledForSelectedDates(this.periodDate, this.enablePackageTypeId, this.enablefacilityId);
                        let secondItem = this.scoreService.CheckIsScoreAlreadyEnabledForSelectedDates(this.periodDateSecond, this.enablePackageTypeId, this.enablefacilityId);
                        let thirdItem = this.scoreService.CheckIsScoreAlreadyEnabledForSelectedDates(this.periodDateThird, this.enablePackageTypeId, this.enablefacilityId);
                        forkJoin([firstItem, secondItem, thirdItem]).subscribe(results => {
                            let firstItem = results[0];
                            let secondItem = results[1];
                            let thirdItem = results[2];
                            let message = "";
                            if (firstItem[0].totalCount > 0) {
                                message = "Selected  date " + this.periodDate + " is already enabled.";
                            }
                            if (secondItem[0].totalCount > 0) {
                                message = message == "" ? "Selected date " + this.periodDateSecond + " is already enabled." : "Selected date's " + this.periodDateSecond + "," + this.periodDate + "  is already enabled.";
                            }
                            if (thirdItem[0].totalCount > 0) {
                                message = message == "" ? "Selected date " + this.periodDateThird + " is already enabled." : "Selected date's " + this.periodDateSecond + "," + this.periodDate + "," + this.periodDateThird + " is already enabled.";
                            }
                            if (message != "") {
                                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                modalRef.componentInstance.message = message
                                modalRef.componentInstance.title = this.Information;
                                this.loadingSymbolForModal = false;
                                this.clearDates();
                                return;
                            }
                            else {
                                this.scoreService.EnableTransactioMissedDates(this.enabledDates, this.enterprisedId, this.enablePackageTypeId, this.enablefacilityId).subscribe(
                                    data => {
                                        if (data != null) {
                                            if (data.affectedRows > 0) {
                                                this.dismissEnbalePackageModal();
                                                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                                modalRef.componentInstance.message = "Enabled the dates for score submission successfully.";
                                                modalRef.componentInstance.title = this.Success;
                                                this.loadingSymbolForModal = false;
                                                return;
                                            }
                                            else {
                                                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                                modalRef.componentInstance.message = "Selected missed dates not available to enable";
                                                modalRef.componentInstance.title = this.Success;
                                                this.clearDates();
                                                this.loadingSymbolForModal = false;
                                                return;
                                            }

                                        }
                                    }
                                );
                            }
                        });

                    }
                });
            }
            //validation and save data in db
        }
    }
    //#endregion
}


