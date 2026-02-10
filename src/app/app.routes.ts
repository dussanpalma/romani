import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { StudentsComponent } from './pages/students/students';
import { StudentProfileComponent } from './pages/student-profile/student-profile';
import { StudentFormPageComponent } from './pages/student-form-page/student-form-page';
import { CreateUserComponent } from './pages/create-user/create-user';
import { UsersManagementComponent } from './pages/users-management/users-management';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'students', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'students/new', component: StudentFormPageComponent, canActivate: [authGuard] },
  { path: 'students/edit/:id', component: StudentFormPageComponent, canActivate: [authGuard] },
  { path: 'students', component: StudentsComponent, canActivate: [authGuard] },
  { path: 'student/:id', component: StudentProfileComponent, canActivate: [authGuard] },
  { path: 'users/new', component: CreateUserComponent, canActivate: [authGuard] },
  { path: 'users', component: UsersManagementComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'students' }
];
