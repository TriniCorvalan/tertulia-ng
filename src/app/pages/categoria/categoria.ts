import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Categoria as CategoriaModel, Tema } from '../../core/models/foro.model';
import { AuthService } from '../../core/services/auth.service';
import { ForoService } from '../../core/services/foro.service';

@Component({
  selector: 'app-categoria',
  imports: [RouterLink, ReactiveFormsModule, DatePipe],
  templateUrl: './categoria.html',
  styleUrl: './categoria.css',
})
export class Categoria implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly foro = inject(ForoService);
  protected readonly auth = inject(AuthService);

  protected readonly categoria = signal<CategoriaModel | null>(null);
  protected readonly temas = signal<Tema[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly searchForm = inject(FormBuilder).nonNullable.group({
    q: [''],
  });

  private categoriaId = 0;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('Categoría inválida.');
      this.loading.set(false);
      return;
    }
    this.categoriaId = id;
    this.foro.getCategoria(id).subscribe({
      next: (cat) => {
        this.categoria.set(cat);
        this.cargarTemas();
      },
      error: () => {
        this.error.set('No se encontró la categoría.');
        this.loading.set(false);
      },
    });
  }

  protected buscar(): void {
    this.cargarTemas();
  }

  private cargarTemas(): void {
    this.loading.set(true);
    this.error.set(null);
    const q = this.searchForm.controls.q.value;
    this.foro.buscarTemas({ categoriaId: this.categoriaId, q }).subscribe({
      next: (lista) => {
        this.temas.set(lista);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los temas.');
        this.loading.set(false);
      },
    });
  }

  protected autorLabel(usuarioId: number): string {
    const user = this.auth.currentUser();
    if (user?.id === usuarioId) {
      return user.nombre;
    }
    return `Usuario #${usuarioId}`;
  }
}
