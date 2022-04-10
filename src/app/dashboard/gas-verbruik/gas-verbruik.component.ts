import {Component, OnDestroy, OnInit} from '@angular/core';
import {RxStompService} from '@stomp/ng2-stompjs';
import {Observable, Subscription} from 'rxjs';
import {Message} from '@stomp/stompjs';
import {Meterstand} from '../../meterstand/meterstand';
import {Led, LedState} from '../led';
import {MeterstandService} from '../../meterstand/meterstand.service';
import {EnergieVerbruikService} from '../../energie-verbruik/energie-verbruik.service';
import isNumber from 'lodash-es/isNumber';
import {VerbruikOpDag} from '../../energie-verbruik/verbruikOpDag';
import {GemiddeldVerbruikInPeriod} from '../../energie-verbruik/gemiddeldVerbruikInPeriod';
import {Router} from '@angular/router';
import dayjs from 'dayjs';
import {faFireFlameCurved, faMoon, faSun} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'home-gas-verbruik',
  templateUrl: './gas-verbruik.component.html',
  styleUrls: ['../ledbar.scss', './gas-verbruik.component.scss']
})
export class GasVerbruikComponent implements OnInit, OnDestroy {
  faFireFlameCurved = faFireFlameCurved;
  faMoon = faMoon;
  faSun = faSun;

  public LedState = LedState;

  public meterstand: Meterstand;
  public verbruikVandaag: VerbruikOpDag;
  public gemiddeldVerbruikPerDagInAfgelopenWeek: GemiddeldVerbruikInPeriod;

  public gasLeds: Led[] = [];

  private meterstandObserver: Observable<Message>;
  private meterstandSubscription: Subscription;

  constructor(private readonly stompService: RxStompService,
              private readonly router: Router,
              private readonly meterstandService: MeterstandService,
              private readonly energieVerbruikService: EnergieVerbruikService) { }

  public ngOnInit(): void {
    this.subscribeToMeterstandUpdates();

    this.getGemiddeldVerbruikAfgelopenWeek();
    this.getVerbruikVandaag();
    this.getMostRecentMeterstand();
  }

  private getMostRecentMeterstand() {
    this.meterstandService.getMostRecent().subscribe(mostRecentMeterstand => this.meterstand = mostRecentMeterstand);
  }

  public ngOnDestroy() {
    this.meterstandSubscription.unsubscribe();
  }

  private subscribeToMeterstandUpdates() {
    this.meterstandObserver = this.stompService.watch('/topic/meterstand');
    this.meterstandSubscription = this.meterstandObserver.subscribe((message) => this.meterstand = new Meterstand(message.body));
  }

  private getVerbruikVandaag() {
    const from = dayjs().startOf('day');
    const to = from.add(1, 'day');

    this.energieVerbruikService.getVerbruikPerDag(from, to).subscribe((verbruikPerDag: VerbruikOpDag[]) => {
        if (verbruikPerDag) {
          this.verbruikVandaag = verbruikPerDag[0];
          this.setGasVerbruikVandaagLeds();
        }
      }
    );
  }

  private getGemiddeldVerbruikAfgelopenWeek() {
    const to = dayjs().startOf('day');
    const from = to.subtract(6, 'day');

    this.energieVerbruikService.getGemiddeldVerbruikPerDag(from, to).subscribe(
      (gemiddeldVerbruikPerDagInAfgelopenWeek: GemiddeldVerbruikInPeriod) => {
        this.gemiddeldVerbruikPerDagInAfgelopenWeek = gemiddeldVerbruikPerDagInAfgelopenWeek;
        this.setGasVerbruikVandaagLeds();
      }
    );
  }

  private setGasVerbruikVandaagLeds() {
    if (this.verbruikVandaag && isNumber(this.verbruikVandaag.gasVerbruik)
      && this.gemiddeldVerbruikPerDagInAfgelopenWeek && isNumber(this.gemiddeldVerbruikPerDagInAfgelopenWeek.gasVerbruik)) {

      const procentueleVeranderingTovAfgelopenWeek: number = this.getProcentueleVeranderingTovAfgelopenWeek();

      const gasLeds: Led[] = new Array<Led>(10);

      gasLeds[9] = this.createLed(procentueleVeranderingTovAfgelopenWeek, 50);
      gasLeds[8] = this.createLed(procentueleVeranderingTovAfgelopenWeek, 40);
      gasLeds[7] = this.createLed(procentueleVeranderingTovAfgelopenWeek, 30);
      gasLeds[6] = this.createLed(procentueleVeranderingTovAfgelopenWeek, 20);
      gasLeds[5] = this.createLed(procentueleVeranderingTovAfgelopenWeek, 10);
      gasLeds[4] = this.createLed(procentueleVeranderingTovAfgelopenWeek, 0);
      gasLeds[3] = this.createLed(procentueleVeranderingTovAfgelopenWeek, -10);
      gasLeds[2] = this.createLed(procentueleVeranderingTovAfgelopenWeek, -20);
      gasLeds[1] = this.createLed(procentueleVeranderingTovAfgelopenWeek, -30);
      gasLeds[0] = new Led(LedState.ON);

      this.gasLeds = gasLeds;
    }
  }

  // noinspection JSMethodCanBeStatic
  private createLed(procentueleVeranderingTovAfgelopenWeek: number, onFromValue: number) {
    return new Led(procentueleVeranderingTovAfgelopenWeek >= onFromValue ? LedState.ON : LedState.OFF);
  }

  private getProcentueleVeranderingTovAfgelopenWeek() {
    return ((this.verbruikVandaag.gasVerbruik - this.gemiddeldVerbruikPerDagInAfgelopenWeek.gasVerbruik)
      / this.gemiddeldVerbruikPerDagInAfgelopenWeek.gasVerbruik) * 100;
  }

  public navigateToVerbruikDetails() {
    this.router.navigate(['/energie', 'verbruik', 'uur'], {queryParams: { energiesoort: 'gas' }});
  }
}
