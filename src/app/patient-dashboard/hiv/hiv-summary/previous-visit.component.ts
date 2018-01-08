import { Component, OnInit,  OnDestroy } from '@angular/core';
import { PatientService } from '../../services/patient.service';
import { FormSchemaService } from '../../common/formentry/form-schema.service';
import { EncounterResourceService } from '../../../openmrs-api/encounter-resource.service';
import { VisitResourceService } from '../../../openmrs-api/visit-resource.service';
import { FormFactory, Form, EncounterAdapter } from 'ng2-openmrs-formentry';
import { Patient } from '../../../models/patient.model';
import { Encounter } from '../../../models/encounter.model';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';
@Component({
    selector: 'previous-visit-details',
    templateUrl: './previous-visit.component.html',
    styles: [`.glyphicon{ cursor : pointer;}
              .glyphicon:hover, .active{ color: #337ab7}
              #encounter{ border: 1px solid lightgray;}`]
})

export class PreviousVisitComponent implements OnInit, OnDestroy {
    public patient: Patient;
    public patientUuid: any;
    public selectedEncounter: any = {};
    public subscription: Subscription;
    public form: Form;
    public errors: any = [];
    public encounters: Encounter[];
    public lastVisit;
    public busy: Subscription;
    public errorMessage: string;
    public error: boolean;
    constructor(private patientService: PatientService,
                private encounterResourceService: EncounterResourceService,
                private visitResourceService: VisitResourceService,
                private formFactory: FormFactory,
                private encAdapter: EncounterAdapter,
                private formSchemaService: FormSchemaService) { }

    public ngOnInit() {
        this.getPatient();
    }

    public ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.busy) {
            this.busy.unsubscribe();
        }
    }

    public getPatient() {
        this.subscription = this.patientService.currentlyLoadedPatient.subscribe(
            (patient) => {
                if (patient) {
                    this.patient = patient;
                    this.patientUuid = this.patient.person.uuid;
                    this.getLastVisitEncounters(this.patientUuid);
                }
            }, (err) => {
                this.errors.push({
                    id: 'patient',
                    message: 'error fetching patient'
                });
            });
    }

    public getLastVisitEncounters(patientUuid: any) {
        const searchParams = 'custom:(uuid,encounters)';
        this.visitResourceService
        .getPatientVisits({patientUuid: patientUuid, v: searchParams})
        .subscribe((visits) => {
            _.forEachRight(visits, (visit) => {
                console.log(visits);
                if (visit.encounters.length > 0) { this.lastVisit = visit; return false; }});
            if (this.lastVisit) {
                this.error = false;
                this.encounters = this.lastVisit.encounters;
            } else {
                this.error = true;
                this.errorMessage = 'Last Visit had 0 encounters';
            }
        });
    }

    public displayEncounterObs(encounterUuid: string) {
        if (this.selectedEncounter) {
            if (encounterUuid === this.selectedEncounter.uuid) {return; }
        }
        this.encounterResourceService.getEncounterByUuid(encounterUuid)
        .flatMap((encounter) => {
            this.selectedEncounter = encounter;
            return this.formSchemaService.getFormSchemaByUuid(encounter.form.uuid);
        })
        .subscribe((compiledSchema) => {
            let unpopulatedform = this.formFactory.createForm(compiledSchema);
            this.encAdapter.populateForm(unpopulatedform, this.selectedEncounter);
            this.form = unpopulatedform;
        });
    }
}
