/*
import { TestBed, async, fakeAsync, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { PatientProgramResourceService } from './../etl-api/patient-program-resource.service';
import { LocalStorageService } from '../utils/local-storage.service';
import { DepartmentProgramsConfigService } from './../etl-api/department-programs-config.service';
import { UserDefaultPropertiesService } from
'./../user-default-properties/user-default-properties.service';
import { AppSettingsService } from './../app-settings/app-settings.service';
import { LocationResourceService } from './../openmrs-api/location-resource.service';
import { DepartmentProgramFilterComponent } from './department-program-filter.component';
import { AngularMultiSelectModule }
from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Http, Response, Headers, BaseRequestOptions, ResponseOptions } from '@angular/http';
import { AppFeatureAnalytics } from './../shared/app-analytics/app-feature-analytics.service';
import { FakeAppFeatureAnalytics } from './../shared/app-analytics/app-feature-analytcis.mock';
import { DateTimePickerModule } from 'ng2-openmrs-formentry/dist/components/date-time-picker';

fdescribe('Component : DepartmentProgramFilter', () => {
    let fixture: ComponentFixture<DepartmentProgramsConfigService>;
    let comp: DepartmentProgramsConfigService;
    let patientProgramService: PatientProgramResourceService;
    let localStorageService: LocalStorageService;
    let departmentProgramService: DepartmentProgramsConfigService;
    let userDefaultService: UserDefaultPropertiesService;
    let locationResourceService: LocationResourceService;
    let storage: Storage;

    beforeEach(async(() => {

    TestBed.configureTestingModule({
        imports:
        [
         AngularMultiSelectModule,
         FormsModule,
         DateTimePickerModule
        ],
        declarations: [
            DepartmentProgramFilterComponent
        ],
        providers: [
          PatientProgramResourceService,
          LocationResourceService,
          AppSettingsService,
          LocalStorageService,
          DepartmentProgramsConfigService,
          UserDefaultPropertiesService,
          LocationResourceService
          Storage,
          {
            provide: Http,
            useFactory: (backendInstance: MockBackend, defaultOptions: BaseRequestOptions) => {
              return new Http(backendInstance, defaultOptions);
            },
            deps: [MockBackend, BaseRequestOptions]
          },
          {
            provide: AppFeatureAnalytics,
            useClass: FakeAppFeatureAnalytics
          },
          MockBackend,
          BaseRequestOptions
        ]
      }).compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(DepartmentProgramFilterComponent);
          comp = fixture.componentInstance;
          patientProgramService = fixture.debugElement.injector.get(PatientProgramResourceService);
          localStorageService = fixture.debugElement.injector.get(LocalStorageService);
          userDefaultService = fixture.debugElement.injector.get(UserDefaultPropertiesService);
          departmentProgramService = fixture.debugElement.injector
          .get(DepartmentProgramsConfigService);
          locationResourceService = fixture.debugElement.injector.get(LocationResourceService);
          cd = fixture.debugElement.injector.get(ChangeDetectorRef);
        });
      }));

    fit('should create an instance', () => {
      expect(comp).toBeTruthy();
    });

});
*/
