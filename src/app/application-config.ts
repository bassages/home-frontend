import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface ApplicationConfig {
  dashboardClimateEnabled: boolean;
  dashboardGasEnabled: boolean;
}

@Injectable()
export class ApplicationConfigService {
  constructor(private readonly http: HttpClient) { }

  public getConfig(): Observable<ApplicationConfig> {
    return this.http.get<ApplicationConfig>('/api/config');
  }
}
