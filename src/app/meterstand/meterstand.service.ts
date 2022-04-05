import {Injectable} from '@angular/core';
import {MeterstandOpDag} from './meterstandOpDag';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Meterstand} from './meterstand';
import {Dayjs} from 'dayjs';

@Injectable()
export class MeterstandService {

  constructor(private readonly http: HttpClient) { }

  public getMeterstanden(from: Dayjs, to: Dayjs): Observable<MeterstandOpDag[]> {
    const url = `/api/meterstanden/per-dag/${from.format('YYYY-MM-DD')}/${to.format('YYYY-MM-DD')}`;
    return this.http.get<MeterstandOpDag[]>(url);
  }

  public getMostRecent(): Observable<Meterstand> {
    const url = '/api/meterstanden/meest-recente';
    return this.http.get<Meterstand>(url);
  }
}
