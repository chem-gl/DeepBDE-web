import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { V1Service } from '../../../../angular-client';

@Component({
  selector: 'app-predict',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="predict-container">
      <h1>Predicción de Enlaces Moleculares</h1>

      <div class="predict-form">
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
          <label for="bondIdx"
            >Índice del Enlace (para predicción simple):</label
          >
          <input
            type="number"
            id="bondIdx"
            [(ngModel)]="bondIdx"
            placeholder="0"
            min="0"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="bondIndices"
            >Índices de Enlaces (para predicción múltiple, separados por
            coma):</label
          >
          <input
            type="text"
            id="bondIndices"
            [(ngModel)]="bondIndicesInput"
            placeholder="0,1,2"
            class="form-control"
          />
        </div>

        <div class="form-actions">
          <button
            (click)="predictSingle()"
            [disabled]="loading || !smilesInput || !moleculeId"
            class="btn-primary"
          >
            {{ loading ? 'Prediciendo...' : 'Predecir Enlace Simple' }}
          </button>

          <button
            (click)="predictMultiple()"
            [disabled]="
              loading || !smilesInput || !moleculeId || !bondIndicesInput
            "
            class="btn-secondary"
          >
            {{ loading ? 'Prediciendo...' : 'Predecir Enlaces Múltiples' }}
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Procesando predicción...</p>
      </div>

      <div *ngIf="results" class="results">
        <h2>Resultados de la Predicción</h2>
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
      .predict-container {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
      }

      h1 {
        color: #2c3e50;
        margin-bottom: 2rem;
        text-align: center;
      }

      .predict-form {
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
        gap: 1rem;
        justify-content: center;
      }

      .btn-primary,
      .btn-secondary {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-primary {
        background: #3498db;
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        background: #2980b9;
      }

      .btn-secondary {
        background: #95a5a6;
        color: white;
      }

      .btn-secondary:hover:not(:disabled) {
        background: #7f8c8d;
      }

      .btn-primary:disabled,
      .btn-secondary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .loading {
        text-align: center;
        padding: 2rem;
      }

      .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
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
        border-left: 4px solid #27ae60;
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
    `,
  ],
})
export class PredictComponent {
  smilesInput = '';
  moleculeId = '';
  bondIdx = 0;
  bondIndicesInput = '';
  loading = false;
  results: any = null;
  error: string | null = null;

  constructor(private readonly v1Service: V1Service) {}

  predictSingle() {
    if (!this.smilesInput.trim() || !this.moleculeId.trim()) {
      this.error = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.loading = true;
    this.error = null;
    this.results = null;

    const request = {
      smiles: this.smilesInput.trim(),
      molecule_id: this.moleculeId.trim(),
      bond_idx: this.bondIdx,
    };

    this.v1Service.v1PredictSingleCreate(request).subscribe({
      next: (response: any) => {
        this.results = response.data;
        this.loading = false;
      },
      error: (error: any) => {
        this.error =
          'Error al realizar la predicción: ' +
          (error.message || 'Error desconocido');
        this.loading = false;
      },
    });
  }

  predictMultiple() {
    if (
      !this.smilesInput.trim() ||
      !this.moleculeId.trim() ||
      !this.bondIndicesInput.trim()
    ) {
      this.error = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.loading = true;
    this.error = null;
    this.results = null;

    // Convertir string de índices separados por coma a array de números
    const bondIndices = this.bondIndicesInput
      .split(',')
      .map((idx) => parseInt(idx.trim(), 10))
      .filter((idx) => !isNaN(idx));

    if (bondIndices.length === 0) {
      this.error =
        'Por favor ingresa índices de enlaces válidos (números separados por coma)';
      this.loading = false;
      return;
    }

    const request = {
      smiles: this.smilesInput.trim(),
      molecule_id: this.moleculeId.trim(),
      bond_indices: bondIndices,
    };

    this.v1Service.v1PredictMultipleCreate(request).subscribe({
      next: (response: any) => {
        this.results = response.data;
        this.loading = false;
      },
      error: (error: any) => {
        this.error =
          'Error al realizar la predicción múltiple: ' +
          (error.message || 'Error desconocido');
        this.loading = false;
      },
    });
  }
}
