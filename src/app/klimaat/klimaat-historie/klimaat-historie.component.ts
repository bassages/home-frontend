import {Component, HostListener, OnInit} from '@angular/core';
import {KlimaatSensor} from '../klimaatSensor';
import {KlimaatService} from '../klimaat.service';
import {ErrorHandingService} from '../../error-handling/error-handing.service';
import sortBy from 'lodash-es/sortBy';
import map from 'lodash-es/map';
import uniq from 'lodash-es/uniq';
import mean from 'lodash-es/mean';
import min from 'lodash-es/min';
import max from 'lodash-es/max';
import filter from 'lodash-es/filter';
import {ActivatedRoute, Router} from '@angular/router';
import * as c3 from 'c3';
import {ChartAPI, ChartConfiguration} from 'c3';
import {ChartService} from '../../chart/chart.service';
import {Klimaat} from '../klimaat';
import {DecimalPipe} from '@angular/common';
import {Statistics} from '../../statistics';
import {ChartStatisticsService} from '../../chart/statistics/chart-statistics.service';
import * as chroma from 'chroma-js';
import {KlimaatSensorService} from '../klimaatsensor.service';
import {NgxSpinnerService} from 'ngx-spinner';
import dayjs, {Dayjs} from 'dayjs';
import {faDroplet, faThermometerHalf} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'home-klimaat-historie',
  templateUrl: './klimaat-historie.component.html',
  styleUrls: ['./klimaat-historie-component.scss']
})
export class KlimaatHistorieComponent implements OnInit {
  faDroplet = faDroplet;
  faThermometerHalf = faThermometerHalf;

  public sensorCode: string;
  public sensorType: string;
  public date: Dayjs;

  public sensors: KlimaatSensor[];

  private sortedUniqueValues: number[];
  private colorScale: string[];

  public showTable = false;
  public showChart = false;
  public klimaats: Klimaat[] = [];
  public statistics: Statistics;
  private chart: ChartAPI;

  constructor(private readonly klimaatService: KlimaatService,
              private readonly klimaatSensorService: KlimaatSensorService,
              private readonly chartService: ChartService,
              private readonly chartStatisticsService: ChartStatisticsService,
              private readonly spinnerService: NgxSpinnerService,
              private readonly errorHandlingService: ErrorHandingService,
              private readonly activatedRoute: ActivatedRoute,
              private readonly router: Router,
              private readonly decimalPipe: DecimalPipe) {
  }

  @HostListener('window:resize') public onResize() {
    this.determineChartOrTable();
    if (this.showChart) {
      this.chartService.adjustChartHeightToAvailableWindowHeight(this.chart);
    }
  }

  public ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(queryParams => {
      const sensorCodeParam = queryParams.get('sensorCode');
      const sensorTypeParam = queryParams.get('sensorType');

      if (queryParams.has('datum')) {
        this.date = dayjs(queryParams.get('datum'), 'DD-MM-YYYY');
      } else {
        return this.navigateTo(sensorCodeParam, sensorTypeParam, dayjs());
      }

      if (!queryParams.has('sensorType')) {
        return this.navigateTo(sensorCodeParam, 'temperatuur', this.date);
      }

      this.sensorCode = sensorCodeParam;
      this.sensorType = sensorTypeParam;

      this.determineChartOrTable();

      setTimeout(() => this.getKlimaatSensors());
    });
  }

  private getKlimaatSensors(): void {
    this.spinnerService.show();

    this.klimaatSensorService.list().subscribe({
      next: response => {
          this.sensors = sortBy<KlimaatSensor>(response, ['omschrijving']);

          if (!this.sensorCode && this.sensors.length > 0) {
            return this.navigateTo(this.sensors[0].code, this.sensorType, this.date);
          }

          if (this.sensorCode && this.sensorType && this.date) {
            this.getAndLoadData();
          } else {
            this.loadData([]);
            this.spinnerService.hide();
          }
      },
      error: error => this.errorHandlingService.handleError('De klimaat sensors konden nu niet worden opgehaald', error),
    });
  }

  private loadData(klimaats: Klimaat[]) {
    this.klimaats = klimaats;
    this.statistics = this.getStatistics(klimaats);
    if (this.showChart) {
      this.loadDataIntoChart();
    } else if (this.showTable) {
      this.loadDataIntoTable();
    }
  }

  public onDateNavigate(selectedDate: Dayjs): void {
    this.navigateTo(this.sensorCode, this.sensorType, selectedDate);
  }

  public setSensorType(sensorType: string): void {
    this.navigateTo(this.sensorCode, sensorType, this.date);
  }

  public determineChartOrTable(): void {
    const autoChartOrTableThreshold = 500;
    if (window.innerWidth >= autoChartOrTableThreshold) {
      this.doShowChart();
    } else {
      this.doShowTable();
    }
  }

  private doShowChart(): void {
    if (!this.showChart) {
      this.showTable = false;
      this.showChart = true;
      this.loadDataIntoChart();
    }
  }

  private doShowTable(): void {
    if (!this.showTable) {
      this.showChart = false;
      this.showTable = true;
      this.loadDataIntoTable();
    }
  }

  private navigateTo(sensorCode: string, sensorType: string, datum: Dayjs): void {
    const commands = ['/klimaat/historie'];
    const extras = { queryParams: { sensorCode: sensorCode, sensorType: sensorType, datum: datum.format('DD-MM-YYYY') }, replaceUrl: true };
    this.router.navigate(commands, extras);
  }

  private loadDataIntoChart(): void {
    const chartConfiguration: ChartConfiguration = this.getChartConfig(this.klimaats);
    this.chart = c3.generate(chartConfiguration);
    this.chartService.adjustChartHeightToAvailableWindowHeight(this.chart);
  }

  private loadDataIntoTable() {
    this.sortedUniqueValues = sortBy(uniq(map(this.klimaats, this.sensorType)));
    this.colorScale = chroma.scale(['#3e7fcd', 'white', '#e83b26'])
                            .mode('lch')
                            .colors(this.sortedUniqueValues.length);
  }

  private getAndLoadData(): void {
    this.spinnerService.show();
    this.klimaatService.getKlimaat(this.sensorCode, this.date, this.date.add(1, 'days')).subscribe({
      next: klimaat => this.loadData(klimaat),
      error: error => this.errorHandlingService.handleError('Klimaat historie kon niet worden opgehaald', error),
      complete: () => this.spinnerService.hide()
    });
  }

  public sensorChanged(): void {
    this.navigateTo(this.sensorCode, this.sensorType, this.date);
  }

  private getChartConfig(klimaat: Klimaat[]): ChartConfiguration {
    if (klimaat.length === 0) {
      return this.chartService.getEmptyChartConfig();
    }

    const that = this;

    const tickValues = this.getTicksForEveryHourInDay();

    const values: any = [];
    values.push(this.date.format('DD-MM-YYYY'));

    return {
      bindto: '#chart',
      data: {
        type: 'spline',
        json: this.transformServerdata([{data: klimaat}]),
        keys: {
          x: 'datumtijd',
          value: values
        }
      },
      line: { connectNull: true },
      axis: {
        x: {
          type: 'timeseries',
          tick: { format: '%H:%M', values: tickValues, rotate: -45 },
          min: this.getFixedDate(), max: this.getTo(this.getFixedDate()),
          padding: { left: 0, right: 10 }
        },
        y: {
          tick: {
            format: (value: number) => this.formatWithoutUnitLabel(this.sensorType, value)
          }
        }
      },
      legend: { show: false },
      bar: {
        width: { ratio: 1 }
      },
      transition: { duration: 0 },
      padding: this.chartService.getDefaultChartPadding(),
      grid: {
        y: {
          show: true,
          lines: this.chartStatisticsService.createStatisticsChartLines(this.statistics)
        }
      },
      tooltip: {
        format: {
          name: (name: string, _ratio: number, _id: string, _index: number) => dayjs(name, 'DD-MM-YYYY').format('DD-MM-YYYY'),
          value: (value: number) => this.formatWithUnitLabel(that.sensorType, value)
        }
      }
    };
  }

  // noinspection JSMethodCanBeStatic
  private getTo(from: Date): Date {
    return dayjs(from).add(1, 'days').toDate();
  }

  private getTicksForEveryHourInDay() {
    const from: Date = this.getFixedDate();
    const to: Date = this.getTo(from);

    const numberOfHoursInDay: number = ((to.getTime() - from.getTime()) / 1000) / 60 / 60;

    const tickValues = [];
    for (let i = 0; i <= numberOfHoursInDay; i++) {
      const tickValue = from.getTime() + (i * 60 * 60 * 1000);
      tickValues.push(tickValue);
    }
    return tickValues;
  }

  private getFixedDate(): Date {
    return this.date.toDate();
  }

  public formatWithoutUnitLabel(_sensorType: string, value: number): string {
    return this.decimalPipe.transform(value, this.getDecimalFormat(this.sensorType));
  }

  public formatWithUnitLabel(sensorType: string, value: number): string {
    return this.formatWithoutUnitLabel(sensorType, value) + this.getValuePostFix(sensorType);
  }

  public getDecimalFormat(sensorType: string) {
    return this.klimaatService.getDecimalFormat(sensorType);
  }

  public getValuePostFix(_sensorType: string) {
    return this.klimaatService.getValuePostFix(this.sensorType);
  }

  private transformServerdata(serverresponses) {
    const result = [];

    for (const serverresponse of serverresponses) {

      for (const element of serverresponse.data) {
        const datumtijd = element.dateTime;

        const datumtijdKey = datumtijd.format('DD-MM-YYYY');
        const datumtijdValue = element[this.sensorType];

        const date: Date = datumtijd.toDate();
        date.setDate(this.getFixedDate().getDate());
        date.setMonth(this.getFixedDate().getMonth());
        date.setFullYear(this.getFixedDate().getFullYear());
        const row = this.getOrCreateCombinedRow(result, date);

        row[datumtijdKey] = datumtijdValue;
      }
    }
    return result;
  }

  // noinspection JSMethodCanBeStatic
  private getOrCreateCombinedRow(currentRows, datumtijd) {
    let row = null;

    for (const currentRow of currentRows) {
      if (currentRow.datumtijd.getTime() === datumtijd.getTime()) {
        row = currentRow;
        break;
      }
    }
    if (row === null) {
      row = {};
      row.datumtijd = datumtijd;
      currentRows.push(row);
    }
    return row;
  }

  private getStatistics(klimaats: Klimaat[]): Statistics {
    const values: number[] = filter(map(klimaats, this.sensorType), (value: number) => value !== null && value > 0);
    return {
      min: min(values),
      max: max(values),
      avg: mean(values),
      postfix: this.getValuePostFix(this.sensorType)
    };
  }

  // noinspection JSMethodCanBeStatic
  public getFormattedTime(klimaat: Klimaat) {
    return klimaat.dateTime.format('HH:mm');
  }

  // noinspection JSMethodCanBeStatic
  public getColor(value: number) {
    const indexOfValue = this.sortedUniqueValues.indexOf(value);
    return this.colorScale[indexOfValue];
  }
}
