import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import {
  BDEEvaluateRequest,
  FragmentResponseData,
  MoleculeInfoRequest,
  MoleculeInfoResponseData,
  V1Service,
} from '../../../../angular-client';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  // Controles independientes para imagen principal
  zoomMain = 1.7;
  panXMain = 0;
  panYMain = 0;
  isPanningMain = false;
  lastPanXMain = 0;
  lastPanYMain = 0;
  isFullscreenMain = false;

  // Controles independientes para imagen BDE Result
  zoomBde = 1.7;
  panXBde = 0;
  panYBde = 0;
  isPanningBde = false;
  lastPanXBde = 0;
  lastPanYBde = 0;
  isFullscreenBde = false;
  // Métodos para imagen principal
  zoomInMain() {
    this.zoomMain = Math.min(this.zoomMain * 1.2, 15);
  }
  zoomOutMain() {
    this.zoomMain = Math.max(this.zoomMain / 1.2, 0.1);
  }
  resetZoomMain() {
    this.zoomMain = 1;
    this.panXMain = 0;
    this.panYMain = 0;
  }
  toggleFullscreenMain() {
    this.isFullscreenMain = !this.isFullscreenMain;
    if (!this.isFullscreenMain) this.resetZoomMain();
  }
  getTransformMain(): string {
    return `scale(${this.zoomMain}) translate(${this.panXMain}px, ${this.panYMain}px)`;
  }
  startPanMain(event: MouseEvent) {
    this.isPanningMain = true;
    this.lastPanXMain = event.clientX;
    this.lastPanYMain = event.clientY;
    event.preventDefault();
  }
  onPanMain(event: MouseEvent) {
    if (!this.isPanningMain) return;
    const deltaX = event.clientX - this.lastPanXMain;
    const deltaY = event.clientY - this.lastPanYMain;
    this.panXMain += deltaX / this.zoomMain;
    this.panYMain += deltaY / this.zoomMain;
    this.lastPanXMain = event.clientX;
    this.lastPanYMain = event.clientY;
  }
  endPanMain() {
    this.isPanningMain = false;
  }
  onWheelMain(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    this.zoomMain = Math.max(0.1, Math.min(15, this.zoomMain * delta));
  }

  // Métodos para imagen BDE Result
  zoomInBde() {
    this.zoomBde = Math.min(this.zoomBde * 1.2, 15);
  }
  zoomOutBde() {
    this.zoomBde = Math.max(this.zoomBde / 1.2, 0.1);
  }
  resetZoomBde() {
    this.zoomBde = 1;
    this.panXBde = 0;
    this.panYBde = 0;
  }
  toggleFullscreenBde() {
    this.isFullscreenBde = !this.isFullscreenBde;
    if (!this.isFullscreenBde) this.resetZoomBde();
  }
  getTransformBde(): string {
    return `scale(${this.zoomBde}) translate(${this.panXBde}px, ${this.panYBde}px)`;
  }
  startPanBde(event: MouseEvent) {
    this.isPanningBde = true;
    this.lastPanXBde = event.clientX;
    this.lastPanYBde = event.clientY;
    event.preventDefault();
  }
  onPanBde(event: MouseEvent) {
    if (!this.isPanningBde) return;
    const deltaX = event.clientX - this.lastPanXBde;
    const deltaY = event.clientY - this.lastPanYBde;
    this.panXBde += deltaX / this.zoomBde;
    this.panYBde += deltaY / this.zoomBde;
    this.lastPanXBde = event.clientX;
    this.lastPanYBde = event.clientY;
  }
  endPanBde() {
    this.isPanningBde = false;
  }
  onWheelBde(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    this.zoomBde = Math.max(0.1, Math.min(15, this.zoomBde * delta));
  }
  // SVG sanitizado para bdeResults.image_svg
  bdeResultsSanitizedSvg: SafeHtml | null = null;
  // Component properties for mode selection
  selectedMode: 'smiles' | 'fragments' = 'smiles';
  smilesInput = '';

  // Properties for molecular analysis
  loadingInfo = false;
  error: string | null = null;
  svgImage: string | null = null;
  sanitizedSvg: SafeHtml | null = null;

  // Properties for zoom and pan
  zoom = 1.7;
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
  moleculeInfo?: MoleculeInfoResponseData;
  // Properties for BDE results
  bdeResults?: FragmentResponseData;
  loadingBDE = false;
  private editor: any;
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

  @ViewChild('ketcherFrame') ketcherFrame!: ElementRef<HTMLIFrameElement>;

  smiles = '';
  ketcherLoaded = false;

  // Historial de SMILES
  smilesHistory: string[] = [];

  ngOnInit() {
    const saved = localStorage.getItem('smilesHistory');
    if (saved) {
      try {
        this.smilesHistory = JSON.parse(saved);
      } catch {}
    }
  }

  saveSmilesHistory() {
    localStorage.setItem('smilesHistory', JSON.stringify(this.smilesHistory));
  }

  ngAfterViewInit() {
    // Solo configurar el iframe si está presente en el DOM
    this.setupKetcherIfAvailable();
  }

  private setupKetcherIfAvailable() {
    if (this.ketcherFrame && this.ketcherFrame.nativeElement) {
      this.ketcherFrame.nativeElement.onload = () => {
        setTimeout(() => {
          this.ketcherLoaded = true;
          console.log('Ketcher loaded and ready');
        }, 1000);
      };
    }
  }

  private initKetcherWhenModeChanges() {
    setTimeout(() => {
      this.setupKetcherIfAvailable();
    }, 100);
  }

  async getSmiles() {
    if (!this.ketcherFrame || !this.ketcherFrame.nativeElement) {
      console.error(
        'Ketcher iframe is not available. Make sure you are in Draw Molecule mode.'
      );
      this.error =
        'Molecular editor is not available. Please switch to Draw Molecule mode.';
      return;
    }

    if (!this.ketcherLoaded) {
      console.warn('Ketcher is not ready yet');
      this.error =
        'Molecular editor is still loading. Please wait a moment and try again.';
      return;
    }

    // Limpiar errores previos
    this.error = null;

    try {
      const iframeWin = this.ketcherFrame.nativeElement.contentWindow;
      if (!iframeWin) {
        console.error('Cannot access iframe content window');
        this.error = 'Cannot access molecular editor. Please refresh the page.';
        return;
      }

      const ketcher = (iframeWin as any).ketcher;
      if (!ketcher) {
        console.error('Ketcher API not available');
        this.error =
          'Molecular editor API is not available. Trying alternative method...';
        this.getSmilesViaPostMessage();
        return;
      }

      const smilesResult = await ketcher.getSmiles();

      if (!smilesResult || smilesResult.trim() === '') {
        this.error = 'No molecule drawn. Please draw a molecule first.';
        return;
      }
      if (!this.isValidSingleMolecule(smilesResult)) {
        return;
      }

      this.smiles = smilesResult;
      console.log('SMILES obtenido de Ketcher:', this.smiles);
      this.smilesInput = this.smiles;
    } catch (error) {
      console.error('Error obteniendo SMILES de Ketcher:', error);
      this.error =
        'Error getting SMILES from molecular editor. Trying alternative method...';
      this.getSmilesViaPostMessage();
    }
  }

  private getSmilesViaPostMessage() {
    if (!this.ketcherFrame || !this.ketcherFrame.nativeElement) {
      console.error('Ketcher iframe is not available for postMessage fallback');
      return;
    }

    const iframeWin = this.ketcherFrame.nativeElement.contentWindow;
    if (iframeWin) {
      const messageId = Math.random().toString(36).substr(2, 9);
      const messageHandler = (event: MessageEvent) => {
        if (event.data && event.data.id === messageId) {
          if (event.data.type === 'result') {
            const receivedSmiles = event.data.payload;
            if (!this.isValidSingleMolecule(receivedSmiles)) {
              return;
            }
            this.smiles = receivedSmiles;
            this.smilesInput = this.smiles;
            console.log('SMILES recibido via postMessage:', this.smiles);
          } else if (event.data.type === 'error') {
            console.error('Error obteniendo SMILES:', event.data.payload);
            this.error =
              'Error getting SMILES from molecular editor: ' +
              event.data.payload;
          }
          // Remover el listener después de recibir la respuesta
          window.removeEventListener('message', messageHandler);
        }
      };

      // Agregar el listener
      window.addEventListener('message', messageHandler);

      // Enviar el mensaje para obtener SMILES
      iframeWin.postMessage(
        {
          id: messageId,
          type: 'request',
          method: 'getSmiles',
          params: {},
        },
        '*'
      );
    }
  }

  // Método para analizar la molécula dibujada en Ketcher
  analyzeMoleculeFromDrawing() {
    if (!this.smiles.trim()) {
      this.error = 'Please draw a molecule and get SMILES first';
      return;
    }

    // Validar que el SMILES contenga solo una molécula (validación adicional por si acaso)
    if (!this.isValidSingleMolecule(this.smiles.trim())) {
      return; // El error se establece en la función de validación
    }

    // Usar el SMILES obtenido de Ketcher para el análisis
    this.smilesInput = this.smiles;
    this.getMoleculeData();
  }

  // Método para copiar SMILES al portapapeles
  async copySmilesToClipboard() {
    if (!this.smiles) {
      return;
    }

    try {
      await navigator.clipboard.writeText(this.smiles);
      console.log('SMILES copied to clipboard');
      // Opcional: mostrar una notificación o mensaje de éxito
    } catch (error) {
      console.error('Failed to copy SMILES to clipboard:', error);
      // Fallback para navegadores más antiguos
      this.fallbackCopyToClipboard(this.smiles);
    }
  }

  private fallbackCopyToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      console.log('SMILES copied to clipboard (fallback)');
    } catch (error) {
      console.error('Fallback copy failed:', error);
    }

    document.body.removeChild(textArea);
  }

  // Función para validar que el SMILES contenga solo una molécula
  private isValidSingleMolecule(smiles: string): boolean {
    if (!smiles || smiles.trim() === '') {
      this.error = 'Empty SMILES string.';
      return false;
    }

    const trimmedSmiles = smiles.trim();

    // Verificar si contiene un punto (.) que indica múltiples moléculas/fragmentos
    if (trimmedSmiles.includes('.')) {
      const fragmentCount = trimmedSmiles.split('.').length;
      this.error = `Error: The molecule contains ${fragmentCount} fragments or disconnected parts. Please draw a single connected molecule without fragments separated by dots (.).`;
      console.log(
        'SMILES validation failed: Contains multiple fragments:',
        trimmedSmiles
      );
      return false;
    }

    // Verificar que no esté vacío después de trim
    if (trimmedSmiles.length === 0) {
      this.error = 'Invalid SMILES: Empty molecule.';
      return false;
    }

    // Validaciones adicionales básicas de SMILES
    // Verificar que no contenga caracteres extraños que indiquen problemas
    const invalidChars = /[^\w\[\]()=+\-#@%\\\/:\.]/g;
    const invalidMatches = trimmedSmiles.match(invalidChars);
    if (invalidMatches) {
      this.error = `Invalid SMILES: Contains invalid characters: ${invalidMatches.join(
        ', '
      )}`;
      return false;
    }

    // Verificar patrones comunes de múltiples moléculas (por si hay otros separadores)
    const multiMoleculePatterns = [
      /\s+/g, // espacios que podrían indicar separación
    ];

    for (const pattern of multiMoleculePatterns) {
      if (pattern.test(trimmedSmiles)) {
        this.error =
          'Invalid SMILES: Contains spaces or unexpected separators that may indicate multiple molecules.';
        return false;
      }
    }

    console.log('SMILES validation passed:', trimmedSmiles);
    return true;
  }

  // Método para reinicializar Ketcher manualmente si es necesario
  reloadKetcher() {
    if (this.ketcherFrame && this.ketcherFrame.nativeElement) {
      this.ketcherLoaded = false;
      this.smiles = '';
      this.error = null;

      // Recargar el iframe
      const currentSrc = this.ketcherFrame.nativeElement.src;
      this.ketcherFrame.nativeElement.src = '';
      setTimeout(() => {
        this.ketcherFrame.nativeElement.src = currentSrc;
        this.setupKetcherIfAvailable();
      }, 100);
    }
  } // Method to change analysis mode
  setMode(mode: 'smiles' | 'fragments') {
    this.selectedMode = mode;
    // Clear inputs when switching modes
    this.smilesInput = '';
    this.smiles = ''; // Limpiar SMILES al cambiar de modo
    this.ketcherLoaded = false; // Reset Ketcher loaded state

    this.clearResults();

    // Si se cambia al modo fragments, inicializar Ketcher
    if (mode === 'fragments') {
      this.initKetcherWhenModeChanges();
    }
  }

  // Clear all results
  clearResults() {
    this.svgImage = null;
    this.sanitizedSvg = null;
    this.error = null;
    this.bdeResults = undefined;
    this.resetZoom();
    this.isFullscreen = false;
  }

  // Handle bond selection change
  onSelectAllBondsChange() {
    if (this.selectAllBonds) {
      this.customBondsInput = '';
    }
    //muevo el cursor al input de bonds
    setTimeout(() => {
      const bondsInput = document.getElementById('custom-bonds');
      if (bondsInput) {
        bondsInput.focus();
      }
    }, 0);
  }

  // Get BDE method
  getBDE() {
    console.log('Getting BDE with formats:');
    console.log('Include XYZ:', this.includeXyzFormat);
    console.log('Include SMILES:', this.includeSmilesFormat);

    if (!this.includeXyzFormat && !this.includeSmilesFormat) {
      console.log('No output format selected - will use default behavior');
    }

    console.log('Select all bonds:', this.selectAllBonds);
    console.log('Custom bonds:', this.customBondsInput);

    if (!this.moleculeInfo) {
      this.error = 'Molecule information is required to get BDE';
      return;
    }

    let bonds: Array<number> | null = null;

    if (!this.selectAllBonds && this.customBondsInput.trim()) {
      bonds = this.parseBondIndices(this.customBondsInput.trim());
      if (bonds.length === 0) {
        this.error =
          'Invalid bond indices format. Use numbers separated by commas and ranges with dashes (e.g., 1,2,5-8,10)';
        return;
      }
      const maxBonds: number = Object.keys(this.moleculeInfo.bonds).length;
      if (bonds.some((b) => b < 0 || b >= maxBonds)) {
        this.error = `Bond indices must be between 0 and ${maxBonds - 1}`;
        return;
      }
    }

    console.log('Parsed bonds:', bonds);

    this.loadingBDE = true;
    this.error = null;

    const request: BDEEvaluateRequest = {
      smiles: this.moleculeInfo.smiles_canonical,
      molecule_id: this.moleculeInfo.molecule_id,
      export_smiles: this.includeSmilesFormat,
      export_xyz: this.includeXyzFormat,
      bonds_idx: bonds,
    };

    this.v1Service.v1BDEEvaluateCreate(request).subscribe({
      next: (response) => {
        this.loadingBDE = false;
        if (!response) {
          this.error = 'No data received from the server';
          return;
        }
        if (response.data) {
          this.bdeResults = response.data;
          console.log('BDE Results:', this.bdeResults);
          this.error = null;
          // Sanitizar el SVG de bdeResults.image_svg si existe
          if (this.bdeResults.image_svg) {
            let cleanSvg = this.bdeResults.image_svg.trim();
            cleanSvg = cleanSvg.replace(
              /encoding='iso-8859-1'/g,
              "encoding='UTF-8'"
            );
            cleanSvg = cleanSvg.replace(/xmlns=/g, ' xmlns=');
            cleanSvg = cleanSvg.replace(/xmlns:rdkit=/g, ' xmlns:rdkit=');
            cleanSvg = cleanSvg.replace(/xmlns:xlink=/g, ' xmlns:xlink=');
            cleanSvg = cleanSvg.replace(/xml:space=/g, ' xml:space=');
            cleanSvg = cleanSvg.replace(/width="[^"]*"/, 'width="100%"');
            cleanSvg = cleanSvg.replace(/height="[^"]*"/, 'height="auto"');
            // Si no existen, agrégalos al tag <svg>
            if (!/width="[^"]*"/.test(cleanSvg)) {
              cleanSvg = cleanSvg.replace('<svg', '<svg width="100%"');
            }
            if (!/height="[^"]*"/.test(cleanSvg)) {
              cleanSvg = cleanSvg.replace('<svg', '<svg height="auto"');
            }
            cleanSvg = cleanSvg.replace(/viewBox=/g, ' viewBox=');
            cleanSvg = cleanSvg.replace(/\s+/g, ' ');
            cleanSvg = cleanSvg.replace(
              /^<\?xml[^>]+\?><svg/,
              "<?xml version='1.0' encoding='UTF-8'?>\n<svg"
            );
            this.bdeResultsSanitizedSvg =
              this.sanitizer.bypassSecurityTrustHtml(cleanSvg);
          } else {
            this.bdeResultsSanitizedSvg = null;
          }
        } else {
          this.error = 'No BDE data found in the response';
        }
      },
      error: (error: any) => {
        this.loadingBDE = false;
        this.error =
          'Error getting BDE information: ' +
          (error.message || 'Unknown error');
      },
    });
  }
  private parseBondIndices(input: string): number[] {
    const indices: number[] = [];

    try {
      const parts = input.split(',');

      for (const part of parts) {
        const trimmedPart = part.trim();

        if (trimmedPart.includes('-')) {
          const rangeParts = trimmedPart.split('-');
          if (rangeParts.length === 2) {
            const start = parseInt(rangeParts[0].trim(), 10);
            const end = parseInt(rangeParts[1].trim(), 10);

            if (!isNaN(start) && !isNaN(end) && start <= end) {
              for (let i = start; i <= end; i++) {
                indices.push(i);
              }
            }
          }
        } else {
          const num = parseInt(trimmedPart, 10);
          if (!isNaN(num)) {
            indices.push(num);
          }
        }
      }

      // Remove duplicates and sort
      return [...new Set(indices)].sort((a, b) => a - b);
    } catch (error) {
      console.error('Error parsing bond indices:', error);
      return [];
    }
  }

  // Analyze molecule method
  getMoleculeData() {
    if (!this.smilesInput.trim()) {
      return;
    }

    // Guardar en historial si no existe
    const value = this.smilesInput.trim();
    if (value && !this.smilesHistory.includes(value)) {
      this.smilesHistory.unshift(value);
      if (this.smilesHistory.length > 10) this.smilesHistory.pop();
      this.saveSmilesHistory();
    }

    // Validar que el SMILES contenga solo una molécula
    if (!this.isValidSingleMolecule(this.smilesInput.trim())) {
      return; // El error se establece en la función de validación
    }

    this.loadingInfo = true;
    this.error = null;
    this.clearResults();

    const requestInfo: MoleculeInfoRequest = {
      smiles: this.smilesInput.trim(),
    };

    this.v1Service.v1PredictInfoCreate(requestInfo).subscribe({
      next: (response) => {
        if (!response) {
          this.error = 'No data received from the server';
          this.loadingInfo = false;
          return;
        }
        this.moleculeInfo = response.data ?? undefined;
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

    // Forzar ancho y alto del SVG
    cleanSvg = cleanSvg.replace(/width="[^"]*"/, 'width="100%"');
    cleanSvg = cleanSvg.replace(/height="[^"]*"/, 'height="auto"');
    // Si no existen, agrégalos al tag <svg>
    if (!/width="[^"]*"/.test(cleanSvg)) {
      cleanSvg = cleanSvg.replace('<svg', '<svg width="100%"');
    }
    if (!/height="[^"]*"/.test(cleanSvg)) {
      cleanSvg = cleanSvg.replace('<svg', '<svg height="auto"');
    }

    cleanSvg = cleanSvg.replace(/viewBox=/g, ' viewBox=');
    cleanSvg = cleanSvg.replace(/\s+/g, ' ');
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
  downloadSVGFile(useBdeResults?: boolean) {
    let svgToDownload = this.svgImage;
    let filename = `molecular_structure_${this.smilesInput.replace(
      /[^a-zA-Z0-9]/g,
      '_'
    )}.svg`;
    if (useBdeResults && this.bdeResults?.image_svg) {
      svgToDownload = this.bdeResults.image_svg;
      filename = `bde_result_structure_${this.smilesInput.replace(
        /[^a-zA-Z0-9]/g,
        '_'
      )}.svg`;
    }
    if (!svgToDownload) {
      this.error = 'No SVG image available for download';
      return;
    }
    try {
      const blob = new Blob([svgToDownload], { type: 'image/svg+xml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      this.error = 'Error downloading SVG image';
      console.error('Error downloading SVG:', error);
    }
  }

  downloadPNGFile(useBdeResults?: boolean) {
    let svgToDownload = this.svgImage;
    let filename = `molecular_structure_${this.smilesInput.replace(
      /[^a-zA-Z0-9]/g,
      '_'
    )}.png`;
    if (useBdeResults && this.bdeResults?.image_svg) {
      svgToDownload = this.bdeResults.image_svg;
      filename = `bde_result_structure_${this.smilesInput.replace(
        /[^a-zA-Z0-9]/g,
        '_'
      )}.png`;
    }
    if (!svgToDownload) {
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
      const svgBlob = new Blob([svgToDownload], {
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
              link.download = filename;
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

  // Download BDE results as SMILES
  downloadSmilesData() {
    if (!this.bdeResults?.smiles_list) {
      this.error = 'No SMILES data available for download';
      return;
    }

    try {
      // Filter out empty strings and join with newlines
      const smilesContent = this.bdeResults.smiles_list
        .filter((smiles) => smiles.trim() !== '')
        .join('\n');

      const blob = new Blob([smilesContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `bde_results_smiles_${this.smilesInput.replace(
        /[^a-zA-Z0-9]/g,
        '_'
      )}.txt`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      this.error = 'Error downloading SMILES data';
      console.error('Error downloading SMILES:', error);
    }
  }

  // Download BDE results as XYZ
  downloadXyzData() {
    if (!this.bdeResults?.xyz_block) {
      this.error = 'No XYZ data available for download';
      return;
    }

    try {
      const blob = new Blob([this.bdeResults.xyz_block], {
        type: 'text/plain',
      });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `bde_results_xyz_${this.smilesInput.replace(
        /[^a-zA-Z0-9]/g,
        '_'
      )}.xyz`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      this.error = 'Error downloading XYZ data';
      console.error('Error downloading XYZ:', error);
    }
  }

  // Download BDE results as CSV
  downloadBdeTableCSV() {
    if (!this.bdeResults?.bonds_predicted) {
      this.error = 'No BDE data available for download';
      return;
    }

    try {
      // Create CSV header
      let csvContent =
        'Bond Index,Bond Atoms,Begin Atom,End Atom,BDE (kcal/mol),Bond Type\n';

      // Add data rows
      this.bdeResults.bonds_predicted.forEach((bond) => {
        const bdeValue = bond.bde !== null ? bond.bde.toFixed(2) : 'N/A';
        const bondType = bond.bond_type || 'Unknown';
        csvContent += `${bond.idx},"${bond.bond_atoms}",${bond.begin_atom_idx},${bond.end_atom_idx},${bdeValue},"${bondType}"\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `bde_results_table_${this.smilesInput.replace(
        /[^a-zA-Z0-9]/g,
        '_'
      )}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      this.error = 'Error downloading BDE table';
      console.error('Error downloading CSV:', error);
    }
  }

  // Seleccionar SMILES del historial
  selectHistorySmiles(smiles: string) {
    this.smilesInput = smiles;
  }

  // Método para eliminar moléculas del historial
  removeSmilesHistory(item: string) {
    this.smilesHistory = this.smilesHistory.filter((s) => s !== item);
    this.saveSmilesHistory();
  }
}
