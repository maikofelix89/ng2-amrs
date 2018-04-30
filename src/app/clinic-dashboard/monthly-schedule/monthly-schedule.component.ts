import { Component, OnDestroy, OnInit , Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute, Params } from '@angular/router';
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
import * as Moment from 'moment';
import { MonthlyScheduleResourceService } from '../../etl-api/monthly-scheduled-resource.service';
import { ClinicDashboardCacheService } from '../services/clinic-dashboard-cache.service';
import { AppFeatureAnalytics } from '../../shared/app-analytics/app-feature-analytics.service';
import * as _ from 'lodash';
import { PatientProgramResourceService } from './../../etl-api/patient-program-resource.service';
import { LocalStorageService } from './../../utils/local-storage.service';
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
export class MonthlyScheduleComponent implements OnInit, OnDestroy {
  public viewDate: Date = new Date();
  public view = 'month';
  public params: any = {
     'programType': [],
     'visitType': [],
     'encounterType': [],
     'startDate': ''
  };
  public events: CalendarEvent[] = [];
  public activeDayIsOpen: boolean = false;
  public location: string = '';
  public busy: Subscription;
  public fetchError = false;
  public programVisitsEncounters: any = [];
  public encounterTypes: any [];
  public trackEncounterTypes: any = [];
  public department: string = 'hiv';
  public busyIndicator: any = {
    busy: false,
    message: ''
  };

  private subscription: Subscription = new Subscription();

  constructor(private monthlyScheduleResourceService: MonthlyScheduleResourceService,
              private clinicDashboardCacheService: ClinicDashboardCacheService,
              private router: Router,
              private route: ActivatedRoute, private appFeatureAnalytics: AppFeatureAnalytics,
              private _localstorageService: LocalStorageService,
              private _patientProgramService: PatientProgramResourceService) {
  }

  public ngOnInit() {
    this.appFeatureAnalytics
      .trackEvent('Monthly Schedule', 'Monthly Schedule loaded', 'ngOnInit');
    let date = this.route.snapshot.queryParams['startDate'];
    if (date) {
      this.viewDate = new Date(date);
    }

    this.subscription = this.clinicDashboardCacheService.getCurrentClinic()
      .subscribe((location: string) => {
        this.location = location;
        // this.getAppointments();
      });
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public filterSelected($event) {
         this.params = $event;
         console.log('Monthly filter selected', $event);
         // this.encodedParams = encodeURI(JSON.stringify($event));
         this.getAppointments();
  }

  public getCurrentLocation() {
    // this.route.parent.params.subscribe(params => {
    //     this.location = params['location_uuid'];
    //  });

  }

  public navigateToMonth() {
    let date = Moment(this.viewDate).format('YYYY-MM-DD');
    this.viewDate = new Date(date);
    let currentParams = this.route.snapshot.queryParams;
    console.log('Current Params', currentParams);
    this.router.navigate(['./'], {
      queryParams: {date: date},
      queryParamsHandling: 'merge',
      relativeTo: this.route
    });
    // this.getAppointments();
  }

  public getAppointments() {
      console.log('Get Monthly Appointments', this.params.startDate);
      this.fetchError = false;
      this.viewDate = this.params.startDate;
      this.busy = this.monthlyScheduleResourceService.getMonthlySchedule({
      endDate: Moment(endOfMonth(this.params.startDate)).format('YYYY-MM-DD'),
      startDate: Moment(startOfMonth(this.params.startDate)).format('YYYY-MM-DD'),
      programType: this.params.programType,
      visitType: this.params.visitType,
      encounterType: this.params.encounterType,
      locationUuids: this.location, limit: 10000
    }).subscribe((results) => {
      console.log('Events', results);
      this.events = [];
      this.events = this.processEvents(results);
    }, (error) => {
      this.fetchError = true;
    });
  }

  public addBadgeTotal(day: CalendarMonthViewDay): void {
    day.badgeTotal = 0;
  }

  public navigateToDaily(event) {
    console.log('navigate to daily', event);
    let currentParams = this.params;
    currentParams.startDate = Moment(event.start).format('YYYY-MM-DD');
    switch (event.type) {
      case 'scheduled':
        this.router.navigate(['clinic-dashboard',
            this.location, 'daily-schedule', 'daily-appointments'],
          {queryParams: currentParams});
        break;
      case 'attended':
        this.router.navigate(['clinic-dashboard',
            this.location, 'daily-schedule', 'daily-visits'],
          {queryParams: currentParams});
        break;
      case 'has_not_returned':
        this.router.navigate(['clinic-dashboard',
            this.location, 'daily-schedule', 'daily-not-returned'],
          {queryParams: currentParams});
        break;
      default:
    }
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
    console.log('Processed', processed);
    return processed;
  }

  public dayClicked({date, events}: {date: Date, events: CalendarEvent[]}): void {

  }
  public getSelectedDate($event) {
    console.log('Event', $event);
  }

}
