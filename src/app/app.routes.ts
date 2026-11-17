import { Routes } from '@angular/router';

import { Categoria } from './pages/categoria/categoria';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Perfil } from './pages/perfil/perfil';
import { RecuperarPassword } from './pages/recuperar-password/recuperar-password';
import { Registro } from './pages/registro/registro';
import { TemaDetalle } from './pages/tema-detalle/tema-detalle';
import { TemaNuevo } from './pages/tema-nuevo/tema-nuevo';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  { path: 'inicio', component: Home },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'recuperar-password', component: RecuperarPassword },
  { path: 'perfil', component: Perfil },
  { path: 'categorias/:id', component: Categoria },
  { path: 'temas/nuevo', component: TemaNuevo },
  { path: 'temas/:id', component: TemaDetalle },
  { path: '**', redirectTo: 'inicio' },
];
