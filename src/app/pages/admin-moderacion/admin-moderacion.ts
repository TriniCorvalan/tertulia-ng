import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { EstadoContenido } from '../../core/models/foro.model';
import { ComentarioModeracion, TemaModeracion } from '../../core/models/moderacion.model';
import { ModeracionService } from '../../core/services/moderacion.service';

type FiltroEstado = '' | EstadoContenido;
type Tab = 'temas' | 'comentarios';

@Component({
  selector: 'app-admin-moderacion',
  imports: [DatePipe],
  templateUrl: './admin-moderacion.html',
  styleUrl: './admin-moderacion.css',
})
export class AdminModeracion implements OnInit {
  private readonly moderacion = inject(ModeracionService);

  protected readonly tab = signal<Tab>('temas');
  protected readonly filtro = signal<FiltroEstado>('');
  protected readonly temas = signal<TemaModeracion[]>([]);
  protected readonly comentarios = signal<ComentarioModeracion[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly busyId = signal<string | null>(null);

  ngOnInit(): void {
    this.recargar();
  }

  protected setTab(tab: Tab): void {
    this.tab.set(tab);
    this.recargar();
  }

  protected setFiltro(filtro: FiltroEstado): void {
    this.filtro.set(filtro);
    this.recargar();
  }

  protected recargar(): void {
    this.loading.set(true);
    this.error.set(null);
    const estado = this.filtro() || undefined;

    if (this.tab() === 'temas') {
      this.moderacion.listarTemas(estado).subscribe({
        next: (lista) => {
          this.temas.set(lista);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los temas. ¿Está corriendo ms-moderacion?');
          this.loading.set(false);
        },
      });
      return;
    }

    this.moderacion.listarComentarios(estado).subscribe({
      next: (lista) => {
        this.comentarios.set(lista);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los comentarios. ¿Está corriendo ms-moderacion?');
        this.loading.set(false);
      },
    });
  }

  protected banearTema(id: number): void {
    this.busyId.set(`tema-${id}`);
    this.moderacion.banearTema(id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.recargar();
      },
      error: () => {
        this.busyId.set(null);
        this.error.set('No se pudo banear el tema.');
      },
    });
  }

  protected desbanearTema(id: number): void {
    this.busyId.set(`tema-${id}`);
    this.moderacion.desbanearTema(id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.recargar();
      },
      error: () => {
        this.busyId.set(null);
        this.error.set('No se pudo desbanear el tema.');
      },
    });
  }

  protected banearComentario(id: number): void {
    this.busyId.set(`comentario-${id}`);
    this.moderacion.banearComentario(id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.recargar();
      },
      error: () => {
        this.busyId.set(null);
        this.error.set('No se pudo banear el comentario.');
      },
    });
  }

  protected desbanearComentario(id: number): void {
    this.busyId.set(`comentario-${id}`);
    this.moderacion.desbanearComentario(id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.recargar();
      },
      error: () => {
        this.busyId.set(null);
        this.error.set('No se pudo desbanear el comentario.');
      },
    });
  }
}
