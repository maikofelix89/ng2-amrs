import { LocalStorageService } from './../../utils/local-storage.service';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import {
  ClinicDashboardCacheService
} from '../../clinic-dashboard/services/clinic-dashboard-cache.service';
import { DailyScheduleResourceService } from '../../etl-api/daily-scheduled-resource.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import * as Moment from 'moment';
import { Router, ActivatedRoute, ActivatedRouteSnapshot, Params } from '@angular/router';

@Component({
  selector: 'daily-schedule-appointments',
  templateUrl: './daily-schedule-appointments.component.html',
  styleUrls: ['./daily-schedule.component.css']
})

export class DailyScheduleAppointmentsComponent implements OnInit, OnDestroy {

  @Input() public selectedDate: any;
  public filter: any = {
     'programType': [],
     'visitType': [],
     'encounterType': []
  };
  public encodedParams: string =  encodeURI(JSON.stringify(this.filter));
  public params: any = {
    'programType': [],
    'visitType': [],
    'encounterType': []
  };
  public errors: any[] = [];
  public dailyAppointmentsPatientList: any[] = [];
  public loadingDailyAppointments: boolean = false;
  public dataLoaded: boolean = false;
  public dataAppLoaded: boolean = true;
  public selectedClinic: any;
  public nextStartIndex: number = 0;
  public fetchCount: number = 0;
  public busyIndicator: any = {
    busy: false,
    message: 'Please wait...' // default message
  };
  @Input() public tab: any;
  @Input()
  set options(value) {
    this._data.next(value);
  }
  get options() {
    return this._data.getValue();
  }
  private _data = new BehaviorSubject<any>([]);
  private currentClinicSubscription: Subscription;
  private selectedDateSubscription: Subscription;
  private appointmentSubscription: Subscription;
  constructor(private clinicDashboardCacheService: ClinicDashboardCacheService,
              private dailyScheduleResource: DailyScheduleResourceService,
              private route: ActivatedRoute) {
  }

  public ngOnInit() {
    console.log('Appointments on init');
    this.selectedDate = Moment().format('YYYY-MM-DD');

    this.currentClinicSubscription = this.clinicDashboardCacheService.getCurrentClinic()
      .subscribe((location) => {
        this.selectedClinic = location;

      });

    // get the current page url and params
    this.route
      .queryParams
      .subscribe((params) => {
        console.log('Params changed', params);
        if (params.programType) {
            this.initParams();
            this.params = params;
            let searchParams = this.getQueryParams();
            this.getDailyAppointments(searchParams);
        }
      });
  }

  public ngOnDestroy(): void {
    if (this.currentClinicSubscription) {
      this.currentClinicSubscription.unsubscribe();
    }
    if (this.selectedDateSubscription) {
      this.selectedDateSubscription.unsubscribe();
    }
    if (this.appointmentSubscription) {
      this.appointmentSubscription.unsubscribe();
    }

  }

  public getDailyAppointments(params) {
    this.setBusy();
    this.loadingDailyAppointments = true;
    this.clinicDashboardCacheService.setIsLoading(this.loadingDailyAppointments);

    let result = this.dailyScheduleResource.
      getDailyAppointments(params);
    if (result === null) {
      throw new Error('Null daily appointments observable');
    } else {
      this.appointmentSubscription = result.subscribe(
        (patientList) => {
          if (patientList) {
            this.dailyAppointmentsPatientList = patientList;
            this.dataLoaded = true;
          } else {
            this.dataLoaded = true;
          }
          this.loadingDailyAppointments = false;
          this.clinicDashboardCacheService.setIsLoading(this.loadingDailyAppointments);
          this.setFree();
        }
        ,
        (error) => {
          this.loadingDailyAppointments = false;
          this.clinicDashboardCacheService.setIsLoading(this.loadingDailyAppointments);

          this.errors.push({
            id: 'Daily Schedule Appointments',
            message: 'error fetching daily schedule appointments'
          });
        }
      );
    }
  }

  public loadMoreAppointments() {
    this.loadingDailyAppointments = true;
    this.clinicDashboardCacheService.setIsLoading(this.loadingDailyAppointments);
    let params = this.getQueryParams();
    this.getDailyAppointments(params);

  }

  private initParams() {
    this.loadingDailyAppointments = false;
    this.clinicDashboardCacheService.setIsLoading(this.loadingDailyAppointments);
    this.nextStartIndex = 0;
    this.dataLoaded = false;
    this.errors = [];
    this.dailyAppointmentsPatientList = [];
  }

  private getQueryParams() {
    let programType: any = [];
    let visitType: any = [];
    let encounterType: any = [];
    if (this.params.programType.length > 0) {
        programType = this.params.programType;
    }
    if (this.params.visitType && this.params.visitType.length > 0) {
      visitType = this.params.visitType;
    }
    if (this.params.encounterType && this.params.encounterType.length > 0) {
      encounterType = this.params.encounterType;
    }
    return {
      startDate: this.params.startDate,
      startIndex: this.nextStartIndex,
      locationUuids: this.selectedClinic,
      programType: programType,
      visitType: visitType,
      encounterType: encounterType,
      limit: 1000
    };

  }

  private setBusy() {

    this.busyIndicator = {
      busy: true,
      message: 'Please wait...Loading'
    };

  }
  private setFree() {

    this.busyIndicator = {
      busy: false,
      message: ''
    };

  }
}
