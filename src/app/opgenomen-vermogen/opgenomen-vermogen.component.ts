import {Component, HostListener, OnInit} from '@angular/core';
import {OpgenomenVermogenService} from './opgenomen-vermogen.service';
import {ActivatedRoute, Router} from '@angular/router';
import * as c3 from 'c3';
import {ChartAPI, ChartConfiguration} from 'c3';
import mean from 'lodash-es/mean';
import min from 'lodash-es/min';
import max from 'lodash-es/max';
import map from 'lodash-es/map';
import filter from 'lodash-es/filter';
import {ErrorHandingService} from '../error-handling/error-handing.service';
import {OpgenomenVermogen} from './opgenomen-vermogen';
import {ChartService} from '../chart/chart.service';
import {Statistics} from '../statistics';
import {ChartStatisticsService} from '../chart/statistics/chart-statistics.service';
import {NgxSpinnerService} from 'ngx-spinner';
import dayjs, {Dayjs} from 'dayjs/esm';
import duration from 'dayjs/esm/plugin/duration';
import { DateNavigatorComponent } from '../date-navigator/date-navigator.component';
import { FormsModule } from '@angular/forms';
import { StatisticsComponent } from '../chart/statistics/statistics.component';
dayjs.extend(duration);

@Component({
    selector: 'home-opgenomen-vermogen',
    templateUrl: './opgenomen-vermogen.component.html',
    imports: [DateNavigatorComponent, FormsModule, StatisticsComponent]
})
export class OpgenomenVermogenComponent implements OnInit {

  public selectedDate: Dayjs;
  public statistics: Statistics;

  public periodLengthInSeconds = dayjs.duration(3, 'minutes').asSeconds();

  private chart: ChartAPI;

  public detailLevels = [
    { periodLength:  60, title: 'Detailniveau ++'  },
    { periodLength: 180, title: 'Detailniveau +'   },
    { periodLength: 300, title: 'Detailniveau +/-' },
    { periodLength: 420, title: 'Detailniveau -'   },
    { periodLength: 600, title: 'Detailniveau --'  }
  ];

  constructor(private readonly opgenomenVermogenService: OpgenomenVermogenService,
              private readonly chartService: ChartService,
              private readonly chartStatisticsService: ChartStatisticsService,
              private readonly spinnerService: NgxSpinnerService,
              private readonly errorHandlingService: ErrorHandingService,
              private readonly router: Router,
              private readonly activatedRoute: ActivatedRoute) { }

  @HostListener('window:resize') public onResize() {
    this.chartService.adjustChartHeightToAvailableWindowHeight(this.chart);
  }

  public ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe((queryParams) => {
      if (!queryParams.has('datum')) {
        return this.navigateTo(dayjs());
      }
      this.selectedDate = this.parseRouteDate(queryParams.get('datum'));

      if (!this.selectedDate) {
        return this.navigateTo(dayjs());
      }

      setTimeout(() => this.getAndLoadData());
    });
  }

  private navigateTo(date: Dayjs) {
    const commands = ['/energie/opgenomen-vermogen'];
    const extras = {queryParams: { datum: date.format('DD-MM-YYYY')}, replaceUrl: true};
    this.router.navigate(commands, extras);
  }

  private getAndLoadData() {
    this.spinnerService.show();

    const from = this.selectedDate;
    const to = from.add(1, 'days');

    this.opgenomenVermogenService.getHistory(from, to, this.periodLengthInSeconds).subscribe({
      next: opgenomenVermogens => this.loadDataIntoChart(opgenomenVermogens),
      error: error => this.errorHandlingService.handleError('Opgenomen vermogen kon niet worden opgehaald', error),
      complete: () => { this.spinnerService.hide() }
    });
  }

  public onDateNavigate(selectedDate: Dayjs) {
    this.navigateTo(selectedDate);
  }

  private loadDataIntoChart(opgenomenVermogens: OpgenomenVermogen[]) {
    const chartData = this.transformData(opgenomenVermogens);
    this.statistics = this.getStatistics(opgenomenVermogens);
    this.chart = c3.generate(this.getChartConfiguration(chartData, this.statistics));
    this.chartService.adjustChartHeightToAvailableWindowHeight(this.chart);
  }

  // noinspection JSMethodCanBeStatic
  private transformData(opgenomenVermogens: OpgenomenVermogen[]) {
    const transformedData = [];

    let previousTarief = null;
    opgenomenVermogens.forEach(opgenomenVermogen => {
      const transformedDataItem: any = {};

      const tarief = opgenomenVermogen.tariefIndicator.toLowerCase();
      transformedDataItem.datumtijd = new Date(opgenomenVermogen.datumtijd).getTime();
      transformedDataItem['active-power-total-in-watts-' + tarief] = opgenomenVermogen.activePowerTotalInWatts;

      // Fill the "gap" between this row and the previous one
      if (previousTarief && tarief && tarief !== previousTarief) {
        const obj: any = {};
        obj.datumtijd = new Date(opgenomenVermogen.datumtijd).getTime() - 1;
        const attribute = 'active-power-total-in-watts-' + previousTarief;
        obj[attribute] = opgenomenVermogen.activePowerTotalInWatts;
        transformedData.push(obj);
      }

      previousTarief = tarief;
      transformedData.push(transformedDataItem);
    });
    return transformedData;
  }

  private getChartConfiguration(chartData: any[], statistics: Statistics): ChartConfiguration {
    if (chartData.length === 0) {
      return this.chartService.getEmptyChartConfig();
    }

    const tickValues = this.getTicksForEveryHourInPeriod(this.selectedDate, this.getTo());
    const statisticsChartLines = this.chartStatisticsService.createStatisticsChartLines(statistics);

    return {
      bindto: '#chart',
      data: {
        json: chartData,
        keys: {
          x: 'datumtijd',
          value: ['active-power-total-in-watts-dal', 'active-power-total-in-watts-normaal']
        },
        types: {'active-power-total-in-watts-dal': 'area', 'active-power-total-in-watts-normaal': 'area'}
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: { format: '%H:%M', values: tickValues, rotate: -45 },
          min: this.selectedDate.toDate(), max: this.getTo().toDate(),
          padding: {left: 0, right: 10}
        }
      },
      legend: { show: false },
      point: { show: false },
      transition: { duration: 0 },
      tooltip: { show: false },
      padding: this.chartService.getDefaultChartPadding(),
      grid: {
        y: {
          show: true,
          lines: statisticsChartLines
        }
      }
    };
  }

  // noinspection JSMethodCanBeStatic
  private getTicksForEveryHourInPeriod(from: Dayjs, to: Dayjs) {
    const numberOfHoursInPeriod: number = dayjs.duration(to.diff(from)).asHours();

    const tickValues: number[] = [];
    for (let i = 0; i <= numberOfHoursInPeriod; i++) {
      const tickValue = from.toDate().getTime() + (i * 60 * 60 * 1000);
      tickValues.push(tickValue);
    }
    return tickValues;
  }

  private getTo() {
    return this.selectedDate.add(1, 'days');
  }

  // noinspection JSMethodCanBeStatic
  private getStatistics(opgenomenVermogens: OpgenomenVermogen[]): Statistics {
    const activePowerTotalsInWatts: number[] = filter(map(opgenomenVermogens, 'activePowerTotalInWatts'),
      (activePowerTotalInWatts: number) => activePowerTotalInWatts !== null && activePowerTotalInWatts > 0);
    return {
      min: min(activePowerTotalsInWatts),
      max: max(activePowerTotalsInWatts),
      avg: mean(activePowerTotalsInWatts)
    };
  }

  public periodLengthChanged(): void {
    this.getAndLoadData();
  }

  private parseRouteDate(dateParam: string): Dayjs | null {
    const parsed = dayjs(dateParam, 'DD-MM-YYYY', true);
    return parsed.isValid() ? parsed : null;
  }
}
