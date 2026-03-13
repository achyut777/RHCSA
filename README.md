# RHCSA Master Hub

Advanced RHCSA training website focused on exam-ready Linux administration workflows, interactive learning, and personal branding.

## Quick Highlights

- Fully interactive single-page RHCSA study portal
- Personalized profile section for Achyut Hadavani (RHCSA 300/300)
- Search, progress tracking, theme switcher, and keyboard shortcuts
- Advanced UI system with reusable design tokens and component blocks
- Practical command-driven chapter content for hands-on revision

## Live Profile

- Name: Achyut Hadavani
- Certification: Red Hat Certified System Administrator (RHCSA)
- Score: 300/300
- LinkedIn: https://www.linkedin.com/in/achyut-hadavani/
- GitHub: https://github.com/achyut777

## Core Features

### Learning Experience

- Structured chapter navigation for major RHCSA domains
- Focused command snippets and exam workflows
- Progress persistence via browser localStorage
- Scroll spy and active section detection

### Developer Experience

- Clean separation of concerns (HTML, CSS, JS)
- Component-style CSS classes for reusable UI blocks
- Lightweight JavaScript with no framework dependency
- Easy to customize and extend with new sections

### User Experience

- Responsive layout for desktop and mobile
- Dark/light mode support
- Instant in-page search across section text
- Copy-to-clipboard actions for command blocks

## Architecture

The project uses a static frontend architecture:

- Structure layer: semantic HTML in website/index.html
- Presentation layer: design system and responsive rules in website/css/styles.css
- Behavior layer: interaction logic in website/js/app.js

This makes deployment simple while keeping the codebase easy to maintain.

## Project Structure

```text
RHCSA/
|- README.md
|- RHCSA-Notes.md
|- website/
|  |- index.html
|  |- css/
|  |  |- styles.css
|  |- js/
|     |- app.js
```

## Local Setup

### 1) Clone Repository

```bash
git clone https://github.com/achyut777/RHCSA.git
cd RHCSA
```

### 2) Run Website

Open website/index.html in your browser.

Optional (recommended for local dev): use VS Code Live Server extension for auto-refresh.

## Keyboard Shortcuts

- / : focus search
- ? : open shortcut modal
- Esc : close modal/search
- Alt + B : back to top

## Tech Stack

- HTML5
- CSS3 (custom properties, responsive layout, animations)
- Vanilla JavaScript (ES6+)
- Font Awesome
- highlight.js

## Performance and Maintainability Notes

- No heavy frameworks, fast initial load
- Modular content sections for easy chapter updates
- CSS variable-driven theming for visual consistency
- Local-only state (no backend dependency)

## Roadmap

- Add downloadable PDF quick revision sheet
- Add lab challenge mode with timed tasks
- Add printable command cheat cards
- Add section completion export/import
- Add optional multi-language support

## Contribution Workflow

1. Fork this repository
2. Create a feature branch
3. Make changes and test in browser
4. Commit with clear messages
5. Open a pull request

## License

This repository currently has no explicit license file. Add a LICENSE file if you want defined reuse permissions.

## Repository

- Main Repo: https://github.com/achyut777/RHCSA
