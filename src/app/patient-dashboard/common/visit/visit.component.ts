import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import * as Moment from 'moment';
import * as _ from 'lodash';
import { VisitResourceService } from '../../../openmrs-api/visit-resource.service';
import { EncounterResourceService } from '../../../openmrs-api/encounter-resource.service';
import { PatientService } from '../../services/patient.service';
import {
    UserDefaultPropertiesService
} from '../../../user-default-properties/user-default-properties.service';
import { Subscription, Observable } from 'rxjs';
import { AppFeatureAnalytics } from '../../../shared/app-analytics/app-feature-analytics.service';
@Component({
    selector: 'visit',
    templateUrl: './visit.component.html',
    styleUrls: ['./visit.component.css']
})
export class VisitComponent implements OnInit, OnDestroy {
    public visitTypes = [];
    public excludedForms = [];
    public visit: any;
    public visitWithNoEncounters: boolean = true;
    public patient: any;
    public subscription: Subscription;
    public errors: any = [];
    public loadingVisitTypes: boolean;
    public confirmCancel: boolean;
    public confirmEndVisit: boolean;
    public showDialog: boolean = false;
    public visitBusy: boolean;
    public iseditLocation: boolean = false;
    public programVisitConfig: any[] = require('./program-visits-config.json');
    public mainFilterType: string = '';
    public visitTypeList: any = [];
    public formList: any = [];
    public encounterTypeList: any = [];
    public secondFilters: any = [];
    public selectedFilterArray: any = [];
    public showVisitResults: boolean = false;
    public showFormResults: boolean = false;
    public visitTypeResult: any = [];
    public formTypeResult: any = [];
    constructor(
        private visitResourceService: VisitResourceService,
        private userDefaultPropertiesService: UserDefaultPropertiesService,
        private patientService: PatientService, private router: Router,
        private appFeatureAnalytics: AppFeatureAnalytics,
        private route: ActivatedRoute,
        private encounterResourceService: EncounterResourceService) { }

    public ngOnInit() {
        this.getPatient();
        this.getSecondaryFilters();
        // app feature analytics
        this.appFeatureAnalytics
            .trackEvent('Patient Dashboard', 'Patient Visits Loaded', 'ngOnInit');
        console.log('Program Visits Config', this.programVisitConfig);
    }

    public ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
    public locationChanges(edit) {
        this.iseditLocation = edit;
    }
    public getVisit(patientUuid) {
        this.visitBusy = true;
        this.visitResourceService.getPatientVisits({ patientUuid: patientUuid })
            .map(this.getLastVisit)
            .subscribe((visit) => {
                console.log(JSON.stringify(visit));
                this.visitBusy = false;
                if (visit) {
                    this.visit = visit;
                    console.log('Visit', visit);
                    if (visit.encounters && visit.encounters.length > 0) {
                        this.visitWithNoEncounters = false;
                    }
                    this.excludedForms = visit.encounters.map((a) => {
                        return a.encounterType.uuid;
                    });
                } else {
                    this.getVisitTypes();
                }
            }, (err) => {
                this.visitBusy = false;
                this.errors.push({
                    id: 'visit',
                    message: 'error fetching visit'
                });
            });
    }

    public getPatient() {
        this.subscription = this.patientService.currentlyLoadedPatient.subscribe(
            (patient) => {
                if (patient !== null) {
                    this.patient = patient;
                    this.getVisit(patient.person.uuid);
                }
            }
            , (err) => {
                this.errors.push({
                    id: 'patient',
                    message: 'error fetching patient'
                });
            });
    }

    public getVisitTypes() {
        this.loadingVisitTypes = true;
        this.visitResourceService.getVisitTypes({}).subscribe(
            (visitTypes) => {
                // Hotfix: This will patch version 2.3.0 in readiness for the  release of 2.4.x
                this.visitTypes = [
                    {
                        uuid: '77b6e076-e866-46cf-9959-4a3703dba3fc',
                        display: 'INITIAL HIV CLINIC VISIT'
                    },
                    {
                        uuid: 'd4ac2aa5-2899-42fb-b08a-d40161815b48',
                        display: 'RETURN HIV CLINIC VISIT'
                    }
                ];
                this.loadingVisitTypes = false;
            }
            , (err) => {
                this.loadingVisitTypes = false;
                this.errors.push({
                    id: 'visitTypes',
                    message: 'error fetching visit types'
                });
            });
    }

    public editLocation() {
        this.iseditLocation = !this.iseditLocation;

    }
    public startVisit(visitTypeUuid) {
        let location = this.userDefaultPropertiesService.getCurrentUserDefaultLocationObject();
        this.visitBusy = true;
        let visitPayload = {
            patient: this.patient.person.uuid,
            location: location.uuid,
            startDatetime: new Date(),
            visitType: visitTypeUuid
        };
        this.visitResourceService.saveVisit(visitPayload).subscribe((response) => {
            this.visitBusy = false;
            this.visit = response;
        }, (err) => {
            this.visitBusy = false;
            console.log(err);
            this.errors.push({
                id: 'startVisit',
                message: 'error stating visit'
            });
        });

    }

    public endVisit() {
        this.showDialog = true;
        this.confirmEndVisit = true;
    }

    public cancelVisit() {
        this.showDialog = true;
        this.confirmCancel = true;
    }

    public onYes() {
        if (this.confirmCancel) {
            this.onCancelVisit();
        } else if (this.confirmEndVisit) {
            this.onEndVisit();
        }
    }

    public onNo() {
        this.showDialog = false;
        this.confirmCancel = false;
        this.confirmEndVisit = false;
    }

    public onEndVisit() {

        this.visitBusy = true;
        this.visitResourceService.updateVisit(this.visit.uuid,
            { stopDatetime: new Date() }).subscribe(
            (visit) => {
                this.visitBusy = false;
                this.showDialog = false;
                this.confirmEndVisit = false;
                this.visit = null;
                this.getVisit(this.patient.person.uuid);
            }
            , (err) => {
                this.visitBusy = false;
                this.showDialog = false;
                this.confirmEndVisit = false;
                this.errors.push({
                    id: 'endVisit',
                    message: 'error ending visit'
                });
            });
    }

    public onCancelVisit() {
        this.visitBusy = true;

        if (!this.visit) {
            return null;
        }

        this.visitResourceService.updateVisit(this.visit.uuid,
            { voided: true }).subscribe(
            (visit) => {
                this.voidVisitEncounters(this.visit.uuid);
                this.visit = null;
                this.getVisit(this.patient.person.uuid);
                this.visitBusy = false;
                this.showDialog = false;
                this.confirmCancel = false;
            }
            , (err) => {
                this.visitBusy = false;
                this.showDialog = false;
                this.confirmCancel = false;
                this.errors.push({
                    id: 'cancelVisit',
                    message: 'error cancelling visit'
                });
            });
    }
    public formSelected(form) {
        if (form) {
            this.router.navigate(['../formentry', form.uuid],
                {
                    relativeTo: this.route,
                    queryParams: { visitUuid: this.visit.uuid }
                });
        }
    }
    public encounterSelected(encounter) {
        if (encounter) {
            this.router.navigate(['../formentry', encounter.form.uuid], {
                relativeTo: this.route,
                queryParams: { encounter: encounter.uuid }
            });
        }
    }

    public selectMainFilter($event) {
        console.log($event);
        let mainFilter = $event.target.value;

        if (mainFilter === 'visitType') {
            this.secondFilters = _.uniq(this.visitTypeList);
            this.showVisitResults = true;
            this.showFormResults = false;
        } else if (mainFilter === 'form') {
            this.secondFilters = _.uniq(this.formList);
            this.showFormResults = true;
            this.showVisitResults = false;
        } else {
            this.secondFilters = [];
        }

        this.selectedFilterArray = [];

    }

    public selectSecondaryFilter(secondaryFilter) {

        console.log('Selected Secondary', secondaryFilter);

        if ( secondaryFilter === 'all') {
            /*  if one has selected all as the second filter
                then load the selected filter array with all
                the options
            */
            console.log('Select all in secondary filter');
            let secondFilters = _.uniq(this.secondFilters);
            this.selectedFilterArray = secondFilters;

        }else {

             let secondFilter = secondaryFilter;
             console.log('Secondary filter', secondaryFilter);
             this.selectedFilterArray.push(secondFilter);

        }

        this.getResultData();

    }

    public orderFilterByAlphabetAsc(filter) {

         filter.sort((a: any, b: any) => {
                if (a.name < b.name) {
                    return -1;
                } else if (a.name > b.name) {
                    return 1;
                } else {
                    return 0;
                }
                });
         return filter;

    }

    public removeFilterItem(i) {
        this.selectedFilterArray.splice(i, 1);
        this.getResultData();
    }
    public clearSelectedFilter() {
        this.selectedFilterArray = [];
        this.getResultData();
    }

    private getLastVisit(visits: any[]) {
        let filtered = visits.filter((visit) => {
            let today = Moment().format('l');
            let visitDate = Moment(visit.startDatetime).format('l');
            return today === visitDate;
        });
        return filtered[0];
    }

    private voidVisitEncounters(visitUuid) {
        if (!visitUuid) {
            return null;
        }
        this.visitResourceService.getVisitEncounters(visitUuid).subscribe(
            (visitEncounters) => {
                if (visitEncounters && visitEncounters.length > 0) {
                    let observableBatch: Array<Observable<any>> = [];
                    for (let encounter of visitEncounters) {
                        observableBatch.push(
                            this.encounterResourceService.voidEncounter(encounter.uuid)
                        );
                    }

                    // forkjoin all requests
                    this.subscription = Observable.forkJoin(
                        observableBatch
                    ).subscribe(
                        (data) => {
                            console.log('Voided Encounters');
                        },
                        (err) => {
                            this.errors.push({
                                id: 'cancelVisit',
                                message: 'error voiding visit encounters'
                            });
                        }
                        );
                }
            }
            , (err) => {
                this.errors.push({
                    id: 'cancelVisit',
                    message: 'error voiding visit encounters'
                });
            });
    }

    private getSecondaryFilters() {

        let programVisitConfig = this.programVisitConfig;
        let visitTrackArray = [];
        let formTrackArray = [];

        console.log('ProgramConf', programVisitConfig);

        _.each(programVisitConfig, (program: any) => {
            console.log('Program', program);
            let visitTypes = program.visitTypes;

            _.each(visitTypes, (visitType: any) => {

                let encounterTypes = visitType.encounterTypes;
                console.log('Visit Type', visitType);
                if ( _.includes(visitTrackArray , visitType.uuid ) === false) {

                    this.visitTypeList.push({
                        'uuid': visitType.uuid,
                        'name': visitType.name

                    });

                    visitTrackArray.push(visitType.uuid);

                }
                _.each(encounterTypes, (encounterType: any) => {
                    console.log('Encounter Type', encounterType);

                    console.log('Contains Similar visit Type ' ,
                     _.includes(this.formList , encounterType.uuid));

                    if (_.includes(formTrackArray, encounterType.uuid )  === false) {

                        this.formList.push({
                            'uuid': encounterType.uuid,
                            'name': encounterType.display

                        });

                        formTrackArray.push(encounterType.uuid);

                    }
                });
            });

            this.orderFilterByAlphabetAsc(this.visitTypeList);
            this.orderFilterByAlphabetAsc(this.formList);
        });

    }

    private getResultData() {

        let programsVisitConf = this.programVisitConfig;
        let selectedFilterArray = this.selectedFilterArray;
        this.visitTypeResult = [];
        this.formTypeResult = [];
        let formResult  = [];
        let mainFilter = this.mainFilterType;
        let formTrackArray = [];

        _.each(selectedFilterArray, (filterItem: any) => {
            let uuid = filterItem.uuid;
            console.log('Filter Item', filterItem);
            console.log('Filter Item Type', typeof filterItem);
            _.each(programsVisitConf, (visitProgram: any) => {
                let program = visitProgram.name;
                let visitTypes = visitProgram.visitTypes;
                _.each(visitTypes, (visitType: any) => {
                    // console.log('Visit Type Name', visitType.name);
                    // console.log('Visit Type', typeof visitType.name);
                    let visitUuid = visitType.uuid;
                    let visitTypeName = visitType.name;
                    let allowedIf = visitType.allowedIf;
                    let reason = visitType.reason;
                    let encounterTypes = visitType.encounterTypes;
                    if (mainFilter === 'visitType') {

                        if (uuid === visitUuid) {
                            console.log('Visit Type Matches');
                            this.visitTypeResult.push({
                                        'program': program,
                                        'visitType': visitTypeName,
                                        'encounterType': encounterTypes,
                                        'condition': reason
                                    });

                        }

                    }

                    if (mainFilter === 'form') {

                           console.log('Form selected');
                           // loop through encounters
                           _.each(encounterTypes, (encounterType: any) => {
                                let encounterUuid = encounterType.uuid;
                                let encounterName = encounterType.display;

                                console.log('Form Result', formResult);

                                if (_.includes(formTrackArray , encounterUuid) === false) {
                                      console.log('Does not contain encounter uuid');
                                      if (encounterUuid === uuid) {

                                            this.formTypeResult.push({
                                                'form': encounterName,
                                                'formUuid': encounterUuid,
                                                'program': program,
                                                'visitType': [visitTypeName],
                                                'condition': reason
                                            });

                                            formTrackArray.push(encounterUuid);

                                      }

                                 } else {

                                     console.log('Contains encounter uuid');

                                     _.each(this.formTypeResult, (form: any , index) => {
                                             let formUuid = form.formUuid;
                                             if (formUuid === uuid) {

                                                   form.visitType.push(visitTypeName);

                                             }
                                     });

                            }

                           });

                    }

                });
            });
        });

    }

}
