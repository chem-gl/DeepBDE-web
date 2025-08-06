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
            🏠 Home
          </a>
          <a routerLink="/reports" routerLinkActive="active" class="nav-link">
            📊 Reports
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
          #667eea 0%,
          #764ba2 25%,
          #5a67d8 50%,
          #667eea 75%,
          #6b46c1 100%
        );
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15), 0 1px 4px rgba(0, 0, 0, 0.1);
        padding: 0;
        position: sticky;
        top: 0;
        z-index: 1000;
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .navbar-container {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 2rem;
      }

      .navbar-brand .brand-link {
        text-decoration: none;
        color: white;
        transition: all 0.3s ease;
      }

      .brand-text {
        font-size: 1.8rem;
        font-weight: 800;
        color: white;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        letter-spacing: -1px;
      }

      .navbar-brand:hover .brand-text {
        transform: scale(1.05);
        text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.4);
      }

      .navbar-menu {
        display: flex;
        gap: 0.5rem;
      }

      .nav-link {
        color: rgba(255, 255, 255, 0.9);
        text-decoration: none;
        padding: 0.75rem 1.25rem;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.95rem;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .nav-link::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.2),
          transparent
        );
        transition: left 0.5s ease;
      }

      .nav-link:hover::before {
        left: 100%;
      }

      .nav-link:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        transform: translateY(-2px) scale(1.05);
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
      }

      .nav-link.active {
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.25) 0%,
          rgba(255, 255, 255, 0.15) 100%
        );
        color: white;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(15px);
      }

      .nav-link.active::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #ffeaa7, #fdcb6e);
        border-radius: 2px;
      }

      @media (max-width: 768px) {
        .navbar-container {
          flex-direction: column;
          gap: 1rem;
          padding: 1rem 1.5rem;
        }

        .brand-text {
          font-size: 1.6rem;
        }

        .navbar-menu {
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem;
        }

        .nav-link {
          font-size: 0.9rem;
          padding: 0.6rem 1rem;
        }
      }

      @media (max-width: 480px) {
        .navbar-container {
          padding: 0.75rem 1rem;
        }

        .brand-text {
          font-size: 1.4rem;
        }

        .nav-link {
          font-size: 0.85rem;
          padding: 0.5rem 0.75rem;
          gap: 0.3rem;
        }

        .navbar-menu {
          width: 100%;
        }
      }
    `,
  ],
})
export class NavbarComponent {}
