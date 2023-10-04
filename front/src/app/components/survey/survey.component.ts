import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SurveyService } from '../../services/survey/survey.service';
import { Survey } from '../../models/survey'


@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss']
})
export class SurveyComponent {
  @Input() id!: number;
  public surveyInfo$: Observable<Survey>;
  total?: number;
  
  constructor(private surveyService: SurveyService) {
    this.surveyInfo$ = this.surveyService.getSurvey(this.id);
    this.surveyInfo$.subscribe(survey => this.total = survey.total);
  }

  countPercent(count: number = 0): string {
    if (this.total) {
      console.log(`${(count / this.total * 100).toFixed(2)}%`)
      return `${(count / this.total * 100).toFixed(2)}%`
    } else {
      return '0'
    }
    

  }

}
