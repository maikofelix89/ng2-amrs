
import { Component, OnInit , Input , OnChanges , SimpleChanges } from '@angular/core';

import { CaseManagementResourceService } from './../../etl-api/case-management-resource.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'case-management',
    templateUrl: './case-management.component.html',
    styleUrls: ['./case-management.component.css']
})

export class CaseManagementComponent implements OnInit , OnChanges {

    public title = 'Case Management';
    public patientList = [];
    public params: any;

    constructor(
        private route: ActivatedRoute,
        private caseManagementResourceService: CaseManagementResourceService) {
    }

    public ngOnInit() {

    this.route
    .queryParams
    .subscribe((params: any) => {
        if (params) {
          this.getPatientList(params);
          this.params = params;
        }
      }, (error) => {
        console.error('Error', error);
      });
    }


    public ngOnChanges(change: SimpleChanges) {
    }

    public getPatientList(params) {
        this.caseManagementResourceService.getCaseManagementList(params)
        .subscribe((patients) => {
          this.patientList = patients;
        });
    }


}
