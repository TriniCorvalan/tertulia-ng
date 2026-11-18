import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Categoria } from '../../core/models/foro.model';
import { ForoService } from '../../core/services/foro.service';

@Component({
  selector: 'app-tema-nuevo',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './tema-nuevo.html',
  styleUrl: './tema-nuevo.css',
})
export class TemaNuevo implements OnInit {
  private readonly foro = inject(ForoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    contenido: ['', [Validators.required, Validators.minLength(5)]],
    categoriaId: ['', Validators.required],
  });

  ngOnInit(): void {
    const pre = Number(this.route.snapshot.queryParamMap.get('categoriaId') ?? 0);
    this.foro.getCategorias().subscribe({
      next: (lista) => {
        this.categorias.set(lista);
        const initial = pre && lista.some((c) => c.id === pre) ? pre : (lista[0]?.id ?? 0);
        if (initial) {
          this.form.patchValue({ categoriaId: String(initial) });
        }
      },
      error: () => this.error.set('No se pudieron cargar las categorías.'),
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { titulo, contenido, categoriaId } = this.form.getRawValue();
    const catId = Number(categoriaId);
    if (!catId) {
      this.form.controls.categoriaId.markAsTouched();
      return;
    }
    this.error.set(null);
    this.submitting.set(true);
    this.foro
      .crearTema({
        titulo: titulo.trim(),
        contenido: contenido.trim(),
        categoria: { id: catId },
      })
      .subscribe({
        next: (tema) => void this.router.navigate(['/temas', tema.id]),
        error: (err) => {
          this.submitting.set(false);
          const msg = err?.error?.error ?? 'No se pudo publicar el tema.';
          this.error.set(typeof msg === 'string' ? msg : 'No se pudo publicar el tema.');
        },
      });
  }
}
