import {Klimaat} from './klimaat';
import {Trend} from './trend';

export class RealtimeKlimaat extends Klimaat {
  public temperatuurTrend: Trend;
  public luchtvochtigheidTrend: Trend;
  public sensorCode: string;
}
