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
      <h1>Análisis de Fragmentos Moleculares</h1>
      <!-- Paso 1: Obtener la estructura molecular -->
      <div class="fragment-form">
        <div class="form-group">
          <label for="smiles">SMILES de la Molécula:</label>
          <input
            type="text"
            id="smiles"
            [(ngModel)]="smilesInput"
            placeholder="Ej: CCOc1cccc(O)c1"
            class="form-control"
          />
        </div>
        <div class="form-actions">
          <button
            (click)="loadMoleculeStructure()"
            [disabled]="loadingStructure || !smilesInput"
            class="btn-secondary"
          >
            {{ loadingStructure ? 'Cargando...' : 'Cargar Estructura' }}
          </button>
        </div>
      </div>
      <div *ngIf="loadingStructure" class="loading">
        <div class="spinner"></div>
        <p>Cargando estructura molecular...</p>
      </div>
      <!-- Mostrar la estructura molecular -->
      <div *ngIf="svgImage" class="structure-section">
        <h2>Estructura Molecular</h2>
        <div class="result-card">
          <div class="image-container">
            <div [innerHTML]="sanitizedSvg" class="svg-display"></div>
          </div>
        </div>
      </div>
      <!-- Paso 2: Configurar análisis de fragmentos (solo aparece después de cargar la estructura) -->
      <div *ngIf="svgImage && !loadingStructure" class="fragment-analysis-form">
        <h2>Configurar Análisis de Fragmentos</h2>
        <div class="analysis-form">
          <div class="info-display">
            <p><strong>ID de la Molécula:</strong> {{ moleculeId }}</p>
          </div>
          <div class="form-group">
            <label for="bondIdx">Índice del Enlace (opcional):</label>
            <input
              type="number"
              id="bondIdx"
              [(ngModel)]="bondIdx"
              placeholder="Dejar vacío para todos los enlaces"
              min="0"
              step="1"
              class="form-control"
            />
          </div>
          <!-- Campo de productos esperados - solo aparece cuando hay índice de enlace -->
        </div>
        <div class="form-group">
          <label>Formatos de Exportación (requerido):</label>
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
          <small
            style="color: #666; font-size: 0.85rem; margin-top: 0.5rem; display: block;"
          >
            Debes seleccionar al menos un formato de exportación para poder
            realizar el análisis.
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
            {{ loadingAnalysis ? 'Analizando...' : 'Analizar Fragmentos' }}
          </button>
        </div>
      </div>

      <div *ngIf="loadingAnalysis" class="loading">
        <div class="spinner"></div>
        <p>Analizando fragmentos moleculares...</p>
      </div>

      <div *ngIf="fragmentResults" class="results">
        <h2>Resultados del Análisis</h2>
        <div class="result-card">
          <!-- Información básica -->
          <div class="fragment-info">
            <h3>Información de la Molécula</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>SMILES Canónico:</label>
                <span class="smiles-text">{{
                  fragmentResults.smiles_canonical
                }}</span>
              </div>
              <div class="info-item">
                <label>ID de la Molécula:</label>
                <span>{{ fragmentResults.molecule_id }}</span>
              </div>
            </div>
          </div>

          <!-- Enlaces evaluados -->
          <div
            class="bonds-section"
            *ngIf="fragmentResults.bonds && fragmentResults.bonds.length > 0"
          >
            <h3>Enlaces Evaluados ({{ fragmentResults.bonds.length }})</h3>
            <div class="bonds-table">
              <div class="table-header">
                <div class="col">Índice</div>
                <div class="col">Enlace</div>
                <div class="col">Átomos</div>
                <div class="col">Tipo</div>
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
                    {{ bond.is_fragmentable ? 'Sí' : 'No' }}
                  </span>
                </div>
                <div class="col">{{ getBDEValue(bond.idx) }}</div>
              </div>
            </div>
          </div>

          <!-- Botones de descarga -->
          <div class="download-section">
            <h3>Descargas</h3>
            <div class="download-actions">
              <button
                *ngIf="
                  fragmentResults.smiles_list &&
                  fragmentResults.smiles_list.length > 0
                "
                (click)="downloadSmilesList()"
                class="btn-download"
              >
                📄 Descargar Lista SMILES ({{
                  fragmentResults.smiles_list.length
                }}
                items)
              </button>
              <button
                *ngIf="fragmentResults.xyz_block"
                (click)="downloadXyzFile()"
                class="btn-download"
              >
                🧪 Descargar Archivo XYZ
              </button>
            </div>
          </div>

          <!-- Debug: Mostrar JSON completo -->
          <details class="debug-section">
            <summary>Ver datos completos (JSON)</summary>
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
      .fragment-analysis-form {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
        border-left: 4px solid #e67e22;
      }
      .fragment-analysis-form h2 {
        margin-top: 0;
        color: #e67e22;
        margin-bottom: 1.5rem;
      }
      .analysis-form {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
      }
      .info-display {
        background: #e8f5e8;
        padding: 1rem;
        border-radius: 6px;
        margin-bottom: 1.5rem;
        border-left: 4px solid #27ae60;
      }
      .info-display p {
        margin: 0;
        color: #2c3e50;
        font-size: 0.95rem;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .structure-section {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
        border-left: 4px solid #27ae60;
      }
      .structure-section h2 {
        margin-top: 0;
        color: #27ae60;
        margin-bottom: 1.5rem;
      }
      .image-container {
        text-align: center;
        padding: 1.5rem;
        background: white;
        border-radius: 8px;
        border: 2px solid #e1e8ed;
        margin: 1rem 0;
      }
      .svg-display {
        display: inline-block;
        max-width: 100%;
        overflow: visible;
        line-height: 0;
      }
      .svg-display svg {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
        resize: vertical;
        font-family: 'Courier New', monospace;
      }
      .form-control:focus {
        outline: none;
        border-color: #3498db;
      }
      /* Estilos específicos para textarea */
      textarea.form-control {
        min-height: 80px;
        font-family: 'Courier New', monospace;
        line-height: 1.4;
      }
      /* Placeholder styling para textarea */
      textarea.form-control::placeholder {
        font-family: 'Courier New', monospace;
        color: #999;
        font-size: 0.9rem;
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
      .btn-secondary {
        background: #8e44ad;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      .btn-secondary:hover:not(:disabled) {
        background: #7d3c98;
      }
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

      .fragment-info {
        margin-bottom: 2rem;
      }

      .fragment-info h3 {
        color: #e67e22;
        margin-bottom: 1rem;
        font-size: 1.2rem;
      }

      .info-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .info-item label {
        font-weight: 600;
        color: #2c3e50;
        font-size: 0.9rem;
      }

      .info-item span {
        padding: 0.5rem;
        background: white;
        border: 1px solid #e1e8ed;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 0.85rem;
      }

      .smiles-text {
        word-break: break-all;
      }

      .bonds-section {
        margin-bottom: 2rem;
      }

      .bonds-section h3 {
        color: #27ae60;
        margin-bottom: 1rem;
        font-size: 1.2rem;
      }

      .bonds-table {
        background: white;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .table-header {
        display: grid;
        grid-template-columns: 70px 1fr 110px 90px 110px 100px;
        background: #34495e;
        color: white;
        font-weight: 600;
        font-size: 0.9rem;
      }

      .table-row {
        display: grid;
        grid-template-columns: 70px 1fr 110px 90px 110px 100px;
        border-bottom: 1px solid #e1e8ed;
        transition: background-color 0.2s ease;
      }

      .table-row:hover {
        background-color: #f8f9fa;
      }

      .table-row.fragmentable {
        background-color: #e8f5e8;
      }

      .table-row.non-fragmentable {
        background-color: #fdf2f2;
      }

      .table-header .col,
      .table-row .col {
        padding: 0.75rem 0.5rem;
        border-right: 1px solid #e1e8ed;
        display: flex;
        align-items: center;
        font-size: 0.85rem;
      }

      .table-header .col:last-child,
      .table-row .col:last-child {
        border-right: none;
      }

      .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-align: center;
        min-width: 40px;
      }

      .status-badge.yes {
        background: #d4edda;
        color: #155724;
      }

      .status-badge.no {
        background: #f8d7da;
        color: #721c24;
      }

      .download-section {
        margin-bottom: 2rem;
      }

      .download-section h3 {
        color: #3498db;
        margin-bottom: 1rem;
        font-size: 1.2rem;
      }

      .download-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .btn-download {
        background: #3498db;
        color: white;
        border: none;
        padding: 0.75rem 1rem;
        border-radius: 6px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .btn-download:hover {
        background: #2980b9;
      }

      .debug-section {
        margin-top: 2rem;
        border: 1px solid #e1e8ed;
        border-radius: 6px;
      }

      .debug-section summary {
        padding: 1rem;
        background: #f8f9fa;
        cursor: pointer;
        font-weight: 600;
        color: #6c757d;
      }

      .debug-section pre {
        margin: 0;
        padding: 1rem;
        font-size: 0.8rem;
        background: #2c3e50;
        color: #ecf0f1;
        overflow-x: auto;
      }

      @media (max-width: 768px) {
        .table-header,
        .table-row {
          grid-template-columns: 50px 1fr 70px 60px 80px 70px;
          font-size: 0.75rem;
        }

        .table-header .col,
        .table-row .col {
          padding: 0.4rem 0.2rem;
        }

        .download-actions {
          flex-direction: column;
        }

        .btn-download {
          justify-content: center;
        }
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

      .form-group small {
        color: #6c757d;
        font-style: italic;
      }
    `,
  ],
})
export class FragmentComponent {
  // Paso 1: Propiedades para cargar estructura
  smilesInput = '';
  loadingStructure = false;
  svgImage: string | null = null;
  sanitizedSvg: SafeHtml | null = null;

  // Paso 2: Propiedades para análisis de fragmentos
  moleculeId = '';
  bondIdx: number | null = null;
  exportSmiles = false;
  exportXyz = false;
  loadingAnalysis = false;
  fragmentResults: FragmentResponseData | null = null;
  BDE_calated: Array<BDEValues> = [];
  // Propiedades comunes
  error: string | null = null;
  constructor(
    private readonly v1Service: V1Service,
    private readonly sanitizer: DomSanitizer
  ) {}
  loadMoleculeStructure() {
    if (!this.smilesInput.trim()) {
      this.error = 'Por favor ingresa el SMILES de la molécula';
      return;
    }
    this.loadingStructure = true;
    this.error = null;
    this.svgImage = null;
    this.sanitizedSvg = null;
    // Limpiar resultados anteriores
    this.fragmentResults = null;
    // moleculeId se obtendrá del backend, no lo limpiamos aquí
    this.bondIdx = null;
    this.exportSmiles = false;
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
            this.error = 'No se pudo procesar la imagen SVG';
          }
        } else {
          this.error = 'No se recibió imagen de la estructura molecular';
        }
        this.loadingStructure = false;
      },
      error: (error: any) => {
        this.error =
          'Error al cargar la estructura molecular: ' +
          (error.message || 'Error desconocido');
        this.loadingStructure = false;
      },
    });
  }
  // Procesar datos SVG (similar al componente de reports)
  private processSVGData(svgData: string): string | null {
    if (!svgData) {
      this.sanitizedSvg = null;
      return null;
    }
    // Limpiar y formatear el SVG
    let cleanSvg = svgData.trim();
    // Reemplazar caracteres de codificación problemáticos
    cleanSvg = cleanSvg.replace(/encoding='iso-8859-1'/g, "encoding='UTF-8'");
    // Asegurar que tenga espacios adecuados entre atributos
    cleanSvg = cleanSvg.replace(/xmlns=/g, ' xmlns=');
    cleanSvg = cleanSvg.replace(/xmlns:rdkit=/g, ' xmlns:rdkit=');
    cleanSvg = cleanSvg.replace(/xmlns:xlink=/g, ' xmlns:xlink=');
    cleanSvg = cleanSvg.replace(/xml:space=/g, ' xml:space=');
    cleanSvg = cleanSvg.replace(/width=/g, ' width=');
    cleanSvg = cleanSvg.replace(/height=/g, ' height=');
    cleanSvg = cleanSvg.replace(/viewBox=/g, ' viewBox=');
    // Limpiar espacios múltiples
    cleanSvg = cleanSvg.replace(/\s+/g, ' ');
    // Formatear correctamente la primera línea
    cleanSvg = cleanSvg.replace(
      /^<\?xml[^>]+\?><svg/,
      "<?xml version='1.0' encoding='UTF-8'?>\n<svg"
    );
    // Sanitizar el SVG para Angular
    this.sanitizedSvg = this.sanitizer.bypassSecurityTrustHtml(cleanSvg);
    return cleanSvg;
  }

  // Paso 2: Analizar fragmentos
  analyzeFragment() {
    // Validar que al menos un formato de exportación esté seleccionado
    if (!this.exportSmiles && !this.exportXyz) {
      this.error =
        'Debes seleccionar al menos un formato de exportación (SMILES o XYZ)';
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
          this.error = 'No se recibió información de fragmentos';
          this.loadingAnalysis = false;
          return;
        }
        this.fragmentResults = response.data;
        this.BDE_calated = this.fragmentResults.bde_values;
        this.loadingAnalysis = false;
      },
      error: (error: any) => {
        this.error =
          'Error al analizar fragmentos: ' +
          (error.message || 'Error desconocido');
        this.loadingAnalysis = false;
      },
    });
  }

  // Método para descargar la lista de SMILES
  downloadSmilesList() {
    if (
      !this.fragmentResults?.smiles_list ||
      this.fragmentResults.smiles_list.length === 0
    ) {
      this.error = 'No hay lista de SMILES disponible para descargar';
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
      this.error = 'Error al descargar la lista de SMILES';
      console.error('Error descargando SMILES:', error);
    }
  }

  // Método para descargar el archivo XYZ
  downloadXyzFile() {
    if (!this.fragmentResults?.xyz_block) {
      this.error = 'No hay archivo XYZ disponible para descargar';
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
      this.error = 'Error al descargar el archivo XYZ';
      console.error('Error descargando XYZ:', error);
    }
  }

  // Método para obtener el valor BDE por índice de enlace
  getBDEValue(idx: number): string {
    const found = this.BDE_calated?.find((b) => b.idx === idx);
    return found?.bde !== undefined && found?.bde !== null
      ? found.bde.toFixed(4)
      : 'N/A';
  }
}
