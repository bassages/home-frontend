import {Component, OnInit} from '@angular/core';
import {AuthService} from './auth/auth.service';
import { NavbarComponent } from './navbar/navbar.component';
import { ErrorHandlingComponent } from './error-handling/error-handling.component';
import { RouterOutlet } from '@angular/router';
import { LoadingOverlayComponent } from './loading-overlay/loading-overlay.component';

@Component({
    selector: 'home-root',
    templateUrl: './app.component.html',
    imports: [NavbarComponent, LoadingOverlayComponent, ErrorHandlingComponent, RouterOutlet]
})
export class AppComponent implements OnInit {

  public constructor(private readonly authService: AuthService) {
  }

  public ngOnInit(): void {
    this.authService.updateAuthenticatedSubject();
  }
}
