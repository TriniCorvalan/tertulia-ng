import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { FORO_API_URL } from '../constants/api.constants';
import {
  ActualizarTemaRequest,
  Categoria,
  Comentario,
  CrearCategoriaRequest,
  CrearComentarioRequest,
  CrearTemaRequest,
  Tema,
} from '../models/foro.model';

/** Singleton (`providedIn: 'root'`). Foro vía ms-foro; Observables (Observer). */
@Injectable({ providedIn: 'root' })
export class ForoService {
  private readonly http = inject(HttpClient);

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${FORO_API_URL}/categorias`);
  }

  getCategoria(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${FORO_API_URL}/categorias/${id}`);
  }

  crearCategoria(body: CrearCategoriaRequest): Observable<Categoria> {
    return this.http.post<Categoria>(`${FORO_API_URL}/categorias`, body);
  }

  actualizarCategoria(id: number, body: Partial<CrearCategoriaRequest>): Observable<Categoria> {
    return this.http.put<Categoria>(`${FORO_API_URL}/categorias/${id}`, body);
  }

  eliminarCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${FORO_API_URL}/categorias/${id}`);
  }

  buscarTemas(opts: { categoriaId?: number; q?: string } = {}): Observable<Tema[]> {
    let params = new HttpParams();
    if (opts.categoriaId != null) {
      params = params.set('categoriaId', String(opts.categoriaId));
    }
    if (opts.q?.trim()) {
      params = params.set('q', opts.q.trim());
    }
    return this.http.get<Tema[]>(`${FORO_API_URL}/temas`, { params });
  }

  getTema(id: number): Observable<Tema> {
    return this.http.get<Tema>(`${FORO_API_URL}/temas/${id}`);
  }

  crearTema(body: CrearTemaRequest): Observable<Tema> {
    return this.http.post<Tema>(`${FORO_API_URL}/temas`, body);
  }

  actualizarTema(id: number, body: ActualizarTemaRequest): Observable<Tema> {
    return this.http.put<Tema>(`${FORO_API_URL}/temas/${id}`, body);
  }

  eliminarTema(id: number): Observable<void> {
    return this.http.delete<void>(`${FORO_API_URL}/temas/${id}`);
  }

  getComentariosDeTema(temaId: number): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${FORO_API_URL}/temas/${temaId}/comentarios`);
  }

  crearComentario(body: CrearComentarioRequest): Observable<Comentario> {
    return this.http.post<Comentario>(`${FORO_API_URL}/comentarios`, body);
  }

  actualizarComentario(id: number, contenido: string): Observable<Comentario> {
    return this.http.put<Comentario>(`${FORO_API_URL}/comentarios/${id}`, { contenido });
  }

  eliminarComentario(id: number): Observable<void> {
    return this.http.delete<void>(`${FORO_API_URL}/comentarios/${id}`);
  }
}
