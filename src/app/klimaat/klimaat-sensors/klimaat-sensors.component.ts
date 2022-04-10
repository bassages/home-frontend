import {Component, OnInit} from '@angular/core';
import {KlimaatService} from '../klimaat.service';
import {ErrorHandingService} from '../../error-handling/error-handing.service';
import {KlimaatSensor} from '../klimaatSensor';
import sortBy from 'lodash-es/sortBy';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {KlimaatSensorService} from '../klimaatsensor.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {faBan, faCheck, faCircleInfo, faTrash, faTriangleExclamation} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'home-klimaat-sensors',
  templateUrl: './klimaat-sensors.component.html'
})
export class KlimaatSensorsComponent implements OnInit {
  faCircleInfo = faCircleInfo;
  faTriangleExclamation = faTriangleExclamation;
  faBan = faBan;
  faCheck = faCheck;
  faTrash = faTrash;

  public sensors: KlimaatSensor[];

  public form: FormGroup;

  public editMode = false;
  public selectedSensor: KlimaatSensor;

  constructor(private readonly klimaatService: KlimaatService,
              private readonly klimaatSensorService: KlimaatSensorService,
              private readonly spinnerService: NgxSpinnerService,
              private readonly errorHandlingService: ErrorHandingService,
              private readonly modalService: NgbModal) {
  }

  public ngOnInit(): void {
    this.createForm();
    setTimeout(() => this.getKlimaatSensors());
  }

  private createForm(): void {
    this.form = new FormGroup({
      code: new FormControl(''),
      omschrijving: new FormControl('', [Validators.maxLength(255)]),
    });
  }

  private getKlimaatSensors(): void {
    this.spinnerService.show();

    this.klimaatSensorService.list().subscribe({
      next: response => {
        this.sensors = sortBy<KlimaatSensor>(response, ['code']);
      },
      error: error => this.errorHandlingService.handleError('De klimaat sensors konden nu niet worden opgehaald', error),
      complete: () => this.spinnerService.hide()
    });
  }

  get code(): FormControl {
    return this.form.get('code') as FormControl;
  }

  get omschrijving(): FormControl {
    return this.form.get('omschrijving') as FormControl;
  }

  public startEdit(klimaatSensor: KlimaatSensor) {
    this.editMode = true;
    this.selectedSensor = klimaatSensor;

    this.code.setValue(klimaatSensor.code);
    this.omschrijving.setValue(klimaatSensor.omschrijving);
  }

  public save(): void {
    this.spinnerService.show();

    const sensorToSave: KlimaatSensor = new KlimaatSensor();
    sensorToSave.code = this.code.value;
    sensorToSave.omschrijving = this.omschrijving.value;

    this.klimaatSensorService.update(sensorToSave).subscribe({
      next: savedKlimaatSensor => {
        this.selectedSensor.omschrijving = savedKlimaatSensor.omschrijving;
        this.editMode = false;
        this.selectedSensor = null;
      },
      error: error => {
        this.errorHandlingService.handleError('De wijzingen konden nu niet worden opgeslagen', error);
      },
      complete: () => this.spinnerService.hide()
    });
  }

  public delete() {
    this.spinnerService.show();

    this.klimaatSensorService.delete(this.selectedSensor).subscribe({
      next: () => {
        const index = this.sensors.indexOf(this.selectedSensor);
        this.sensors.splice(index, 1);
        this.editMode = false;
      },
      error: error => this.errorHandlingService.handleError('De klimaatsensor kon niet worden verwijderd', error),
      complete: () => this.spinnerService.hide()
    });
  }

  public cancelEdit() {
    this.editMode = null;
    this.selectedSensor = null;
  }

  public openDeletionConformationDialog(deletionConformationDialogTemplate) {
    this.modalService.open(deletionConformationDialogTemplate).result.then(
    _result => this.delete(),
    _reason => console.info('Cancel deletion'));
  }
}
