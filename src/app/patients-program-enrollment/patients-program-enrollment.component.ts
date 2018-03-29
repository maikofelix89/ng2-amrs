import { Component, OnInit, OnDestroy, AfterViewInit, Output, EventEmitter, Input, ChangeDetectorRef
} from '@angular/core';
import { Router, ActivatedRoute, ActivatedRouteSnapshot, Params } from '@angular/router';
import * as _ from 'lodash';
import * as Moment from 'moment';
import { PatientProgramEnrollmentService } from
    './../etl-api/patient-program-enrollment.service';
import { DepartmentProgramsConfigService } from
'./../etl-api/department-programs-config.service';

@Component({
    selector: 'patients-program-enrollment',
    templateUrl: './patients-program-enrollment.component.html',
    styleUrls: ['./patients-program-enrollment.component.css']
})

export class PatientsProgramEnrollmentComponent implements OnInit {

    public title: string = 'Active patient Program Enrollment';
    public params: any;
    public showSummary: boolean = true;
    public showPatientList: boolean = true;

    @Input() public filterSelected: any[];

    public busyIndicator: any = {
        busy: false,
        message: '' // default message
    };

    public startDate: string = '';
    public endDate: string = '';
    public selectedLocation: any;
    public replaceSummary: boolean = true;

    public enrollmentSummaryColdef: any = [
        { headerName: 'Department', field: 'dept', rowGroup: true , hide: true},
        { headerName: 'Program', field: 'program'},
        { headerName: '#Enrolled', field: 'enrolled' ,
        cellRenderer: (column) => {
            if (typeof column.value !== 'undefined') {
                return '<a href="javascript:void(0);" title="Identifiers">' + column.value + '</a>';
            }else {
                return '';
            }
        },
        onCellClicked: (column: any) => {
            this.params = {
                'startDate': this.startDate,
                'endDate': this.endDate,
                'locationUuid': this.selectedLocation,
                'programType': column.data.programUuid
            };
            this.replaceSummary = false;

            console.log('Column', column);
            this.getEnrollments(this.params);
        }}
    ];

    public enrollmentColdef: any = [
        { headerName: 'No', field: 'no' , minWidth: 50},
        { headerName: 'Identifier', field: 'identifier' , minWidth: 200,
        cellRenderer: (column) => {
            return '<a href="javascript:void(0);" title="Identifiers">' + column.value + '</a>';
        },
        onCellClicked: (column) => {
            console.log('Column', column);
            this.redirectTopatientInfo(column.data.patient_uuid);
        }
        },
        { headerName: 'Name', field: 'name' , minWidth: 200},
        { headerName: 'Program', field: 'program',   minWidth: 600,
        cellRenderer : (params) => {
            return '<div>' + params.value + '</div>';
        },
        cellStyle: {
            'white-space': 'normal',
            'fontsize': '14px !important',
            'overflow-y': 'scroll',
            'word-wrap': 'break-word'}},
    ];

    public departmentProgConfig: any = [];

    public patientsEnrolledList: any = [
    ];

    public style = {
        marginTop: '20px',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box'
    };

    public gridOptions: any = {
        enableColResize: true,
        enableSorting : true,
        enableFilter : true,
        showToolPanel : false,
        paginationPageSize : 300,
        onGridSizeChanged : () => {
            this.gridOptions.api.sizeColumnsToFit();
        },
        getRowHeight : (params) => {
            // assuming 50 characters per line, working how how many lines we need
            let height = params.data.program.length / 80;
            if ( height > 1) {
                   return (height + 1) * 19;
            } else {

                 return 25;
            }
        },
        getRowStyle : (params) => {
            return {'font-size': '14px', 'cursor': 'pointer'};
        }
    };

    public summaryGridOptions: any = {
        enableColResize: true,
        enableSorting : true,
        enableFilter : true,
        showToolPanel : false,
        groupDefaultExpanded: -1,
        onGridSizeChanged : () => {
            this.summaryGridOptions.api.sizeColumnsToFit();

        },
        getRowStyle : (params) => {
            return {'font-size': '14px', 'cursor': 'pointer'};
        }
    };

    public enrolledSummaryList: any = [];

    constructor(
        private _patientProgramEnrollmentService: PatientProgramEnrollmentService,
        private _departmentProgramService: DepartmentProgramsConfigService,
        private _router: Router) {
    }

    public ngOnInit() {

        this.getDepartmentConfig();
    }

    public getDepartmentConfig() {

        this._departmentProgramService.getDartmentProgramsConfig()
          .subscribe((results) => {
            if (results) {
              this.departmentProgConfig = results;
            }
          });
    }

    public selectedFilter($event) {

        this.enrolledSummaryList = [];
        this.enrolledSummaryList = [];
        this.replaceSummary = true;
        this.setQueryParams($event);
        let queryParams = this.getQueryParams();
        this.getEnrollments(queryParams);

    }

    public getEnrollments(params) {

        this.busyIndicator = {
            busy: true,
            message: 'Fetching Patient Enrollments...'
         };

        if (typeof params !== 'undefined') {

                this._patientProgramEnrollmentService.getActivePatientEnrollments(params)
                .subscribe((enrollments) => {
                    if (enrollments) {
                        this.processEnrollments(enrollments);
                    }

                    this.busyIndicator = {
                        busy: false,
                        message: ''
                    };
                });

    }

}

    public processEnrollments(enrollments: any) {

        let i = 1;
        let enrolledPatientList = [];
        let trackPatientMap = new Map();
        let programMap = new Map();
        let patientIndex  = 0;

        _.each((enrollments), (enrollment: any) => {

            let patientUuid = enrollment.person_uuid;
            let patientObjMap = trackPatientMap.get(patientUuid);
            let completedDetail = '';
            if (enrollment.date_completed != null) {

                completedDetail = '( Completed - ' +
                Moment(enrollment.date_completed).format('DD-MMM-YYYY') + ') ';

            }

            let enrollmentDateDetail = enrollment.program_name + '( Enrolled - ' +
            Moment(enrollment.enrolled_date).format('DD-MMM-YYYY') + ')' +  completedDetail;

            let programName = enrollment.program_name;
            let program: any = programMap.get(programName);

            if (typeof program === 'undefined') {
                programMap.set(programName, {
                    'programName': programName,
                    'uuid': enrollment.program_uuid,
                    'count': 1
                });

            } else {
                let programCount = program.count;
                programCount++;
                programMap.set(programName, {
                    'programName': programName,
                    'uuid': enrollment.program_uuid,
                    'count': programCount
                });
            }

            if (typeof patientObjMap === 'undefined') {

            let patient = {
                no: i,
                name: enrollment.patient_name,
                identifier: enrollment.patient_identifier,
                program: enrollmentDateDetail,
                patient_uuid : patientUuid
            };

            trackPatientMap.set(patientUuid, patient);

            i++;

            } else {
                  // add second program to program to enrollment detail
                  patientObjMap.program = patientObjMap.program + ' </br>' + enrollmentDateDetail;
                  trackPatientMap.set(patientUuid, patientObjMap);

            }
        });

        this.getEnrolledPatientList(trackPatientMap);

        if (this.replaceSummary === true) {
            // only reload summary if its a fresh request
            this.getEnrolledSummary(programMap);

        }

 }

    public getQueryParams() {

        return this.params;

    }

    public setQueryParams(params: any) {

        if (typeof params.startDate === 'undefined' &&
            typeof params.endDate === 'undefined' &&
            typeof params.locationUuid === 'undefined' &&
            typeof params.programType === 'undefined') {
            params = this.params;
        }else {

        }

        this.endDate = params.endDate;
        this.startDate = params.startDate;
        this.selectedLocation = params.locationUuid;
        this.params = {
            'startDate': params.startDate,
            'endDate': params.endDate,
            'locationUuid': params.locationUuid,
            'programType': params.programType
        };

    }

    public redirectTopatientInfo(patientUuid) {

        if (patientUuid === undefined || patientUuid === null) {
            return;
          } else {

            this._router.navigate(['/patient-dashboard/patient/' + patientUuid +
            '/general/general/landing-page']);

          }
    }

    public getEnrolledPatientList(patientMap) {

        let enrolledPatientList = [];

        patientMap.forEach((mapElement) => {

               enrolledPatientList.push(mapElement);
        });

        console.log(' enrolledPatientList',  enrolledPatientList);

        this.patientsEnrolledList = enrolledPatientList;

    }

    public exportPatientListToCsv() {
        this.gridOptions.api.exportDataAsCsv();
    }

    public getEnrolledSummary(programMap) {

        let summaryList: any = [];

        // get the department the program belongs to

        programMap.forEach((mapElement) => {
            // console.log('element', mapElement);
            let progUuid = mapElement.uuid;
            let programName = mapElement.programName;
            let count = mapElement.count;
            _.each(this.departmentProgConfig, (department: any) => {
                  let programs = department.programs;
                  let departmentName = department.name;
                  _.each(programs, (program: any) => {
                      let uuid = program.uuid;
                      if (uuid === progUuid) {
                          mapElement.department = departmentName;

                          let summaryObj = {
                              'dept': departmentName,
                              'program': programName,
                              'enrolled': count,
                              'programUuid': uuid
                          };

                          summaryList.push(summaryObj);
                      }
                  });
            });
        });
        console.log('Enrolled Summary', summaryList);

        this.enrolledSummaryList = summaryList;

    }

    public collapseExpandSummary() {
        let showSummary = !this.showSummary;
        this.showSummary = showSummary;
    }
    public collapseExpandPatientList() {
        let showList = !this.showPatientList;
        this.showPatientList = showList;
    }

}
