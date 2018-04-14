import { Component,
    OnInit , OnDestroy , AfterViewInit, OnChanges ,
    Output , EventEmitter, Input , ChangeDetectorRef,
    ViewChild , SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';
import * as Moment from 'moment';

@Component({
  selector: 'data-entry-statistics-encounters',
  templateUrl: './data-entry-statistics-encounters.component.html',
  styleUrls: ['./data-entry-statistics-encounters.component.css']
})
export class DataEntryStatisticsEncountersComponent implements OnInit , OnChanges , AfterViewInit {

  public title: string = 'Encounters';

  public gridOptions: any = {
    enableColResize: true,
    enableSorting: true,
    enableFilter: true,
    showToolPanel: false,
    pagination: true,
    paginationPageSize: 300,
    onGridSizeChanged : () => {
      console.log('Gridsize changed');
      this.gridOptions.api.sizeColumnsToFit();
    },
    onGridReady: () => {
      setTimeout( () => {
        this.gridOptions.api.sizeColumnsToFit();
        console.log('Grid Ready');
      }, 500);
    }
  };

  @Input() public dataEntryEncounterData: any = [];
  @Input() public params: any;
  @Output() public patientListParams: EventEmitter<any> = new EventEmitter();
  public dataEntryEncounters: any = [];

  public dataEntryEncounterColdef: any = [];

  constructor(
    private _cd: ChangeDetectorRef
  ) {}

  public ngOnInit() {
    console.log('Loading Encounter List...');
  }
  public ngAfterViewInit(): void {
    this._cd.detectChanges();
  }

  public ngOnChanges(changes: SimpleChanges) {
       // changes.prop contains the old and the new value...
       console.log('On Changes', changes);
       if (changes.dataEntryEncounterData
        && this.dataEntryEncounterData.length > 0) {
          this.processEncounterData(this.params);
       } else {
         this.dataEntryEncounters = [];
       }
  }

  public processEncounterData(params: any) {

     console.log('Encounterlist params', params);

     let viewType = params.subType;

     switch (viewType) {

      case 'by-date-by-encounter-type':
        this.processEncounterListData();
        break;
      case 'by-month-by-encounter-type':
        this.procesMonthlyData();
        break;
      case 'by-provider-by-encounter-type':
        this.processProviderData();
        break;
      case 'by-creator-by-encounter-type':
        this.processCreatorData();
        break;
      default:

     }

  }

  // process encounter list data

  public processEncounterListData() {

    let dataEntryArray = [];
    let columnArray = [];
    let trackColumns = [];
    let dataEntryEncounters = this.dataEntryEncounterData;
    let encounterMap = new Map();

    console.log('processEncounterListData params', this.params);

    this.dataEntryEncounterColdef = [];

    this.dataEntryEncounterColdef.push(
      {
        headerName: 'Encounter Types',
        field: 'encounterType'
      }
    );

    _.each(dataEntryEncounters, (stat: any) => {

        // load the other columns based on date
        let encounterDate = Moment(stat.date).format('DD-MM-YYYY');
        let startDate = Moment(stat.date).toISOString();
        let encounterId = stat.encounter_type_id;

        if (_.includes(trackColumns, encounterDate) === false) {

              this.dataEntryEncounterColdef.push(
                {
                  headerName: encounterDate,
                  field: encounterDate,
                  onCellClicked: (column) => {
                    let patientListParams = {
                       'startDate': Moment(stat.date).format('YYYY-MM-DD'),
                       'encounterTypeUuids': column.data.encounterUuid,
                       'endDate': Moment(stat.date).format('YYYY-MM-DD'),
                       'locationUuids': this.params.locationUuids
                    };
                    console.log('Column', column);
                    console.log('Column Obj', patientListParams);
                    this.patientListParams.emit(patientListParams);
                  },
                  cellRenderer: (column) => {
                    if (typeof column.value === 'undefined') {

                       return 0;
                     }else {

                      return '<a href="javascript:void(0);" title="Identifiers">'
                     + column.value + '</a>';

                     }
                  }
                }
              );

              trackColumns.push(encounterDate);

         }

        let encounterObj = {
          'encounterType': stat.encounter_type,
          'encounterUuid': stat.encounter_type_uuid,
          'encounterCounts': [
            {
              'encounterDate': encounterDate,
              'encounterCount': stat.encounters_count,

            }
          ]
      };

        let savedEncounter = encounterMap.get(encounterId);

        // console.log('Saved Encounter', savedEncounter);

        if (typeof savedEncounter !== 'undefined') {
          savedEncounter.encounterCounts.push({

              'encounterDate': encounterDate,
              'encounterCount': stat.encounters_count

          });
         }else {

          encounterMap.set(encounterId, encounterObj);
         }

    });

    this.processEncounterRows(encounterMap);

  }

  public processEncounterRows(encounterMap) {

      let allRows = [];

      encounterMap.forEach((encounterItem: any) => {
           let encounterRow = {
             encounterType : encounterItem.encounterType,
             'encounterUuid': encounterItem.encounterUuid
           };

           let encounterCounts = encounterItem.encounterCounts;

           _.each(encounterCounts, (encounterCount: any) => {

                encounterRow[encounterCount.encounterDate] = encounterCount.encounterCount;

            });

           allRows.push(encounterRow);
      });

      this.dataEntryEncounters = allRows;

  }



  public procesMonthlyData() {

    let monthlyEntryArray = [];
    let columnArray = [];
    let trackColumns = [];
    let dataEntryEncounters = this.dataEntryEncounterData;
    let encounterMap = new Map();

    this.dataEntryEncounterColdef = [];

    this.dataEntryEncounterColdef.push(
      {
        headerName: 'Encounter Types',
        field: 'encounterType'
      }
    );

    _.each(dataEntryEncounters, (stat: any) => {
          let encounterId = stat.encounter_type_id;
          let month = stat.month;
          let monthStart = Moment(month).startOf('month').format('YYYY-MM-DD');
          let monthEnd = Moment(month).endOf('month').format('YYYY-MM-DD');

          if (_.includes(trackColumns, month) === false) {

            this.dataEntryEncounterColdef.push(
                {
                  headerName: month,
                  field: month,
                  onCellClicked: (column) => {
                    let patientListParams = {
                       'startDate': monthStart,
                       'encounterTypeUuids': column.data.encounterUuid,
                       'locationUuids': this.params.locationUuids,
                       'endDate': monthEnd

                    };
                    console.log('Column', column);
                    console.log('Column Obj', patientListParams);
                    this.patientListParams.emit(patientListParams);
                  },
                  cellRenderer: (column) => {
                    if (typeof column.value === 'undefined') {

                       return 0;
                     }else {

                      return '<a href="javascript:void(0);" title="Identifiers">'
                     + column.value + '</a>';

                     }
                  }
                }
              );

            trackColumns.push(month);

            }

          let monthlyObj = {
                encounterType: stat.encounter_type,
                'encounterUuid': stat.encounter_type_uuid,
                'encounterCounts': [
                  {
                  'encounterMonth' : stat.month ,
                  'encounterCount': stat.encounters_count
                  }
                ]

           };

          let savedEncounter = encounterMap.get(encounterId);

           // console.log('Saved Encounter', savedEncounter);
          if (typeof savedEncounter !== 'undefined') {
             savedEncounter.encounterCounts.push({
              'encounterMonth' : stat.month ,
              'encounterCount': stat.encounters_count
             });
            }else {
             encounterMap.set(encounterId, monthlyObj);
            }

      });

    this.processMonthlyRows(encounterMap);

  }

  public processMonthlyRows(encounterMap) {

    let allRows = [];

    encounterMap.forEach((encounterItem: any) => {
         // console.log('Encounter Item', encounterItem);
         let encounterRow = {
           encounterType : encounterItem.encounterType,
           'encounterUuid': encounterItem.encounterUuid
         };

         let encounterCounts = encounterItem.encounterCounts;

         _.each(encounterCounts, (encounterCount: any) => {

              encounterRow[encounterCount.encounterMonth] = encounterCount.encounterCount;

          });

         allRows.push(encounterRow);
    });

    this.dataEntryEncounters = allRows;

    console.log('Encounter Rows', allRows);

}

public processProviderData() {

  let dataEntryArray = [];
  let columnArray = [];
  let trackColumns = [];
  let dataEntryStats = this.dataEntryEncounterData;

  this.dataEntryEncounterColdef = [];

  this.dataEntryEncounterColdef.push(
    {
      headerName: 'Provider',
      field: 'providers'
    },
    {
      headerName: 'providerUuid',
      field: 'providerUuid',
      hide: true

    },
    {
      headerName: 'Total',
      field: 'total'

    },
    {
      headerName: 'Total Clinical Encounters',
      field: 'total_clinical'

    }
  );

  let providerMap =  new Map();

  _.each(dataEntryStats, (stat: any) => {
        let form = stat.encounter_type;
        let formId = stat.encounter_type_id;
        let providerId = stat.provider_id;
        let providerUuid = stat.provider_uuid;
        let encounterTypeUuid = stat.encounter_type_uuid;

        if (_.includes(trackColumns, formId) === false) {

          this.dataEntryEncounterColdef.push(
              {
                headerName: stat.encounter_type,
                field: stat.encounter_type,
                onCellClicked: (column) => {
                  let patientListParams = {
                     'providerUuid': column.data.providerUuid,
                     'encounterTypeUuids': encounterTypeUuid,
                     'locationUuids': this.params.locationUuids,
                     'startDate': this.params.startDate,
                     'endDate':  this.params.endDate
                  };
                  console.log('Column', column);
                  console.log('Column Obj', patientListParams);
                  this.patientListParams.emit(patientListParams);
                },
                cellRenderer: (column) => {
                  if (typeof column.value === 'undefined') {
                     return 0;
                   }else {
                    return '<a href="javascript:void(0);" title="providercount">'
                   + column.value + '</a>';
                   }
                }
              }
            );

          trackColumns.push(formId);
        }
        let providerObj = {
          'encounters': [
           {
             'encounter_type' : stat.encounter_type,
             'encounters_count' : stat.encounters_count,
             'is_clinical' : stat.is_clinical_encounter
            }
          ],
          'providerName': stat.provider_name,
          'providerUuid': stat.provider_uuid
        };

        let providerSaved = providerMap.get(providerId);

        if (typeof providerSaved !== 'undefined') {

             providerSaved.encounters.push( {
              'encounter_type' : stat.encounter_type,
              'encounters_count' : stat.encounters_count,
              'is_clinical' : stat.is_clinical_encounter
             });

        }else {
            providerMap.set(providerId, providerObj);
        }

    });


  this.generateProviderRowData(providerMap);

}

public generateProviderRowData(providerMap) {

  let rowArray = [];

  providerMap.forEach( (providerItem: any) => {
    let forms = providerItem.encounters;
    let totalEncounters = 0;
    let totalClinical = 0;
    let specificProvider: any = {
      providers: providerItem.providerName,
      providerUuid: providerItem.providerUuid
    };

    _.each(forms, (form: any) => {
      specificProvider[form.encounter_type] = form.encounters_count;

      totalEncounters += form.encounters_count;
      if (form.is_clinical === 1) {

        totalClinical += form.encounters_count;

      }

    });

    specificProvider.total = totalEncounters;
    specificProvider.total_clinical = totalClinical;

    rowArray.push(specificProvider);
  });

  this.dataEntryEncounters = rowArray;

}

public processCreatorData() {

  let dataEntryArray = [];
  let columnArray = [];
  let trackColumns = [];
  let dataEntryStats = this.dataEntryEncounterData;

  this.dataEntryEncounterColdef = [];

  this.dataEntryEncounterColdef.push(
    {
      headerName: 'Creator',
      field: 'creators'
    },
    {
      headerName: 'Total',
      field: 'total'

    },
    {
      headerName: 'Total Clinical Encounters',
      field: 'total_clinical'

    }
  );

  let creatorMap =  new Map();

  _.each(dataEntryStats, (stat: any) => {
        let form = stat.encounter_type;
        let formId = stat.encounter_type_id;
        let creatorId = stat.creator_id;
        let creatorUuid = stat.user_uuid;
        let encounterTypeUuid = stat.encounter_type_uuid;

        if (_.includes(trackColumns, formId) === false) {

          this.dataEntryEncounterColdef.push(
              {
                headerName: stat.encounter_type,
                field: stat.encounter_type,
                onCellClicked: (column) => {
                  let patientListParams = {
                     'creatorUuid': column.data.creatorUuid,
                     'encounterTypeUuids': encounterTypeUuid,
                     'locationUuids': this.params.locationUuids,
                     'startDate': this.params.startDate,
                     'endDate': this.params.endDate
                  };
                  console.log('Column', column);
                  console.log('Column Obj', patientListParams);
                  this.patientListParams.emit(patientListParams);
                },
                cellRenderer: (column) => {
                  if (typeof column.value === 'undefined') {
                     return 0;
                   }else {
                    return '<a href="javascript:void(0);" title="providercount">'
                   + column.value + '</a>';
                   }
                }
              }
            );

          // console.log('Data Entry cols', this.dataEntryEncounterColdef);

          trackColumns.push(formId);
        }
        let creatorObj = {
          'encounters': [
           {
             'encounter_type' : stat.encounter_type,
             'encounters_count' : stat.encounters_count,
             'is_clinical' : stat.is_clinical_encounter
            }
          ],
          'creatorUuid': stat.user_uuid,
          'creatorName': stat.creator_name
        };

        let creatorSaved = creatorMap.get(creatorId);

        if (typeof creatorSaved !== 'undefined') {

             creatorSaved.encounters.push( {
              'encounter_type' : stat.encounter_type,
              'encounters_count' : stat.encounters_count,
              'is_clinical' : stat.is_clinical_encounter
             });

        }else {
            creatorMap.set(creatorId, creatorObj);
        }

    });

  this.generatecreatorRowData(creatorMap);

}

public generatecreatorRowData(creatorMap) {

  let rowArray = [];

  creatorMap.forEach( (creatorItem: any) => {

    let forms = creatorItem.encounters;
    let totalEncounters = 0;
    let totalClinical = 0;
    let specificcreator: any = {
      creators: creatorItem.creatorName,
      creatorUuid: creatorItem.creatorUuid
    };

    _.each(forms, (form: any) => {
      specificcreator[form.encounter_type] = form.encounters_count;

      totalEncounters += form.encounters_count;
      if (form.is_clinical === 1) {

        totalClinical += form.encounters_count;

      }

    });

    specificcreator.total = totalEncounters;
    specificcreator.total_clinical = totalClinical;
    rowArray.push(specificcreator);
  });

  this.dataEntryEncounters = rowArray;

}

}
