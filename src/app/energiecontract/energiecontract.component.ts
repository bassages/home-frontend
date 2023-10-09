import {Component, OnInit, ViewChild} from '@angular/core';
import {Energiecontract} from './energiecontract';
import {ErrorHandingService} from '../error-handling/error-handing.service';
import {EnergiecontractService} from './energiecontract.service';
import sortBy from 'lodash-es/sortBy';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {DatePickerDirective, IDatePickerDirectiveConfig} from 'ng2-date-picker';
import {DecimalPipe} from '@angular/common';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgxSpinnerService} from 'ngx-spinner';
import dayjs from 'dayjs';
import {
  faBan,
  faCalendarDays,
  faCheck,
  faCircleInfo,
  faCirclePlus,
  faTrash,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';

const datePickerFormat = 'DD-MM-YYYY';
const pricePattern = /^\d(,\d{1,6})*$/;

@Component({
  selector: 'home-energiecontract',
  templateUrl: './energiecontract.component.html'
})
export class EnergiecontractComponent implements OnInit {
  faCirclePlus = faCirclePlus;
  faCircleInfo = faCircleInfo;
  faCalendarDays = faCalendarDays;
  faTriangleExclamation = faTriangleExclamation;
  faBan = faBan;
  faCheck = faCheck;
  faTrash = faTrash;

  public energiecontracten: Energiecontract[];

  public form: UntypedFormGroup;

  public datePickerConfiguration: IDatePickerDirectiveConfig;

  public editMode = false;
  public selectedEnergiecontract: Energiecontract;

  constructor(private readonly energiecontractService: EnergiecontractService,
              private readonly spinnerService: NgxSpinnerService,
              private readonly errorHandlingService: ErrorHandingService,
              private readonly decimalPipe: DecimalPipe,
              private readonly modalService: NgbModal) {
  }

  @ViewChild('datePicker', {static: true})
  public datePicker: DatePickerDirective;

  public ngOnInit(): void {
    this.datePickerConfiguration = {
      format: datePickerFormat,
    };
    this.createForm();
    setTimeout(() => this.getEnergieContracten());
  }

  private createForm(): void {
    this.form = new UntypedFormGroup({
      leverancier: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
      remark: new UntypedFormControl('', [Validators.maxLength(2048)]),
      gas: new UntypedFormControl('', [Validators.required, Validators.pattern(pricePattern)]),
      stroomNormaalTarief: new UntypedFormControl('', [Validators.required, Validators.pattern(pricePattern)]),
      stroomDalTarief: new UntypedFormControl('', Validators.pattern(pricePattern)),
      selectedDate: new UntypedFormControl({value: null}, [Validators.required])
    });
  }

  private getEnergieContracten(): void {
    this.spinnerService.show();

    this.energiecontractService.getAll().subscribe({
      next: response => this.energiecontracten = this.sort(response),
      error: error => this.errorHandlingService.handleError('De energiecontracten konden nu niet worden opgehaald', error),
      complete: () => { this.spinnerService.hide() }
    });
  }

  // noinspection JSMethodCanBeStatic
  private sort(energiecontracten: Energiecontract[]): Energiecontract[] {
    return sortBy<Energiecontract>(energiecontracten, ['validFrom']);
  }

  get selectedDate(): UntypedFormControl {
    return this.form.get('selectedDate') as UntypedFormControl;
  }

  get leverancier(): UntypedFormControl {
    return this.form.get('leverancier') as UntypedFormControl;
  }

  get remark(): UntypedFormControl {
    return this.form.get('remark') as UntypedFormControl;
  }

  get gas(): UntypedFormControl {
    return this.form.get('gas') as UntypedFormControl;
  }

  get stroomNormaalTarief(): UntypedFormControl {
    return this.form.get('stroomNormaalTarief') as UntypedFormControl;
  }

  get stroomDalTarief(): UntypedFormControl {
    return this.form.get('stroomDalTarief') as UntypedFormControl;
  }

  public startAdd(): void {
    this.editMode = true;
    this.selectedEnergiecontract = null;

    this.leverancier.setValue('');
    this.remark.setValue('');
    this.gas.setValue('');
    this.stroomNormaalTarief.setValue('');
    this.stroomDalTarief.setValue('');
    this.selectedDate.setValue(dayjs());
  }

  public startEdit(energiecontract: Energiecontract): void {
    this.editMode = true;
    this.selectedEnergiecontract = energiecontract;

    this.leverancier.setValue(energiecontract.leverancier);
    this.remark.setValue(energiecontract.remark);
    this.gas.setValue(this.formatPrice(energiecontract.gasPerKuub));
    this.stroomNormaalTarief.setValue(this.formatPrice(energiecontract.stroomPerKwhNormaalTarief));
    this.stroomDalTarief.setValue(this.formatPrice(energiecontract.stroomPerKwhDalTarief));
    this.selectedDate.setValue(energiecontract.validFrom);
  }

  private formatPrice(price: number): string {
    return this.decimalPipe.transform(price, '1.6-6');
  }

  public cancelEdit(): void {
    this.editMode = null;
    this.selectedEnergiecontract = null;
  }

  public save(): void {
    this.spinnerService.show();

    const energiecontract: Energiecontract = this.selectedEnergiecontract ? this.selectedEnergiecontract : new Energiecontract();
    energiecontract.validFrom = dayjs(this.selectedDate.value, this.datePickerConfiguration.format);
    energiecontract.leverancier = this.leverancier.value;

    if (this.remark.value) {
      energiecontract.remark = this.remark.value;
    }

    energiecontract.gasPerKuub = this.toFloat(this.gas.value);
    energiecontract.stroomPerKwhNormaalTarief = this.toFloat(this.stroomNormaalTarief.value);
    energiecontract.stroomPerKwhDalTarief = this.toFloat(this.stroomDalTarief.value);

    this.energiecontractService.save(energiecontract).subscribe({
      next: savedEnergiecontract => {
        if (this.selectedEnergiecontract) {
          this.selectedEnergiecontract.id = savedEnergiecontract.id;
        } else {
          this.energiecontracten.push(savedEnergiecontract);
          this.sort(this.energiecontracten);
        }
        this.editMode = false;
        this.selectedEnergiecontract = null;
      },
      error: error => {
        this.errorHandlingService.handleError('Het energiecontract kon nu niet worden opgeslagen', error);
      },
      complete: () => { this.spinnerService.hide() }
    });
  }

  public delete(): void {
    this.spinnerService.show();
    this.energiecontractService.delete(this.selectedEnergiecontract.id).subscribe({
      next: () => {
        const index = this.energiecontracten.indexOf(this.selectedEnergiecontract);
        this.energiecontracten.splice(index, 1);
        this.editMode = false;
      },
      error: error => this.errorHandlingService.handleError('Het energiecontract kon niet worden verwijderd', error),
      complete: () => { this.spinnerService.hide() }
    });
  }

  public openDatePicker(): void {
    this.datePicker.api.open();
  }

  // noinspection JSMethodCanBeStatic
  private toFloat(value: string): number {
    if (value === null || value === undefined) {
      return null;
    }
    const parsed: number = parseFloat(value.replace(',', '.'));
    if (isNaN(parsed)) {
      return null;
    }
    return parsed;
  }

  public openDeletionConformationDialog(deletionConformationDialogTemplate) {
    this.modalService.open(deletionConformationDialogTemplate).result.then(
      _result => this.delete(),
      _reason => console.info('Cancel deletion'));
  }
}
