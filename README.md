# Slide-Syncer Frontend  
Frontend for the Slide-Syncer / CodeKiwi student view.

## Overview  
This is the React + TypeScript frontend of the Slide-Syncer system, used in the CodeKiwi platform.  
- Student view: left side shows synced slides, right side shows the Monaco code editor + terminal.  
- Teacher view (via separate repo) controls slide navigation, student views, live code preview.  
- Built with React and deployed (e.g., on Vercel).  
- Communicates with backend via WebSocket for slide sync, and REST APIs for session & upload.  
- Accepts slides (PDF → image) from backend, displays and syncs them across students.

## Getting Started  
### Prerequisites  
- Node.js v16+ (or latest LTS)  
- npm, yarn, or pnpm (we use pnpm for production builds)  
- `bun` can be used in development if configured (per monorepo)  

### Installation  
```bash
git clone https://github.com/JayantDeveloper/slide-syncer-frontend.git
cd slide-syncer-frontend
pnpm install
