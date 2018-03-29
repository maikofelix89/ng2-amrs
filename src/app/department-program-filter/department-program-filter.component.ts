import { Component, OnInit, OnDestroy, AfterViewInit, Output,
  EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, ActivatedRouteSnapshot, Params } from '@angular/router';
import * as _ from 'lodash';
import * as Moment from 'moment';
import { PatientProgramResourceService } from './../etl-api/patient-program-resource.service';
import { LocalStorageService } from '../utils/local-storage.service';
import { DepartmentProgramsConfigService } from './../etl-api/department-programs-config.service';
import { UserDefaultPropertiesService } from
'./../user-default-properties/user-default-properties.service';
import { LocationResourceService } from './../openmrs-api/location-resource.service';

@Component({
  selector: 'department-program-filter',
  templateUrl: './department-program-filter.component.html',
  styleUrls: ['./department-program-filter.component.css']
})

export class DepartmentProgramFilterComponent implements OnInit, OnDestroy, AfterViewInit {

  public selectedProgram: string;
  public programs: Array<any> = [];
  public departmenProgramtConfig: any = [];
  public programVisitsConfig: any[];
  public selectedProgramType: any = [];
  public params: any = [];
  public program: any = [];
  public department: any = [];
  public filterSet: boolean = false;
  public departments: any = [];
  public trackPrograms: any = [];
  public departmentKey: string = 'enrollmentDepartment';
  public programFilterKey: string = 'departmentProgramFilter';
  public enrollmentDateKey: string = 'enrollmentDates';
  public enrollmentLocationKey: string = 'enrollmentLocation';
  public selectedStartDate: string = Moment().startOf('month').format('YYYY-MM-DD');
  public selectedEndDate: string = Moment().endOf('month').format('YYYY-MM-DD');
  public dropdownSettings: any = {
    'singleSelection': false,
    'enableCheckAll': true,
    'text': 'Select or enter to search',
    'selectAllText': 'Select All',
    'unSelectAllText': 'UnSelect All',
    'enableSearchFilter': true
  };
  public showFilters: boolean = true;
  public locationDropdownSettings: any = {
    'enableCheckAll': false,
    'singleSelection': false,
    'text': 'Select or enter to search',
    'selectAllText': 'Select All',
    'unSelectAllText': 'UnSelect All',
    'enableSearchFilter': true,
  };
  public programDropdownSettings: any = {
    'enableCheckAll': true,
    'singleSelection': false,
    'text': 'Select or enter to search',
    'selectAllText': 'Select All',
    'unSelectAllText': 'UnSelect All',
    'enableSearchFilter': true,
    'badgeLimit': 5
  };
  public loadingFilters: boolean = true;
  public locations: any = [];
  public location: any = [];
  public selectedLocation: any = [];
  public locationSelectedCheck: boolean = false;

  @Output() public filterSelected: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private cd: ChangeDetectorRef,
    private _patientProgramService: PatientProgramResourceService,
    private _userDefaultPropertiesService: UserDefaultPropertiesService,
    private localStorageService: LocalStorageService,
    private departmentProgramService: DepartmentProgramsConfigService,
    private _locationResourceService: LocationResourceService) {

  }

  public ngOnInit() {
    this.loadConfigs().then((result) => {
      if (result) {
        this.loadingFilters = false;
      }
    });
  }

  public ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  public ngOnDestroy() {

  }

  public loadConfigs() {

    return new Promise((resolve, reject) => {

    this.getLocations();
    this.getDepartmentConfig();
    this.getProgramVisitsConfig();
    this.cd.detectChanges();
    resolve('success');

    });

  }

  public getDefaultLocation() {
    let location = this._userDefaultPropertiesService.getCurrentUserDefaultLocationObject();
    return location;
  }

  public setDefaultLocationFilter() {

    let defaultLocation: any = this.getDefaultLocation();
    this.location = [];
    let locationArray  = [];

    if (typeof defaultLocation !== 'undefined' ) {
       let defaultLocationFilterItem = {
         'id': defaultLocation.uuid,
         'itemName': defaultLocation.display
       };

       locationArray.push(defaultLocationFilterItem);

    }else {
        console.error('ERROR: Default Location Undefined');
    }

    this.location = locationArray;

    this.selectedLocation = locationArray;

    this.cd.detectChanges();

    // set location storage item to default location

    this.saveFilterItem(this.enrollmentLocationKey, locationArray);

  }

    // get current location

  public getLocations() {

    this._locationResourceService.getLocations()
    .subscribe((location) => {
        this.setLocations(location);
    });

  }

  public setLocations(locations) {

     let locationsArray: any = [];

     _.each(locations, (location: any) => {
          let specificLocation = {
            'id': location.uuid,
            'itemName': location.display
          };

          locationsArray.push(specificLocation);
     });
     this.locations = locationsArray;

  }

  public getDepartmentConfig() {

    this.departmentProgramService.getDartmentProgramsConfig()
      .subscribe((results) => {
        if (results) {
          this.departmenProgramtConfig = results;
          this.getAllDepartments();
        }
      });

  }

  public loadFilterItems() {
    return new Promise((resolve, reject) => {

        let isProgramSaved = this.isFilterItemSaved(this.programFilterKey);
        let isDepartmentSaved = this.isFilterItemSaved(this.departmentKey);
        let isDateSaved = this.isFilterItemSaved(this.enrollmentDateKey);
        let isLocationSaved = this.isFilterItemSaved(this.enrollmentLocationKey);

        // check if department is saved

        if (isDepartmentSaved === true) {
             this.department =  this.getSavedFilterItem(this.departmentKey);
        }

        // check if dates is saved

        if (isDateSaved === true) {
          let dateSavedObj: any =  this.getSavedFilterItem(this.enrollmentDateKey);
          this.selectedStartDate = dateSavedObj.startDate;
          this.selectedEndDate = dateSavedObj.endDate;
         }

        if (isProgramSaved === true) {
           let programSavedObj: any =  this.getSavedFilterItem(this.programFilterKey);
           this.selectedProgram = programSavedObj;
           this.program = programSavedObj;
        }
        if (isLocationSaved === true) {
           let locationSavedObj: any =  this.getSavedFilterItem(this.enrollmentLocationKey);
           this.selectedLocation = locationSavedObj;
           this.location = locationSavedObj;
        }

         // set current location

        this.setDefaultLocationFilter();

        resolve('success');

        });

  }

  public getProgramVisitsConfig() {
    this._patientProgramService.getAllProgramVisitConfigs()
      .subscribe((response) => {
        if (response) {
          this.programVisitsConfig = JSON.parse(JSON.stringify(response));
          this.getAllPrograms();
          this.loadFilterItems().then((result)  => {

              this.setParams();

          }).catch((error) => {
            console.error('ERROR: ', error);
          });
        }
      });
  }

  // get saved items

  public getSavedFilterItem(filterKey) {

    let savedFilterObj: any = JSON.parse(this.localStorageService.getItem(filterKey));

    return savedFilterObj;

  }

  public saveFilterItem(filterKey, filterItem) {

    this.localStorageService.setItem(filterKey, JSON.stringify(filterItem));

  }

  // remove program object

  public removeSavedFilterItem(filterKey) {

    this.localStorageService.remove(filterKey);

  }

  // check if filter item is saved

  public isFilterItemSaved(filterKey): boolean {

    let savedFilterObj: any = this.localStorageService.getItem(filterKey);

    if (savedFilterObj === null) {
           return false;
    }else {
       return true;
    }

  }

  public initializeParams() {

    this.selectedStartDate = Moment().startOf('month').format('YYYY-MM-DD');
    this.selectedEndDate  = Moment().endOf('month').format('YYYY-MM-DD');
    this.selectedProgramType = [];
    this.selectedProgramType = [];
    this.setDefaultLocationFilter();

  }

  public setParams() {

      let startDate = Moment(this.selectedStartDate).format('YYYY-MM-DD');
      let endDate = Moment(this.selectedEndDate).format('YYYY-MM-DD');
      let department = this.department;
      let programType = [];
      let programUuids = [];

      if ((this.department.length === 0 || this.department.length > 0)
        && this.program.length === 0) {
          // only department is selected
        _.each(this.programs, (program: any) => {
          programType.push(program);
          programUuids.push(program.id);
        });

      }else if (this.department.length > 0 && this.program.length > 0) {
          // only department is selected
        _.each(this.program, (program: any) => {
          programType.push(program);
          programUuids.push(program.id);
        });

      } else {
        _.each(this.program, (program: any) => {
          programType.push(program);
          programUuids.push(program.id);
        });

      }

      // get location ids
      let locations = [];
      let locationUuids = [];
      _.each(this.location, (locationItem: any) => {
          locationUuids.push(locationItem.id);
          locations.push(locationItem);
      });

      let savedFilterObj = {
        'startDate': startDate,
        'endDate': endDate,
        'locationUuid': locations,
        'programType':  programType,
        'department': department
      };

      this.params = {
        'startDate': startDate,
        'endDate': endDate,
        'locationUuid': locationUuids,
        'programType':  programUuids,
        'department': department

      };

      this.saveFilterParams(savedFilterObj);

      this.emitParams(this.params);
      this.filterSet = false;

  }

  // emit params to parent component

  public emitParams(params) {

    this.filterSelected.emit(params);

  }

  // save params

  public saveFilterParams(params: any) {

    // save program Type

    this.saveFilterItem(this.programFilterKey, params.programType);

    // save start and End Date

    let startEndDateObj = {
      'startDate': params.startDate,
      'endDate': params.endDate
    };

    this.saveFilterItem(this.enrollmentDateKey, startEndDateObj);

    // save department

    this.saveFilterItem(this.departmentKey, params.department);

    // save location

    this.saveFilterItem(this.enrollmentLocationKey, this.location);

  }

  public setFilter() {

    // only apply filter is all fields have been filled correctly
    this.filterSet = true;

    let isFilterOkay = this.validateFilterSelected();

    if (isFilterOkay === true) {

       this.setParams();

       this.filterSet = false;

    }

  }
  // make sure the required fields are selected
  public validateFilterSelected() {
        // check if location is selected
    if (this.location.length === 0) {

        this.locationSelectedCheck = true;

        return false;
    }else {

        this.locationSelectedCheck = false;

        if (this.selectedStartDate === null) {

           this.selectedStartDate = Moment().startOf('month').format('YYYY-MM-DD');

        }
        if (this.selectedEndDate === null) {

          this.selectedEndDate = Moment().endOf('month').format('YYYY-MM-DD');

        }

        return true;

    }

  }
  public collapseFilters() {
    this.showFilters = false;
  }
  public expandFilters() {
    this.showFilters = true;
  }
  public getSelectedStartDate($event) {
    this.selectedStartDate = $event;
    this.filterSet = false;
  }
  public getSelectedEndDate($event) {
    this.selectedEndDate = $event;
    this.filterSet = false;
  }

  public selectDepartment(department) {

    this.filterSet = false;
    let departmentsSelected = this.department;
    this.programs = [];
    this.trackPrograms = [];

    _.each(departmentsSelected, (departmentSelected: any) => {
      this.getPrograms(departmentSelected);
    });

    this.cd.detectChanges();

  }
  public onSelectAllDepartments($event) {
    this.filterSet = false;
    this.selectDepartment($event);
  }
  public onDeSelectAllDepartment($event) {
    this.filterSet = false;
  }
  public programDeSelect($event) {
    this.filterSet = false;

  }
  public selectLocation($event) {
    this.filterSet = false;
    this.selectedLocation = this.location[0];

  }
  public locationDeselect($event) {
    this.filterSet = false;

  }
  public onSelectAllLocations($event) {
    this.filterSet = false;
  }
  public onDeSelectAllLocations($event) {
    this.filterSet = false;
  }
  public selectProgram($event) {
    this.filterSet = false;
  }
  public resetFilter() {
    this.initializeParams();
    this.department = [];
    this.program = [];
    let locations = [];
    // get location ids
    _.each(this.location, (locationItem: any) => {
        locations.push(locationItem.id);
    });
    this.params = {
      'startDate': this.selectedStartDate,
      'endDate': this.selectedEndDate,
      'locationUuid': locations,
      'programType': [],
      'department': []
    };

    this.saveFilterParams(this.params);

    this.emitParams(this.params);

    this.filterSet = false;

  }

  /*
  Loads all the filters with all inputs
  */

  public loadAllFilters() {
    this.department = this.departments;
    this.selectDepartment(this.departments);
    let selectedProgram = this.program;

    // strip property names and remain with array of uuids

    let programArray = [];

    _.each(selectedProgram, (program: any) => {
      programArray.push(program.id);
    });

    this.selectedProgramType = programArray;

    this.cd.detectChanges();
  }

    /*
   on deselecting a department remove its associated programs,
   visit types and encounter types
  */

  public departmentDeselect($event) {

    let departmentUuid = $event.id;
    let departmentPrograms = [];

    // get all the programs under the department

    _.each(this.departmenProgramtConfig, (department: any, index) => {
      if (index === departmentUuid) {
        _.each(department.programs, (deptProgram: any) => {
          departmentPrograms.push(deptProgram.uuid);
        });
      }
    });

    this.removeProgramTypes(departmentPrograms);

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

  // load all programs

  public getAllPrograms() {

    this.programs = [];

    let allPrograms = [];

    let programsVisitsConf = this.programVisitsConfig;

    _.each(programsVisitsConf, (program: any, index) => {

      let specificProgram = {
        'id': index,
        'itemName': program.name
      };

      allPrograms.push(specificProgram);

    });

    this.programs = allPrograms;

  }

  // get all the departments

  public getAllDepartments() {

    let departments = this.departmenProgramtConfig;

    _.each(departments, (department: any, index) => {

      let specificDepartment = {
        'itemName': department.name,
        'id': index
      };

      this.departments.push(specificDepartment);

    });

    this.cd.detectChanges();

  }

  public getPrograms(departmentSelected) {

    let departments = this.departmenProgramtConfig;
    let programs = this.programVisitsConfig;
    let programsArray = [];

    _.each(departments, (department: any, index) => {

      if (index === departmentSelected.id) {

        let deptPrograms = department.programs;

        _.each(deptPrograms, (program: any) => {

          let specificProgram = {
            'id': program.uuid,
            'itemName': program.name
          };

          if (_.includes(this.trackPrograms, program.uuid) === false) {
            this.programs.push(specificProgram);
            this.trackPrograms.push(program.uuid);

          } else {
          }

        });

      }

    });
  }

  public loadProgramFromPrograms() {

    this.program = [];
    this.selectedProgramType = [];

    _.each(this.programs, (program: any, index) => {
      let specificProgram = {
        'itemName': program.itemName,
        'id': program.id
      };
      this.program.push(specificProgram);
    });

    this.cd.detectChanges();
  }

}
