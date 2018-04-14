import { Component,
    OnInit , OnDestroy , AfterViewInit, OnChanges ,
    Output , EventEmitter, Input , ChangeDetectorRef,
    ViewChild , SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';
import * as Moment from 'moment';

@Component({
  selector: 'data-entry-statistics-provider-list',
  templateUrl: './data-entry-statistics-providers-list.component.html',
  styleUrls: ['./data-entry-statistics-providers-list.component.css']
})
export class DataEntryStatisticsProviderListComponent
  implements OnInit , OnChanges , AfterViewInit {
  public title: string = 'Encounters Per Type Per Provider';

  public gridOptions: any = {
    enableColResize: true,
    enableSorting: true,
    enableFilter: true,
    showToolPanel: false,
    pagination: true,
    paginationPageSize: 300,
    onGridSizeChanged : () => {
      this.gridOptions.api.sizeColumnsToFit();
    }
  };

  @Input() public dataEntryproviderStats: any = [];
  @Input() public params: any;
  @Output() public providerPatientListParams = new EventEmitter<string>();

  public dataEntryEncounterColdef: any = [
  ];

  public providerStats: any = [];
  public providerRowData: any[];

  constructor(
    private _cd: ChangeDetectorRef
  ) {}

  public ngOnInit() {
    console.log('Loading Provider List...');
  }
  public ngAfterViewInit(): void {
    this._cd.detectChanges();
  }

  public ngOnChanges(changes: SimpleChanges) {
       // changes.prop contains the old and the new value...
       console.log('On Changes', changes);
       if (changes.dataEntryproviderStats && this.dataEntryproviderStats.length > 0) {
          this.processEncounterListData();
       }else {
        this.providerRowData = [];
       }
  }

  public processEncounterListData() {

    let dataEntryArray = [];
    let columnArray = [];
    let trackColumns = [];
    let dataEntryStats = this.dataEntryproviderStats;

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
                       'endDate':  Moment(this.params.endDate)
                    };
                    console.log('Column', column);
                    console.log('Column Obj', patientListParams);
                    this.emitProviderParams(patientListParams);
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

          // console.log('Provider Map', providerMap);

          // push row data

      });

    // this.dataEntryStats = dataEntryArray;

    console.log('Data Entry Columns', this.dataEntryEncounterColdef);
    console.log('Data Entry Rows', providerMap);

    this.generateProviderRowData(providerMap);

    this.gridOptions.api.setColumnDefs(this.dataEntryEncounterColdef);

    this.gridOptions.api.refreshView();

  }

  public generateProviderRowData(providerMap) {

    console.log('Generate Provider Data');

    let rowArray = [];

    providerMap.forEach( (providerItem: any) => {

      // console.log('Provider Item in For', providerItem);
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

    this.providerRowData = rowArray;

    this.gridOptions.api.sizeColumnsToFit();

    console.log('All flattened rows', rowArray);

  }

  public emitProviderParams(providerParams) {

    console.log('Emit Encounter UUid', providerParams);

    this.providerPatientListParams.emit(providerParams);

  }

}
