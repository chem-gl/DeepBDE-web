import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { RDKitModule } from '@rdkit/rdkit';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { firstValueFrom } from 'rxjs';
import {
  BDEEvaluateRequest,
  FragmentResponseData,
  MoleculeInfoRequest,
  MoleculeInfoResponseData,
  MoleculeSmileCanonicalRequest,
  V1Service,
} from '../../../../angular-client';

// Extender la interfaz ExtendedFragmentResponseData para incluir propiedades de zoom y pan
interface ExtendedFragmentResponseData extends FragmentResponseData {
  isFullscreen?: boolean;
  zoom?: number;
  panX?: number;
  panY?: number;
  smiles?: string;
  isPanning: boolean;
  lastPanX: number;
  lastPanY: number;
}

class Molecule {
  public smiles: string;
  public idSmile: string;
  public canonical: string;
  constructor(smiles: string, idSmile: string, canonical: string) {
    this.smiles = smiles;
    this.idSmile = idSmile;
    this.canonical = canonical;
  }
}
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  getSanitizedSvg(arg0: string) {
    return this.sanitizer.bypassSecurityTrustHtml(arg0);
  }
  // Modal preview state
  public previewModalOpen = false;
  public previewSvg: SafeHtml | null = null;

  private zoomMain = 1.7;
  private panXMain = 0;
  private panYMain = 0;
  private isPanningMain = false;
  private lastPanXMain = 0;
  private lastPanYMain = 0;
  public isFullscreenMain = false;

  // Controles independientes para imagen BDE Result
  private zoomBde = 1.7;
  private panXBde = 0;
  private panYBde = 0;
  private isPanningBde = false;
  private lastPanXBde = 0;
  private lastPanYBde = 0;
  public isFullscreenBde = false;

  // SVG sanitizado para bdeResults.image_svg
  public bdeResultsSanitizedSvg: SafeHtml | null = null;
  // Component properties for mode selection
  public selectedMode: 'smiles' | 'fragments' | 'smilesList' = 'smiles';
  // Para lista de SMILES
  public smilesList: Array<{ smiles: string; valid: boolean | null }> = [];
  public smilesListInput: string = '';

  public smilesInput = '';

  // Properties for molecular analysis
  public loadingInfo = false;
  public error: string | null = null;
  public svgImage: string | null = null;
  public sanitizedSvg: SafeHtml | null = null;

  // Properties for zoom and pan
  public isFullscreen = false;

  // Properties for bond selection
  public selectAllBonds = true;
  public customBondsInput = '';

  // Properties for result format
  public includeXyzFormat = false;
  public includeSmilesFormat = false;
  public moleculeInfo?: MoleculeInfoResponseData;
  // Properties for BDE results
  public bdeResults?: FragmentResponseData;
  public allBDEResults: ExtendedFragmentResponseData[] = [];
  private moleculeList: Molecule[] = [];
  public loadingBDE = false;

  public smiles = '';
  public ketcherLoaded = false;

  private RDKit?: RDKitModule;
  public rdkitReady = false;
  @ViewChild('ketcherFrame') ketcherFrame!: ElementRef<HTMLIFrameElement>;

  // Agregar SMILES uno a uno
  public addSmilesToList() {
    const value = this.smilesListInput.trim();
    if (!value) return;
    if (this.smilesList.some((item) => item.smiles === value)) return;
    // Validar SMILES
    this.smilesList.push({ smiles: value, valid: null });
    this.smilesListInput = '';
    this.validateSmilesListItem(this.smilesList.length - 1);
  }

  // Eliminar SMILES de la lista
  public removeSmilesFromList(item: { smiles: string; valid: boolean | null }) {
    this.smilesList = this.smilesList.filter((s) => s !== item);
  }

  // Subir archivo de SMILES
  public onSmilesFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l);
      for (const line of lines) {
        if (!this.smilesList.some((item) => item.smiles === line)) {
          this.smilesList.push({ smiles: line, valid: null });
        }
      }
      // Validar todos los nuevos
      this.smilesList.forEach((_, idx) => this.validateSmilesListItem(idx));
    };
    reader.readAsText(file);
  }

  // Validar SMILES en la lista usando RDKit
  private async validateSmilesListItem(idx: number) {
    const item = this.smilesList[idx];
    if (!item) return;
    // Validación similar a isValidSingleMolecule
    if (!item.smiles || item.smiles.includes('.')) {
      this.smilesList[idx].valid = false;
      return;
    }
    if (this.RDKit) {
      try {
        const mol = this.RDKit.get_mol(item.smiles);
        this.smilesList[idx].valid = !!mol;
      } catch {
        this.smilesList[idx].valid = false;
      }
    } else {
      // Si RDKit no está listo, marcar como pendiente
      this.smilesList[idx].valid = null;
    }
  }

  // Analizar todos los SMILES válidos
  public async analyzeSmilesList() {
    const validSmiles = this.smilesList
      .filter((s) => s.valid)
      .map((s) => s.smiles);

    if (validSmiles.length === 0) return;

    this.loadingBDE = true; // Activar indicador de carga

    for (let idx = 0; idx < validSmiles.length; idx++) {
      const peticion: MoleculeSmileCanonicalRequest = {
        smiles: validSmiles[idx],
      };

      try {
        const response: any = await firstValueFrom(
          this.v1Service.v1PredictInfoSmileCanonicalCreate(peticion)
        );
        if (response?.data) {
          this.moleculeList.push(
            new Molecule(
              response.data.smiles,
              response.data.molecule_id,
              response.data.smiles_canonical
            )
          );
          const bdeRequest: BDEEvaluateRequest = {
            smiles: response.data.smiles,
            molecule_id: response.data.molecule_id,
            export_smiles: true,
            export_xyz: true,
            bonds_idx: [],
          };

          const bdeResponse = await firstValueFrom(
            this.v1Service.v1BDEEvaluateCreate(bdeRequest)
          );
          if (!bdeResponse.data) continue;
          {
            // Asegurar que cada resultado tenga la propiedad isFullscreen inicializada
            if (bdeResponse.data) {
              const resultWithFullscreen = {
                ...bdeResponse.data,
                isFullscreen: false,
                zoom: 1,
                panX: 0,
                panY: 0,
                isPanning: false,
                lastPanX: 0,
                lastPanY: 0,
                smiles: response.data.smiles,
              };
              this.allBDEResults.push(resultWithFullscreen);
            }
          }
        }
      } catch (error) {
        console.error('Error procesando SMILES:', error);
      }
    }

    this.loadingBDE = false; // Desactivar indicador de carga
  }

  constructor(
    private readonly v1Service: V1Service,
    private readonly sanitizer: DomSanitizer
  ) {
    // Add listener for Escape key
    document.addEventListener('keydown', (event) => {
      if (
        event.key === 'Escape' &&
        (this.isFullscreenMain || this.isFullscreenBde)
      ) {
        this.resetZoomMain();
        this.resetZoomBde();
        this.isFullscreenMain = false;
        this.isFullscreenBde = false;
      }
    });
  }
  private async initRdkit() {
    try {
      // Si cargaste RDKit con <script> en index.html (CDN) o con assets.
      if ((window as any).initRDKitModule) {
        // Si tienes los archivos en /assets/rdkit, usa locateFile para que encuentre el .wasm
        this.RDKit = await (window as any).initRDKitModule({
          locateFile: (file: string) => `/assets/rdkit/${file}`,
        });
        (window as any).RDKit = this.RDKit;
        this.rdkitReady = true;
        console.log('RDKit cargado, versión:', this.RDKit?.version?.());
      } else {
        console.warn(
          'initRDKitModule no encontrado en window. Revisa que RDKit_minimal.js esté cargado.'
        );
      }
    } catch (err) {
      console.error('Error inicializando RDKit:', err);
    }
  }

  // Historial de SMILES
  public smilesHistory: string[] = [];

  public ngOnInit() {
    const saved = localStorage.getItem('smilesHistory');
    if (saved) {
      try {
        this.smilesHistory = JSON.parse(saved);
      } catch {}
    }
    this.initRdkit();

    this.allBDEResults.forEach((result) => {
      result.zoom = 1;
      result.panX = 0;
      result.panY = 0;
    });
  }

  // Abrir modal y generar SVG con RDKit
  public async openSmilesPreview(item: {
    smiles: string;
    valid: boolean | null;
  }) {
    if (!this.RDKit || !item.valid) return;
    try {
      const mol = this.RDKit.get_mol(item.smiles);
      if (mol && mol.is_valid()) {
        let svg = mol.get_svg(350, 200).trim();
        // Sanitize SVG output
        svg = svg.replace(/encoding='iso-8859-1'/g, "encoding='UTF-8'");
        svg = svg.replace(/xmlns=/g, ' xmlns=');
        svg = svg.replace(/xmlns:rdkit=/g, ' xmlns:rdkit=');
        svg = svg.replace(/xmlns:xlink=/g, ' xmlns:xlink=');
        svg = svg.replace(/xml:space=/g, ' xml:space=');
        svg = svg.replace(/width="[^"]*"/, 'width="100%"');
        svg = svg.replace(/height="[^"]*"/, 'height="auto"');
        if (!/width="[^"]*"/.test(svg)) {
          svg = svg.replace('<svg', '<svg width="100%"');
        }
        if (!/height="[^"]*"/.test(svg)) {
          svg = svg.replace('<svg', '<svg height="auto"');
        }
        svg = svg.replace(/viewBox=/g, ' viewBox=');
        svg = svg.replace(/\s+/g, ' ');
        svg = svg.replace(
          /^<\?xml[^>]+\?><svg/,
          "<?xml version='1.0' encoding='UTF-8'?>\n<svg"
        );
        this.previewSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
        this.previewModalOpen = true;
      } else {
        this.previewSvg = '<div style="color:red;">Invalid molecule</div>';
        this.previewModalOpen = true;
      }
    } catch {
      this.previewSvg =
        '<div style="color:red;">Error generating preview</div>';
      this.previewModalOpen = true;
    }
  }

  public closePreviewModal() {
    this.previewModalOpen = false;
    this.previewSvg = null;
  }
  public trackSmiles(
    index: number,
    item: { smiles: string; valid: boolean | null }
  ) {
    return item.smiles;
  }

  public getValidSmilesCount(): number {
    return this.smilesList.filter((s) => s.valid === true).length;
  }

  public hasValidSmiles(): boolean {
    return this.smilesList.some((s) => s.valid === true);
  }
  // Métodos para imagen principal
  public zoomInMain() {
    this.zoomMain = Math.min(this.zoomMain * 1.2, 15);
  }
  public zoomOutMain() {
    this.zoomMain = Math.max(this.zoomMain / 1.2, 0.1);
  }
  public resetZoomMain() {
    this.zoomMain = 1;
    this.panXMain = 0;
    this.panYMain = 0;
  }
  public toggleFullscreenMain() {
    this.isFullscreenMain = !this.isFullscreenMain;
    if (!this.isFullscreenMain) this.resetZoomMain();
  }
  public getTransformMain(): string {
    return `scale(${this.zoomMain}) translate(${this.panXMain}px, ${this.panYMain}px)`;
  }
  public startPanMain(event: MouseEvent) {
    this.isPanningMain = true;
    this.lastPanXMain = event.clientX;
    this.lastPanYMain = event.clientY;
    event.preventDefault();
  }
  public onPanMain(event: MouseEvent) {
    if (!this.isPanningMain) return;
    const deltaX = event.clientX - this.lastPanXMain;
    const deltaY = event.clientY - this.lastPanYMain;
    this.panXMain += deltaX / this.zoomMain;
    this.panYMain += deltaY / this.zoomMain;
    this.lastPanXMain = event.clientX;
    this.lastPanYMain = event.clientY;
  }
  public endPanMain() {
    this.isPanningMain = false;
  }
  public onWheelMain(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    this.zoomMain = Math.max(0.1, Math.min(15, this.zoomMain * delta));
  }

  // Métodos para imagen BDE Result
  public zoomInBde() {
    this.zoomBde = Math.min(this.zoomBde * 1.2, 15);
  }
  public zoomOutBde() {
    this.zoomBde = Math.max(this.zoomBde / 1.2, 0.1);
  }
  public resetZoomBde() {
    this.zoomBde = 1;
    this.panXBde = 0;
    this.panYBde = 0;
  }
  public toggleFullscreenBde() {
    this.isFullscreenBde = !this.isFullscreenBde;
    if (!this.isFullscreenBde) this.resetZoomBde();
  }
  public getTransformBde(): string {
    return `scale(${this.zoomBde}) translate(${this.panXBde}px, ${this.panYBde}px)`;
  }
  public startPanBde(event: MouseEvent) {
    this.isPanningBde = true;
    this.lastPanXBde = event.clientX;
    this.lastPanYBde = event.clientY;
    event.preventDefault();
  }
  public onPanBde(event: MouseEvent) {
    if (!this.isPanningBde) return;
    const deltaX = event.clientX - this.lastPanXBde;
    const deltaY = event.clientY - this.lastPanYBde;
    this.panXBde += deltaX / this.zoomBde;
    this.panYBde += deltaY / this.zoomBde;
    this.lastPanXBde = event.clientX;
    this.lastPanYBde = event.clientY;
  }
  public endPanBde() {
    this.isPanningBde = false;
  }
  public onWheelBde(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    this.zoomBde = Math.max(0.1, Math.min(15, this.zoomBde * delta));
  }

  public saveSmilesHistory() {
    localStorage.setItem('smilesHistory', JSON.stringify(this.smilesHistory));
  }

  public ngAfterViewInit() {
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

  public async getSmiles() {
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
  public analyzeMoleculeFromDrawing() {
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
    //verificar que sea un smile correcto con rdkit
    if (this.RDKit) {
      try {
        const mol = this.RDKit.get_mol(trimmedSmiles);
        if (!mol?.is_valid()) {
          this.error = 'Invalid SMILES: The SMILES string is not valid.';
          return false;
        }
      } catch (e) {
        this.error = 'Invalid SMILES: Error parsing SMILES with RDKit.';
        return false;
      }
    }

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
  setMode(mode: 'smiles' | 'fragments' | 'smilesList') {
    this.selectedMode = mode;
    // Limpiar inputs y estados al cambiar de modo
    this.smilesInput = '';
    this.smiles = '';
    this.ketcherLoaded = false;
    this.clearResults();
    if (mode === 'fragments') {
      this.initKetcherWhenModeChanges();
    }
    if (mode === 'smilesList') {
      // Opcional: limpiar input temporal
      this.smilesListInput = '';
    }
  }

  // Clear all results
  clearResults() {
    this.svgImage = null;
    this.sanitizedSvg = null;
    this.error = null;
    this.bdeResults = undefined;
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
  public getBDE() {
    if (!this.includeXyzFormat && !this.includeSmilesFormat) {
      console.error('No output format selected - will use default behavior');
    }

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
  public getMoleculeData() {
    if (!this.smilesInput.trim()) {
      return;
    }
    //quito todos los contenidos
    this.clearResults();

    // Guardar en historial si no existe
    const value = this.smilesInput.trim();
    if (value && !this.smilesHistory.includes(value)) {
      this.smilesHistory.unshift(value);
      if (this.smilesHistory.length > 10) {
        this.smilesHistory.pop();
      }
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

  public downloadSVGFile(useBdeResults?: boolean) {
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

  public downloadPNGFile(useBdeResults?: boolean) {
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
  public downloadSmilesData() {
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
  public downloadXyzData() {
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
  public downloadBdeTableCSV() {
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

  public async processSmilesList() {}

  public async downloadReports(format: 'smiles' | 'xyz') {
    const zip = new JSZip();

    for (const result of this.allBDEResults) {
      const moleculeName = result.smiles || 'unknown';
      const fileName = `${moleculeName.replace(
        /[^a-zA-Z0-9]/g,
        '_'
      )}.${format}`;
      const content =
        format === 'smiles'
          ? result.smiles_list?.join('\n') || ''
          : result.xyz_block || '';
      zip.file(fileName, content);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `bde_reports_${format}.zip`);
  }

  toggleFullscreen(result: any) {
    result.isFullscreen = !result.isFullscreen;
  }

  // Métodos exclusivos para zoom y fullscreen de cada elemento en allBDEResults
  zoomIn(result: ExtendedFragmentResponseData) {
    result.zoom = Math.min((result.zoom || 1) * 1.2, 15);
  }

  zoomOut(result: ExtendedFragmentResponseData) {
    result.zoom = Math.max((result.zoom || 1) / 1.2, 0.1);
  }

  resetZoom(result: ExtendedFragmentResponseData) {
    result.zoom = 1;
    result.panX = 0;
    result.panY = 0;
  }

  // Método para manejar el evento de scroll y ajustar el zoom
  onWheel(result: ExtendedFragmentResponseData, event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    result.zoom = Math.max(0.1, Math.min(15, (result.zoom || 1) * delta));
  }

  // Métodos para manejar el arrastre (panning)
  startPan(result: ExtendedFragmentResponseData, event: MouseEvent) {
    result.isPanning = true;
    result.lastPanX = event.clientX;
    result.lastPanY = event.clientY;
  }

  onPan(result: ExtendedFragmentResponseData, event: MouseEvent) {
    if (!result.isPanning) return;
    const deltaX = event.clientX - result.lastPanX;
    const deltaY = event.clientY - result.lastPanY;
    result.panX = (result.panX || 0) + deltaX;
    result.panY = (result.panY || 0) + deltaY;
    result.lastPanX = event.clientX;
    result.lastPanY = event.clientY;
  }
  public endPan(result: ExtendedFragmentResponseData) {
    result.isPanning = false;
  }

  // Método para descargar una imagen SVG
  downloadImage(result: ExtendedFragmentResponseData) {
    const svgBlob = new Blob([result.image_svg], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.smiles || 'image'}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Método para obtener las transformaciones aplicadas al SVG
  getTransform(result: ExtendedFragmentResponseData): string {
    const scale = result.zoom || 1;
    const translateX = result.panX || 0;
    const translateY = result.panY || 0;
    return `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  // Propiedad para controlar el toggle de mostrar resultados
  public showResults: boolean = false;

  // Método para alternar el estado de mostrar resultados
  toggleResults() {
    this.showResults = !this.showResults;
  }

  // Método para descargar el formato SMILES de un resultado individual
  downloadSmiles(result: ExtendedFragmentResponseData) {
    const blob = new Blob([result.smiles_list?.join('\n') || ''], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.smiles || 'result'}.smiles`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Método para descargar el formato XYZ de un resultado individual
  downloadXyz(result: ExtendedFragmentResponseData) {
    const blob = new Blob([result.xyz_block || ''], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.smiles || 'result'}.xyz`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
