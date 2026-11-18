import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Categoria } from '../../core/models/foro.model';
import { ForoService } from '../../core/services/foro.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly foro = inject(ForoService);

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.foro.getCategorias().subscribe({
      next: (lista) => {
        this.categorias.set(lista);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las categorías. ¿Está corriendo ms-foro?');
        this.loading.set(false);
      },
    });
  }
}
