import {Component, OnInit} from '@angular/core';
import { StroomVerbruikComponent } from './stroom-verbruik/stroom-verbruik.component';
import { GasVerbruikComponent } from './gas-verbruik/gas-verbruik.component';
import { KlimaatTemperatuurComponent } from './klimaat-temperatuur/klimaat-temperatuur.component';
import { KlimaatLuchtvochtigheidComponent } from './klimaat-luchtvochtigheid/klimaat-luchtvochtigheid.component';
import { StroomFasesComponent } from './stroom-fases/stroom-fases.component';
import {ApplicationConfigService} from '../application-config';
import {StroomVandaagComponent} from './stroom-vandaag/stroom-vandaag.component';

@Component({
    selector: 'home-dashboard',
    templateUrl: './dashboard.component.html',
    imports: [StroomVerbruikComponent, StroomFasesComponent, StroomVandaagComponent, GasVerbruikComponent, KlimaatTemperatuurComponent, KlimaatLuchtvochtigheidComponent]
})
export class DashboardComponent implements OnInit {
    public showClimate = false;
    public showGas = false;

    constructor(private readonly applicationConfigService: ApplicationConfigService) { }

    public ngOnInit(): void {
        this.applicationConfigService.getConfig().subscribe(config => {
            this.showClimate = config.dashboardClimateEnabled;
            this.showGas = config.dashboardGasEnabled;
        });
    }
}
