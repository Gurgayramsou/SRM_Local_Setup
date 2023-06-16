import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
//import { AuthGuard } from './core/auth/auth.guard';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { REBAR_AUTH_GUARD } from './core/auth/rebar.auth.module';
const appRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: ''
        // canActivate: [REBAR_AUTH_GUARD]
    }
    ,
    // {
    //     path: 'home',
    //     loadChildren: './feature/home/home.module#HomeModule',
    //     canActivate: [AuthGuard]
    // },
    // {
    //     path: 'admin',
    //     loadChildren: './feature/admin/admin.module#AdminModule',
    //     canActivate: [AuthGuard]
    // },
    // {
    //     path: 'dashboard',
    //     loadChildren: './feature/dashboard/dashboard.module#DashboardModule',
    //     canActivate: [AuthGuard]
    // },
    {
        path: 'admin/createpackage',
        loadChildren: './feature/admin/package/createpackage.module#CreatePackageModule',
        data: {title : 'Create Package'},
        canActivate: [REBAR_AUTH_GUARD]
    },
    {
        path: 'admin/performancedashboard',
        loadChildren: './feature/admin/performancedashboard/performancedashboard.module#PerformanceDashboardModule',
        data: {title : 'Performance Dashboard'},
        canActivate: [REBAR_AUTH_GUARD]
    },
    {
        path: 'admin/taskmaster',
        loadChildren: './feature/admin/taskmaster/taskmaster.module#TaskMasterModule',
        data: {title : 'Task Master'},
        canActivate: [REBAR_AUTH_GUARD]
    },
    {
        path: 'admin/rolemapping',
        loadChildren: './feature/admin/rolemapping/rolemapping.module#RoleMappingModule',
        data: {title : 'Role Mapping'},
        canActivate: [REBAR_AUTH_GUARD]
    },
    {
        path: 'admin/rolemaster',
        loadChildren: './feature/admin/rolemaster/rolemaster.module#RoleMasterModule',
        data: {title : 'Role Master'},
        canActivate: [REBAR_AUTH_GUARD]
    },
    {
        path: 'transaction/taskdataentry',
        loadChildren: './feature/transaction/task/taskdataentry.module#TaskDataEntryModule',
        data: {title : 'Task Data Entry'},
        canActivate: [REBAR_AUTH_GUARD]
    },
    {
        path: 'transaction/submitscore',
        loadChildren: './feature/transaction/score/submitscore.module#SubmitScoreModule',
        data: {title : 'Submit Score'},
        canActivate: [REBAR_AUTH_GUARD]
    },
    {
        path: 'transaction/approval',
        loadChildren: './feature/transaction/approval/approval.module#ApprovalModule',
        data: {title : 'ZL/SDL View'},
        canActivate: [REBAR_AUTH_GUARD]
    },
    {
        path: 'transaction/approval/:id',
        loadChildren: './feature/transaction/approval/approval.module#ApprovalModule',
        data: {title : 'ZL/SDL View'},
        canActivate: [REBAR_AUTH_GUARD]
    },
    {
        path: 'transaction/vendor',
        loadChildren: './feature/transaction/vendor/vendor.module#VendorModule',
        data: {title : 'Vendor View'},
        canActivate: [REBAR_AUTH_GUARD]
    },
    {
        path: 'transaction/vendor/:id',
        loadChildren: './feature/transaction/vendor/vendor.module#VendorModule',
        data: {title : 'Vendor View'},
        canActivate: [REBAR_AUTH_GUARD]
    },
    // {
    //     path: 'reports',
    //     loadChildren: './feature/reports/reports.module#ReportsModule',
    //     data: {title : 'Reports'},
    //     canActivate: [AuthGuard]
    // },
    {
        path: 'reports/workcompletion',
        loadChildren: './feature/reports/workcompletion/workcompletion.module#WorkCompletionModule',
        data: {title : 'Carpet Consolidated WCC'},
        canActivate: [REBAR_AUTH_GUARD]
    },
    {
        path: 'reports/workcompletiondetails',
        loadChildren: './feature/reports/workcompletiondetails/workcompletiondetails.module#WorkCompletionDetailsModule',
        data: {title : 'Daily Carpet Entry Status'},
        canActivate: [REBAR_AUTH_GUARD]
    },
    {
        path: 'reports/dashboard',
        loadChildren: './feature/reports/dashboard/dashboard.module#DashboardModule',
        data: {title : 'SRM Dashboard'},
        canActivate: [REBAR_AUTH_GUARD]
    },
    {
        path: 'reports/dataentry',
        loadChildren: './feature/reports/dataentry/dataentry.module#DataEntryModule',
        data: {title : 'Daily Entry Check'},
        canActivate: [REBAR_AUTH_GUARD]
    },
    {
        path: 'reports/detaileddashboard',
        loadChildren: './feature/reports/detaileddashboard/detaileddashboard.module#DetailedDashboardModule',
        data: {title : 'Detailed Dashboard'},
        canActivate: [REBAR_AUTH_GUARD]
    },
    {
        path: 'reports/taskdetails',
        loadChildren: './feature/reports/taskdetails/taskdetails.module#TaskDetailsModule',
        data: {title : 'Task Details'},
        canActivate: [REBAR_AUTH_GUARD]
    },
    {
        path: 'not-found',
        component: PageNotFoundComponent,
        data: {title : 'Page Not Found'},
    },
    {
        path: 'admin/facilitymaster',
        loadChildren: './feature/admin/facilitymaster/facilitymaster.module#FacilityMasterModule',
        data: {title : 'Facility Master'},
        canActivate: [REBAR_AUTH_GUARD]
    },
    {
        path: '**',
        redirectTo: 'not-found',
    }
];
export const routing: ModuleWithProviders<any> = RouterModule.forRoot(appRoutes);


import { DefaultUrlSerializer, UrlTree } from '@angular/router';

export class LowerCaseUrlSerializer extends DefaultUrlSerializer {
    parse(url: string): UrlTree {
        return super.parse(url.toLowerCase()); 
    }
}