import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-citation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="citation-container">
      <header class="citation-hero">
        <h1>📄 How to Cite DeepBDE</h1>
        <p class="subtitle">
          If you use DeepBDE in your research, please cite our work
        </p>
      </header>

      <section class="citation-formats">
        <div class="format-card">
          <h3>🎓 Academic Citation</h3>
          <div class="citation-box">
            <pre>{{ academicCitation }}</pre>
            <button
              class="copy-btn"
              (click)="copyToClipboard(academicCitation)"
            >
              📋 Copy Citation
            </button>
          </div>
        </div>

        <div class="format-card">
          <h3>🔗 BibTeX Format</h3>
          <div class="citation-box">
            <pre>{{ bibtexCitation }}</pre>
            <button class="copy-btn" (click)="copyToClipboard(bibtexCitation)">
              📋 Copy BibTeX
            </button>
          </div>
        </div>
      </section>

      <section class="demo-section">
        <h2>🚀 Demo & Examples</h2>
        <div class="demo-grid">
          <div class="demo-card">
            <h4>Basic SMILES Analysis</h4>
            <p>Try analyzing this ethanol molecule:</p>
            <code class="demo-smiles">CCO</code>
            <p class="demo-description">
              Simple alcohol molecule - great for testing basic functionality
            </p>
          </div>

          <div class="demo-card">
            <h4>Complex Organic Molecule</h4>
            <p>Analyze this more complex structure:</p>
            <code class="demo-smiles">CC(C)C1CCC(CC1)C(C)C</code>
            <p class="demo-description">
              Menthol-like structure with multiple bond types for comprehensive
              analysis
            </p>
          </div>

          <div class="demo-card">
            <h4>Fragment Analysis Example</h4>
            <p>Parent molecule:</p>
            <code class="demo-smiles">CCOc1cccc(O)c1</code>
            <p>Fragment 1: <code class="demo-smiles">CCOc1cccc</code></p>
            <p>Fragment 2: <code class="demo-smiles">Oc1</code></p>
            <p class="demo-description">
              Phenol derivative - demonstrates fragment-based BDE calculation
            </p>
          </div>
        </div>
      </section>

      <section class="resources-section">
        <h2>📚 Additional Resources</h2>
        <div class="resources-grid">
          <a
            href="https://github.com/MSRG/DeepBDE/"
            target="_blank"
            class="resource-link"
          >
            <h4>🐙 Original Repository</h4>
            <p>MSRG/DeepBDE on GitHub</p>
          </a>

          <div class="resource-link">
            <h4>📖 Documentation</h4>
            <p>Coming soon - Comprehensive user guide</p>
          </div>

          <div class="resource-link">
            <h4>🔬 Research Paper</h4>
            <p>Publication details will be updated</p>
          </div>
        </div>
      </section>

      <div *ngIf="copyMessage" class="copy-notification">
        {{ copyMessage }}
      </div>
    </div>
  `,
  styles: [
    `
      .citation-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        line-height: 1.6;
      }

      .citation-hero {
        text-align: center;
        padding: 3rem 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        color: white;
        margin-bottom: 3rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      }

      .citation-hero h1 {
        font-size: 3rem;
        font-weight: 800;
        margin-bottom: 1rem;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      }

      .subtitle {
        font-size: 1.3rem;
        opacity: 0.9;
      }

      .citation-formats {
        display: grid;
        gap: 2rem;
        margin-bottom: 3rem;
      }

      .format-card {
        background: white;
        border-radius: 15px;
        padding: 2rem;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(102, 126, 234, 0.1);
      }

      .format-card h3 {
        color: #667eea;
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        font-weight: 600;
      }

      .citation-box {
        position: relative;
        background: #f7fafc;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        padding: 1.5rem;
        font-family: 'Courier New', monospace;
      }

      .citation-box pre {
        margin: 0;
        white-space: pre-wrap;
        word-wrap: break-word;
        font-size: 0.9rem;
        color: #2d3748;
        line-height: 1.5;
      }

      .copy-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: #667eea;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.85rem;
        transition: all 0.3s ease;
      }

      .copy-btn:hover {
        background: #5a67d8;
        transform: translateY(-1px);
      }

      .demo-section {
        margin-bottom: 3rem;
      }

      .demo-section h2 {
        font-size: 2.5rem;
        color: #2d3748;
        text-align: center;
        margin-bottom: 2rem;
        font-weight: 700;
      }

      .demo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
      }

      .demo-card {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(102, 126, 234, 0.1);
        transition: all 0.3s ease;
      }

      .demo-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
      }

      .demo-card h4 {
        color: #667eea;
        font-size: 1.2rem;
        margin-bottom: 1rem;
        font-weight: 600;
      }

      .demo-smiles {
        background: #e2e8f0;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-family: 'Courier New', monospace;
        font-weight: 600;
        color: #2d3748;
        display: inline-block;
        margin: 0.5rem 0;
        border: 1px solid #cbd5e0;
      }

      .demo-description {
        color: #4a5568;
        font-size: 0.95rem;
        margin-top: 1rem;
        font-style: italic;
      }

      .resources-section h2 {
        font-size: 2.2rem;
        color: #2d3748;
        text-align: center;
        margin-bottom: 2rem;
        font-weight: 700;
      }

      .resources-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
      }

      .resource-link {
        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        padding: 2rem;
        border-radius: 15px;
        text-decoration: none;
        color: inherit;
        transition: all 0.3s ease;
        border: 1px solid rgba(102, 126, 234, 0.1);
        display: block;
      }

      .resource-link:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
      }

      .resource-link h4 {
        color: #667eea;
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
        font-weight: 600;
      }

      .resource-link p {
        color: #4a5568;
        font-size: 0.95rem;
        margin: 0;
      }

      .copy-notification {
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: #48bb78;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @media (max-width: 768px) {
        .citation-container {
          padding: 1rem;
        }

        .citation-hero {
          padding: 2rem 1rem;
        }

        .citation-hero h1 {
          font-size: 2.2rem;
        }

        .subtitle {
          font-size: 1.1rem;
        }

        .demo-grid,
        .resources-grid {
          grid-template-columns: 1fr;
        }

        .copy-notification {
          top: 1rem;
          right: 1rem;
          left: 1rem;
          text-align: center;
        }
      }
    `,
  ],
})
export class CitationComponent {
  academicCitation = `DeepBDE: A Graph Neural Network for Bond Dissociation Energies Prediction
Authors: [To be updated with actual authors]
Journal: [To be updated with publication details]
Year: 2024
DOI: [To be updated]`;

  bibtexCitation = `@article{deepbde2024,
  title={DeepBDE: A Graph Neural Network for Bond Dissociation Energies Prediction},
  author={[To be updated with actual authors]},
  journal={[To be updated with journal name]},
  year={2024},
  doi={[To be updated]},
  url={https://github.com/MSRG/DeepBDE/}
}`;

  copyMessage = '';

  copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.copyMessage = '✅ Copied to clipboard!';
        setTimeout(() => {
          this.copyMessage = '';
        }, 3000);
      })
      .catch(() => {
        this.copyMessage = '❌ Failed to copy';
        setTimeout(() => {
          this.copyMessage = '';
        }, 3000);
      });
  }
}
