import {Moment} from 'moment';

export class Energiecontract {
  public id: number;
  public validFrom: Moment;
  public validTo: Moment;
  public stroomPerKwhNormaalTarief: number;
  public stroomPerKwhDalTarief: number;
  public gasPerKuub: number;
  public leverancier: string;
  public remark: string;
}
