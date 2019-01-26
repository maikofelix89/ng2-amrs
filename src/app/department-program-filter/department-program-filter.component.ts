import { take } from 'rxjs/operators';
import {
  Component, OnInit, OnDestroy, AfterViewInit, Output,
  EventEmitter, Input, ChangeDetectorRef
} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as _ from 'lodash';
import * as Moment from 'moment';
import { DepartmentProgramsConfigService } from './../etl-api/department-programs-config.service';
import { LocationResourceService } from './../openmrs-api/location-resource.service';
import { SelectDepartmentService } from '../program-visit-encounter-search/program-visit-encounter-search.service';

@Component({
  selector: 'department-program-filter',
  templateUrl: './department-program-filter.component.html',
  styleUrls: ['./department-program-filter.component.css']
})

export class DepartmentProgramFilterComponent implements OnInit, OnDestroy, AfterViewInit {

  public selectedProgram: string;
  public programs: Array<any> = [];
  public programVisitsConfig: any[];
  public selectedProgramType: any = [];
  public program: any = [];
  public programMap = new Map();
  public countyMap = new Map();
  public filterSet = false;
  public showSelectedPrograms = true;
  public trackPrograms: any = [];
  public selectedStartDate: string = Moment().startOf('month').format('YYYY-MM-DD');
  public selectedEndDate: string = Moment().endOf('month').format('YYYY-MM-DD');
  public params: any = {
    'startDate': this.selectedStartDate,
    'endDate': this.selectedEndDate,
    'locationUuids': [],
    'programType': []
  };
  public dropdownSettings: any = {
    'singleSelection': false,
    'enableCheckAll': true,
    'text': 'Select or enter to search',
    'selectAllText': 'Select All',
    'unSelectAllText': 'UnSelect All',
    'enableSearchFilter': true
  };
  public showFilters = true;
  public locationDropdownSettings: any = {
    'enableCheckAll': false,
    'singleSelection': false,
    'text': 'Select or enter to search',
    'selectAllText': 'Select All',
    'unSelectAllText': 'UnSelect All',
    'enableSearchFilter': true,
  };
  public programDropdownSettings: any = {
    'singleSelection': false,
    'enableCheckAll': true,
    'text': 'Select or enter to search',
    'selectAllText': 'Select All',
    'unSelectAllText': 'UnSelect All',
    'enableSearchFilter': true,
    'badgeShowLimit': 10
  };
  public countyDropdownSettings: any = {
    'enableCheckAll': false,
    'singleSelection': true,
    'text': 'Select or enter to search',
    'selectAllText': 'Select All',
    'unSelectAllText': 'UnSelect All',
    'enableSearchFilter': true,

  };
  public loadingFilters = true;
  public locations: any = [];
  public location: any = [];
  public multipleLocationsSelected = false;
  public locationMap = new Map();
  public county: any = [];
  public counties: any = [];
  public selectedLocation: any = [];
  public selectedFiltersOkay = true;
  public errorMsg: any = {
    'status': false,
    'message': ''
  };
  public currentDepartment = '';
  public departmentPrograms: any;
  public showLocationFilters = true;

  @Output() public filterSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() public filterReset: EventEmitter<boolean> = new EventEmitter<any>();

  constructor(
    private cd: ChangeDetectorRef,
    private departmentProgramService: DepartmentProgramsConfigService,
    private _locationResourceService: LocationResourceService,
    private selectDepartmentService: SelectDepartmentService,
    private route: ActivatedRoute,
    private router: Router) {

  }

  public ngOnInit() {
    this.loadConfigs().then((result) => {
      if (result) {
        this.loadingFilters = false;
      }
    });
    this.route
      .queryParams
      .subscribe((params) => {
        if (params) {
          setTimeout(() => {
            this.loadFilterFromUrlParams(params);
          }, 500);
        }
      }, (error) => {
        console.error('Error', error);
      });
  }

  public ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  public ngOnDestroy() {

  }
  public loadFilterFromUrlParams(params) {

    const newParams: any = {
      'endDate': '',
      'locationUuids': [],
      'programType': []
    };
    // only load if filter has been set i.e send date is in url

    if (params.endDate) {

        this.selectedEndDate = params.endDate;
        newParams.endDate = this.params.endDate;

        if (params.locationUuids) {
          this.location = [];
          const locations = this.loadFilterFromMap(params.locationUuids, this.locationMap);
          this.location = locations;
          newParams.locationUuids = params.locationUuids;
        } else {
          newParams.locationUuids = [];
        }
        if (params.programType) {
          this.program = [];
          const programTypes = this.loadFilterFromMap(params.programType, this.programMap);
          if (this.showSelectedPrograms) {
            this.program = programTypes;
          }
          newParams.programType = params.programType;

        } else {
          newParams.programType = [];
        }

    this.emitParams(newParams);
  }

  }

  public isString(value) {
    if (typeof value === 'string') {
      return true;
    } else {
      return false;
    }
  }

  public loadFilterFromMap(values: any, map) {
    const filterArray = [];
    if (this.isString(values)) {
      const selectedType = map.get(values);
      filterArray.push(selectedType);
    } else {
      for (const value of values) {
        const selectedType = map.get(value);
        filterArray.push(selectedType);
      }

    }
    return filterArray;

  }

  public loadConfigs() {
    return new Promise((resolve, reject) => {
      this.getCurrentDepartment();
      this.getLocations();
      this.cd.detectChanges();
      resolve('success');

    });

  }
  // get current location

  public getCurrentDepartment() {

    this.selectDepartmentService.getDepartment().subscribe((d) => {
      this.currentDepartment = d;
      console.log('getCurrentDepartment', d);
      this.getDepartmentPrograms(d);
    });

  }

  public getDepartmentPrograms(department) {

    this.departmentProgramService.getDepartmentPrograms(department).pipe(
      take(1))
      .subscribe((result) => {
          this.departmentPrograms = result;
          this.loadProgramFilter(result);
      });

  }

  public loadProgramFilter(departmentPrograms) {
    const programsArray = [];
    _.each(departmentPrograms, (program: any) => {
      const programUuid = program.uuid;
      const programName = program.name;
      const programObj = {
         'id': programUuid,
         'itemName': programName
      };
      programsArray.push(programObj);
      this.programMap.set(programUuid, programObj);
    });

    this.programs = programsArray;
}

  public getLocations() {
    this._locationResourceService.getLocations().pipe(
      take(1)).subscribe((location) => {
        this.setLocations(location);
      });
  }

  public setLocations(locations) {
    const locationsArray: any = [];
    const countiesArray: any = [];
    const trackCounty: any = [];
    let countyNo = 1;
    _.each(locations, (location: any) => {
      const specificCountyObj: any = { 'id': countyNo, 'itemName': location.stateProvince };
      const specificLocation: any = { 'id': location.uuid, 'itemName': location.display };
      if (location.stateProvince !== '') {
        this.locationMap.set(location.uuid, specificLocation);
        this.setCounties(specificCountyObj.itemName, specificLocation);
        locationsArray.push(specificLocation);
        if (_.includes(trackCounty, specificCountyObj.itemName) === false) {
          countiesArray.push(specificCountyObj);
          trackCounty.push(specificCountyObj.itemName);
        }
        countyNo++;

      }
    });
    this.locations = locationsArray;
    this.counties = _.uniq(countiesArray);
  }

  public setCounties(county, location) {
    const countySavedObj: any = this.countyMap.get(county);
    if (typeof countySavedObj === 'undefined') {
      const countyLocations = [];
      countyLocations.push(location);
      this.countyMap.set(county, countyLocations);
    } else {
      const countyLocations = countySavedObj;
      countyLocations.push(location);
      this.countyMap.set(county, countyLocations);
    }

  }


  public initializeParams() {
    this.selectedEndDate = Moment().endOf('month').format('YYYY-MM-DD');
    this.selectedProgramType = [];
    this.selectedProgramType = [];
    this.params = {
      'endDate': this.selectedEndDate,
      'locationUuids': [],
      'programType': []
    };

  }

  public setParams() {

    const endDate = Moment(this.selectedEndDate).format('YYYY-MM-DD');
    const programUuids = [];
    const departmentUuid = [];

    _.each(this.program, (program: any) => {
      programUuids.push(program.id);
    });
    // get location ids
    const locationUuids = [];
    _.each(this.location, (locationItem: any) => {
      locationUuids.push(locationItem.id);
    });

    this.params = {
      'endDate': endDate,
      'locationUuids': locationUuids,
      'programType': programUuids

    };
    this.passParamsToUrl(this.params);

  }

  public passParamsToUrl(params) {

    const currentParams = this.route.snapshot.queryParams;
    const navigationData = {
      queryParams: params,
      replaceUrl: true
    };

    const currentUrl = this.router.url;
    const routeUrl = currentUrl.split('?')[0];
    this.router.navigate([routeUrl], navigationData);
    this.filterSet = false;

  }
  public emitParams(params) {
    this.filterSelected.emit(params);

  }
  public setFilter() {
    this.filterSet = true;
    this.setParams();
    this.filterSet = false;
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

  public programDeSelect($event) {
    this.filterSet = false;

  }
  public selectCounty($event) {
    this.filterSet = false;
    this.multipleLocationsSelected = true;
    this.loadLocationsFromCounty($event.itemName);
  }
  public loadLocationsFromCounty(county) {
    const countyLocations = this.countyMap.get(county);
    this.location = [];
    _.each(countyLocations, (countyLocation) => {
      this.location.push(countyLocation);
    });
  }
  public countyDeselect($event) {
    this.removeCountyLocations($event.itemName);
    this.multipleLocationsSelected = false;

  }
  public removeCountyLocations(county) {

    const countyLocations = (this.countyMap.get(county)).reverse();
    _.each(countyLocations, (countyLocation: any) => {
      const locationId = countyLocation.id;
      _.each(this.location, (location: any, index) => {
        const selectedLocationId = location.id;
        if (selectedLocationId === locationId) {

          this.location.splice(index, 1);
        }

      });
    });

  }
  public selectLocation($event) {
    this.filterSet = false;
    this.multipleLocationsSelected = true;
    this.county = [];

  }
  public locationDeselect($event) {
    this.filterSet = false;
    if (this.location.length === 0) {
      this.multipleLocationsSelected = false;
    }

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
    this.program = [];
    this.county = [];
    this.location = [];
    this.filterReset.emit(true);
    this.filterSet = false;

  }
  public resetLocationSelected() {
    this.multipleLocationsSelected = false;
    this.location = [];
  }
  public selectAllLocations() {
    this.multipleLocationsSelected = true;
    this.location = [];
  }


}
