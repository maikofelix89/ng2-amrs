import { Component,
    OnInit , OnDestroy , AfterViewInit, OnChanges ,
    Output , EventEmitter, Input , ChangeDetectorRef,
    ViewChild , SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';
import * as Moment from 'moment';

@Component({
  selector: 'data-entry-statistics-encounters-list',
  templateUrl: './data-entry-statistics-encounters-list.component.html',
  styleUrls: ['./data-entry-statistics-encounters-list.component.css']
})
export class DataEntryStatisticsEncountersListComponent
  implements OnInit , OnChanges , AfterViewInit {
  public title: string = 'Encounters Per Type Per Day';

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

  @Input() public dataEntryEncounterStats: any;
  @Input() public params: any;
  @Output() public emitEncounterPatientListParams = new EventEmitter<string>();

  public dataEntryEncounterColdef: any = [
  ];

  public dataEntryStats: any = [];
  public dataEntryRowData: any[];

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
       if (changes.dataEntryEncounterStats
        && this.dataEntryEncounterStats.length > 0) {
          this.processEncounterListData();
       } else {
         this.dataEntryRowData = [];
       }
  }

  public processEncounterListData() {

    let dataEntryArray = [];
    let columnArray = [];
    let trackColumns = [];
    let dataEntryStats = this.dataEntryEncounterStats;
    let encounterMap = new Map();

    console.log('processEncounterListData params', this.params);

    this.dataEntryEncounterColdef = [];

    this.dataEntryEncounterColdef.push(
      {
        headerName: 'Encounter Types',
        field: 'encounterType'
      }
    );

    _.each(dataEntryStats, (stat: any) => {

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
                    this.emitPatientListParams(patientListParams);
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
           // console.log('Encounter Item', encounterItem);
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

      this.dataEntryRowData = allRows;


  }

  public emitPatientListParams(patientListParams) {

    // console.log('Emit Encounter UUid', patientListParams);

    this.emitEncounterPatientListParams.emit(patientListParams);

  }

}
