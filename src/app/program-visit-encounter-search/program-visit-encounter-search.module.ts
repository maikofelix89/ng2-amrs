import { ProgramVisitEncounterSearchComponent } from './program-visit-encounter-search.component';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MdSelectModule, MdOptionModule, MdFormFieldModule,
    MdInputModule } from '@angular/material';
import { AngularMultiSelectModule }
from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { AppFeatureAnalytics } from '../shared/app-analytics/app-feature-analytics.service';
import { DepartmentProgramsConfigService } from './../etl-api/department-programs-config.service';
import { DataCacheService } from '../shared/services/data-cache.service';
import { SelectDepartmentService } from './program-visit-encounter-search.service';
import {
    DateTimePickerModule
  } from 'ng2-openmrs-formentry/dist/components/date-time-picker';
@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        AngularMultiSelectModule,
        MdSelectModule,
        MdOptionModule,
        MdFormFieldModule,
        MdInputModule,
        DateTimePickerModule
    ],
    exports: [ProgramVisitEncounterSearchComponent],
    declarations: [ProgramVisitEncounterSearchComponent],
    providers: [ DepartmentProgramsConfigService, DataCacheService, SelectDepartmentService],
})
export class ProgramVisitEncounterSearchModule { }
