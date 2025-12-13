# 🚀 Brief Flow

**La plataforma de gestión de briefs para agencias creativas**

Brief Flow es una aplicación SaaS B2B que optimiza la comunicación entre agencias creativas y sus clientes finales, permitiendo gestionar proyectos, recolectar briefs y colaborar en tiempo real.

![Brief Flow](https://via.placeholder.com/800x400/6366f1/ffffff?text=Brief+Flow)

## ✨ Características

- 🔐 **Autenticación multi-tenant** - Agencias y clientes con roles diferenciados
- 📝 **Briefs interactivos** - Wizard paso a paso para clientes
- 💬 **Chat en tiempo real** - Comunicación instantánea por proyecto
- 📁 **Gestión de archivos** - Upload con drag & drop
- 📊 **Dashboard analítico** - Métricas y KPIs
- 📄 **Exportación PDF** - Briefs profesionales
- 👥 **Gestión de equipo** - Invitaciones y roles

## 🛠️ Stack Tecnológico

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- shadcn/ui components
- React Router v6
- Zustand (state management)
- React Hook Form + Zod
- Socket.io-client

### Backend
- Node.js + Express
- SQLite / PostgreSQL
- Prisma ORM
- JWT Authentication
- Socket.io
- Multer (file uploads)

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- npm o yarn

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd briefflow
```

2. **Instalar dependencias**
```bash
# Dependencias raíz
npm install

# Dependencias del frontend
cd frontend && npm install && cd ..

# Dependencias del backend
cd backend && npm install && cd ..
```

3. **Configurar el backend**
```bash
cd backend

# Copiar variables de entorno
cp .env.example .env

# Generar cliente de Prisma y crear base de datos
npm run db:push
npm run db:generate

# Poblar con datos de demo
npm run db:seed
```

4. **Iniciar la aplicación**
```bash
# Desde la raíz del proyecto
npm run dev
```

Esto iniciará:
- Frontend en: http://localhost:5173
- Backend en: http://localhost:3001

## 🔐 Credenciales de Demo

### Agencia
| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@creativestudio.com | password123 |
| Miembro | carlos@creativestudio.com | password123 |

### Clientes
| Empresa | Email | Contraseña |
|---------|-------|------------|
| TechCorp | cliente@empresa.com | password123 |
| Startup Labs | laura@startup.com | password123 |

## 📁 Estructura del Proyecto

```
briefflow/
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── components/   # Componentes UI
│   │   ├── pages/        # Páginas/Vistas
│   │   ├── layouts/      # Layouts compartidos
│   │   ├── lib/          # Utilidades y stores
│   │   └── App.tsx       # Componente principal
│   └── ...
├── backend/               # API Node.js
│   ├── src/
│   │   ├── routes/       # Rutas API
│   │   ├── middleware/   # Middlewares
│   │   └── socket/       # Handlers WebSocket
│   ├── prisma/           # Schema y migraciones
│   └── ...
└── package.json          # Scripts del monorepo
```

## 📋 Flujo de Estados de Proyecto

```
BRIEF_PENDING → Cliente completa brief
      ↓
BRIEF_IN_REVIEW → Agencia revisa
      ↓
BRIEF_APPROVED → Agencia aprueba
      ↓
IN_PRODUCTION → Trabajo en progreso
      ↓
IN_REVIEW → Cliente revisa entrega
      ↓
DELIVERED → Entrega final
      ↓
COMPLETED → Proyecto cerrado
```

## 🎨 Diseño

- **Color primario**: Indigo (#6366f1)
- **Tipografía**: Inter (Google Fonts)
- **Estilo**: Moderno, glassmorphism, gradientes sutiles

## 📝 Licencia

MIT

---

Desarrollado con ❤️ para agencias creativas
