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
              BDE prediction with automatic validation to ensure single molecule
              analysis
            </p>
          </div>
          <div class="feature-card">
            <h4>✏️ Interactive Molecular Editor</h4>
            <p>
              Draw molecules directly using the integrated Ketcher molecular
              editor. Create complex structures with an intuitive drag-and-drop
              interface and automatically generate SMILES for analysis.
            </p>
          </div>
          <div class="feature-card">
            <h4>📊 Interactive Visualization</h4>
            <p>
              View molecular structures with zoom, pan, and download
              capabilities. Export molecular images as SVG or PNG formats.
            </p>
          </div>
          <div class="feature-card">
            <h4>💾 Multiple Export Options</h4>
            <p>
              Download results in multiple formats including XYZ coordinates,
              SMILES notation, and CSV tables for further analysis.
            </p>
          </div>
        </div>
      </section>

      <section class="molecular-editor-section">
        <h3>Integrated Molecular Editor</h3>
        <div class="editor-info">
          <div class="editor-description">
            <h4>🎨 Ketcher Integration</h4>
            <p>
              DeepBDE includes an integrated version of
              <strong>Ketcher</strong>, a powerful open-source molecular editor
              that allows you to:
            </p>
            <ul class="features-list">
              <li>✨ Draw molecules using an intuitive graphical interface</li>
              <li>🔧 Add atoms, bonds, and functional groups with precision</li>
              <li>
                🧪 Create complex organic structures including rings and
                stereochemistry
              </li>
              <li>
                📋 Automatically generate SMILES notation from drawn structures
              </li>
              <li>
                ✅ Real-time validation to ensure single connected molecules
              </li>
              <li>
                🎯 Perfect for users who prefer visual molecule construction
              </li>
            </ul>
          </div>
          <div class="editor-features">
            <h4>🚀 Advanced Features</h4>
            <div class="feature-highlight">
              <h5>Smart Validation</h5>
              <p>
                The system automatically validates that drawn molecules contain
                only one connected component, rejecting disconnected fragments
                to ensure accurate BDE predictions.
              </p>
            </div>
            <div class="feature-highlight">
              <h5>Seamless Integration</h5>
              <p>
                Switch effortlessly between SMILES input and molecular drawing
                modes. The editor generates clean, canonical SMILES that are
                immediately ready for analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="technology-section">
        <h3>Technology Stack</h3>
        <p>
          DeepBDE leverages state-of-the-art Graph Neural Networks to provide
          accurate predictions of bond dissociation enthalpies. The web
          interface is built with Angular and integrates with
          <strong>Ketcher</strong>, an open-source molecular editor, to provide
          an intuitive way to interact with the underlying machine learning
          model. This combination ensures both scientific accuracy and
          user-friendly molecular structure input.
        </p>
        <div class="tech-highlights">
          <div class="tech-item">
            <h4>🧠 Machine Learning</h4>
            <p>Graph Neural Networks for accurate BDE prediction</p>
          </div>
          <div class="tech-item">
            <h4>🖥️ Frontend</h4>
            <p>Angular with responsive design and modern UI</p>
          </div>
          <div class="tech-item">
            <h4>✏️ Molecular Editor</h4>
            <p>Ketcher integration for intuitive molecule drawing</p>
          </div>
        </div>
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

      .molecular-editor-section {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 3rem;
        border-radius: 20px;
        margin-bottom: 3rem;
        color: white;
      }

      .molecular-editor-section h3 {
        font-size: 2.5rem;
        text-align: center;
        margin-bottom: 2.5rem;
        font-weight: 700;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      }

      .editor-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        align-items: start;
      }

      .editor-description h4,
      .editor-features h4 {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        font-weight: 600;
        color: #ffeaa7;
      }

      .editor-description p,
      .editor-features p {
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 1.5rem;
        opacity: 0.95;
      }

      .features-list {
        list-style: none;
        padding: 0;
      }

      .features-list li {
        padding: 0.5rem 0;
        font-size: 1rem;
        opacity: 0.9;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .features-list li:last-child {
        border-bottom: none;
      }

      .feature-highlight {
        background: rgba(255, 255, 255, 0.1);
        padding: 1.5rem;
        border-radius: 10px;
        margin-bottom: 1.5rem;
        backdrop-filter: blur(10px);
      }

      .feature-highlight h5 {
        color: #ffeaa7;
        font-size: 1.2rem;
        margin-bottom: 0.8rem;
        font-weight: 600;
      }

      .feature-highlight p {
        margin: 0;
        font-size: 1rem;
        opacity: 0.9;
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
        margin: 0 auto 2rem;
      }

      .tech-highlights {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
        margin-top: 2rem;
      }

      .tech-item {
        background: white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
      }

      .tech-item:hover {
        transform: translateY(-3px);
      }

      .tech-item h4 {
        font-size: 1.2rem;
        color: #667eea;
        margin-bottom: 0.8rem;
        font-weight: 600;
      }

      .tech-item p {
        font-size: 0.95rem;
        color: #4a5568;
        margin: 0;
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

        .molecular-editor-section {
          padding: 2rem 1rem;
        }

        .molecular-editor-section h3 {
          font-size: 2rem;
        }

        .editor-info {
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        .editor-description h4,
        .editor-features h4 {
          font-size: 1.3rem;
        }

        .feature-highlight {
          padding: 1rem;
        }

        .technology-section {
          padding: 2rem 1rem;
        }

        .technology-section h3 {
          font-size: 1.8rem;
        }

        .tech-highlights {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .tech-item {
          padding: 1.2rem;
        }
      }
    `,
  ],
})
export class AboutComponent {}
