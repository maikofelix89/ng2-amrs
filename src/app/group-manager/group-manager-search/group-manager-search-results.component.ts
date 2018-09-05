import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { Group } from '../group-model';
@Component({
    selector: 'group-manager-search-results',
    templateUrl: './group-manager-search-results.component.html',
    styleUrls: ['./group-manager-search-results.component.css']
})
export class GroupManagerSearchResultsComponent implements OnInit {
    public _groups: Group[];

    @Input() set groups(groups: Group[]) {
        this._groups = groups;
    }

    @Output() groupSelected: EventEmitter<string> = new EventEmitter();

    constructor() { }
    ngOnInit(): void { }
    public selectGroup(groupUuid: string) {
        this.groupSelected.emit(groupUuid);
    }
}
