# PM Multi-Tool

A comprehensive client-only web application designed for Product Managers to organize features, manage roadmaps, write PRDs, and track stakeholders — all running securely in your browser without requiring a backend database.

## Key Features

- **Feature Planner**: Robust Kanban and List views to manage feature lifecycles (Draft, In Development, QA, Done) with built-in RICE scoring.
- **Dependency Management**: Track "Blocked By" and "Blocks" relationships between features.
- **Knowledge Hub**: Write PRDs, Roadmap plans, OKRs, and custom notes with full Markdown support.
- **Local-First Architecture**: All data is saved securely inside your browser's IndexedDB. No servers, no accounts, no latency.
- **Export / Import**: Back up and restore your entire workspace instantly as a JSON file. Export table data to CSV.

## Technology Stack

- **Framework**: Next.js 16 (App Router) / React 19
- **State Management**: Zustand (with IndexedDB persistence via `idb-keyval`)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript

---

## Prerequisites

Before installing the app, you need to have **Node.js** installed on your system.
- **Minimum required version**: Node.js v20.9.0 or newer.

You can verify your Node.js version by running:
```bash
node -v
```

*(If you need to install Node.js, we recommend downloading it from [nodejs.org](https://nodejs.org/en/) or using a version manager like `nvm` / `nvm-windows`)*.

---

## 🚀 Setup Instructions

### For Windows

We highly recommend using Windows Subsystem for Linux (WSL) for the best development experience, but you can also run it natively in PowerShell.

#### Option A: Native Windows (PowerShell or Command Prompt)
1. Open PowerShell and navigate to the project directory:
   ```powershell
   cd path\to\pm-multi-tool
   ```
2. Install the dependencies:
   ```powershell
   npm install
   ```
3. Start the development server:
   ```powershell
   npm run dev
   ```

#### Option B: Windows Subsystem for Linux (WSL)
1. Open your WSL terminal (e.g., Ubuntu).
2. Navigate to your project folder on the Windows mount:
   ```bash
   cd /mnt/c/path/to/pm-multi-tool
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### For Linux / macOS
1. Open your terminal and navigate to the directory:
   ```bash
   cd /path/to/pm-multi-tool
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 💻 Running the App

Once you've run `npm run dev`, open your web browser and navigate to:

```text
http://localhost:3000
```

Any changes you make to the source code will automatically reflect in the browser.

---

## 🛠️ Building for Production

If you want to run an optimized production version of the app (which runs faster and validates all TypeScript code):

1. **Build the application**:
   ```bash
   npm run build
   ```
2. **Start the production server**:
   ```bash
   npm start
   ```
   *(The app will still be available at http://localhost:3000)*

## Troubleshooting

### "Failed to load chunk" or Turbopack caching errors
If you rename files or make large structural changes and encounter weird rendering errors (like `ChunkLoadError`), delete the cached `.next` directory to force a clean build.

**Windows PowerShell**:
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

**Linux / macOS / WSL**:
```bash
rm -rf .next
npm run dev
```
