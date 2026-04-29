# Studio Ishcha Website Template

This is a sample website template for Studio Ishcha. It presents the studio as an interactive, axonometric floor-plan map where visitors enter the space, select labelled nodes, and view related studio content alongside the graphic.

The current prototype includes:

- A minimal multilevel architectural map graphic.
- An entry interaction with a human figure.
- Clickable nodes for Projects, About, Journal, and Contact.
- Animated movement between nodes, including stair-based routes between levels.
- Responsive layouts for desktop and mobile.

## Requirements

- Node.js 20 or newer is recommended.
- npm, included with Node.js.

## Dependencies

Runtime dependencies:

- React
- React DOM
- Framer Motion

Development dependencies:

- Vite
- ESLint
- `@vitejs/plugin-react`

## Setup

Install dependencies:

```bash
npm install
```

## Run Locally

Start the development server:

```bash
npm run dev
```

On Windows PowerShell, if script execution blocks `npm`, use:

```powershell
npm.cmd run dev
```

Then open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

To test on a phone on the same Wi-Fi network:

```powershell
npm.cmd run dev -- --host 0.0.0.0
```

Then open `http://YOUR_PC_LOCAL_IP:5173` on the phone.

## Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Lint

Run ESLint:

```bash
npm run lint
```

## Project Structure

```text
src/
  App.jsx
  main.jsx
  index.css
  components/
    Map.jsx
```

`Map.jsx` currently contains the interactive map experience. `index.css` contains the visual system, responsive layout, and map styling.
