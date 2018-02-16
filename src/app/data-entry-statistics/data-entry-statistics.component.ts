import { Component,
    OnInit , OnDestroy , AfterViewInit,
    Output , EventEmitter, Input , ChangeDetectorRef,
    ViewChild } from '@angular/core';

@Component({
  selector: 'data-entry-statistics',
  templateUrl: './data-entry-statistics.component.html',
  styleUrls: ['./data-entry-statistics.component.css']
})
export class DataEntryStatisticsComponent implements OnInit, OnDestroy , AfterViewInit {

  public statsDropdownSettings: any = {
    'singleSelection': true,
    'text': 'Select or enter to search',
    'selectAllText': 'Select All',
    'unSelectAllText': 'UnSelect All',
    'enableSearchFilter': true
  };

  public views: any = [
      { 'id': 1 , 'itemName': 'Encounter Types per Day'},
      { 'id': 2 , 'itemName': 'Encounter Types per Month'},
      { 'id': 3 , 'itemName': 'Encounter Types per Provider'},
      { 'id': 4 , 'itemName': 'Encounter Types per Creator'}
  ];

  public view: any = [];

  constructor( private _cd: ChangeDetectorRef) {
  }

  public ngOnInit() {
  }

  public ngOnDestroy() {

  }

  public ngAfterViewInit(): void {
   this._cd.detectChanges();
  }

  public selectView($event) {
     console.log('Select View', $event);
  }

  public viewDeselect($event) {
      console.log('Deselect Event', $event);
  }
}
