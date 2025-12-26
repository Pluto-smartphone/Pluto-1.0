# Pluto

A modern, full-featured e-commerce application built with React, TypeScript, and Vite, powered by Supabase for the backend.

## 🚀 Features

-   **Browse Products:** Explore a wide range of products with detailed views.
-   **Shopping Cart:** Manage items in your cart with a seamless checkout experience.
-   **Wishlist:** Save your favorite items for later.
-   **Selling Platform:** Interface for users to list items for sale.
-   **Secure Payments:** Integrated payment processing flow.
-   **Authentication:** User authentication powered by Supabase.
-   **Internationalization:** Multi-language support.
-   **Responsive Design:** Beautiful, mobile-first UI built with Tailwind CSS and Shadcn UI.

## 🛠️ Tech Stack

-   **Frontend:** [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/) (Radix UI)
-   **State Management:** React Context (Cart, Wishlist, Language), [Tanstack Query](https://tanstack.com/query/latest)
-   **Routing:** [React Router](https://reactrouter.com/)
-   **Backend:** [Supabase](https://supabase.com/) (Database, Auth)
-   **Icons:** [Lucide React](https://lucide.dev/)

## 📦 Getting Started

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm or bun

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd Pluto-1.0
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    bun install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    # or
    bun dev
    ```

4.  Open [http://localhost:8080](http://localhost:8080) to view the app.

## 🏗️ Project Structure

```
src/
├── components/         # Reusable UI components (Shadcn UI, Layouts)
├── contexts/          # React Context providers (Cart, Wishlist, Language)
├── data/              # Static data (e.g., products.ts)
├── hooks/             # Custom React hooks
├── integrations/      # Third-party integrations (Supabase)
├── lib/               # Utility functions
├── pages/             # Application pages (Routes)
└── supabase/          # Supabase configurations and functions
```

## 📜 Scripts

-   `npm run dev`: Start the development server on port 8080.
-   `npm run build`: Build the application for production.
-   `npm run lint`: Run ESLint to check for code quality issues.
-   `npm run preview`: Preview the production build locally.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
