import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {Klimaat} from './klimaat';
import {RealtimeKlimaat} from './realtimeKlimaat';
import {Trend} from './trend';
import {GemiddeldeKlimaatPerMaand} from './gemiddeldeKlimaatPerMaand';
import * as dayjs from 'dayjs';
import {Dayjs} from 'dayjs';

const sensorTypeToPostfixMapping: Map<string, string> =
  new Map<string, string>([
    ['temperatuur', '℃'],
    ['luchtvochtigheid', '%'],
  ]);

const sensorTypeToDecimalFormatMapping: Map<string, string> =
  new Map<string, string>([
    ['temperatuur', '1.2-2'],
    ['luchtvochtigheid', '1.1-1'],
  ]);

@Injectable()
export class KlimaatService {

  constructor(private readonly http: HttpClient) { }

  private static mapAllToKlimaat(backendKlimaats: BackendKlimaat[]): Klimaat[] {
    return backendKlimaats.map(KlimaatService.mapToKlimaat);
  }

  private static mapToKlimaat(backendKlimaat: BackendKlimaat): Klimaat {
    const klimaat: Klimaat = new Klimaat();
    klimaat.dateTime = dayjs(backendKlimaat.datumtijd);
    klimaat.temperatuur = backendKlimaat.temperatuur;
    klimaat.luchtvochtigheid = backendKlimaat.luchtvochtigheid;
    return klimaat;
  }

  public static mapToRealtimeKlimaat(source: any): RealtimeKlimaat {
    const realtimeKlimaat: RealtimeKlimaat = new RealtimeKlimaat();
    realtimeKlimaat.dateTime = dayjs(source.datumtijd);
    realtimeKlimaat.temperatuur = source.temperatuur;
    realtimeKlimaat.luchtvochtigheid = source.luchtvochtigheid;
    realtimeKlimaat.temperatuurTrend = Trend[source.temperatuurTrend as string];
    realtimeKlimaat.luchtvochtigheidTrend = Trend[source.luchtvochtigheidTrend as string];
    realtimeKlimaat.sensorCode = source.sensorCode;
    return realtimeKlimaat;
  }

  private static mapAllToGemiddeldeKlimaatPerMaand(backendGemiddeldeKlimaatPerMaand: BackendGemiddeldeKlimaatPerMaand[][])
                 : GemiddeldeKlimaatPerMaand[] {
    return backendGemiddeldeKlimaatPerMaand[0].map(KlimaatService.mapToGemiddeldeKlimaatPerMaand);
  }

  public static mapToGemiddeldeKlimaatPerMaand(backendGemiddeldeKlimaatPerMaand: BackendGemiddeldeKlimaatPerMaand)
                : GemiddeldeKlimaatPerMaand {
    const gemiddeldeKlimaatPerMaand: GemiddeldeKlimaatPerMaand = new GemiddeldeKlimaatPerMaand();
    gemiddeldeKlimaatPerMaand.maand = dayjs(backendGemiddeldeKlimaatPerMaand.maand);
    gemiddeldeKlimaatPerMaand.gemiddelde = backendGemiddeldeKlimaatPerMaand.gemiddelde;
    return gemiddeldeKlimaatPerMaand;
  }

  public getKlimaat(sensorCode: string, from: Dayjs, to: Dayjs): Observable<Klimaat[]> {
    const url = `/api/klimaat/${sensorCode}`;
    const params = new HttpParams().set('from', from.format('YYYY-MM-DD'))
                                   .set('to', to.format('YYYY-MM-DD'));
    return this.http.get<BackendKlimaat[]>(url, {params: params}).pipe(map(KlimaatService.mapAllToKlimaat));
  }

  public getMostRecent(sensorCode: string): Observable<RealtimeKlimaat> {
    return this.http.get<BackendRealtimeKlimaat>(`api/klimaat/${sensorCode}/meest-recente`)
                    .pipe(filter(value => value !== undefined && value !== null))
                    .pipe(map(KlimaatService.mapToRealtimeKlimaat));
  }

  public getTop(sensorCode: string, sensorType: string, topType: string, from: Dayjs, to: Dayjs, limit: number): Observable<Klimaat[]> {
    const params = new HttpParams().set('from', from.format('YYYY-MM-DD'))
                                   .set('to', to.format('YYYY-MM-DD'))
                                   .set('sensorType', sensorType)
                                   .set('limit', limit.toString());
    const url = `/api/klimaat/${sensorCode}/${topType}`;
    return this.http.get<BackendKlimaat[]>(url, {params: params})
                    .pipe(map(KlimaatService.mapAllToKlimaat));
  }

  public getGemiddeldeKlimaatPerMaand(sensorCode: string, sensorType: string, year: number): Observable<GemiddeldeKlimaatPerMaand[]> {
    const params = new HttpParams().set('jaar', year.toString())
                                   .set('sensorType', sensorType);
    const url = `/api/klimaat/${sensorCode}/gemiddeld-per-maand-in-jaar`;
    return this.http.get<BackendGemiddeldeKlimaatPerMaand[][]>(url, {params})
                    .pipe(map(KlimaatService.mapAllToGemiddeldeKlimaatPerMaand));
  }

  // noinspection JSMethodCanBeStatic
  public getValuePostFix(sensorType: string) {
    return sensorTypeToPostfixMapping.has(sensorType) ? sensorTypeToPostfixMapping.get(sensorType) : '';
  }

  // noinspection JSMethodCanBeStatic
  public getDecimalFormat(sensorType: string) {
    return sensorTypeToDecimalFormatMapping.has(sensorType) ? sensorTypeToDecimalFormatMapping.get(sensorType) : '0.0-0';
  }
}

class BackendKlimaat {
  public datumtijd: string;
  public temperatuur: number;
  public luchtvochtigheid: number;
}

class BackendRealtimeKlimaat extends BackendKlimaat {
  public temperatuurTrend: string;
  public luchtvochtigheidTrend: string;
}

class BackendGemiddeldeKlimaatPerMaand {
  public maand: string;
  public gemiddelde: number;
}
