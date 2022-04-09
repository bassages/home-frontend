import {Component, OnInit} from '@angular/core';
import {StandbyPowerService} from './standby-power.service';
import {ErrorHandingService} from '../error-handling/error-handing.service';
import {StandbyPowerInPeriod} from './standby-power-in-period';
import {NgxSpinnerService} from 'ngx-spinner';
import dayjs, {Dayjs} from 'dayjs';

@Component({
  selector: 'home-standby-power',
  templateUrl: './standby-power.component.html'
})
export class StandbyPowerComponent implements OnInit {

  public standbyPowerInPeriods: StandbyPowerInPeriod[];

  public selectedYear: Dayjs;

  constructor(private readonly standbyPowerService: StandbyPowerService,
              private readonly spinnerService: NgxSpinnerService,
              private readonly errorHandlingService: ErrorHandingService) { }

  public ngOnInit(): void {
    this.selectedYear = dayjs();
    setTimeout(() => this.getAndLoadData());
  }

  private getAndLoadData(): void {
    this.spinnerService.show();

    this.standbyPowerService.get(this.selectedYear.year()).subscribe({
      next: standbyPower => this.loadData(standbyPower),
      error: error => this.errorHandlingService.handleError('Basisverbruik kon niet worden opgehaald', error),
      complete: () => this.spinnerService.hide()
    });
  }

  private loadData(standbyPowerInLastQuarters: StandbyPowerInPeriod[]): void {
    this.standbyPowerInPeriods = standbyPowerInLastQuarters;
  }

  public onYearNavigate(selectedYear: Dayjs): void {
    this.selectedYear = selectedYear;
    this.getAndLoadData();
  }
}
