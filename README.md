# CodeKiwi Frontend (Slide-Syncer)

> The interactive classroom frontend for [CodeKiwi](https://codekiwi.tech) — a “Peardeck for coding” that syncs slides and live code between teachers and students.

## Overview
This is the React + TypeScript frontend powering CodeKiwi’s live classroom experience.  
It provides:
- **Student View** — synced slides on the left, Monaco code editor + terminal on the right.  
- **Teacher View** — slide navigation controls, live student code previews, and session management.  
- Real-time updates via WebSocket connection to the backend.  
- Responsive UI designed for teaching coding lessons in real time.

Part of the CodeKiwi ecosystem:
- 🌐 [codekiwi.tech](https://codekiwi.tech)
- 🖥 [Backend (API + WebSocket)](https://github.com/JayantDeveloper/slide-syncer-backend)
- 💼 [Commercial Site / Landing Page](https://github.com/JayantDeveloper/codekiwi-site)

---

## Getting Started

### Prerequisites
- Node.js ≥ 16  
- pnpm, yarn, or npm  
- Backend running locally or on Render/EC2

### Installation
```bash
git clone https://github.com/JayantDeveloper/slide-syncer-frontend.git
cd slide-syncer-frontend
pnpm install
