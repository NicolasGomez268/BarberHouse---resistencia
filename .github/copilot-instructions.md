# Instrucciones del proyecto — Peluquería App

## Stack
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- DB: Firebase Firestore
- Auth: Firebase Authentication
- Validación: Zod
- Arquitectura backend: Clean Architecture (router → controller → service → repository)
- Arquitectura frontend: Feature-Sliced Design simplificado

## Reglas absolutas
- SIEMPRE TypeScript estricto, nunca `any`
- SIEMPRE usar los tipos de `src/types/index.ts` como fuente de verdad
- NUNCA mezclar lógica de negocio en componentes React
- SIEMPRE manejar estados: loading, error, vacío
- Los mocks están en `src/mocks/` y se activan con `VITE_USE_MOCKS=true`
- El patrón de hook es: si USE_MOCKS → retorna mock, si no → llama al API real
- Tailwind para estilos, sin CSS modules ni styled-components
- Colores del sistema: fondo #0a0a0a, superficie #1a1a2e, acento #f5c518
- Sin vista pública, todo requiere login

## Estructura de carpetas
Ver README.md para la estructura completa.
