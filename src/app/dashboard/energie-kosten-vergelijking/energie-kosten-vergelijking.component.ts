import {Component, OnDestroy, OnInit} from '@angular/core';
import {CurrencyPipe, DecimalPipe} from '@angular/common';
import {forkJoin, map, Subscription, switchMap, timer} from 'rxjs';
import dayjs, {Dayjs} from 'dayjs/esm';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faCircleInfo, faEuroSign} from '@fortawesome/free-solid-svg-icons';
import {NgbTooltip} from '@ng-bootstrap/ng-bootstrap';
import {EnergieVerbruikService} from '../../energie-verbruik/energie-verbruik.service';
import {VerbruikInUur} from '../../energie-verbruik/verbruikInUur';
import {VerbruikOpDag} from '../../energie-verbruik/verbruikOpDag';

interface EnergieKostenVergelijking {
  jaar: number;
  kostenEuro: number | null;
  kostenVeranderingProcent: number | null;
}

@Component({
  selector: 'home-energie-kosten-vergelijking',
  templateUrl: './energie-kosten-vergelijking.component.html',
  imports: [CurrencyPipe, DecimalPipe, FaIconComponent, NgbTooltip]
})
export class EnergieKostenVergelijkingComponent implements OnInit, OnDestroy {
  public vergelijkingen: EnergieKostenVergelijking[] = [];
  public loading = true;
  public error = false;

  private verbruikSubscription: Subscription;

  constructor(private readonly energieVerbruikService: EnergieVerbruikService) { }

  public ngOnInit(): void {
    this.verbruikSubscription = timer(0, 5 * 60_000).pipe(
      switchMap(() => {
        const now = dayjs();
        return forkJoin([now.year(), now.year() - 1, now.year() - 2, now.year() - 3]
          .map(jaar => this.getVergelijking(jaar, now)));
      })
    ).subscribe({
      next: vergelijkingen => {
        const huidig = vergelijkingen[0];
        this.vergelijkingen = vergelijkingen.map((vergelijking, index) => ({
          ...vergelijking,
          kostenVeranderingProcent: index === 0 ? null : this.calculateChange(huidig.kostenEuro, vergelijking.kostenEuro)
        }));
        this.loading = false;
        this.error = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  public ngOnDestroy(): void {
    this.verbruikSubscription.unsubscribe();
  }

  private getVergelijking(jaar: number, now: Dayjs) {
    const maandStart = dayjs().year(jaar).month(now.month()).startOf('month');
    const dagVanMaand = Math.min(now.date(), maandStart.daysInMonth());
    const peildatum = maandStart.date(dagVanMaand);
    const periodeStart = peildatum.subtract(27, 'day');

    return forkJoin([
      this.energieVerbruikService.getVerbruikPerDag(periodeStart, peildatum.subtract(1, 'day')),
      this.energieVerbruikService.getVerbruikPerUurOpDag(peildatum)
    ]).pipe(map(([dagen, uren]) => this.toVergelijking(jaar, dagen, uren, now.hour())));
  }

  private toVergelijking(jaar: number, dagen: VerbruikOpDag[], uren: VerbruikInUur[], hour: number): EnergieKostenVergelijking {
    const peildagUren = uren.filter(uur => uur.uur <= hour);

    return {
      jaar,
      kostenEuro: this.sumAvailable([
        ...dagen.flatMap(dag => [dag.stroomKostenDal, dag.stroomKostenNormaal, dag.gasKosten]),
        ...peildagUren.flatMap(uur => [uur.stroomKostenDal, uur.stroomKostenNormaal, uur.gasKosten])
      ]),
      kostenVeranderingProcent: null
    };
  }

  private calculateChange(current: number | null, previous: number | null): number | null {
    return current === null || previous === null || previous === 0
      ? null
      : (current - previous) / previous * 100;
  }

  public getChangeArrow(change: number): string {
    return change > 0 ? '↑' : change < 0 ? '↓' : '→';
  }

  public getAbsoluteChange(change: number): number {
    return Math.abs(change);
  }

  private sumAvailable(values: number[]): number | null {
    const availableValues = values.filter(value => value != null);
    return availableValues.length > 0 ? availableValues.reduce((total, value) => total + value, 0) : null;
  }

  protected readonly faEuroSign = faEuroSign;
  protected readonly faCircleInfo = faCircleInfo;
}
