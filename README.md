Markdown
# Photo ID & Passport Print Generator

A lightweight, privacy-focused web application designed to arrange, crop, and layout photos (1x1, 2x2, 35x45mm, and custom sizes) onto printable photo sheets (4x6, 5x7, Letter, A4) with high-resolution 300 DPI exports.

Built with a sharp, monochromatic dark interface, zero rounded corners, and dynamic layout controls.

---

## Key Features

- **Interactive Photo Cropping:** Easily upload, position, and crop images to exact photo aspect ratios.
- **Preset & Custom Sizing:**
  - 2" x 2" (US Passport / Visa)
  - 1" x 1"
  - 1.5" x 2"
  - 2" x 3"
  - 35mm x 45mm (EU / UK / Asian Passports)
  - 30mm x 40mm
  - Custom size dimensions (in inches or mm)
- **Multi-Size Sheet Mixing:** Place different photo sizes (e.g., 2x2 with additional 1x1 photos) onto a single print sheet.
- **Custom Spacing & Margins:** Fine-tune gaps between individual photos and outer page margins in millimeters.
- **High-Resolution Exports:** Generates crisp 300 DPI files ready for printing:
  - High-res PDF download
  - Lossless PNG / JPEG download
  - Direct browser printing with smart print media queries
- **Cutting Guides:** Toggle between dashed lines, solid lines, or borderless cut marks.
- **100% Client-Side:** Photos are processed locally inside your browser—no images are uploaded to any external server.

---

## File Structure

id-photo-generator/
│
├── index.html    # Application structure & markup
├── styles.css    # Monochromatic dark theme & print media styles
├── app.js        # Crop engine, canvas layout calculations & export handlers
└── README.md     # Project documentation
How to Run Locally
Option 1: Direct File Opening (Easiest)
Simply double-click index.html to open it directly in any modern browser (Chrome, Firefox, Edge, Safari).

Option 2: Run a Local Web Server (Recommended)
Running via a local web server ensures optimal performance and canvas rendering:

Using Python (Built-in)
Open your terminal or command prompt in the project folder:

Bash
cd path/to/id-photo-generator
Start the HTTP server:

Bash
python -m http.server 8000
Open your browser and go to http://localhost:8000.

Using VS Code Live Server
Open the project folder in VS Code.

Install the Live Server extension.

Right-click index.html and choose Open with Live Server.

How to Use
Upload Photo: Click or drag-and-drop your photo into the drop zone.

Crop Image: Adjust the crop region to fit your subject.

Select Size: Choose your target photo preset (e.g., 2x2) or enter custom dimensions.

Configure Sheet: Choose your paper size (e.g., 4x6 or A4) and adjust photo spacing (gap) or outer page margins.

Export & Print: Download the sheet as a high-res PDF or image file, or click Print Direct to print immediately from your browser.

Tech Stack
HTML5 & CSS3

JavaScript (ES6+)

Tailwind CSS (Utility-based styling)

Cropper.js (Interactive cropping)

jsPDF (Vector PDF output)

Feather Icons (Monochrome UI icons)
