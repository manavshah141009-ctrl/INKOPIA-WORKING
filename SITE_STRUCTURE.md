# Inkopia Experience - Site Structure & Features

This document provides a comprehensive overview of the Inkopia Experience codebase, outlining its architecture, features, and technical implementation.

## 🏗 Architecture Overview

The project is a full-stack application designed with a "Headless CMS" philosophy. It allows for dynamic control over content, themes, and page structures through an integrated Admin Dashboard.

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI.
- **Backend**: Node.js, Express, MongoDB (with Local JSON fallback).
- **Storage**: Firebase (for assets) & Local Server Storage.
- **3D Rendering**: React Three Fiber (Three.js).

---

## 🎨 Frontend Structure

### 🛣 Routing (`src/App.tsx`)
| Path | Component | Description |
| :--- | :--- | :--- |
| `/` | `Index.tsx` | Luxury Landing Page with 3D background. |
| `/signup` | `SignUp.tsx` | Authentication / Account creation. |
| `/dashboard` | `Dashboard.tsx` | User-facing portal. |
| `/admin` | `AdminDashboard.tsx` | System Architect's Command Center. |
| `/p/:slug` | `DynamicPage.tsx` | Custom pages created via the CMS. |
| `*` | `NotFound.tsx` | 404 Error page. |

### 🧩 Core Components
- **`FountainPen3D`**: Interactive 3D fountain pen background using `@react-three/fiber`.
- **`SiteContext`**: The brain of the site. Fetches content/theme from the API and injects them into the UI via CSS variables.
- **`OrderContext`**: Manages user orders and service interactions.
- **`VaultOverlay`**: High-end UI overlay for specific interactions.

---

## 🛠 Admin Features (The Architect's Dashboard)

The Admin Dashboard (`/admin`) is divided into several specialized modules:

### 1. Control Room (Orders)
- View and manage incoming service commissions.
- Track client requests and status.

### 2. Content Engine (`ContentEditor.tsx`)
- **Hero Section**: Edit subheadings and global pen assets.
- **The Concierge**: Modify headings and body text for the concierge section.
- **The White-Glove Ritual**: Dynamically add/edit steps in the refilling ceremony.
- **Commission**: Update featured pen brands and call-to-action text.

### 3. Visual Identity (`ThemeController.tsx`)
- **Live Theme Switching**: Real-time updates to Background, Text (Ink Green), and Accent (Gold) colors.
- **Typography Control**: Change primary (Serif) and secondary (Sans) fonts.
- **UI Styling**: Adjust border radius, widths, and styles globally.

### 4. Architecture (Backend Editor)
- Directly interact with the Dynamic Schema system.
- Manage collections and data structures without writing code.

### 5. Ink Vault & Agent Logic
- **Ink Manager**: Catalog of available luxury inks.
- **Agent Manager**: Configure logic for specialists/agents.

---

## ⚙️ Backend API (`server/`)

### 🛰 API Endpoints
- **`/api/auth`**: User authentication and session management.
- **`/api/schemas`**: CRUD operations for dynamic data structures.
- **`/api/data`**: Fetching and updating content stored under specific schemas.
- **`/api/upload`**: Handles image and asset uploads to Firebase/Local storage.

### 💾 Data Persistence
The server uses a **Hybrid Storage Strategy**:
1. **Primary**: MongoDB Atlas (for production scalability).
2. **Fallback**: Local JSON files (`server/data/sitedata.json`) for zero-config local development.

---

## ✨ Key Features

- **Luxury Aesthetic**: Heavy use of "Ink Green" and "Gold" accents, serif typography, and generous whitespace.
- **Surgical Customization**: Nearly every text string and color on the landing page is editable via the admin panel.
- **Responsive Design**: Mobile-optimized layouts with a specialized `use-mobile` hook.
- **3D Interactivity**: The 3D pen responds to user environment/scroll (implemented via Three.js).
- **Dynamic Pages**: Admin can create new routes (e.g., `/p/privacy-policy`) with a rich-text editor.

---

## 🛠 Tech Stack Details

- **Styling**: Tailwind CSS + `lucide-react` icons.
- **Components**: Shadcn UI (Radix UI primitives).
- **Animations**: Framer Motion + CSS Transitions.
- **State/Data**: TanStack Query (React Query) for API synchronization.
- **Validation**: Zod for schema validation.
- **Forms**: React Hook Form.
