import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {Subscription} from 'rxjs';
import {
  faChartArea,
  faChartColumn,
  faChartLine,
  faFileLines,
  faFireFlameCurved,
  faGears,
  faHouseChimney,
  faMicrochip,
  faRightFromBracket,
  faServer,
  faTable,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'home-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit, OnDestroy {
  faHouseChimney = faHouseChimney;
  faTriangleExclamation = faTriangleExclamation;
  faChartArea = faChartArea;
  faChartColumn = faChartColumn;
  faChartLine = faChartLine;
  faTable = faTable;
  faMicrochip = faMicrochip;
  faGears = faGears;
  faFireFlameCurved = faFireFlameCurved;
  faFileLines = faFileLines;
  faServer = faServer;
  faRightFromBracket = faRightFromBracket;

  public isCollapsed = true;
  public isVisible = false;

  private authenticated: Subscription;

  constructor(private readonly authenticationService: AuthService) {
  }

  public ngOnInit(): void {
    this.authenticated = this.authenticationService.authenticatedSubject
      .subscribe(authenticated => this.isVisible = authenticated);
  }

  public ngOnDestroy(): void {
    this.authenticated.unsubscribe();
  }

  public collapse() {
    this.isCollapsed = true;
  }

  public logout() {
    this.authenticationService.logout();
  }
}
