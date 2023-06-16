import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as $ from 'jquery';
import { DataService } from '../../core/services/DataService';
import { MenuMaster } from '../../core/services/Data';
import { OAuthService, OAuthEvent } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment'
import { IfStmt } from '@angular/compiler';

@Component({
  selector: 'rebar-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, AfterViewInit {

  constructor(private service: DataService, private oauthService: OAuthService) { }
  public menuMasterDetails: any;
  isVisible: boolean;
  isNotAuthorized: boolean = false;

  ngOnInit() {
    var self = this;
    this.service.IsUserAvailable(sessionStorage["LoggedinUser"]).subscribe(
      data => {
        if (data != null) {
          if (data[0].totalCount > 0) {
            sessionStorage.setItem("isAuthorized", "true");
            this.service.getMenuMasterDetails(sessionStorage["LoggedinUser"]).subscribe(
              data => {
                this.menuMasterDetails = data[0];
                $(document).ready(function () {
                  if(sessionStorage["userName"].toLowerCase().includes("@external")){
                    var fields = sessionStorage["userName"].split('@');
                      fields=fields[0];
                  }
                  else{
                    var fields = sessionStorage["userName"];
                  }
                  document.getElementById("welcome").textContent = "Welcome, " + fields;
                  $('.pushmenu').hide();
                  $('.pushmenu').hover(function () {
                    $('.pushmenu').animate({ right: 0 }, 200);
                    $('#nav_list').addClass('cross');
                  }, function () {
                    $('#nav_list').removeClass('cross');
                    $(this).animate({ right: '-340px' }, 100);
                    $('.inner').hide();
                  });
                  $("#nav_list").click(function (e) {
                    e.stopPropagation();
                    $(this).toggleClass("cross");
                    if ($(this).hasClass("cross")) {
                      $('.pushmenu').animate({ right: 0 }, 50);
                      $('.pushmenu').show();
                    } else {
                      $('.pushmenu').animate({ right: '-340px' }, 100);
                      $('.inner').hide();
                    }
                  });
                  $("#toggle1").off().click('li a', function (e) {
                    e.stopPropagation();
                    $("#AdminMenu").slideUp();
                    {
                      $(this).toggleClass('show').next().slideToggle();
                      return false;
                    };
                  });
                  $("#toggle").off().click('li a', function (e) {
                    e.stopPropagation();
                    $("#RoleMenu").slideUp();
                    {
                      $(this).toggleClass('show').next().slideToggle();
                      return false;
                    };
                  });
                  $(".accordion > li > a").click(function (e) {
                    //debugger;                    
                    let text = e.currentTarget.text.trim();
                    if (text == "Logout") {
                      self.oauthService.logOut();
                    }
                    e.stopPropagation();
                    var x = $('.accordion li a.show').closest('li').children('ul');
                    if (x.length > 0) {
                      var id = $('.accordion li a.show').closest('li').children('ul').attr('id');
                      var ids = $(this).closest('li').children('ul').attr('id');
                      if (id != ids) {
                        var id1 = "#" + id;
                        $(id1).slideUp();
                        var id2 = "#" + $('.accordion li a.show').attr('id');
                        $(id2).removeClass("show");
                      }
                    }
                    $(this).toggleClass('show').next().slideToggle();
                    return false;
                  });
                });
                debugger;
                //console.log(sessionStorage['route']);
                let route = sessionStorage['route'];
                if (this.menuMasterDetails.length > 0) {
                  if (this.menuMasterDetails[0].subMenu.length > 0) {
                    if (location.pathname == "/") {
                      if (route != "" && route != "/" && route != undefined) {
                        location.href = route;
                      }
                      else {
                        location.href = this.menuMasterDetails[0].subMenu[0].subMenuURL;
                      }
                    }
                  }
                  else {
                    this.isVisible = false;
                    this.isNotAuthorized = true;
                  }
                }
              }
            );
          }
          else {
            sessionStorage.setItem("isAuthorized", "false");
            $(document).ready(function () {
              $(".pushmenu").hide();
            });
          }
        }
        else {
          sessionStorage.setItem("isAuthorized", "false");
          $(document).ready(function () {
            $(".pushmenu").hide();
          });
        }
      }
    );
  }


  ngAfterViewInit() {
    //document.getElementById('admin').setAttribute('class', 'nav-link active');
  }

  // toggle(event: any){
  //   debugger;
  //   alert(event.target.id);
  // }
  updateClass(event: any) {
    debugger;
    //var id = "[id='"+subMenuCode+"']";
    //var name = $(id).closest('a').closest('li').parent().parent().attr('class');
    //document.getElementById('admin').setAttribute('class', 'nav-link');
    //document.getElementById('dash').setAttribute('class', 'nav-link');
    //document.getElementById('admin').setAttribute('class', 'nav-link');
    //document.getElementById(name).setAttribute('class', 'nav-link');
    const target = event.target || event.srcElement || event.currentTarget;
    target.setAttribute('class', 'nav-link active');
  }

  reportURLs(menuname) {
    debugger;
    var report;
    if (menuname == "Daily Carpet Entry Status")
      report = environment.workCompletionDetailsReportURL;
    else if (menuname == "Daily Entry Check")
      report = environment.dataEntryReportURL;
    else if (menuname == "Carpet Consolidated WCC")
      report = environment.workCompletionReportURL;
    else if (menuname == "SRM Dashboard")
      report = environment.dashboardReportURL;
    else if (menuname == "Task Details")
      report = environment.taskDetailsReportURL;
    else if (menuname == "Detailed Dashboard")
      report = environment.detailedDashboardReportURL;
    else
      report = "";
    window.open(report,"_blank")
  }
}

