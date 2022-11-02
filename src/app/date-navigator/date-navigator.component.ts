import {Component, EventEmitter, Input, Output, QueryList, ViewChildren} from '@angular/core';
import {DatePickerDirective, IDatePickerDirectiveConfig} from 'ng2-date-picker';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import dayjs, {Dayjs} from 'dayjs';
import {faChevronLeft, faChevronRight} from '@fortawesome/free-solid-svg-icons';

const selectedDayFormat = 'dd. DD-MM-YYYY';
const selectedMonthFormat = 'MMMM YYYY';

@Component({
  selector: 'home-date-navigator',
  templateUrl: './date-navigator.component.html',
  styleUrls: ['./date-navigator.component.scss']
})
export class DateNavigatorComponent {
  faChevronLeft = faChevronLeft
  faChevronRight = faChevronRight

  @Input()
  public mode: string;

  @Input()
  public responsiveSize = false;

  @Input()
  set selectedDate(selectedDate: Dayjs) {
    if (selectedDate !== undefined) {
      this._selectedDate = selectedDate;
      this.selectedDay.setValue(selectedDate);
      this.selectedMonth.setValue(selectedDate);
      this.selectedYear.setValue(selectedDate.year());
    }
  }

  @Output()
  public navigation = new EventEmitter<Dayjs>();

  @ViewChildren('picker')
  public pickers: QueryList<DatePickerDirective>;

  public form: UntypedFormGroup;

  private _selectedDate: Dayjs;

  public previouslySelectedDate: Dayjs;

  public monthPickerConfiguration: IDatePickerDirectiveConfig;
  public dayPickerConfiguration: IDatePickerDirectiveConfig;

  constructor() {
    this.initDatePickerConfigurations();
    this.createForm();
  }

  private createForm(): void {
    this.form = new UntypedFormGroup({
      selectedDay: new UntypedFormControl({value: this._selectedDate}, [Validators.required]),
      selectedMonth: new UntypedFormControl({value: this._selectedDate}, [Validators.required]),
      selectedYear: new UntypedFormControl('', [Validators.required])
    });
  }

  private initDatePickerConfigurations() {
    this.dayPickerConfiguration = {
      format: selectedDayFormat,
      max: dayjs()
    };
    this.monthPickerConfiguration = {
      format: selectedMonthFormat,
      max: dayjs()
    };
  }

  public datePickerChanged(selectedDate: Dayjs): void {
    if (selectedDate !== undefined && this.previouslySelectedDate !== undefined
      && !selectedDate.isSame(this.previouslySelectedDate)) {
      this.pickers.forEach((item, _index, _array) => {
        item.elemRef.nativeElement.blur();
        item.api.close();
      });
      this.navigation.emit(selectedDate);
    }
    this.previouslySelectedDate = selectedDate;
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
    if (this.mode === 'day') {
      this.selectedDate = this._selectedDate.add(amount, 'days');

    } else if (this.mode === 'month') {
      this.selectedDate = this._selectedDate.add(amount, 'months');

    } else if (this.mode === 'year') {
      this.selectedDate = dayjs(
        `${this.selectedYear.value + amount}-${this._selectedDate.format('MM')}-${this._selectedDate.format('DD')}`);

      // Since year mode is not backed by a datepicker, we'll have to trigger the navigation event
      this.navigation.emit(this._selectedDate.clone());
    }
  }
}
