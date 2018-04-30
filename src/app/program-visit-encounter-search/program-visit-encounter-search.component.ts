
import {
  Component,
  OnInit , OnDestroy , AfterViewInit,
  Output , EventEmitter, Input , ChangeDetectorRef,
  ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ActivatedRouteSnapshot, Params } from '@angular/router';
import * as _ from 'lodash';
import { PatientProgramResourceService } from './../etl-api/patient-program-resource.service';
import { LocalStorageService } from '../utils/local-storage.service';
import { DepartmentProgramsConfigService } from './../etl-api/department-programs-config.service';
import * as Moment from 'moment';

@Component({
  selector: 'program-visit-encounter-search',
  templateUrl: './program-visit-encounter-search.component.html',
  styleUrls: ['./program-visit-encounter-search.component.css']
})

export class ProgramVisitEncounterSearchComponent implements OnInit, OnDestroy , AfterViewInit {

    public selectedProgram: string;
    public selectedDate = Moment().format('YYYY-MM-DD');
    public showProgramTypes: boolean = true;
    public showFilters: boolean = true;
    public programs: Array <any> = [];
    public visitTypes: Array <any> = [];
    public encounterTypes: any = [];
    public departmentConf: any[] = require('./department-programs-config.json');
    public programDepartments: any = [];
    public programVisitsEncounters: any[];
    public selectedEncounterType: any = [];
    public selectedProgramType: any = [];
    public selectedVisitType: any  = [];
    public selectedDepartment: any = [];
    public params: any = [];
    public filterKeys: any = [];
    public program: any = [];
    public department: any = [];
    public visitType: any  = [];
    public departmentMap = new Map();
    public programTypeMap = new Map();
    public encounterTypeMap = new Map();
    public visitTypeMap = new Map();
    public visits = [];
    public encounterType: any = [];
    public filterSet: boolean = false;
    public allMapsLoaded: boolean = false;
    public departments: any = [];
    public trackPrograms: any = [];
    public trackVisitTypes: any = [];
    public trackEncounterTypes: any = [];
    public filterError: boolean = false;
    public activePrograms: any = [];
    public filterdepartment: string = 'hiv';
    public departmentKey: string = 'department';
    public filterParams: string = '';
    public encounters: any = [];
    public savedDepts: any  = [];
    public dropdownSettings: any = {
                                  'singleSelection': false,
                                  'text': 'Select or enter to search',
                                  'selectAllText': 'Select All',
                                  'unSelectAllText': 'UnSelect All',
                                  'enableSearchFilter': true,
                                   'badgeShowLimit': 5
                                };
    public loadingFilters: boolean = true;

    @Output() public filterSelected: EventEmitter<any> = new EventEmitter<any>();
    @Input() public dateTypeFilter: string = '';

    constructor(
      private cd: ChangeDetectorRef,
      private router: Router,
      private route: ActivatedRoute,
      private _patientProgramService: PatientProgramResourceService,
      private localStorageService: LocalStorageService,
      private departmentProgramService: DepartmentProgramsConfigService) {

    }

    public ngOnInit() {
      this.getDepartmentConfig();
      this.route
      .queryParams
      .subscribe((params) => {
        if (params) {
            this.params = params;
            console.log('Visit enounter Params', params);
            this.loadParamsFromUrl(params);
        }
      }, (error) => {
          console.error('Error', error);
      });
    }

    public loadParamsFromUrl(params) {

      let newParams = {
        department: [],
        programType: [],
        visitType: [],
        encounterType: [],
        showPrograms: '',
        startDate: this.selectedDate

      };

      if (params.visitType) {
        newParams.visitType = params.visitType;
      }
      if (params.encounterType) {
        newParams.encounterType = params.encounterType;
      }
      if (params.department) {
        newParams.department = params.department;
      }
      if (params.programType) {
          newParams.programType = params.programType;
          newParams.showPrograms = params.showPrograms;

      }
      if (params.startDate) {
          newParams.startDate = params.startDate;
          this.selectedDate = params.startDate;
      }

      this.emitParams(newParams);
    }

    public getDepartmentConfig() {

     this.departmentProgramService.getDartmentProgramsConfig()
     .subscribe((results) => {
         if (results) {
              this.programDepartments = results;
              this.getAllDepartments();
              this.getProgramVisitsConfig();
          }
     });

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
                    this.programVisitsEncounters = JSON.parse(JSON.stringify(response));
                    this.loadProgramVisitEncounterMap(this.programVisitsEncounters)
                    .then((result) => {
                        console.log('Loaded Map', result);
                        this.loadFilterFromUrlParams();
                    })
                    .catch((error) => {
                      console.error('Error', error);
                    });
              }
        });
    }

  public isString(value) {
      if (typeof value === 'string') {
        return true;
      } else {
        return false;
      }
   }

   public loadFilterFromMap(values: any , map) {
     let filterArray = [];

     if (this.isString(values)) {
       let selectedType = map.get(values);
       filterArray.push(selectedType);

       }else {
         for (let value of values){
           let selectedType = map.get(value);
           filterArray.push(selectedType);
         }

       }

     return filterArray;

   }

   public loadFilterFromUrlParams() {

    let params = this.route.snapshot.queryParams;

    console.log('Load Filter from Params', params);

    if (params.department) {

      let department = this.loadFilterFromMap(params.department , this.departmentMap);
      this.department = department;
      console.log('This.department', this.department);
      console.log('This.departments', this.departments);
     }

    if (params.programType) {
      console.log('Show Programs Program Map', this.programTypeMap);
      let program = this.loadFilterFromMap(params.programType , this.programTypeMap);
      this.program = [];
      console.log('Show Programs', params.showPrograms);
      if (params.showPrograms && params.showPrograms === 'true') {
          console.log('params.showPrograms && params.showPrograms');
          console.log('program', program);
          this.program = program;
      }
      console.log('This.programType', this.program);
      console.log('This.programTypes', this.programs);
    }

    if (params.visitType) {

      let visitType = this.loadFilterFromMap(params.visitType , this.visitTypeMap);
      this.visitType = visitType;
      console.log('This.visitType', this.visitType);
      console.log('This.visitTypes', this.visitTypes);

    }
    if (params.encounterType) {

      let encounterType = this.loadFilterFromMap(params.encounterType , this.encounterTypeMap);
      this.encounterType = encounterType;
      console.log('This.encounterType', encounterType);
      console.log('This.encounterTypes', this.encounterTypes);

    }
    if (params.startDate) {
        this.selectedDate = params.startDate;
    }

    this.loadProgramFromDepartment();

   }

    public loadProgramVisitEncounterMap(programVisitConfig) {

      return new Promise((resolve, reject) => {

        console.log('loadEncounterTypesFromVisitTypes');

        // console.log('loadProgramVisitEncounterMap');

        _.each(programVisitConfig, (program: any, index) => {

          let specificProgram = {
            'id': index,
            'itemName': program.name
          };
         //  console.log('loadProgramVisitEncounterMap', index);
          this.programTypeMap.set(index, specificProgram);

          let visitTypes = program.visitTypes;

          _.each(visitTypes, (visitType: any) => {

              let specificVisitType = {
                  'id': visitType.uuid,
                  'itemName': visitType.name
              };

              this.visitTypeMap.set(visitType.uuid, specificVisitType);

              let encounterTypes = visitType.encounterTypes;

              _.each(encounterTypes, (encounterType: any) => {

                let specificEncounterType = {
                  'id': encounterType.uuid,
                  'itemName': encounterType.display
                };

                this.encounterTypeMap.set(encounterType.uuid, specificEncounterType);

              });

          });

        });

        console.log('ProgramMap', this.programTypeMap);
        console.log('VisitTypeMap', this.visitTypeMap);
        console.log('EncounterTypeMap', this.encounterTypeMap);

        resolve('success');

      });

    }

     // get all the departments

    public getAllDepartments() {

        let departments = this.programDepartments;

        _.each(departments, ( department: any , index) => {

           let specificDepartment = {
                 'itemName': department.name,
                 'id': index
           };

           this.departmentMap.set(index, specificDepartment);

           this.departments.push(specificDepartment);

        });

        // console.log('DepartmentMap', this.departmentMap);

    }


        // load all programs

  public getAllPrograms() {

        this.programs = [];

        let allPrograms  = [];

        let programsVisitsConf = this.programVisitsEncounters;

        _.each(programsVisitsConf, (program: any, index) => {

            let specificProgram = {
              'id': index,
              'itemName': program.name
            };

            allPrograms.push(specificProgram);

          });

        this.programs = allPrograms;

    }

    public selectDepartment(department) {

        let departmentsSelected = this.department;
        this.filterSet = false;

        this.programs = [];
        this.trackPrograms = [];

        _.each(departmentsSelected, (departmentSelected: any) => {
           this.getDepartmentPrograms(departmentSelected);
        });

    }

    public loadProgramFromDepartment() {

      let departmentsSelected = this.department;
      _.each(departmentsSelected, (departmentSelected: any) => {
         this.getDepartmentPrograms(departmentSelected);
      });

    }

    public onDeSelectAllDepartment($item) {
    }

    public selectProgram(item) {
      this.filterSet = false;
      this.loadVisitTypesFromPrograms();
    }

    public onSelectAllPrograms(item) {

      this.filterSet = false;
      this.loadVisitTypesFromPrograms();

    }

    public onDeSelectAllPrograms(item) {

      this.filterSet = false;
      this.visitType = [];
      this.visitTypes = [];
      this.encounterType = [];
      this.encounterTypes = [];

    }

  public getDepartmentPrograms(departmentSelected) {

        let departments = this.programDepartments;
        let programs = this.programVisitsEncounters;
        let programsArray = [];

        _.each(departments, (department: any, index) => {

          if (index === departmentSelected.id) {

          let deptPrograms = department.programs;

          _.each(deptPrograms, (program: any) => {

            let specificProgram = {
              'id': program.uuid,
              'itemName': program.name
            };

            if (_.includes(this.trackPrograms, program.uuid ) === false) {
                 this.programs.push(specificProgram);
                 this.trackPrograms.push(program.uuid);

            }else {
            }

          });

          }

        });

        // this.loadProgramFromPrograms();
        setTimeout(() => {
        this.loadVisitTypesFromPrograms();
        }, 500);

    }

    public loadProgramFromPrograms() {

        this.program = [];
        this.selectedProgramType = [];

        _.each(this.programs, (program: any , index) => {
              let specificProgram = {
                'itemName': program.itemName,
                'id': program.id
              };
              this.program.push(specificProgram);
        });

        setTimeout(() => {
          this.loadVisitTypesFromPrograms();
        }, 500);

    }

    public loadVisitTypesFromPrograms() {

      let programsSelected = this.programs;
      let programVisitEncounters = this.programVisitsEncounters;
      let visitTypesArray = [];
      this.visitTypes =  [];
      console.log('Program Selected', programsSelected);

      _.each(programsSelected, (program: any) => {
             let progUuid = program.id;

             _.each(programVisitEncounters, (programVisit: any, index) => {

               if (index === progUuid) {
                   // load all the visit
                   let visitTypes = programVisit.visitTypes;

                   _.each(visitTypes, (visitType: any) => {
                     let specificVisitType = {
                       'itemName': visitType.name,
                       'id': visitType.uuid
                     };

                     visitTypesArray.push(specificVisitType);
                   });
               }
             });

      });

      this.visitTypes = visitTypesArray;

      this.loadEncounterTypesFromVisitTypes();

    }

    public addEncounterTypes(visitTypeSelected) {

       let programVisitEnounters = this.programVisitsEncounters;

       let visitTypeUuid = visitTypeSelected.id;

       _.each(programVisitEnounters, (programVisit: any, index) => {

         let visitTypes = programVisit.visitTypes;

         _.each(visitTypes, (visitType: any) => {

           if (visitType.uuid === visitTypeUuid) {

             // load the visitTypes encounterTypes
             let encounterTypes = visitType.encounterTypes;
             _.each(encounterTypes, (encounterType: any) => {

               let specificEncounterType = {
                 'id': encounterType.uuid,
                 'itemName': encounterType.display
               };

               this.encounterTypes.push(specificEncounterType);

             });

           }
         });
       });

    }

    public loadEncounterTypesFromVisitTypes() {


      /*
         checks the available saved selected visit type and
         loads the available encounter types for the
         visit types
      */

        let programVisitEnounters = this.programVisitsEncounters;
        let visits = this.visitType;
        let encountersArray = [];
        this.encounterTypes = [];

        _.each(visits, (visit: any) => {

            // console.log('visit', visit);

            _.each(programVisitEnounters, (programVisit: any, index) => {

                let visitTypes = programVisit.visitTypes;

                _.each(visitTypes, (visitType: any) => {

                  if (visitType.uuid === visit.id) {

                    // load the visitTypes encounterTypes
                    let encounterTypes = visitType.encounterTypes;
                    _.each(encounterTypes, (encounterType: any) => {

                      let specificEncounterType = {
                        'id': encounterType.uuid,
                        'itemName': encounterType.display
                      };

                      encountersArray.push(specificEncounterType);

                    });

                  }
                });
              });

        });

        this.encounterTypes = encountersArray;
        // console.log('loadEncounterTypesFromVisitTypes', encountersArray);


    }

    public selectVisitType($event) {

      // add the visitTypes encounter types
      this.addEncounterTypes($event);

      this.filterSet = false;

    }

    public selectEncounterType($event) {

       this.filterSet = false;

    }

    public encounterTypeDeSelect($event) {

      this.filterSet = false;

    }

    public onSelectAllDepartments($event) {

      this.selectDepartment($event);
      this.filterSet = false;

    }

    public onSelectAllVisitTypes($event) {

      let selectedVisitTypes = $event;

      _.each(selectedVisitTypes, (visitType: any) => {
            this.addEncounterTypes(visitType);
      });

    }

    public programDeSelect($event) {

      /*
      get visit types, encounter types under the program
      and remove them
      */

      let progaramVisitEncounters = this.programVisitsEncounters;
      let programVisitTypes = [];
      let programEncounterTypes = [];
      let selectedProgramUuid = $event.id;

      _.each(progaramVisitEncounters, (pve: any, index) => {
        let programUuid = index.toString();
        if (programUuid === selectedProgramUuid) {
          let visitTypes = pve.visitTypes;
          _.each(visitTypes, (visitType: any) => {
            programVisitTypes.push(visitType.uuid);

            let encounterTypes = visitType.encounterTypes;
            _.each(encounterTypes, (encounterType: any) => {
              programEncounterTypes.push(encounterType.uuid);
            });
          });

        }
      });

      this.removeVisitTypes(programVisitTypes);

      this.removeEncounterTypes(programEncounterTypes);

      this.filterSet = false;

    }

    public visitTypeDeSelect($event) {

      let progaramVisitEncounters = this.programVisitsEncounters;
      let visitEncounterTypes = [];
      let selectedVisitTypeUuid = $event.id;

      _.each(progaramVisitEncounters, (pve: any, index) => {
        let programUuid = index.toString();
        let visitTypes = pve.visitTypes;
        _.each(visitTypes, (visitType: any) => {
          if (selectedVisitTypeUuid === visitType.uuid) {
            let encounterTypes = visitType.encounterTypes;
            _.each(encounterTypes, (encounterType: any) => {
              visitEncounterTypes.push(encounterType.uuid);
            });

          }

        });
      });

      this.filterSet = false;

      this.removeEncounterTypes(visitEncounterTypes);

    }

    public OnItemDeSelect($event) {

    }

    public sendNewRequest() {

      this.setFilterParams();

      let params = {
        'programType': this.selectedProgramType,
        'visitType': this.selectedVisitType,
        'encounterType': this.selectedEncounterType,
        'department': this.selectedDepartment,
        'showPrograms': this.showProgramTypes,
        'startDate': this.selectedDate
      };

      const currentParams = this.route.snapshot.queryParams;
      let navigationData = {
        queryParams: params,
        replaceUrl: true
      };

      let currentUrl = this.router.url;

      let routeUrl = currentUrl.split('?')[0];
      this.router.navigate([routeUrl], navigationData);

    }

    public setFilter() {

      this.sendNewRequest();

      this.filterSet = true;

    }

     public emitParams(params) {

           this.filterSelected.emit(params);

    }

    /*
     on deselecting a department remove its associated programs,
     visit types and encounter types
    */

    public departmentDeselect($event) {

         let departmentUuid = $event.id;
         let departmentPrograms = [];
         let programVisitEncounters = this.programVisitsEncounters;
         let departmentVisitTypes = [];
         let departmentEncounterTypes = [];

         // get all the programs under the department

         _.each(this.departmentConf, (department: any, index) => {
                  if (index === departmentUuid) {
                         _.each(department.programs, (deptProgram: any) => {
                           departmentPrograms.push(deptProgram.uuid);
                         });
                     }
         });

         // get all visit types and encountertypes in the department

         _.each(programVisitEncounters, (progVisitsEncounters, index) => {
                  let programUuid = index.toString();
                  if (_.includes(departmentPrograms, programUuid) === true) {

                      let visitTypes = progVisitsEncounters.visitTypes;
                      _.each(visitTypes, (visitType: any) => {
                            departmentVisitTypes.push(visitType.uuid);

                            let encounterTypes = visitType.encounterTypes;
                            _.each(encounterTypes, (encounterType: any) => {
                                    departmentEncounterTypes.push(encounterType.uuid);
                            });
                      });

                   }
         });

         this.removeProgramTypes(departmentPrograms);

         this.removeVisitTypes(departmentVisitTypes);

         this.removeEncounterTypes(departmentEncounterTypes);

         this.filterSet = false;

         this.cd.detectChanges();

    }
    /*
     remove programs on removing parent
    */

    public removeProgramTypes(programUuids) {

       // remove programsType in the department removed

         for (let i = this.programs.length - 1; i >= 0; i--) {
           let programUuid = this.programs[i].id;
           if (_.includes(programUuids, programUuid) === true) {
             this.programs.splice(i, 1);
           } else {
           }
         }

         // remove from program

         for (let i = this.program.length - 1; i >= 0; i--) {
           let programUuid = this.program[i].id;

           if (_.includes(programUuids, programUuid) === true) {
             this.program.splice(i, 1);
           }
         }

    }

    /*
     remove visitTypes on removing their parent

    */

    public removeVisitTypes(visitTypesUuids) {

       // remove from visitTypes model

         for (let i = this.visitTypes.length - 1; i >= 0; i--) {
           let visitTypeUuid = this.visitTypes[i].id;

           if (_.includes(visitTypesUuids, visitTypeUuid) === true) {
             this.visitTypes.splice(i, 1);
           }
         }

         // remove from visitType model

         for (let i = this.visitType.length - 1; i >= 0; i--) {
           let visitTypeId = this.visitType[i].id;

           if (_.includes(visitTypesUuids, visitTypeId) === true) {
             this.visitType.splice(i, 1);
           }
         }

    }

    /*
     remove encounterTypes on removing their parent

    */

    public removeEncounterTypes(enconterTypeUuids) {

       // remmove from encounter types model
         for (let i = this.encounterTypes.length - 1; i >= 0; i--) {
           let encounterTypeUuid = this.encounterTypes[i].id;

           if (_.includes(enconterTypeUuids, encounterTypeUuid) === true) {
             this.encounterTypes.splice(i, 1);
           }
         }

         // remmove from encounter type model
         for (let i = this.encounterType.length - 1; i >= 0; i--) {
           let encounterTypeid = this.encounterType[i].id;

           if (_.includes(enconterTypeUuids, encounterTypeid) === true) {
             this.encounterType.splice(i, 1);
           }
         }

    }

    public setFilterParams() {
      let programArray  = [];
      let visitTypeArray = [];
      let encounterTypeArray = [];
      let departmentArray = [];
      this.showProgramTypes = false;

      console.log('this.departmentConf', this.programDepartments);

      // strip property names and remain with array of uuids

      if (this.department.length === 0) {
        // if nothing is selected

      } else {

        _.each(this.department, (department: any) => {
              departmentArray.push(department.id);
        });

      }
      if (this.department.length > 0 && this.program.length === 0) {
        // if only department is selected then load programs from department
         console.log('this.department.length > 0 && this.program.length === 0');
         _.each(this.department, (department: any) => {
            console.log('index', department.id);
            console.log('department', department);
            let departmentPrograms = this.programDepartments[department.id];

            console.log('departmentPrograms', departmentPrograms);

            _.each(departmentPrograms.programs, (deptProgram: any) => {
                    programArray.push(deptProgram.uuid);
            });
          });

      }
      if (this.department.length > 0 && this.program.length > 0) {
        // if depatment and programs and selected
          console.log('this.department.length > 0 && this.program.length > 0');

          _.each(this.program, (program) => {
              programArray.push(program.id);
          });

          if (this.visitType.length > 0 ) {

               console.log('this.visitType.length > 0');

               _.each(this.visitType, (visitType) => {
                  visitTypeArray.push(visitType.id);
               });

               if (this.encounterType.length > 0) {
                    console.log('this.encounterType.length > 0');
                    _.each(this.encounterType, (encounterType) => {
                      encounterTypeArray.push(encounterType.id);
                    });
               }

           }

          this.showProgramTypes = true;

      }

      console.log('Program Array', programArray);
      console.log('visitTypeArray', visitTypeArray);
      console.log('encounterTypeArray', encounterTypeArray);

      this.selectedProgramType = programArray;
      this.selectedVisitType = visitTypeArray;
      this.selectedEncounterType = encounterTypeArray;
      this.selectedDepartment = departmentArray;

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
       this.selectedDate = Moment().format('YYYY-MM-DD');

       this.sendNewRequest();

       // this.emitParams(params);

    }

    public toggleFilterView() {
       this.showFilters = !this.showFilters;
    }

    public getSelectedDate($event) {
       this.selectedDate = Moment($event).format('YYYY-MM-DD');
       this.filterSet = false;
    }

    public prevMonth() {
      this.selectedDate = Moment(this.selectedDate).subtract(1, 'months' ).format('YYYY-MM-DD');
      this.sendNewRequest();
    }
    public nextMonth() {
      this.selectedDate = Moment(this.selectedDate).add(1, 'months' ).format('YYYY-MM-DD');
      this.sendNewRequest();
    }
    public prevDay() {

      this.selectedDate = Moment(this.selectedDate).subtract(1, 'days' ).format('YYYY-MM-DD');
      this.sendNewRequest();

    }
    public nextDay() {
      this.selectedDate = Moment(this.selectedDate).add(1, 'days' ).format('YYYY-MM-DD');
      this.sendNewRequest();
    }

}
