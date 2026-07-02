export type {MaterialDateDisplayMode as DateNavigatorDisplayMode} from '../shared/material/dayjs-material-date-adapter';
export {
  DayjsMaterialDateAdapter as DateNavigatorDateAdapter
} from '../shared/material/dayjs-material-date-adapter';
import {MatDateFormats} from '@angular/material/core';

export const DATE_NAVIGATOR_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'dayjsMaterialInputWithWeekday'
  },
  display: {
    dateInput: 'dayjsMaterialInputWithWeekday',
    monthYearLabel: {month: 'short', year: 'numeric'},
    dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
    monthYearA11yLabel: {year: 'numeric', month: 'long'}
  }
};



