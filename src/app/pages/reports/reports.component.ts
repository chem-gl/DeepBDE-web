import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  DownloadReportRequest,
  MoleculeInfoRequest,
  V1Service,
} from '../../../../angular-client';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-container">
      <h1>Reports and Downloads</h1>
      <div class="reports-form">
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
            (click)="getMoleculeInfo()"
            [disabled]="loadingInfo || !smilesInput"
            class="btn-secondary"
          >
            {{ loadingInfo ? 'Querying...' : 'Molecular Information' }}
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Generating report...</p>
      </div>
      <div *ngIf="loadingInfo" class="loading">
        <div class="spinner"></div>
        <p>Getting molecular information...</p>
      </div>

      <div *ngIf="svgImage" class="results">
        <h2>Molecular Structure</h2>
        <div class="result-card">
          <div class="report-actions">
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
        </div>
      </div>
      <div *ngIf="reportResult" class="results">
        <h2>Generated Report</h2>
        <div class="result-card">
          <div class="report-actions">
            <button (click)="downloadReportFile()" class="btn-download">
              📥 Download File
            </button>
          </div>
          <div class="report-content">
            <pre>{{ reportResult }}</pre>
          </div>
        </div>
      </div>

      <div *ngIf="moleculeInfoResult" class="results">
        <h2>Molecular Information</h2>
        <div class="result-card">
          <div class="report-actions">
            <button (click)="downloadReportFile()" class="btn-download">
              📥 Download Information
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
        padding: 5px;
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
        padding: 5px;
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
        padding: 5px;
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
        padding: 5px;
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
        padding: 5px;
        color: #e74c3c;
      }

      .image-container {
        text-align: center;
        padding: 1.5rem;
        background: white;
        border-radius: 8px;
        border: 2px solid #e1e8ed;
        margin: 1rem 0;
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
        background: #6c3483;
        color: white;
        border: none;
        padding: 0.5rem 0.75rem;
        border-radius: 4px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
        min-width: 40px;
      }

      .control-btn:hover {
        background: #8e44ad;
      }

      .svg-display {
        display: inline-block;
        max-width: 100%;
        overflow: hidden;
        line-height: 0;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: #f9f9f9;
        cursor: grab;
        user-select: none;
        position: relative;
        min-height: 300px;
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
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 1.2rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
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
        border-radius: 4px;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      /* Asegurar que el SVG se renderice correctamente */
      .svg-display * {
        vector-effect: non-scaling-stroke;
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
  svgImage: string | null = null;
  sanitizedSvg: SafeHtml | null = null;

  // Propiedades para zoom y pan
  zoom = 1;
  panX = 0;
  panY = 0;
  isPanning = false;
  lastPanX = 0;
  lastPanY = 0;
  isFullscreen = false;

  constructor(
    private readonly v1Service: V1Service,
    private readonly sanitizer: DomSanitizer
  ) {
    // Agregar listener para tecla Escape
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isFullscreen) {
        this.toggleFullscreen();
      }
    });
  }

  // Métodos para zoom y pan
  zoomIn() {
    this.zoom = Math.min(this.zoom * 1.2, 15); // Máximo 5x
  }

  zoomOut() {
    this.zoom = Math.max(this.zoom / 1.2, 0.1); // Mínimo 0.1x
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

  downloadReportFile() {
    if (!this.moleculeInfoResult) {
      this.error = 'No molecular information available for download';
      return;
    }
    try {
      const blob = new Blob([this.moleculeInfoResult], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      // Create temporary link for download
      const link = document.createElement('a');
      link.href = url;
      link.download = `molecular_info_${this.smilesInput.replace(
        /[^a-zA-Z0-9]/g,
        '_'
      )}.txt`;

      // Simulate click to download
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      this.error = 'Error downloading file';
      console.error('Error downloading file:', error);
    }
  }

  downloadSVGFile() {
    if (!this.svgImage) {
      this.error = 'No SVG image available for download';
      return;
    }

    try {
      // Crear un blob con el contenido SVG
      const blob = new Blob([this.svgImage], { type: 'image/svg+xml' });
      const url = window.URL.createObjectURL(blob);

      // Crear un enlace temporal para la descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `estructura_molecular_${this.smilesInput.replace(
        /[^a-zA-Z0-9]/g,
        '_'
      )}.svg`;

      // Simular click para descargar
      document.body.appendChild(link);
      link.click();

      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      this.error = 'Error al descargar la imagen SVG';
      console.error('Error descargando SVG:', error);
    }
  }

  downloadPNGFile() {
    if (!this.svgImage) {
      this.error = 'No hay imagen SVG disponible para descargar';
      return;
    }

    try {
      // Crear un canvas temporal
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        this.error = 'Error al crear el contexto del canvas';
        return;
      }

      // Crear una imagen desde el SVG
      const img = new Image();
      const svgBlob = new Blob([this.svgImage], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        // Configurar el tamaño del canvas
        const scale = 2; // Factor de escala para mejor calidad
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // Configurar el contexto para mejor calidad
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.scale(scale, scale);

        // Dibujar fondo blanco
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, img.width, img.height);

        // Dibujar la imagen SVG
        ctx.drawImage(img, 0, 0);

        // Convertir a PNG y descargar
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const pngUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = pngUrl;
              link.download = `estructura_molecular_${this.smilesInput.replace(
                /[^a-zA-Z0-9]/g,
                '_'
              )}.png`;

              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              // Limpiar URLs
              URL.revokeObjectURL(pngUrl);
              URL.revokeObjectURL(url);
            } else {
              this.error = 'Error al generar la imagen PNG';
            }
          },
          'image/png',
          0.95
        );
      };

      img.onerror = () => {
        this.error = 'Error al cargar la imagen SVG para conversión';
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (error) {
      this.error = 'Error converting SVG to PNG';
      console.error('Error converting to PNG:', error);
    }
  }

  getMoleculeInfo() {
    if (!this.smilesInput.trim()) {
      this.error = 'Please enter the molecule SMILES';
      return;
    }

    this.loadingInfo = true;
    this.error = null;
    this.moleculeInfoResult = null;
    this.svgImage = null;
    this.sanitizedSvg = null;
    // Reset zoom and pan
    this.resetZoom();
    this.isFullscreen = false;

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

        console.log('Canvas data:', response.data?.canvas);
      },
      error: (error: any) => {
        this.error =
          'Error getting molecular information: ' +
          (error.message || 'Unknown error');
        this.loadingInfo = false;
      },
    });
    const requestReport: DownloadReportRequest = {
      smiles: this.smilesInput.trim(),
      format: 'txt',
    };

    this.v1Service.v1DownloadReportCreate(requestReport).subscribe({
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
