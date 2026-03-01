# Scandiweb Junior Full Stack Developer Test

E-commerce SPA with product listing, product details (PDP), and cart overlay. Backend: PHP 8.1+ with GraphQL (no frameworks). Frontend: Vite + React.

---

## Live app & repository

- **Live app (no password):** Product Listing Page and Product Details Page are available **without a password** at:
  - **URL:** [http://165.227.98.170/](http://165.227.98.170/)
- **Repository:** [GitLab](https://gitlab.com/YOUR_USERNAME/YOUR_REPO_NAME) *(replace with your GitLab project URL)*
- **Auto QA:** Test the live URL at [http://165.227.98.170/](http://165.227.98.170/). Screenshot of “Passed” Auto QA:

  ![Auto QA Passed](docs/auto-qa-passed.png)

  *(Add your screenshot as `docs/auto-qa-passed.png` or link it above.)*

---

## Backend (PHP)

### Requirements

- PHP 7.4+ (or 8.1+)
- MySQL 5.6+
- Composer

### Setup

1. Copy `.env.example` to `.env` and set your database credentials.
2. Create the database and load schema:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
3. Install dependencies and seed data:
   ```bash
   composer install
   php database/seed.php
   ```
4. Point your web server document root to the `public` directory, or run PHP built-in server:
   ```bash
   php -S localhost:80 -t public
   ```

GraphQL endpoint: `POST /graphql`

## Frontend (React)

### Setup

1. Install dependencies:
   ```bash
   cd frontend && npm install
   ```
2. Create `.env` in `frontend/` if the API is not on the same origin:
   ```
   VITE_GRAPHQL_URL=http://localhost/graphql
   ```
3. Run dev server (proxies `/graphql` to backend):
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
   Serve `frontend/dist` or point your PHP server to it.

## Data & Automation

- Product listing and product details pages are available **without a password** at the live URL above.
- Auto QA test URL: [http://165.227.98.170/](http://165.227.98.170/)
- Required `data-testid` attributes are implemented for header, cart overlay, product cards, and PDP as per the task.

## Project structure

- `public/index.php` – Entry point, routing, GraphQL handler
- `src/Controller/` – GraphQL controller
- `src/Config/` – Database config
- `src/Model/` – OOP models (Category, Product, Attribute with polymorphism)
- `src/Repository/` – Data access
- `src/GraphQL/` – Schema, types, resolvers (attributes resolved via dedicated resolver)
- `database/` – MySQL schema, seed data, seed script
- `frontend/` – Vite + React SPA
