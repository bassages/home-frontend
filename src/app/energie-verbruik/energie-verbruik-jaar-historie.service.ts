import {Injectable} from '@angular/core';
import {EnergieVerbruikHistorieService} from './energie-verbruik-historie.service';
import {EnergieVerbruikService} from './energie-verbruik.service';
import {Observable} from 'rxjs';
import {AbstractEnergieVerbruikHistorieService} from './energie-verbruik-base-chart.service';
import {ChartConfiguration} from 'c3';
import {DecimalPipe} from '@angular/common';
import {VerbruikInJaar} from './verbruikInJaar';
import dayjs, {Dayjs} from 'dayjs';

@Injectable()
export class EnergieVerbruikJaarHistorieService extends AbstractEnergieVerbruikHistorieService
                                                implements EnergieVerbruikHistorieService<VerbruikInJaar> {

  constructor(private readonly energieVerbruikService: EnergieVerbruikService,
              protected decimalPipe: DecimalPipe) {
    super(decimalPipe);
  }

  public getVerbruiken(_selectedDate: Dayjs): Observable<VerbruikInJaar[]> {
    return this.energieVerbruikService.getVerbruikPerJaar();
  }

  public getChartConfig(selectedDate: Dayjs,
                        verbruiksoort: string,
                        energiesoorten: string[],
                        verbruiken: any[],
                        onDataClick: ((date: Dayjs) => void)): ChartConfiguration {
    const that = this;

    const chartConfiguration = super.getDefaultBarChartConfig();
    const keysGroups = super.getKeysGroups(verbruiksoort, energiesoorten);

    chartConfiguration.data.groups = [keysGroups];
    chartConfiguration.data.keys = { x: 'jaar', value: keysGroups };
    chartConfiguration.data.json = verbruiken;
    chartConfiguration.data.onclick = (data => onDataClick(this.toDayjs(selectedDate, data.x)));
    chartConfiguration.axis = {
      y: {
        tick: {
          format: (value: number) => super.formatWithoutUnitLabel(verbruiksoort, value)
        }
      }
    };
    chartConfiguration.tooltip = {
      contents: function (data, _defaultTitleFormat, valueFormatter, color) {
        const titleFormatter = (year: number) => year;
        return that.getTooltipContent(this, data, titleFormatter, valueFormatter, color, verbruiksoort, energiesoorten);
      }
    };
    return chartConfiguration;
  }

  public getFormattedDate(verbruikInJaar: VerbruikInJaar): string {
    return !(verbruikInJaar.jaar === null || verbruikInJaar.jaar === undefined) ? verbruikInJaar.jaar.toString() : '';
  }

  public getDayjs(selectedDate: Dayjs, verbruikInjaar: VerbruikInJaar): Dayjs {
    return this.toDayjs(selectedDate, verbruikInjaar.jaar);
  }

  // noinspection JSMethodCanBeStatic
  private toDayjs(selectedDate: Dayjs, value: number): Dayjs {
    return dayjs(value + '-' + selectedDate.format('MM') + '-' + selectedDate.format('DD'));
  }
}
