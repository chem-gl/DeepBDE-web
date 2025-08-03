import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { V1Service } from '../../../../angular-client';

@Component({
  selector: 'app-fragment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fragment-container">
      <h1>Análisis de Fragmentos Moleculares</h1>

      <div class="fragment-form">
        <div class="form-group">
          <label for="smiles">SMILES de la Molécula:</label>
          <input
            type="text"
            id="smiles"
            [(ngModel)]="smilesInput"
            placeholder="Ej: CCO, c1ccccc1"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="moleculeId">ID de la Molécula:</label>
          <input
            type="text"
            id="moleculeId"
            [(ngModel)]="moleculeId"
            placeholder="Ej: molecule_001"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="bondIdx">Índice del Enlace (opcional):</label>
          <input
            type="number"
            id="bondIdx"
            [(ngModel)]="bondIdx"
            placeholder="Dejar vacío para todos los enlaces"
            min="0"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="exportSmiles" />
              Exportar SMILES
            </label>
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="exportXyz" />
              Exportar XYZ
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button
            (click)="analyzeFragment()"
            [disabled]="loading || !smilesInput || !moleculeId"
            class="btn-primary"
          >
            {{ loading ? 'Analizando...' : 'Analizar Fragmentos' }}
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Analizando fragmentos moleculares...</p>
      </div>

      <div *ngIf="results" class="results">
        <h2>Análisis de Fragmentos</h2>
        <div class="result-card">
          <pre>{{ results | json }}</pre>
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
        max-width: 800px;
        margin: 0 auto;
      }

      h1 {
        color: #2c3e50;
        margin-bottom: 2rem;
        text-align: center;
      }

      .fragment-form {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #2c3e50;
      }

      .form-control {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e1e8ed;
        border-radius: 6px;
        font-size: 1rem;
        transition: border-color 0.2s ease;
      }

      .form-control:focus {
        outline: none;
        border-color: #3498db;
      }

      .form-actions {
        display: flex;
        justify-content: center;
      }

      .btn-primary {
        background: #e67e22;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .btn-primary:hover:not(:disabled) {
        background: #d35400;
      }

      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .loading {
        text-align: center;
        padding: 2rem;
      }

      .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #e67e22;
        border-radius: 50%;
        width: 40px;
        height: 40px;
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

      .results {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .result-card {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 6px;
        border-left: 4px solid #e67e22;
      }

      .result-card pre {
        margin: 0;
        font-size: 0.9rem;
        white-space: pre-wrap;
      }

      .error {
        background: #fff;
        border: 2px solid #e74c3c;
        border-radius: 12px;
        padding: 2rem;
        color: #e74c3c;
      }

      .checkbox-group {
        display: flex;
        gap: 1rem;
        margin-top: 0.5rem;
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: normal;
        cursor: pointer;
      }

      .checkbox-label input[type='checkbox'] {
        width: auto;
        margin: 0;
      }
    `,
  ],
})
export class FragmentComponent {
  smilesInput = '';
  moleculeId = '';
  bondIdx: number | null = null;
  exportSmiles = false;
  exportXyz = false;
  loading = false;
  results: any = null;
  error: string | null = null;

  constructor(private readonly v1Service: V1Service) {}

  analyzeFragment() {
    if (!this.smilesInput.trim() || !this.moleculeId.trim()) {
      this.error = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.loading = true;
    this.error = null;
    this.results = null;

    const request: any = {
      smiles: this.smilesInput.trim(),
      molecule_id: this.moleculeId.trim(),
      export_smiles: this.exportSmiles,
      export_xyz: this.exportXyz,
    };

    if (this.bondIdx !== null && this.bondIdx >= 0) {
      request.bond_idx = this.bondIdx;
    }

    this.v1Service.v1FragmentCreate(request).subscribe({
      next: (response: any) => {
        this.results = response.data;
        this.loading = false;
      },
      error: (error: any) => {
        this.error =
          'Error al analizar fragmentos: ' +
          (error.message || 'Error desconocido');
        this.loading = false;
      },
    });
  }
}
