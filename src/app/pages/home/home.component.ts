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
          Graph Neural Network for Bond Dissociation Enthalpies
        </p>
        <p class="description">
          A web tool based on a Graph Neural Network (GNN) that quickly and
          accurately predicts bond dissociation enthalpies (BDE) in organic
          molecules using SMILES representations
        </p>
        <div class="citation-section">
          <p class="citation-text">
            Based on the official implementation of
            <a
              href="https://github.com/MSRG/DeepBDE/"
              target="_blank"
              rel="noopener noreferrer"
              class="github-link"
            >
              DeepBDE (MSRG/DeepBDE)
            </a>
          </p>
        </div>
      </header>

      <section class="features-grid">
        <div class="feature-card" routerLink="/fragment">
          <h3>🧪 Fragment Analysis</h3>
          <p>
            Predict bond dissociation enthalpies (BDE) for specific bonds or all
            valid bonds in a molecule using advanced neural networks
          </p>
          <button class="btn-primary">Analyze Fragments</button>
        </div>

        <div class="feature-card" routerLink="/reports">
          <h3>📊 Molecular Reports</h3>
          <p>
            Generate detailed reports with 2D molecular visualizations and
            calculated BDE values for comprehensive analysis
          </p>
          <button class="btn-primary">View Reports</button>
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
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        min-height: 100vh;
      }

      .hero-section {
        text-align: center;
        margin-bottom: 4rem;
        padding: 4rem 2rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        color: white;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        position: relative;
        overflow: hidden;
      }

      .hero-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
        pointer-events: none;
      }

      .hero-section h1 {
        font-size: 4rem;
        margin-bottom: 1rem;
        font-weight: 800;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        letter-spacing: -2px;
        position: relative;
        z-index: 1;
      }

      .subtitle {
        font-size: 1.6rem;
        margin-bottom: 1.5rem;
        font-weight: 300;
        opacity: 0.95;
        position: relative;
        z-index: 1;
      }

      .description {
        font-size: 1.2rem;
        max-width: 700px;
        margin: 0 auto 2rem;
        line-height: 1.7;
        opacity: 0.9;
        position: relative;
        z-index: 1;
      }

      .citation-section {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.3);
        position: relative;
        z-index: 1;
      }

      .citation-text {
        font-size: 1rem;
        margin: 0;
        opacity: 0.8;
      }

      .github-link {
        color: #ffeaa7;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
      }

      .github-link:hover {
        color: #fdcb6e;
        background: rgba(255, 255, 255, 0.1);
        text-decoration: none;
        transform: translateY(-1px);
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 2.5rem;
        margin-top: 3rem;
      }

      .feature-card {
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        padding: 3rem 2rem;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1),
          0 1px 8px rgba(0, 0, 0, 0.06);
        text-align: center;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        cursor: pointer;
        border: 1px solid rgba(102, 126, 234, 0.1);
        position: relative;
        overflow: hidden;
      }

      .feature-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(102, 126, 234, 0.1),
          transparent
        );
        transition: left 0.6s ease;
      }

      .feature-card:hover::before {
        left: 100%;
      }

      .feature-card:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15),
          0 5px 20px rgba(102, 126, 234, 0.3);
        border-color: rgba(102, 126, 234, 0.3);
      }

      .feature-card h3 {
        font-size: 1.8rem;
        margin-bottom: 1.5rem;
        color: #2d3748;
        font-weight: 700;
        position: relative;
      }

      .feature-card p {
        color: #4a5568;
        margin-bottom: 2rem;
        line-height: 1.7;
        font-size: 1.1rem;
        position: relative;
      }

      .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 50px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        position: relative;
        overflow: hidden;
      }

      .btn-primary::before {
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

      .btn-primary:hover::before {
        left: 100%;
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
      }

      .btn-primary:active {
        transform: translateY(0);
      }

      @media (max-width: 768px) {
        .home-container {
          padding: 1rem;
        }

        .hero-section {
          padding: 3rem 1.5rem;
          margin-bottom: 3rem;
        }

        .hero-section h1 {
          font-size: 2.5rem;
        }

        .subtitle {
          font-size: 1.3rem;
        }

        .description {
          font-size: 1rem;
        }

        .features-grid {
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        .feature-card {
          padding: 2rem 1.5rem;
        }
      }

      @media (max-width: 480px) {
        .hero-section h1 {
          font-size: 2rem;
        }

        .subtitle {
          font-size: 1.1rem;
        }

        .feature-card h3 {
          font-size: 1.5rem;
        }
      }
    `,
  ],
})
export class HomeComponent {}
