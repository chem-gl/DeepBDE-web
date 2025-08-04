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
          <a routerLink="/fragment" routerLinkActive="active" class="nav-link">
            🖥️ DeepBDE Fragmentos
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
        background: linear-gradient(
          135deg,
          #8e44ad 0%,
          #9b59b6 25%,
          #6c3483 50%,
          #8e44ad 75%,
          #7d3c98 100%
        );
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
        padding: 5px 1.5rem;
      }

      .navbar-brand .brand-link {
        text-decoration: none;
        color: white;
      }

      .brand-text {
        font-size: 1.6rem;
        font-weight: 700;
        color: white;
      }

      .navbar-menu {
        display: flex;
        gap: 0.25rem;
      }

      .nav-link {
        color: rgba(255, 255, 255, 0.9);
        text-decoration: none;
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        font-weight: 500;
        font-size: 0.9rem;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .nav-link:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        transform: translateY(-1px);
      }

      .nav-link.active {
        background: rgba(255, 255, 255, 0.25);
        color: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }

      @media (max-width: 768px) {
        .navbar-container {
          flex-direction: column;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
        }

        .brand-text {
          font-size: 1.4rem;
        }

        .navbar-menu {
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.25rem;
        }

        .nav-link {
          font-size: 0.85rem;
          padding: 0.4rem 0.6rem;
        }
      }

      @media (max-width: 480px) {
        .navbar-container {
          padding: 0.5rem 0.75rem;
        }

        .brand-text {
          font-size: 1.2rem;
        }

        .nav-link {
          font-size: 0.8rem;
          padding: 0.35rem 0.5rem;
          gap: 0.3rem;
        }
      }
    `,
  ],
})
export class NavbarComponent {}
