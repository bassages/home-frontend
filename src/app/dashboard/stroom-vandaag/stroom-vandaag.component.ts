import {Component, OnDestroy, OnInit} from '@angular/core';
import {CurrencyPipe, DecimalPipe} from '@angular/common';
import {Subscription, switchMap, timer} from 'rxjs';
import dayjs from 'dayjs/esm';
import {EnergieVerbruikService} from '../../energie-verbruik/energie-verbruik.service';
import {VerbruikInUur} from '../../energie-verbruik/verbruikInUur';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faPlugCircleBolt} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'home-stroom-vandaag',
  templateUrl: './stroom-vandaag.component.html',
  imports: [CurrencyPipe, DecimalPipe, FaIconComponent]
})
export class StroomVandaagComponent implements OnInit, OnDestroy {
  public verbruikKwh: number | null;
  public kostenEuro: number | null;

  private verbruikSubscription: Subscription;

  constructor(private readonly energieVerbruikService: EnergieVerbruikService) { }

  public ngOnInit(): void {
    this.verbruikSubscription = timer(0, 60_000).pipe(
      switchMap(() => this.energieVerbruikService.getVerbruikPerUurOpDag(dayjs()))
    ).subscribe(uren => this.setVerbruikEnKosten(uren));
  }

  public ngOnDestroy(): void {
    this.verbruikSubscription.unsubscribe();
  }

  private setVerbruikEnKosten(uren: VerbruikInUur[]): void {
    this.verbruikKwh = this.sumAvailable(uren.flatMap(uur => [uur.stroomVerbruikDal, uur.stroomVerbruikNormaal]));
    this.kostenEuro = this.sumAvailable(uren.flatMap(uur => [uur.stroomKostenDal, uur.stroomKostenNormaal]));
  }

  private sumAvailable(values: number[]): number | null {
    const availableValues = values.filter(value => value != null);
    return availableValues.length > 0 ? availableValues.reduce((total, value) => total + value, 0) : null;
  }

  protected readonly faPlugCircleBolt = faPlugCircleBolt;
}
