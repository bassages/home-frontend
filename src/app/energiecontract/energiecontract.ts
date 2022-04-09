import {Dayjs} from 'dayjs';

export class Energiecontract {
  public id: number;
  public validFrom: Dayjs;
  public validTo: Dayjs;
  public stroomPerKwhNormaalTarief: number;
  public stroomPerKwhDalTarief: number;
  public gasPerKuub: number;
  public leverancier: string;
  public remark: string;
}
