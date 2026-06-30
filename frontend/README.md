# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

##How to run locally yourself
#Terminal 1 — Backend (from uniserve_project/backend):

$env:DB_URL='jdbc:postgresql://localhost:5432/uniconnect_db'
$env:DB_USER='postgres'
$env:DB_PASS='24681357'
$env:JWT_SECRET='yourVeryLongSecretKeyThatIsAtLeast32CharactersLong123456'
.\mvnw.cmd spring-boot:run
#Terminal 2 — Frontend (from uniserve_project/frontend):

npm install
npm run dev
Then open http://localhost:5173 (or whatever port Vite prints).

Your PostgreSQL 18 service is already running with uniconnect_db created. Docker is installed and running.
