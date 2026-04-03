# Nexus Tasks 🎯

Una aplicación de lista de tareas minimalista y profesional en Dark Mode, equipada con una API RESTful construida en Node.js y un frontend impulsado por React + Vite.

## Características

- 🌌 **Diseño Premium**: Interfaz en Dark Mode con efectos Glassmorphism proporcionado por TailwindCSS V4.
- 🎯 **Focus Mode**: Resalta la tarea actual con animaciones en azul interactivo y desenfoca las demás prioridades.
- 🚦 **Semáforo Visual**: Priorización en colores vibrantes según su estado de urgencia.
- ⏳ **Cuenta Atrás**: Temporizadores automáticos basados en fechas límite configuradas.
- 📡 **Backend en Node.js**: Toda tu data se sincroniza a un endpoint REST impulsado por **Express** que conserva las tareas en un gestor local (`data.json`).
- ⚡ **Respuestas Interactivas**: Micro-animaciones para el montaje y destrucción de tareas gestionadas por **Framer Motion**.
- 📱 **Responsivo**: Se adapta fluidamente a iPhone, iPad, Mac y otras pantallas sin romper el renderizado en rejilla.

## Instalación y Uso Local

Para levantar el entorno local interactivo, asegúrate de tener Node.js instalado (v18 recomendada en adelante).

### 1. Ubícate en el directorio e instala dependencias:
```bash
npm install
```

### 2. Arranca el Entorno Completo (Backend + Frontend):
Gracias al paquete `concurrently`, esto arrancará el servidor backend (puerto 3000) y el empaquetador Vite (puerto 5173) en simultáneo.

```bash
npm run dev
```

### 3. ¡Vívelo!
La aplicación estará disponible localmente en modo Hot-Reload en `http://localhost:5173/`. La API de backend atiende las peticiones debajo de `http://localhost:3000/api/tasks`.

## Tecnologías Principales
- React 19 + Vite
- TailwindCSS 4 (Vite plugin `@tailwindcss/vite`)
- Node.js (Express)
- Framer Motion & Lucide React
- Date-fns
