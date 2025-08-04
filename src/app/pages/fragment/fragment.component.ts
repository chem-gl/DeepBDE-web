import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  FragmentRequest,
  FragmentResponseData,
  MoleculeInfoRequest,
  MoleculeInfoResponseData,
  V1Service,
} from '../../../../angular-client';
import { BDEValues } from '../../../../angular-client/model/bDEValues';
@Component({
  selector: 'app-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fragment-container">
      <h1>Molecular Fragment Analysis</h1>
      <!-- Step 1: Get molecular structure -->
      <div class="fragment-form">
        <div class="form-group">
          <label for="smiles">Molecule SMILES:</label>
          <input
            type="text"
            id="smiles"
            [(ngModel)]="smilesInput"
            placeholder="e.g.: CCOc1cccc(O)c1"
            class="form-control"
          />
        </div>
        <div class="form-actions">
          <button
            (click)="loadMoleculeStructure()"
            [disabled]="loadingStructure || !smilesInput"
            class="btn-secondary"
          >
            {{ loadingStructure ? 'Loading...' : 'Load Structure' }}
          </button>
        </div>
      </div>
      <div *ngIf="loadingStructure" class="loading">
        <div class="spinner"></div>
        <p>Loading molecular structure...</p>
      </div>
      <!-- Show molecular structure -->
      <div *ngIf="svgImage" class="structure-section">
        <h2>Molecular Structure</h2>
        <div class="result-card">
          <div class="image-container">
            <div [innerHTML]="sanitizedSvg" class="svg-display"></div>
          </div>
        </div>
      </div>
      <!-- Step 2: Configure fragment analysis (only appears after loading structure) -->
      <div *ngIf="svgImage && !loadingStructure" class="fragment-analysis-form">
        <h2>Configure Fragment Analysis</h2>
        <div class="analysis-form">
          <div class="info-display">
            <p><strong>Molecule ID:</strong> {{ moleculeId }}</p>
          </div>
          <div class="form-group">
            <label for="bondIdx">Bond Index (optional):</label>
            <input
              type="number"
              id="bondIdx"
              [(ngModel)]="bondIdx"
              placeholder="Leave empty for all bonds"
              min="0"
              step="1"
              class="form-control"
            />
          </div>
          <!-- Expected products field - only appears when bond index exists -->
        </div>
        <div class="form-group">
          <label>Export Formats (required):</label>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="exportSmiles" />
              Export SMILES
            </label>
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="exportXyz" />
              Export XYZ
            </label>
          </div>
          <small
            style="color: #666; font-size: 0.85rem; margin-top: 0.5rem; display: block;"
          >
            You must select at least one export format to perform the analysis.
          </small>
        </div>
        <div class="form-actions">
          <button
            (click)="analyzeFragment()"
            [disabled]="
              loadingAnalysis || !moleculeId || (!exportSmiles && !exportXyz)
            "
            class="btn-primary"
          >
            {{ loadingAnalysis ? 'Analyzing...' : 'Analyze Fragments' }}
          </button>
        </div>
      </div>

      <div *ngIf="loadingAnalysis" class="loading">
        <div class="spinner"></div>
        <p>Analyzing molecular fragments...</p>
      </div>

      <div *ngIf="fragmentResults" class="results">
        <h2>Analysis Results</h2>
        <div class="result-card">
          <!-- Basic information -->
          <div class="fragment-info">
            <h3>Molecule Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Canonical SMILES:</label>
                <span class="smiles-text">{{
                  fragmentResults.smiles_canonical
                }}</span>
              </div>
              <div class="info-item">
                <label>Molecule ID:</label>
                <span>{{ fragmentResults.molecule_id }}</span>
              </div>
            </div>
          </div>

          <!-- Evaluated bonds -->
          <div
            class="bonds-section"
            *ngIf="fragmentResults.bonds && fragmentResults.bonds.length > 0"
          >
            <h3>Evaluated Bonds ({{ fragmentResults.bonds.length }})</h3>
            <div class="bonds-table">
              <div class="table-header">
                <div class="col">Index</div>
                <div class="col">Bond</div>
                <div class="col">Atoms</div>
                <div class="col">Type</div>
                <div class="col">Fragmentable</div>
                <div class="col">BDE</div>
              </div>
              <div
                class="table-row"
                *ngFor="let bond of fragmentResults.bonds"
                [class.fragmentable]="bond.is_fragmentable"
                [class.non-fragmentable]="!bond.is_fragmentable"
              >
                <div class="col">{{ bond.idx }}</div>
                <div class="col">{{ bond.bond_atoms }}</div>
                <div class="col">
                  {{ bond.begin_atom }} - {{ bond.end_atom }}
                </div>
                <div class="col">{{ bond.bond_type || 'N/A' }}</div>
                <div class="col">
                  <span
                    class="status-badge"
                    [class.yes]="bond.is_fragmentable"
                    [class.no]="!bond.is_fragmentable"
                  >
                    {{ bond.is_fragmentable ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div class="col">{{ getBDEValue(bond.idx) }}</div>
              </div>
            </div>
          </div>

          <!-- Download buttons -->
          <div class="download-section">
            <h3>Downloads</h3>
            <div class="download-actions">
              <button
                *ngIf="
                  fragmentResults.smiles_list &&
                  fragmentResults.smiles_list.length > 0
                "
                (click)="downloadSmilesList()"
                class="btn-download"
              >
                📄 Download SMILES List ({{
                  fragmentResults.smiles_list.length
                }}
                items)
              </button>
              <button
                *ngIf="fragmentResults.xyz_block"
                (click)="downloadXyzFile()"
                class="btn-download"
              >
                🧪 Download XYZ File
              </button>
            </div>
          </div>

          <!-- Debug: Show complete JSON -->
          <details class="debug-section">
            <summary>View complete data (JSON)</summary>
            <pre>{{ fragmentResults | json }}</pre>
          </details>
        </div>
      </div>

      <div *ngIf="error" class="error">
        <h3>Error</h3>
        <p>{{ error }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .fragment-container {
        padding: 2rem;
        margin: 0 auto;
        max-width: 1400px;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        min-height: 100vh;
      }

      h1 {
        color: #2d3748;
        margin-bottom: 3rem;
        text-align: center;
        font-size: 2.5rem;
        font-weight: 700;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        position: relative;
      }

      h1::after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 100px;
        height: 4px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        border-radius: 2px;
      }

      .fragment-form {
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        padding: 2.5rem;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1),
          0 2px 8px rgba(0, 0, 0, 0.06);
        margin-bottom: 2rem;
        border: 1px solid rgba(102, 126, 234, 0.1);
        position: relative;
        overflow: hidden;
      }

      .fragment-form::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
      }

      .fragment-analysis-form {
        background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
        padding: 2.5rem;
        border-radius: 20px;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1),
          0 5px 15px rgba(0, 0, 0, 0.08);
        margin-bottom: 2rem;
        border-left: 6px solid #4299e1;
        position: relative;
      }

      .fragment-analysis-form h2 {
        margin-top: 0;
        color: #2b6cb0;
        margin-bottom: 2rem;
        font-size: 1.8rem;
        font-weight: 600;
      }

      .analysis-form {
        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        padding: 2rem;
        border-radius: 15px;
        border: 1px solid rgba(66, 153, 225, 0.2);
      }

      .info-display {
        background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
        padding: 1.5rem;
        border-radius: 12px;
        margin-bottom: 2rem;
        border-left: 6px solid #48bb78;
        box-shadow: 0 4px 12px rgba(72, 187, 120, 0.15);
      }

      .info-display p {
        margin: 0;
        color: #2d3748;
        font-size: 1rem;
        font-weight: 500;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.7;
        }
      }

      .structure-section {
        background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
        padding: 2.5rem;
        border-radius: 20px;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1),
          0 5px 15px rgba(0, 0, 0, 0.08);
        margin-bottom: 2rem;
        border-left: 6px solid #48bb78;
        animation: slideIn 0.6s ease-out;
      }

      .structure-section h2 {
        margin-top: 0;
        color: #2f855a;
        margin-bottom: 2rem;
        font-size: 1.8rem;
        font-weight: 600;
      }

      .image-container {
        text-align: center;
        padding: 2rem;
        background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
        border-radius: 15px;
        border: 2px solid rgba(72, 187, 120, 0.2);
        margin: 1rem 0;
        box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
      }

      .svg-display {
        display: inline-block;
        max-width: 100%;
        overflow: visible;
        line-height: 0;
        transition: transform 0.3s ease;
      }

      .svg-display:hover {
        transform: scale(1.02);
      }

      .svg-display svg {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        background: white;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        transition: box-shadow 0.3s ease;
      }

      .svg-display svg:hover {
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
      }

      .form-group {
        margin-bottom: 2rem;
      }

      label {
        display: block;
        margin-bottom: 0.75rem;
        font-weight: 600;
        color: #2d3748;
        font-size: 1.1rem;
      }

      .form-control {
        width: 100%;
        padding: 1rem 1.25rem;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        font-size: 1rem;
        transition: all 0.3s ease;
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        font-family: 'Segoe UI', system-ui, sans-serif;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .form-control:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1),
          0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }

      .form-control::placeholder {
        color: #a0aec0;
        font-style: italic;
      }

      textarea.form-control {
        min-height: 100px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        line-height: 1.5;
        resize: vertical;
      }

      .form-actions {
        display: flex;
        justify-content: center;
        margin-top: 2rem;
      }

      .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 1rem 2.5rem;
        border-radius: 50px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
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

      .btn-primary:hover:not(:disabled) {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.6);
        background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
      }

      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
      }

      .btn-secondary {
        background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 50px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(74, 85, 104, 0.4);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .btn-secondary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(74, 85, 104, 0.6);
        background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
      }

      .btn-secondary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .loading {
        text-align: center;
        padding: 3rem;
        background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        margin: 2rem 0;
      }

      .spinner {
        border: 4px solid #e2e8f0;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin: 0 auto 1.5rem;
      }

      .loading p {
        color: #4a5568;
        font-size: 1.1rem;
        font-weight: 500;
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .results {
        background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
        padding: 2.5rem;
        border-radius: 20px;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1),
          0 5px 15px rgba(0, 0, 0, 0.08);
        animation: slideIn 0.6s ease-out;
      }

      .results h2 {
        color: #2d3748;
        margin-bottom: 2rem;
        font-size: 2rem;
        font-weight: 700;
        text-align: center;
      }

      .result-card {
        background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);
        padding: 2rem;
        border-radius: 15px;
        border-left: 6px solid #667eea;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }

      .fragment-info {
        margin-bottom: 2.5rem;
        padding: 2rem;
        background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
        border-radius: 15px;
        border-left: 6px solid #48bb78;
        box-shadow: 0 8px 25px rgba(72, 187, 120, 0.15);
      }

      .fragment-info h3 {
        color: #2f855a;
        margin-bottom: 1.5rem;
        font-size: 1.6rem;
        font-weight: 600;
      }

      .info-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .info-item label {
        font-weight: 700;
        color: #2d3748;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .info-item span {
        padding: 1rem;
        background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
        border: 2px solid rgba(72, 187, 120, 0.2);
        border-radius: 10px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.9rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
      }

      .info-item span:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
      }

      .smiles-text {
        word-break: break-all;
        line-height: 1.4;
      }

      .bonds-section {
        margin-bottom: 2.5rem;
      }

      .bonds-section h3 {
        color: #2b6cb0;
        margin-bottom: 1.5rem;
        font-size: 1.6rem;
        font-weight: 600;
        text-align: center;
      }

      .bonds-table {
        background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1),
          0 5px 15px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(43, 108, 176, 0.2);
      }

      .table-header {
        display: grid;
        grid-template-columns: 70px 1fr 110px 90px 110px 100px;
        background: linear-gradient(135deg, #4299e1 0%, #2b6cb0 100%);
        color: white;
        font-weight: 700;
        font-size: 0.95rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .table-row {
        display: grid;
        grid-template-columns: 70px 1fr 110px 90px 110px 100px;
        border-bottom: 1px solid rgba(226, 232, 240, 0.5);
        transition: all 0.3s ease;
        position: relative;
      }

      .table-row:hover {
        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        transform: translateX(5px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .table-row.fragmentable {
        background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
        border-left: 4px solid #48bb78;
      }

      .table-row.non-fragmentable {
        background: linear-gradient(135deg, #fef5e7 0%, #fed7aa 100%);
        border-left: 4px solid #ed8936;
      }

      .table-header .col,
      .table-row .col {
        padding: 1rem 0.75rem;
        border-right: 1px solid rgba(226, 232, 240, 0.3);
        display: flex;
        align-items: center;
        font-size: 0.9rem;
        font-weight: 500;
      }

      .table-header .col:last-child,
      .table-row .col:last-child {
        border-right: none;
      }

      .status-badge {
        padding: 0.4rem 0.8rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 700;
        text-align: center;
        min-width: 50px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      .status-badge.yes {
        background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
        color: white;
      }

      .status-badge.no {
        background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
        color: white;
      }

      .download-section {
        margin-bottom: 2.5rem;
        padding: 2rem;
        background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
        border-radius: 15px;
        border-left: 6px solid #4299e1;
        box-shadow: 0 8px 25px rgba(66, 153, 225, 0.15);
      }

      .download-section h3 {
        color: #2b6cb0;
        margin-bottom: 1.5rem;
        font-size: 1.6rem;
        font-weight: 600;
        text-align: center;
      }

      .download-actions {
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
        justify-content: center;
      }

      .btn-download {
        background: linear-gradient(135deg, #4299e1 0%, #2b6cb0 100%);
        color: white;
        border: none;
        padding: 1rem 1.5rem;
        border-radius: 50px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        box-shadow: 0 6px 20px rgba(66, 153, 225, 0.4);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        position: relative;
        overflow: hidden;
      }

      .btn-download::before {
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

      .btn-download:hover::before {
        left: 100%;
      }

      .btn-download:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 10px 30px rgba(66, 153, 225, 0.6);
        background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
      }

      .debug-section {
        margin-top: 2.5rem;
        border: 2px solid rgba(102, 126, 234, 0.2);
        border-radius: 15px;
        overflow: hidden;
        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }

      .debug-section summary {
        padding: 1.5rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        cursor: pointer;
        font-weight: 700;
        color: white;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: all 0.3s ease;
      }

      .debug-section summary:hover {
        background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
      }

      .debug-section pre {
        margin: 0;
        padding: 2rem;
        font-size: 0.85rem;
        background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
        color: #e2e8f0;
        overflow-x: auto;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        line-height: 1.5;
      }

      .error {
        background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
        border: 3px solid #e53e3e;
        border-radius: 15px;
        padding: 2rem;
        color: #742a2a;
        box-shadow: 0 10px 30px rgba(229, 62, 62, 0.2);
        animation: slideIn 0.4s ease-out;
      }

      .error h3 {
        margin-top: 0;
        color: #c53030;
        font-size: 1.4rem;
        font-weight: 700;
      }

      .checkbox-group {
        display: flex;
        gap: 2rem;
        margin-top: 1rem;
        justify-content: center;
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        padding: 1rem 1.5rem;
        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        border-radius: 12px;
        border: 2px solid rgba(102, 126, 234, 0.2);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .checkbox-label::before {
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

      .checkbox-label:hover::before {
        left: 100%;
      }

      .checkbox-label:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
        border-color: rgba(102, 126, 234, 0.4);
      }

      .checkbox-label input[type='checkbox'] {
        width: 20px;
        height: 20px;
        margin: 0;
        accent-color: #667eea;
        transform: scale(1.2);
      }

      .form-group small {
        color: #4a5568;
        font-style: italic;
        font-weight: 500;
        background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
        padding: 0.75rem;
        border-radius: 8px;
        border-left: 4px solid #48bb78;
        margin-top: 1rem;
        display: block;
      }

      @media (max-width: 768px) {
        .fragment-container {
          padding: 1rem;
        }

        h1 {
          font-size: 2rem;
        }

        .table-header,
        .table-row {
          grid-template-columns: 50px 1fr 70px 60px 80px 70px;
          font-size: 0.8rem;
        }

        .table-header .col,
        .table-row .col {
          padding: 0.6rem 0.4rem;
        }

        .download-actions {
          flex-direction: column;
          align-items: center;
        }

        .btn-download {
          justify-content: center;
          width: 100%;
          max-width: 300px;
        }

        .checkbox-group {
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .checkbox-label {
          width: 100%;
          max-width: 300px;
          justify-content: center;
        }
      }

      @media (max-width: 480px) {
        h1 {
          font-size: 1.6rem;
        }

        .fragment-form,
        .fragment-analysis-form,
        .structure-section,
        .results {
          padding: 1.5rem;
        }

        .table-header,
        .table-row {
          font-size: 0.75rem;
        }

        .info-grid {
          gap: 1rem;
        }
      }
    `,
  ],
})
export class FragmentComponent {
  // Step 1: Properties for loading structure
  smilesInput = '';
  loadingStructure = false;
  svgImage: string | null = null;
  sanitizedSvg: SafeHtml | null = null;

  // Step 2: Properties for fragment analysis
  moleculeId = '';
  bondIdx: number | null = null;
  exportSmiles = false;
  exportXyz = false;
  loadingAnalysis = false;
  fragmentResults: FragmentResponseData | null = null;
  BDE_calated: Array<BDEValues> = [];
  // Common properties
  error: string | null = null;
  constructor(
    private readonly v1Service: V1Service,
    private readonly sanitizer: DomSanitizer
  ) {}
  loadMoleculeStructure() {
    if (!this.smilesInput.trim()) {
      this.error = 'Please enter the molecule SMILES';
      return;
    }
    this.loadingStructure = true;
    this.error = null;
    this.svgImage = null;
    this.sanitizedSvg = null;
    // Clear previous results
    this.fragmentResults = null;
    // moleculeId will be obtained from backend, don't clear it here
    this.bondIdx = null;
    this.exportSmiles = false;
    this.exportXyz = false;
    this.exportXyz = false;
    const requestInfo: MoleculeInfoRequest = {
      smiles: this.smilesInput.trim(),
    };
    this.v1Service.v1PredictInfoCreate(requestInfo).subscribe({
      next: (response) => {
        if (!response.data) {
          this.error = 'No se recibió información de la molécula';
          this.loadingStructure = false;
          return;
        }
        const data: MoleculeInfoResponseData = response.data;
        this.moleculeId = data.molecule_id;
        if (data.image_svg) {
          this.svgImage = this.processSVGData(data.image_svg);
          if (!this.svgImage) {
            this.error = 'Could not process SVG image';
          }
        } else {
          this.error = 'No molecular structure image received';
        }
        this.loadingStructure = false;
      },
      error: (error: any) => {
        this.error =
          'Error loading molecular structure: ' +
          (error.message || 'Unknown error');
        this.loadingStructure = false;
      },
    });
  }
  // Process SVG data (similar to reports component)
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

  // Step 2: Analyze fragments
  analyzeFragment() {
    // Validate that at least one export format is selected
    if (!this.exportSmiles && !this.exportXyz) {
      this.error = 'You must select at least one export format (SMILES or XYZ)';
      return;
    }

    this.loadingAnalysis = true;
    this.error = null;
    this.fragmentResults = null;

    const request: FragmentRequest = {
      smiles: this.smilesInput.trim(),
      molecule_id: this.moleculeId.trim(),
      export_smiles: this.exportSmiles,
      export_xyz: this.exportXyz,
    };

    if (this.bondIdx !== null && this.bondIdx >= 0) {
      request.bond_idx = this.bondIdx;
    }

    this.v1Service.v1FragmentCreate(request).subscribe({
      next: (response) => {
        if (!response.data) {
          this.error = 'No fragment information received';
          this.loadingAnalysis = false;
          return;
        }
        this.fragmentResults = response.data;
        this.BDE_calated = this.fragmentResults.bde_values;
        this.loadingAnalysis = false;
      },
      error: (error: any) => {
        this.error =
          'Error analyzing fragments: ' + (error.message || 'Unknown error');
        this.loadingAnalysis = false;
      },
    });
  }

  // Method to download SMILES list
  downloadSmilesList() {
    if (
      !this.fragmentResults?.smiles_list ||
      this.fragmentResults.smiles_list.length === 0
    ) {
      this.error = 'No SMILES list available for download';
      return;
    }

    try {
      const content = this.fragmentResults.smiles_list.join('\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `smiles_list_${this.smilesInput.replace(
        /[^a-zA-Z0-9]/g,
        '_'
      )}.txt`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      this.error = 'Error downloading SMILES list';
      console.error('Error downloading SMILES:', error);
    }
  }

  // Method to download XYZ file
  downloadXyzFile() {
    if (!this.fragmentResults?.xyz_block) {
      this.error = 'No XYZ file available for download';
      return;
    }

    try {
      const blob = new Blob([this.fragmentResults.xyz_block], {
        type: 'text/plain',
      });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `molecule_${this.smilesInput.replace(
        /[^a-zA-Z0-9]/g,
        '_'
      )}.xyz`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      this.error = 'Error downloading XYZ file';
      console.error('Error downloading XYZ:', error);
    }
  }

  // Method to get BDE value by bond index
  getBDEValue(idx: number): string {
    const found = this.BDE_calated?.find((b) => b.idx === idx);
    return found?.bde !== undefined && found?.bde !== null
      ? found.bde.toFixed(4)
      : 'N/A';
  }
}
