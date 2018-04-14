import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DateTimePickerModule } from 'ng2-openmrs-formentry/dist/components/date-time-picker';
import { AngularMultiSelectModule }
from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { AgGridModule } from 'ag-grid-angular/main';

import { DataEntryStatisticsComponent } from './data-entry-statistics.component';
import { DataEntryStatisticsService } from
'./../etl-api/data-entry-statistics-resource.service';
import { DataEntryStatisticsPatientListComponent } from
'./data-entry-statistics-patient-list.component';
import { DataEntryStatisticsEncountersComponent } from
'./data-entry-statistics-encounters.component';
import { DataEntryStatisticsFiltersComponent } from
'./data-entry-statistics-filters/data-entry-statistics-filters.component';

@NgModule({
  imports: [
    DateTimePickerModule,
    CommonModule,
    FormsModule,
    AngularMultiSelectModule,
    AgGridModule
  ],
  exports: [
    DataEntryStatisticsComponent,
    DataEntryStatisticsPatientListComponent,
    DataEntryStatisticsEncountersComponent,
    DataEntryStatisticsFiltersComponent
  ],
  declarations: [
    DataEntryStatisticsComponent,
    DataEntryStatisticsPatientListComponent,
    DataEntryStatisticsEncountersComponent,
    DataEntryStatisticsFiltersComponent
   ],
  providers: [
    DataEntryStatisticsService
  ],
})
export class DataEntryStatisticsModule { }
