import { LocalStorageService } from './../../utils/local-storage.service';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ClinicDashboardCacheService } from '../services/clinic-dashboard-cache.service';
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
  public params: any =  {
    'programType': '',
    'visitType': '',
    'encounterType': '',
    'startDate': Moment().format('YYYY-MM-DD')
  };
  public errors: any[] = [];
  public dailyAppointmentsPatientList: any[] = [];
  public loadingDailyAppointments: boolean = false;
  public dataLoaded: boolean = false;
  public dataAppLoaded: boolean = true;
  public selectedClinic: any;
  public nextStartIndex: number = 0;
  public fetchCount: number = 0;
  public busy: Subscription;
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
              private localStorageService: LocalStorageService,
              private route: ActivatedRoute) {
  }

  public ngOnInit() {
    this.selectedDate = Moment().format('YYYY-MM-DD');
    this.currentClinicSubscription = this.clinicDashboardCacheService.getCurrentClinic()
      .subscribe((location) => {
        this.selectedClinic = location;
      });

    // get the current page url and params
    this.route
      .queryParams
      .subscribe((params) => {
        console.log('subscribe params', params);
        if (params.startDate) {
            this.params = params;
            console.log('Appontments Params', params);
        }
        let searchParams = this.getQueryParams();
        console.log('getDailyAppointments');
        this.getDailyAppointments(searchParams);
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
    console.log('getDailyAppointments Params', params);
    this.loadingDailyAppointments = true;
    this.clinicDashboardCacheService.setIsLoading(this.loadingDailyAppointments);

    let result = this.dailyScheduleResource.
      getDailyAppointments(params);
    if (result === null) {
      throw new Error('Null daily appointments observable');
    } else {
      this.appointmentSubscription = result.subscribe(
        (patientList) => {
          if (patientList.length > 0) {
            this.dailyAppointmentsPatientList = this.dailyAppointmentsPatientList.concat(
              patientList);
            let size: number = patientList.length;
            this.nextStartIndex = this.nextStartIndex + size;
          } else {
            this.dataLoaded = true;
          }
          this.loadingDailyAppointments = false;
          this.clinicDashboardCacheService.setIsLoading(this.loadingDailyAppointments);

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
    console.log('getDailyAppointments');
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
    console.log('Getquery params', this.params);
    return {
      startDate: this.params.startDate,
      startIndex: this.nextStartIndex,
      locationUuids: this.selectedClinic,
      programType: this.params.programType,
      visitType: this.params.visitType,
      encounterType: this.params.encounterType,
      limit: undefined
    };

  }
}
