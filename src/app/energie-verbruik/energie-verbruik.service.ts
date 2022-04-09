import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {VerbruikOpDag} from './verbruikOpDag';
import {GemiddeldVerbruikInPeriod} from './gemiddeldVerbruikInPeriod';
import {VerbruikInUur} from './verbruikInUur';
import {VerbruikInMaand} from './verbruikInMaand';
import {VerbruikInJaar} from './verbruikInJaar';
import {Dayjs} from 'dayjs';

@Injectable()
export class EnergieVerbruikService {

  constructor(private readonly http: HttpClient) { }

  public getGemiddeldVerbruikPerDag(from: Dayjs, to: Dayjs): Observable<GemiddeldVerbruikInPeriod> {
    const url = '/api/energie/gemiddelde-per-dag/' + from.format('YYYY-MM-DD') + '/' + to.format('YYYY-MM-DD');
    return this.http.get<GemiddeldVerbruikInPeriod>(url);
  }

  public getVerbruikPerUurOpDag(dag: Dayjs): Observable<VerbruikInUur[]> {
    const url = `/api/energie/verbruik-per-uur-op-dag/${dag.format('YYYY-MM-DD')}`;
    return this.http.get<VerbruikInUur[]>(url);
  }

  public getVerbruikPerDag(from: Dayjs, to: Dayjs): Observable<VerbruikOpDag[]> {
    const url = '/api/energie/verbruik-per-dag/' + from.format('YYYY-MM-DD') + '/' + to.format('YYYY-MM-DD');
    return this.http.get<VerbruikOpDag[]>(url);
  }

  public getVerbruikPerMaandInJaar(jaar: number): Observable<VerbruikInMaand[]> {
    const url = `/api/energie/verbruik-per-maand-in-jaar/${jaar}`;
    return this.http.get<VerbruikInMaand[]>(url);
  }

  public getVerbruikPerJaar(): Observable<VerbruikInJaar[]> {
    const url = '/api/energie/verbruik-per-jaar';
    return this.http.get<VerbruikInJaar[]>(url);
  }

}
