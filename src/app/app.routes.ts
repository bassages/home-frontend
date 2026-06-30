import {Routes} from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';
import {EnergieVerbruikComponent} from './energie-verbruik/energie-verbruik.component';
import {EnergiecontractComponent} from './energiecontract/energiecontract.component';
import {KlimaatAverageComponent} from './klimaat/klimaat-average/klimaat-average.component';
import {KlimaatHighestLowestComponent} from './klimaat/klimaat-highest-lowest/klimaat-highest-lowest.component';
import {KlimaatHistorieComponent} from './klimaat/klimaat-historie/klimaat-historie.component';
import {KlimaatSensorsComponent} from './klimaat/klimaat-sensors/klimaat-sensors.component';
import {LoginComponent} from './login/login.component';
import {MeterstandComponent} from './meterstand/meterstand.component';
import {MindergasnlComponent} from './mindergasnl/mindergasnl.component';
import {OpgenomenVermogenComponent} from './opgenomen-vermogen/opgenomen-vermogen.component';
import {StandbyPowerComponent} from './standby-power/standby-power.component';

export const appRoutes: Routes = [
  {path: '', pathMatch: 'full', component: LoginComponent},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'meterstand', component: MeterstandComponent},
  {path: 'login', component: LoginComponent},
  {path: 'energie/opgenomen-vermogen', component: OpgenomenVermogenComponent},
  {path: 'energie/:verbruiksoort/:periode', component: EnergieVerbruikComponent},
  {path: 'energie/basisverbruik', component: StandbyPowerComponent},
  {path: 'mindergasnl', component: MindergasnlComponent},
  {path: 'klimaat/sensors', component: KlimaatSensorsComponent},
  {path: 'klimaat/historie', component: KlimaatHistorieComponent},
  {path: 'klimaat/hoogste-laagste', component: KlimaatHighestLowestComponent},
  {path: 'klimaat/gemiddelde', component: KlimaatAverageComponent},
  {path: 'energiecontract', component: EnergiecontractComponent}
];

