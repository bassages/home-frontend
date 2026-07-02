import {Injectable} from '@angular/core';
import {MatDateFormats, NativeDateAdapter} from '@angular/material/core';
import dayjs from 'dayjs';

export type MaterialDateDisplayMode = 'day' | 'month' | 'year';

@Injectable()
export class DayjsMaterialDateAdapter extends NativeDateAdapter {
  private displayMode: MaterialDateDisplayMode = 'day';

  public setDisplayMode(mode: MaterialDateDisplayMode): void {
    this.displayMode = mode;
  }

  public override format(date: Date, displayFormat: object): string {
    const formatToken = displayFormat as unknown;
    if (typeof formatToken === 'string' && (formatToken === 'dayjsMaterialInput' || formatToken === 'dayjsMaterialInputWithWeekday')) {
      const parsedDate = dayjs(date);
      if (!parsedDate.isValid()) {
        return '';
      }

      if (this.displayMode === 'month') {
        return parsedDate.format('MM-YYYY');
      }

      if (this.displayMode === 'year') {
        return parsedDate.format('YYYY');
      }

      if (formatToken === 'dayjsMaterialInputWithWeekday') {
        const weekdayAbbreviation = parsedDate.format('dd');
        const weekday = `${weekdayAbbreviation.charAt(0).toUpperCase()}${weekdayAbbreviation.slice(1)}.`;
        return `${weekday} ${parsedDate.format('DD-MM-YYYY')}`;
      }

      return parsedDate.format('DD-MM-YYYY');
    }

    return super.format(date, displayFormat);
  }
}

export const DAYJS_MATERIAL_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'dayjsMaterialInput'
  },
  display: {
    dateInput: 'dayjsMaterialInput',
    monthYearLabel: {month: 'short', year: 'numeric'},
    dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
    monthYearA11yLabel: {year: 'numeric', month: 'long'}
  }
};

