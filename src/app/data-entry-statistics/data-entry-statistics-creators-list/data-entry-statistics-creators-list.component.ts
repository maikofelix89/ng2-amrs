import { Component,
    OnInit , OnDestroy , AfterViewInit, OnChanges ,
    Output , EventEmitter, Input , ChangeDetectorRef,
    ViewChild , SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';
import * as Moment from 'moment';

@Component({
  selector: 'data-entry-statistics-creators-list',
  templateUrl: './data-entry-statistics-creators-list.component.html',
  styleUrls: ['./data-entry-statistics-creators-list.component.css']
})
export class DataEntryStatisticsCreatorsListComponent
  implements OnInit , OnChanges , AfterViewInit {
  public title: string = 'Encounters Per Type Per Creator';

  public gridOptions: any = {
    enableColResize: true,
    enableSorting: true,
    enableFilter: true,
    showToolPanel: false,
    pagination: true,
    paginationPageSize: 50,
    onGridSizeChanged : () => {
      this.gridOptions.api.sizeColumnsToFit();
    },
    onGridReady: () => {
      setTimeout( () => {
        this.gridOptions.api.sizeColumnsToFit();
        console.log('Grid Ready');
      }, 500);
    }
  };

  @Input() public dataEntryCreatorStats: any = [];
  @Input() public params: any;
  @Output() public creatorPatientListParams = new EventEmitter<any>();

  public dataEntryCreatorColdef: any = [
  ];

  public creatorStats: any = [];
  public creatorRowData: any = [];

  constructor(
    private _cd: ChangeDetectorRef
  ) {}

  public ngOnInit() {
    console.log('Loading creator List...');
  }
  public ngAfterViewInit(): void {
    this._cd.detectChanges();
  }

  public ngOnChanges(changes: SimpleChanges) {
       // changes.prop contains the old and the new value...
       console.log('On Changes', changes);
       if (changes.dataEntryCreatorStats && this.dataEntryCreatorStats.length > 0) {
          this.processEncounterListData();
       } else {
         this.creatorRowData = [];
       }
  }

  public processEncounterListData() {

    let dataEntryArray = [];
    let columnArray = [];
    let trackColumns = [];
    let dataEntryStats = this.dataEntryCreatorStats;

    this.dataEntryCreatorColdef = [];

    this.dataEntryCreatorColdef.push(
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

            this.dataEntryCreatorColdef.push(
                {
                  headerName: stat.encounter_type,
                  field: stat.encounter_type,
                  onCellClicked: (column) => {
                    let patientListParams = {
                       'creatorUuid': creatorUuid,
                       'encounterTypeUuids': encounterTypeUuid,
                       'locationUuids': this.params.locationUuids,
                       'startDate': this.params.startDate,
                       'endDate': this.params.endDate
                    };
                    console.log('Column', column);
                    console.log('Column Obj', patientListParams);
                    this.emitCreatorParams(patientListParams);
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

          // console.log('creator Map', creatorMap);

          // push row data

      });


    this.generatecreatorRowData(creatorMap);


  }

  public generatecreatorRowData(creatorMap) {

    console.log('Generate creator Data');

    let rowArray = [];

    creatorMap.forEach( (creatorItem: any) => {

      console.log('creator Item in For', creatorItem);
      let forms = creatorItem.encounters;
      let totalEncounters = 0;
      let totalClinical = 0;
      let specificcreator: any = {
        creators: creatorItem.creatorName
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

      console.log('creator', specificcreator);

      rowArray.push(specificcreator);
    });

    this.creatorRowData = rowArray;

    this.gridOptions.api.sizeColumnsToFit();

    this.gridOptions.api.refreshView();

  }

  public emitCreatorParams(patientListParams) {

    console.log('Emit Creatot Patient List Params', patientListParams);

    this.creatorPatientListParams.emit(patientListParams);

  }

}
