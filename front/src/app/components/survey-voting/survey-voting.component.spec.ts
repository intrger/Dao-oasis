import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyVotingComponent } from './survey-voting.component';

describe('SurveyVotingComponent', () => {
  let component: SurveyVotingComponent;
  let fixture: ComponentFixture<SurveyVotingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SurveyVotingComponent]
    });
    fixture = TestBed.createComponent(SurveyVotingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
