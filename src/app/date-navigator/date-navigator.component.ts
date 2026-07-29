import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import dayjs, {Dayjs} from 'dayjs/esm';
import {faChevronLeft, faChevronRight} from '@fortawesome/free-solid-svg-icons';
import { MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import {
  DATE_NAVIGATOR_DATE_FORMATS,
  DateNavigatorDateAdapter,
  DateNavigatorDisplayMode
} from './date-navigator-date-adapter';
import { NgClass } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatInput } from '@angular/material/input';

@Component({
    selector: 'home-date-navigator',
    templateUrl: './date-navigator.component.html',
    styleUrls: ['./date-navigator.component.scss'],
    providers: [
        {
            provide: DateAdapter,
            useClass: DateNavigatorDateAdapter
        },
        {
            provide: MAT_DATE_FORMATS,
            useValue: DATE_NAVIGATOR_DATE_FORMATS
        }
    ],
    imports: [FormsModule, ReactiveFormsModule, NgClass, FaIconComponent, MatInput, MatDatepickerInput, MatDatepicker]
})
export class DateNavigatorComponent implements OnChanges {
  faChevronLeft = faChevronLeft
  faChevronRight = faChevronRight

  @Input()
  public mode: DateNavigatorDisplayMode;

  @Input()
  public responsiveSize = false;

  @Input()
  set selectedDate(selectedDate: Dayjs) {
    if (selectedDate !== undefined && selectedDate?.isValid()) {
      this._selectedDate = selectedDate;
      this.updateSelectedDayAndMonthControls(selectedDate);
      this.previouslySelectedDate = selectedDate;
    }
  }

  @Output()
  public navigation = new EventEmitter<Dayjs>();

  public form: UntypedFormGroup;

  private _selectedDate: Dayjs;

  public previouslySelectedDate: Dayjs;

  @ViewChild('dayPicker')
  private dayPicker?: MatDatepicker<Date>;

  @ViewChild('monthPicker')
  private monthPicker?: MatDatepicker<Date>;

  @ViewChild('yearPicker')
  private yearPicker?: MatDatepicker<Date>;

  constructor(private readonly dateAdapter: DateAdapter<Date>) {
    this.createForm();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['mode']) {
      this.syncDateAdapterMode();
    }
  }

  private createForm(): void {
    this.form = new UntypedFormGroup({
      selectedDay: new UntypedFormControl(null, [Validators.required]),
      selectedMonth: new UntypedFormControl(null, [Validators.required]),
      selectedYear: new UntypedFormControl(null, [Validators.required])
    });
  }

  public datePickerChanged(value: Date | null, mode: 'day' | 'month' | 'year'): void {
    const selectedDate = this.toSelectedDate(value, mode);

    if (!selectedDate && this._selectedDate?.isValid()) {
      this.updateSelectedDayAndMonthControls(this._selectedDate);
      this.previouslySelectedDate = this._selectedDate;
      return;
    }

    if (selectedDate !== undefined && this._selectedDate !== undefined
      && !selectedDate.isSame(this._selectedDate)) {
      this.selectedDate = selectedDate;
      this.navigation.emit(selectedDate);
    }
    this.previouslySelectedDate = selectedDate;
  }

  public openDayPicker(event: MouseEvent): void {
    event.preventDefault();
    this.setDateAdapterMode('day');
    this.openPicker(this.dayPicker);
  }

  public openMonthPicker(event: MouseEvent): void {
    event.preventDefault();
    this.setDateAdapterMode('month');
    this.openPicker(this.monthPicker);
  }

  public openYearPicker(event: MouseEvent): void {
    event.preventDefault();
    this.setDateAdapterMode('year');
    this.openPicker(this.yearPicker);
  }

  public get maxDate(): Date {
    return new Date();
  }

  public monthSelected(value: Date, datepicker: MatDatepicker<Date>): void {
    this.setDateAdapterMode('month');
    this.datePickerChanged(value, 'month');
    datepicker.close();
  }

  public yearSelected(value: Date, datepicker: MatDatepicker<Date>): void {
    this.setDateAdapterMode('year');
    this.datePickerChanged(value, 'year');
    datepicker.close();
  }

  private toSelectedDate(value: Date | null, mode: 'day' | 'month' | 'year'): Dayjs | undefined {
    if (!value) {
      return undefined;
    }

    const parsedDate = dayjs(value);
    if (!parsedDate.isValid()) {
      return undefined;
    }

    if (mode === 'month') {
      return parsedDate.startOf('month');
    }

    if (mode === 'year') {
      if (this._selectedDate?.isValid()) {
        return this._selectedDate.year(parsedDate.year());
      }
      return parsedDate.startOf('year');
    }

    return parsedDate;
  }

  get selectedDay(): UntypedFormControl {
    return this.form.get('selectedDay') as UntypedFormControl;
  }

  get selectedMonth(): UntypedFormControl {
    return this.form.get('selectedMonth') as UntypedFormControl;
  }

  get selectedYear(): UntypedFormControl {
    return this.form.get('selectedYear') as UntypedFormControl;
  }

  public isUpNavigationDisabled(): boolean {
    if (this._selectedDate === undefined) {
      return true;
    }

    const now: Dayjs = dayjs();
    if (this.mode === 'day') {
      return now.date() === this._selectedDate.date()
        && now.month() === this._selectedDate.month()
        && now.year() === this._selectedDate.year();
    } else if (this.mode === 'month') {
      return now.month() === this._selectedDate.month() && now.year() === this._selectedDate.year();
    } else if (this.mode === 'year') {
      return now.year() === this._selectedDate.year();
    }
  }

  public navigate(amount: number): void {
    let nextDate: Dayjs;

    if (this.mode === 'day') {
      nextDate = this._selectedDate.add(amount, 'days');

    } else if (this.mode === 'month') {
      nextDate = this._selectedDate.add(amount, 'months');

    } else if (this.mode === 'year') {
      nextDate = this._selectedDate.add(amount, 'years');
    } else {
      return;
    }

    this.selectedDate = nextDate;
    this.navigation.emit(nextDate.clone());
  }

  private updateSelectedDayAndMonthControls(selectedDate: Dayjs): void {
    this.selectedDay.setValue(selectedDate.toDate(), {emitEvent: false});
    this.selectedMonth.setValue(selectedDate.startOf('month').toDate(), {emitEvent: false});
    this.selectedYear.setValue(selectedDate.startOf('year').toDate(), {emitEvent: false});
  }

  private openPicker(datepicker?: MatDatepicker<Date>): void {
    if (!datepicker) {
      return;
    }

    datepicker.open();
  }

  private syncDateAdapterMode(): void {
    this.setDateAdapterMode(this.mode ?? 'day');
  }

  private setDateAdapterMode(mode: DateNavigatorDisplayMode): void {
    const adapter = this.dateAdapter as DateNavigatorDateAdapter;
    adapter.setDisplayMode(mode);
  }
}
