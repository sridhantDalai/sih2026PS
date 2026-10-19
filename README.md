# Smart India Hackathon (SIH) 2026 — Problem Statements Explorer

A modern, fast, responsive explorer for all **Smart India Hackathon (SIH) 2026 Problem Statements**. Built with React 19, Vite, and custom CSS following high-contrast, tactile design principles.

![SIH 2026 Explorer](public/favicon.svg)

---

## 🌟 Key Features

- **Complete Dataset**: Browse, search, and analyze all 265 official SIH 2026 problem statements.
- **Fast Search & Instant Filtering**:
  - Full-text keyword search across titles, descriptions, PS IDs, themes, organizations, and departments.
  - Category filter pills (**All**, **Software**, **Hardware**).
  - Theme dropdown filter covering all SIH categories (AI, Clean & Green Tech, Smart Automation, Healthcare, etc.).
  - Organization / Ministry filter dropdown.
  - Multi-criteria sorting (PS ID Ascending/Descending, Title A-Z, Submitted Ideas).
- **Intelligent Structured Modal**:
  - In-depth problem statement details.
  - **Zero Word Modification**: 100% verbatim preservation of original descriptions.
  - Structured visual hierarchy with standalone subheadings (`Background & Description`, `Expected Outcomes`, `Gobardhan`, etc.).
  - Automatic detection and clean rendering of inline colon requirement lists into formatted bullet points (`<ul><li>`).
  - Contextual Organization & Ministry badges displaying ideas submitted and deadlines.
- **Slush Sticker-Book Aesthetic**:
  - Bold, tactile design with 1px solid carbon borders, vibrant pastel fills, pill badges, and smooth animations.
  - Responsive layout optimized for mobile screens (375px+), tablets, and high-resolution desktops.
- **Vercel & Production Ready**: Fully optimized build configuration and SPA rewrites.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/)
- **Bundler & Dev Server**: [Vite 8](https://vite.dev/)
- **Styling**: Vanilla CSS (CSS Variables, Flexbox, CSS Grid)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18+ recommended)
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/sridhantDalai/sih2026PS.git

# Navigate to the project directory
cd sih2026PS

# Install dependencies
npm install
```

### Development Server

Start the local development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

Compile and bundle the project for production:

```bash
npm run build
```

The production output is saved in the `dist/` directory.

### Previewing Production Build

```bash
npm run preview
```

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

---

## ☁️ Deployment to Vercel

This repository includes a [`vercel.json`](vercel.json) configuration file that handles single-page app (SPA) rewrites automatically.

### One-Click Deploy via Vercel CLI

```bash
npm i -g vercel
vercel
```

Or import the repository directly in the [Vercel Dashboard](https://vercel.com/new).

---

## 📄 License

This project is licensed under the MIT License.
