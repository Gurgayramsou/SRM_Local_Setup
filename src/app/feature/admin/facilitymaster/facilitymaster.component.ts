import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../core/services/DataService';
import {FacilityService} from '../../../core/services/FacilityServices';
import { FacilityMaster,CountryMaster,CityMaster, RoleMaster, FilterDetails, PackageTypeMaster, FacilityCityCountryMaster, FacilityAliasMaster, TowerMaster, FloorMaster } from '../../../core/services/Data';
import { PagerService } from '../../../core/services/PagerService';
import { NgbModal, NgbActiveModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap, switchMap, catchError, delay } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { configuration } from '../../../../config/configuration';
import { forkJoin } from "rxjs";
import { DatePipe } from '@angular/common'
import {RoleMappingService} from '../../../core/services/RoleMappingService'
import { identifierModuleUrl } from '@angular/compiler';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { ignoreElements } from 'rxjs-compat/operator/ignoreElements';


@Component({
    selector: 'rebar-facilitymaster',
    templateUrl: './facilitymaster.html',
    styleUrls: ['./facilitymaster.css']
})

export class FacilityMasterComponent implements OnInit {
    message="Facility Master";
    constructor(private dataService: DataService,private roleMappingService:RoleMappingService,private datepipe:DatePipe, private pagerService: PagerService, private modalService: NgbModal,private facilityService :FacilityService) {
        this.pageSize = this.selectedPageSize;
        if (location.href.toLocaleLowerCase().indexOf("local") != -1) {
            this.enterPriseId = 'sumit.al.sharma';
        }
        else {
            this.enterPriseId = sessionStorage["LoggedinUser"];
        }
    }
    enterPriseId:string="";
    public txtFacility: string = "";
    public txtSite: string = "";
    public txtdutyManager: string = "";
    public txtDutyEngineer: string = "";
    
    
        //paging proprty
    pager: any = {};
    count: number = 0;
    pageNumber: number = this.pagerService.pageNumber;
    pageSize: number = this.pagerService.pageSize;
    public currentDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');

    //pagingoption property
    pageOptions = this.pagerService.pageOptions;
    selectedPageSize: number = this.pagerService.selectedPageSize;
    pagerView: any = {};
    pagerViewSite: any = {};
    countView: number = 0;
    countSiteView=0;
    pageNumberView: number = this.pagerService.pageNumberView;
    pageNumberSite: number = this.pagerService.pageNumberView;
    pageSizeView: number = this.pagerService.pageSizeView;
    pageSizeSite: number = this.pagerService.pageSizeView;
    pageOptionsView = this.pagerService.pageOptionsView;
    pageOptionsSite = this.pagerService.pageOptionsView;
    selectedPageSizeView: number = this.pagerService.selectedPageSizeView;
    selectedPageSizeSite: number = this.pagerService.selectedPageSizeView;
    //sorting property
    sortColumn: string = "Site";
    sortDirection: string = "asc";
    ViewFacilitysortColumn:string = "FacilityNm";
    ViewFacilitysortDirection: string = "asc";
    defaultSort: boolean = true;
    defaultSortFacility: boolean = true;
    //Filter property
    filterCount: number = 5;
    showMoreText: string = "Show More";
    showLessText: string = "Show Less";
    public countryDetails: CountryMaster[];
    public cityDetails: CityMaster[];
    public facilityCityCountryDetails: FacilityCityCountryMaster[];
    public packageDetails:PackageTypeMaster[];
    public towerDetails:TowerMaster[];
    public floorDetails:FloorMaster[];
    public facilitydetails:FacilityMaster[];
    public Basefacilitydetails:FacilityMaster[];
    public siteDetails:any=[];
    SiteFacilityDetails: any = null;
    towerfloorDetails: any = null;
    public viewData:any = [];
    //loading property
    loadingSymbolForModal: boolean = false;
    loadingSymbol: boolean = true;
    //property used to show count of filter
    public countryCount: number = this.filterCount;
    public cityCount: number = this.filterCount;
    public facilityCount: number = this.filterCount;
    public SiteCount: number = this.filterCount;
    public viewObject: any = [];
    //toggel property
    public showCountry: boolean = false;
    public showCity: boolean = false;
    public showFacility: boolean = false;
    public showSite: boolean = false;
    public showMoreCountry: string = this.showMoreText;
    public showMoreCity: string = this.showMoreText;
    public showMoreFacility: string = this.showMoreText;
    public showMoreSite: string = this.showMoreText;

    //property used to store the selcted filter values
    public filteredArray: FilterDetails[];
    public selectedCountryNames: Array<string>;
    public selectedCityName: Array<string>;
    public selectedFacilityIds: Array<number>;
    public selectedSiteids: Array<number>;

    public zoneDetails:any =null;
    public ViewFacilityDetails:any =null;
    public Zonename:string=null;
    public cityDetailsbyZone:CityMaster[];;
    selectCityId:number=-1;

    public selectCountryID:number =-1;

    ModalPopUpHeader: string = "Add Facility";

    ngOnInit() {
        this.dataService.CheckAdminRoleAccessForPages(this.enterPriseId, location.pathname).subscribe(
            data=>{
                if (data.length != 0) {
                this.loadingSymbol = true;
                this.dataService.getCountryDetails().subscribe(
                    data => {
                        if (data != null && data.length > 0) {
                            this.countryDetails = data;
                        }
                    });
                    this.dataService.getCityDetails().subscribe(
                        data => {
                            if (data != null && data.length > 0) {
                                this.cityDetails = data;
                            }
                        });
                        this.dataService.FacilityCityCountryDetails().subscribe(
                            data => {
                                this.facilityCityCountryDetails = data;
                                this.Basefacilitydetails=this.facilityCityCountryDetails.map(val=>{return{facilityId:val.FacilityId,facilityName:val.FacilityName,selected:false}});
                                this.Basefacilitydetails=this.Basefacilitydetails.sort((a, b) => a.facilityName.localeCompare(b.facilityName));
                            }
                        );
                        this.dataService.getFacilityAliasDetails().subscribe(
                        data=> {
                            debugger;
                                this.siteDetails=data;
                            }
                        );
                        this.dataService.getPackageDetails().subscribe(
                            data=>{
                                this.packageDetails=data;
                            }
                        )
                        this.facilityService.getCategory().subscribe(
                            data1=>{
                                this.CategoryDatails=data1;
                            }
                        );
                        this.facilityService.Getfacilitydetails(this.pageNumber,this.sortColumn,this.sortDirection,this.pageSize).subscribe(
                            data=>{
                                this.SiteFacilityDetails=data[0];
                                this.count=data[1][0].totalRowCount;
                                this.setPager();
                            }
                        )
            }
        }
        );                        
   }

    setPager() {
    this.pager = {};
    this.pager = this.pagerService.getPager(this.count, this.pageNumber, this.pageSize);
    this.loadingSymbol = false;
    }  

    setPage(page: number) {
        this.pageNumber = page;
        this.getFilteredData();
    }      
    getFilteredData(){
        // this.dataService.getFacilityAliasDetails().subscribe(
        // data=> {
        //         this.siteDetails=data;
        //     }
        // );
        this.loadingSymbol = true;
        let length: number = this.filteredArray != null ? this.filteredArray.length : 0;
        if (length == 0) {
            this.loadingSymbol=true;
            this.enableClearAll = false;
            this.facilityService.Getfacilitydetails(this.pageNumber,this.sortColumn,this.sortDirection,this.pageSize).subscribe(
                data=>{
                     this.SiteFacilityDetails=data[0];
                     this.count=data[1][0].totalRowCount;
                     this.setPager();
                }
            );
        }
        else{
            this.loadingSymbol=true;
            this.enableClearAll = true;
            
            this.facilityService.GetfacilitydetailsFilter(this.selectedCountryNames,this.selectedCityName,this.selectedFacilityIds,this.selectedSiteids,this.pageNumber,this.sortColumn,this.sortDirection,this.pageSize).subscribe(
                data=>{
                    this.SiteFacilityDetails=data[0];
                    this.count=data[1][0].totalRowCount;
                    this.setPager();
                }
            );
        }
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
    toggleSite() {
        this.showSite = !this.showSite;
    }
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
        this.facilityCount = this.showMoreFacility == this.showMoreText ? this.filterCount : this.Basefacilitydetails.length;
    }

    displayMoreSite() {
        this.showMoreSite = this.showMoreSite == this.showMoreText ? this.showLessText : this.showMoreText;
        this.SiteCount = this.showMoreSite == this.showMoreText ? this.filterCount : this.siteDetails.length;
        }
    selectCountry(e) {
        this.pageNumber=1;
        if (e.selected) {
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ value: e.countryId, text: e.countryName, filterName: "country" });
            }
            else {
                this.filteredArray = [{ value: e.countryId, text: e.countryName, filterName: "country" }]
            }

            if (this.selectedCountryNames != undefined) {
                this.selectedCountryNames.push(e.countryName);
            }
            else {
                this.selectedCountryNames = [e.countryName];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "country" && item.value == e.countryId);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexCountry: number = this.selectedCountryNames.indexOf(e.countryName);
            if (index !== -1) {
                this.selectedCountryNames.splice(indexCountry, 1);
            }
        }
        this.getFilteredData();
    }

    selectCity(e) {
        this.pageNumber=1;
        if (e.selected) {
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ value: e.cityId, text: e.cityName, filterName: "city" });
            }
            else {
                this.filteredArray = [{ value: e.cityId, text: e.cityName, filterName: "city" }]
            }

            if (this.selectedCityName != undefined) {
                this.selectedCityName.push(e.cityName);
            }
            else {
                this.selectedCityName = [e.cityName];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "city" && item.value == e.cityId);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexCity: number = this.selectedCityName.indexOf(e.cityName);
            if (index !== -1) {
                this.selectedCityName.splice(indexCity, 1);
            }
        }
        this.getFilteredData();
    }

    selectFacility(e) {
        this.pageNumber=1;
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
    selectSite(e) {
        debugger;   
        this.pageNumber=1;
        if (e.selected) {
            if (this.filteredArray != undefined) {
                this.filteredArray.push({ value: e.facilityId, text: e.facilityName, filterName: "Site" });
            }
            else {
                this.filteredArray = [{ value: e.facilityId, text: e.facilityName, filterName: "Site" }]
            }

            if (this.selectedSiteids != undefined) {
                this.selectedSiteids.push(e.facilityId);
            }
            else {
                this.selectedSiteids = [e.facilityId];
            }
        }
        else {
            const index: number = this.filteredArray.findIndex(item => item.filterName == "Site" && item.value == e.facilityId);
            if (index !== -1) {
                this.filteredArray.splice(index, 1);
            }
            const indexFacility: number = this.selectedSiteids.indexOf(e.facilityId);
            if (index !== -1) {
                this.selectedSiteids.splice(indexFacility, 1);
            }
        }
        this.getFilteredData();
    }
    onPagingOptionsChange(e: number) {
        debugger;
        this.selectedPageSize = +e;
        this.pageSize = this.selectedPageSize;
        this.pageNumber = 1;
        this.getFilteredData();
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
        this.getFilteredData();

    }
    sortingFacilityView(ViewFacilitysortColumn:string){
        debugger;
        if (this.defaultSortFacility && this.ViewFacilitysortColumn == ViewFacilitysortColumn) {
            this.ViewFacilitysortColumn = ViewFacilitysortColumn;
            this.ViewFacilitysortDirection = "asc";
            this.defaultSortFacility = false;
        }
        else {
            this.defaultSortFacility = false;
        }
        if (this.ViewFacilitysortColumn != ViewFacilitysortColumn) {
            this.ViewFacilitysortColumn = ViewFacilitysortColumn;
            this.ViewFacilitysortDirection = "asc";
        }
        else {
            this.ViewFacilitysortColumn = ViewFacilitysortColumn;
            this.ViewFacilitysortDirection = this.ViewFacilitysortDirection == "asc" ? "desc" : "asc";
        }
        this.getFacilityview();
    }

    getFacilityview(){
        this.loadingSymbolForModal=true;
        
        var countryNm=this.selectCountryID!=-1?this.countryDetails.find(x=>x.countryId==this.selectCountryID).countryName:undefined;
        this.facilityService.GetViewFacilityDetails(countryNm,this.pageNumberView,this.ViewFacilitysortColumn,this.ViewFacilitysortDirection,this.pageSizeView).subscribe(
            data=>{
                debugger;
                //this.ViewFacilityDetails=null;
                this.ViewFacilityDetails=data[0];
               this.countView=data[1][0].totalRowCount;
                this.setPagerView();
            }
        )
    }

    onCountryChange(){
        debugger;
        this.pageNumberView = this.pagerService.pageNumberView;
        if(this.selectCountryID!=-1){
            this.loadingSymbolForModal=true;
        var countryNm=this.countryDetails.find(x=>x.countryId==this.selectCountryID).countryName;
        this.Zonename=null;
        this.cityDetailsbyZone=null;
        this.selectCityId=-1;
        this.facilityService.GetZoneByCountryName(countryNm).subscribe(
            data=>{
                this.zoneDetails=data;
            }
        );
        this.getFacilityview();
        }
        else{
            this.zoneDetails=null;
            this.Zonename=null;
            this.cityDetailsbyZone=null;
            this.selectCityId=-1;
            this.ViewFacilityDetails=null;
            
        }
    }

    OnZoneChange(){
        if(this.Zonename!=null){
            this.loadingSymbolForModal=true;
        this.facilityService.GetCityByZone(this.Zonename).subscribe(
            data=>{
                this.selectCityId=-1;
                this.cityDetailsbyZone=data;
                this.loadingSymbolForModal=false;
            }
        )
        }
        else{
            this.cityDetailsbyZone=null;
            this.selectCityId=-1;
        }
    }

    addFacility(addFacilityModal) {
        debugger;
        this.ModalPopUpHeader = "Add Facility Mapping";
        this.modalService.open(addFacilityModal, { backdrop: 'static', keyboard: false, windowClass: "edit" });
    }

    public inputValidator(event: KeyboardEvent) {
        if (event.keyCode==32) {
            event.preventDefault();
        }
    }
       
    setPagerView() {
        this.pagerView = {};
        this.pagerView = this.pagerService.getPager(this.countView, this.pageNumberView, this.pageSizeView);
        this.loadingSymbolForModal = false;
    }

    setPageView(page: number) {
        this.pageNumberView = page;
        this.getFacilityview();
    }

    onPagingOptionsChangeView(e: number) {
        this.selectedPageSizeView = +e;
        this.pageSizeView = this.selectedPageSizeView;
        this.pageNumberView = 1;
        this.getFacilityview();
    }
    SaveFacility(){
        debugger;
        if(this.selectCountryID!=-1 && this.Zonename!=null && this.selectCityId!=-1 && (this.txtFacility!=null&&this.txtFacility!="" && this.txtFacility!=undefined)){
            this.loadingSymbolForModal=true;
            this.facilityService.CheckFacilityExist(this.txtFacility).subscribe(
                data=>{
                    if(data[0].Totalcount==0){
                        var country=this.countryDetails.find(x=>x.countryId==this.selectCountryID).countryName;
                       var city=this.cityDetails.find(x=>x.cityName == this.selectCityId.toString()).cityName;
                        this.facilityService.AddFacility(this.txtFacility,country,city,this.Zonename,this.enterPriseId).subscribe(
                            data=>{
                                this.facilityService.AddFacilityInTask(data,this.txtFacility,country,city,this.enterPriseId).subscribe(
                                    data=>{
                                        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                        modalRef.componentInstance.title = configuration.Success;
                                       modalRef.componentInstance.message = 'Record mapped successfully';
                                       this.getFacilityview();
                                       this.IsAddednewFacility=true;
                                       this.zoneDetails=null;
                                       this.Zonename=null;
                                       this.selectCountryID=-1;
                                       this.cityDetailsbyZone=null;
                                       this.selectCityId=-1;
                                       this.txtFacility=null;
                                       this.dataService.FacilityCityCountryDetails().subscribe(
                                        data => {
                                            debugger;
                                            this.facilityCityCountryDetails = data;
                                            this.Basefacilitydetails=this.facilityCityCountryDetails.map(val=>{return{facilityId:val.FacilityId,facilityName:val.FacilityName,selected:false}});
                                            this.facilitydetails=this.facilitydetails.sort((a, b) => a.facilityName.localeCompare(b.facilityName));
                                        }
                                    );
                                      this.loadingSymbolForModal = false;
                                    }
                                )
                            });
                    }
                    else{
                        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                       modalRef.componentInstance.title = configuration.Alert;
                      modalRef.componentInstance.message = configuration.RecordExistsMessage;
                     this.loadingSymbolForModal = false;
                    }
                }
            )
        }
        else{
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            modalRef.componentInstance.title = configuration.Mandatory;
            modalRef.componentInstance.message = configuration.MandatoryMessage;
            this.loadingSymbolForModal = false;
        }
    }
    isAddSite:boolean=true;
    IsAddednewFacility:boolean=false;
    public selectPackageId: Array<number>;
    selectTowerId : number=-1;
    selectfacilityId:number=-1;
    public selectFloorId:Array<number>;
    addSite(addSiteModal){
        debugger;
        this.isAddSite=true;
        this.isCarpet=false;
        this.facilitydetails=this.Basefacilitydetails;
       // this.viewObject.FacilityAliasId=undefined;
        this.selectTowerId=-1;
        this.loadingSymbolForModal=true;
        this.ModalPopUpHeader = "Add Site Mapping";
        this.loadingSymbolForModal=false;
        this.modalService.open(addSiteModal, { backdrop: 'static', keyboard: false, windowClass: "edit" });
    }
    onfacilityChange(){
        if(this.selectfacilityId!=-1){
    this.loadingSymbolForModal=true;
    this.dataService.getTowerDetails().subscribe(
        data=>{
            this.towerDetails=data;
            this.loadingSymbolForModal=false;
        }
    )
    }
    else{
        this.towerDetails=null;
        this.selectTowerId=-1;
        this.floorDetails=null;
        this.selectFloorId=[];
    }
    }
    onTowerChange(){
        if(this.selectTowerId!=-1){
        this.loadingSymbolForModal=true
        this.dataService.getFloorDetails().subscribe(
            data=>{
                this.floorDetails=data;
                this.loadingSymbolForModal=false;
            }
        )
        }
        else{
            this.floorDetails=null
            this.selectFloorId=null;
        }
    }
    createFacilityAliasId:number;
    CategoryDatails:any;
    UpdatePackage:boolean=false;
    updatefloor:boolean = false;
    SaveSite(){
        debugger;
        if(this.isAddSite && this.selectfacilityId!=-1 && this.txtSite!=null && (this.selectPackageId != [] && this.selectPackageId != undefined && this.selectPackageId.length > 0)
        && ((this.txtdutyManager!= null&&this.txtdutyManager!=undefined && this.txtdutyManager!="") || (this.txtDutyEngineer!=null&&this.txtDutyEngineer!=undefined && this.txtDutyEngineer!="")) && (!this.isCarpet||this.selectTowerId!=-1 && this.selectFloorId.length > 0)){
            if(this.isAddSite){
                this.loadingSymbolForModal=true;
            this.facilityService.CheckFacilityAliasExist(this.txtSite).subscribe(
                data=>{
                    if(data[0].Totalcount==0){
                            this.facilityService.AddFacilityAlias(this.txtSite,this.selectfacilityId,this.txtdutyManager,this.txtDutyEngineer,this.enterPriseId).subscribe(
                            data=>{
                                    console.log(data);
                                    this.createFacilityAliasId=data;
                                    this.viewObject.FacilityAliasId=data;
                                    this.facilityService.GetSRMAdmin(this.selectfacilityId).subscribe(
                                        data=>{
                                            var SaveRecords = [];
                                            for(var i=0;i<data.length;i++){
                                                var obj={
                                                    UserId: data[i].UserId,
                                                    FacilityId: this.createFacilityAliasId,
                                                    //FacilityAliasId: this.selectfacilityId[j] 
                                                    PackageId: null, //this.selectPackageTypeId[i],
                                                    RoleId: data[i].RoleId,
                                                    IsActive: 1,
                                                    CreatedBy: this.enterPriseId, CreateDttm: this.currentDate, UpdatedBy: this.enterPriseId, UpdatedDttm: this.currentDate
                                                }
                                                SaveRecords.push(obj)
                                            }
                                            this.roleMappingService.InsertDataIntoUserFacilityMapping(SaveRecords).subscribe(
                                                data=>{

                                                }
                                            )
                                        }
                                    )
                                    var SavePackageMappingDetails = [];
                                    for (var j = 0; j < this.selectPackageId.length; j++) {
                                        var packageid=this.selectPackageId[j].toString();
                                        var data_1={
                                            FacilityAliasId: this.createFacilityAliasId.toString(),
                                            PackageID: packageid, //this.selectPackageTypeId[i],
                                            CategoryId:this.CategoryDatails.find(x=>x.packageId==this.selectPackageId[j]).categoryId.toString(),
                                            enterpriseId:this.enterPriseId,
                                            currentdatetime:this.currentDate
                                        };
                                        SavePackageMappingDetails.push(data_1);
                                    }
                                    this.facilityService.AddFacilityAliasPackageMapping(SavePackageMappingDetails).subscribe(
                                        data=>{
                                            if(this.isCarpet){
                                            var SaveFloorMappingDetails = [];
                                                for (var j = 0; j < this.selectFloorId.length; j++) {
                                                var data_2={
                                                    FacilityAliasId: this.createFacilityAliasId.toString(),
                                                    TowerId:this.selectTowerId.toString(),
                                                    FloorId:this.selectFloorId[j],
                                                    DutyManager:this.txtdutyManager,
                                                    DutyEngineer:this.txtDutyEngineer,
                                                    enterpriseId:this.enterPriseId,
                                                    currentdatetime:this.currentDate
                                                };
                                                SaveFloorMappingDetails.push(data_2);
                                                }
                                                this.facilityService.AddFacilityAliasFloorMapping(SaveFloorMappingDetails).subscribe(
                                                   data=>{
                                                    this.dataService.getFacilityAliasDetails().subscribe(
                                                        data=>{
                                                            this.siteDetails=data;
                                                        }
                                                    )
                                                    this.getFilteredData();
                                                    this.getViewData();
                                                    this.isAddSite=false;
                                                    this.facilitydetails=this.Basefacilitydetails.filter(x=>x.facilityId==this.selectfacilityId);
                                                    this.clearAddedSite();
                                                    const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                                    modalRef.componentInstance.title = configuration.Success;
                                                    modalRef.componentInstance.message = 'Record mapped successfully';
                                                   }
                                               );
                                               }
                                                else{
                                                    this.dataService.getFacilityAliasDetails().subscribe(
                                                        data=> {
                                                                this.siteDetails=data;
                                                            }
                                                        );
                                                    this.facilitydetails=this.Basefacilitydetails.filter(x=>x.facilityId==this.selectfacilityId);
                                                    this.getFilteredData();
                                                    this.getViewData();
                                                    this.isAddSite=false;
                                                    this.clearAddedSite();
                                                    this.ModalPopUpHeader="Edit Site Mapping";
                                                    const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                                    modalRef.componentInstance.title = configuration.Success;
                                                    modalRef.componentInstance.message = 'Record mapped successfully';
                                                    //this.clearSite();
                                                    
                                                }
                                        }
                                    );
                                });
                    }
                    else{
                        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                       modalRef.componentInstance.title = configuration.Alert;
                      modalRef.componentInstance.message = configuration.RecordExistsMessage;
                     this.loadingSymbolForModal = false;
                    }

                }
            )
        }
    }

    else if(this.selectPackageId != [] && this.selectPackageId != undefined && this.selectPackageId.length > 0 && this.selectFloorId != [] && this.selectFloorId != undefined && this.selectFloorId.length > 0 &&((this.txtdutyManager!= null&&this.txtdutyManager!=undefined && this.txtdutyManager!="") 
    || (this.txtDutyEngineer!=null&&this.txtDutyEngineer!=undefined && this.txtDutyEngineer!="")) && !this.isAddSite ){
        this.loadingSymbolForModal=true;
        this.createFacilityAliasId=this.viewObject.FacilityAliasId!=undefined?this.viewObject.FacilityAliasId:this.createFacilityAliasId;;
       
        this.facilityService.getPackageDetailsByFacilityID(this.createFacilityAliasId).subscribe(
            data =>{
                    var SavePackageMappingDetails = [];
                    for (let i=0; i<this.selectPackageId.length;i++){
                        var packageId = data.filter(x=>x.PackageId==this.selectPackageId[i])
                        if(packageId==0){
                            var data_1={
                                FacilityAliasId: this.createFacilityAliasId.toString(),
                                PackageID: this.selectPackageId[i].toString(), //this.selectPackageTypeId[i],
                                CategoryId:this.CategoryDatails.find(x=>x.packageId==this.selectPackageId[i]).categoryId.toString(),
                                enterpriseId:this.enterPriseId,
                                currentdatetime:this.currentDate
                            };
                            SavePackageMappingDetails.push(data_1);
                        }
                    }
                    if(SavePackageMappingDetails.length>0){
                    this.facilityService.AddFacilityAliasPackageMapping(SavePackageMappingDetails).subscribe(
                        data=>{
                            this.facilityService.getFloorId(this.createFacilityAliasId,this.selectTowerId).subscribe(
                            data=>{
                                    var SaveFloorMappingDetails = [];
                                    for (var j = 0; j < this.selectFloorId.length; j++) {
                                        var floorid=data.filter(x=>x.FloorId==this.selectFloorId[j])
                                        if(floorid==0){
                                            var data_2={
                                                FacilityAliasId: this.createFacilityAliasId.toString(),
                                                TowerId:this.selectTowerId.toString(),
                                                FloorId:this.selectFloorId[j],
                                                DutyManager:this.txtdutyManager,
                                                DutyEngineer:this.txtDutyEngineer,
                                                enterpriseId:this.enterPriseId,
                                                currentdatetime:this.currentDate
                                            };
                                    SaveFloorMappingDetails.push(data_2);
                                    }
                                }
                                if(SaveFloorMappingDetails.length > 0){
                                this.facilityService.AddFacilityAliasFloorMapping(SaveFloorMappingDetails).subscribe(
                                    data=>{
                                        debugger;
                                        this.facilityService.gettowermappingFacilityid(this.createFacilityAliasId).subscribe(
                                            data=>{
                                                var obj=data.map(x=>x.FacilityTowerFloorMappingId);
                                                
                                                var UpdateAccount= this.facilityService.UpdateSite(this.createFacilityAliasId,this.enterPriseId,this.txtdutyManager,this.txtDutyEngineer);
                                                var UpdateTask= this.facilityService.UpdateDutymanagerinTask(obj,this.txtdutyManager,this.txtDutyEngineer);
                                                forkJoin([UpdateAccount,UpdateTask]).subscribe(
                                                 data=>{
                                                     this.getFilteredData();
                                                     this.getViewData();
                                                     this.clearAddedSite();
                                                     const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                                     modalRef.componentInstance.title = configuration.Success;
                                                     modalRef.componentInstance.message = 'Record mapped successfully';;
                                                     
                                                 }
                                             )
                                            }
                                        )
                                          
                                        
                                    }
                                );
                            }
                            else{
                                this.getViewData();
                                this.clearAddedSite();
                                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                modalRef.componentInstance.title = configuration.Success;
                                modalRef.componentInstance.message = 'Record mapped successfully';
                                                
                            }
                            }     
                        )
                            
                        }
                    );
                    }
                    else{
                        this.facilityService.getFloorId(this.createFacilityAliasId,this.selectTowerId).subscribe(
                            data=>{
                                    var SaveFloorMappingDetails = [];
                                    for (var j = 0; j < this.selectFloorId.length; j++) {
                                        var floorid=data.filter(x=>x.FloorId==this.selectFloorId[j])
                                        if(floorid==0){
                                            var data_2={
                                                FacilityAliasId: this.createFacilityAliasId.toString(),
                                                TowerId:this.selectTowerId.toString(),
                                                FloorId:this.selectFloorId[j],
                                                DutyManager:this.txtdutyManager,
                                                DutyEngineer:this.txtDutyEngineer,
                                                enterpriseId:this.enterPriseId,
                                                currentdatetime:this.currentDate
                                            };
                                    SaveFloorMappingDetails.push(data_2);
                                    }
                                }
                                if(SaveFloorMappingDetails.length > 0){
                                this.facilityService.AddFacilityAliasFloorMapping(SaveFloorMappingDetails).subscribe(
                                    data=>{
                                        this.facilityService.gettowermappingFacilityid(this.createFacilityAliasId).subscribe(
                                            data=>{
                                                var obj=data.map(x=>x.FacilityTowerFloorMappingId);
                                                var UpdateAccount= this.facilityService.UpdateSite(this.createFacilityAliasId,this.enterPriseId,this.txtdutyManager,this.txtDutyEngineer);
                                                var UpdateTask= this.facilityService.UpdateDutymanagerinTask(obj,this.txtdutyManager,this.txtDutyEngineer);
                                                forkJoin([UpdateAccount,UpdateTask]).subscribe(
                                                 data=>{
                                                     this.getFilteredData();
                                                     this.getViewData();
                                                     this.clearAddedSite();
                                                     const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                                     modalRef.componentInstance.title = configuration.Success;
                                                     modalRef.componentInstance.message = 'Record mapped successfully';;
                                                     
                                                 }
                                             )
                                            }
                                        )
                                        
                                    }
                                );
                            }
                            else{
                                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                modalRef.componentInstance.title = configuration.Alert;
                                modalRef.componentInstance.message = configuration.RecordExistsMessage;
                                this.loadingSymbolForModal = false;
                            }
                            }     
                        )
                    }

                }
        )

    }
    else if(this.selectFloorId != [] && this.selectFloorId != undefined && this.selectFloorId.length > 0 &&((this.txtdutyManager!= null&&this.txtdutyManager!=undefined && this.txtdutyManager!="") || (this.txtDutyEngineer!=null&&this.txtDutyEngineer!=undefined && this.txtDutyEngineer!="")) && !this.isAddSite){
        this.createFacilityAliasId=this.viewObject.FacilityAliasId!=undefined?this.viewObject.FacilityAliasId:this.createFacilityAliasId;;
        this.loadingSymbolForModal=true;
        this.facilityService.getFloorId(this.createFacilityAliasId,this.selectTowerId).subscribe(
            data=>{
                    var SaveFloorMappingDetails = [];
                    for (var j = 0; j < this.selectFloorId.length; j++) {
                        var floorid=data.filter(x=>x.FloorId==this.selectFloorId[j])
                        if(floorid==0){
                            var data_2={
                                FacilityAliasId: this.createFacilityAliasId.toString(),
                                TowerId:this.selectTowerId.toString(),
                                FloorId:this.selectFloorId[j],
                                DutyManager:this.txtdutyManager,
                                DutyEngineer:this.txtDutyEngineer,
                                enterpriseId:this.enterPriseId,
                                currentdatetime:this.currentDate
                            };
                    SaveFloorMappingDetails.push(data_2);
                    }
                }
                if(SaveFloorMappingDetails.length > 0){
                this.facilityService.AddFacilityAliasFloorMapping(SaveFloorMappingDetails).subscribe(
                    data=>{
                        this.facilityService.gettowermappingFacilityid(this.createFacilityAliasId).subscribe(
                        data=>{
                            var obj=data.map(x=>x.FacilityTowerFloorMappingId);
                            
                            var UpdateAccount= this.facilityService.UpdateSite(this.createFacilityAliasId,this.enterPriseId,this.txtdutyManager,this.txtDutyEngineer);
                            var UpdateTask= this.facilityService.UpdateDutymanagerinTask(obj,this.txtdutyManager,this.txtDutyEngineer);
                            forkJoin([UpdateAccount,UpdateTask]).subscribe(
                             data=>{
                                 this.getViewData();
                                 this.clearAddedSite();
                                 const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                                 modalRef.componentInstance.title = configuration.Success;
                                 modalRef.componentInstance.message = 'Record mapped successfully';;
                                 
                             }
                         )
                        }
                    )
                        
                    }
                );
            }
            else{
                const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                modalRef.componentInstance.title = configuration.Alert;
                modalRef.componentInstance.message = configuration.RecordExistsMessage;
                this.loadingSymbolForModal = false;
            }
            }     
        )
    }

    else if(!this.isAddSite && this.selectPackageId != [] && this.selectPackageId != undefined && this.selectPackageId.length > 0 && !this.isCarpet){
        this.loadingSymbolForModal=true;
        this.createFacilityAliasId=this.viewObject.FacilityAliasId!=undefined?this.viewObject.FacilityAliasId:this.createFacilityAliasId;
        this.facilityService.getPackageDetailsByFacilityID(this.createFacilityAliasId).subscribe(
            data =>{
        var SavePackageMappingDetails = [];
        for (var j = 0; j < this.selectPackageId.length; j++) {
            var packageId = data.filter(x=>x.PackageId==this.selectPackageId[j]);
            if(packageId.length==0){
            var packageid=this.selectPackageId[j].toString();
            var data_1={
                FacilityAliasId: this.createFacilityAliasId.toString(),
                PackageID: packageid, //this.selectPackageTypeId[i],
                CategoryId:this.CategoryDatails.find(x=>x.packageId==this.selectPackageId[j]).categoryId.toString(),
                enterpriseId:this.enterPriseId,
                currentdatetime:this.currentDate
            };
            SavePackageMappingDetails.push(data_1);
        }
    }
    if(SavePackageMappingDetails.length>0){
        this.facilityService.AddFacilityAliasPackageMapping(SavePackageMappingDetails).subscribe(
            data=>{
                if(this.isCarpet){
                this.facilityService.gettowermappingFacilityid(this.createFacilityAliasId).subscribe(
                    data=>{
                        var obj=data.map(x=>x.FacilityTowerFloorMappingId);
                        var UpdateAccount= this.facilityService.UpdateSite(this.createFacilityAliasId,this.enterPriseId,this.txtdutyManager,this.txtDutyEngineer);
                        var UpdateTask= this.facilityService.UpdateDutymanagerinTask(obj,this.txtdutyManager,this.txtDutyEngineer);
                        forkJoin([UpdateAccount,UpdateTask]).subscribe(
                         data=>{
                             this.getFilteredData();
                             this.getViewData();
                             this.clearAddedSite();
                             const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                             modalRef.componentInstance.title = configuration.Success;
                             modalRef.componentInstance.message = 'Record mapped successfully';;
                             
                         }
                     )
                    }
                )}
                else{
                    this.facilityService.UpdateSite(this.createFacilityAliasId,this.enterPriseId,this.txtdutyManager,this.txtDutyEngineer).subscribe(
                        data=>{
                            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
                            modalRef.componentInstance.title = configuration.Success;
                            modalRef.componentInstance.message = 'Record mapped successfully';
                            this.getFilteredData();
                            this.getViewData();
                            this.clearAddedSite();
                           
                        }
                    )
                }
            });
        }
        else{
            const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
            modalRef.componentInstance.title = configuration.Alert;
            modalRef.componentInstance.message = configuration.RecordExistsMessage;
            this.loadingSymbolForModal = false;
        }
    });
    }

    else{
        const modalRef = this.modalService.open(AlertComponent, { backdrop: 'static', keyboard: false, windowClass: "alertModalMandatory" });
        modalRef.componentInstance.title = configuration.Mandatory;
        modalRef.componentInstance.message = configuration.MandatoryMessage;
        this.loadingSymbolForModal = false;
    }
    }
    deleteFilter(e) {
        debugger;
        this.pageNumber=1;
        const index: number = this.filteredArray.findIndex(item => item.text == e.text);
        if (index !== -1) {
            this.filteredArray.splice(index, 1);
        }
        if (e.filterName == "country") {
            const indexCountry: number = this.selectedCountryNames.indexOf(e.text);
            if (index !== -1) {
                this.selectedCountryNames.splice(indexCountry, 1);
                this.countryDetails[this.countryDetails.findIndex(item => item.countryName == e.text)].selected = false;
            }
        }
        else if (e.filterName == "city") {
            const indexCity: number = this.selectedCityName.indexOf(e.text);
            if (index !== -1) {
                this.selectedCityName.splice(indexCity, 1);
                this.cityDetails[this.cityDetails.findIndex(item => item.cityName == e.text)].selected = false;
            }
        }
        else if (e.filterName == "facility") {
            const indexFacility: number = this.selectedFacilityIds.indexOf(e.value);
            if (index !== -1) {
                this.selectedFacilityIds.splice(indexFacility, 1);
                this.Basefacilitydetails[this.Basefacilitydetails.findIndex(item => item.facilityId == e.value)].selected = false;
            }
        }
        else if (e.filterName == "Site") {
            const indexTraffic: number = this.selectedSiteids.indexOf(e.value);
            if (index !== -1) {
                this.selectedSiteids.splice(indexTraffic, 1);
                this.siteDetails[this.siteDetails.findIndex(item => item.facilityId == e.value)].selected = false;
            }
        }
        this.getFilteredData();
    }

   

    enableClearAll:boolean=false;
     clearAllFilter() {
         this.pageNumber=1;
        this.filteredArray = [];
        this.selectedCountryNames = [];
        this.selectedCityName = [];
        this.selectedFacilityIds = [];
        this.selectedSiteids = null;
        this.countryDetails.forEach(
            x => { x.selected = false; }
        );
        this.cityDetails.forEach(
            x => { x.selected = false; }
        );
        this.Basefacilitydetails.forEach(
            x => { x.selected = false; }
        );
        this.siteDetails.forEach(
            x => { x.selected = false; }
        );
        this.enableClearAll = false;
        this.getFilteredData();
    }
    isCarpet:boolean=false;
    focusFunction(){
        this.isCarpet=this.selectPackageId.filter(x=>x==this.packageDetails.find(y=>y.packageName=="Carpet").packageId).length > 0 ? true:false;
        if(this.isCarpet){
        this.loadingSymbolForModal=true;
        this.dataService.getTowerDetails().subscribe(
            data=>{
                this.towerDetails=data;
                this.loadingSymbolForModal=false;
            }
        );
        }
        else{
            this.towerDetails=null;
            this.selectTowerId=-1;
            this.floorDetails=null;
        }
        // else{
        //     this.towerDetails=Object.assign(this.towerDetails.map(val=>{val.towerId=-2,val.towerName="NA"}));
        // }
    }
    edit(addSiteModal,e){
        debugger;
        this.isAddSite=false;
        this.createFacilityAliasId=undefined;
        this.ModalPopUpHeader="Edit Site Mapping";
        this.viewObject=e;
        this.selectfacilityId=this.viewObject.FacilityId
        this.txtSite=this.viewObject.Site;
        this.selectTowerId=-1;
       var getFacility= this.dataService.getFacilityDetailsByFacilityIds(e.FacilityId);
       var GetTower=this.dataService.getTowerDetails();
       var GetManager=this.facilityService.getManagersDetails(this.viewObject.FacilityAliasId)
       this.loadingSymbolForModal = true;
       forkJoin([getFacility,GetTower,GetManager]).subscribe(
           data=>{
            this.facilitydetails=data[0];
            this.towerDetails=data[1];
            this.txtdutyManager=data[2][0].DutyManagerGroupId;
            this.txtDutyEngineer=data[2][0].DutyEngineerGroupId;
            this.getViewData();
           }
       )
        //this.txtSite=this.viewData
       
        // this.dataService.getTowerDetails().subscribe(
        //     data=>{
        //         this.towerDetails=data;
        //     }
        // )
        // this.facilityService.getManagersDetails(this.viewObject.FacilityAliasId).subscribe(
        //     data=>{
        //         this.txtdutyManager=data[0].DutyManagerGroupId;
        //         this.txtDutyEngineer=data[0].DutyEngineerGroupId;
        //     }
        // )
       
        this.modalService.open(addSiteModal, { backdrop: 'static', keyboard: false, windowClass: "edit" });
    }
    getViewData()
    {
        var SiteId:number = this.isAddSite == true ||this.createFacilityAliasId!=undefined ?this.createFacilityAliasId :this.viewObject.FacilityAliasId;
        this.loadingSymbolForModal=true;
        var facilityAliasNm;
        var packageName :any = [];
        this.facilityService.getFacilityAliasDetailsByfacilityIds(SiteId).subscribe(
            data=>{
                facilityAliasNm= data[0].FacilityAliasNm;
                this.facilityService.getPackageDetailsByFacilityID(SiteId).subscribe(
                    data=>{
                            packageName=data.map(x=>x.PackageNm)
                            this.isCarpet=packageName.filter(x=>x=="Carpet").length>0 ?true:false;
                            if(this.isCarpet){
                        this.facilityService.getTowerFloodDetailsByFacilityAliasID(SiteId,this.pageNumberSite,this.selectedPageSizeSite).subscribe(
                            data=>{
                                debugger;
                                this.viewData=[]
                                this.towerfloorDetails=data;  
                                this.viewData=this.isAddSite == true && this.viewData!=null ?this.viewData:[];
                                //this.countSiteView=data[1][0].totalcount;
                                for(var i=0;i<this.towerfloorDetails[0].length;i++){
                                    var TowerNm = this.towerfloorDetails[0][i].TowerNm;
                                    var floorNm=this.towerfloorDetails[0][i].FloorNm;
                                var data_1={facilityAliasName:facilityAliasNm,Tower:TowerNm,FloorNm:floorNm,PackageNm:packageName.toString()}
                                this.viewData.push(data_1);
                                }
                                this.isCarpet=false;
                                this.countSiteView=this.isAddSite == true ? this.viewData.length :data[0].length;
                                this.setPagerViewSite();
                            }
                        )}
                        else{
                            this.viewData=this.isAddSite == true && this.viewData!=null ?this.viewData:[];
                            var data_1={facilityAliasName:facilityAliasNm,Tower:"NA",FloorNm:"NA",PackageNm:packageName.toString()}
                            this.viewData.push(data_1);
                            this.countSiteView=1;
                                this.setPagerViewSite();
                        }
                    }
                )
            }
        );
    }
    setPagerViewSite(){
        this.pagerViewSite = this.pagerService.getPager(this.countSiteView, this.pageNumberSite, this.selectedPageSizeSite);
        if (this.sortDirectionSite == "asc") {
            this.viewData = this.viewData.sort((a, b) => a[this.sortColumnSite].localeCompare(b[this.sortColumnSite])).slice(this.pagerViewSite.startIndex, this.pagerViewSite.endIndex + 1);
        }
        if(this.sortDirectionSite=='desc'){
            this.viewData = this.viewData.sort((a, b) => b[this.sortColumnSite].localeCompare(a[this.sortColumnSite])).slice(this.pagerViewSite.startIndex, this.pagerViewSite.endIndex + 1);
        }
        this.loadingSymbolForModal=false;
    }
    setPageSite(page: number){
       
        this.pageNumberSite = page;
        this.getViewData();
    }
    onPagingOptionsChangeViewSite(e: number) {
        debugger;
        this.selectedPageSizeSite = +e;
        this.pageNumberSite = 1;
        this.getViewData();
    }
    defaultSortSite :boolean = true;
    sortColumnSite:string = 'facilityAliasName';
    sortDirectionSite="asc";
    SortingSite(sortColumn :string){
        if (this.defaultSortSite && this.sortColumnSite == sortColumn) {
            this.sortColumnSite = sortColumn;
            this.sortDirectionSite = "asc";
            this.defaultSortSite = false;
        }
        else {
            this.defaultSortSite = false;
        }
        if (this.sortColumnSite != sortColumn) {
            this.sortColumnSite = sortColumn;
            this.sortDirectionSite = "asc";
        }
        else {
            this.sortColumnSite = sortColumn;
            this.sortDirectionSite = this.sortDirectionSite == "asc" ? "desc" : "asc";
        }
        this.setPagerViewSite();
    }
    clearfacility(){
        this.selectCountryID=-1;
        this.zoneDetails=null;
        this.Zonename=null;
        this.cityDetailsbyZone=null;
        this.selectCityId=-1;
        this.txtFacility=null;
        this.ViewFacilityDetails=null;
    }
    clearAddedSite(){
        this.selectTowerId=-1;
        this.floorDetails=null;
        this.selectFloorId=[];
        this.selectPackageId=[];
    }
    clearSite(){
       if(this.isAddSite)
       {
        this.txtSite=null;
        this.txtDutyEngineer=null;
        this.txtdutyManager=null;
        this.towerDetails=null;
        this.selectTowerId=-1;
        this.floorDetails=null;
        this.selectFloorId=[];
        this.selectPackageId=[];
        this.selectfacilityId=-1;
       }
       else{
        this.selectTowerId=-1;
        this.floorDetails=null;
        this.selectFloorId=[];
        this.selectPackageId=[];
        this.loadingSymbolForModal=true;
        this.facilityService.getManagersDetails(this.viewObject.FacilityAliasId).subscribe(
            data=>{
                this.txtdutyManager=data[0].DutyManagerGroupId;
                this.txtDutyEngineer=data[0].DutyEngineerGroupId;
                this.loadingSymbolForModal=false;
            }
        )
       }
    }
    cancelbtn(){
        this.selectCountryID=-1;
        this.zoneDetails=null;
        this.Zonename=null;
        this.cityDetailsbyZone=null;
        this.selectCityId=-1
        this.selectfacilityId=-1;
        this.txtFacility=null;
        this.txtSite=null;
        this.txtDutyEngineer=null;
        this.txtdutyManager=null;
        this.towerDetails=null;
        this.selectTowerId=null;
        this.floorDetails=null;
        this.selectFloorId=[];
        this.selectPackageId=[];
        this.modalService.dismissAll();
        this.ViewFacilityDetails= null;
        this.viewData=null;
        this.ViewFacilitysortColumn="FacilityNm";
        this.ViewFacilitysortDirection="asc";
        this.sortColumnSite = 'facilityAliasName';
        this.sortDirectionSite="asc";
        this.defaultSortFacility=true;
        this.defaultSortSite  = true;
    }
}
