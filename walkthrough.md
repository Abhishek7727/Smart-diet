# Liquid Glass UI Overhaul

## Overview
The Smart-Diet app has been overhauled with a futuristic "Liquid Glass" dark theme. This design leverages transparency, neon accents, and blur effects to create a premium, modern user experience.

## Key Changes

### 1. Liquid Glass Dark Theme
- **Global Palette**: 
  - Background: Deep Dark Blue/Black (`#050511`)
  - Glass Surface: Translucent Dark Slate (`rgba(30, 41, 59, 0.7)`)
  - Neon Accents: Lime (`#D4FF00`), Orange (`#FF5500`), Cyan (`#00FFFF`)
- **Styling**: 
  - `colors.glass`: Standardized glass effect with blur-compatible transparency and subtle borders.
  - `colors.shadow`: Neon glow shadows for active elements.

### 2. Navigation
- **Floating Bottom Bar**: A completely redesigned, floating bottom navigation bar that sits above the content, mimicking the modern "home indicator" style but with rich glassmorphism.
- **Active States**: Tabs glow with neon light when active.

### 3. Screen Refactors
- **Dashboard (`index.tsx`)**: 
  - Metrics and Meal cards now use the glass theme.
  - Progress bars use neon gradients.
- **Stats (`stats.tsx`)**:
  - Charts are integrated with transparent backgrounds.
  - Stat cards float with glass backgrounds.
- **Profile (`profile.tsx`)**:
  - Avatar, stats, and achievements use consistent glass containers.
- **Settings (`settings.tsx`)**:
  - **Removed Dark Mode Toggle**: The app is now Dark Mode by default.
  - Grouped settings into glass containers.
  - Improved API Key input UX.
- **Explore (`explore.tsx`)**:
  - Updated to match the design system.
- **AI Recommendations**:
  - Recommendations modal uses the full liquid glass theme for a cohesive experience.

## Technical Details
- **Colors.ts**: The single source of truth for the new theme.
- **Expo Blur**: Utilized for real-time background blurring in navigation.

## Verification
- All main flows (Dashboard -> Stats -> Profile -> Settings) have been updated.
- AI Recommendations flow is visually consistent.
