import {Component, OnDestroy, OnInit} from '@angular/core';
import {RxStomp} from '@stomp/rx-stomp';
import {Observable, Subscription} from 'rxjs';
import {Message} from '@stomp/stompjs';
import {OpgenomenVermogen} from '../../opgenomen-vermogen/opgenomen-vermogen';
import {OpgenomenVermogenService} from '../../opgenomen-vermogen/opgenomen-vermogen.service';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faPlugCircleBolt} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'home-stroom-fases',
  templateUrl: './stroom-fases.component.html',
  imports: [
    FaIconComponent
  ],
  styleUrls: ['./stroom-fases.component.scss']
})
export class StroomFasesComponent implements OnInit, OnDestroy {
  public opgenomenVermogen: OpgenomenVermogen;

  private opgenomenVermogenObserver: Observable<Message>;
  private opgenomenVermogenSubscription: Subscription;

  constructor(private readonly opgenomenVermogenService: OpgenomenVermogenService,
              private readonly stompService: RxStomp) { }

  public ngOnInit(): void {
    this.subscribeToOpgenomenVermogenUpdates();
    this.getMostRecentOpgenomenVermogen();
  }

  public ngOnDestroy(): void {
    this.opgenomenVermogenSubscription.unsubscribe();
  }

  private getMostRecentOpgenomenVermogen(): void {
    this.opgenomenVermogenService.getMostRecent().subscribe(mostRecentOpgenomenVermogen => {
      this.opgenomenVermogen = mostRecentOpgenomenVermogen;
    });
  }

  private subscribeToOpgenomenVermogenUpdates(): void {
    this.opgenomenVermogenObserver = this.stompService.watch('/topic/opgenomen-vermogen');
    this.opgenomenVermogenSubscription = this.opgenomenVermogenObserver.subscribe((message) => {
      const json = JSON.parse(message.body);
      const opgenomenVermogen = new OpgenomenVermogen();
      opgenomenVermogen.activePowerTotalInWatts = json['activePowerTotalInWatts'];
      opgenomenVermogen.activePowerL1InWatts = json['activePowerL1InWatts'];
      opgenomenVermogen.activePowerL2InWatts = json['activePowerL2InWatts'];
      opgenomenVermogen.activePowerL3InWatts = json['activePowerL3InWatts'];
      opgenomenVermogen.voltageL1 = json['voltageL1'];
      opgenomenVermogen.voltageL2 = json['voltageL2'];
      opgenomenVermogen.voltageL3 = json['voltageL3'];
      opgenomenVermogen.instantaneousCurrentL1Ampere = json['instantaneousCurrentL1Ampere'];
      opgenomenVermogen.instantaneousCurrentL2Ampere = json['instantaneousCurrentL2Ampere'];
      opgenomenVermogen.instantaneousCurrentL3Ampere = json['instantaneousCurrentL3Ampere'];
      opgenomenVermogen.tariefIndicator = json['tariefIndicator'];
      opgenomenVermogen.datumtijd = new Date(json['datumtijd']);
      this.opgenomenVermogen = opgenomenVermogen;
    });
  }

  public getPhaseShareInPercent(phasePowerInWatts: number): number | null {
    const totalPowerInWatts = this.opgenomenVermogen?.activePowerTotalInWatts ?? 0;
    if (totalPowerInWatts <= 0 || phasePowerInWatts == null) {
      return null;
    }
    return (phasePowerInWatts / totalPowerInWatts) * 100;
  }

  public getPhaseShareLabel(phasePowerInWatts: number): string {
    const share = this.getPhaseShareInPercent(phasePowerInWatts);
    if (share == null) {
      return '-';
    }
    return `${share.toFixed(1)}%`;
  }

  protected readonly faPlugCircleBolt = faPlugCircleBolt;
}

