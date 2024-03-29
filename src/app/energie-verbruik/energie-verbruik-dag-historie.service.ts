import {Injectable} from '@angular/core';
import {EnergieVerbruikHistorieService} from './energie-verbruik-historie.service';
import {EnergieVerbruikService} from './energie-verbruik.service';
import {Observable} from 'rxjs';
import {VerbruikOpDag} from './verbruikOpDag';
import {AbstractEnergieVerbruikHistorieService} from './energie-verbruik-base-chart.service';
import {ChartConfiguration} from 'c3';
import {DecimalPipe} from '@angular/common';
import capitalize from 'lodash-es/capitalize';
import dayjs, {Dayjs} from 'dayjs';

@Injectable()
export class EnergieVerbruikDagHistorieService extends AbstractEnergieVerbruikHistorieService
                                               implements EnergieVerbruikHistorieService<VerbruikOpDag> {

  constructor(private readonly energieVerbruikService: EnergieVerbruikService,
              protected decimalPipe: DecimalPipe) {
    super(decimalPipe);
  }

  public getVerbruiken(selectedDate: Dayjs): Observable<VerbruikOpDag[]> {
    const from = selectedDate.date(1);
    const to = from.add(1, 'months');
    return this.energieVerbruikService.getVerbruikPerDag(from, to);
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
    chartConfiguration.data.keys = { x: 'dag', value: keysGroups };
    chartConfiguration.data.json = verbruiken;
    chartConfiguration.data.onclick = (data => onDataClick(dayjs(data.x)));
    chartConfiguration.axis = {
      x: {
        type: 'timeseries',
        tick: {
          format: (date: Date) => capitalize(dayjs(date).format('ddd DD')),
          values: this.getTicksForEveryDayInMonth(selectedDate),
          centered: true,
          multiline: true,
          width: 25
        },
        min: this.getPeriodStart(selectedDate).subtract(12, 'hours').toDate(),
        max: this.getPeriodEnd(selectedDate).subtract(12, 'hours').toDate(),
        padding: { left: 0, right: 0 }
      },
      y: {
        tick: {
          format: (value: number) => super.formatWithoutUnitLabel(verbruiksoort, value)
        }
      }
    };
    chartConfiguration.tooltip = {
      contents: function (data, _defaultTitleFormat, defaultValueFormat, color) {
        const titleFormat = (date: any) => that.formatDate(date);
        return that.getTooltipContent(this, data, titleFormat, defaultValueFormat, color, verbruiksoort, energiesoorten);
      }
    };
    return chartConfiguration;
  }

  // noinspection JSMethodCanBeStatic
  private getPeriodStart(selectedDate: Dayjs): Dayjs {
    return selectedDate.date(1);
  }

  // noinspection JSMethodCanBeStatic
  private getPeriodEnd(selectedDate: Dayjs): Dayjs {
    return selectedDate.date(1)
                       .add(1, 'months')
                       .subtract(1, 'milliseconds');
  }

  private getTicksForEveryDayInMonth(selectedMoment: Dayjs): number[] {
    let date: Dayjs = this.getPeriodStart(selectedMoment);
    const numberOfDaysInMonth: number = selectedMoment.daysInMonth();
    const tickValues: number[] = [];

    for (let i = 0; i < numberOfDaysInMonth; i++) {
      tickValues.push(date.toDate().getTime());
      date = date.add(1, 'days');
    }
    return tickValues;
  }

  public getFormattedDate(verbruikOpDag: VerbruikOpDag): string {
    return this.formatDate(verbruikOpDag.dag);
  }

  public getDayjs(_selectedDate: Dayjs, verbruikOpDag: VerbruikOpDag): Dayjs {
    return dayjs(verbruikOpDag.dag);
  }

  // noinspection JSMethodCanBeStatic
  private formatDate(date: any): string {
    return capitalize(dayjs(date).format('ddd DD-MM'));
  }
}
