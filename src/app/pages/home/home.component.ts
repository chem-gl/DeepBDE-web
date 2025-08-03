import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-container">
      <header class="hero-section">
        <h1>DeepBDE</h1>
        <p class="subtitle">
          Análisis de Enlaces Moleculares con Deep Learning
        </p>
        <p class="description">
          Utiliza inteligencia artificial para predecir y analizar enlaces
          químicos en moléculas
        </p>
      </header>

      <section class="features-grid">
        <div class="feature-card" routerLink="/predict">
          <h3>🔮 Predicciones</h3>
          <p>Predice enlaces moleculares usando modelos de deep learning</p>
          <button class="btn-primary">Comenzar Predicción</button>
        </div>

        <div class="feature-card" routerLink="/fragment">
          <h3>🧪 Fragmentos</h3>
          <p>Analiza fragmentos moleculares y sus propiedades</p>
          <button class="btn-primary">Analizar Fragmentos</button>
        </div>

        <div class="feature-card" routerLink="/reports">
          <h3>📊 Reportes</h3>
          <p>Genera y descarga reportes detallados de tus análisis</p>
          <button class="btn-primary">Ver Reportes</button>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .home-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .hero-section {
        text-align: center;
        margin-bottom: 4rem;
        padding: 3rem 0;
      }

      .hero-section h1 {
        font-size: 3.5rem;
        color: #2c3e50;
        margin-bottom: 1rem;
        font-weight: 700;
      }

      .subtitle {
        font-size: 1.5rem;
        color: #34495e;
        margin-bottom: 1rem;
      }

      .description {
        font-size: 1.1rem;
        color: #7f8c8d;
        max-width: 600px;
        margin: 0 auto;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-top: 3rem;
      }

      .feature-card {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        text-align: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        cursor: pointer;
      }

      .feature-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      }

      .feature-card h3 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        color: #2c3e50;
      }

      .feature-card p {
        color: #7f8c8d;
        margin-bottom: 1.5rem;
        line-height: 1.6;
      }

      .btn-primary {
        background: #3498db;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .btn-primary:hover {
        background: #2980b9;
      }
    `,
  ],
})
export class HomeComponent {}
