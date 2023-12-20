import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { FaqEditComponent } from './faq-edit/faq-edit.component';

const routes: Routes = [
  {
    path: '',
    component: FaqEditComponent,
    canActivate: [AuthGuard],
    data: {
      breadcrumb: '',
      module: 'faq',
      component: '',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FaqRoutingModule {}

