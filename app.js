/* STREAMING_CHUNK:Initializing state variables and presets... */
// Global Application State Variables
let cropper = null;
let currentStep = 1;
let originalImageSrc = "https://placehold.co/600x600/111111/888888?text=Upload+Your+Photo";
let croppedImageDataUrl = null;
let selectedBgColor = "#ffffff";

// Preset Photo Dimensions Dictionary
const PRESETS = {
    "2x2": { name: "2x2 Inch", w: 2, h: 2, unit: "in", aspect: 1 },
    "1x1": { name: "1x1 Inch", w: 1, h: 1, unit: "in", aspect: 1 },
    "1.5x2": { name: "1.5x2 Inch", w: 1.5, h: 2, unit: "in", aspect: 1.5/2 },
    "2x3": { name: "2x3 Inch", w: 2, h: 3, unit: "in", aspect: 2/3 },
    "35x45": { name: "35x45 mm", w: 35, h: 45, unit: "mm", aspect: 35/45 },
    "30x40": { name: "30x40 mm", w: 30, h: 40, unit: "mm", aspect: 30/40 },
    "custom": { name: "Custom", w: 2, h: 2, unit: "in", aspect: 1 }
};

// Paper Dimensions Dictionary in Inches
const PAPERS = {
    "4x6": { w: 4, h: 6, name: "4 x 6 in" },
    "5x7": { w: 5, h: 7, name: "5 x 7 in" },
    "a4": { w: 8.27, h: 11.69, name: "A4 (8.27 x 11.69 in)" },
    "letter": { w: 8.5, h: 11, name: "US Letter (8.5 x 11 in)" }
};

// Selected Preset Key & Quantities Counter State
let selectedPresetKey = "2x2";
let quantities = {
    primary: 6,
    "1x1": 0,
    "2x2": 0,
    "1.5x2": 0
};

// DOM Element References
const imageToCrop = document.getElementById('image-to-crop');
const imageInput = document.getElementById('image-input');
const dropZone = document.getElementById('drop-zone');
const presetSelect = document.getElementById('preset-select');
const paperSelect = document.getElementById('paper-size-select');
const sheetCanvas = document.getElementById('sheet-canvas');
const lineStyleSelect = document.getElementById('line-style-select');

/* STREAMING_CHUNK:Defining notification and cropper functions... */
// Toast Notification Helpers
function showToast(text) {
    const toast = document.getElementById('toast-message');
    document.getElementById('toast-text').innerHTML = `<i class="fa-solid fa-circle-info text-white"></i> ${text}`;
    toast.classList.remove('hidden');
    setTimeout(() => {
        hideToast();
    }, 4000);
}

function hideToast() {
    document.getElementById('toast-message').classList.add('hidden');
}

document.getElementById('toast-close-btn').addEventListener('click', hideToast);

// Initialize Cropper.js instance
function initCropper() {
    try {
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        
        const preset = PRESETS[selectedPresetKey];
        const aspectRatio = preset.aspect;

        cropper = new Cropper(imageToCrop, {
            aspectRatio: aspectRatio,
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 0.85,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
            ready() {
                const tools = document.getElementById('cropper-tools');
                if (tools) tools.classList.remove('opacity-40', 'pointer-events-none');
            }
        });
    } catch (err) {
        console.error("Cropper Initialization Error:", err);
        showToast("Failed to initialize photo crop tool.");
    }
}

// File Selection & Drag-and-Drop Handling
dropZone.addEventListener('click', () => imageInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-white', 'bg-neutral-800');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-white', 'bg-neutral-800');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-white', 'bg-neutral-800');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
    }
});

imageInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    if (!file || !file.type.startsWith('image/')) {
        showToast('Please upload a valid image file (JPEG, PNG, or WEBP).');
        return;
    }
    if (file.size > 25 * 1024 * 1024) {
        showToast('Image file size exceeds 25MB limit.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        originalImageSrc = e.target.result;
        imageToCrop.src = originalImageSrc;
        initCropper();
        showToast('Photo loaded successfully. Adjust crop area.');
    };
    reader.onerror = () => {
        showToast('Error reading uploaded image file.');
    };
    reader.readAsDataURL(file);
}

/* STREAMING_CHUNK:Configuring custom dimension and background swatch controls... */
presetSelect.addEventListener('change', (e) => {
    selectedPresetKey = e.target.value;
    const customContainer = document.getElementById('custom-dim-container');

    if (selectedPresetKey === 'custom') {
        customContainer.classList.remove('hidden');
        updateCustomPreset();
    } else {
        customContainer.classList.add('hidden');
        updatePrimaryLabel();
        updateMixerVisibility();
        if (cropper) {
            cropper.setAspectRatio(PRESETS[selectedPresetKey].aspect);
        }
    }
    document.getElementById('crop-aspect-badge').innerText = `Ratio: ${PRESETS[selectedPresetKey].w}:${PRESETS[selectedPresetKey].h}`;
});

function updateCustomPreset() {
    let w = parseFloat(document.getElementById('custom-width').value) || 1;
    let h = parseFloat(document.getElementById('custom-height').value) || 1;
    w = Math.max(0.1, Math.min(20, w));
    h = Math.max(0.1, Math.min(20, h));

    const unit = document.getElementById('custom-unit').value;
    PRESETS['custom'].w = w;
    PRESETS['custom'].h = h;
    PRESETS['custom'].unit = unit;
    PRESETS['custom'].aspect = w / h;

    if (cropper) {
        cropper.setAspectRatio(PRESETS['custom'].aspect);
    }
    updatePrimaryLabel();
}

document.getElementById('custom-width').addEventListener('input', updateCustomPreset);
document.getElementById('custom-height').addEventListener('input', updateCustomPreset);
document.getElementById('custom-unit').addEventListener('change', updateCustomPreset);

function updatePrimaryLabel() {
    const p = PRESETS[selectedPresetKey];
    document.getElementById('primary-qty-label').innerText = `Primary (${p.w}${p.unit} x ${p.h}${p.unit}):`;
}

function updateMixerVisibility() {
    document.getElementById('mixer-1x1-row').classList.toggle('hidden', selectedPresetKey === '1x1');
    document.getElementById('mixer-2x2-row').classList.toggle('hidden', selectedPresetKey === '2x2');
    document.getElementById('mixer-1.5x2-row').classList.toggle('hidden', selectedPresetKey === '1.5x2');
}

// Background Swatches
document.querySelectorAll('.bg-color-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.bg-color-btn').forEach(b => b.classList.remove('border-2', 'border-white'));
        const target = e.currentTarget;
        target.classList.add('border-2', 'border-white');
        selectedBgColor = target.getAttribute('data-color');
    });
});

document.getElementById('custom-bg-color').addEventListener('input', (e) => {
    selectedBgColor = e.target.value;
});

// Cropper Operations
document.getElementById('btn-rotate-left').addEventListener('click', () => cropper && cropper.rotate(-90));
document.getElementById('btn-rotate-right').addEventListener('click', () => cropper && cropper.rotate(90));
let scaleX = 1;
document.getElementById('btn-flip-h').addEventListener('click', () => {
    if (!cropper) return;
    scaleX = -scaleX;
    cropper.scaleX(scaleX);
});
document.getElementById('btn-reset-crop').addEventListener('click', () => cropper && cropper.reset());

/* STREAMING_CHUNK:Setting up layout rendering and step navigation... */
const step1Panel = document.getElementById('step-1-panel');
const step2Panel = document.getElementById('step-2-panel');
const step1Preview = document.getElementById('step-1-preview');
const step2Preview = document.getElementById('step-2-preview');

document.getElementById('go-to-step-2').addEventListener('click', () => {
    if (!cropper) {
        showToast("Please upload a photo first.");
        return;
    }

    try {
        const canvas = cropper.getCroppedCanvas({
            width: 900, 
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });

        if (!canvas) {
            showToast("Failed to render crop canvas. Try re-adjusting crop handles.");
            return;
        }

        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = canvas.width;
        bgCanvas.height = canvas.height;
        const ctx = bgCanvas.getContext('2d');

        ctx.fillStyle = selectedBgColor;
        ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
        ctx.drawImage(canvas, 0, 0);

        croppedImageDataUrl = bgCanvas.toDataURL('image/jpeg', 0.95);

        step1Panel.classList.add('hidden');
        step1Preview.classList.add('hidden');
        step2Panel.classList.remove('hidden');
        step2Preview.classList.remove('hidden');

        document.getElementById('step-nav-1').className = "px-3 py-1.5 bg-neutral-900 text-neutral-500 border border-neutral-800 flex items-center gap-2";
        document.getElementById('step-nav-2').className = "px-3 py-1.5 bg-white text-black font-bold border border-white flex items-center gap-2";

        renderPrintSheet();
    } catch (err) {
        console.error("Step 2 navigation error:", err);
        showToast("An error occurred while generating crop image.");
    }
});

document.getElementById('back-to-step-1').addEventListener('click', () => {
    step2Panel.classList.add('hidden');
    step2Preview.classList.add('hidden');
    step1Panel.classList.remove('hidden');
    step1Preview.classList.remove('hidden');

    document.getElementById('step-nav-1').className = "px-3 py-1.5 bg-white text-black font-bold border border-white flex items-center gap-2";
    document.getElementById('step-nav-2').className = "px-3 py-1.5 bg-neutral-900 text-neutral-500 border border-neutral-800 flex items-center gap-2";
});

document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to start over and reset all settings?')) {
        location.reload();
    }
});

// Quantity Modification Listeners
document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-target');
        const change = parseInt(e.currentTarget.getAttribute('data-change'));
        
        quantities[target] = Math.max(0, (quantities[target] || 0) + change);
        
        const elem = document.getElementById(`qty-${target}-val`);
        if (elem) elem.innerText = quantities[target];
        
        renderPrintSheet();
    });
});

paperSelect.addEventListener('change', renderPrintSheet);
lineStyleSelect.addEventListener('change', renderPrintSheet);

// Auto-fill Grid Capacity
document.getElementById('btn-fill-max').addEventListener('click', () => {
    const paper = PAPERS[paperSelect.value];
    const primaryPreset = PRESETS[selectedPresetKey];

    const itemW = toInches(primaryPreset.w, primaryPreset.unit);
    const itemH = toInches(primaryPreset.h, primaryPreset.unit);

    const margin = 0.25; 
    const gap = 0.08;    

    const availableW = paper.w - (margin * 2);
    const availableH = paper.h - (margin * 2);

    const cols = Math.floor((availableW + gap) / (itemW + gap));
    const rows = Math.floor((availableH + gap) / (itemH + gap));

    quantities.primary = Math.max(1, cols * rows);
    quantities['1x1'] = 0;
    quantities['2x2'] = 0;
    quantities['1.5x2'] = 0;

    document.getElementById('qty-primary-val').innerText = quantities.primary;
    if (document.getElementById('qty-1x1-val')) document.getElementById('qty-1x1-val').innerText = 0;
    if (document.getElementById('qty-2x2-val')) document.getElementById('qty-2x2-val').innerText = 0;
    if (document.getElementById('qty-1.5x2-val')) document.getElementById('qty-1.5x2-val').innerText = 0;

    renderPrintSheet();
    showToast(`Auto-filled sheet with ${quantities.primary} photo copies.`);
});

function toInches(val, unit) {
    return unit === 'mm' ? val / 25.4 : val;
}

/* STREAMING_CHUNK:Building live preview grid and high-res export functions... */
// Render Live Preview
function renderPrintSheet() {
    if (!croppedImageDataUrl) return;

    const paperKey = paperSelect.value;
    const paper = PAPERS[paperKey];
    const lineStyle = lineStyleSelect.value;

    document.getElementById('page-dim-badge').innerText = paper.name;

    const previewDPI = 150; 
    const canvasWidth = Math.round(paper.w * previewDPI);
    const canvasHeight = Math.round(paper.h * previewDPI);

    sheetCanvas.width = canvasWidth;
    sheetCanvas.height = canvasHeight;

    const container = document.getElementById('print-sheet-container');
    const maxPreviewWidth = 460;
    const containerWidth = Math.min(window.innerWidth - 60, maxPreviewWidth);
    const containerHeight = Math.round(containerWidth * (paper.h / paper.w));

    container.style.width = `${containerWidth}px`;
    container.style.height = `${containerHeight}px`;

    const ctx = sheetCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const img = new Image();
    img.onload = () => {
        let itemsToPlace = [];

        const pPreset = PRESETS[selectedPresetKey];
        const pW_in = toInches(pPreset.w, pPreset.unit);
        const pH_in = toInches(pPreset.h, pPreset.unit);

        for (let i = 0; i < quantities.primary; i++) {
            itemsToPlace.push({ w: pW_in, h: pH_in });
        }

        if (selectedPresetKey !== '1x1') {
            for (let i = 0; i < quantities['1x1']; i++) itemsToPlace.push({ w: 1, h: 1 });
        }
        if (selectedPresetKey !== '2x2') {
            for (let i = 0; i < quantities['2x2']; i++) itemsToPlace.push({ w: 2, h: 2 });
        }
        if (selectedPresetKey !== '1.5x2') {
            for (let i = 0; i < quantities['1.5x2']; i++) itemsToPlace.push({ w: 1.5, h: 2 });
        }

        const margin = Math.round(0.25 * previewDPI);
        const gap = Math.round(0.08 * previewDPI);

        let currX = margin;
        let currY = margin;
        let rowMaxH = 0;

        itemsToPlace.forEach((item) => {
            const itemW_px = Math.round(item.w * previewDPI);
            const itemH_px = Math.round(item.h * previewDPI);

            if (currX + itemW_px > canvasWidth - margin) {
                currX = margin;
                currY += rowMaxH + gap;
                rowMaxH = 0;
            }

            if (currY + itemH_px <= canvasHeight - margin) {
                ctx.drawImage(img, currX, currY, itemW_px, itemH_px);

                if (lineStyle !== 'none') {
                    ctx.strokeStyle = '#222222';
                    ctx.lineWidth = 1;
                    
                    if (lineStyle === 'dashed') {
                        ctx.setLineDash([4, 4]);
                    } else {
                        ctx.setLineDash([]);
                    }

                    ctx.strokeRect(currX, currY, itemW_px, itemH_px);
                    ctx.setLineDash([]);
                }

                currX += itemW_px + gap;
                if (itemH_px > rowMaxH) rowMaxH = itemH_px;
            }
        });
    };
    img.src = croppedImageDataUrl;
}

// Generate High-Resolution 300DPI Canvas
async function buildHighResCanvas() {
    const paperKey = paperSelect.value;
    const paper = PAPERS[paperKey];
    const lineStyle = lineStyleSelect.value;

    const printDPI = 300;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(paper.w * printDPI);
    canvas.height = Math.round(paper.h * printDPI);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.src = croppedImageDataUrl;
    await new Promise((resolve) => { img.onload = resolve; });

    let itemsToPlace = [];
    const pPreset = PRESETS[selectedPresetKey];
    const pW_in = toInches(pPreset.w, pPreset.unit);
    const pH_in = toInches(pPreset.h, pPreset.unit);

    for (let i = 0; i < quantities.primary; i++) itemsToPlace.push({ w: pW_in, h: pH_in });
    if (selectedPresetKey !== '1x1') {
        for (let i = 0; i < quantities['1x1']; i++) itemsToPlace.push({ w: 1, h: 1 });
    }
    if (selectedPresetKey !== '2x2') {
        for (let i = 0; i < quantities['2x2']; i++) itemsToPlace.push({ w: 2, h: 2 });
    }
    if (selectedPresetKey !== '1.5x2') {
        for (let i = 0; i < quantities['1.5x2']; i++) itemsToPlace.push({ w: 1.5, h: 2 });
    }

    const margin = Math.round(0.25 * printDPI);
    const gap = Math.round(0.08 * printDPI);
    let currX = margin;
    let currY = margin;
    let rowMaxH = 0;

    itemsToPlace.forEach((item) => {
        const itemW_px = Math.round(item.w * printDPI);
        const itemH_px = Math.round(item.h * printDPI);

        if (currX + itemW_px > canvas.width - margin) {
            currX = margin;
            currY += rowMaxH + gap;
            rowMaxH = 0;
        }

        if (currY + itemH_px <= canvas.height - margin) {
            ctx.drawImage(img, currX, currY, itemW_px, itemH_px);

            if (lineStyle !== 'none') {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                if (lineStyle === 'dashed') ctx.setLineDash([8, 8]);
                ctx.strokeRect(currX, currY, itemW_px, itemH_px);
                ctx.setLineDash([]);
            }

            currX += itemW_px + gap;
            if (itemH_px > rowMaxH) rowMaxH = itemH_px;
        }
    });

    return canvas;
}

// Direct Print Handler
document.getElementById('btn-direct-print').addEventListener('click', () => {
    if (!croppedImageDataUrl) return;
    window.print();
});

// PDF Export Handler
document.getElementById('btn-download-pdf').addEventListener('click', async () => {
    if (!croppedImageDataUrl) return;

    try {
        const { jsPDF } = window.jspdf;
        const paperKey = paperSelect.value;
        const paper = PAPERS[paperKey];

        const printCanvas = await buildHighResCanvas();

        const pdf = new jsPDF({
            orientation: paper.h > paper.w ? 'portrait' : 'landscape',
            unit: 'in',
            format: paperKey === 'a4' ? 'a4' : [paper.w, paper.h]
        });

        const printDataUrl = printCanvas.toDataURL('image/jpeg', 0.98);
        pdf.addImage(printDataUrl, 'JPEG', 0, 0, paper.w, paper.h);
        pdf.save(`ID_Photos_${paperKey}_${Date.now()}.pdf`);
        showToast("PDF document downloaded.");
    } catch (err) {
        console.error("PDF Export Error:", err);
        showToast("Failed to generate PDF file.");
    }
});

// PNG Export Handler
document.getElementById('btn-download-png').addEventListener('click', async () => {
    if (!croppedImageDataUrl) return;

    try {
        const paperKey = paperSelect.value;
        const printCanvas = await buildHighResCanvas();

        const link = document.createElement('a');
        link.download = `ID_Photos_${paperKey}_${Date.now()}.png`;
        link.href = printCanvas.toDataURL('image/png');
        link.click();
        showToast("PNG image downloaded.");
    } catch (err) {
        console.error("PNG Export Error:", err);
        showToast("Failed to save PNG image.");
    }
});

// App Entry Initialization
window.addEventListener('load', () => {
    initCropper();
    updatePrimaryLabel();
    updateMixerVisibility();
});