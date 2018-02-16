import { Component,
    OnInit , OnDestroy , AfterViewInit,
    Output , EventEmitter, Input , ChangeDetectorRef,
    ViewChild } from '@angular/core';
import * as Moment from 'moment';

@Component({
  selector: 'encounter-creator-filter',
  templateUrl: './encounter-type-creator-filter.component.html'
})
export class EncounterTypeCreatorFilterComponent implements OnInit, OnDestroy , AfterViewInit {

  public locationDropdownSettings: any = {
    'singleSelection': false,
    'text': 'Select or enter to search',
    'selectAllText': 'Select All',
    'unSelectAllText': 'UnSelect All',
    'enableSearchFilter': true
  };

  public locations: any = [
      { 'id': 1 , 'itemName': 'Encounter Types per Day'},
      { 'id': 2 , 'itemName': 'Encounter Types per Month'},
      { 'id': 3 , 'itemName': 'Encounter Types per Provider'},
      { 'id': 4 , 'itemName': 'Encounter Types per Creator'}
  ];

  public location: any = [];

  public selectedStartDate: string = Moment().format('DD-MMM-YYYY');
  public selectedEndDate: string = '';

  public creators: any [];
  public creatorr: any = [];
  public encounterType: any = [];
  public encounterTypes: any = [];
  public form: any = [];
  public forms: any = [];
  public title: string = 'Encounters Per Type Per Creator';

  constructor( private _cd: ChangeDetectorRef) {
  }

  public ngOnInit() {
    console.log('Load Encounter Type Creator Component');
  }

  public ngOnDestroy() {

  }

  public ngAfterViewInit(): void {
   this._cd.detectChanges();
  }

  public locationSelect($event) {
     console.log('Select View', $event);
  }

  public locationDeselect($event) {
      console.log('Deselect Event', $event);
  }
  public getSelectedStartDate($event) {
    console.log('Selected Start Date', $event);

  }

  public getSelectedEndDate($event) {
    console.log('Selected End Date', $event);

  }
  public encounterTypeSelect($event) {
    console.log('Selected Encounter Type', $event);

  }
  public encounterTypeDeselect($event) {
    console.log('Deselect Encounter Type', $event);
  }
  public formSelect($event) {
    console.log('Form selected', $event);

  }
  public formDeselect($event) {
    console.log('Deselected Form', $event);

  }
}
