import { Component, OnDestroy, OnInit , Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { DatePipe } from '@angular/common';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarMonthViewDay
} from 'angular-calendar';
import {
  startOfDay, endOfDay, subDays, addDays, endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
  startOfMonth
} from 'date-fns';
import { IMyOptions, IMyDateModel } from 'ngx-mydatepicker';
import * as Moment from 'moment';
import { MonthlyScheduleResourceService } from '../../etl-api/monthly-scheduled-resource.service';
import { ClinicDashboardCacheService }
  from '../../clinic-dashboard/services/clinic-dashboard-cache.service';
import { AppFeatureAnalytics } from '../../shared/app-analytics/app-feature-analytics.service';
import * as _ from 'lodash';
import { PatientProgramResourceService } from '../../etl-api/patient-program-resource.service';
import { LocalStorageService } from '../../utils/local-storage.service';
const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#F0AD4E',
    secondary: '#FDF1BA'
  },
  green: {
    primary: '#5CB85C',
    secondary: '#FDF1BA'
  }
};
@Component({
  selector: 'app-monthly-schedule',
  templateUrl: './monthly-schedule.component.html',
  styleUrls: ['./monthly-schedule.component.css']
})
export class MonthlyScheduleBaseComponent implements OnInit, OnDestroy {
  public viewDate = Moment().format('MMMM YYYY');
  public view = 'month';
  public filter: any = {
     'programType': [],
     'visitType': [],
     'encounterType': []
  };
  public busyIndicator: any = {
    busy: false,
    message: 'Please wait...' // default message
  };
  public params: any;
  public events: CalendarEvent[] = [];
  public activeDayIsOpen: boolean = false;
  public location: string = '';
  public busy: Subscription;
  public fetchError = false;
  public programVisitsEncounters: any = [];
  public encounterTypes: any [];
  public monthControl: boolean = true;
  public trackEncounterTypes: any = [];
  public subscription: Subscription = new Subscription();
  private _datePipe: DatePipe;

  constructor(public monthlyScheduleResourceService: MonthlyScheduleResourceService,
              public clinicDashboardCacheService: ClinicDashboardCacheService,
              public router: Router,
              public _route: ActivatedRoute,
              public appFeatureAnalytics: AppFeatureAnalytics,
              public _localstorageService: LocalStorageService,
              public _patientProgramService: PatientProgramResourceService) {
  }

  public ngOnInit() {
    this.getCurrentLocation();
    console.log('monthly on init');
    // this.getAppointments();
  }

  public getParams() {

  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public filterSelected($event) {
         // this.filter = $event;
         console.log('Event selected', $event);
         this.getCurrentLocation();
         this.params = $event;
         this.getAppointments();
  }

  public getCurrentLocation() {
    this.clinicDashboardCacheService.getCurrentClinic().subscribe((location) => {
      this.location = location;
      console.log('location', location);
    });
  }

  public navigateToMonth() {
    let date = this.viewDate;
    this.viewDate = Moment().format('YYYY-MM');
    this.router.navigate(['./'], {
      queryParams: {date: date},
      relativeTo: this._route
    });
    this.getAppointments();
  }

  public getAppointments() {
      this.fetchError = false;
      this.setBusy();
      this.viewDate = Moment(this.params.startDate, 'YYYY-MM-DD').format('MMMM YYYY');
      this.monthlyScheduleResourceService.getMonthlySchedule({
      endDate: this.params.endDate,
      startDate: this.params.startDate,
      programType: this.params.programType,
      visitType: this.params.visitType,
      encounterType: this.params.encounterType,
      locationUuids: this.location, limit: 10000
    }).subscribe((results) => {
      console.log('Results', results);
      this.events = this.processEvents(results);
      this.setFree();
    }, (error) => {
      this.fetchError = true;
      this.setFree();
    });
  }

  public addBadgeTotal(day: CalendarMonthViewDay): void {
    day.badgeTotal = 0;
  }

  public navigateToDaily(event) {
    const currentQueryParams: any = this._route.snapshot.queryParams;
    const endDate = Moment(event.start).format('YYYY-MM-DD');
    const newQueryParams = Object.assign({endDate: endDate}, currentQueryParams);
    let link = '';

    switch (event.type) {
      case 'scheduled':
        link = 'daily-appointments';
        break;
      case 'attended':
        link = 'daily-visits';
        break;
      case 'has_not_returned':
        link = 'daily-not-returned';
        break;
      default:
    }

    this.router.navigate(['../daily-schedule/' + link],
          {
            queryParams: newQueryParams,
            relativeTo : this._route
          });
  }

  public processEvents(results) {
    let processed = [];
    for (let e of results) {
      /* tslint:disable forin*/
      for (let key in e.count) {

        switch (key) {
          case 'scheduled':
            processed.push({
              start: new Date(e.date),
              type: 'scheduled',
              title: e.count[key],
              color: colors.blue,
              class: 'label label-info'
            });
            break;
          case 'attended':
            processed.push({
              start: new Date(e.date),
              title: e.count[key],
              color: colors.green,
              type: 'attended',
              class: 'label label-success'
            });
            break;
          case 'has_not_returned':
            if (e.count[key] > 0) {
              processed.push({
                start: new Date(e.date),
                title: e.count[key],
                color: colors.yellow,
                type: 'has_not_returned',
                class: 'label label-warning'
              });
            }
            break;
          default:
        }

      }
      /* tslint:enable */
    }
    return processed;
  }

  public dayClicked({date, events}: {date: Date, events: CalendarEvent[]}): void {

  }

  public dateChanged(event) {
    this.viewDate = event;
    this.navigateToMonth();
  }

  public setBusy() {

    this.busyIndicator = {
      busy: true,
      message: 'Please wait...Loading'
    };

  }
  public setFree() {

    this.busyIndicator = {
      busy: false,
      message: ''
    };

  }
}
