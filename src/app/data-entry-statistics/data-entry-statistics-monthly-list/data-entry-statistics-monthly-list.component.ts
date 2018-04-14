import { Component,
    OnInit , OnDestroy , AfterViewInit, OnChanges ,
    Output , EventEmitter, Input , ChangeDetectorRef,
    ViewChild , SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';
import * as Moment from 'moment';

@Component({
  selector: 'data-entry-statistics-monthly-list',
  templateUrl: './data-entry-statistics-monthly-list.component.html',
  styleUrls: ['./data-entry-statistics-monthly-list.component.css']
})
export class DataEntryStatisticsMonthlyListComponent
  implements OnInit , OnChanges , AfterViewInit {
  public title: string = 'Encounters Per Type Per Month';
  @Input() public params: any;

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
      console.log('Grid Ready');
      this.gridOptions.api.sizeColumnsToFit();
    }
  };

  @Input() public dataEntryMonthlyStats: any = [];
  @Output() public monthlyPatientParams = new EventEmitter<string>();

  public dataEntryMonthlyColdef: any = [
  ];

  public monthlyStats: any = [];
  public monthlyRowData: any[];

  constructor(
    private _cd: ChangeDetectorRef
  ) {}

  public ngOnInit() {
    console.log('Loading monthly List...');
  }
  public ngAfterViewInit(): void {
    this._cd.detectChanges();
  }

  public ngOnChanges(changes: SimpleChanges) {
       // changes.prop contains the old and the new value...
       console.log('On Changes', changes);
       if (changes.dataEntryMonthlyStats && this.dataEntryMonthlyStats.length > 0) {
          this.processEncounterListData();
       }else {
          this.monthlyRowData = [];
       }
  }

  public processEncounterListData() {

    let monthlyEntryArray = [];
    let columnArray = [];
    let trackColumns = [];
    let dataEntryStats = this.dataEntryMonthlyStats;
    let encounterMap = new Map();

    this.dataEntryMonthlyColdef = [];

    this.dataEntryMonthlyColdef.push(
      {
        headerName: 'Encounter Types',
        field: 'encounterType'
      }
    );

    _.each(dataEntryStats, (stat: any) => {
          let encounterId = stat.encounter_type_id;
          let month = stat.month;
          let monthStart = Moment(month).startOf('month').format('YYYY-MM-DD');
          let monthEnd = Moment(month).endOf('month').format('YYYY-MM-DD');

          if (_.includes(trackColumns, month) === false) {

            this.dataEntryMonthlyColdef.push(
                {
                  headerName: month,
                  field: month,
                  onCellClicked: (column) => {
                    let patientListParams = {
                       'startDate': monthStart,
                       'encounterUuid': column.data.encounterUuid,
                       'locationUuids': this.params.locationUuids,
                       'endDate': monthEnd

                    };
                    console.log('Column', column);
                    console.log('Column Obj', patientListParams);
                    this.emitMonthlyPatientListParams(patientListParams);
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

    this.processEncounterRows(encounterMap);

    // console.log('Data Entry Columns', this.dataEntryMonthlyColdef);

    // this.gridOptions.api.setColumnDefs(this.dataEntryMonthlyColdef);

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

              encounterRow[encounterCount.encounterMonth] = encounterCount.encounterCount;

          });

         allRows.push(encounterRow);
    });

    this.monthlyRowData = allRows;

    console.log('Encounter Rows', allRows);

}

  public emitMonthlyPatientListParams(patientListParams) {

    console.log('Emit Monthly patient params', patientListParams);

    this.monthlyPatientParams.emit(patientListParams);

  }

}
