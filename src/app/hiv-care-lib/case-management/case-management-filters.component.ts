import { Params } from '@angular/router';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit , Input } from '@angular/core';


@Component({
    selector: 'case-management-filters',
    templateUrl: './case-management-filters.component.html',
    styleUrls: ['./case-management-filters.component.css']
})

export class CaseManagementFiltersComponent implements OnInit {

public title = 'Case Management Report Filters';
    public params = {
        'caseManagerUuid': 'manager_uuid',
        'noCaseManager': false,
        'noPhoneRTC': false,
        'dueForVl': false,
        'elevatedVL': false,
        'minDefaultPeriod': 0,
        'maxDefaultPeriod': 0,
        'minFollowupPeriod': 0,
        'maxFollowupPeriod': 0,
        'filterSet': false
    };

public caseManagers = [];
public selectedCaseManager: any;
public mockCaseManagers = [
        {
            label: ' Manager 1',
             value: 1
        },
        {
            label: ' Manager 2',
             value: 2
        },
        {
            label: ' Manager 3',
             value: 3
        }
];

public dueForVl = false;
public elevatedVL = false;
public noCaseManager = false;
public noPhoneRTC = false;
public minFollowupPeriod = 0;
public maxFollowupPeriod = 0;
public minDefaultPeriod = 0;
public maxDefaultPeriod = 0;
public filterSet = false;

constructor(
    private router: Router, 
    private route: ActivatedRoute) {
}

public ngOnInit() {
    this.getCaseManagers();
    this.getParamsFromUrl();
}

public getCaseManagers() {
   this.caseManagers = this.mockCaseManagers;
}

public setFilters() {
 console.log('set filters..');
 this.filterSet = true;
 this.setParams();
}
public setParams() {
    this.params = {
        'caseManagerUuid': this.selectedCaseManager,
        'dueForVl': this.dueForVl,
        'elevatedVL': this.elevatedVL,
        'noCaseManager': this.noCaseManager,
        'noPhoneRTC': this.noPhoneRTC,
        'minDefaultPeriod': this.minDefaultPeriod,
        'maxDefaultPeriod': this.maxDefaultPeriod,
        'minFollowupPeriod': this.minFollowupPeriod,
        'maxFollowupPeriod': this.maxDefaultPeriod,
        'filterSet': this.filterSet
    };

    this.storeReportParamsInUrl(this.params);

}


public storeReportParamsInUrl(params) {

    this.router.navigate(['./'],
    {
      queryParams: params,
      relativeTo: this.route
    });

  }

  public getParamsFromUrl(){
      const urlParams: any = this.route.snapshot.queryParams;
      console.log('urlParams', urlParams);

                this.dueForVl = this.processBooleanString(urlParams.dueForVl);
                this.noCaseManager = this.processBooleanString(urlParams.noCaseManager);
                this.noPhoneRTC = this.processBooleanString(urlParams.noPhoneRTC);
                this.elevatedVL = this.processBooleanString(urlParams.elevatedVL);
                this.minFollowupPeriod = urlParams.minFollowupPeriod ? urlParams.minFollowupPeriod : '';
                this.maxFollowupPeriod = urlParams.maxFollowupPeriod ? urlParams.maxFollowupPeriod : '';
                this.minDefaultPeriod = urlParams.minDefaultPeriod ? urlParams.minDefaultPeriod : '';
                this.maxDefaultPeriod = urlParams.maxDefaultPeriod ? urlParams.maxDefaultPeriod : '';
                this.selectedCaseManager = urlParams.caseManagerUuid ? urlParams.caseManagerUuid : '';

    

  }
  public processBooleanString(boolenString){
      if(boolenString === 'true'){
         return true
      }else{
          return false;
      }

  }




}

