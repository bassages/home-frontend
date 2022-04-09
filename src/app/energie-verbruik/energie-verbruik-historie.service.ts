import {ChartConfiguration} from 'c3';
import {Observable} from 'rxjs';
import {Dayjs} from 'dayjs';

export interface EnergieVerbruikHistorieService<T> {

  getVerbruiken(selectedDate: Dayjs): Observable<T[]>;

  getEmptyChartConfig(): ChartConfiguration;

  getChartConfig(selectedDate: Dayjs,
                 verbruiksoort: string,
                 energiesoorten: string[],
                 verbruiken: T[],
                 onDataClick: ((date: Dayjs) => void)): ChartConfiguration;

  toggleEnergiesoort(verbruiksoort: string, energiesoorten: string[], energiesoortToToggle: string): string[];

  getFormattedDate(verbruik: T): string;

  formatWithUnitLabel(verbruiksoort: string, energieSoorten: string[], value: number);

  adjustChartHeightToAvailableWindowHeight(chart: any): void;

  getDayjs(selectedDate: Dayjs, T): Dayjs;
}
