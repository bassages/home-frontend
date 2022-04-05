import {Component, OnInit} from '@angular/core';
import {MeterstandService} from './meterstand.service';
import {MeterstandOpDag} from './meterstandOpDag';
import sortBy from 'lodash/sortBy';
import {ErrorHandingService} from '../error-handling/error-handing.service';
import {NgxSpinnerService} from 'ngx-spinner';
import dayjs, {Dayjs} from 'dayjs';

@Component({
  selector: 'home-meterstand',
  templateUrl: './meterstand.component.html'
})
export class MeterstandComponent implements OnInit {

  public selectedYearMonth: Dayjs;

  public sortedMeterstandenPerDag: MeterstandOpDag[] = [];

  constructor(private readonly meterstandService: MeterstandService,
              private readonly spinnerService: NgxSpinnerService,
              private readonly errorHandlingService: ErrorHandingService) {
  }

  public ngOnInit(): void {
    this.selectedYearMonth = this.getStartOfCurrentMonth();
    setTimeout(() => this.getMeterstanden());
  }

  // noinspection JSMethodCanBeStatic
  private getStartOfCurrentMonth(): Dayjs {
    return dayjs().startOf('month');
  }

  private getMeterstanden(): void {
    const from = this.selectedYearMonth.clone().startOf('month');
    const to = from.clone().add(1, 'month');

    this.spinnerService.show();

    this.meterstandService.getMeterstanden(from, to).subscribe(
      response => this.sortedMeterstandenPerDag = sortBy<MeterstandOpDag>(response, ['dag']),
      error => this.errorHandlingService.handleError('De meterstanden konden nu niet worden opgehaald', error),
      () => this.spinnerService.hide()
    );
  }

  public yearMonthChanged(selectedYearMonth: Dayjs): void {
    this.selectedYearMonth = selectedYearMonth;
    this.getMeterstanden();
  }
}

