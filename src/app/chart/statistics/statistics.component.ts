import {Component, Input} from '@angular/core';
import {Statistics} from '../../statistics';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'home-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent {

  @Input()
  public statistics: Statistics;

  @Input()
  public decimalFormat: string;

  @Input()
  public additionalClasses = '';

  constructor(private readonly decimalPipe: DecimalPipe) { }

  public format(value: number): string {
    if (value === undefined || value === null || isNaN(value)) {
      return '-';
    }
    let formatted = this.statistics.prefix ? this.statistics.prefix : '';
    formatted = formatted + this.decimalPipe.transform(value, this.decimalFormat);
    formatted = this.statistics.postfix ? formatted + this.statistics.postfix : formatted;
    return formatted
  }
}
