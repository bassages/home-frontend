import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {ErrorHandingService} from './error-handing.service';
import {Error} from './error';
import {faCircleExclamation} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'home-error-handler',
  templateUrl: './error-handling.component.html'
})
export class ErrorHandlingComponent implements OnInit {
  faCircleExclamation = faCircleExclamation;

  @ViewChild('errorDialogTemplate', { static: true })
  private readonly errorDialogTemplate: TemplateRef<any>;

  public message: string;
  private modal: NgbModalRef;

  constructor(private readonly modalService: NgbModal,
              private readonly errorHandlingService: ErrorHandingService) {
  }

  public ngOnInit(): void {
    this.errorHandlingService.onError()
                             .subscribe((error: Error) => this.handleError(error));
  }

  public handleError(error: Error): void {
    this.message = error.message.valueOf();
    this.openDialog();
  }

  public openDialog(): void {
    this.modal = this.modalService.open(this.errorDialogTemplate);
  }

  public closeDialog(): void {
    if (this.modal) {
      this.modal.close();
    }
  }
}
