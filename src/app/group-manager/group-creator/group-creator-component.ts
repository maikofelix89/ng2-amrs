import { Component, OnInit } from '@angular/core';
import { CommunityGroupService } from '../../openmrs-api/community-group-resource.service';
import * as _ from 'lodash';
import * as Moment from 'moment';
import { Group } from '../group-model';
import { LocationResourceService } from '../../openmrs-api/location-resource.service';
import {ActivatedRoute, Router} from '@angular/router';
import { ProviderResourceService } from '../../openmrs-api/provider-resource.service';
@Component({
    selector: 'group-creator',
    templateUrl: './group-creator-component.html',
    styleUrls: ['./group-creator-component.css']
})
export class GroupCreatorComponent implements OnInit {

    public showGroupDialog = false;
    public provider: string;
    public selectedProviderUuid: string;
    public providers: any = [];
    public facilities: any = [];
    public groupNo: string;
    public groupName: string;
    public facility: any;
    public address: string;
    public groupTypes: any = [];
    public groupType: any;
    public groupPrograms: any = [];
    public groupProgram: any;
    public success = false;
    public message = '';
    constructor(private _groupService: CommunityGroupService,
                private _router: Router,
                private _route: ActivatedRoute,
                private _communityService: CommunityGroupService,
                private _providerResourceService: ProviderResourceService,
                private _locationSservice: LocationResourceService) { }

    ngOnInit(): void {
        console.log('Create group loaded....');
        this.allFacilities();
        this.getCohortTypes();
        this.getCohortPrograms();
    }

    public showCreateDolog() {
       this.showGroupDialog = true;
    }
    public allFacilities() {

        this._locationSservice.getLocations()
        .subscribe((result: any) => {
            console.log('Locations', result);
            this.facilities = result.map((location: any) => {
                return {
                     label : location.display,
                     value: location.uuid
                 };
            });
        });

    }
    public selectProvider(provider) {
        this.provider = provider.name;
        this.selectedProviderUuid = provider.uuid;
        this.providers = [];
    }
    public searchProvider(providerSearchTerm) {
        if (providerSearchTerm.length > 3) {
        this._providerResourceService
          .searchProvider(providerSearchTerm)
          .subscribe((results) => {
            if (results) {
               this.processProviders(results);
            }
          });
         }
        if (providerSearchTerm.length === 0 ) {
             this.selectedProviderUuid = '';
         }
     }

    public processProviders(providers) {

        const providersArray = [];
        _.each(providers, (provider: any) => {
           const providerPerson = provider.person;
           if (providerPerson !== null) {
             const specificProvider = {
                 'name': provider.display,
                 'uuid': provider.uuid
             };
             providersArray.push(specificProvider);
            }
        });
        this.providers = providersArray;
    }

    public selectFacility($event) {

    }

    public createGroup() {
        this.resetMessage();
        const payLoad = this.generatePayload();
        this._communityService.createCohort(payLoad)
        .subscribe((result) => {
            console.log('Create Cohort Result', result);
            this.message = 'Cohort Group has been Succesfully Created';
            this.success = true;
        },
        (error) => {
            this.message = 'Error creating cohort group, kindly try again';
            console.error('Error creating cohort', error);
            this.success = false;
        }
        );

    }
    public generatePayload() {
        const groupNo = this.groupNo;
        const address = this.address;
        const provider = this.provider;
        const payLoad = {
            name : this.groupName,
            description: '',
            location: this.facility.value,
            startDate: Moment().format('YYYY-MM-DD'),
            cohortType: this.groupType.value,
            cohortProgram: this.groupProgram.value,
            groupCohort: true
        };


        return payLoad;


    }

    public getCohortTypes() {

        this._communityService.getCohortTypes()
        .subscribe((results) => {
           console.log('CohortTypes', results);
           this.groupTypes = results.map((groupType: any) => {
            return {
                 label : groupType.name,
                 value: groupType.uuid
             };
        });
        });

    }

    public getCohortPrograms() {

        this._communityService.getCohortPrograms()
        .subscribe((results) => {
           console.log('CohortTypes', results);
           this.groupPrograms = results.map((groupProgram: any) => {
            return {
                 label : groupProgram.name,
                 value: groupProgram.uuid
             };
        });
        });

    }

    public selectGroupType($event) {

    }
    public selectGroupProgram($event) {
    }
    public resetMessage() {
        this.success = false;
        this.message = '';

    }
    public resetValues() {
        this.groupType = {};
        this.groupName = '';
        this.facility = {};
        this.groupNo = '';
        this.groupType = {};
        this.groupProgram = {};
        this.address = '';
        this.provider = '';
        this.success = false;
        this.message = '';

    }
}
