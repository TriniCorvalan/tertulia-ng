import { EstadoContenido } from './foro.model';

/** Forma que expone ms-moderacion (ids planos, sin nest de categoría/tema). */
export interface TemaModeracion {
  id: number;
  titulo: string;
  contenido: string;
  usuarioId: number;
  categoriaId: number;
  estado: EstadoContenido;
  fechaCreacion: string;
}

export interface ComentarioModeracion {
  id: number;
  contenido: string;
  temaId: number;
  usuarioId: number;
  estado: EstadoContenido;
  fechaCreacion: string;
}
