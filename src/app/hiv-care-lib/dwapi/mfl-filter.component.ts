import { Component, OnInit, OnChanges, SimpleChanges , Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';
import * as Moment from 'moment';
import { DwapiResourceService } from './../../etl-api/dwapi-resource.service';


@Component({
    selector: 'app-mfl-filters',
    templateUrl: './mfl-filter.component.html',
    styleUrls: ['./mfl-filter.component.css']
})

export class MflFiltersComponent implements OnInit, OnChanges {

    public title = 'Diwapi Filters';
    @Output() public uploadMflSet = new EventEmitter();
    public params = {
        'mflCodes': [],
        'filterSet': false,
        'extract': ''
    };
    public errorObj = {
        'isError': false,
        'message': ''
      };
    public successObj = {
        'isSuccess': false,
        'message': ''
    };
    public showFilters = true;
    public setFilter = false;

    public locationParams = {};

    public mflCodes = [];
    public mflCodeOptions = [];
    public selectedMflCode = [];
    public extractOptions = [
        {
            'label': 'All Patients',
            'value': 'all_patients'
        },
        {
            'label': 'ART Patients',
            'value': 'art_patients'
        },
        {
            'label': 'Patient Baselines',
            'value': 'patient_baselines'
        },
        {
            'label': 'Patient Status',
            'value': 'patient_status'
        },
        {
            'label': 'Patient Labs',
            'value': 'patient_labs'
        },
        {
            'label': 'Patient Pharmacy',
            'value': 'patient_pharmacy'
        },
        {
            'label': 'Patient Visit',
            'value': 'patient_visit'
        },
        {
            'label': 'Patient Adverse Events',
            'value': 'patient_adverse_events'
        }
    ];

    public extract = '';

    constructor(
      private router: Router,
      private route: ActivatedRoute,
      private dwapiService: DwapiResourceService) {
    }

    public ngOnInit() {
        this.getMFLSites().then((result) => {
        });
    }

    public ngOnChanges(change: SimpleChanges) {


    }


    public getMFLSites(): Promise<any> {
        return new Promise((resolve, reject) => {

            this.dwapiService.getMFLSites()
                .subscribe((result: any) => {
                    this.processMFLSites(result);
                    resolve('success');
                }, (error) => {
                    resolve(error);
                });

        });
    }

    public processMFLSites(mflSites) {

        const sites = [];
        _.each(mflSites, (site: any) => {
            sites.push(
                {
                    label: site.Facility + '(' + site.mfl_code + ')',
                    value: site.mfl_code
                }
            );
        });

        this.mflCodeOptions = sites;

    }

    public setFilters() {
        // this.filterSet = true;
        const validFilter = this.validSelectedOptions();
        if (validFilter) {
            this.setParams();
        }
    }
    public setParams() {
      this.params = {
        'mflCodes' : this.setSelectedMflCode(this.selectedMflCode),
        'filterSet': true,
        'extract': this.extract
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

    public resetFilters() {
      this.setParams();
    }

    public onMflSelected($event) {

    }

    public setSelectedMflCode(selectedMFLS) {
        return selectedMFLS.map((mfl: any) => {
          return mfl.value;
        });

    }
    public validSelectedOptions(): boolean {
         this.resetMessageObjs();
         if (this.extract.length > 0 && this.selectedMflCode.length > 0 ) {
            return true;
         } else {
            this.setErroMsg('Kindly ensure you have selected one facility and one extract');
            return false;
         }

    }
    public resetMessageObjs() {
        this.errorObj = {
            isError: false,
            message: ''
        };
        this.successObj = {
          isSuccess: false,
          message: ''
      };
    }

    public setMflSite() {
        if (this.selectedMflCode.length > 0) {
          this.uploadMflSet.emit(true);
        } else {
            this.setErroMsg('Kindly ensure you have set at least one MFL site');
        }
    }

    public restartMssql() {
        this.resetMessageObjs();
        console.log('Selected MFL', this.selectedMflCode);
        const validMfl = this.validateMflSiteSelected();
        if (validMfl) {
        this.dwapiService.restartMssqlService()
        .subscribe((result) => {
            console.log('Result', result);
            this.setSuccessMessage('MSSQL Service successfully Restarted');
        }, (error) => {
            this.setErroMsg('Error Restarting MSSQL service. Contact Admin');
        });

    } else {
        this.setErroMsg('Kindly ensure you have set at least one MFL site');

    }

    }

    public onExtractChange($event) {
    }
    public validateMflSiteSelected(): boolean {
        if (this.selectedMflCode.length > 0) {
            return true;
        } else {
              return false;
        }

    }

    public setErroMsg(message: string) {
        this.errorObj = {
            isError: true,
            message: message
        };
    }

    public setSuccessMessage(message: string) {
        this.successObj = {
            isSuccess: true,
            message: message
          };

    }




}

