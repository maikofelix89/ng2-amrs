import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';

import { Subscription } from 'rxjs';
import { GridOptions } from 'ag-grid';

import { CaseManagementResourceService } from './../../etl-api/case-management-resource.service';


@Component({
  selector: 'app-dwapi-patient-list',
  templateUrl: './dwapi-patient-list.component.html',
  styleUrls: ['./dwapi-patient-list.component.css']
})

export class DwapiPatientListComponent implements OnInit, OnChanges {

  public title = '';
  public patients: any = [];
  public patient: any;
  public patientUuid: any;
  public patientList = [];
  public errors: any = [];
  public showSuccessAlert = false;
  public showErrorAlert = false;
  public errorAlert: string;
  public errorTitle: string;
  public successAlert = '';
  public gridApi: any;
  public gridColumnApi: any;
  @Input() public rowData = [];
  public params: any;
  public subscription: any;
  public busy: Subscription;
  public gridOptions: GridOptions = {
    enableColResize: true,
    enableSorting: true,
    enableFilter: true,
    showToolPanel: false,
    pagination: true,
    paginationPageSize: 300,
    rowSelection: 'multiple',
    onGridSizeChanged: () => {
      if (this.gridOptions.api) {
        // this.gridOptions.api.sizeColumnsToFit();
      }
    }
  };
  public dwapiColdef: any = [
  ];




  constructor(private router: Router,
    private route: ActivatedRoute,
    private caseManagementResourceService: CaseManagementResourceService) {
  }

  public ngOnInit() {
    // Get managers
    this.route
      .queryParams
      .subscribe((params: any) => {
        if (params) {
          this.params = params;
          // this.getCaseManagers();
        }
      }, (error) => {
        console.error('Error', error);
      });

  }
  public ngOnChanges(changes: SimpleChanges) {
    if (changes.rowData && this.rowData.length > 0) {
      this.generateDynamicPatientListCols();
    } else {
      this.rowData = [];
    }
  }
  public generateDynamicPatientListCols() {
    const patientListCols = Object.keys(this.rowData[0]);
    const columns: any = [{
      lockPosition: true,
      headerName: 'No',
      valueGetter: 'node.rowIndex + 1',
      cellClass: 'locked-col',
      width: 70,
      suppressNavigable: true,
      pinned: 'left'
    },
    {
      headerName: 'Name',
      field: 'person_name',
      width: 200,
      pinned: 'left',
      onCellClicked: (column: any) => {
        const patientUuid = column.data.patient_uuid;
        this.redirectTopatientInfo(patientUuid);
      },
      cellRenderer: (column: any) => {
        return '<a href="javascript:void(0)";>' + column.value + '</a>';
      }
    },
    {
      headerName: 'Identifiers',
      field: 'identifiers',
      width: 200,
      pinned: 'left'
    },
    {
      headerName: 'Age',
      field: 'age',
      width: 150
    },
    {
      headerName: 'Gender',
      field: 'gender',
      width: 150
    }];

    _.each(patientListCols, (cols: any) => {
      if (cols === 'PatientPK' || cols === 'PatientID' || cols === 'person_id' || cols === 'uuid'
      || cols === 'patient_uuid' || cols === 'person_name' || cols === 'identifiers'
      || cols === 'age' || cols === 'gender' || cols === 'birthdate') {
        return '';
      } else {
        columns.push({
          headerName: cols,
          field: cols
        });
      }
    });

    this.dwapiColdef = columns;
  }
  public redirectTopatientInfo(patientUuid) {
    if (patientUuid === undefined || patientUuid === null) {
      return;
    }
    this.router.navigate(['/patient-dashboard/patient/' + patientUuid +
      '/general/general/landing-page']);
  }
  public exportPatientListToCsv() {
    this.gridOptions.api.exportDataAsCsv();
  }
}
