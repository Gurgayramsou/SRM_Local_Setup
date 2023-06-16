import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../core/services/DataService';
import { RoleDeatials, RoleMasterService, RoleMenuDeatials } from '../../../core/services/RoleMasterService';
import { FacilityMaster, RoleMaster, FilterDetails, StatusMaster, FacilityCityCountryMaster, FacilityAliasMaster } from '../../../core/services/Data';
import { PagerService } from '../../../core/services/PagerService';
import { NgbModal, NgbActiveModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap, switchMap, catchError, delay } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { configuration } from '../../../../config/configuration';
import { forkJoin } from "rxjs";


@Component({
    selector: 'rebar-rolemaster',
    templateUrl: './rolemaster.html',
    styleUrls: ['./rolemaster.css']
})

export class RoleMasterComponent implements OnInit {
    message = 'Role Master';

    constructor(private dataService: DataService, private pagerService: PagerService, private roleMasterService: RoleMasterService, private modalService: NgbModal) {
        this.pageSize = this.selectedPageSize;
        if (location.href.toLocaleLowerCase().indexOf("local") != -1) {
            this.loggedEnterpriseId = sessionStorage["LoggedinUser"];
        }
        else {
            this.loggedEnterpriseId = sessionStorage["LoggedinUser"];
        }
    }

    loadingSymbol: boolean = true;
    noAccessMessage: string = configuration.NoAccessMessage;
    fullAccess: boolean = true;
    loggedEnterpriseId: string = "";

    //paging proprty
    pager: any = {};
    count: number = 0;
    pageNumber: number = this.pagerService.pageNumber;
    pageSize: number = this.pagerService.pageSize;

    //pagingoption property
    pageOptions = this.pagerService.pageOptions;
    selectedPageSize: number = this.pagerService.selectedPageSize;

    //sorting property
    sortColumn: string = "RoleName";
    sortDirection: string = "asc";
    defaultSort: boolean = true;

    //filter property
    filterCount: number = 5;
    showMoreText: string = "Show More";
    showLessText: string = "Show Less";

    roleDetails: RoleDeatials[] = [];
    roleData: RoleDeatials[] = [];
    roleDataDisplay: RoleDeatials[] = [];
    roleMasterDetails: RoleMaster[] = [];
    statusDetails: StatusMaster[] = [{ statusId: 1, statusName: "Active", selected: false }, { statusId: 0, statusName: "Inactive", selected: false }];

    //#region Filter Property

    //property used to toggle the filter
    public showRoleName: boolean = false;
    public showStatus: boolean = false;
    public enableClearAll: boolean = false;

    //property used to toggle the show more filter details
    public showMoreRoleName: string = this.showMoreText;
    public showMoreStatus: string = this.showMoreText;

    //property used to show count of filter
    public roleNameCount: number = this.filterCount;
    public statusCount: number = this.filterCount;

    //property used to store the selcted filter values
    public filteredArray: FilterDetails[] = [];
    public selectedRoleIds: Array<number> = [];
    public selectedStatusIds: Array<number> = [];

    //#endregion

    //#region Filter Methods

    //#region method used to toggle the filter
    toggleRoleName() {
        this.showRoleName = !this.showRoleName;
    }
    toggleStatus() {
        this.showStatus = !this.showStatus;
    }
    //#endregion

    //#region method used to toggle the show more filter details and filter count
    displayMoreRoleName() {
        this.showMoreRoleName = this.showMoreRoleName == this.showMoreText ? this.showLessText : this.showMoreText;
        this.roleNameCount = this.showMoreRoleName == this.showMoreText ? this.filterCount : this.roleMasterDetails.length;
    }

    displayMoreStatus() {
        this.showMoreStatus = this.showMoreStatus == this.showMoreText ? this.showLessText : this.showMoreText;
        this.statusCount = this.showMoreStatus == this.showMoreText ? this.filterCount : this.statusDetails.length;
    }
    //#endregion

    //#region clear filter selection

    //method to clear all the selected filters
    clearAllFilter() {
        this.filteredArray = [];
        this.selectedRoleIds = [];
        this.selectedStatusIds = [];
        this.roleMasterDetails.forEach(
            x => { x.selected = false; }
        );
        this.statusDetails.forEach(
            x => { x.selected = false; }
        );
        this.enableClearAll = false;
        this.getFilteredData();
    }

    //method to clear single selected filter
    deleteFilter(e) {

        const index: number = this.filteredArray.findIndex(item => item.text == e.text);
        if (index !== -1) {
            this.filteredArray.splice(index, 1);
        }

        if (e.filterName == "roleName") {
            debugger;
            const indexRole: number = this.selectedRoleIds.indexOf(e.value);
            if (index !== -1) {
                this.selectedRoleIds.splice(indexRole, 1);
                this.roleMasterDetails[this.roleMasterDetails.findIndex(item => item.RoleId == e.value)].selected = false;
            }
        }
        else if (e.filterName == "status") {
            const indexStatus: number = this.selectedStatusIds.indexOf(e.value);
            if (index !== -1) {
                this.selectedStatusIds.splice(indexStatus, 1);
                this.statusDetails[this.statusDetails.findIndex(item => item.statusId == e.value)].selected = false;
            }
        }
        this.getFilteredData();
    }
    //#endregion

    //#region method to select filter

    selectRoleName(e) {
        if (e.selected) {
            this.filteredArray.push({ value: e.RoleId, text: e.RoleNm, filterName: "roleName" });
            this.selectedRoleIds.push(e.RoleId);
            // if (this.filteredArray != undefined) {
            //     this.filteredArray.push({ value: e.RoleId, text: e.facilityName, filterName: "roleName" });
            // }
            // else {
            //     this.filteredArray = [{ value: e.RoleId, text: e.facilityName, filterName: "roleName" }]
            // }

            // if (this.selectedRoleIds != undefined) {
            //     this.selectedRoleIds.push(e.RoleId);
            // }
            // else {
            //     this.selectedRoleIds = [e.RoleId];
            // }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "roleName" && item.value == e.RoleId);
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

    selectStatus(e) {
        if (e.selected) {
            this.filteredArray.push({ value: e.statusId, text: e.statusName, filterName: "status" });
            this.selectedStatusIds.push(e.statusId);
            // if (this.filteredArray != undefined) {
            //     this.filteredArray.push({ value: e.statusId, text: e.statusName, filterName: "status" });
            // }
            // else {
            //     this.filteredArray = [{ value: e.statusId, text: e.statusName, filterName: "status" }]
            // }

            // if (this.selectedStatusIds != undefined) {
            //     this.selectedStatusIds.push(e.statusId);
            // }
            // else {
            //     this.selectedStatusIds = [e.statusId];
            // }
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

    //#endregion

    //#endregion


    ngOnInit() {
        debugger;
        this.roleMasterService.getRoleDetails().subscribe(
            data => {
                this.roleDetails = data;
                this.roleData = data;
                this.roleData.forEach(x => { this.roleMasterDetails.push({ RoleId: x.RoleId, RoleNm: x.RoleName, selected: false }) }
                )
                this.roleMasterDetails.sort((a, b) => a["RoleNm"].localeCompare(b["RoleNm"]));
                this.count = data.length;
                this.setPager();
                this.loadingSymbol = false;
            }
        );
        // this.dataService.CheckAdminRoleAccessForPages(this.loggedEnterpriseId, location.pathname).subscribe(
        //     data => {
        //         if (data.length != 0) {
        //             this.roleMasterService.getRoleDetails().subscribe(
        //                 data => {
        //                     this.roleDetails = data;
        //                     this.roleData = data;
        //                     this.roleData.forEach(x => { this.roleMasterDetails.push({ RoleId: x.RoleId, RoleNm: x.RoleName, selected: false }) }
        //                     )
        //                     this.count = data.length;
        //                     this.setPager();
        //                 }
        //             );
        //         }
        //         else {
        //             this.loadingSymbol = false;
        //             this.fullAccess = false;
        //         }
        //     }
        // );
    }

    getFilteredData() {
        debugger;
        this.loadingSymbol = true;
        let length: number = this.filteredArray.length;
        if (length == 0) {
            this.enableClearAll = false;
            this.roleData = this.roleDetails;
            this.count = this.roleData.length;
            this.setPager();
            this.loadingSymbol = false;
        }
        else {
            this.enableClearAll = true;
            let data1 = this.roleDetails;
            if (this.selectedRoleIds.length != 0) {
                data1 = data1.filter(u => this.selectedRoleIds.includes(u.RoleId));
            }
            if (this.selectedStatusIds.length != 0) {
                data1 = data1.filter(u => this.selectedStatusIds.includes(+u.StatusId));
            }
            this.roleData = data1;
            this.count = this.roleData.length;
            this.setPager();
            this.loadingSymbol = false;
        }
    }

    setPager() {
        //debugger;
        //console.log(this.roleData);
        this.pager = this.pagerService.getPager(this.count, this.pageNumber, this.pageSize);
        if (this.sortDirection == "asc") {
            this.roleDataDisplay = this.roleData.sort((a, b) => a[this.sortColumn].localeCompare(b[this.sortColumn])).slice(this.pager.startIndex, this.pager.endIndex + 1);
            this.roleDataDisplay.forEach((x) => {
                var dt=new Date(x.UpdatedDate);
                dt.setHours(dt.getHours()-5);
                dt.setMinutes(dt.getMinutes()-30);
                x.UpdatedDate=new Date(dt).toUTCString();
            });
        }
        else if (this.sortDirection == "desc") {
            this.roleDataDisplay = this.roleData.sort((a, b) => b[this.sortColumn].localeCompare(a[this.sortColumn])).slice(this.pager.startIndex, this.pager.endIndex + 1);
            this.roleDataDisplay.forEach((x) => {
                var dt=new Date(x.UpdatedDate);
                dt.setHours(dt.getHours()-5);
                dt.setMinutes(dt.getMinutes()-30);
                x.UpdatedDate=new Date(dt).toUTCString();
            });
        }

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

    //#region Edit Existing Role

    changeStatus(item) {
        //console.log(item);
        let currentStaus = item.StatusName;
        let newStatus = null;
        let newStatusId = null;
        if (item.StatusName == "Active") {
            newStatus = "Inactive";
            newStatusId = 0;
        }
        else if (item.StatusName == "Inactive") {
            newStatus = "Active";
            newStatusId = 1;
        }
        let message = "Do you want to change the status of Role " + item.RoleName + " from " + currentStaus + " to " + newStatus + " ?"
       
        this.confirm(configuration.Confirm, message)
            .then((confirmed) => {
                if (confirmed) {
                    this.roleMasterService.updateRoleDetails(item.RoleId, newStatusId, this.loggedEnterpriseId).subscribe(
                        data => {
                            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                            modalRef.componentInstance.title = configuration.Success;
                            modalRef.componentInstance.message = configuration.UpdateMessage;
                            this.RelodGrid();
                            this.loadingSymbolForAddRoleModal = false;
                        }
                    );
                }
                else {
                    this.modalService.dismissAll();
                }
            })
            .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));;
    }

    public confirm(title: string, message: string): Promise<boolean> {
        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.message = message;
        return modalRef.result;
    }

    //#endregion


    //#region Add New Role

    loadingSymbolForAddRoleModal: boolean = true;
    roleName: string;
    AddRole(addRoleModal) {
        this.loadingSymbolForAddRoleModal = false;
        this.modalService.open(addRoleModal, { backdrop: 'static', keyboard: false, windowClass: "create" });
    }

    SaveRole() {
        this.loadingSymbolForAddRoleModal = true;
        let roleName = this.roleName.replace(/\s+/g," ").trim();
        if (roleName == "" || roleName == null) {
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            modalRef.componentInstance.title = configuration.Mandatory;
            modalRef.componentInstance.message = configuration.MandatoryMessage;
            this.loadingSymbolForAddRoleModal = false;
        }
        else {
            let duplicateRoleCount = this.roleDetails.filter(x => x.RoleName.toLowerCase() == roleName.toLowerCase()).length;
            if (duplicateRoleCount > 0) {
                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                modalRef.componentInstance.title = configuration.Alert;
                modalRef.componentInstance.message = "Role Name already exits.";
                this.loadingSymbolForAddRoleModal = false;
            }
            else {
                this.roleMasterService.saveRoleDetails(roleName, this.loggedEnterpriseId).subscribe(
                    data => {
                        this.CloseRoleModal();
                        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                        modalRef.componentInstance.title = configuration.Success;
                        modalRef.componentInstance.message = configuration.SaveMessage;
                        this.RelodGrid();
                        this.loadingSymbolForAddRoleModal = false;                        
                    }
                );
            }
        }
    }

    RelodGrid() {
        this.roleMasterService.getRoleDetails().subscribe(
            data => {
                this.roleDetails = data;
                this.roleData = data;
                this.roleData.forEach(x => { this.roleMasterDetails.push({ RoleId: x.RoleId, RoleNm: x.RoleName, selected: false }) }
                )
                this.roleMasterDetails.sort((a, b) => a["RoleNm"].localeCompare(b["RoleNm"]));
                this.count = data.length;
                this.getFilteredData();
            }
        );
    }

    CloseRoleModal() {
        this.roleName = null;
        this.loadingSymbolForAddRoleModal = true;
        this.modalService.dismissAll();
    }

    //#endregion


    //#region Role Menu Details

    loadingSymbolForRoleMenuModal: boolean = true;
    selectRoleId: number = -1;
    roleMenuDeatials: RoleMenuDeatials[] = [];
    roleMenuDeatialsDisplay: RoleMenuDisplayDeatials[] = [];

    RoleMenuDetails(roleMenuModal) {
        this.roleMasterService.getRoleMenuDetails().subscribe(
            data => {
                debugger;
                this.roleMenuDeatials = data;
                this.RoleMenuDetailsData(data);
                this.loadingSymbolForRoleMenuModal = false;
            }
        );
        this.modalService.open(roleMenuModal, { backdrop: 'static', keyboard: false, windowClass: "edit" });
    }

    RoleMenuDetailsData(roleMenuDeatials: RoleMenuDeatials[]) {
        var data = roleMenuDeatials;
        let menuIds = Array.from(new Set(data.filter(x => x.SubMenuName == null).map(x => x.MenuId)));
        var details: RoleMenuDisplayDeatials[] = [];
        for (var i = 0; i < menuIds.length; i++) {
            var rolemenu = data.filter(x => x.MenuId == menuIds[i] && x.SubMenuName == null);
            let menuName = rolemenu[0].MenuName
            var rolesubmneu = data.filter(x => x.MenuName == menuName && x.SubMenuName != null);
            let submenuIds = Array.from(new Set(rolesubmneu.map(x => x.MenuId)));
            var submenu: any[] = [];
            for (var j = 0; j < submenuIds.length; j++) {
                var submenus = rolesubmneu.filter(x => x.MenuId == submenuIds[j]);
                var sub =
                {
                    SubMenuRoleId: submenus.map(x => x.RoleId).join(", "),
                    SubMenuRoleName: submenus.sort((a, b) => a["RoleName"].localeCompare(b["RoleName"])).map(x => x.RoleName).join(", "),
                    SubMenuId: submenus[0].MenuId,
                    SubMenuName: submenus[0].SubMenuName,
                    MenuOrder: submenus[0].MenuOrder
                };
                submenu.push(sub);
            }
            //console.log(submenu.sort((a, b) => a["MenuOrder"] - b["MenuOrder"]));
            var menu =
            {
                RoleId: rolemenu.map(x => x.RoleId).join(", "),
                RoleName: rolemenu.sort((a, b) => a["RoleName"].localeCompare(b["RoleName"])).map(x => x.RoleName).join(", "),
                MenuId: rolemenu[0].MenuId,
                MenuName: rolemenu[0].MenuName,
                MenuOrder: rolemenu[0].MenuOrder,
                IsSubMenuAvailable: rolesubmneu.length > 0 ? true : false,
                SubMenuDetails: submenu.sort((a, b) => a["MenuOrder"] - b["MenuOrder"])
            };
            details.push(menu);
        }
        this.roleMenuDeatialsDisplay = details.sort(x=>x.MenuOrder);
    }
    SearchRoleMenu() {
        let data = this.selectRoleId == -1 ? this.roleMenuDeatials : this.roleMenuDeatials.filter(x => x.RoleId == this.selectRoleId);
        this.RoleMenuDetailsData(data);
    }

    CloseRoleMenuModal() {
        this.selectRoleId = -1;
        this.loadingSymbolForRoleMenuModal = true;
        this.modalService.dismissAll();
    }

    //#endregion

}


export class RoleMenuDisplayDeatials {
    RoleId: string;
    RoleName: string;
    MenuId: number;
    MenuName: string;
    MenuOrder: number;
    IsSubMenuAvailable: boolean;
    SubMenuDetails: any[];
}