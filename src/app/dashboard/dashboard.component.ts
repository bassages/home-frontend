import {Component} from '@angular/core';
import { StroomVerbruikComponent } from './stroom-verbruik/stroom-verbruik.component';
import { GasVerbruikComponent } from './gas-verbruik/gas-verbruik.component';
import { KlimaatTemperatuurComponent } from './klimaat-temperatuur/klimaat-temperatuur.component';
import { KlimaatLuchtvochtigheidComponent } from './klimaat-luchtvochtigheid/klimaat-luchtvochtigheid.component';

@Component({
    selector: 'home-dashboard',
    templateUrl: './dashboard.component.html',
    imports: [StroomVerbruikComponent, GasVerbruikComponent, KlimaatTemperatuurComponent, KlimaatLuchtvochtigheidComponent]
})
export class DashboardComponent {
}
