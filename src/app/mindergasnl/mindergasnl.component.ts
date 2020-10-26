import {Component, OnInit} from '@angular/core';
import {MindergasnlService} from './mindergasnl.service';
import {ErrorHandingService} from '../error-handling/error-handing.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';

const authenticatieTokenMaxLengthValidator = Validators.maxLength(255);

@Component({
  selector: 'home-mindergasnl',
  templateUrl: './mindergasnl.component.html'
})
export class MindergasnlComponent implements OnInit {

  public form: FormGroup;
  public showSavedMessage = false;

  private _editmode: boolean;

  private originalAutomatischUploaden: boolean;
  private originalAuthenticatietoken: string;

  set editMode(editmode: boolean) {
    this._editmode = editmode;
    if (editmode) {
      this.saveOriginalValues();
      this.automatischUploaden.enable();
      this.authenticatietoken.enable();
    } else {
      this.automatischUploaden.disable();
      this.authenticatietoken.disable();
    }
  }

  get editMode(): boolean {
    return this._editmode;
  }

  constructor(private mindergasnlService: MindergasnlService,
              private spinnerService: NgxSpinnerService,
              private errorHandlingService: ErrorHandingService) { }

  public ngOnInit(): void {
    this.createForm();
    setTimeout(() => this.getMinderGasNlSettings());
  }

  private createForm(): void {
    this.form = new FormGroup({
      automatischUploaden: new FormControl(),
      authenticatietoken: new FormControl('', authenticatieTokenMaxLengthValidator)
    });
    this.automatischUploaden.valueChanges.subscribe(value => this.setAuthenticatieTokenValidators(value));
    this.editMode = false;
  }

  get automatischUploaden(): FormControl {
    return this.form.get('automatischUploaden') as FormControl;
  }

  get authenticatietoken(): FormControl {
    return this.form.get('authenticatietoken') as FormControl;
  }

  private getMinderGasNlSettings(): void {
    this.spinnerService.show();
    this.mindergasnlService.get().subscribe(
      minderGasNlSettings => this.form.setValue(minderGasNlSettings),
      error => this.errorHandlingService.handleError('De instellingen voor MinderGas.nl konden nu niet opgehaald worden', error),
      () => this.spinnerService.hide()
    );
  }

  public save(): void {
    if (this.form.valid) {
      this.spinnerService.show();
      this.mindergasnlService.update(this.form.getRawValue()).subscribe(
        () => this.flashSavedMessage(),
        error => this.errorHandlingService.handleError('De instellingen konden niet opgeslagen worden', error),
        () => {
          this.spinnerService.hide();
          this.editMode = false;
        }
      );
    }
  }

  private saveOriginalValues() {
    this.originalAutomatischUploaden = this.automatischUploaden.value;
    this.originalAuthenticatietoken = this.authenticatietoken.value;
  }

  private restoreOriginalValues() {
    this.automatischUploaden.setValue(this.originalAutomatischUploaden);
    this.authenticatietoken.setValue(this.originalAuthenticatietoken);
  }

  public cancel(): void {
    this.restoreOriginalValues();
    this.editMode = false;
  }

  private flashSavedMessage(): void {
    this.showSavedMessage = true;
    setTimeout(() => { this.showSavedMessage = false; }, 2500);
  }

  private setAuthenticatieTokenValidators(automatischUploaden: boolean): void {
    if (automatischUploaden) {
      this.authenticatietoken.setValidators([authenticatieTokenMaxLengthValidator, Validators.required]);
    } else {
      this.authenticatietoken.setValidators(authenticatieTokenMaxLengthValidator);
    }
    this.authenticatietoken.updateValueAndValidity();
  }
}
