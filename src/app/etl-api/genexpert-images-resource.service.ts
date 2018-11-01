
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AppSettingsService } from '../app-settings/app-settings.service';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class GeneXpertResourceService {

  constructor(protected http: HttpClient, protected appSettingsService: AppSettingsService) { }

  public getUrl(): string {

    return this.appSettingsService.getEtlRestbaseurl().trim() + 'patient';
  }

  public getImages(patientUuid): Observable<any> {
    let url = this.getUrl();
    url += '/' + patientUuid + '/genexpert-images';

    let params: HttpParams = new HttpParams() 
    return this.http.get<any>(url, {
      params: params
    }).pipe(
      map((response) => {
        return response.results.results;
      }));
  }
}
