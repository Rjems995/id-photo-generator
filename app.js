/**
 * Passport & ID Photo Print Generator Engine
 * Handles image processing, dynamic dynamic multi-size grids, custom spacing, high-res canvas rendering, and exports.
 */

// Application State
const state = {
  rawImage: null,
  cropper: null,
  croppedCanvas: null,
  paper: {
    type: '4x6',
    widthInches: 4,
    heightInches: 6
  },
  primaryPhoto: {
    widthInches: 2,
    heightInches: 2,
    quantity: 6,
    label: '2x2 in'
  },
  mixPhotos: {
    '1x1': 0,
    '2x2': 0,
    '1.5x2': 0
  },
  guides: 'dashed', // 'none', 'solid', 'dashed'
  gapInches: 0.1,    // Default ~2.5mm space between photos
  marginInches: 0.2  // Default ~5mm outer sheet margin
};

// Paper Dimensions Map (Inches)
const PAPER_SIZES = {
  '4x6': { w: 4, h: 6 },
  '5x7': { w: 5, h: 7 },
  'letter': { w: 8.5, h: 11 },
  'a4': { w: 8.27, h: 11.69 }
};

// Preset Photo Sizes (Inches)
const PHOTO_PRESETS = {
  '2x2': { w: 2, h: 2, label: '2x2 in (US Passport)' },
  '1x1': { w: 1, h: 1, label: '1x1 in' },
  '1.5x2': { w: 1.5, h: 2, label: '1.5x2 in' },
  '2x3': { w: 2, h: 3, label: '2x3 in' },
  '35x45mm': { w: 35 / 25.4, h: 45 / 25.4, label: '35x45 mm (EU/UK Passport)' },
  '30x40mm': { w: 30 / 25.4, h: 40 / 25.4, label: '30x40 mm' }
};

// DOM Elements
const DOM = {};

document.addEventListener('DOMContentLoaded', () => {
  cacheDOMElements();
  attachEventListeners();
  feather.replace();
});

function cacheDOMElements() {
  DOM.dropZone = document.getElementById('drop-zone');
  DOM.fileInput = document.getElementById('file-input');
  DOM.cropperImg = document.getElementById('cropper-image');
  DOM.cropperWrapper = document.getElementById('cropper-wrapper');
  DOM.cropperPlaceholder = document.getElementById('cropper-placeholder');
  
  DOM.presetSelect = document.getElementById('preset-select');
  DOM.customDimensionsGroup = document.getElementById('custom-dimensions-group');
  DOM.customWidth = document.getElementById('custom-width');
  DOM.customHeight = document.getElementById('custom-height');
  DOM.customUnit = document.getElementById('custom-unit');
  
  DOM.paperSelect = document.getElementById('paper-select');
  DOM.primaryQty = document.getElementById('primary-qty');
  DOM.maxCapacityBtn = document.getElementById('max-capacity-btn');
  
  // Spacing Controls
  DOM.gapInput = document.getElementById('gap-input');
  DOM.gapValueDisplay = document.getElementById('gap-value-display');
  DOM.marginInput = document.getElementById('margin-input');
  DOM.marginValueDisplay = document.getElementById('margin-value-display');
  
  DOM.mix1x1 = document.getElementById('mix-1x1');
  DOM.mix2x2 = document.getElementById('mix-2x2');
  DOM.mix15x2 = document.getElementById('mix-15x2');
  DOM.guidesSelect = document.getElementById('guides-select');
  
  DOM.btnStep2 = document.getElementById('btn-step-2');
  DOM.btnBackStep1 = document.getElementById('btn-back-step-1');
  DOM.step1Panel = document.getElementById('step-1-panel');
  DOM.step2Panel = document.getElementById('step-2-panel');
  DOM.step1Preview = document.getElementById('step-1-preview');
  DOM.step2Preview = document.getElementById('step-2-preview');
  
  DOM.badgeDimensions = document.getElementById('badge-dimensions');
  DOM.badgePaper = document.getElementById('badge-paper');
  DOM.badgePhotosCount = document.getElementById('badge-photos-count');
  DOM.sheetCanvas = document.getElementById('sheet-canvas');
  
  DOM.btnDownloadPng = document.getElementById('btn-download-png');
  DOM.btnDownloadPdf = document.getElementById('btn-download-pdf');
  DOM.btnPrint = document.getElementById('btn-print');
}

function attachEventListeners() {
  // File Upload Handlers
  DOM.dropZone.addEventListener('click', () => DOM.fileInput.click());
  DOM.fileInput.addEventListener('change', handleFileSelect);
  
  ['dragenter', 'dragover'].forEach(eventName => {
    DOM.dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      DOM.dropZone.classList.add('border-white');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    DOM.dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      DOM.dropZone.classList.remove('border-white');
    });
  });

  DOM.dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  });

  // Preset & Sizing Handlers
  DOM.presetSelect.addEventListener('change', handlePresetChange);
  DOM.customWidth.addEventListener('input', handleCustomSizeChange);
  DOM.customHeight.addEventListener('input', handleCustomSizeChange);
  DOM.customUnit.addEventListener('change', handleCustomSizeChange);

  // Sheet Controls
  DOM.paperSelect.addEventListener('change', () => {
    const val = DOM.paperSelect.value;
    if (PAPER_SIZES[val]) {
      state.paper.type = val;
      state.paper.widthInches = PAPER_SIZES[val].w;
      state.paper.heightInches = PAPER_SIZES[val].h;
    }
    updateMaxCapacity();
    renderSheet();
  });

  DOM.primaryQty.addEventListener('input', () => {
    state.primaryPhoto.quantity = parseInt(DOM.primaryQty.value) || 0;
    renderSheet();
  });

  DOM.maxCapacityBtn.addEventListener('click', calculateAndSetMaxCapacity);

  // Gap & Margin Spacing Listeners
  DOM.gapInput.addEventListener('input', () => {
    const mm = parseFloat(DOM.gapInput.value) || 0;
    state.gapInches = mm / 25.4;
    DOM.gapValueDisplay.textContent = `${mm.toFixed(1)} mm`;
    renderSheet();
  });

  DOM.marginInput.addEventListener('input', () => {
    const mm = parseFloat(DOM.marginInput.value) || 0;
    state.marginInches = mm / 25.4;
    DOM.marginValueDisplay.textContent = `${mm.toFixed(1)} mm`;
    renderSheet();
  });

  // Photo Mix Inputs
  DOM.mix1x1.addEventListener('input', () => {
    state.mixPhotos['1x1'] = parseInt(DOM.mix1x1.value) || 0;
    renderSheet();
  });
  DOM.mix2x2.addEventListener('input', () => {
    state.mixPhotos['2x2'] = parseInt(DOM.mix2x2.value) || 0;
    renderSheet();
  });
  DOM.mix15x2.addEventListener('input', () => {
    state.mixPhotos['1.5x2'] = parseInt(DOM.mix15x2.value) || 0;
    renderSheet();
  });

  DOM.guidesSelect.addEventListener('change', () => {
    state.guides = DOM.guidesSelect.value;
    renderSheet();
  });

  // Step Navigation
  DOM.btnStep2.addEventListener('click', () => {
    if (!state.cropper) return;
    state.croppedCanvas = state.cropper.getCroppedCanvas();
    
    DOM.step1Panel.classList.add('hidden');
    DOM.step1Preview.classList.add('hidden');
    DOM.step2Panel.classList.remove('hidden');
    DOM.step2Preview.classList.remove('hidden');
    
    updateMaxCapacity();
    renderSheet();
  });

  DOM.btnBackStep1.addEventListener('click', () => {
    DOM.step2Panel.classList.add('hidden');
    DOM.step2Preview.classList.add('hidden');
    DOM.step1Panel.classList.remove('hidden');
    DOM.step1Preview.classList.remove('hidden');
  });

  // Export Buttons
  DOM.btnDownloadPng.addEventListener('click', () => downloadImage('png'));
  DOM.btnDownloadPdf.addEventListener('click', downloadPDF);
  DOM.btnPrint.addEventListener('click', () => window.print());
}

function handleFileSelect(e) {
  if (e.target.files && e.target.files[0]) {
    handleFile(e.target.files[0]);
  }
}

function handleFile(file) {
  if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
    alert('Please upload a valid JPG, PNG, or WEBP photo.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    DOM.cropperImg.src = e.target.result;
    DOM.cropperPlaceholder.classList.add('hidden');
    DOM.cropperWrapper.classList.remove('hidden');
    DOM.btnStep2.disabled = false;

    if (state.cropper) state.cropper.destroy();

    const aspectRatio = state.primaryPhoto.widthInches / state.primaryPhoto.heightInches;
    state.cropper = new Cropper(DOM.cropperImg, {
      aspectRatio: aspectRatio,
      viewMode: 1,
      background: false,
      autoCropArea: 0.9,
      responsive: true
    });
  };
  reader.readAsDataURL(file);
}

function handlePresetChange() {
  const selected = DOM.presetSelect.value;
  if (selected === 'custom') {
    DOM.customDimensionsGroup.classList.remove('hidden');
    handleCustomSizeChange();
  } else {
    DOM.customDimensionsGroup.classList.add('hidden');
    const preset = PHOTO_PRESETS[selected];
    if (preset) {
      state.primaryPhoto.widthInches = preset.w;
      state.primaryPhoto.heightInches = preset.h;
      state.primaryPhoto.label = preset.label;
      updateCropperAspectRatio();
    }
  }
}

function handleCustomSizeChange() {
  const w = parseFloat(DOM.customWidth.value) || 1;
  const h = parseFloat(DOM.customHeight.value) || 1;
  const unit = DOM.customUnit.value;

  const toInches = unit === 'mm' ? (1 / 25.4) : 1;
  state.primaryPhoto.widthInches = w * toInches;
  state.primaryPhoto.heightInches = h * toInches;
  state.primaryPhoto.label = `Custom (${w}${unit} x ${h}${unit})`;

  updateCropperAspectRatio();
}

function updateCropperAspectRatio() {
  if (state.cropper) {
    state.cropper.setAspectRatio(
      state.primaryPhoto.widthInches / state.primaryPhoto.heightInches
    );
  }
}

function calculateMaxFit(photoW, photoH, paperW, paperH, gap, margin) {
  const availW = paperW - (2 * margin);
  const availH = paperH - (2 * margin);

  if (availW <= 0 || availH <= 0) return 0;

  const cols = Math.floor((availW + gap) / (photoW + gap));
  const rows = Math.floor((availH + gap) / (photoH + gap));

  return Math.max(0, cols * rows);
}

function updateMaxCapacity() {
  const max = calculateMaxFit(
    state.primaryPhoto.widthInches,
    state.primaryPhoto.heightInches,
    state.paper.widthInches,
    state.paper.heightInches,
    state.gapInches,
    state.marginInches
  );
  if (max > 0) {
    state.primaryPhoto.quantity = max;
    DOM.primaryQty.value = max;
  }
}

function calculateAndSetMaxCapacity() {
  updateMaxCapacity();
  renderSheet();
}

function renderSheet() {
  if (!state.croppedCanvas) return;

  const DPI = 300;
  const canvas = DOM.sheetCanvas;
  const ctx = canvas.getContext('2d');

  const canvasWidth = Math.round(state.paper.widthInches * DPI);
  const canvasHeight = Math.round(state.paper.heightInches * DPI);

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Pure White Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Calculate items queue
  const items = [];

  // 1. Primary crop photos
  for (let i = 0; i < state.primaryPhoto.quantity; i++) {
    items.push({
      w: state.primaryPhoto.widthInches * DPI,
      h: state.primaryPhoto.heightInches * DPI,
      canvas: state.croppedCanvas
    });
  }

  // 2. Additional mix photos
  const mixPresets = {
    '1x1': { w: 1 * DPI, h: 1 * DPI },
    '2x2': { w: 2 * DPI, h: 2 * DPI },
    '1.5x2': { w: 1.5 * DPI, h: 2 * DPI }
  };

  Object.keys(state.mixPhotos).forEach(key => {
    const qty = state.mixPhotos[key];
    const dim = mixPresets[key];
    if (qty > 0 && dim) {
      for (let i = 0; i < qty; i++) {
        items.push({
          w: dim.w,
          h: dim.h,
          canvas: createResizedPhotoCanvas(state.croppedCanvas, dim.w, dim.h)
        });
      }
    }
  });

  // Lay out photos using current gap and margins
  const marginPx = state.marginInches * DPI;
  const gapPx = state.gapInches * DPI;

  let currentX = marginPx;
  let currentY = marginPx;
  let rowMaxHeight = 0;
  let totalRendered = 0;

  for (const item of items) {
    if (currentX + item.w > canvasWidth - marginPx) {
      currentX = marginPx;
      currentY += rowMaxHeight + gapPx;
      rowMaxHeight = 0;
    }

    if (currentY + item.h > canvasHeight - marginPx) {
      break; // Page full
    }

    ctx.drawImage(item.canvas, currentX, currentY, item.w, item.h);

    if (state.guides !== 'none') {
      ctx.save();
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = 1.5;
      if (state.guides === 'dashed') {
        ctx.setLineDash([8, 8]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.strokeRect(currentX, currentY, item.w, item.h);
      ctx.restore();
    }

    currentX += item.w + gapPx;
    if (item.h > rowMaxHeight) rowMaxHeight = item.h;
    totalRendered++;
  }

  // Update Badges
  DOM.badgeDimensions.textContent = state.primaryPhoto.label;
  DOM.badgePaper.textContent = `${state.paper.type.toUpperCase()} (${state.paper.widthInches}" × ${state.paper.heightInches}")`;
  DOM.badgePhotosCount.textContent = `${totalRendered} Photo${totalRendered === 1 ? '' : 's'}`;
}

function createResizedPhotoCanvas(originalCanvas, targetW, targetH) {
  const offscreen = document.createElement('canvas');
  offscreen.width = targetW;
  offscreen.height = targetH;
  const ctx = offscreen.getContext('2d');
  ctx.drawImage(originalCanvas, 0, 0, targetW, targetH);
  return offscreen;
}

function downloadImage(format) {
  const link = document.createElement('a');
  link.download = `photo-id-sheet-${state.paper.type}.${format}`;
  link.href = DOM.sheetCanvas.toDataURL(`image/${format === 'png' ? 'png' : 'jpeg'}`, 0.95);
  link.click();
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const orientation = state.paper.widthInches > state.paper.heightInches ? 'landscape' : 'portrait';
  
  const doc = new jsPDF({
    orientation: orientation,
    unit: 'in',
    format: [state.paper.widthInches, state.paper.heightInches]
  });

  const imgData = DOM.sheetCanvas.toDataURL('image/jpeg', 0.98);
  doc.addImage(imgData, 'JPEG', 0, 0, state.paper.widthInches, state.paper.heightInches);
  doc.save(`photo-id-sheet-${state.paper.type}.pdf`);
}