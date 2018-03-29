import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DepartmentProgramFilterModule }
from './../department-program-filter/department-program-filter.module';
import { AgGridModule } from 'ag-grid-angular/main';

import { PatientsProgramEnrollmentComponent } from './patients-program-enrollment.component';
import { AppFeatureAnalytics } from '../shared/app-analytics/app-feature-analytics.service';
import { PatientProgramEnrollmentService } from
    './../etl-api/patient-program-enrollment.service';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        DepartmentProgramFilterModule,
        AgGridModule
    ],
    exports: [ PatientsProgramEnrollmentComponent],
    declarations: [PatientsProgramEnrollmentComponent],
    providers: [PatientProgramEnrollmentService],
})
export class PatientProgramEnrollmentModule { }
