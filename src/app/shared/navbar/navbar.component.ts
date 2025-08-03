import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <a routerLink="/" class="brand-link">
            <span class="brand-text">DeepBDE</span>
          </a>
        </div>

        <div class="navbar-menu">
          <a
            routerLink="/"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-link"
          >
            🏠 Inicio
          </a>
          <a routerLink="/predict" routerLinkActive="active" class="nav-link">
            🔮 Predicciones
          </a>
          <a routerLink="/fragment" routerLinkActive="active" class="nav-link">
            🧪 Fragmentos
          </a>
          <a routerLink="/reports" routerLinkActive="active" class="nav-link">
            📊 Reportes
          </a>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      .navbar {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 0;
        position: sticky;
        top: 0;
        z-index: 1000;
      }

      .navbar-container {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
      }

      .navbar-brand .brand-link {
        text-decoration: none;
        color: white;
      }

      .brand-text {
        font-size: 1.8rem;
        font-weight: 700;
        color: white;
      }

      .navbar-menu {
        display: flex;
        gap: 0.5rem;
      }

      .nav-link {
        color: rgba(255, 255, 255, 0.9);
        text-decoration: none;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .nav-link:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        transform: translateY(-1px);
      }

      .nav-link.active {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      @media (max-width: 768px) {
        .navbar-container {
          flex-direction: column;
          gap: 1rem;
          padding: 1rem;
        }

        .navbar-menu {
          flex-wrap: wrap;
          justify-content: center;
        }

        .nav-link {
          font-size: 0.9rem;
          padding: 0.5rem 0.75rem;
        }
      }
    `,
  ],
})
export class NavbarComponent {}
