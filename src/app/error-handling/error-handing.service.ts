import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Error} from './error';
import {NgxSpinnerService} from 'ngx-spinner';

@Injectable()
export class ErrorHandingService {
  private readonly errorSubject = new Subject<Error>();

  constructor(private readonly spinnerService: NgxSpinnerService) { }

  public onError(): Observable<Error> {
    return this.errorSubject.asObservable();
  }

  public handleError(message: string, causedBy: any) {
    console.error(message, causedBy);
    this.spinnerService.hide();
    this.errorSubject.next(new Error(message, causedBy));
  }
}
