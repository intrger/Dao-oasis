import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { SurveyService } from 'src/app/services/survey/survey.service';

@Component({
  selector: 'app-survey-create',
  templateUrl: './survey-create.component.html',
  styleUrls: ['./survey-create.component.scss']
})
export class SurveyCreateComponent {
  form: FormGroup;
  variants = this.fb.array([['', Validators.required]]);

  constructor(private fb: FormBuilder, private surveyService: SurveyService) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      link: [''],
      variants: this.variants,
    })
  }

  // public get variants(): FormArray {
  //   return this.form.get('variants') as FormArray;
  // }

  addVariant(): void {
    this.variants.push(this.fb.control('', Validators.required));
  }

  removeVariant(i: number): void {
    this.variants.removeAt(i);
  }

  submit() {
    this.surveyService.saveSurvey(this.form.value);
    console.log(this.form.value);
  }

}
