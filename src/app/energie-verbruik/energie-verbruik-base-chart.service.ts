import {ChartConfiguration} from 'c3';
import sortBy from 'lodash-es/sortBy';
import sumBy from 'lodash-es/sumBy';
import endsWith from 'lodash-es/endsWith';
import startsWith from 'lodash-es/startsWith';
import capitalize from 'lodash-es/capitalize';
import {DecimalPipe} from '@angular/common';
import {ChartService} from '../chart/chart.service';
import {VerbruikKostenOverzicht} from './verbruikKostenOverzicht';
import {Statistics} from '../statistics';

const dataColors: {[key: string]: string} = {
  'stroomVerbruikDal': '#4575b3',
  'stroomVerbruikNormaal': '#f4b649',
  'stroomKostenDal': '#4575b3',
  'stroomKostenNormaal': '#f4b649',
  'stroomVerbruik': '#4575b3',
  'stroomKosten': '#4575b3',
  'gasVerbruik': '#2ca02c',
  'gasKosten': '#2ca02c'
};

export abstract class AbstractEnergieVerbruikHistorieService extends ChartService {

  constructor(protected decimalPipe: DecimalPipe) {
    super();
  }

  public getDefaultBarChartConfig(): ChartConfiguration {
    return {
      bindto: '#chart',
      data: {
        type: 'bar',
        colors: dataColors,
        order: (data1: any, data2: any) => data2.id.localeCompare(data1.id)
      },
      legend: {
        show: false
      },
      bar: {
        width: {
          ratio: 0.8
        }
      },
      transition: {
        duration: 0
      },
      padding: super.getDefaultChartPadding(),
      grid: {
        y: {
          show: true
        }
      }
    };
  }

  protected formatWithoutUnitLabel(_verbruiksoort: string, value: any) {
    return this.decimalPipe.transform(value, '1.3-3');
  }

  public formatWithUnitLabel(verbruiksoort: string, energieSoorten: string[], value: number) {
    const withoutUnitLabel = this.formatWithoutUnitLabel(verbruiksoort, value);

    const prefix = verbruiksoort === 'kosten' ? this.getVerbruikSoortPrefix(verbruiksoort) : '';
    const postfix = verbruiksoort === 'verbruik' ? this.getEnergiesoortPostfix(energieSoorten[0]) : '';

    let formatted = prefix ? prefix + ' ' : '';
    formatted = formatted + withoutUnitLabel;
    formatted = postfix ? formatted + ' ' + postfix : formatted;
    return formatted;
  }

  protected getTooltipContent(c3, data, titleFormatter, _valueFormatter, color, verbruiksoort: string, energiesoorten: string[]) {
    let tooltipContents = '';

    data = sortBy(data, 'id');

    if (data.length > 0) {
      tooltipContents += `<table class='${c3.CLASS.tooltip}'><tr><th colspan='2'>${titleFormatter(data[0].x)}</th></tr>`;
    }

    for (const element of data) {
      if (!(element && (element.value || element.value === 0))) {
        continue;
      }

      const bgcolor = c3.levelColor ? c3.levelColor(element.value) : color(element.id);

      tooltipContents += '<tr>';
      tooltipContents += `<td class='name'><span style='background-color:${bgcolor}'></span>${this.getTooltipLabel(element.id)}</td>`;
      tooltipContents += `<td class='value'>${this.formatWithUnitLabel(verbruiksoort, energiesoorten, element.value)}</td>`;
      tooltipContents += '</tr>';
    }

    if (data.length > 1) {
      const total: number = sumBy(data, 'value');
      tooltipContents += '<tr>';
      tooltipContents += '<td class=\'name\'><strong>Totaal</strong></td>';
      tooltipContents += `<td class='value'><strong>${this.formatWithUnitLabel(verbruiksoort, energiesoorten, total)}</strong></td>`;
      tooltipContents += '</tr>';
    }
    tooltipContents += '</table>';

    return tooltipContents;
  }

  // noinspection JSMethodCanBeStatic
  private getTooltipLabel(id) {
    if (endsWith(id, 'Dal')) {
      return 'Stroom - Daltarief';
    } else if (endsWith(id, 'Normaal')) {
      return 'Stroom - Normaaltarief';
    } else if (startsWith(id, 'gas')) {
      return 'Gas';
    }
  }

  // noinspection JSMethodCanBeStatic
  public getEnergiesoortPostfix(energiesoort: string) {
    if (energiesoort === 'stroom') {
      return 'kWh';
    } else if (energiesoort === 'gas') {
      return 'm\u00B3';
    } else {
      return null;
    }
  }

  public getVerbruikSoortPrefix(verbruiksoort: string) {
    if (verbruiksoort === 'kosten') {
      return '\u20AC';
    } else {
      return null;
    }
  }

  // noinspection JSMethodCanBeStatic
  protected getKeysGroups(verbruiksoort: string, energiesoorten: string[]): string[] {
    const keysGroups: string[] = [];
    if (energiesoorten.indexOf('gas') > -1) {
      keysGroups.push(`gas${capitalize(verbruiksoort)}`);
    }
    if (energiesoorten.indexOf('stroom') > -1) {
      keysGroups.push(`stroom${capitalize(verbruiksoort)}Dal`);
      keysGroups.push(`stroom${capitalize(verbruiksoort)}Normaal`);
    }
    return keysGroups;
  }

  // noinspection JSMethodCanBeStatic
  public toggleEnergiesoort(verbruiksoort: string, energiesoorten: string[], energiesoortToToggle: string): string[] {
    const newEnergiesoorten = energiesoorten.slice();

    const indexOfToggledEnergieSoort = newEnergiesoorten.indexOf(energiesoortToToggle);

    if (verbruiksoort === 'kosten') {
      if (indexOfToggledEnergieSoort < 0) {
        newEnergiesoorten.push(energiesoortToToggle);
      } else {
        newEnergiesoorten.splice(indexOfToggledEnergieSoort, 1);
      }
    } else {
      if (newEnergiesoorten[0] !== energiesoortToToggle) {
        newEnergiesoorten.splice(0, newEnergiesoorten.length);
        newEnergiesoorten.push(energiesoortToToggle);
      }
    }
    return newEnergiesoorten;
  }

  public getStatistics(verbruiksoort: string, energiesoorten: string[], verbruiken: VerbruikKostenOverzicht[]): Statistics {
    return {
      avg: this.getAvg(verbruiksoort, energiesoorten, verbruiken),
      min: this.getMin(verbruiksoort, energiesoorten, verbruiken),
      max: this.getMax(verbruiksoort, energiesoorten, verbruiken),
      prefix: verbruiksoort === 'kosten' ? this.getVerbruikSoortPrefix(verbruiksoort) + ' ' : '',
      postfix: verbruiksoort === 'verbruik' ? ' ' + this.getEnergiesoortPostfix(energiesoorten[0]) : ''
    };
  }

  protected getAvg(verbruiksoort: string, energiesoorten: string[], verbruiken: VerbruikKostenOverzicht[]): number {
    if (energiesoorten.length === 0) {
      return null;
    }
    const numberOfNonEmptyVerbruiken = this.getNonEmptyValues(verbruiksoort, energiesoorten, verbruiken).length;
    if (numberOfNonEmptyVerbruiken === 0) {
      return null;
    }
    return this.getSum(verbruiksoort, energiesoorten, verbruiken) / numberOfNonEmptyVerbruiken;
  }

  protected getMin(verbruiksoort: string, energiesoorten: string[], verbruiken: VerbruikKostenOverzicht[]): number {
    if (energiesoorten.length === 0) {
      return null;
    }
    const nonEmptyValues: number[] = this.getNonEmptyValues(verbruiksoort, energiesoorten, verbruiken);
    if (nonEmptyValues.length === 0) {
      return null;
    }
    return Math.min(...nonEmptyValues);
  }

  protected getMax(verbruiksoort: string, energiesoorten: string[], verbruiken: VerbruikKostenOverzicht[]): number {
    if (energiesoorten.length === 0) {
      return null;
    }
    let nonEmptyValues = this.getNonEmptyValues(verbruiksoort, energiesoorten, verbruiken);
    if (nonEmptyValues.length === 0) {
      return null;
    }
    return Math.max(...nonEmptyValues);
  }

  private getValue(verbruiksoort: string, energiesoorten: string[], verbruik: VerbruikKostenOverzicht): number {
    if (verbruiksoort === 'verbruik') {
      return this.getVerbruikValue(energiesoorten, verbruik);
    } else if (verbruiksoort === 'kosten') {
      return this.getKostenValue(energiesoorten, verbruik);
    }
  }

  private getVerbruikValue(energiesoorten: string[], verbruik: VerbruikKostenOverzicht): number {
    if (energiesoorten[0] === 'gas') {
      return verbruik.gasVerbruik;
    } else {
      return this.allNull([verbruik.stroomVerbruikDal, verbruik.stroomVerbruikNormaal])
        ? null : verbruik.stroomVerbruikDal + verbruik.stroomVerbruikNormaal;
    }
  }

  private getKostenValue(energiesoorten: string[], verbruik: VerbruikKostenOverzicht): number {
    if (energiesoorten.length === 2) {
      return this.allNull([verbruik.stroomKostenDal, verbruik.stroomKostenNormaal, verbruik.gasKosten])
        ? null : verbruik.stroomKostenDal + verbruik.stroomKostenNormaal + verbruik.gasKosten;
    } else if (energiesoorten[0] === 'gas') {
      return verbruik.gasKosten;
    } else {
      return this.allNull([verbruik.stroomKostenDal, verbruik.stroomKostenNormaal])
        ? null : verbruik.stroomKostenDal + verbruik.stroomKostenNormaal;
    }
  }

  private getSum(verbruiksoort: string, energiesoorten: string[], verbruiken: VerbruikKostenOverzicht[]): number {
    const values = this.getNonEmptyValues(verbruiksoort, energiesoorten, verbruiken);
    if (values.length === 0) {
      return null;
    }
    return values.reduce((accumulator, current) => {
      return accumulator + current;
    }, 0);
  }

  private getNonEmptyValues(verbruiksoort: string, energiesoorten: string[], verbruiken: VerbruikKostenOverzicht[]): number[] {
    return verbruiken
      .map(verbruik => this.getValue(verbruiksoort, energiesoorten, verbruik))
      .filter(value => value !== null);
  }

  private allNull(values: any[]): boolean {
    return values.filter(value => value === null).length === values.length;
  }
}
