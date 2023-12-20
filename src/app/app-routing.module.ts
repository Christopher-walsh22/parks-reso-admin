import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './home/home.component';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { LoginComponent } from './login/login.component';
import { ParksManagementComponent } from './parks-management/parks-management.component';
import { MetricsComponent } from './metrics/metrics.component';
import { MetricsResolver } from './resolvers/metrics.resolver';
import { PassManagementComponent } from './pass-management/pass-management.component';
import { FaqComponent } from './faq/faq.component'
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
    data: {
      label: 'Home',
      breadcrumb: 'Home',
      icon: 'bi-house-fill',
    },
  },
  {
    path: 'parks',
    canActivate: [AuthGuard],
    component: ParksManagementComponent,
    data: {
      label: 'Parks Management',
      breadcrumb: 'Parks',
      icon: 'bi-tree-fill',
    },
    loadChildren: () =>
      import('./parks-management/parks-management.module').then(
        (m) => m.ParksManagementModule
      ),
  },
  {
    path: 'pass-management',
    canActivate: [AuthGuard],
    component: PassManagementComponent,
    data: {
      label: 'Pass Management',
      breadcrumb: 'Pass Management',
      icon: 'bi-pass-fill',
    },
    loadChildren: () =>
      import('./pass-management/pass-management.module').then(
        (m) => m.PassManagementModule
      ),
  },
  {
    path: 'faq',
    canActivate: [AuthGuard],
    component: FaqComponent,
    data: {
      label: 'FAQ',
      breadcrumb: 'Frequently Asked Questions',
      icon: 'bi-bar-chart',
    },
    loadChildren: () =>
      import('./faq/faq.module').then((m) => m.FaqModule),
  },
  {
    path: 'metrics',
    canActivate: [AuthGuard],
    component: MetricsComponent,
    resolve: [MetricsResolver],
    data: {
      label: 'Metrics',
      breadcrumb: 'Metrics',
      icon: 'bi-bar-chart-fill',
    },
    loadChildren: () =>
      import('./metrics/metrics.module').then((m) => m.MetricsModule),
  },
  {
    path: 'unauthorized',
    pathMatch: 'full',
    component: NotAuthorizedComponent,
    data: {
      showSideBar: false,
      showBreadCrumb: false,
    },
    children: [],
  },
  {
    path: 'login',
    pathMatch: 'full',
    component: LoginComponent,
    data: {
      showSideBar: false,
      showBreadCrumb: false,
    },
  },
  {
    // wildcard route
    path: '**',
    redirectTo: '/',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
