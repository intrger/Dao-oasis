import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Survey } from 'src/app/models/survey';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {

  constructor() { }

  vote(key: Number) {

  }

  saveSurvey(surveForm: Object) {
    //TODO send data to backend
    return of(1);
  }

  getSurvey(id: number): Observable<Survey> {
    return of({
      id: id,
      status: 'open',
      //total: 7,
      title: 'Survey title',
      description: 'A very very very long survey desctiption. M. b. not so long.',
      variants: [
        {
          'key': 0, 
          'value': 'The first variant', 
          'count': 3
        },
        {
          'key': 1, 
          'value': 'The second variant', 
          'count': 2
        },
        {
          'key': 2, 
          'value': 'The third variant. The longest one. To check how it will be in two strings. The third variant. The longest one. To check how it will be in two strings. ', 
          'count': 2
        },
      ],
      link: 'https://google.com',
    } as Survey)
    //TODO get survey data from backend
  }
}
