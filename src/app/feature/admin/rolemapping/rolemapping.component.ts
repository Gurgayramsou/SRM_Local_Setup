import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../core/services/DataService';
import { RoleMappingService } from '../../../core/services/RoleMappingService';
import { FacilityMaster, RoleMaster, FilterDetails, PackageTypeMaster, FacilityCityCountryMaster, FacilityAliasMaster } from '../../../core/services/Data';
import { PagerService } from '../../../core/services/PagerService';
import { NgbModal, NgbActiveModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap, switchMap, catchError, delay } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { configuration } from '../../../../config/configuration';
import { forkJoin } from "rxjs";


@Component({
    selector: 'rebar-rolemapping',
    templateUrl: './rolemapping.html',
    styleUrls: ['./rolemapping.css']
})

export class RoleMappingComponent implements OnInit {
    message = 'Role Mapping';

    constructor(private dataService: DataService, private pagerService: PagerService, private roleMappingService: RoleMappingService, private modalService: NgbModal) {
        this.pageSize = this.selectedPageSize;
        if (location.href.toLocaleLowerCase().indexOf("local") != -1) {
            this.updatedBy = 'sumit.al.sharma';
        }
        else {
            this.updatedBy = sessionStorage["LoggedinUser"];
        }
    }
    public facilityCityCountryMaster: FacilityCityCountryMaster[] = [];
    public facilityAliasMaster: FacilityAliasMaster[] = [];
    public roleDetails: RoleMaster[] = [];
    public packageTypeDetails: PackageTypeMaster[] = [];
    packageDetails: PackageTypeMaster[] = [];
    //public facilityAliasDetails: any;
    public facilityDetails: FacilityMaster[] = [];
    vendorDetails: any;
    selectVendorId: number = -1;
    cityDetails: any;
    selectCityId: number = -1;
    public selectRoleId: number = -1;
    public selectfacilityId: Array<number>;
    public selectPackageId: number = -1;
    public selectPackageTypeId: Array<number>;
    public txtenterpriseId: string = "";
    public updatedBy: string = 'surabhi.handa';
    public currentDate: string = formatDate(new Date(), 'yyyy/MM/dd', 'en');
    //public deleteObject: any = [];
    isAddRole: boolean = true;
    IsSRMAdmin: boolean = false;
    isVendor: boolean = false;
    isCity: boolean = false;
    ModalPopUpHeader: string = "Add Role";
    //Success: string = 'Success';
    //Information: string = 'Alert';
    //paging proprty
    pager: any = {};
    count: number = 0;
    pageNumber: number = this.pagerService.pageNumber;
    pageSize: number = this.pagerService.pageSize;


    //pagingoption property
    pageOptions = this.pagerService.pageOptions;
    selectedPageSize: number = this.pagerService.selectedPageSize;

    //sorting property
    sortColumn: string = "enterpriseId";
    sortDirection: string = "desc";
    defaultSort: boolean = true;


    //filter property
    filterCount: number = 5;
    showMoreText: string = "Show More";
    showLessText: string = "Show Less";
    loadingSymbolForModal: boolean = false;
    loadingSymbol: boolean = true; // to do 
    packageData: any = null;
    packageDataDisplay: any = null;
    viewCityData: any = null;

    //#region Filter Property    

    //property used to toggle the filter
    public showEnterpriseId: boolean = false;
    public showPackageType: boolean = false;
    public showFacility: boolean = false;
    public showRole: boolean = false;
    public enableClearAll: boolean = false;

    //property used to toggle the show more filter details
    public showMorePackageType: string = this.showMoreText;
    public showMoreRole: string = this.showMoreText;
    public showMoreFacility: string = this.showMoreText;

    //property used to show count of filter
    public packageTypeCount: number = this.filterCount;
    public roleCount: number = this.filterCount;
    public facilityCount: number = this.filterCount;

    //property used to store the selcted filter values
    public filteredArray: FilterDetails[];
    public selectedEnterpriseId: string = "";
    //public selectedPackageTypeIds: Array<number>;
    public selectedRoleIds: Array<number>;
    //public selectedFacilityIds: Array<number>;

    //#endregion

    //#region Main Page
    fullAccess: boolean = true;
    noAccessMessage: string = configuration.NoAccessMessage;
    //#endregion

    //#region Filter Methods

    AddRole(addRoleModal) {
        debugger;
        this.isAddRole = true;
        this.ModalPopUpHeader = "Add Role Mapping";
        this.modalService.open(addRoleModal, { backdrop: 'static', keyboard: false, windowClass: "edit" });
    }

    EditRole(addRoleModal, e) {
        debugger;
        this.isAddRole = false;
        this.ModalPopUpHeader = "Role Mapping Details";
        this.txtenterpriseId = e.enterpriseId;
        this.selectRoleId = e.RoleId;
        this.viewObject = e;
        this.loadingSymbolForModal = true;
        var roleName = this.roleDetails.find(x => x.RoleId == this.selectRoleId).RoleNm;

        if (roleName == configuration.RoleSRMAdmin || roleName == configuration.RoleLeadership) {
            this.IsSRMAdmin = true;
            this.isCity = false;
            this.isVendor = false;
            this.selectPackageId = -2;
            //this.selectPackageId = null;
            this.packageTypeDetails = [];
            this.packageTypeDetails.push({ packageId: -2, packageName: 'All', selected: true });
            this.selectfacilityId = [];
            this.getAllFacilitiesSelected();

        }

        else if (roleName == configuration.RoleCityLead || roleName == configuration.RoleMELead) {
            this.isCity = true;
            this.isVendor = false;
            this.cityDetails = [];
            this.dataService.getCityDetails().subscribe(
                data => {
                    this.cityDetails = data;
                    this.loadingSymbolForModal = false;
                }
            );

        }
        else {
            this.isCity = false;
            this.packageTypeDetails = [];
            if (roleName == configuration.RoleVendor) {
                this.isVendor = true;
                this.vendorDetails = [];
                this.selectVendorId = -1;
                this.dataService.getVendorDetailsByUser(this.txtenterpriseId).subscribe(
                    data => {
                        this.vendorDetails = data;
                        this.selectVendorId = data[0].vendorId;
                    }
                );
            }
            this.dataService.getPackageTypeDetails().subscribe(
                data => {
                    this.packageTypeDetails = data;
                    this.loadingSymbolForModal = false;
                });
        }
        this.getViewData();
        this.modalService.open(addRoleModal, { backdrop: 'static', keyboard: false, windowClass: "edit" });

    }

    //#region method used to toggle the filter
    toggleEnterpriseId() {
        this.showEnterpriseId = !this.showEnterpriseId;
    }
    toggleRole() {
        this.showRole = !this.showRole;
    }

    //#endregion

    search = (text$: Observable<any>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => term.trim().length < 3 ? [] :
                this.roleMappingService.searchEnterprise(term.trim()).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            ),  
        )


    //#region method used to toggle the show more filter details and filter count

    displayMoreRole() {
        this.showMoreRole = this.showMoreRole == this.showMoreText ? this.showLessText : this.showMoreText;
        this.roleCount = this.showMoreRole == this.showMoreText ? this.filterCount : this.roleDetails.length;
    }

    //#region clear filter selection
    //method to clear all the selected filters
    clearAllFilter() {
        this.filteredArray = [];
        this.selectedEnterpriseId = "";
        this.selectedRoleIds = [];
        this.roleDetails.forEach(
            x => { x.selected = false; }
        );
        this.enableClearAll = false;
        this.getFilteredData();
    }

    //method to clear single selected filter
    deleteFilter(e) {

        if (e.filterName == "enterpriseId") {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "EnterpriseId");
            this.filteredArray.splice(index, 1);
            this.selectedEnterpriseId = "";
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.text == e.text);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }

            if (e.filterName == "role") {
                const indexRole: number = this.selectedRoleIds.indexOf(e.value);
                if (index !== -1) {
                    this.selectedRoleIds.splice(indexRole, 1);
                    this.roleDetails[this.roleDetails.findIndex(item => item.RoleId == e.value)].selected = false;
                }
            }

        }
        this.getFilteredData();
    }
    //#endregion


    //#region method to select filter

    selectEnterpriseId(e) {
        const index: number = this.filteredArray != undefined ? this.filteredArray.findIndex(item => item.filterName == "enterpriseId") : -1;
        if (index !== -1) {
            this.filteredArray.splice(index, 1);
        }
        if (this.filteredArray != undefined) {
            this.filteredArray.push({ value: -1, text: e.item, filterName: "enterpriseId" });
        }
        else {
            this.filteredArray = [{ value: -1, text: e.item, filterName: "enterpriseId" }]
        }
        this.selectedEnterpriseId = e.item;
        this.getFilteredData();
    }

    searchEnterpriseId() {
        if (this.selectedEnterpriseId.trim()) {
            const index: number = this.filteredArray != undefined ? this.filteredArray.findIndex(item => item.filterName == "enterpriseId") : -1;
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ value: -1, text: this.selectedEnterpriseId.trim(), filterName: "enterpriseId" });
            }
            else {
                this.filteredArray = [{ value: -1, text: this.selectedEnterpriseId.trim(), filterName: "enterpriseId" }]
            }
            this.getFilteredData();
        }
    }

    selectRole(e) {
        if (e.selected) {
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ value: e.RoleId, text: e.RoleNm, filterName: "role" });
            }
            else {
                this.filteredArray = [{ value: e.RoleId, text: e.RoleNm, filterName: "role" }]
            }

            if (this.selectedRoleIds != undefined) {
                this.selectedRoleIds.push(e.RoleId);
            }
            else {
                this.selectedRoleIds = [e.RoleId];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "role" && item.value == e.RoleId);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexRole: number = this.selectedRoleIds.indexOf(e.RoleId);
            if (index !== -1) {
                this.selectedRoleIds.splice(indexRole, 1);
            }
        }
        this.getFilteredData();
    }


    //Called this method to get filtered data
    public getFilteredData(): void {
        debugger;
        this.loadingSymbol = true; // to do
        this.packageData = null;
        this.count = 0;
        let length: number = this.filteredArray != null ? this.filteredArray.length : 0;
        if (length == 0) {
            this.enableClearAll = false;
            this.roleMappingService.getRoleMappingGridData(this.pageNumber, this.sortColumn, this.sortDirection, this.pageSize, this.updatedBy).subscribe(
                data => {
                    this.packageData = data;
                    if (this.packageData != null) {
                        this.count = this.packageData[1][0].totalRecordCount;//.length;
                    }
                    this.setPager();
                }
            );
        } else {
            this.enableClearAll = true;
            this.roleMappingService.getRoleMappingGridDataByFilter(this.selectedEnterpriseId, this.selectedRoleIds, this.pageNumber, this.sortColumn, this.sortDirection, this.pageSize).subscribe(
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
        debugger;
        this.packageDataDisplay = null;
        this.pager = {};
        this.pager = this.pagerService.getPager(this.count, this.pageNumber, this.pageSize);
        this.packageDataDisplay = this.packageData[0];//.slice(this.pager.startIndex, this.pager.endIndex + 1);
        this.packageDataDisplay.forEach((x) => {
            var dt=new Date(x.modifiedon);
            dt.setHours(dt.getHours()-5);
            dt.setMinutes(dt.getMinutes()-30);
            x.modifiedon=new Date(dt).toUTCString();
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

    //#region View Package Facility Details Modal
    public viewObject: any = [];
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
    sortColumnView: string = "packageId";
    sortDirectionView: string = "asc";
    defaultSortView: boolean = true;

    //Called this method to get filtered view data
    public getViewData(): void {
        debugger;
        this.loadingSymbolForModal = true;
        const roleId: number = this.viewObject.RoleId;
        const enterpriseId: string = this.viewObject.enterpriseId
        this.viewCityData = null;
        this.viewPackageDataDisplay = null;
        this.viewPackageData = null;
        this.countView = 0;
        this.pagerView = {};
        var roleName = this.roleDetails.find(x => x.RoleId == roleId).RoleNm;
        if (roleName == configuration.RoleCityLead || roleName == configuration.RoleMELead) {
            this.viewPackageDataDisplay = null;
            this.roleMappingService.getCityNames(this.viewObject.userId, roleId).subscribe(
                data => {
                    this.viewCityData = null;
                    this.viewCityData = data;
                    this.loadingSymbolForModal = false;
                }
            );
        }
        else {
            this.viewCityData = null;

            this.roleMappingService.getRoleMappingGridDataOnAction(this.pageNumberView, this.sortColumnView, this.sortDirectionView, this.pageSizeView, roleId, enterpriseId).subscribe(
                data => {
                    this.viewPackageData = null;
                    this.viewPackageData = data;
                    if (this.viewPackageData != null) {
                        this.countView = this.viewPackageData[1][0].totalRecordCount;
                        this.setPagerView();
                    }
                }
            );
            //this.pagerView;
        }
    }

    setPagerView() {
        this.viewPackageDataDisplay = null;
        this.pagerView = {};
        this.pagerView = this.pagerService.getPager(this.countView, this.pageNumberView, this.pageSizeView);
        //this.viewPackageDataDisplay = this.viewPackageData[0];
        this.viewPackageDataDisplay = this.viewPackageData[0].map(val => {
            return Object.assign({}, val, this.packageDetails.filter(v => v.packageId === val.packageId)[0]);
            //return Object.assign({}, val, this.packageTypeDetails.filter(v => v.packageId === val.packageId)[0]);
        });
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
        this.pageNumberView = page;
        this.getViewData();
    }

    //Called this method on page option changes
    onPagingOptionsChangeView(e: number) {
        this.selectedPageSizeView = +e;
        this.pageSizeView = this.selectedPageSizeView;
        this.pageNumberView = 1;
        this.getViewData();
    }
    //#endregion

    ngOnInit() {
        this.dataService.CheckAdminRoleAccessForPages(this.updatedBy, location.pathname).subscribe(
            data => {
                if (data.length != 0) {
                    this.loadingSymbol = true;
                    this.GetGridDataOnLoad();
                    this.roleMappingService.getRoleDetails().subscribe(
                        data => {
                            this.roleDetails = data;
                        });

                    this.roleMappingService.getFacilityAliasDetails().subscribe(
                        data => {
                            this.facilityDetails = data;
                        });

                    this.dataService.getPackageTypeDetails().subscribe(
                        data => {
                            this.packageDetails = data;
                        });
                    // this.dataService.getFacilityDetails().subscribe(
                    //     data => {
                    //         this.facilityDetails = data;
                    //     });
                    this.dataService.FacilityCityCountryDetails().subscribe(
                        data => {
                            this.facilityCityCountryMaster = data;
                        }
                    )
                    this.dataService.FacilityAliasDetails().subscribe(
                        data => {
                            this.facilityAliasMaster = data;
                        }
                    );
                }
                else {
                    this.loadingSymbol = false;
                    this.fullAccess = false;
                }
            });
    }

    public GetGridDataOnLoad(): void {
        this.loadingSymbol = true;
        this.packageData = null;
        this.count = 0;
        this.roleMappingService.getRoleMappingGridData(this.pageNumber, this.sortColumn, this.sortDirection, this.pageSize, this.updatedBy).subscribe(
            data => {
                this.packageData = data;
                if (this.packageData != null) {
                    this.count = this.packageData[1][0].totalRecordCount;
                    this.setPager();
                }
            }
        );
    }


    cancelbtn() {
        this.selectRoleId = -1;
        this.selectPackageId = -1;
        this.selectCityId = -1;
        this.selectVendorId = -1;
        this.packageTypeDetails = [];
        this.isCity = false;
        this.isVendor = false;
        this.IsSRMAdmin = false;
        //this.selectPackageTypeId = [];
        this.selectfacilityId = [];
        this.txtenterpriseId = "";
        this.viewObject = [];
        this.modalService.dismissAll();
        //this.GetGridDataOnLoad();
        //this.getFilteredData();
    }

    Savebtn() {
        debugger;
        let enterpriseid = this.txtenterpriseId.trim();
        if (this.selectRoleId != -1) {
            var roleName = this.roleDetails.find(x => x.RoleId == this.selectRoleId).RoleNm;
            if ((enterpriseid == "" || this.selectPackageId == -1 || this.selectfacilityId == [] || this.selectfacilityId == undefined || this.selectfacilityId.length <= 0) && (roleName != configuration.RoleCityLead && roleName != configuration.RoleMELead && roleName != configuration.RoleVendor)) {
                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                modalRef.componentInstance.title = configuration.Mandatory;
                modalRef.componentInstance.message = configuration.MandatoryMessage;
                this.loadingSymbolForModal = false;

            }
            else if ((enterpriseid == "" || this.selectCityId == -1) && (roleName == configuration.RoleCityLead || roleName == configuration.RoleMELead)) {
                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                modalRef.componentInstance.title = configuration.Mandatory;
                modalRef.componentInstance.message = configuration.MandatoryMessage;
                this.loadingSymbolForModal = false;

            }
            else if ((enterpriseid == "" || this.selectPackageId == -1 || this.selectfacilityId == [] || this.selectfacilityId == undefined || this.selectfacilityId.length <= 0 || this.selectVendorId == -1) && roleName == configuration.RoleVendor) {
                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                modalRef.componentInstance.title = configuration.Mandatory;
                modalRef.componentInstance.message = configuration.MandatoryMessage;
                this.loadingSymbolForModal = false;

            }

            else {
                this.loadingSymbolForModal = true;
                if (enterpriseid.toLowerCase().includes("@external")) {
                    var externalemailid: string = enterpriseid;
                    //enterpriseid =enterpriseid.substring(0,enterpriseid.indexOf("@"));
                    this.saveUser(enterpriseid, externalemailid, roleName);
                }
                else {
                    this.roleMappingService.validateEnterpriseId(enterpriseid).subscribe(async data => {
                        if (data.value.length > 0) {
                            var emailId: string;
                            //emailId = enterpriseid + '@accenture.com';
                            emailId = data.value[0].InternetMail;
                            //alert(emailId);
                            this.saveUser(enterpriseid, emailId, roleName);
                        }
                        else {
                            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                            modalRef.componentInstance.message = "Enterprise Id is not valid.";
                            modalRef.componentInstance.title = configuration.Alert;
                            this.loadingSymbolForModal = false;
                            return;
                        }

                    });
                }
            }

        }
        else {
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            modalRef.componentInstance.title = configuration.Mandatory;
            modalRef.componentInstance.message = configuration.MandatoryMessage;
            this.loadingSymbolForModal = false;
        }
    }

    saveUser(enterpriseid: string, emailId: string, roleName: string) {
        let userId: number;
        this.roleMappingService.CheckEnterpriseId(enterpriseid).subscribe(
            data => {
                if (data != null && data.length > 0) {
                    userId = data[0].UserId;
                    //alert(userid);
                    if (roleName == configuration.RoleVendor && this.isAddRole == true) {
                        this.dataService.getVendorDetailsByUser(enterpriseid).subscribe(
                            data => {
                                if (data.length > 0) {
                                    const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                    modalRef.componentInstance.message = configuration.VendorExistsMessage;
                                    modalRef.componentInstance.title = configuration.Alert;
                                    this.loadingSymbolForModal = false;
                                    return;
                                }
                                else {
                                    this.saveDetails(userId, enterpriseid);
                                }
                            });
                    }
                    else {
                        this.saveDetails(userId, enterpriseid);
                    }

                }
                else {
                    // insert enterprise id in Users 
                    this.roleMappingService.InsertEnterpriseId(enterpriseid, emailId, this.currentDate).subscribe(
                        data => {
                            userId = data;
                            //this.saveDetails(userId, enterpriseid);
                            if (roleName == configuration.RoleVendor) {
                                this.dataService.getVendorDetailsByUser(enterpriseid).subscribe(
                                    data => {
                                        if (data.length > 0) {
                                            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                            modalRef.componentInstance.message = configuration.VendorExistsMessage;
                                            modalRef.componentInstance.title = configuration.Alert;
                                            this.loadingSymbolForModal = false;
                                            return;
                                        }
                                        else {
                                            this.saveDetails(userId, enterpriseid);
                                        }
                                    });
                            }
                            else {
                                this.saveDetails(userId, enterpriseid);
                            }
                        });
                }

            });
    }
    saveDetails(userId: number, enterpriseid: string) {
        debugger;
        if (this.selectPackageId == -2) {
            this.selectPackageId = null;
        }
        var roleName = this.roleDetails.find(x => x.RoleId == this.selectRoleId).RoleNm;
        if (roleName == configuration.RoleVendor && this.isAddRole == true) {
            this.roleMappingService.CheckVendorUserMappingExists(this.selectVendorId, userId).subscribe(
                data => {
                    if (data[0].TotalRecordCount == 0) {
                        // Insert new record
                        this.roleMappingService.InsertDataIntoUserSPMapping(this.selectVendorId, userId, this.updatedBy, this.currentDate).subscribe();
                    }

                });
        }
        // Check Record exists or Not
        this.roleMappingService.CheckRoleUserMappingExists(this.selectRoleId, userId).subscribe(
            data => {
                if (data[0].TotalRecordCount == 0) {
                    // Insert new record into Role User Mapping Table
                    this.roleMappingService.InsertDataIntoRoleUserMapping(this.selectRoleId, userId, enterpriseid, this.currentDate).subscribe(
                        data => {
                        }
                    );

                }
            });
        var SaveRoleMappingDetails = [];
        var SaveRecords = [];
        var PackageFacilityFilter = " AND (";
        var ORCondition = "";
        //for (var i = 0; i < this.selectPackageTypeId.length; i++) {
        for (var j = 0; j < this.selectfacilityId.length; j++) {
            var data1 =
            {
                UserId: userId,
                FacilityId: this.selectfacilityId[j],
                //FacilityAliasId: this.selectfacilityId[j] 
                PackageId: this.selectPackageId, //this.selectPackageTypeId[i],
                RoleId: this.selectRoleId,
                IsActive: 1,
                CreatedBy: this.updatedBy, CreateDttm: this.currentDate, UpdatedBy: this.updatedBy, UpdatedDttm: this.currentDate
            };
            SaveRoleMappingDetails.push(data1);
            var PackageId = this.selectPackageId //this.selectPackageTypeId[i];
            var FacilityId = this.selectfacilityId[j];
            if (PackageId == null) {
                PackageFacilityFilter = PackageFacilityFilter + ORCondition + "(PackageId is " + PackageId + " AND FacilityAliasId =" + FacilityId + ")";
                ORCondition = " OR ";
            }
            else {
                PackageFacilityFilter = PackageFacilityFilter + ORCondition + "(PackageId=" + PackageId + " AND FacilityAliasId=" + FacilityId + ")";
                ORCondition = " OR ";
            }
        }

        //}
        PackageFacilityFilter = PackageFacilityFilter + ")"
        this.roleMappingService.CheckUserFacilityMappingExists(this.selectRoleId, userId, PackageFacilityFilter).subscribe(
            data => {

                for (var i = 0; i < SaveRoleMappingDetails.length; i++) {
                    let packageIds = data.filter(item => item.PackageId == SaveRoleMappingDetails[i].PackageId);
                    let facilityIds = packageIds.filter(item => item.FacilityId == SaveRoleMappingDetails[i].FacilityId);
                    if (facilityIds.length == 0) {
                        SaveRecords.push(SaveRoleMappingDetails[i]);

                    }

                }

                // Insert into User Facility Mapping Table
                if (SaveRecords.length > 0) {

                    this.roleMappingService.InsertDataIntoUserFacilityMapping(SaveRecords).subscribe(
                        data => {
                            //console.log(data);
                            if (data > 0) {
                                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                modalRef.componentInstance.message = "Record has been saved successfully.";
                                modalRef.componentInstance.title = configuration.Success;
                                this.loadingSymbolForModal = false;
                                if (this.isAddRole == false) {
                                    // this.selectPackageTypeId = [];
                                    this.selectPackageId = -1;
                                    this.selectfacilityId = [];
                                    this.getViewData();

                                }
                                else {
                                    this.clearAllFields();
                                    this.getFilteredData();
                                }
                                return;
                            }
                        }
                    );
                }
                else {
                    const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                    modalRef.componentInstance.message = configuration.RecordExistsMessage;
                    modalRef.componentInstance.title = configuration.Alert;
                    this.loadingSymbolForModal = false;
                    return;
                }

            }
        );
    }
    clearAllFields() {
        if (this.isAddRole == false) {
            this.selectPackageId = -1;
            this.selectCityId = -1;
            //this.selectVendorId = -1;
            //this.selectPackageTypeId = [];
            this.selectfacilityId = [];

        }
        else {

            this.selectRoleId = -1;
            this.selectPackageId = -1;
            this.selectCityId = -1;
            this.selectVendorId = -1;
            //this.selectPackageTypeId = [];
            this.selectfacilityId = [];
            this.txtenterpriseId = "";
        }
    }

    // Delete Record 
    public DeleteRecord(e) //public DeleteRecord(addRoleModal,e)
    {
        debugger;
        this.loadingSymbolForModal = true;
        var isActive = 0;
        if (this.viewObject.RoleNm == configuration.RoleCityLead || this.viewObject.RoleNm == configuration.RoleMELead) {
            if (this.viewCityData.length > 1) {
                this.roleMappingService.DeleteCityMapping(this.viewObject.userId, this.viewObject.RoleId, e.CityNm, this.updatedBy, this.currentDate, isActive).subscribe(
                    data => {
                        if (data.affectedRows > 0) {
                            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                            modalRef.componentInstance.message = "Record has been deleted successfully.";
                            modalRef.componentInstance.title = configuration.Success;
                            this.loadingSymbolForModal = true;
                            this.getViewData();
                            this.getFilteredData();

                        }
                    });
            }
            else if (this.viewCityData.length == 1) {
                debugger;
                this.DeleteRolePopup(this.viewObject);
            }
        }
        else {
            if (this.viewPackageDataDisplay.length > 1) {
                debugger;
                // this.loadingSymbolForModal = true;
                // var isActive = 0;
                // this.roleMappingService.CheckEnterpriseId(this.viewObject.enterpriseId.trim()).subscribe(
                //     data => {
                //         if (data != null && data.length > 0) {

                // var roleName = this.roleDetails.find(x => x.RoleId == this.viewObject.RoleId).RoleNm;  
                // if (roleName == configuration.RoleCityLead || roleName == configuration.RoleMELead)
                // { 
                //     this.roleMappingService.DeleteCityMapping(data[0].UserId,this.viewObject.RoleId,e.CityNm,this.updatedBy,this.currentDate, isActive).subscribe(
                //       data => {
                //             if (data.affectedRows > 0) {
                //                 const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                //                 modalRef.componentInstance.message = "Record has been deleted successfully.";
                //                 modalRef.componentInstance.title = configuration.Success;
                //                 this.loadingSymbolForModal = true;
                //                 this.getViewData();
                //                 this.getFilteredData();

                //             }
                //         });
                // }
                // else
                // {
                //this.roleMappingService.UpdateRecordInUserFacilityMapping(data[0].UserId, e.packageId, this.viewObject.RoleId, e.facilityId, this.updatedBy, this.currentDate, isActive).subscribe(
                this.roleMappingService.UpdateRecordInUserFacilityMapping(this.viewObject.userId, e.packageId, this.viewObject.RoleId, e.facilityId, this.updatedBy, this.currentDate, isActive).subscribe(
                    data => {
                        if (data.affectedRows > 0) {
                            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                            modalRef.componentInstance.message = "Record has been deleted successfully.";
                            modalRef.componentInstance.title = configuration.Success;
                            this.loadingSymbolForModal = true;
                            this.getViewData();
                            this.getFilteredData();

                        }
                    });
                //}


                //}
                //});
            }
            else if (this.viewPackageDataDisplay.length == 1) {
                debugger;
                this.DeleteRolePopup(this.viewObject);
            }
        }
    }

    public confirm(title: string, message: string): Promise<boolean> {
        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.message = message;
        return modalRef.result;
    }

    DeleteRolePopup(item) {
        debugger;
        this.confirm(configuration.Confirm, configuration.ConfirmDelete)
            .then((confirmed) => {
                console.log(confirmed);
                if (confirmed) {
                    debugger;
                    this.loadingSymbol = true;
                    var isActive = 0;
                    var roleName = this.roleDetails.find(x => x.RoleId == item.RoleId).RoleNm;
                    if (roleName == configuration.RoleVendor) {
                        this.dataService.getVendorDetailsByUser(item.enterpriseId.trim()).subscribe(
                            data => {
                                if (data.length > 0) {
                                    this.roleMappingService.DeleteVendorUserMapping(item.userId, data[0].vendorId, this.updatedBy, this.currentDate, isActive).subscribe();
                                }

                            }
                        );

                    }
                    this.roleMappingService.DeleteRole(item.userId, item.RoleId, this.updatedBy, this.currentDate, isActive).subscribe(
                        data => {
                            if (data.affectedRows > 0) {
                                this.roleMappingService.DeleteRecordInUserFacilityTable(item.userId, item.RoleId, this.updatedBy, this.currentDate, isActive).subscribe(
                                    data => {
                                        if (data.affectedRows > 0) {
                                            this.modalService.dismissAll();
                                            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                            modalRef.componentInstance.message = "Role has been deleted successfully.";
                                            modalRef.componentInstance.title = configuration.Success;
                                            this.cancelbtn();
                                            this.getFilteredData();
                                        }
                                    });
                            }
                        });
                }
                else {
                    this.loadingSymbol = false;
                    this.loadingSymbolForModal = false;
                }
            })
            .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
    }

    onRoleChange() {
        if (this.selectRoleId !== -1) {
            var roleName = this.roleDetails.find(x => x.RoleId == this.selectRoleId).RoleNm;
            if (roleName == configuration.RoleSRMAdmin || roleName == configuration.RoleLeadership) //if(this.selectRoleId == 2) // SRM Admin
            {
                this.IsSRMAdmin = true;
                this.isVendor = false;
                this.isCity = false;
                this.selectPackageId = -2; //this.selectPackageId = null;
                this.selectfacilityId = [];
                this.packageTypeDetails = [];
                this.packageTypeDetails.push({ packageId: -2, packageName: 'All', selected: true });
                this.loadingSymbolForModal = true;
                this.getAllFacilitiesSelected();
            }
            else if (roleName == configuration.RoleVendor) {
                this.loadingSymbolForModal = true;
                this.IsSRMAdmin = false;
                this.isVendor = true;
                this.isCity = false;
                this.selectPackageId = -1;
                this.packageTypeDetails = [];
                this.vendorDetails = [];
                this.dataService.getPackageTypeDetails().subscribe(
                    data => {
                        this.packageTypeDetails = data;
                        this.loadingSymbolForModal = false;
                    });
                this.dataService.getVendorDetails().subscribe(
                    data => {
                        this.vendorDetails = data;
                        this.loadingSymbolForModal = false;
                    }
                );
            }
            else if (roleName == configuration.RoleCityLead || roleName == configuration.RoleMELead)    //(this.selectRoleId == 12) // City Lead & ME Lead
            {
                this.loadingSymbolForModal = true;
                this.IsSRMAdmin = false;
                this.isCity = true;
                this.cityDetails = [];
                this.dataService.getCityDetails().subscribe(
                    data => {
                        this.cityDetails = data;
                        this.loadingSymbolForModal = false;
                    }
                );
            }
            else {
                this.isVendor = false;
                this.IsSRMAdmin = false;
                this.isCity = false;
                this.selectPackageId = -1;
                this.packageTypeDetails = [];
                this.loadingSymbolForModal = true;
                this.dataService.getPackageTypeDetails().subscribe(
                    data => {
                        this.packageTypeDetails = data;
                        this.loadingSymbolForModal = false;
                    });
                this.selectfacilityId = [];
            }
        }
        else {
            this.IsSRMAdmin = false;
            this.selectPackageId = -1;
            this.packageTypeDetails = [];

        }

    }


    onPackageChange() {
        if (this.selectPackageId != -1 && this.selectPackageId != -2) {
            this.loadingSymbolForModal = true;
            this.selectfacilityId = [];
            this.facilityDetails = [];
            let getFacilityAliasIds = this.roleMappingService.getFacilityAliasIdsByPackage(this.selectPackageId);
            let getFacilityAliasDetails = this.roleMappingService.getFacilityAliasDetails();
            forkJoin([getFacilityAliasIds, getFacilityAliasDetails]).subscribe(results => {
                let facilityAliasIdsByPackage = results[0];
                let facilityAliasIdDetails = results[1];
                if (facilityAliasIdDetails.length != 0) {
                    let facilityIds = facilityAliasIdsByPackage.map(x => x.facilityId);
                    this.facilityDetails = facilityAliasIdDetails.filter(u => facilityIds.includes(u.facilityId));
                    //this.facilityAliasDetails = facilityAliasIdDetails.filter(u => facilityIds.includes(u.facilityId));
                    console.log(this.facilityDetails);
                    this.loadingSymbolForModal = false;
                }
            });
        }
        else if (this.selectPackageId == -2) {
            this.loadingSymbolForModal = true;
            this.selectfacilityId = [];
            this.getAllFacilitiesSelected();
        }
        else {
            this.selectfacilityId = [];
            this.facilityDetails = [];
        }
    }

    onCityChange() {
        this.selectPackageId = -2;//this.selectPackageId = null;
        let facilityIdsByCity: Array<number> = [];
        this.selectfacilityId = [];
        if (this.selectCityId != -1) {

            let facilityIds = this.facilityCityCountryMaster.filter(x => x.CityId == this.selectCityId).map(x => x.FacilityId);
            this.selectfacilityId = this.facilityAliasMaster.filter(x => facilityIds.includes(x.FacilityId)).map(x => x.FacilityAliasId);

            // this.dataService.getFacilityDetailsByCityId(this.selectCityId).subscribe(
            //     data => {
            //         for (var i = 0; i < data.length; i++) {
            //             facilityIdsByCity.push(data[i].facilityId);
            //         }

            //         this.roleMappingService.getFacilityAliasDetailsByfacilityIds(facilityIdsByCity).subscribe(
            //             result => {
            //                 for (var i = 0; i < result.length; i++) {
            //                     this.selectfacilityId.push(result[i].facilityId);
            //                 }
            //             }
            //         )
            //     }
            // );
        }
    }

    getAllFacilitiesSelected() {
        this.facilityDetails = [];
        this.roleMappingService.getFacilityAliasDetails().subscribe(
            data => {
                this.facilityDetails = data;
                for (var i = 0; i < data.length; i++) {
                    this.facilityDetails[i].selected = true;
                    this.selectfacilityId.push(this.facilityDetails[i].facilityId);
                }
                this.loadingSymbolForModal = false;

            });
    }

}
