import { Component, Input } from '@angular/core';
import { Survey } from 'src/app/models/survey';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { SurveyService } from 'src/app/services/survey/survey.service';

@Component({
  selector: 'app-survey-voting',
  templateUrl: './survey-voting.component.html',
  styleUrls: ['./survey-voting.component.scss']
})
export class SurveyVotingComponent {
  @Input() survey?: Survey;
  form: FormGroup;

  constructor(private fb: FormBuilder, private surveyService: SurveyService) {
    this.form = this.fb.group({
      variants: ['1'],
    })    
  }

  submit() {
    console.log(this.form.value)
  }

}
