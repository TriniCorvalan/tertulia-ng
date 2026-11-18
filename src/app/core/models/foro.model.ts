export type EstadoContenido = 'ACTIVO' | 'BANEADO';

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Tema {
  id: number;
  titulo: string;
  contenido: string;
  usuarioId: number;
  categoria: Categoria;
  estado: EstadoContenido;
  fechaCreacion: string;
}

export interface Comentario {
  id: number;
  contenido: string;
  tema: Tema | { id: number };
  usuarioId: number;
  estado: EstadoContenido;
  fechaCreacion: string;
}

export interface CrearTemaRequest {
  titulo: string;
  contenido: string;
  categoria: { id: number };
}

export interface ActualizarTemaRequest {
  titulo?: string;
  contenido?: string;
  categoria?: { id: number };
}

export interface CrearComentarioRequest {
  contenido: string;
  tema: { id: number };
}

export interface CrearCategoriaRequest {
  nombre: string;
  descripcion: string;
}
