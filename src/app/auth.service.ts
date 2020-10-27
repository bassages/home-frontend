import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {NgxSpinnerService} from 'ngx-spinner';

const API_PATH_USER = '/api/user';

@Injectable()
export class AuthService {

  public authenticatedSubject = new BehaviorSubject<boolean>(false);

  constructor(private readonly http: HttpClient,
              private readonly router: Router,
              private readonly spinnerService: NgxSpinnerService) {
  }

  public determineCurrentLoginStatus() {
    return this.http.get(API_PATH_USER).pipe(this.tapAuthResponseToUpdateSubject());
  }

  public authenticate(credentials) {
    const headers = this.createBasicAuthHeader(credentials);
    return this.http.get(API_PATH_USER, {headers: headers}).pipe(this.tapAuthResponseToUpdateSubject());
  }

  // noinspection JSMethodCanBeStatic
  private createBasicAuthHeader(credentials): HttpHeaders {
    return new HttpHeaders({
      authorization: 'Basic ' + btoa(credentials.username + ':' + credentials.password)
    });
  }

  private tapAuthResponseToUpdateSubject() {
    return tap(response => {
      this.updateAuthenticatedSubject(response);
    }, () => this.authenticatedSubject.next(false));
  }

  private updateAuthenticatedSubject(response) {
    if (response['name']) {
      this.authenticatedSubject.next(true);
    } else {
      this.authenticatedSubject.next(false);
    }
  }

  public logout() {
    this.http.post('/logout', null).subscribe(
      () => {},
        () => {},
        () => this.loggedOut()
    );
  }

  public loggedOut() {
    this.authenticatedSubject.next(false);
    this.spinnerService.hide();
    this.router.navigate(['/login']);
  }
}
