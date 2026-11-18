import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Comentario, Tema } from '../../core/models/foro.model';
import { AuthService } from '../../core/services/auth.service';
import { ForoService } from '../../core/services/foro.service';

@Component({
  selector: 'app-tema-detalle',
  imports: [RouterLink, ReactiveFormsModule, DatePipe],
  templateUrl: './tema-detalle.html',
  styleUrl: './tema-detalle.css',
})
export class TemaDetalle implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly foro = inject(ForoService);
  protected readonly auth = inject(AuthService);

  protected readonly tema = signal<Tema | null>(null);
  protected readonly comentarios = signal<Comentario[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly submittingComment = signal(false);

  protected readonly commentForm = inject(FormBuilder).nonNullable.group({
    contenido: ['', [Validators.required, Validators.minLength(2)]],
  });

  private temaId = 0;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('Tema inválido.');
      this.loading.set(false);
      return;
    }
    this.temaId = id;
    this.cargar();
  }

  protected autorLabel(usuarioId: number): string {
    const user = this.auth.currentUser();
    if (user?.id === usuarioId) {
      return user.nombre;
    }
    return `Usuario #${usuarioId}`;
  }

  protected puedeEditar(autorId: number): boolean {
    const user = this.auth.currentUser();
    if (!user) {
      return false;
    }
    return user.id === autorId || this.auth.isAdmin();
  }

  protected enviarComentario(): void {
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }
    this.actionError.set(null);
    this.submittingComment.set(true);
    this.foro
      .crearComentario({
        contenido: this.commentForm.controls.contenido.value.trim(),
        tema: { id: this.temaId },
      })
      .subscribe({
        next: () => {
          this.commentForm.reset({ contenido: '' });
          this.submittingComment.set(false);
          this.cargarComentarios();
        },
        error: (err) => {
          this.submittingComment.set(false);
          const msg = err?.error?.error ?? 'No se pudo publicar el comentario.';
          this.actionError.set(typeof msg === 'string' ? msg : 'No se pudo publicar el comentario.');
        },
      });
  }

  protected eliminarTema(): void {
    if (!confirm('¿Eliminar este tema y sus comentarios?')) {
      return;
    }
    this.foro.eliminarTema(this.temaId).subscribe({
      next: () => {
        const catId = this.tema()?.categoria?.id;
        void this.router.navigate(catId ? ['/categorias', catId] : ['/inicio']);
      },
      error: () => this.actionError.set('No se pudo eliminar el tema.'),
    });
  }

  protected eliminarComentario(id: number): void {
    if (!confirm('¿Eliminar este comentario?')) {
      return;
    }
    this.foro.eliminarComentario(id).subscribe({
      next: () => this.cargarComentarios(),
      error: () => this.actionError.set('No se pudo eliminar el comentario.'),
    });
  }

  private cargar(): void {
    this.loading.set(true);
    this.foro.getTema(this.temaId).subscribe({
      next: (tema) => {
        this.tema.set(tema);
        this.loading.set(false);
        this.cargarComentarios();
      },
      error: () => {
        this.error.set('Tema no encontrado o no disponible.');
        this.loading.set(false);
      },
    });
  }

  private cargarComentarios(): void {
    this.foro.getComentariosDeTema(this.temaId).subscribe({
      next: (lista) => this.comentarios.set(lista),
      error: () => this.actionError.set('No se pudieron cargar los comentarios.'),
    });
  }
}
