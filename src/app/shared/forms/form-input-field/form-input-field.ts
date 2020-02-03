import {
  AbstractControl,
  FormControl,
  Validators,
  ValidatorFn
} from "@angular/forms";
import { IFormInputConfigConfig } from "../interfaces/form-input-config-config.interface";
import { IFormInputConfig } from "../interfaces/form-input-config.interface";
import { ReactiveFormFactory } from "../form-group/reactive-form.factory";

export class FormInputField {
  public control: AbstractControl;
  public name: string;
  public config: IFormInputConfigConfig;

  constructor(inputConfig: IFormInputConfig) {
    this.control = this._createControl(inputConfig.config);
    this.name = inputConfig.name;
    this.config = inputConfig.config;
  }

  static create(inputConfig: IFormInputConfig) {
    return new FormInputField(inputConfig);
  }

  private _createControl(
    inputConfigConfig: IFormInputConfigConfig
  ): FormControl {
    const control = ReactiveFormFactory.createFormControl(
      inputConfigConfig.getValue ? inputConfigConfig.getValue() : ""
    );

    control.setValidators(this._createValidators(inputConfigConfig));

    return control;
  }

  private _createValidators(inputConfig: IFormInputConfigConfig) {
    const validators: Array<ValidatorFn> = [];

    if (inputConfig.required) {
      validators.push(Validators.required);
    }

    return validators;
  }
}