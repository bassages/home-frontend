import {Injectable} from '@angular/core';
import {EnergieVerbruikJaarHistorieService} from './energie-verbruik-jaar-historie.service';
import {EnergieVerbruikUurHistorieService} from './energie-verbruik-uur-historie.service';
import {EnergieVerbruikDagHistorieService} from './energie-verbruik-dag-historie.service';
import {EnergieVerbruikMaandHistorieService} from './energie-verbruik-maand-historie.service';
import {EnergieVerbruikHistorieService} from './energie-verbruik-historie.service';

@Injectable()
export class EnergieVerbruikHistorieServiceProvider {

  private readonly periodeToChartServiceMapping: Map<string, EnergieVerbruikHistorieService<any>>;

  constructor(private readonly energieVerbruikUurHistorieService: EnergieVerbruikUurHistorieService,
              private readonly energieVerbruikDagHistorieService: EnergieVerbruikDagHistorieService,
              private readonly energieVerbruikMaandHistorieService: EnergieVerbruikMaandHistorieService,
              private readonly energieVerbruikJaarHistorieService: EnergieVerbruikJaarHistorieService) {

    this.periodeToChartServiceMapping = new Map<string, EnergieVerbruikHistorieService<any>>([
      ['uur', energieVerbruikUurHistorieService],
      ['dag', energieVerbruikDagHistorieService],
      ['maand', energieVerbruikMaandHistorieService],
      ['jaar', energieVerbruikJaarHistorieService],
    ]);
  }

  public get(periode: string): EnergieVerbruikHistorieService<any> {
    return this.periodeToChartServiceMapping.get(periode);
  }
}
