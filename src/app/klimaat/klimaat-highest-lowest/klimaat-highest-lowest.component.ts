import {Component, OnInit} from '@angular/core';
import {KlimaatService} from '../klimaat.service';
import {ErrorHandingService} from '../../error-handling/error-handing.service';
import {Klimaat} from '../klimaat';
import {KlimaatSensor} from '../klimaatSensor';
import sortBy from 'lodash-es/sortBy';
import {zip} from 'rxjs';
import {Router} from '@angular/router';
import {KlimaatSensorService} from '../klimaatsensor.service';
import {NgxSpinnerService} from 'ngx-spinner';
import dayjs, {Dayjs} from 'dayjs';
import {faArrowDown, faArrowUp, faDroplet, faThermometerHalf} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'home-klimaat-highest-lowest',
  templateUrl: './klimaat-highest-lowest.component.html'
})
export class KlimaatHighestLowestComponent implements OnInit {
  faDroplet = faDroplet;
  faThermometerHalf = faThermometerHalf
  faArrowDown = faArrowDown
  faArrowUp = faArrowUp

  public sensors: KlimaatSensor[];
  public sensorCode;
  public sensorType = 'temperatuur';
  public limit = 10;
  public year: Dayjs = dayjs();

  public highestKlimaats: Klimaat[];
  public lowestKlimaats: Klimaat[];

  constructor(private readonly klimaatService: KlimaatService,
              private readonly klimaatSensorService: KlimaatSensorService,
              private readonly spinnerService: NgxSpinnerService,
              private readonly errorHandlingService: ErrorHandingService,
              private readonly router: Router) {
  }

  public ngOnInit(): void {
    setTimeout(() => this.getKlimaatSensors());
  }

  private getKlimaatSensors(): void {
    this.spinnerService.show();

    this.klimaatSensorService.list().subscribe({
      next: response => {
        this.sensors = sortBy<KlimaatSensor>(response, ['omschrijving']);

        if (this.sensors.length > 0) {
          this.sensorCode = this.sensors[0].code;
        }
        this.getAndLoadData();
      },
      error: error => this.errorHandlingService.handleError('De klimaat sensors konden nu niet worden opgehaald', error),
    });
  }

  private getAndLoadData(): void {
    this.spinnerService.show();

    const from: Dayjs = this.getFrom();
    const to: Dayjs = this.getTo();

    const getLowest = this.klimaatService.getTop(this.sensorCode, this.sensorType, 'laagste', from, to, this.limit);
    const getHighest = this.klimaatService.getTop(this.sensorCode, this.sensorType, 'hoogste', from, to, this.limit);

    zip(getLowest, getHighest).subscribe({
      next: klimaats => {
        this.lowestKlimaats = klimaats[0];
        this.highestKlimaats = klimaats[1];
      },
      error: error => this.errorHandlingService.handleError('Hoogste/laagste klimaat kon niet worden opgehaald', error),
      complete: () => this.spinnerService.hide()
    });
  }

  private getFrom(): Dayjs {
    return this.year.month(0).date(1);
  }

  private getTo(): Dayjs {
    return this.year.month(11).date(31);
  }

  public getValuePostFix(sensorType: string): string {
    return this.klimaatService.getValuePostFix(sensorType);
  }

  public getDecimalFormat(sensorType: string): string {
    return this.klimaatService.getDecimalFormat(sensorType);
  }

  public limitChanged(): void {
    this.getAndLoadData();
  }

  public sensorChanged(): void {
    this.getAndLoadData();
  }

  public yearPickerChanged(selectedYear: Dayjs): void {
      this.year = selectedYear;
      this.getAndLoadData();
  }

  public setSensorType(sensorType: string): void {
    this.sensorType = sensorType;
    this.getAndLoadData();
  }

  public navigateToDetailsOfDate(dateTime: Dayjs): void {
    const commands = ['/klimaat/historie'];
    const extras = { queryParams: { sensorCode: this.sensorCode, sensorType: this.sensorType, datum: dateTime.format('DD-MM-YYYY') } };
    this.router.navigate(commands, extras);
  }
}
