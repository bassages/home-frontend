import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Energiecontract} from './energiecontract';
import {map} from 'rxjs/operators';
import dayjs from 'dayjs';

class BackendEnergiecontract {
  public id: number;
  public validFrom: string;
  public validTo: string;
  public electricityPerKwhStandardTariff: number;
  public electricityPerKwhOffPeakTariff: number;
  public gasPerCubicMeter: number;
  public supplierName: string;
  public remark: string;
}

@Injectable()
export class EnergiecontractService {

  constructor(private readonly http: HttpClient) { }

  private readonly energycontractApiUrl = '/api/energycontract';

  public static toEnergieContract(backendEnergieContract: BackendEnergiecontract): Energiecontract {
    const energiecontract: Energiecontract = new Energiecontract();
    energiecontract.id = backendEnergieContract.id;
    energiecontract.leverancier = backendEnergieContract.supplierName;
    energiecontract.remark = backendEnergieContract.remark;
    energiecontract.stroomPerKwhDalTarief = backendEnergieContract.electricityPerKwhOffPeakTariff;
    energiecontract.stroomPerKwhNormaalTarief = backendEnergieContract.electricityPerKwhStandardTariff;
    energiecontract.gasPerKuub = backendEnergieContract.gasPerCubicMeter;
    energiecontract.validFrom = dayjs(backendEnergieContract.validFrom, 'YYYY-MM-DD');
    energiecontract.validTo = dayjs(backendEnergieContract.validTo, 'YYYY-MM-DD');
    return energiecontract;
  }

  private static allToEnergieContract(backendEnegiecontracten: BackendEnergiecontract[]): Energiecontract[] {
    return backendEnegiecontracten.map(EnergiecontractService.toEnergieContract);
  }

  private static toBackendEnergieContract(energieContract: Energiecontract) {
    const backendEnergiecontract: BackendEnergiecontract = new BackendEnergiecontract();
    backendEnergiecontract.id = energieContract.id;
    backendEnergiecontract.validFrom = energieContract.validFrom.format('YYYY-MM-DD');
    backendEnergiecontract.supplierName = energieContract.leverancier;
    backendEnergiecontract.remark = energieContract.remark;
    backendEnergiecontract.gasPerCubicMeter = energieContract.gasPerKuub;
    backendEnergiecontract.electricityPerKwhStandardTariff = energieContract.stroomPerKwhNormaalTarief;
    backendEnergiecontract.electricityPerKwhOffPeakTariff = energieContract.stroomPerKwhDalTarief;
    return backendEnergiecontract;
  }

  public getAll(): Observable<Energiecontract[]> {
    return this.http.get<BackendEnergiecontract[]>(this.energycontractApiUrl)
                    .pipe(map(EnergiecontractService.allToEnergieContract));
  }

  public delete(id: number): Observable<Object> {
    return this.http.delete(`${this.energycontractApiUrl}/${id}`);
  }

  public save(energieContract: Energiecontract): Observable<Energiecontract> {
    return this.http.post<BackendEnergiecontract>(
        this.energycontractApiUrl, EnergiecontractService.toBackendEnergieContract(energieContract))
      .pipe(map(EnergiecontractService.toEnergieContract));
  }
}
