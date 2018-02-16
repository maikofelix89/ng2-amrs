import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DateTimePickerModule } from 'ng2-openmrs-formentry/dist/components/date-time-picker';
import { AngularMultiSelectModule }
from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';

import { DataEntryStatisticsComponent } from './data-entry-statistics.component';
import { DataEntryStatisticsService } from './data-entry-statistics.service';
import { EncounterTypeCreatorFilterComponent } from
'./encounter-type-creator-filter/encounter-type-creator-filter.component';
import { EncounterTypeDayFilterComponent } from
'./encounter-type-day-filter/encounter-type-day-filter.component';
import { EncounterTypeMonthFilterComponent } from
'./encounter-type-month-filter/encounter-type-month-filter.component';

@NgModule({
  imports: [
    DateTimePickerModule,
    CommonModule,
    FormsModule,
    AngularMultiSelectModule
  ],
  exports: [
  ],
  declarations: [
    DataEntryStatisticsComponent,
    EncounterTypeCreatorFilterComponent,
    EncounterTypeDayFilterComponent,
    EncounterTypeMonthFilterComponent
   ],
  providers: [
    DataEntryStatisticsService
  ],
})
export class DataEntryStatisticsModule { }
