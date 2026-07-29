import dayjs from 'dayjs/esm';
import customParseFormat from 'dayjs/esm/plugin/customParseFormat';
import 'dayjs/esm/locale/nl';

dayjs.extend(customParseFormat);
dayjs.locale('nl');

