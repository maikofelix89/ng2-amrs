import {
    Component, OnInit, OnChanges, Input, ViewChild,
    SimpleChanges
} from '@angular/core';
import * as _ from 'lodash';
import { AgGridNg2 } from 'ag-grid-angular';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'retention-report-tabular',
    templateUrl: 'retention-report-tabular.component.html',
    styleUrls: ['./retention-report-tabular.component.css']
})

export class RetentionReportTabularComponent implements OnInit, OnChanges {
    public startDate: any;
    public endDate: any;
    public locationUuids: any;
    public gridOptions: any = {
        enableColResize: true,
        enableSorting: true,
        enableFilter: true,
        groupDefaultExpanded: -1,
        showToolPanel: false,
        onGridSizeChanged : () => {
        },
        onGridReady: () => {
        }
    };
    @Input() public retentionSummary: Array<any> = [];
    @Input() public params: any;
    @Input() public indicator = '';

    public columns: any = [];
    public data: any = [];
    public mockResults: any = [];
    public retentionSummaryColdef: any = [
    ];
    public pinnedBottomRowData: any = [];
    public reportRows: any = {};

    @ViewChild('agGrid')
    public agGrid: AgGridNg2;
    constructor(
        private router: Router,
        private route: ActivatedRoute) { }

    public ngOnInit() {

    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.retentionSummary && this.retentionSummary) {
            this.data = [];
            this.processSummaryData(this.retentionSummary);
        }
    }
    public onCellClicked(event) {
        // console.log('cellClicked', event);
        this.goToPatientList(event);
    }
    public processSummaryData(results) {
      this.resetData();
      this.data = results;
      const mergedArrays = _.merge(results['appointment_adherence'], results['defaulter_tracing']);
      this.generateColumns(mergedArrays);
      if (results) {
        this.getIndicators(results);
        this.setRowData(mergedArrays);
      }

    }
    public resetData() {
        this.retentionSummaryColdef = [];
        this.data =  [];
    }
    public generateColumns(results) {
        const cols = [
            {
                headerName: 'Report',
                width: 200,
                field: 'report',
                rowGroup: true,
                hide: true,
                cellStyle: {
                  'text-align': 'left'
                },
                cellRenderer: (col: any) => {
                    let value  = '';
                    if (typeof col.value !== 'undefined') {
                        value = this.translateIndicator(col.value);
                    }
                    return value;
                  }
            },
            {
                headerName: 'Indicator',
                width: 200,
                field: 'indicator',
                cellStyle: {
                  'text-align': 'left'
                },
                cellRenderer: (col: any) => {
                    let value  = '';
                    if (typeof col.value !== 'undefined') {
                        value = this.translateIndicator(col.value);
                    }
                    return value;
                  }
              }
        ];
        _.each(results, (result) => {
            console.log('result', result);
            const column = {
                headerName: result.report_date,
                width: 100,
                field: result.report_date,
                cellStyle: {
                  'text-align': 'left'
                },
                cellRenderer: (col) => {
                    if (typeof col.value === 'undefined') {
                       return '';
                     } else {
                         let value;
                         if (col.value === null) {
                                value = 0;
                         } else {
                               value = col.value;
                         }
                         return '<a href="javascript:void(0);">'
                        + value + '</a>';
                     }
                  }
              };

            cols.push(column);
        });

        this.retentionSummaryColdef = cols;


    }



    public getIndicators(data) {

               Object.keys(data).forEach((reportKey, reportIndex) => {

                if (data[reportKey].length > 0) {
                   const rowData = data[reportKey][0];
                   const report = reportKey;
                                Object.keys(rowData).forEach((key, index) => {
                                    // console.log('key', key);
                                    if (key === 'location_id' || key === 'location_name' || key === 'location_uuid'
                                    || key === 'report_date') {
                                    } else {
                                        const indicatorObj = {
                                            'indicator': key,
                                            'location_uuid': rowData['location_uuid'],
                                            'report': report
                                        };
                                        this.reportRows[key] = indicatorObj;
                                    }
                                });


                }

            });

    }

    public setRowData(results) {

        const rows = this.reportRows;


                _.each(results, (result: any) => {
                    const date = result.report_date;
                    Object.keys(result).forEach((key, index) => {
                        if (key === 'location_id' || key === 'location_name' || key === 'location_uuid'
                        || key === 'report_date') {

                        } else {
                            rows[key][date] = result[key];
                        }
                    });


                });


        this.data = rows;
        this.generateRows(rows);

    }

    public generateRows(rows: any) {
        const finalRow = [];
        Object.keys(rows).forEach((key, index) => {
            finalRow.push(rows[key]);
        });
        this.data = finalRow;
        setTimeout(() => {
            this.gridOptions.api.sizeColumnsToFit();
        }, 500);

    }

    public goToPatientList(data: any) {
        const startDate = data.colDef.field;
        const endDate = data.colDef.field;
        const indicator = data.data.indicator;
        const locationUuid = data.data.location_uuid;
        const report = data.data.report;
        console.log('data', data);

        const params = {
              startDate: startDate,
              endDate: endDate,
              locationUuids: locationUuid,
              indicators: indicator,
              report: report
        };

        this.router.navigate(['patient-list']
        , {
            relativeTo: this.route,
            queryParams: params
        });

    }
    public translateIndicator(indicator: string) {
        const indicatorArray = indicator.toLowerCase().split('_');
          return indicatorArray.map((word) => {
                return ((word.charAt(0).toUpperCase()) + word.slice(1));
          }).join(' ');
      }

    public exportCountsListToCsv() {
        this.gridOptions.api.exportDataAsCsv();
    }

    public setPinnedRow() {

        if (this.gridOptions.api) {
          this.gridOptions.api.setPinnedBottomRowData(this.pinnedBottomRowData);
        }
        return true;
    }

}
