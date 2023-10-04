import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SurveyComponent } from './components/survey/survey.component';
import { SurveyCreateComponent } from './components/survey-create/survey-create.component';

const routes: Routes = [
  { path: 'survey/create', component: SurveyCreateComponent },
  { path: 'survey/:id', component: SurveyComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
