import {
  Component,
  OnInit , OnDestroy , AfterViewInit,
  Output , EventEmitter, Input , ChangeDetectorRef,
  ViewChild }
  from '@angular/core';
import { SelectComponent, SelectItem } from 'ng2-select';
import * as _ from 'lodash';
import { CookieService } from 'ngx-cookie';
import { PatientProgramResourceService } from './../etl-api/patient-program-resource.service';
import { LocalStorageService } from '../utils/local-storage.service';

@Component({
  selector: 'program-visit-encounter-search',
  templateUrl: './program-visit-encounter-search.component.html',
  styleUrls: ['./program-visit-encounter-search.component.css']
})

export class ProgramVisitEncounterSearchComponent implements OnInit, OnDestroy , AfterViewInit {

    public selectedProgram: string;
    public programs: Array <any> = [];
    public visitTypes: Array <any> = [];
    public encounterTypes: any = [];
    public departmentConf: any[] = require('./department-programs-config.json');
    public programDepartments: any = [];
    public programVisitsEncounters: any[];
    public selectedEncounterType: any = [];
    public selectedProgramType: any = [];
    public selectedVisitType: any  = [];
    public params: any = [];
    public filterKeys: any = [];
    public program: any = [];
    public department: any = [];
    public visitType: any  = [];
    public visits = [];
    public encounterType: any = [];
    public filterSet: boolean = false;
    public departments: any = [];
    public trackPrograms: any = [];
    public trackVisitTypes: any = [];
    public trackEncounterTypes: any = [];
    public filterError: boolean = false;
    public activePrograms: any = [];

    @Output() public filterSelected: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('visitTypeFilter') public visitTypeFilter: SelectComponent;

    constructor(
      private cd: ChangeDetectorRef,
      private _cookieService: CookieService,
      private _patientProgramService: PatientProgramResourceService,
      private localStorageService: LocalStorageService) {

    }

    public ngOnInit() {
      this.clearEncounterCookie();
      this.getProgramVisitsConfig();
      this.getDepartmentConfig();
    }

    public getDepartmentConfig() {
        this.programDepartments = JSON.parse(JSON.stringify(this.departmentConf));
        if (this.programDepartments) {
            this.getAllDepartments();
        }

    }

    public ngOnDestroy() {

    }

    public ngAfterViewInit(): void {
      this.cd.detectChanges();
    }

    public getProgramVisitsConfig() {
       this._patientProgramService.getAllProgramVisitConfigs()
        .subscribe((response) => {
              if (response) {
                    console.log('ProgramVisitsConfig ', response);
                    this.programVisitsEncounters = JSON.parse(JSON.stringify(response));
              }
        });
    }

     // get all the programs

    public getAllDepartments() {

        let departments = this.programDepartments;

        _.each(departments, ( department: any , index) => {

           let specificDepartment = {
                 'label': department.name,
                 'value': index
           };

           // console.log('Department', specificDepartment);
           this.departments.push(specificDepartment);

        });

    }

    public getPrograms(departmentUuid) {

        // console.log('Get Departments', departmentUuid);

        let departments = this.programDepartments;
        let programs = this.programVisitsEncounters;
        let programsArray = [];

        _.each(departments, (department: any, index) => {
          // console.log('Department', index);

          if (index === departmentUuid) {

          let deptPrograms = department.programs;

          _.each(deptPrograms, (program: any) => {

            let specificProgram = {
              'label': program.name,
              'value': program.uuid
            };

            if (_.includes(this.trackPrograms, program.uuid ) === false) {
                 console.log('getProgram', program.uuid );
                 this.programs.push(specificProgram);
                 this.trackPrograms.push(program.uuid);

            }else {
            }

          });

          }

        });

        setTimeout(() => {
          this.loadProgramFromPrograms();
        }, 500);


    }

    // load program from programs

    public loadProgramFromPrograms() {

        this.program = [];

         // console.log('Programs', this.programs);

        _.each(this.programs, (program: any , index) => {
              // console.log('sPEC Programs', program);
              this.program.push(program.value);
        });

    }



    // get visitType Selected based on program selected

    public  getVisitTypes(progUuid) {

      let programs = this.programVisitsEncounters;

      _.each(programs, (program: any, index) => {
        if (progUuid === index ) {

          let visitTypes = program.visitTypes;

          _.each(visitTypes, (visitType: any) => {

            let specificVisitType = {
              'label': visitType.name,
              'value': visitType.uuid
            };
            if (_.includes(this.trackVisitTypes, visitType.uuid) === false) {
              this.visits.push(specificVisitType);
              this.trackVisitTypes.push(visitType.uuid);

            } else {
            }

          });

        } else {
        }

      });

      this.visitTypes = this.visits;


    }

    public getEncounterTypes(visitTypeUuid) {

       let programs = this.programVisitsEncounters;

       _.each(programs, (program: any, index) => {

         let visitTypes = program.visitTypes;

         _.each(visitTypes, (visitTyp: any) => {

           let visitUuid = visitTyp.uuid;

           if (visitTypeUuid === visitUuid) {

             let encounterTypes = visitTyp.encounterTypes;

             _.each(encounterTypes, (encounterType: any) => {

               let specificEncounterType = {
                 'label': encounterType.display,
                 'value': encounterType.uuid
               };

               if (_.includes(this.trackEncounterTypes, encounterType.uuid ) === false) {
                    this.encounterTypes.push(specificEncounterType);
                    this.trackEncounterTypes.push(encounterType);

               }else {
                }

             });

           }

         });

       });

    }

    public selectDepartment(department) {

        let departmentsSelected = this.department;

        this.programs = [];
        this.trackPrograms = [];

        _.each(departmentsSelected, (departmentSelected: any) => {
           this.getPrograms(departmentSelected);
        });


    }

    public selectProgram(program) {


       /*
       when program is selected it uses its uuid
       to get its associated visit types
       */

       let programsSelected = this.program;
       this.trackVisitTypes = [];
       this.visits = [];

       _.each(programsSelected, (programSelected: any) => {
             this.getVisitTypes(programSelected);
       });




       this.selectedProgramType = this.program;

       this.filterSet = false;

    }

    public selectVisitType(visitType) {

       // get a list of visitTypes selected

       this.encounterTypes = [];

       let selectedVisitTypes = this.visitType;

       _.each(selectedVisitTypes, (selectedVisit: any) => {
             this.getEncounterTypes(selectedVisit);
       });

       let visitTypeUuid = visitType.value;

       this.selectedVisitType = this.visitType;
       this.filterSet = false;

    }

    public departmentChange($event) {
       this.updatePrograms($event);
       this.filterSet = false;
    }

    public programChange($event) {
        this.updateVisitTypes($event);
        this.filterSet = false;
        this.selectedProgramType = $event;

    }

    public visitTypeChange($event) {
          this.updateEncounterTypes($event);
          this.selectedVisitType = this.visitType;

    }

    public encounterTypeChange($event) {
        this.updateEncounterTypes($event);
        this.selectedEncounterType = $event;
        this.filterSet = false;

    }

    public updatePrograms(departments) {

        this.programs = [];
        this.trackPrograms = [];
        _.each(departments, (department: any, index) => {
            this.getPrograms(department);
        });

    }

    public updateVisitTypes(programs) {
          this.visits = [];
          this.trackVisitTypes = [];

          _.each(programs, (program: any, index) => {
            this.getVisitTypes(program);
          });

    }

  

    public updateEncounterTypes(visitTypes) {
      this.encounterTypes = [];
      _.each(visitTypes, (visitType: any, index) => {
        this.getEncounterTypes(visitType);
      });

    }

    public selectAllDepartments() {

      this.department = [];

      _.each(this.departments, (department: any, index) => {
        this.department.push(department.value);
      });

    }

    public clearDepartments() {

       this.department = [];
       this.programs = [];
       this.program = [];
       this.visitType = [];
       this.visitTypes = [];
       this.encounterTypes = [];
       this.encounterType = [];
       this.selectedProgramType = [];
       this.filterSet = false;

    }

    public clearPrograms() {

       this.program = [];
       this.visitType = [];
       this.visitTypes = [];
       this.encounterTypes = [];
       this.encounterType = [];
       this.selectedProgramType = [];
       this.filterSet = false;

    }

    public clearVisitTypes() {
      this.visitType = [];
      this.encounterType = [];
      this.encounterTypes = [];
      this.filterSet = false;

    }

    public clearEncounterTypes() {

      this.encounterType = [];
      this.filterSet = false;

    }
    public selectAllPrograms() {

         this.program = [];

         _.each(this.programs, ( program, index) => {
                this.program.push(program.value);
         });

         this.selectedProgramType = this.program;

    }
    public selectAllVisitTypes() {

         this.visitType = [];

         _.each(this.visitTypes, ( visit: any , index) => {
                this.visitType.push(visit.value);
         });

         this.selectedVisitType = this.visitType;


    }
    public selectAllEncouterTypes() {

         this.encounterType = [];

         _.each(this.encounterTypes, ( encounter: any , index) => {
                this.encounterType.push(encounter.value);
         });

         this.selectedEncounterType = this.encounterType;


    }

    public selectEncounterType(encounterType) {

      let encounterUuid = encounterType.uuid;

      let filterKey = {
        'type': 'Encounter Type',
        'value': encounterType.name
      };

      this.filterKeys.push(filterKey);

      this.selectedEncounterType = this.encounterType;
      this.filterSet = false;

    }

    // load all the programs when it loads

    public  allProgramsInitialLoad() {

       let params = {
         'programType': [],
         'visitType': [],
         'encounterType': []
       };

       // load inital params

       this.emitParams(params);

    }

    public emitParams(params) {

           let urlParams = encodeURI(JSON.stringify(params));

           let cookieKey = 'programVisitEncounterFilter';

           let cookieVal =  urlParams;

           let programVisitCookie = this._cookieService.get(cookieKey);

           if (typeof programVisitCookie === 'undefined') {


           } else {

             this._cookieService.remove(cookieKey);

             this.localStorageService.remove('programVisitEncounterFilter');

           }

           this.localStorageService.setItem('programVisitEncounterFilter', cookieVal);

           this._cookieService.put(cookieKey, 'true');

           this.filterSelected.emit(params);

           this.filterSet = true;

    }

    public getMonthlyScheduleParameters() {

      let params = {
        'programType': this.selectedProgramType,
        'visitType': this.selectedVisitType,
        'encounterType': this.selectedEncounterType
      };

      this.emitParams(params);

    }

    public clearEncounterCookie() {

       let cookieKey = 'programVisitEncounterFilter';
       let programVisitCookie = this._cookieService.get(cookieKey);

       if (typeof programVisitCookie === 'undefined') {

       } else {

         this._cookieService.remove(cookieKey);

         this.localStorageService.remove(cookieKey);

       }

    }

    public resetFilter() {
       this.department = [];
       this.program = [];
       this.visitType = [];
       this.visitTypes = [];
       this.encounterTypes = [];
       this.encounterType = [];
       this.selectedProgramType = [];
       this.selectedEncounterType = [];
       this.selectedVisitType = [];
       this.filterSet = false;

       let cookieKey = 'programVisitEncounterFilter';
       let programVisitCookie = this._cookieService.get(cookieKey);

       if (typeof programVisitCookie === 'undefined') {

       } else {

         this._cookieService.remove(cookieKey);

         this.localStorageService.remove(cookieKey);

       }

       let params = {
         'programType': this.selectedProgramType,
         'visitType': this.selectedVisitType,
         'encounterType': this.selectedEncounterType
       };

       // this.emitParams(params);

    }

}
