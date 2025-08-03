import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DownloadReportRequest, V1Service } from '../../../../angular-client';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-container">
      <h1>Reportes y Descargas</h1>

      <div class="reports-form">
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
          <label for="format">Formato del Reporte:</label>
          <select id="format" [(ngModel)]="reportFormat" class="form-control">
            <option value="txt">TXT</option>
          </select>
        </div>

        <div class="form-actions">
          <button
            (click)="getMoleculeInfo()"
            [disabled]="loadingInfo || !smilesInput"
            class="btn-secondary"
          >
            {{ loadingInfo ? 'Consultando...' : 'Información Molecular' }}
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Generando reporte...</p>
      </div>

      <div *ngIf="loadingInfo" class="loading">
        <div class="spinner"></div>
        <p>Obteniendo información molecular...</p>
      </div>

      <div *ngIf="reportResult" class="results">
        <h2>Reporte Generado</h2>
        <div class="result-card">
          <div class="report-actions">
            <button (click)="downloadReportFile()" class="btn-download">
              📥 Descargar Archivo
            </button>
          </div>
          <div class="report-content">
            <pre>{{ reportResult }}</pre>
          </div>
        </div>
      </div>

      <div *ngIf="moleculeInfoResult" class="results">
        <h2>Información Molecular</h2>
        <div class="result-card">
          <div class="report-actions">
            <button (click)="downloadReportFile()" class="btn-download">
              📥 Descargar Información
            </button>
          </div>
          <div class="report-content">
            <pre>{{ moleculeInfoResult }}</pre>
          </div>
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
      .reports-container {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
      }

      h1 {
        color: #2c3e50;
        margin-bottom: 2rem;
        text-align: center;
      }

      .reports-form {
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
        background: #27ae60;
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        background: #229954;
      }

      .btn-secondary {
        background: #8e44ad;
        color: white;
      }

      .btn-secondary:hover:not(:disabled) {
        background: #7d3c98;
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
        border-top: 4px solid #27ae60;
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
        margin-bottom: 2rem;
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

      .report-actions {
        margin-bottom: 1rem;
        text-align: right;
      }

      .btn-download {
        background: #3498db;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .btn-download:hover {
        background: #2980b9;
      }

      .report-content {
        max-height: 500px;
        overflow-y: auto;
        overflow-x: auto;
        border: 1px solid #e1e8ed;
        border-radius: 4px;
        background: #f8f9fa;
      }

      .report-content pre {
        margin: 0;
        padding: 1rem;
        font-family: 'Courier New', monospace;
        font-size: 0.85rem;
        line-height: 1.4;
        white-space: pre;
        overflow-x: auto;
        min-width: max-content;
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
export class ReportsComponent {
  smilesInput = '';
  reportFormat = 'txt';
  loading = false;
  loadingInfo = false;
  reportResult: string = '';
  reportBase64: string = '';
  moleculeInfoResult: string | null = null;
  error: string | null = null;

  constructor(private readonly v1Service: V1Service) {}

  downloadReportFile() {
    if (!this.moleculeInfoResult) {
      this.error = 'No hay información molecular disponible para descargar';
      return;
    }

    try {
      // Crear un blob con el contenido del texto
      const blob = new Blob([this.moleculeInfoResult], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);

      // Crear un enlace temporal para la descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `info_molecular_${this.smilesInput.replace(
        /[^a-zA-Z0-9]/g,
        '_'
      )}.txt`;

      // Simular click para descargar
      document.body.appendChild(link);
      link.click();

      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      this.error = 'Error al descargar el archivo';
      console.error('Error descargando archivo:', error);
    }
  }

  getMoleculeInfo() {
    if (!this.smilesInput.trim()) {
      this.error = 'Por favor ingresa el SMILES de la molécula';
      return;
    }

    this.loadingInfo = true;
    this.error = null;
    this.moleculeInfoResult = null;

    const request: DownloadReportRequest = {
      smiles: this.smilesInput.trim(),
      format: 'txt',
    };

    this.v1Service.v1DownloadReportCreate(request).subscribe({
      next: (response) => {
        const base64Data = response.data?.report_base64 ?? '';

        if (base64Data) {
          try {
            this.moleculeInfoResult = atob(base64Data);
          } catch (error) {
            this.moleculeInfoResult =
              'Error al decodificar la información molecular';
            console.error('Error decodificando base64:', error);
          }
        } else {
          this.moleculeInfoResult = 'No se recibió información molecular';
        }
        this.loadingInfo = false;
      },
      error: (error: any) => {
        this.error =
          'Error al obtener información molecular: ' +
          (error.message || 'Error desconocido');
        this.loadingInfo = false;
      },
    });
  }
}
