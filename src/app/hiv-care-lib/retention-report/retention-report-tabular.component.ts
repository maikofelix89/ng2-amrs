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
    @Input() public sectionDefs: Array<any> = [];
    @Input() public params: any;
    @Input() public indicator = '';

    public columns: any = [];
    public data: any = [];
    public mockResults: any = [];
    public retentionSummaryColdef: any = [
    ];
    public pinnedBottomRowData: any = [];
    public reportRows: any = {};
    public urlParams: any;

    @ViewChild('agGrid')
    public agGrid: AgGridNg2;
    constructor(
        private router: Router,
        private route: ActivatedRoute) { }

    public ngOnInit() {
        this.route
        .queryParams
        .subscribe((params) => {
          if (params) {
               this.urlParams = params;
               console.log('urlparams', params);
             }
         }, (error) => {
            console.error('Error', error);
         });

    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.retentionSummary) {
            this.processSummaryData(this.retentionSummary);
        }
        if (changes.sectionDefs) {
            console.log('sectionDefs', changes.sectionDefs);
            this.generateColumns(this.sectionDefs);
        }
    }
    public processSummaryData(results) {
        this.data = results;
        this.setRowData(results);
    }

    public setRowData(allRowsData) {
        const finalRows = [];
        _.each(allRowsData, (rowData) => {
            const rowObj = {
            };
            _.each(rowData, (data, index) => {
                rowObj[index] = data;
            });
            finalRows.push(rowObj);
        });
        this.data = finalRows;
    }
    public onCellClicked(event) {
        // console.log('cellClicked', event);
        this.goToPatientList(event);
    }

    public resetData() {
        this.retentionSummaryColdef = [];
        this.data =  [];
    }
    public generateColumns(sectionsData: any) {
        const defs = [];
            defs.push({
                headerName: 'Date',
                field: 'report_date',
                pinned: 'left'
            });
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < sectionsData.length; i++) {
                const section = sectionsData[i];
                const created: any = {};
                created.headerName = section.sectionTitle;
                created.children = [];
                // tslint:disable-next-line:prefer-for-of
                for (let j = 0; j < section.indicators.length; j++) {
                    const child: any = {
                        headerName: section.indicators[j].label,
                        field: section.indicators[j].indicator
                    };
                    created.children.push(child);
                }
                defs.push(created);
            }
            this.retentionSummaryColdef = defs;
            console.log('coldefs', this.retentionSummaryColdef);
  }



    public goToPatientList(data: any) {
        const startDate = data.data.report_date;
        const endDate = data.data.report_date;
        const indicator = data.colDef.field;
        const locationUuid = data.data.location_uuid;
        console.log('data', data);

        const params = {
              startDate: startDate,
              endDate: endDate,
              locationUuids: locationUuid,
              indicators: indicator,
              gender: this.urlParams.gender,
              startAge: this.urlParams.startAge,
              endAge: this.urlParams.endAge,
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
