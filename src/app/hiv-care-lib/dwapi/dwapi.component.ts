import { Component, OnInit , Input , OnChanges , SimpleChanges, TemplateRef } from '@angular/core';
import { DwapiResourceService } from './../../etl-api/dwapi-resource.service';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
    selector: 'app-dwapi',
    templateUrl: './dwapi.component.html',
    styleUrls: ['./dwapi.component.css']
})

export class DwapiComponent implements OnInit {

    public title = 'Dwapi';
    public mflSites = [];
    public params: any;
    public patientList = [];
    public busyIndicator: any = {
      busy: false,
      message: 'Please wait...' // default message
    };
    public errorObj = {
      'isError': false,
      'message': ''
    };
    public successObj = {
      'isSuccess': false,
      'message': ''
    };
    public extractTitle = '';

    constructor(
        private route: ActivatedRoute,
        private dwapiService: DwapiResourceService) {
    }

    public ngOnInit() {
        // this.getMFLSites();
        this.route
        .queryParams
        .subscribe((params: any) => {
            if (params) {
              if (params.filterSet === 'true') {
                this.getDwapiReport(params);
                this.extractTitle = this.formatExtractTitle(params.extract);
               }
               this.params = params;
            }
          }, (error) => {
            console.error('Error', error);
          });
    }
    public getDwapiReport(params: any) {
        this.loading();
        this.resetMessageObjs();
        this.patientList = [];
        this.dwapiService.getDwapiReport(params)
         .subscribe((result: any) => {
           console.log('Dwapi Sites', result);
           if (result) {
               this.patientList = result.results.results;
               console.log('Patientlist', this.patientList);
           }
           this.endLoading();
         }, (err) => {
          this.endLoading();
          this.setErroMsg('An error occurred while trying to load the report.Please reload page');
        });
    }

    public setMFLSite() {
      this.loading();
      this.resetMessageObjs();
      this.dwapiService.setMflSite(this.params)
       .subscribe((result: any) => {
         console.log('Dwapi Sites', result);
         this.setSuccessMessage('MFL Site successfully updated');
         this.endLoading();
       }, (err) => {
        this.endLoading();
        this.setErroMsg('An error occurred while trying to set the mfl site kindly try again');
      });
  }

    public loading() {
      this.busyIndicator = {
        busy: true,
        message: 'Fetching report...please wait'
      };
    }

    public endLoading() {
        this.busyIndicator = {
          busy: false,
          message: ''
        };
    }

    public formatExtractTitle(extractTitle: string) {
      return extractTitle.toLowerCase().split('_').map((word) => {
        return (word.charAt(0).toUpperCase() + word.slice(1));
      }).join(' ');
    }

    public uploadMflSet($event) {
      this.setMFLSite();

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
public updatePatientList($event) {
}
}
