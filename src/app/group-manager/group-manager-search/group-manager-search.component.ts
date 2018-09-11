import { Component, OnInit } from '@angular/core';
import { CommunityGroupService } from '../../openmrs-api/community-group-resource.service';
import * as _ from 'lodash';
import { Group } from '../group-model';
import {ActivatedRoute, Router} from '@angular/router';
@Component({
    selector: 'group-manager-search',
    templateUrl: './group-manager-search.component.html',
    styleUrls: ['./group-manager-search.component.css']
})
export class GroupManagerSearchComponent implements OnInit {

    public searchString = '';
    public lastSearchString = '';
    public isLoading = false;
    public searchResults: Group[];
    public noMatchingResults = false;
    public hideResults: boolean;
    public totalGroups: number;
    public errorMessage: String;
    public showGroupDialog = false;
    constructor(private groupService: CommunityGroupService,
                private router: Router,
                private route: ActivatedRoute) { }

    ngOnInit(): void { }

    public searchGroup() {
        this.isLoading = true;
        this.lastSearchString = this.searchString;
        if (!_.isEmpty(this.errorMessage)) {
            this.errorMessage = '';
        }
        this.groupService.getCohort(this.searchString).subscribe((res) => {
            if (typeof res !== 'string') {
            this.searchResults = res;
            this.totalGroups = this.searchResults.length;
            this.isLoading = false;
            } else {
                this.errorMessage = 'An error occurred.';
            }
        },
    (error) => {
        this.isLoading = false;
        this.errorMessage = error;
    });

    }

    public resetSearchList() {
        this.hideResults = true;
        this.searchString = '';
        this.totalGroups = 0;
        this.isLoading = false;
    }

    public onGroupSelected(groupUuid: string) {
        this.router.navigate(['../group', groupUuid], {relativeTo: this.route});
    }
    public navigateToCreateGroup() {
        this.router.navigate(['../create-group'], {
            relativeTo: this.route
        });
    }
}
