import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { ContactsComponent } from './pages/students/students';
import { ContactProfileComponent } from './pages/student-profile/student-profile';
import { ContactFormPageComponent } from './pages/student-form-page/student-form-page';
import { CreateUserComponent } from './pages/create-user/create-user';
import { UsersManagementComponent } from './pages/users-management/users-management';
import { AccountingComponent } from './pages/accounting/accounting';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'contacts', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'contacts/new', component: ContactFormPageComponent, canActivate: [authGuard] },
  { path: 'contacts/edit/:id', component: ContactFormPageComponent, canActivate: [authGuard] },
  { path: 'contacts', component: ContactsComponent, canActivate: [authGuard] },
  { path: 'contact/:id', component: ContactProfileComponent, canActivate: [authGuard] },
  { path: 'accounting', component: AccountingComponent, canActivate: [authGuard] },
  { path: 'users/new', component: CreateUserComponent, canActivate: [authGuard] },
  { path: 'users', component: UsersManagementComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'contacts' }
];
