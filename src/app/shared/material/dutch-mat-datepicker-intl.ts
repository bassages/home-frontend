import {Injectable} from '@angular/core';
import {MatDatepickerIntl} from '@angular/material/datepicker';

@Injectable()
export class DutchMatDatepickerIntl extends MatDatepickerIntl {
  constructor() {
    super();

    this.calendarLabel = 'Kalender';
    this.openCalendarLabel = 'Kies een datum';
    this.prevMonthLabel = 'Vorige maand';
    this.nextMonthLabel = 'Volgende maand';
    this.prevYearLabel = 'Vorig jaar';
    this.nextYearLabel = 'Volgend jaar';
    this.prevMultiYearLabel = 'Vorige 24 jaar';
    this.nextMultiYearLabel = 'Volgende 24 jaar';

    this.switchToMonthViewLabel = 'Schakel naar maandweergave';
    this.switchToMultiYearViewLabel = 'Kies maand en jaar';

    this.changes.next();
  }
}


