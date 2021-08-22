import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {AuthService} from '../auth/auth.service';

@Component({
  selector: 'home-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  public credentials = {username: '', password: ''};

  public loginFailed = false;

  public initialized = false;

  public constructor(private readonly authenticationService: AuthService,
                     private readonly http: HttpClient,
                     private readonly router: Router) {
  }

  public ngOnInit(): void {
    this.authenticationService.determineCurrentLoginStatus()
      .subscribe(
        () => {
        // Intentionally left empty
      }, () => {
        // Intentionally left empty
      }, () => this.navigateToRootWhenAlreadyLoggedIn());
  }

  private navigateToRootWhenAlreadyLoggedIn() {
    const alreadyLoggedIn = this.authenticationService.authenticatedSubject.getValue();
    if (alreadyLoggedIn) {
      this.navigateToRoot();
    } else {
      this.initialized = true;
    }
  }

  public login() {
    this.authenticationService.authenticate(this.credentials).subscribe(
      () => {
        // Intentionally left empty
      },
      () => {
        // Intentionally left empty
      },
      () =>  this.processAuthenticationStatus());
  }

  private processAuthenticationStatus() {
    if (this.authenticationService.authenticatedSubject.getValue()) {
      this.navigateToRoot();
    } else {
      this.loginFailed = true;
    }
  }

  private navigateToRoot() {
    this.router.navigate(['/dashboard'], {replaceUrl: true});
  }
}
