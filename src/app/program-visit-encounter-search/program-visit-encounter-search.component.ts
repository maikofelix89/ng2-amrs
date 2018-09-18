
import {
  Component,
  OnInit , OnDestroy , AfterViewInit,
  Output , EventEmitter, Input , ChangeDetectorRef,
  ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute, ActivatedRouteSnapshot, Params } from '@angular/router';
import * as _ from 'lodash';
import * as Moment from 'moment';
import { PatientProgramResourceService } from './../etl-api/patient-program-resource.service';
import { LocalStorageService } from '../utils/local-storage.service';
import { DepartmentProgramsConfigService } from './../etl-api/department-programs-config.service';
import { SelectDepartmentService } from './program-visit-encounter-search.service';
import { ItemsList } from '@ng-select/ng-select/ng-select/items-list';

@Component({
  selector: 'program-visit-encounter-search',
  templateUrl: './program-visit-encounter-search.component.html',
  styleUrls: ['./program-visit-encounter-search.component.css']
})

export class ProgramVisitEncounterSearchComponent implements OnInit, OnDestroy , AfterViewInit {

    public programs: Array <any> = [];
    public visitTypes: Array <any> = [];
    public encounterTypes: any = [];
    public params: any;
    public filterKeys: any = [];
    public program: any = [];
    public department: any = [];
    public visitType: any  = [];
    public visits = [];
    public encounterType: any = [];
    public filterSet: boolean = false;
    public departments: any = [];
    public encounters: any = [];
    public dropdownSettings: any = {
                                  'singleSelection': false,
                                  'text': 'Select or enter to search',
                                  'selectAllText': 'Select All',
                                  'unSelectAllText': 'UnSelect All',
                                  'enableSearchFilter': true,
                                  'maxHeight': 200
                                };
    public programDropdownSettings: any = {
                                  'singleSelection': true,
                                  'text': 'Select or enter to search',
                                  'enableSearchFilter': true,
                                  'maxHeight': 200
                                };
    public loadingFilters: boolean = true;
    public myDepartment;
    public showFilters: boolean = true;
    public programVisitMap = new Map();
    public programMaps = new Map();
    public visitMaps = new Map();
    public encounterMaps = new Map();
    public visitTypeMap = new Map();
    public visitTypeEncounterTypeMap =  new Map();
    public programVisitsConfig: any;
    public departmentPrograms: any;
    public selectedEncounterType: any;
    public selectedVisitType: any;
    public selectedProgramType;
    @Input() public calendarType: string;
    public filterMonth = Moment().format('YYYY-MM');
    public filterDate = Moment().format('YYYY-MM-DD');

    @Output() public filterSelected: EventEmitter<any> = new EventEmitter<any>();
    @Input() public monthControl: boolean;
    @Input() public dateControl: boolean;

    constructor(
      private cd: ChangeDetectorRef,
      private router: Router,
      private route: ActivatedRoute,
      private _patientProgramService: PatientProgramResourceService,
      private _departmentProgramService: DepartmentProgramsConfigService,
      private selectDepartmentService: SelectDepartmentService
    ) {

    }

    public ngOnInit() {
      this.loadingFilters = true;
      this.getProgramVisitsConfig()
      .then((result) => {
          this.route
          .queryParams
          .subscribe((params: any) => {
            if (params) {
                this.params = params;
                console.log('Visit enounter Params', params);
                if (params.startDate) {
                this.getParamsFromUrl(params);
                }
                this.loadingFilters = false;
            }
          }, (error) => {
              console.error('Error', error);
              this.loadingFilters = false;
          });
          })
          .catch((error) => {
             console.error('ERROR', error);
             this.loadingFilters = false;
          });
    }
    public ngOnDestroy() {

    }
    public ngAfterViewInit() {

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
    public getParamsFromUrl(params) {

      let newParams = {
        programType: [],
        visitType: [],
        encounterType: [],
        startDate: '',
        endDate: ''
      };
      if (params.programType) {
          newParams.programType = params.programType;
          const selectedPrograms = this.loadFilterFromMap(params.programType, this.programMaps);
          this.program = selectedPrograms;
          this.loadProgramVisitTypes(params.programType);
          // console.log('selectedprograms', selectedPrograms);
      }
      if (params.visitType) {
          newParams.visitType = params.visitType;
          const selectedVisitType = this.loadFilterFromMap(params.visitType, this.visitMaps);
          // console.log('selectedvisitTypes', selectedVisitType);
          const isVisitString = this.isString(params.visitType);
          if (isVisitString) {
              this.loadEncounterTypeFromVisitType(params.visitType);
          }else {
            _.each(params.visitType, (visitType) => {
              this.loadEncounterTypeFromVisitType(visitType);
            });

          }
          this.visitType = selectedVisitType;
      }
      if (params.encounterType) {
          newParams.encounterType = params.encounterType;
          const selectedEncounterType =
          this.loadFilterFromMap(params.encounterType, this.encounterMaps);
          // console.log('selectedencounterTypes', selectedEncounterType);
          this.encounterType = selectedEncounterType;
      }
      if (params.startDate) {
          newParams.startDate = params.startDate;
      }
      if (params.startDate) {
          newParams.startDate = params.startDate;
      }

      this.emitParams(newParams);
}

public setFiltersFromUrlParams(params, mapObj) {

  let filterArray = [];

  _.each(params, (item) => {
     const filterItem = mapObj.get(item);
     filterArray.push(filterItem);
  });

  // console.log(filterArray);

  return filterArray;

}
    public showFilter() {
        this.showFilters = true;
    }
    public hideFilter() {
        this.showFilters = false;
    }
    public getCurrentDepartment() {

      this.selectDepartmentService.getDepartment().subscribe((d) => {
        // console.log('Saved Department', d);
        this.myDepartment = d;
        this.getDepartmentPrograms(d);
      });

    }
    public getDepartmentPrograms(department) {

        this._departmentProgramService.getDepartmentPrograms(department)
        .subscribe((result) => {
            // console.log('Department Programs', result);
            this.departmentPrograms = result;
            this.loadProgramFilter(result);
        });

    }
    public getProgramVisitsConfig() {
      return new Promise((resolve, reject) => {

        this._patientProgramService.getAllProgramVisitConfigs()
        .subscribe((response) => {
          if (response) {
            this.programVisitsConfig = JSON.parse(JSON.stringify(response));
            this.getCurrentDepartment();
            this.setProgramVisitEncounterMaps();
            resolve('success');
          }
        });

      });
    }
    public setProgramVisitEncounterMaps() {
      const programVisitsConfig = this.programVisitsConfig;

      _.each(programVisitsConfig, (program: any, index) => {
             const programObj = {
               'id': index,
               'itemName': program.name
             };
             this.programMaps.set(index, programObj);
             const visitTypes = program.visitTypes;
             this.programVisitMap.set(index, visitTypes);
             _.each(visitTypes, (visitType: any) => {
                  const visitTypeObj = {
                     'id': visitType.uuid,
                     'itemName': visitType.name
                  };
                  this.visitMaps.set(visitType.uuid, visitTypeObj);
                  const encounterTypes = visitType.encounterTypes;
                  this.visitTypeEncounterTypeMap.set(visitType.uuid, encounterTypes);
                  _.each(encounterTypes, (encounterType) => {
                      const encounterObj = {
                         'id': encounterType.uuid,
                         'itemName': encounterType.display
                      };
                      this.encounterMaps.set(encounterType.uuid, encounterObj);
                  });
             });
      });
      // console.log('programMaps', this.programMaps);
      // console.log('visitTypeMaps', this.visitMaps);
      // console.log('encounterMaps', this.encounterMaps);

    }
    public loadProgramFilter(departmentPrograms) {
          let programsArray = [];
          _.each(departmentPrograms, (program: any) => {
            let programUuid = program.uuid;
            let programName = program.name;
            let programObj = {
               'id': programUuid,
               'itemName': programName
            };
            programsArray.push(programObj);
            let programItem: any = this.programVisitsConfig[programUuid];
            let visitTypes: any = programItem.visitTypes;
            this.programVisitMap.set(programUuid, visitTypes);
            this.mapVisitTypeToEncounterTypes(visitTypes);
            // console.log('programItem' , programItem);
            // console.log('visitTypes' , visitTypes);
            // console.log('encounterTypes' , encounterTypes);
          });

          // console.log('programVisitMap', this.programVisitMap);
          // console.log('visitTypeEncounterTypeMap', this.visitTypeEncounterTypeMap);

          this.programs = programsArray;
    }
    public mapVisitTypeToEncounterTypes(visitTypes) {
        _.each(visitTypes, (visitType: any) => {
            let encounterTypes = visitType.encounterTypes;
            let visitTypeUuid = visitType.uuid;
            this.visitTypeEncounterTypeMap.set(visitTypeUuid, encounterTypes);
        });

    }
    public selectProgram($event) {
      // console.log('Event', $event);
      this.loadProgramVisitTypes($event.id);
      this.filterSet = false;
    }
    public loadProgramVisitTypes(program) {
      // console.log('loadProgramVisitTypes', program);
      let programVisitTypes = this.programVisitMap.get(program);
      let programVisitArray = [];
      this.visitTypes = [];
      if (typeof programVisitTypes !== 'undefined') {
          _.each(programVisitTypes, (visitType: any) => {
              // console.log('Visit TYpe', visitType);
              let visitTypeUuid = visitType.uuid;
              let visitTypeName = visitType.name;
              let visitTypeObj = {
                 'id': visitTypeUuid,
                 'itemName': visitTypeName
               };
              this.visitTypes.push(visitTypeObj);
          });
      }

      // console.log('loadProgramVisitTypes VisitTypes', this.visitTypes);

      // this.visitTypes = programVisitArray;
    }

    public selectVisitType($event) {
      // console.log('visittype selected', $event);
      this.loadEncounterTypeFromSelectedVisitType($event.id);
      this.filterSet = false;
    }
    public loadEncounterTypeFromVisitType(visitType) {
      // console.log('loadEncounterTypeFromVisitType', visitType);
      let encounterTypes = this.visitTypeEncounterTypeMap.get(visitType);
      if (typeof encounterTypes !== 'undefined') {

        _.each(encounterTypes, (encounterType: any) => {
         let encounterTypeUuid = encounterType.uuid;
         let encounterTypeName = encounterType.display;
         let encounterTypeObj = {
            'id': encounterTypeUuid,
            'itemName': encounterTypeName
          };
         this.encounterTypes.push(encounterTypeObj);
        });

      }

      // console.log('loadEncounterTypeFromVisitType', this.encounterTypes);

   }
    public loadEncounterTypeFromSelectedVisitType(visitType) {
       let encounterTypes = this.visitTypeEncounterTypeMap.get(visitType);
       let currentEncounterTypes = _.map(this.encounterTypes, 'id');
       // console.log('currentEncounterTypes', currentEncounterTypes);
       if (typeof encounterTypes !== 'undefined') {

        _.each(encounterTypes, (encounterType: any) => {
          let encounterTypeUuid = encounterType.uuid;
          let encounterTypeName = encounterType.display;
          let encounterTypeObj = {
             'id': encounterTypeUuid,
             'itemName': encounterTypeName
           };
          if (_.includes(currentEncounterTypes, encounterTypeUuid) === false) {
            // console.log('Does not contain', encounterTypeObj);
            this.encounterTypes.push(encounterTypeObj);
          } else {
            // console.log('Contains', encounterTypeObj);
          }
      });

       }

    }

    public selectEncounterType($event) {
      this.filterSet = false;
    }
    public encounterTypeDeSelect($event) {
      this.filterSet = false;
    }
    public onSelectAllEncounterTypes($event) {
      this.filterSet = false;
    }
    public onDeSelectAllEncounterTypes($event) {
      this.filterSet = false;
    }
    public programDeSelect($event) {
      // console.log('program deselect', $event);
      this.removeProgramVisits($event.id);
      this.filterSet = false;
    }
    public removeProgramVisits(program) {

      let programVisitTypes = this.programVisitMap.get(program);
      if (typeof programVisitTypes !== 'undefined') {
         let visitTypesArray = _.map(programVisitTypes, 'uuid');

         // console.log('visitTypes', visitTypesArray);
         this.visitTypes = _.filter(this.visitTypes, (visitType: any) => {
            let visitTypeUuid = visitType.id;
            if (_.includes(visitTypesArray, visitTypeUuid) === false) {
               return true;
            }else {
              this.removeVisitEncounterTypes(visitTypeUuid);
              return false;
            }
            // return (_.includes(visitTypesArray, visitTypeUuid) === false);
         });
         this.visitType = _.filter(this.visitType, (visitType: any) => {
          let visitTypeUuid = visitType.id;
          return (_.includes(visitTypesArray, visitTypeUuid) === false);
         });
      }

    }

    public visitTypeDeSelect($event) {
      this.removeVisitEncounterTypes($event.id);
      this.filterSet = false;

    }

    public removeVisitEncounterTypes(visitType) {

      let visitEncounterTypes = this.visitTypeEncounterTypeMap.get(visitType);
      if (typeof visitEncounterTypes !== 'undefined') {
        let encounterTypesArray = _.map(visitEncounterTypes, 'uuid');

        // console.log('encounterTypes', encounterTypesArray);
        this.encounterTypes = _.filter(this.encounterTypes, (encounterType: any) => {
           let encounterTypeUuid = encounterType.id;
           return (_.includes(encounterTypesArray, encounterTypeUuid) === false);
        });
        this.encounterType = _.filter(this.encounterType, (encounterType: any) => {
         let encounterTypeUuid = encounterType.id;
         return (_.includes(encounterTypesArray, encounterTypeUuid) === false);
        });
     }

    }

    public onSelectAllPrograms($event) {
      console.log('Select All programs', $event);
      let programsSelected = $event;
      _.each(programsSelected, (program: any) => {
          let programUuid = program.id;
          this.loadProgramVisitTypes(programUuid);
      });
      this.filterSet = false;
    }

    public onDeSelectAllPrograms($event) {
      this.resetFilters();
    }
    public onSelectAllVisitTypes($event) {
       let deselectedVisitTypes = $event;
       _.each(deselectedVisitTypes, (visitType: any) => {
           let visitTypeUuid = visitType.id;
           this.loadEncounterTypeFromVisitType(visitTypeUuid);
       });
       this.filterSet = false;
    }
    public resetFilters() {
      this.program = [];
      this.visitTypes = [];
      this.visitType = [];
      this.encounterType = [];
      this.encounterTypes = [];
      this.filterSet = false;
    }

    public setUrlParams(params) {

      let navigationData = {
        queryParams: params,
        replaceUrl: true
      };

      let currentUrl = this.router.url;

      let routeUrl = currentUrl.split('?')[0];
      this.router.navigate([routeUrl], navigationData);

    }

    public setParams() {

      let selectedProgramType: any;
      let selectedStartDate: string;
      let selectedEndDate: string;

      if (this.program.length === 0) {
         selectedProgramType = _.map(this.programs , 'id');
      }else {
        selectedProgramType = _.map(this.program , 'id');
      }
      if (this.dateControl) {
        selectedStartDate = Moment(this.filterDate).format('YYYY-MM-DD');
        selectedEndDate = Moment(this.filterDate).format('YYYY-MM-DD');
      }
      if (this.monthControl) {
        selectedStartDate = Moment(this.filterMonth, 'YYYY-MM')
        .startOf('month').format('YYYY-MM-DD');
        selectedEndDate = Moment(this.filterMonth, 'YYYY-MM')
        .endOf('month').format('YYYY-MM-DD');
      }

      let selectedVisitType = _.map(this.visitType, 'id');
      let selectedEncounterType = _.map(this.encounterType, 'id');
      this.params = {
           'programType': selectedProgramType,
           'visitType': selectedVisitType,
           'encounterType': selectedEncounterType,
           'startDate': selectedStartDate,
           'endDate': selectedEndDate
      };

      let navigationData = {
        queryParams: this.params,
        replaceUrl: true
      };

      let currentUrl = this.router.url;

      let routeUrl = currentUrl.split('?')[0];
      this.router.navigate([routeUrl], navigationData);

    }

    public getParams() {
      this.setParams();
      return this.params;
    }

    public setFilter() {
      let params = this.getParams();
      this.setParams();
      this.emitParams(params);
      this.filterSet = true;
    }

    public emitParams(params) {
       this.filterSelected.emit(params);
    }

    public previousMonth() {
       let currentMonth = this.filterMonth;
       let prevMonth = Moment(currentMonth, 'YYYY-MM').subtract(1 , 'month').format('YYYY-MM');
       this.filterMonth = prevMonth;
       this.setFilter();
    }
    public nextMonth() {
      let currentMonth = this.filterMonth;
      let nextMonth = Moment(currentMonth, 'YYYY-MM').add(1 , 'month').format('YYYY-MM');
      this.filterMonth = nextMonth;
      this.setFilter();

    }
    public getSelectedDate($event) {
      console.log('date event', $event);
      let newDate: string = Moment($event).format('YYYY-MM-DD');
      this.filterDate = newDate;
      this.filterSet = false;
      // this.setFilter();
    }
    public previousDay() {
        let currentDay = this.filterDate;
        let newDate = Moment(currentDay).subtract(1, 'day').format('YYYY-MM-DD');
        this.filterDate = newDate;
        this.setFilter();
    }
    public nextDay() {
      let currentDay = this.filterDate;
      let newDate = Moment(currentDay).add(1, 'day').format('YYYY-MM-DD');
      this.filterDate = newDate;
      this.setFilter();

    }

}
