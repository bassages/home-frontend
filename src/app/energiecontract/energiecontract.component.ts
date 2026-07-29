import {Component, OnInit, ViewChild} from '@angular/core';
import {Energiecontract} from './energiecontract';
import {ErrorHandingService} from '../error-handling/error-handing.service';
import {EnergiecontractService} from './energiecontract.service';
import sortBy from 'lodash-es/sortBy';
import { UntypedFormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DecimalPipe, NgClass, CurrencyPipe, DatePipe } from '@angular/common';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgxSpinnerService} from 'ngx-spinner';
import dayjs from 'dayjs/esm';
import {
  faBan,
  faCheck,
  faCircleInfo,
  faCirclePlus,
  faTrash,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';
import { MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import {
  DayjsMaterialDateAdapter,
  DAYJS_MATERIAL_DATE_FORMATS,
  MaterialDateDisplayMode
} from '../shared/material/dayjs-material-date-adapter';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatInput } from '@angular/material/input';

const pricePattern = /^\d(,\d{1,6})*$/;

@Component({
    selector: 'home-energiecontract',
    templateUrl: './energiecontract.component.html',
    providers: [
        {
            provide: DateAdapter,
            useClass: DayjsMaterialDateAdapter
        },
        {
            provide: MAT_DATE_FORMATS,
            useValue: DAYJS_MATERIAL_DATE_FORMATS
        }
    ],
    imports: [FaIconComponent, NgClass, FormsModule, ReactiveFormsModule, MatInput, MatDatepickerInput, MatDatepicker, CurrencyPipe, DatePipe]
})
export class EnergiecontractComponent implements OnInit {
  faCirclePlus = faCirclePlus;
  faCircleInfo = faCircleInfo;
  faTriangleExclamation = faTriangleExclamation;
  faBan = faBan;
  faCheck = faCheck;
  faTrash = faTrash;

  public energiecontracten: Energiecontract[];

  public form: UntypedFormGroup;

  public editMode = false;
  public selectedEnergiecontract: Energiecontract;

  @ViewChild('fromDatePicker')
  private fromDatePicker?: MatDatepicker<Date>;

  constructor(private readonly energiecontractService: EnergiecontractService,
              private readonly spinnerService: NgxSpinnerService,
              private readonly errorHandlingService: ErrorHandingService,
              private readonly decimalPipe: DecimalPipe,
              private readonly modalService: NgbModal,
              private readonly dateAdapter: DateAdapter<Date>) {
  }

  public ngOnInit(): void {
    this.setDateAdapterMode('day');
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
      selectedDate: new UntypedFormControl(null, [Validators.required])
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
    this.selectedDate.setValue(dayjs().toDate());
  }

  public startEdit(energiecontract: Energiecontract): void {
    this.editMode = true;
    this.selectedEnergiecontract = energiecontract;

    this.leverancier.setValue(energiecontract.leverancier);
    this.remark.setValue(energiecontract.remark);
    this.gas.setValue(this.formatPrice(energiecontract.gasPerKuub));
    this.stroomNormaalTarief.setValue(this.formatPrice(energiecontract.stroomPerKwhNormaalTarief));
    this.stroomDalTarief.setValue(this.formatPrice(energiecontract.stroomPerKwhDalTarief));
    this.selectedDate.setValue(energiecontract.validFrom?.isValid() ? energiecontract.validFrom.toDate() : null);
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
    energiecontract.validFrom = dayjs(this.selectedDate.value as Date);
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

  public get maxDate(): Date {
    return new Date();
  }

  public openDatePicker(event: MouseEvent): void {
    event.preventDefault();
    this.setDateAdapterMode('day');
    this.fromDatePicker?.open();
  }

  public asDate(value: dayjs.Dayjs): Date | null {
    return value?.isValid() ? value.toDate() : null;
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

  private setDateAdapterMode(mode: MaterialDateDisplayMode): void {
    const adapter = this.dateAdapter as DayjsMaterialDateAdapter;
    adapter.setDisplayMode(mode);
  }
}
