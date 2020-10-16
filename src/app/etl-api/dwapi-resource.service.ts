import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { AppSettingsService } from '../app-settings/app-settings.service';
import { DataCacheService } from '../shared/services/data-cache.service';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
@Injectable()
export class DwapiResourceService {
    constructor(protected http: HttpClient, protected appSettingsService: AppSettingsService,
                private cacheService: DataCacheService) { }


    public getUrl(): string {
        return this.appSettingsService.getEtlRestbaseurl().trim() + 'dwapi';

    }
    public getUrlRequestParams(params): HttpParams {
        let urlParams: HttpParams = new HttpParams();
        if (params.mflCodes && params.mflCodes.length > 0) {
            urlParams = urlParams.set('mflCodes', params.mflCodes);
        }
        if (params.extract && params.extract !== '') {
            urlParams = urlParams.set('extract', params.extract);
        }
        return urlParams;
    }
    public getMFLSites() {
            const url = this.getUrl() + '/mfl-sites';
            const urlParams: HttpParams = new HttpParams({});
            const request = this.http.get<any>(url, {
                params: urlParams
            }).pipe(
            map((response) => {
                return response;
            }));
            return this.cacheService.cacheRequest(url, urlParams, request);
    }

    public getDwapiReport(params) {
         console.log('getDwapiReport', params);
        if (!params) {
            return null;
        }
        const url = this.getUrl() + '/dwapi-report';
        const urlParams = this.getUrlRequestParams(params);
        const request = this.http.get<any>(url, {
            params: urlParams
        }).pipe(
        map((response) => {
            return response;
        }));
        return this.cacheService.cacheRequest(url, urlParams, request);

    }
    public setMflSite(params) {

        if (!params) {
            return null;
        }
        const url = this.getUrl() + '/set-mfl-site';
        const urlParams = this.getUrlRequestParams(params);
        const request = this.http.get<any>(url, {
            params: urlParams
        }).pipe(
        map((response) => {
            return response;
        }));
        return this.cacheService.cacheRequest(url, urlParams, request);

    }

    public restartMssqlService() {
        const url = 'https://ngx.ampath.or.ke/etl-mssql-manager/refresh-server';
        return this.http.get<any>(url, {
        }).pipe(
        map((response) => {
            return response;
        }));

    }
}
