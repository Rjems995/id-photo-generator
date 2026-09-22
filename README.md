# IDPRINT.STUDIO - Photo ID & Passport Print Sheet Builder

A lightweight, privacy-focused client-side web application designed to arrange, crop, and layout passport photos (1x1, 2x2, 35x45mm, and custom sizes) onto printable photo sheets (4x6, 5x7, US Letter, A4) with high-resolution 300 DPI exports.

Built with a sharp monochromatic dark interface, zero rounded corners, header branding, an SVG browser tab favicon, and customizable multi-column layout algorithms.

---

## Key Features

- **Interactive Photo Cropping:** Upload, position, and crop images to precise passport aspect ratios.
- **Preset & Custom Dimensions:**
  - 2" x 2" (US Passport / Visa)
  - 1" x 1"
  - 1.5" x 2"
  - 2" x 3"
  - 35mm x 45mm (EU / UK / Asian Passports)
  - 30mm x 40mm
  - Custom size dimensions (in inches or mm)
- **Flexible Arrangement & Layout Modes:**
  - **Auto Grid:** Automatically packs the sheet to maximize photo capacity.
  - **Top-to-Bottom 1x1 Column + 2x2 Side Grid:** Renders a vertical stack of 1x1 photos down the left side with 2x2 passport photos on the right.
  - **Split Columns:** Divides the page into 1x1 left-column stacks and 2x2 right-column stacks.
  - **Top Row 1x1:** Places a full row of 1x1 photos across the top with 2x2 photos underneath.
- **Multi-Size Sheet Mixing:** Mix additional 1x1 or 1.5x2 photos onto the same sheet in Auto Grid mode.
- **Custom Spacing & Margins:** Fine-tune gaps between individual photos and outer sheet margins in millimeters.
- **High-Resolution Exports:** Generates 300 DPI outputs ready for printing:
  - Vector PDF download
  - Lossless PNG / JPEG download
  - Direct browser printing with dedicated `@media print` rules
- **Cutting Guides:** Toggle between dashed lines, solid lines, or borderless cut marks.
- **100% Local Privacy:** Photos are processed entirely inside your browser via Canvas API—no images are uploaded to any server.

---

## File Structure

```text
id-photo-generator/
│
├── index.html    # Application structure, header branding logo & SVG favicon
├── styles.css    # Monochromatic dark theme & print media overrides
├── app.js        # Crop engine, dynamic multi-column layout algorithms & export handlers
└── README.md     # Project documentation
How to Run Locally
Option 1: Direct Browser Launch
Double-click index.html to open it directly in modern web browsers (Chrome, Firefox, Edge, Safari).

Option 2: Run a Local Web Server (Recommended)
Running via a local web server ensures optimal performance and canvas rendering:

Using Python (Built-in)
Open your terminal or command prompt in the project folder:

Bash
cd path/to/id-photo-generator
Start the HTTP server:

Bash
python -m http.server 8000
Open your browser and navigate to http://localhost:8000.

Using VS Code Live Server
Open the project folder in VS Code.

Install the Live Server extension.

Right-click index.html and choose Open with Live Server.

How to Use
Upload Photo: Click or drag-and-drop your photo into the drop zone.

Crop Image: Adjust the crop boundary box over your subject.

Select Size & Mode: Choose your target photo preset (e.g., 2x2) and select your preferred layout mode (e.g., Top-to-Bottom 1x1 Column + 2x2 Side Grid).

Configure Spacing: Choose your paper size (e.g., 4x6 or A4) and adjust spacing gaps or sheet margins using the sliders.

Export & Print: Download as a 300 DPI PDF/PNG file, or click Print Direct to print immediately from your browser.

Tech Stack
HTML5 & CSS3

JavaScript (ES6+)

Tailwind CSS (Utility-based styling)

Cropper.js (Interactive cropping engine)

jsPDF (Vector PDF generation)

Feather Icons (Monochrome UI icons)

License
MIT License. Free to use, modify, and distribute.