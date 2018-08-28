import { Component, OnInit, OnDestroy } from '@angular/core';
import { PatientService } from '../../services/patient.service';
import { LabsResourceService } from '../../../etl-api/labs-resource.service';
import { ZeroVlPipe } from './../../../shared/pipes/zero-vl-pipe';

import { GridOptions } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import * as Moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lab-result',
  templateUrl: './lab-result.component.html',
  styleUrls: []
})
export class LabResultComponent implements OnInit, OnDestroy {
  public patient: any;
  public error: string;
  public loadingPatient: boolean;
  public fetchingResults: boolean;
  public isLoading: boolean;
  public patientUuId: any;
  public nextStartIndex: number = 0;
  public dataLoaded: boolean = false;
  public loadingLabSummary: boolean = false;
  public labResults = [];
  public subscription: Subscription;
  public gridOptions: GridOptions;
  constructor(
    private labsResourceService: LabsResourceService,
    private patientService: PatientService,
    private zeroVlPipe: ZeroVlPipe) {
    this.gridOptions = {} as GridOptions;
  }

  public ngOnInit() {
    this.loadingPatient = true;
    this.subscription = this.patientService.currentlyLoadedPatient.subscribe(
      (patient) => {
        this.loadingPatient = false;
        if (patient) {
          this.patient = patient;
          this.patientUuId = this.patient.person.uuid;
          /*
          this.getHistoricalPatientLabResults(this.patientUuId,
            { startIndex: this.nextStartIndex.toString(), limit: '20' });
            */

          // this.createOncologyColumnDefs();
          this.createOncologyRows();

        }
      }
    );
    this.gridOptions.columnDefs = this.createOncologyColumnDefs();
    this.gridOptions.rowData = this.labResults;

  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public getHistoricalPatientLabResults(
    patientUuId, params: { startIndex: string, limit: string }) {
    this.patientUuId = this.patient.person.uuid;
    this.fetchingResults = true;
    this.labsResourceService.getHistoricalPatientLabResults(this.patientUuId,
      { startIndex: this.nextStartIndex.toString(), limit: '20' }).subscribe((result) => {
        if (result) {
          this.labResults = this.formatDateField(result);
          if (this.labResults.length > 0) {
            let size: number = this.labResults.length;
            this.nextStartIndex = +(params.startIndex) + size;
            this.isLoading = false;
          } else {
            this.dataLoaded = true;
          }
          this.fetchingResults = false;
        }
      }, (err) => {
        this.fetchingResults = false;
        this.error = err;
      });
    this.createOncologyRows();
    // return this.labResults;

  }
  public formatDateField(result) {
    let tests = [];
    for (let  data of result) {
      let testDatetime;
      for (let r in data) {
        if (data.hasOwnProperty(r)) {
          let lab = Moment(data.test_datetime).format('DD-MM-YYYY');
          data['testDatetime'] = lab;
        }
      }
      tests.push(data);

    }
    return tests;

  }
  public loadMoreLabResults() {
    this.isLoading = true;
    this.getHistoricalPatientLabResults(this.patientUuId,
      { startIndex: this.nextStartIndex.toString(), limit: '20' });
  }
  private createColumnDefs() {
    return [
      {
        headerName: 'Date',
        width: 100,
        field: 'testDatetime',
         cellStyle: {
          'text-align': 'center'
        }
      },
      {
        headerName: 'Tests Ordered',
        width: 120,
        field: 'tests_ordered',
        cellStyle: {
          'text-align': 'center'
        }
      },
      {
        headerName: 'HIV VL',
        width: 100,
        field: 'hiv_viral_load',
        cellRenderer: (column) => {
             let vl = this.zeroVlPipe.transform(column.value);
             return vl;
        },
        cellStyle: {
          'text-align': 'center'
        }
      },
      {
        headerName: 'DNA PCR',
        width: 190,
        field: 'hiv_dna_pcr',
        cellStyle: {
          'text-align': 'center'
        }
      },
      {
        headerName: 'HIV RAPID',
        width: 190,
        field: 'hiv_rapid_test',
        cellStyle: {
          'text-align': 'center'
        }
      },
      {
        headerName: 'CD4',
        width: 100,
        field: 'cd4_count',
         cellStyle: {
          'text-align': 'center'
        }
      },
      {
        headerName: 'CD4%',
        width: 70,
        field: 'cd4_percent',
        cellStyle: {
          'text-align': 'center'
        }
      },

      {
        headerName: 'Hb',
        width: 80,
        field: 'hemoglobin',
        cellStyle: {
          'text-align': 'center'
        }
      },
      {
        headerName: 'AST',
        field: 'ast',
        width: 80,
        editable: true,
        cellStyle: {
          'text-align': 'center'
        }
      },
      {
        headerName: 'Cr',
        width: 80,
        field: 'creatinine',
        cellStyle: {
          'text-align': 'center'
        }
      },
      {
        headerName: 'CXR',
        width: 280,
        field: 'chest_xray',
        cellStyle: {
          'text-align': 'center'
        }
      },
      {
        headerName: 'Lab Errors',
        width: 250,
        field: 'lab_errors',
        cellStyle: {
          'text-align': 'center'
        }
      }
    ];
  }

  private createOncologyColumnDefs() {
    return [
      {
        headerName: '',
        width: 250,
        field: 'labs',
         cellStyle: {
          'text-align': 'right'
        }
      },
      {
        headerName: 'Most Recent Lab Tests',
        width: 250,
        field: 'most_recent',
         cellStyle: {
          'text-align': 'right'
        }
      },
      {
        headerName: 'Second Most Recent Lab Tests',
        width: 250,
        field: 'second_recent',
         cellStyle: {
          'text-align': 'right'
        }
      },
      {
        headerName: 'Third most recent lab tests',
        width: 250,
        field: 'third_recent',
         cellStyle: {
          'text-align': 'right'
        }
      }
    ];
  }

  private createOncologyRows() {

    let rows = [
      {
        labs: 'WBC',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'HGB',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'PLT',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'ANC',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'RBC',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'MCV',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'WBC',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'MCH',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'MCHC',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'RDW',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'Sodium',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'Potassium',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
       {
        labs: 'WBC',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'HGB',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'PLT',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'ANC',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'RBC',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'MCV',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'WBC',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'MCH',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'MCHC',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'RDW',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'Sodium',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'Potassium',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },

      {
        labs: 'Chloride',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'Urea',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'Creatinine',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'Total Protein',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'Albumin',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'MCV',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'AST',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'ALT',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'ALP',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'GGT',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'Total Bili',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'Direct Bili',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'Uric acid',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'LDH',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'Total PSA',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      },
      {
        labs: 'CEA 19-9',
        most_recent: '',
        second_recent: '',
        third_recent: ''
      }
    ];

    this.labResults = rows;
    this.gridOptions.api.sizeColumnsToFit();

  }

}
