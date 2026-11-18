import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { MODERACION_API_URL } from '../constants/api.constants';
import { ComentarioModeracion, TemaModeracion } from '../models/moderacion.model';
import { EstadoContenido } from '../models/foro.model';

/** Singleton (`providedIn: 'root'`). Moderación vía ms-moderacion (ADMIN). */
@Injectable({ providedIn: 'root' })
export class ModeracionService {
  private readonly http = inject(HttpClient);

  listarTemas(estado?: EstadoContenido): Observable<TemaModeracion[]> {
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<TemaModeracion[]>(`${MODERACION_API_URL}/moderacion/temas`, { params });
  }

  banearTema(id: number): Observable<TemaModeracion> {
    return this.http.put<TemaModeracion>(`${MODERACION_API_URL}/moderacion/temas/${id}/banear`, {});
  }

  desbanearTema(id: number): Observable<TemaModeracion> {
    return this.http.put<TemaModeracion>(
      `${MODERACION_API_URL}/moderacion/temas/${id}/desbanear`,
      {},
    );
  }

  listarComentarios(estado?: EstadoContenido): Observable<ComentarioModeracion[]> {
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<ComentarioModeracion[]>(`${MODERACION_API_URL}/moderacion/comentarios`, {
      params,
    });
  }

  banearComentario(id: number): Observable<ComentarioModeracion> {
    return this.http.put<ComentarioModeracion>(
      `${MODERACION_API_URL}/moderacion/comentarios/${id}/banear`,
      {},
    );
  }

  desbanearComentario(id: number): Observable<ComentarioModeracion> {
    return this.http.put<ComentarioModeracion>(
      `${MODERACION_API_URL}/moderacion/comentarios/${id}/desbanear`,
      {},
    );
  }
}
