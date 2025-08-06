import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { MoleculeInfoRequest, V1Service } from '../../../../angular-client';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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

      <section class="analysis-section">
        <div class="mode-selector">
          <button
            (click)="setMode('smiles')"
            [class.active]="selectedMode === 'smiles'"
            class="mode-btn"
          >
            SMILES Analysis
          </button>
          <button
            (click)="setMode('fragments')"
            [class.active]="selectedMode === 'fragments'"
            class="mode-btn"
          >
            Fragment Analysis
          </button>
        </div>

        @if(selectedMode === 'smiles') {
        <div class="input-section smiles-section">
          <div class="input-group">
            <label for="smiles-input">Enter SMILES Notation:</label>
            <input
              id="smiles-input"
              type="text"
              [(ngModel)]="smilesInput"
              placeholder="e.g., CCOc1cccc(O)c1"
              class="smiles-input"
            />
            <small class="input-help"
              >Enter a valid SMILES string for molecular analysis</small
            >
          </div>
          <div class="action-buttons">
            <button
              class="btn-primary"
              (click)="analyzeMolecule()"
              [disabled]="!smilesInput.trim() || loadingInfo"
            >
              {{ loadingInfo ? 'Analyzing...' : 'Analyze Molecule' }}
            </button>
          </div>
        </div>
        } @else if(selectedMode === 'fragments') {
        <div class="input-section fragments-section">
          <div class="input-group">
            <label for="parent-smiles">Parent Molecule SMILES:</label>
            <input
              id="parent-smiles"
              type="text"
              [(ngModel)]="parentSmiles"
              placeholder="e.g., CCOc1cccc(O)c1"
              class="parent-smiles-input"
            />
            <small class="input-help">Enter the complete molecule SMILES</small>
          </div>

          <div class="fragments-inputs">
            <div class="input-group">
              <label for="fragment1">Fragment 1 SMILES:</label>
              <input
                id="fragment1"
                type="text"
                [(ngModel)]="fragment1"
                placeholder="e.g., CCOc1cccc"
                class="fragment-input"
              />
            </div>

            <div class="input-group">
              <label for="fragment2">Fragment 2 SMILES:</label>
              <input
                id="fragment2"
                type="text"
                [(ngModel)]="fragment2"
                placeholder="e.g., Oc1"
                class="fragment-input"
              />
            </div>
          </div>

          <div class="action-buttons">
            <button
              class="btn-primary"
              [routerLink]="['/fragment']"
              [queryParams]="{
                parent: parentSmiles,
                fragment1: fragment1,
                fragment2: fragment2
              }"
              [disabled]="
                !parentSmiles.trim() || !fragment1.trim() || !fragment2.trim()
              "
            >
              Analyze Fragments
            </button>
          </div>
        </div>
        }
      </section>

      <!-- Loading Section -->
      <div *ngIf="loadingInfo" class="loading-section">
        <div class="spinner"></div>
        <p>Getting molecular information...</p>
      </div>

      <!-- Results Section -->
      <div *ngIf="svgImage" class="results-section">
        <h2>Molecular Structure</h2>

        <div class="image-actions">
          <button (click)="downloadSVGFile()" class="btn-download">
            🖼️ Download SVG
          </button>
          <button
            (click)="downloadPNGFile()"
            class="btn-download"
            style="margin-left: 0.5rem;"
          >
            📷 Download PNG
          </button>
        </div>
        <div class="image-container">
          <div class="image-controls">
            <button (click)="zoomIn()" class="control-btn" title="Zoom In">
              🔍+
            </button>
            <button (click)="zoomOut()" class="control-btn" title="Zoom Out">
              🔍-
            </button>
            <button
              (click)="resetZoom()"
              class="control-btn"
              title="Original Size"
            >
              ↻
            </button>
            <button
              (click)="toggleFullscreen()"
              class="control-btn"
              title="Fullscreen"
            >
              ⛶
            </button>
          </div>
          <div
            class="svg-display"
            [class.fullscreen]="isFullscreen"
            #svgContainer
            (mousedown)="startPan($event)"
            (mousemove)="onPan($event)"
            (mouseup)="endPan()"
            (mouseleave)="endPan()"
            (wheel)="onWheel($event)"
          >
            <!-- Close fullscreen button -->
            <button
              *ngIf="isFullscreen"
              (click)="toggleFullscreen()"
              class="close-fullscreen-btn"
              title="Close fullscreen"
            >
              ✕
            </button>
            <div
              [innerHTML]="sanitizedSvg"
              class="svg-content"
              [style.transform]="getTransform()"
            ></div>
          </div>
        </div>

        <!-- Bond Selection Section -->

        <h3 class="title-bond">Bond Selection Options</h3>
        <div class="bond-options-horizontal">
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="selectAllBonds"
                (change)="onSelectAllBondsChange()"
                class="checkbox-input"
              />
              <span class="checkbox-custom"></span>
              Select all possible bonds
            </label>
          </div>

          <div class="custom-bonds-input" [class.disabled]="selectAllBonds">
            <label for="custom-bonds">Specify bond indices:</label>
            <input
              id="custom-bonds"
              type="text"
              [(ngModel)]="customBondsInput"
              placeholder="e.g., 1,2,5-8,10"
              class="bonds-input"
              [disabled]="selectAllBonds"
            />
          </div>
        </div>
        <div class="bond-help-text">
          <small class="input-help">
            Enter bond numbers separated by commas. Use dashes for ranges (e.g.,
            1,2,5-8,10)
          </small>
        </div>

        <!-- Result Format Section -->

        <h3 class="title-format">Result Format Options</h3>
        <div class="format-checkboxes">
          <div class="format-checkbox-group">
            <label class="format-checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="includeXyzFormat"
                class="format-checkbox-input"
              />
              <span class="format-checkbox-custom"></span>
              XYZ Format
            </label>
          </div>

          <div class="format-checkbox-group">
            <label class="format-checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="includeSmilesFormat"
                class="format-checkbox-input"
              />
              <span class="format-checkbox-custom"></span>
              SMILES Format
            </label>
          </div>
        </div>
        <div class="format-help-text">
          <small class="input-help">
            Select one, both, or none of the output formats for the BDE results
          </small>
        </div>
        <div class="bde-action">
          <button class="btn-bde" (click)="getBDE()">Get BDE</button>
        </div>
      </div>
      <div *ngIf="error" class="error-section">
        <h3>Error</h3>
        <p>{{ error }}</p>
      </div>

      <footer class="footer-section">
        <p>
          &copy; 2023 DeepBDE. All rights reserved. designed by
          <a
            href="https://github.com/CesarGuzmanLopez/"
            target="_blank"
            rel="noopener noreferrer"
            class="github-link"
          >
            Cesar Gerardo Guzman Lopez
          </a>
        </p>
      </footer>
    </div>
  `,
  styles: [
    `
      .home-container {
        padding: 1.5rem;
        margin: 0 auto;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        min-height: 100vh;
        max-width: 1400px;
      }

      .footer-section {
        text-align: center;
        margin-top: 2rem;
        padding: 1rem 0;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        color: #2d3748;
        .github-link {
          color: #2d3748;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }
      }

      .hero-section {
        text-align: center;
        margin-bottom: 2.5rem;
        padding: 2.5rem 2rem;
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
        font-size: 3rem;
        margin-bottom: 0.8rem;
        font-weight: 800;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        letter-spacing: -2px;
        position: relative;
        z-index: 1;
      }

      .subtitle {
        font-size: 1.4rem;
        margin-bottom: 1rem;
        font-weight: 300;
        opacity: 0.95;
        position: relative;
        z-index: 1;
      }

      .description {
        font-size: 1.1rem;
        max-width: 700px;
        margin: 0 auto 1.5rem;
        line-height: 1.6;
        opacity: 0.9;
        position: relative;
        z-index: 1;
      }

      .citation-section {
        margin-top: 1.5rem;
        padding-top: 1rem;
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
      .analysis-section {
        margin: 2.5rem 0;
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border-radius: 20px;
        padding: 2rem 2rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      }

      .analysis-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .analysis-header h2 {
        font-size: 2rem;
        color: #2d3748;
        margin-bottom: 0.8rem;
        font-weight: 700;
      }

      .analysis-header p {
        font-size: 1.2rem;
        color: #4a5568;
        margin: 0;
      }

      .mode-selector {
        display: flex;
        justify-content: center;
        margin-bottom: 2rem;
        flex-wrap: wrap;
      }

      .mode-btn {
        background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
        color: #4a5568;
        border: 2px solid #cbd5e0;
        padding: 1rem 2rem;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        position: relative;
        overflow: hidden;
        margin: 0;
      }

      .mode-btn:first-child {
        border-top-left-radius: 50px;
        border-bottom-left-radius: 50px;
        border-right: 1px solid #cbd5e0;
      }

      .mode-btn:last-child {
        border-top-right-radius: 50px;
        border-bottom-right-radius: 50px;
        border-left: 1px solid #cbd5e0;
      }

      .mode-btn::before {
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
        transition: left 0.5s ease;
      }

      .mode-btn:hover::before {
        left: 100%;
      }

      .mode-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        z-index: 1;
      }

      .mode-btn.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-color: #667eea;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        z-index: 2;
      }

      .mode-btn.active:first-child {
        border-right-color: #667eea;
      }

      .mode-btn.active:last-child {
        border-left-color: #667eea;
      }
      .smiles-input,
      .parent-smiles-input,
      .fragment-input {
        width: 100%;
        padding: 1rem 1.5rem;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        font-size: 1rem;
        transition: all 0.3s ease;
        background: #f7fafc;
      }
      .title-bond {
        padding-top: 1rem;
        text-align: center;
        font-size: 1.4rem;
        color: #2d3748;
        margin-bottom: 1rem;
        font-weight: 600;
      }

      .title-format {
        padding-top: 1rem;
        text-align: center;
        font-size: 1.4rem;
        color: #2d3748;
        margin-bottom: 1rem;
        font-weight: 600;
      }
      .smiles-input:focus,
      .parent-smiles-input:focus,
      .fragment-input:focus {
        outline: none;
        border-color: #667eea;
        background: white;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        transform: translateY(-1px);
      }

      .input-help {
        display: block;
        margin-top: 0.5rem;
        font-size: 0.9rem;
        color: #718096;
        font-style: italic;
      }

      .fragments-inputs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-top: 1rem;
      }

      .action-buttons {
        text-align: center;
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
      }

      @media (max-width: 768px) {
        .analysis-section {
          padding: 2rem 1.5rem;
          margin: 3rem 0;
        }

        .analysis-header h2 {
          font-size: 2rem;
        }

        .mode-selector {
          flex-direction: column;
          align-items: center;
          gap: 0;
        }

        .mode-btn {
          width: 100%;
          max-width: 250px;
          border-radius: 10px !important;
          border: 2px solid #cbd5e0 !important;
          margin-bottom: 0.5rem;
        }

        .mode-btn:first-child,
        .mode-btn:last-child {
          border-radius: 10px !important;
        }

        .fragments-inputs {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .input-section {
          padding: 2rem 1.5rem;
        }
      }

      @media (max-width: 480px) {
        .analysis-header h2 {
          font-size: 1.8rem;
        }

        .analysis-header p {
          font-size: 1rem;
        }

        .input-section {
          padding: 1.5rem 1rem;
        }
      }

      /* Loading Section */
      .loading-section {
        text-align: center;
        padding: 2rem;
        margin: 1.5rem 0;
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      }

      .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .loading-section p {
        font-size: 1.2rem;
        color: #4a5568;
        margin: 0;
      }

      /* Results Section */
      .results-section {
        margin: 2rem 0;
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border-radius: 20px;
        padding: 2rem 2rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      }

      .results-section h2 {
        font-size: 2rem;
        color: #2d3748;
        margin-bottom: 1.5rem;
        text-align: center;
        font-weight: 700;
      }

      .result-card {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(102, 126, 234, 0.1);
      }

      .image-actions {
        margin-bottom: 1.5rem;
        text-align: right;
      }

      .btn-download {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 25px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      }

      .btn-download:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }

      .image-container {
        text-align: center;
        position: relative;
      }

      .image-controls {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
      }

      .control-btn {
        background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
        color: #4a5568;
        border: 2px solid #cbd5e0;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 50px;
      }

      .control-btn:hover {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-color: #667eea;
        transform: translateY(-2px);
      }

      .svg-display {
        display: inline-block;
        max-width: 100%;
        overflow: hidden;
        line-height: 0;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        background: white;
        cursor: grab;
        user-select: none;
        position: relative;
        min-height: 400px;
        width: 100%;
      }

      .svg-display:active {
        cursor: grabbing;
      }

      .svg-display.fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw !important;
        height: 100vh !important;
        max-width: none !important;
        z-index: 9999;
        background: rgba(0, 0, 0, 0.9);
        border-radius: 0;
        border: none;
      }

      .close-fullscreen-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: rgba(255, 255, 255, 0.9);
        color: #333;
        border: none;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        font-size: 1.5rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .close-fullscreen-btn:hover {
        background: rgba(255, 255, 255, 1);
        transform: scale(1.1);
      }

      .svg-content {
        transition: transform 0.1s ease-out;
        transform-origin: center center;
        display: inline-block;
      }

      .svg-display svg {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        background: white;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }

      .svg-display * {
        vector-effect: non-scaling-stroke;
      }

      /* Error Section */
      .error-section {
        background: #fff;
        border: 2px solid #e74c3c;
        border-radius: 15px;
        padding: 2rem;
        margin: 2rem 0;
        color: #e74c3c;
      }

      .error-section h3 {
        margin-top: 0;
        font-size: 1.5rem;
      }

      .error-section p {
        margin-bottom: 0;
        font-size: 1.1rem;
      }

      /* Bond Selection Section */
      .bond-selection-section {
        margin-top: 2rem;
        padding: 2rem;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 15px;
        border: 2px solid #e2e8f0;
      }

      .bond-selection-section h3 {
        font-size: 1.6rem;
        color: #2d3748;
        margin-bottom: 1.5rem;
        font-weight: 600;
        text-align: center;
      }

      .bond-options {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .bond-options-horizontal {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 1.5rem;
        align-items: start;
        margin-bottom: 0.8rem;
      }

      .bond-help-text {
        text-align: center;
        margin-top: 0.3rem;
      }

      .checkbox-group {
        display: flex;
        align-items: flex-start;
        padding: 1rem 1.5rem;
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border-radius: 15px;
        border: 2px solid transparent;
        background-clip: padding-box;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08),
          0 3px 10px rgba(102, 126, 234, 0.1);
        position: relative;
        overflow: hidden;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .checkbox-group::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
        border-radius: 13px;
        z-index: -1;
      }

      .checkbox-group:hover::before {
        opacity: 0.05;
      }

      .checkbox-group:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12),
          0 5px 15px rgba(102, 126, 234, 0.2);
        border-color: rgba(102, 126, 234, 0.3);
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        cursor: pointer;
        font-size: 1.2rem;
        font-weight: 600;
        color: #2d3748;
        user-select: none;
        transition: all 0.3s ease;
        position: relative;
      }

      .checkbox-label:hover {
        color: #667eea;
        text-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
      }

      .checkbox-input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
      }

      .checkbox-custom {
        position: relative;
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
        border: 3px solid #e2e8f0;
        border-radius: 8px;
        margin-right: 1rem;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08),
          inset 0 1px 3px rgba(255, 255, 255, 0.5);
        overflow: hidden;
      }

      .checkbox-custom::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(102, 126, 234, 0.3),
          transparent
        );
        transition: left 0.6s ease;
      }

      .checkbox-custom:hover::before {
        left: 100%;
      }

      .checkbox-input:checked + .checkbox-custom {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-color: #667eea;
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4),
          0 0 0 4px rgba(102, 126, 234, 0.1),
          inset 0 1px 3px rgba(255, 255, 255, 0.3);
      }

      .checkbox-input:checked + .checkbox-custom::after {
        content: '';
        position: absolute;
        left: 7px;
        top: 3px;
        width: 6px;
        height: 12px;
        border: solid white;
        border-width: 0 3px 3px 0;
        transform: rotate(45deg);
        animation: checkmark 0.3s ease-in-out;
      }

      @keyframes checkmark {
        0% {
          opacity: 0;
          transform: rotate(45deg) scale(0);
        }
        50% {
          opacity: 1;
          transform: rotate(45deg) scale(1.2);
        }
        100% {
          opacity: 1;
          transform: rotate(45deg) scale(1);
        }
      }

      .checkbox-custom:hover {
        border-color: #667eea;
        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        transform: translateY(-1px) scale(1.02);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12),
          0 0 0 4px rgba(102, 126, 234, 0.15),
          inset 0 1px 3px rgba(255, 255, 255, 0.6);
      }

      .checkbox-input:focus + .checkbox-custom {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2),
          0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .custom-bonds-input {
        background: white;
        padding: 1rem;
        border-radius: 10px;
        border: 2px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
      }

      .custom-bonds-input.disabled {
        background: #f7fafc;
        opacity: 0.6;
      }

      .custom-bonds-input.disabled label {
        color: #a0aec0;
      }

      .custom-bonds-input label {
        display: block;
        font-size: 1rem;
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 0.5rem;
      }

      .bonds-input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.3s ease;
        background: #f7fafc;
      }

      .bonds-input:focus {
        outline: none;
        border-color: #667eea;
        background: white;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        transform: translateY(-1px);
      }

      .bonds-input:disabled {
        background: #f1f5f9;
        color: #a0aec0;
        cursor: not-allowed;
        border-color: #e2e8f0;
      }

      .bonds-input:disabled::placeholder {
        color: #cbd5e0;
      }

      .bonds-input::placeholder {
        color: #a0aec0;
        font-style: italic;
      }

      /* Result Format Section */
      .result-format-section {
        margin-top: 1.5rem;
        padding: 1.5rem;
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border-radius: 15px;
        border: 2px solid #e2e8f0;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
      }

      .result-format-section h3 {
        font-size: 1.4rem;
        color: #2d3748;
        margin-bottom: 1rem;
        font-weight: 600;
        text-align: center;
      }

      .format-checkboxes {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-bottom: 1rem;
        justify-items: center;
      }

      .format-checkbox-group {
        display: flex;
        align-items: center;
        padding: 1rem 1.5rem;
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border-radius: 15px;
        border: 2px solid transparent;
        background-clip: padding-box;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08),
          0 3px 10px rgba(102, 126, 234, 0.1);
        position: relative;
        overflow: hidden;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        min-width: 180px;
      }

      .format-checkbox-group::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
        border-radius: 13px;
        z-index: -1;
      }

      .format-checkbox-group:hover::before {
        opacity: 0.05;
      }

      .format-checkbox-group:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12),
          0 5px 15px rgba(102, 126, 234, 0.2);
        border-color: rgba(102, 126, 234, 0.3);
      }

      .format-checkbox-label {
        display: flex;
        align-items: center;
        cursor: pointer;
        font-size: 1.1rem;
        font-weight: 600;
        color: #2d3748;
        user-select: none;
        transition: all 0.3s ease;
        position: relative;
      }

      .format-checkbox-label:hover {
        color: #667eea;
        text-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
      }

      .format-checkbox-input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
      }

      .format-checkbox-custom {
        position: relative;
        width: 22px;
        height: 22px;
        background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
        border: 3px solid #e2e8f0;
        border-radius: 6px;
        margin-right: 0.75rem;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08),
          inset 0 1px 3px rgba(255, 255, 255, 0.5);
        overflow: hidden;
      }

      .format-checkbox-custom::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(102, 126, 234, 0.3),
          transparent
        );
        transition: left 0.6s ease;
      }

      .format-checkbox-custom:hover::before {
        left: 100%;
      }

      .format-checkbox-input:checked + .format-checkbox-custom {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-color: #667eea;
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4),
          0 0 0 4px rgba(102, 126, 234, 0.1),
          inset 0 1px 3px rgba(255, 255, 255, 0.3);
      }

      .format-checkbox-input:checked + .format-checkbox-custom::after {
        content: '';
        position: absolute;
        left: 6px;
        top: 2px;
        width: 5px;
        height: 10px;
        border: solid white;
        border-width: 0 2.5px 2.5px 0;
        transform: rotate(45deg);
        animation: checkmark 0.3s ease-in-out;
      }

      .format-checkbox-custom:hover {
        border-color: #667eea;
        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        transform: translateY(-1px) scale(1.02);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12),
          0 0 0 4px rgba(102, 126, 234, 0.15),
          inset 0 1px 3px rgba(255, 255, 255, 0.6);
      }

      .format-checkbox-input:focus + .format-checkbox-custom {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2),
          0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .format-help-text {
        text-align: center;
        margin-bottom: 0.8rem;
      }

      .bde-action {
        text-align: center;
        padding-top: 0.8rem;
        border-top: 1px solid #e2e8f0;
      }

      .btn-bde {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 1rem 2.5rem;
        border-radius: 50px;
        font-size: 1.1rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        text-transform: uppercase;
        letter-spacing: 1px;
        position: relative;
        overflow: hidden;
        min-width: 180px;
      }

      .btn-bde:disabled {
        background: linear-gradient(135deg, #a0aec0 0%, #cbd5e0 100%);
        color: #718096;
        cursor: not-allowed;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: none !important;
      }

      .btn-bde:disabled::before {
        display: none;
      }

      .btn-bde::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.3),
          transparent
        );
        transition: left 0.6s ease;
      }

      .btn-bde:hover:not(:disabled)::before {
        left: 100%;
      }

      .btn-bde:hover:not(:disabled) {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.6),
          0 0 0 4px rgba(102, 126, 234, 0.2);
        background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
      }

      .btn-bde:active:not(:disabled) {
        transform: translateY(-1px) scale(1.01);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      }

      @media (max-width: 768px) {
        .bond-selection-section {
          padding: 1.5rem;
        }

        .bond-selection-section h3 {
          font-size: 1.4rem;
        }

        .bond-options-horizontal {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .checkbox-group {
          justify-content: center;
          padding: 1rem 1.5rem;
          margin: 0 auto;
          max-width: 300px;
        }

        .checkbox-label {
          font-size: 1.1rem;
        }

        .checkbox-custom {
          width: 22px;
          height: 22px;
          margin-right: 0.75rem;
        }

        .checkbox-input:checked + .checkbox-custom::after {
          left: 6px;
          top: 2px;
          width: 5px;
          height: 10px;
          border-width: 0 2.5px 2.5px 0;
        }

        .custom-bonds-input {
          padding: 1rem;
        }

        .result-format-section {
          padding: 1.5rem;
        }

        .result-format-section h3 {
          font-size: 1.4rem;
        }

        .format-checkboxes {
          grid-template-columns: 1fr;
          gap: 1rem;
          max-width: 300px;
          margin: 0 auto 1.5rem;
        }

        .format-checkbox-group {
          padding: 1rem 1.5rem;
          min-width: auto;
          width: 100%;
        }

        .format-checkbox-label {
          font-size: 1rem;
        }

        .format-checkbox-custom {
          width: 20px;
          height: 20px;
          margin-right: 0.5rem;
        }

        .format-checkbox-input:checked + .format-checkbox-custom::after {
          left: 5px;
          top: 1px;
          width: 4px;
          height: 8px;
          border-width: 0 2px 2px 0;
        }

        .btn-bde {
          padding: 1rem 2rem;
          font-size: 1.1rem;
          min-width: auto;
          width: 100%;
          max-width: 250px;
        }
      }
    `,
  ],
})
export class HomeComponent {
  // Component properties for mode selection
  selectedMode: 'smiles' | 'fragments' = 'smiles';
  smilesInput = '';
  parentSmiles = '';
  fragment1 = '';
  fragment2 = '';

  // Properties for molecular analysis
  loadingInfo = false;
  error: string | null = null;
  svgImage: string | null = null;
  sanitizedSvg: SafeHtml | null = null;

  // Properties for zoom and pan
  zoom = 1;
  panX = 0;
  panY = 0;
  isPanning = false;
  lastPanX = 0;
  lastPanY = 0;
  isFullscreen = false;

  // Properties for bond selection
  selectAllBonds = true;
  customBondsInput = '';

  // Properties for result format
  includeXyzFormat = false;
  includeSmilesFormat = false;

  constructor(
    private readonly v1Service: V1Service,
    private readonly sanitizer: DomSanitizer
  ) {
    // Add listener for Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isFullscreen) {
        this.toggleFullscreen();
      }
    });
  }

  // Method to change analysis mode
  setMode(mode: 'smiles' | 'fragments') {
    this.selectedMode = mode;
    // Clear inputs when switching modes
    this.smilesInput = '';
    this.parentSmiles = '';
    this.fragment1 = '';
    this.fragment2 = '';
    // Clear results
    this.clearResults();
  }

  // Clear all results
  clearResults() {
    this.svgImage = null;
    this.sanitizedSvg = null;
    this.error = null;
    this.resetZoom();
    this.isFullscreen = false;
  }

  // Handle bond selection change
  onSelectAllBondsChange() {
    if (this.selectAllBonds) {
      this.customBondsInput = '';
    }
  }

  // Get BDE method (placeholder for now)
  getBDE() {
    console.log('Getting BDE with formats:');
    console.log('Include XYZ:', this.includeXyzFormat);
    console.log('Include SMILES:', this.includeSmilesFormat);

    if (!this.includeXyzFormat && !this.includeSmilesFormat) {
      console.log('No output format selected - will use default behavior');
    }

    console.log('Select all bonds:', this.selectAllBonds);
    console.log('Custom bonds:', this.customBondsInput);
    // TODO: Implement BDE calculation logic
  }

  // Analyze molecule method
  analyzeMolecule() {
    if (!this.smilesInput.trim()) {
      this.error = 'Please enter the molecule SMILES';
      return;
    }

    this.loadingInfo = true;
    this.error = null;
    this.clearResults();

    const requestInfo: MoleculeInfoRequest = {
      smiles: this.smilesInput.trim(),
    };

    this.v1Service.v1PredictInfoCreate(requestInfo).subscribe({
      next: (response) => {
        const svgData = response.data?.image_svg ?? '';
        this.svgImage = this.processSVGData(svgData);

        if (!this.svgImage && svgData) {
          console.log(
            'Empty or invalid SVG. Data received:',
            svgData.substring(0, 100)
          );
        }
        this.loadingInfo = false;
      },
      error: (error: any) => {
        this.error =
          'Error getting molecular information: ' +
          (error.message || 'Unknown error');
        this.loadingInfo = false;
      },
    });
  }

  // Process SVG data
  private processSVGData(svgData: string): string | null {
    if (!svgData) {
      this.sanitizedSvg = null;
      return null;
    }

    // Clean and format SVG
    let cleanSvg = svgData.trim();

    // Replace problematic encoding characters
    cleanSvg = cleanSvg.replace(/encoding='iso-8859-1'/g, "encoding='UTF-8'");

    // Ensure proper spacing between attributes
    cleanSvg = cleanSvg.replace(/xmlns=/g, ' xmlns=');
    cleanSvg = cleanSvg.replace(/xmlns:rdkit=/g, ' xmlns:rdkit=');
    cleanSvg = cleanSvg.replace(/xmlns:xlink=/g, ' xmlns:xlink=');
    cleanSvg = cleanSvg.replace(/xml:space=/g, ' xml:space=');
    cleanSvg = cleanSvg.replace(/width=/g, ' width=');
    cleanSvg = cleanSvg.replace(/height=/g, ' height=');
    cleanSvg = cleanSvg.replace(/viewBox=/g, ' viewBox=');

    // Clean multiple spaces
    cleanSvg = cleanSvg.replace(/\s+/g, ' ');

    // Format first line correctly
    cleanSvg = cleanSvg.replace(
      /^<\?xml[^>]+\?><svg/,
      "<?xml version='1.0' encoding='UTF-8'?>\n<svg"
    );

    // Sanitize SVG for Angular
    this.sanitizedSvg = this.sanitizer.bypassSecurityTrustHtml(cleanSvg);

    return cleanSvg;
  }

  // Zoom and pan methods
  zoomIn() {
    this.zoom = Math.min(this.zoom * 1.2, 15);
  }

  zoomOut() {
    this.zoom = Math.max(this.zoom / 1.2, 0.1);
  }

  resetZoom() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    if (!this.isFullscreen) {
      this.resetZoom();
    }
  }

  getTransform(): string {
    return `scale(${this.zoom}) translate(${this.panX}px, ${this.panY}px)`;
  }

  startPan(event: MouseEvent) {
    this.isPanning = true;
    this.lastPanX = event.clientX;
    this.lastPanY = event.clientY;
    event.preventDefault();
  }

  onPan(event: MouseEvent) {
    if (!this.isPanning) return;

    const deltaX = event.clientX - this.lastPanX;
    const deltaY = event.clientY - this.lastPanY;

    this.panX += deltaX / this.zoom;
    this.panY += deltaY / this.zoom;

    this.lastPanX = event.clientX;
    this.lastPanY = event.clientY;
  }

  endPan() {
    this.isPanning = false;
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    this.zoom = Math.max(0.1, Math.min(15, this.zoom * delta));
  }

  // Download methods
  downloadSVGFile() {
    if (!this.svgImage) {
      this.error = 'No SVG image available for download';
      return;
    }

    try {
      const blob = new Blob([this.svgImage], { type: 'image/svg+xml' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `molecular_structure_${this.smilesInput.replace(
        /[^a-zA-Z0-9]/g,
        '_'
      )}.svg`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      this.error = 'Error downloading SVG image';
      console.error('Error downloading SVG:', error);
    }
  }

  downloadPNGFile() {
    if (!this.svgImage) {
      this.error = 'No SVG image available for download';
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        this.error = 'Error creating canvas context';
        return;
      }

      const img = new Image();
      const svgBlob = new Blob([this.svgImage], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const scale = 2;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.scale(scale, scale);

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, img.width, img.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const pngUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = pngUrl;
              link.download = `molecular_structure_${this.smilesInput.replace(
                /[^a-zA-Z0-9]/g,
                '_'
              )}.png`;

              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              URL.revokeObjectURL(pngUrl);
              URL.revokeObjectURL(url);
            } else {
              this.error = 'Error generating PNG image';
            }
          },
          'image/png',
          0.95
        );
      };

      img.onerror = () => {
        this.error = 'Error loading SVG for conversion';
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (error) {
      this.error = 'Error converting SVG to PNG';
      console.error('Error converting to PNG:', error);
    }
  }
}
