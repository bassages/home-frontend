import {Component, OnInit} from '@angular/core';
import * as moment from 'moment';
import {Moment} from 'moment';
import {ErrorHandingService} from '../../error-handling/error-handing.service';
import {KlimaatService} from '../klimaat.service';
import {KlimaatSensor} from '../klimaatSensor';
import {GemiddeldeKlimaatPerMaand} from '../gemiddeldeKlimaatPerMaand';
import sortBy from 'lodash/sortBy';
import {KlimaatSensorService} from '../klimaatsensor.service';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'home-klimaat-average',
  templateUrl: './klimaat-average.component.html'
})
export class KlimaatAverageComponent implements OnInit {

  public sensors: KlimaatSensor[];
  public sensorType = 'temperatuur';
  public sensorCode: string;
  public year: Moment = moment();

  public gemiddeldeKlimaatPerMaand: GemiddeldeKlimaatPerMaand[];

  constructor(private readonly klimaatService: KlimaatService,
              private readonly klimaatSensorService: KlimaatSensorService,
              private readonly spinnerService: NgxSpinnerService,
              private readonly errorHandlingService: ErrorHandingService) {
  }

  public ngOnInit(): void {
    setTimeout(() => this.getKlimaatSensors());
  }

  private getKlimaatSensors(): void {
    this.spinnerService.show();

    this.klimaatSensorService.list().subscribe(
      response => {
        this.sensors = sortBy<KlimaatSensor>(response, ['omschrijving']);

        if (this.sensors.length > 0) {
          this.sensorCode = this.sensors[0].code;
        }
        this.getAndLoadData();
      },
      error => this.errorHandlingService.handleError('De klimaat sensors konden niet worden opgehaald', error),
    );
  }

  private getAndLoadData() {
    this.spinnerService.show();
    this.gemiddeldeKlimaatPerMaand = [];

    this.klimaatService.getGemiddeldeKlimaatPerMaand(this.sensorCode, this.sensorType, this.year.year()).subscribe(
      gemiddeldeKlimaatPerMaand => { this.gemiddeldeKlimaatPerMaand = gemiddeldeKlimaatPerMaand; },
      error => this.errorHandlingService.handleError('Gemiddelde klimaat kon niet worden opgehaald', error),
      () => this.spinnerService.hide()
    );
  }

  public getValuePostFix(sensorType: string): string {
    return this.klimaatService.getValuePostFix(sensorType);
  }

  public getDecimalFormat(sensorType: string): string {
    return this.klimaatService.getDecimalFormat(sensorType);
  }

  public sensorChanged(): void {
    this.getAndLoadData();
  }

  public yearPickerChanged(selectedYear: Moment): void {
    this.year = selectedYear;
    this.getAndLoadData();
  }

  public setSensorType(sensorType: string): void {
    this.sensorType = sensorType;
    this.getAndLoadData();
  }
}
