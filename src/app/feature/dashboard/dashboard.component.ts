import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/DataService';
import { FacilityMaster } from '../../core/services/Data';
import { StatusMaster } from '../../core/services/Data';
import { VendorMaster } from '../../core/services/Data';
import { FrequencyMaster } from '../../core/services/Data';
import { PackageTypeMaster } from '../../core/services/Data';
import { PagerService } from '../../core/services/PagerService';
//import { forEach } from '@angular/router/src/utils/collection';
import { filter } from 'rxjs/operators';
//import { stringify } from '@angular/core/src/render3/util';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from '../../shared/alert/alert.component';

@Component({
    selector: 'rebar-dashboard',
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.css']
})

export class DashboardComponent implements OnInit {
    red: string = "ThemePalette";
    message = 'Dasboard';
    count: number = 0;
    userData: any = null;
    userData1: any = null;
    pager: any = {};
    pagedItems: any;
    alertMessage: string = null;
    pageOptions = '5 10 20 25'.split(' ');
    selectedPageSize: number = 5;
    pageNumber: number = 1;
    sortColumn: string = "facility";
    sortDirection: string = "asc";
    defaultSort: boolean = true;

    constructor(private service: DataService, private pagerService: PagerService,
        private modalService: NgbModal) {
    }

    public unselect: boolean;
    public facilityDetails: FacilityMaster[];
    public statusDetails: StatusMaster[];
    public vendorDetails: VendorMaster[];
    public frequencyDetails: FrequencyMaster[];
    public packageTypeDetails: PackageTypeMaster[];

    public showFacility: boolean = false;
    public showStatus: boolean = false;
    public showVendor: boolean = false;
    public showFrequency: boolean = false;
    public showPackageType: boolean = false;
    public enableClearAll: boolean = false;
    public showMorePackage: string = "Show More";
    public showMoreVendor: string = "Show More";
    public packageCount: number = 5;
    public vendorCount: number = 5;

    public facilityId: number = -1;

    toggleFacility() {
        this.showFacility = !this.showFacility;
    }
    toggleStatus() {
        this.showStatus = !this.showStatus;
    }
    toggleVendor() {
        this.showVendor = !this.showVendor;
    }
    toggleFrequency() {
        this.showFrequency = !this.showFrequency;
    }
    togglePackageType() {
        this.showPackageType = !this.showPackageType;
    }
    public filterDetails: FilterDetails = new FilterDetails();
    public filteredArray: Array<{ id: number, text: string }>;
    public selectedFacilityIds: Array<{ facilityId: number }>;
    public selectedStatusIds: Array<{ statusId: number }>;
    public selectedVendorIds: Array<{ vendorId: number }>;
    public selectedFrequencyIds: Array<{ frequencyId: number }>;
    public selectedPackageTypeIds: Array<{ packageTypeId: number }>;


    clearAll() {
        debugger;
        this.filteredArray = [];
        this.selectedFacilityIds = [];
        this.selectedPackageTypeIds = [];
        this.selectedVendorIds = [];
        this.selectedStatusIds = [];
        this.selectedFrequencyIds = [];
        //this.unselect = false;
        this.packageTypeDetails.forEach(
            x => { x.selected = false; }
        );
        this.vendorDetails.forEach(
            x => { x.selected = false; }
        );
        // for (let i = 0; i <this.packageTypeDetails.length; i++) {
        //      this.packageTypeDetails[i].packageId = 3525;
        //     } 

        //this.packageTypeDetails = this.packageTypeDetails;
        this.enableClearAll = false;
        this.getFilteredData();
    }

    delete(e) {
        debugger;
        const index: number = this.filteredArray.findIndex(item => item.text == e.text);
        if (index !== -1) {
            this.filteredArray.splice(index, 1);
        }
        const indexPackage: number = this.selectedPackageTypeIds.findIndex(item => item.packageTypeId == e.id);
        if (index !== -1) {
            this.selectedPackageTypeIds.splice(indexPackage, 1);

            this.packageTypeDetails[this.packageTypeDetails.findIndex(item => item.packageId == e.id)].selected = false;
        }
        this.getFilteredData();
    }

    selectFacility(e) {
        // this.facilityDetails.filter(s => {
        //     return s.selected;
        // });
        //debugger;
        if (e.target.checked) {
            if (this.filteredArray != undefined) {
                //const startindex = this.filteredArray.length;
                //this.filteredArray.splice(startindex, 1, { id: e.target.value, text: e.target.name });
                this.filteredArray.push({ id: e.target.value, text: e.target.name });
            }
            else {
                this.filteredArray = [{ id: e.target.value, text: e.target.name }]
            }

            if (this.selectedFacilityIds != undefined) {
                this.selectedFacilityIds.push({ facilityId: e.target.value });
            }
            else {
                this.selectedFacilityIds = [{ facilityId: e.target.value }];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.text == e.target.name);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexFacility: number = this.selectedFacilityIds.findIndex(item => item.facilityId == e.target.value);
            if (index !== -1) {
                this.selectedFacilityIds.splice(indexFacility, 1);
            }
        }
        this.getFilteredData();
        // this.facilityDetails.filter(x => x.selected == true)
        //     .forEach(y => {
        //         this.selectedFacilityIds.push({ facilityId: y.facilityId });
        //     });
        // for (var x in this.filteredFacilityDetails) {
        //     alert(x);
        // }
        //this.facilityDetails.filter(x=>x.selected == true).forEach(x=>{this.fid = this.fid+','+x.facilityId});
    }

    selectPackageType(e) {
        debugger;
        if (e.selected) {
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ id: e.packageId, text: e.packageName });
            }
            else {
                this.filteredArray = [{ id: e.packageId, text: e.packageName }]
            }

            if (this.selectedPackageTypeIds != undefined) {
                this.selectedPackageTypeIds.push({ packageTypeId: e.packageId });
            }
            else {
                this.selectedPackageTypeIds = [{ packageTypeId: e.packageId }];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.text == e.packageName);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexPackageType: number = this.selectedPackageTypeIds.findIndex(item => item.packageTypeId == e.packageId);
            if (index !== -1) {
                this.selectedPackageTypeIds.splice(indexPackageType, 1);
            }
        }
        this.getFilteredData();
    }

    selectVendor(e) {
        debugger;
        if (e.selected) {
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ id: e.vendorId, text: e.vendorName });
            }
            else {
                this.filteredArray = [{ id: e.vendorId, text: e.vendorName }]
            }

            if (this.selectedVendorIds != undefined) {
                this.selectedVendorIds.push({ vendorId: e.vendorId });
            }
            else {
                this.selectedVendorIds = [{ vendorId: e.vendorId }];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.text == e.vendorName);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexVendor: number = this.selectedVendorIds.findIndex(item => item.vendorId == e.vendorId);
            if (index !== -1) {
                this.selectedVendorIds.splice(indexVendor, 1);
            }
        }
        this.getFilteredData();
    }

    selectFrequency(e) {
        debugger;
        if (e.target.checked) {
            const startindex: number = 0;
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ id: e.target.value, text: e.target.name });
            }
            else {
                this.filteredArray = [{ id: e.target.value, text: e.target.name }]
            }

            if (this.selectedFrequencyIds != undefined) {
                this.selectedFrequencyIds.push({ frequencyId: e.target.value });
            }
            else {
                this.selectedFrequencyIds = [{ frequencyId: e.target.value }];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.text == e.target.name);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexFrequency: number = this.selectedFrequencyIds.findIndex(item => item.frequencyId == e.target.value);
            if (index !== -1) {
                this.selectedFrequencyIds.splice(indexFrequency, 1);
            }
        }
        this.getFilteredData();
    }

    selectStatus(e) {
        debugger;
        if (e.target.checked) {
            const startindex: number = 0;
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ id: e.target.value, text: e.target.name });
            }
            else {
                this.filteredArray = [{ id: e.target.value, text: e.target.name }]
            }

            if (this.selectedStatusIds != undefined) {
                this.selectedStatusIds.push({ statusId: e.target.value });
            }
            else {
                this.selectedStatusIds = [{ statusId: e.target.value }];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.text == e.target.name);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexStatus: number = this.selectedStatusIds.findIndex(item => item.statusId == e.target.value);
            if (index !== -1) {
                this.selectedStatusIds.splice(indexStatus, 1);
            }
        }
        this.getFilteredData();
    }

    onOptionsChange(e) {
        debugger;
        this.selectedPageSize = e;
        this.pager = this.pagerService.getPager(this.count, this.pageNumber, e);
        this.userData1 = this.userData.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }

    displayMorePackage() {
        this.showMorePackage = this.showMorePackage == "Show More" ? "Show Less" : "Show More";
        this.packageCount = this.showMorePackage == "Show More" ? 5 : this.packageTypeDetails.length;
    }

    displayMoreVendor() {
        this.showMoreVendor = this.showMoreVendor == "Show More" ? "Show Less" : "Show More";
        this.vendorCount = this.showMoreVendor == "Show More" ? 5 : this.vendorDetails.length;
    }

    options = [1, 2, 3];
    optionSelected: any;

    onOptionsSelected(event) {
        debugger;
        //alert(event.target.value);
        console.log(event); //option value will be sent as event
    }

    ngOnInit() {
        //debugger;
        this.service.getData().subscribe(
            data => {
                this.userData = data;
                if (this.userData != null) {
                    this.count = this.userData.length;
                }
                this.setPage(1);
            }
        );
        this.service.getFacilityDetails().subscribe(
            data => {
                this.facilityDetails = data;
            }
        );
        this.service.getStatusDetails().subscribe(
            data => {
                this.statusDetails = data;
            }
        );
        this.service.getVendorDetails().subscribe(
            data => {
                this.vendorDetails = data;
            }
        );
        this.service.getFrequencyDetails().subscribe(
            data => {
                this.frequencyDetails = data;
            }
        );
        this.service.getPackageTypeDetails().subscribe(
            data => {
                this.packageTypeDetails = data;
            }
        );
    }
    setPage(page: number) {
        //debugger;
        // this.service.getPackages(page).subscribe(
        //     data => {
        //         debugger;
        //         this.allItems = data.value;
        //         if(this.allItems != null){
        //             this.count = this.allItems.length;
        //         }
        //     }
        // );
        this.pageNumber = page;
        this.pager = this.pagerService.getPager(this.count, page, this.selectedPageSize);
        this.userData1 = this.userData.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }
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
    }
    createScore(facility) {
        debugger;
        if (facility == -1) {
            //alert("Please select all mandatory fileds.");
            const modalRef = this.modalService.open(AlertComponent, { centered: true, windowClass: 'modal-adaptive-s1', size: 'sm' });
            modalRef.componentInstance.title = 'mandatory';
        }
    }

    editData: any;
    editScore(editScoreModal, packageId) {
        debugger;
        this.service.getData2(packageId).subscribe(
            data => {
                this.editData = data;
            }
        );
        this.service.getData().subscribe(
            data => {
                return this.editData = data;
            }
        );
        if (this.editData != null) {
            this.editData = this.editData.filter(x=>x.packageId === packageId);
        }
        this.modalService.open(editScoreModal, { backdropClass: 'light-blue-backdrop' });
    }

    public getFilteredData(): void {
        if (this.filteredArray.length == 0) {
            this.enableClearAll = false;
            this.service.getData().subscribe(
                data => {
                    this.userData = data;
                    if (this.userData != null) {
                        this.count = this.userData.length;
                    }
                    this.setPage(1);
                }
            );
        } else {
            this.enableClearAll = true;
            this.service.getData1().subscribe(
                data => {
                    this.userData = data;
                    if (this.userData != null) {
                        this.count = this.userData.length;
                    }
                    this.setPage(1);
                }
            );
        }
    }
}

export class FilterDetails {
    id: number;
    value: string;
}

