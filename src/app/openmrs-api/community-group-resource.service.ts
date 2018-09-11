import { Injectable } from '@angular/core';
import { Http, URLSearchParams ,  RequestOptions, Headers} from '@angular/http';
import { AppSettingsService } from '../app-settings/app-settings.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class CommunityGroupService {

    public v = 'full';
    constructor(private http: Http, private _appSettingsService: AppSettingsService) {

    }

    public getOpenMrsBaseUrl(): string {
        return this._appSettingsService.getOpenmrsRestbaseurl() + 'cohortm';
    }

    public getCohort(searchString: string) {
        const regex = new RegExp(/^\d+$/);
        if (regex.test(searchString)) {
            return this.getCohortByGroupNumber(searchString);
        } else {
            return this.getCohortByName(searchString);
        }

    }

    public getCohortByGroupNumber(groupNumber: string): Observable<any> {
        const params = new URLSearchParams();
        params.set('attributes', `"groupNumber":"${groupNumber}"`);
        params.set('v', this.v);
        const url = this.getOpenMrsBaseUrl() + '/cohort';
        return this.http.get(url, {
            search: params
        })
        .pipe(
            map((response) => response.json().results),
            catchError((error) => 'An error occurred ' + error)
        );
    }

    public getCohortByName(name: string): Observable<any> {
        const params = new URLSearchParams();
        params.set('v', this.v);
        params.set('q', name);
        return this.http.get(this.getOpenMrsBaseUrl() + '/cohort', {
            search: params
        }).pipe(
            map((response) => response.json().results),
            catchError((error) => 'An error occurred ' + error)
        );
    }

  public getCohortByUuid(groupUuid: string): Observable<any> {
      const url = this.getOpenMrsBaseUrl() + '/cohort' + `/${groupUuid}`;
      return this.http.get(url).pipe(
        map((response) => response.json()),
        catchError((error) => 'An error occurred ' + error)
      );
    }

  public getCohortTypes(): Observable<any> {
    const params = new URLSearchParams();
    params.set('v', this.v);
    const url = this.getOpenMrsBaseUrl() + '/cohorttype';
    return this.http.get(url, {
        search: params
    }).pipe(map((response) => {
        return response.json().results;
    }));

  }

  public getCohortPrograms() {
    const params = new URLSearchParams();
    params.set('v', this.v);
    const url = this.getOpenMrsBaseUrl() + '/cohortprogram';
    return this.http.get(url, {
        search: params
    }).pipe(map((response) => {
        return response.json().results;
    }));

  }

  public createCohort(payload) {

    if (!payload) {
        return null;
    }

    const params = new URLSearchParams();
    params.set('v', this.v);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers });
    const url = this.getOpenMrsBaseUrl() + '/cohort';
    return this.http.post(url, JSON.stringify(payload), options).pipe(
        map((response: Response) => {
            return response.json();
        }));

  }
}
