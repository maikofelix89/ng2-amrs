import { Component, OnInit , OnDestroy , AfterViewInit, OnChanges , Output ,
  EventEmitter, Input , ChangeDetectorRef, ViewChild , SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute, Router, Params } from '@angular/router';
import * as _ from 'lodash';
import * as Moment from 'moment';
import { LocationResourceService } from
'../../openmrs-api/location-resource.service';
import { ProviderResourceService } from '../../openmrs-api/provider-resource.service';
import { UserService } from '../../openmrs-api/user.service';
import { EncounterResourceService } from '../../openmrs-api/encounter-resource.service';
import { FormsResourceService } from '../../openmrs-api/forms-resource.service';
import { FormListService } from '../../patient-dashboard/common/forms/form-list.service';
import { DataEntryStatisticsService } from
'../../etl-api/data-entry-statistics-resource.service';

@Component({
  selector: 'data-entry-statistics-filters',
  templateUrl: './data-entry-statistics-filters.component.html',
  styleUrls: ['./data-entry-statistics-filters.component.css']
})
export class DataEntryStatisticsFiltersComponent
  implements OnInit , OnDestroy , AfterViewInit {

  @Output() public filterParams: any = new EventEmitter<string>();
  @Output() public viewSelected: any = new EventEmitter<string>();
  @Output() public filterReset: any = new EventEmitter<boolean>();
  public params: any  = [];
  public gridOptions: any = {
    enableColResize: true,
    enableSorting: true,
    enableFilter: true,
    showToolPanel: false,
    pagination: true,
    paginationPageSize: 300
  };
  public views: any = [];
  public view: any = [];
  public showFilters: boolean = true;
  public locations: any  = [];
  public location: any = [];
  public filtersCount: number = 0;
  public locationMap = new Map();
  public creators: any [];
  public creator: any = [];
  public encounterType: any = [];
  public encounterTypes: any = [];
  public encounterMap = new Map();
  public form: any = [];
  public forms: any = [];
  public formMap = new Map();
  public allForms = [];
  public providers: any  = [];
  public provider: string = '';
  public selectedStartDate: any = Moment().format();
  public selectedEndDate: any =  Moment(this.selectedStartDate).add(6, 'days' ).format();
  public subType: string = 'by-date-by-encounter-type';
  public groupBy: any = ['groupByDate', 'groupByEncounterTypeId'];
  public selectedLocation: any = [];
  public multipleLocationsSelected: boolean = false;
  public multipleEncountersSelected: boolean = false;
  public multipleFormsSelected: boolean = false;
  public multipleCreatorsSelected: boolean = false;
  public selectedFormUuid: any = [];
  public selectedCreatorUuid: any = [];
  public selectedProviderUuid: string = '';
  public selectedEncounterTypes: any = [];
  public selectedView = {
    encounterTypePerDay: false,
    encounterTypePerMonth: false,
    encounterTypePerProvider: false,
    encounterTypePerCreator: false
  };
  public selectedViewType: string = '';
  public viewMap = new Map();
  public locationDropdownSettings: any = {
    'singleSelection': false,
    'text': 'Select or enter to search',
    'selectAllText': 'Select All',
    'unSelectAllText': 'UnSelect All',
    'enableSearchFilter': true,
    'enableCheckAll': false
  };
  public statsDropdownSettings: any = {
    singleSelection: true,
    text: 'Select or enter to search',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableSearchFilter: true
  };
  public singleSelectDropDownSettings: any = {
    singleSelection: true,
    text: 'Select or enter to search',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableSearchFilter: true,
    enableCheckAll : false
  };

  public multpleSelectDropDownSettings: any = {
    singleSelection: false,
    text: 'Select or enter to search',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableSearchFilter: true,
    enableCheckAll : false
  };

  public dropdownSettings: any = {
    'singleSelection': false,
    'text': 'Select or enter to search',
    'selectAllText': 'Select All',
    'unSelectAllText': 'UnSelect All',
    'enableSearchFilter': true,
    'enableCheckAll': true
  };

  public displayMsg: any = { 'show': false, 'message': '' };
  public selectedStartMonth = Moment().format('YYYY-MM');
  public dataEntryCreatorColdef: any = [];
  public creatorStats: any = [];
  public creatorRowData: any[];
  public filterCount: number  = 0;

  constructor(
    private _cd: ChangeDetectorRef,
    private _locationResourceService: LocationResourceService,
    private _providerResourceService: ProviderResourceService,
    private _userService: UserService,
    private _encounterResourceService: EncounterResourceService,
    private _formListService: FormListService,
    private route: ActivatedRoute,
    private router: Router,
    private _dataEntryStatisticsService: DataEntryStatisticsService,
  ) {}

  public ngOnInit() {
    this.loadFilters();
    this.viewSelected.emit(this.selectedView);
    this.route
    .queryParams
    .subscribe((params) => {
      if (params) {
           console.log('Load from params', params);
           this.params = params;
           setTimeout(() => {
            this.loadFilterFromUrlParams(params);
           }, 2000);
         }
     }, (error) => {
        console.error('Error', error);
     });
  }

  public ngOnDestroy() {}

  public ngAfterViewInit(): void {
    this._cd.detectChanges();
  }

  public loadFilters() {
    this.getLocations();
    this.getDataEntryEncounterTypes();
    this.getEncounterTypes();
    this.getForms();

  }

  public loadFilterFromUrlParams(params) {

    if (params.startDate ) {

              let newParams: any = {
                'view': '',
                'locationUuids': [],
                'startDate': '',
                'endDate': '',
                'encounterTypeUuids': [],
                'formUuids': [],
                'groupBy': []
              };

              if (params.view) {
                    this.view = [];
                    let views = this.loadFilterFromMap(params.view, this.viewMap);
                    console.log('View Map', this.viewMap);
                    console.log('View Type', views );
                    this.view = views;
                    newParams.view = params.view;
                    this.toggleSelectedView(params.view);
              }
              if (params.locationUuids) {
                  this.location = [];
                  let locations = this.loadFilterFromMap(params.locationUuids, this.locationMap);
                  this.location = locations;
                  newParams.locationUuids = params.locationUuids;
                  console.log('Location', this.location);
              }
              if (params.startDate) {
                  this.selectedStartDate = params.startDate;
                  console.log('Start Date', this.selectedStartDate);
                  newParams.startDate = params.startDate;
                }
              if (params.endDate) {
                  this.selectedEndDate = params.endDate;
                  newParams.endDate = params.endDate;
                  console.log('End Date', this.selectedEndDate);
              }
              if (params.encounterTypeUuids) {
                  this.encounterType = [];
                  let encounterTypes =
                  this.loadFilterFromMap(params.encounterTypeUuids, this.encounterMap);
                  this.encounterType = encounterTypes;
                  newParams.encounterTypeUuids = params.encounterTypeUuids;
                  console.log('EncounterType', this.encounterType);

              }
              if (params.formUuids) {
                  this.form = [];
                  let formTypes = this.loadFilterFromMap(params.formUuids, this.formMap);
                  this.form = formTypes;
                  newParams.formUuids = params.formUuids;
                  console.log('FormType', this.form);
              }
              if (params.groupBy) {
                  console.log('Group By : getDataEntryStatisticsQueryParam', params);
                  newParams.groupBy = params.groupBy;
              }
              if (params.subType) {
                console.log('Group By : getDataEntryStatisticsQueryParam', params);
                newParams.subType = params.subType;
               }

              this.filterParams.emit(newParams);
        }

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

    console.log('FilterArray', filterArray);

    return filterArray;

  }

  public getDataEntryEncounterTypes() {
    this._dataEntryStatisticsService
      .getDataEntryStatisticsTypes()
      .subscribe((result) => {
        if (result) {
          let viewTypes = result;
          this.processViewTypes(viewTypes);
        }
      });
  }

  public getLocations() {
    this._locationResourceService.getLocations()
    .subscribe((result) => {
         let locations = result;
         this.processLocations(locations);
    });

  }

  public getForms() {
    this._formListService.getFormList()
    .subscribe((results) => {
        if (results) {
          this.processForms(results);
          this.allForms = results;
        }
    });
  }

  public processForms(forms) {
    let formsArray = [];
    _.each(forms, (form: any) => {
      let specificForm = { id: form.uuid, itemName: form.name };
      this.formMap.set(form.uuid, specificForm);
      formsArray.push(specificForm);
    });

    this.forms = formsArray;

  }

  public formSelect($event) {
    this.loadSelectedFormUuid();
    this.multipleFormsSelected = true;
  }
  public selectAllForms() {
    this.multipleFormsSelected = true;
  }
  public resetForms() {
    this.form = [];
    this.multipleFormsSelected = false;
  }
  public formDeselect($event) {
      this.loadSelectedFormUuid();
      if (this.form.length === 0) {
        this.multipleFormsSelected = false;
      }
  }

  public creatorSelect($event) {
    console.log('Creator Selected', $event);
    this.loadSelectedCreator();
  }

  public creatorDeselect($event) {
    this.loadSelectedCreator();
    if (this.creator.length === 0) {
       this.multipleCreatorsSelected = false;

    }
  }

  public loadSelectedCreator() {

    let creatorArray = [];
    this.selectedCreatorUuid = [];
    console.log('Creator', this.creator);
    _.each(this.creator, (creator: any) => {
          creatorArray.push(creator.id);
    });

    this.selectedCreatorUuid = creatorArray;

  }

  public processViewTypes(viewTypes) {
    let viewsArray = [];

    _.each(viewTypes, (view: any) => {
      let specificView = { id: view.id, itemName: view.subType };
      this.viewMap.set(view.id, specificView);
      viewsArray.push(specificView);
    });
    this.views = viewsArray;
  }

  public processLocations(locations) {

    let locationArray = [];
    _.each(locations, (location: any) => {
      let specificLocation = { id: location.uuid, itemName: location.display };
      this.locationMap.set(location.uuid, specificLocation);
      locationArray.push(specificLocation);
    });

    this.locations = locationArray;
    console.log('LOcation Map2', this.locationMap);

  }

  public selectView($event: any) {
    this.resetViews();
    console.log('Select View', $event);
    let view = $event.id;
    this.selectedViewType = view;
    this.toggleViewParams(view);
  }

  public locationSelect($event) {
    this.loadSelectedLocation();
    this.multipleLocationsSelected = true;
  }
  public resetLocations() {
    this.multipleLocationsSelected = false;
    this.location = [];
  }
  public selectAllLocations() {
    this.multipleLocationsSelected = true;
    this.location = [];

  }
  public locationDeselect($event) {
    this.loadSelectedLocation();
    if (this.location.length === 0) {
      this.multipleLocationsSelected = false;
     }
  }
  public loadSelectedLocation() {
       let locationsArray = this.location;
       this.selectedLocation = [];
       _.each(locationsArray, (locationItem: any) => {
           this.selectedLocation.push(locationItem.id);
       });
  }

  public loadSelectedFormUuid() {
       let formsArray = this.form;
       this.selectedFormUuid = [];
       _.each(formsArray, (formItem: any) => {
           this.selectedFormUuid.push(formItem.id);
       });
  }

  public getEncounterTypes() {
    let encounters = this._encounterResourceService.getEncounterTypes('all')
    .subscribe((results) => {
      if (results) {
            this.processEncounterTypes(results);
      }
    });
  }

  public processEncounterTypes(encounterTypes) {

    let encounterTypesArray = [];

    _.each(encounterTypes, (encounterType: any) => {
         let specificEncounterType = {
             'id': encounterType.uuid,
             'itemName': encounterType.display
         };
         this.encounterMap.set(encounterType.uuid, specificEncounterType);
         encounterTypesArray.push(specificEncounterType);
    });

    this.encounterTypes = encounterTypesArray;

  }

  public encounterTypeSelect($event) {
     this.multipleEncountersSelected = true;
     this.loadSelectedEncounterType();
  }
  public selectAllEncounterTypes() {
    this.multipleEncountersSelected = true;
    this.encounterType = [];
  }
  public resetEncounterTypes() {
    this.multipleEncountersSelected = false;
    this.encounterType = [];
  }
  public selectAllCreators() {
    this.creator = [];
    this.multipleCreatorsSelected = true;
  }
  public resetCreators() {
    this.creator = [];
    this.multipleCreatorsSelected = false;
  }

  public encounterTypeDeselect($event) {
     this.loadSelectedEncounterType();
     if (this.encounterType.length === 0) {
          this.multipleEncountersSelected = false;
     }
  }

  public loadSelectedEncounterType() {
       this.selectedEncounterTypes = [];
       _.each(this.encounterType, (encounter: any) => {
            this.selectedEncounterTypes.push(encounter.id);
       });
  }

  public getSelectedStartDate($event) {
      let selectedDate = $event;
      this.selectedEndDate = Moment(selectedDate).add(6, 'days' ).toISOString();
      this.selectedStartDate = Moment(selectedDate).toISOString();
  }
  public getSelectedEndDate($event) {
      let selectedDate = $event;
      this.selectedEndDate = Moment(selectedDate).toISOString();
  }
  public getSelectedStartMonth($event) {

    let selectedDate = Moment($event).format('YYYY-MM-DD');
    this.selectedStartDate = Moment(selectedDate).startOf('month').toISOString();
    this.selectedEndDate = Moment(this.selectedStartDate).add(12, 'months' ).toISOString();
  }

  public resetViews() {
    this.selectedView = {
      encounterTypePerDay: false,
      encounterTypePerMonth: false,
      encounterTypePerProvider: false,
      encounterTypePerCreator: false
    };
  }

  public toggleViewParams(view) {
    this.resetFilter();
    this.toggleSelectedView(view);
    switch (view) {
      case 'view1':
        this.selectedStartDate = Moment().format();
        this.selectedEndDate = Moment(this.selectedStartDate).add(6, 'days' ).format();
        this.subType = 'by-date-by-encounter-type';
        this.groupBy = ['groupByDate', 'groupByEncounterTypeId'];
        break;
      case 'view2':
        this.selectedStartDate = Moment().startOf('month').toISOString();
        this.selectedEndDate = Moment(this.selectedStartDate).add(12, 'months' ).format();
        this.subType = 'by-month-by-encounter-type';
        this.groupBy = ['groupByMonth', 'groupByEncounterTypeId'];
        break;
      case 'view3':
        this.subType = 'by-provider-by-encounter-type';
        this.groupBy = ['groupByProviderId', 'groupByEncounterTypeId'];
        break;
      case 'view4':
        this.subType = 'by-creator-by-encounter-type';
        this.groupBy = ['groupByCreatorId', 'groupByEncounterTypeId'];
        break;
      default:
    }

  }

  public toggleSelectedView(view) {

    this.resetViews();
    console.log('Toggle Selected Views', view);

    switch (view) {
      case 'view1':
        this.selectedView.encounterTypePerDay = true;
        console.log('Toggle View 1', this.selectedView);
        break;
      case 'view2':
        console.log('Toggle View 3');
        this.selectedView.encounterTypePerMonth = true;
        break;
      case 'view3':
        console.log('Toggle View 3');
        this.selectedView.encounterTypePerProvider = true;
        break;
      case 'view4':
        console.log('Toggle View 4');
        this.selectedView.encounterTypePerCreator = true;
        break;
      default:
    }

    this.viewSelected.emit(this.selectedView);

  }

  public viewDeselect($event) {
  }

  public searchProvider(providerSearchTerm) {
     if (providerSearchTerm.length > 3) {
     this._providerResourceService
       .searchProvider(providerSearchTerm)
       .subscribe((results) => {
         if (results) {
            this.processProviders(results);
         }
       });

      }
     if (providerSearchTerm.length === 0 ) {
          this.selectedProviderUuid = '';
      }

  }

  public processProviders(providers) {

      let providersArray = [];

      _.each(providers, (provider: any) => {
         let providerPerson = provider.person;
         if (providerPerson !== null) {
           let specificProvider = {
               'name': provider.display,
               'uuid': provider.uuid
           };

           providersArray.push(specificProvider);

          }
      });

      this.providers = providersArray;

  }

  public selectProvider(provider) {
    this.provider = provider.name;
    this.selectedProviderUuid = provider.uuid;
    this.providers = [];
  }

  public searchCreator(creatorSearchTerm) {
    this._userService
      .searchUsers(creatorSearchTerm)
      .subscribe((results) => {
        if (results) {
           this.processCreators(results);
        }
      });

  }


  public processCreators(creators) {

    let creatorsArray = [];

    _.each(creators, (creator: any) => {
       let providerPerson = creator.person;
       if (providerPerson !== null) {
         let specificCreator = {
             'itemName': creator.person.display,
             'id': creator.uuid
         };

         creatorsArray.push(specificCreator);

        }
    });

    this.creators = creatorsArray;

}

public search() {

   let filterOkay = this.passedValidation();
   if (filterOkay === true) {
    this.setQueryParams();
    // this.filterParams.emit(this.params);
   }

}

public passedValidation() {

  let subType = this.subType;
  let creator = this.creator;
  this.resetDisplayMsg();

  if (subType === 'by-creator-by-encounter-type') {

      // one must select at least one creator
      if (this.creator.length === 0) {

          this.displayMsg = {
            'show': true,
            'message': 'Please select at least one creator'
          };

          return false;

      }else {
         return true;
      }

   }else {

      return true;
   }

}

public resetDisplayMsg() {

  this.displayMsg = { 'show': false , 'message': ''};

}

public setQueryParams() {

    this.params = {
      'groupBy': this.groupBy,
      'locationUuids': this.selectedLocation,
      'formUuids': this.selectedFormUuid,
      'creatorUuid': this.selectedCreatorUuid,
      'providerUuid': this.selectedProviderUuid,
      'encounterTypeUuids': this.selectedEncounterTypes,
      'startDate': Moment(this.selectedStartDate).format(),
      'endDate': Moment(this.selectedEndDate).format(),
      'subType': this.subType,
      'view': this.selectedViewType
    };

    const currentParams = this.route.snapshot.queryParams;
    let navigationData = {
        queryParams: this.params,
        replaceUrl: true
    };

    let currentUrl = this.router.url;
    let routeUrl = currentUrl.split('?')[0];
    this.router.navigate([routeUrl], navigationData);

}

public hideFilter() {
  this.showFilters = false;
}

public showFilter() {
  this.showFilters = true;
}

public previousWeek() {
  this.selectedStartDate = Moment(this.selectedStartDate).subtract(7, 'days' ).format();
  this.selectedEndDate = Moment(this.selectedStartDate).add(6, 'days' ).format();
  this.search();
}

public nextWeek() {
  this.selectedStartDate = Moment(this.selectedStartDate).add(7, 'days' ).format();
  this.selectedEndDate = Moment(this.selectedStartDate).add(6, 'days' ).format();
  this.search();
}

public previousYear() {
   this.selectedStartDate = Moment(this.selectedStartDate).subtract(12, 'months' ).format();
   this.selectedEndDate = Moment(this.selectedStartDate).add(11, 'months' ).format();
   this.search();
}
public nextYear() {
  this.selectedStartDate = Moment(this.selectedStartDate).add(12, 'months' ).format();
  this.selectedEndDate = Moment(this.selectedStartDate).add(11, 'months' ).format();
  this.search();
}

public resetFilter() {
  this.form = [];
  this.location = [];
  this.encounterType = [];
  this.creator = [];
  this.provider = '';
  this.selectedFormUuid = [];
  this.selectedLocation = [];
  this.selectedCreatorUuid = [];
  this.selectedEncounterTypes = [];
  this.selectedProviderUuid = '';
}

public resetAll() {
 this.resetFilter();
 this.filterReset.emit(true);

}

}
