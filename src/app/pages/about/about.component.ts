import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="about-container">
      <header class="about-hero">
        <h1>DeepBDE</h1>
        <h2>Graph Neural Network for Bond Dissociation Enthalpies</h2>
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

      <section class="features-section">
        <h3>Key Features</h3>
        <div class="features-grid">
          <div class="feature-card">
            <h4>🧬 SMILES Analysis</h4>
            <p>
              Input molecular structures using SMILES notation for comprehensive
              BDE prediction
            </p>
          </div>
          <div class="feature-card">
            <h4>🔬 Fragment Analysis</h4>
            <p>
              Analyze specific molecular fragments to understand bond breaking
              patterns
            </p>
          </div>
          <div class="feature-card">
            <h4>📊 Interactive Visualization</h4>
            <p>
              View molecular structures with zoom, pan, and download
              capabilities
            </p>
          </div>
          <div class="feature-card">
            <h4>💾 Export Options</h4>
            <p>
              Download results in multiple formats including XYZ, SMILES, and
              CSV
            </p>
          </div>
        </div>
      </section>

      <section class="technology-section">
        <h3>Technology</h3>
        <p>
          DeepBDE leverages state-of-the-art Graph Neural Networks to provide
          accurate predictions of bond dissociation enthalpies. The web
          interface is built with Angular and provides an intuitive way to
          interact with the underlying machine learning model.
        </p>
      </section>
    </div>
  `,
  styles: [
    `
      .about-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        line-height: 1.6;
      }

      .about-hero {
        text-align: center;
        padding: 4rem 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        color: white;
        margin-bottom: 3rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      }

      .about-hero h1 {
        font-size: 3.5rem;
        font-weight: 800;
        margin-bottom: 1rem;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      }

      .about-hero h2 {
        font-size: 1.8rem;
        font-weight: 600;
        margin-bottom: 2rem;
        opacity: 0.9;
      }

      .description {
        font-size: 1.2rem;
        max-width: 800px;
        margin: 0 auto 2rem;
        opacity: 0.95;
      }

      .citation-section {
        margin-top: 2rem;
      }

      .citation-text {
        font-size: 1rem;
        opacity: 0.9;
      }

      .github-link {
        color: #ffeaa7;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
      }

      .github-link:hover {
        color: #fdcb6e;
        text-shadow: 0 0 10px rgba(255, 234, 167, 0.5);
      }

      .features-section {
        margin-bottom: 3rem;
      }

      .features-section h3 {
        font-size: 2.5rem;
        color: #2d3748;
        text-align: center;
        margin-bottom: 2rem;
        font-weight: 700;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 2rem;
        margin-top: 2rem;
      }

      .feature-card {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        border: 1px solid rgba(102, 126, 234, 0.1);
      }

      .feature-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
      }

      .feature-card h4 {
        font-size: 1.3rem;
        color: #667eea;
        margin-bottom: 1rem;
        font-weight: 600;
      }

      .feature-card p {
        color: #4a5568;
        font-size: 1rem;
      }

      .technology-section {
        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        padding: 3rem;
        border-radius: 15px;
        text-align: center;
      }

      .technology-section h3 {
        font-size: 2.2rem;
        color: #2d3748;
        margin-bottom: 1.5rem;
        font-weight: 700;
      }

      .technology-section p {
        font-size: 1.1rem;
        color: #4a5568;
        max-width: 800px;
        margin: 0 auto;
      }

      @media (max-width: 768px) {
        .about-container {
          padding: 1rem;
        }

        .about-hero {
          padding: 2rem 1rem;
        }

        .about-hero h1 {
          font-size: 2.5rem;
        }

        .about-hero h2 {
          font-size: 1.4rem;
        }

        .description {
          font-size: 1rem;
        }

        .features-grid {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .feature-card {
          padding: 1.5rem;
        }

        .technology-section {
          padding: 2rem 1rem;
        }
      }
    `,
  ],
})
export class AboutComponent {}
