# FoodV Mobile

Aplicación móvil de FoodV, un marketplace de delivery universitario para estudiantes, comercios y repartidores de la Universidad César Vallejo, sede Lima Norte. La app permite explorar tiendas y productos, recibir recomendaciones de IA, gestionar carrito, crear pedidos, consultar pagos y hacer seguimiento del estado de entrega.

## Stack Tecnológico

| Tecnología | Versión / uso |
|---|---|
| Expo | `~54.0.33` |
| React Native | `0.81.5` |
| React | `19.1.0` |
| React Navigation | Navegación stack y tabs por rol |
| TanStack Query | Caché y sincronización de datos remotos |
| Zustand | Estado local de autenticación y carrito |
| Expo SecureStore | Persistencia segura de tokens JWT |
| Expo Notifications | Notificaciones push |
| Firebase | Configuración nativa para Android/iOS |
| EAS | Builds Android/iOS |

## Requisitos Previos

- Node.js
- npm
- Expo CLI
- Expo Go instalado en el dispositivo físico
- Backend FoodV ejecutándose en la red local

## Instalación

```bash
git clone https://github.com/xavier25dev/foodv-mobile.git
cd foodv-mobile
npm install
```

### Configurar API URL

La URL del backend está hardcodeada en:

```text
src/constants/index.ts
```

Valor actual:

```ts
export const API_URL = 'http://172.20.10.13:8080/api';
```

Cada desarrollador debe cambiar esa IP por la IP local de su máquina donde corre `foodv-backend-main`. El dispositivo con Expo Go y la máquina del backend deben estar en la misma red.

Ejemplo:

```ts
export const API_URL = 'http://192.168.1.50:8080/api';
```

Luego inicia Expo:

```bash
npm start
```

## Firebase

La app usa Firebase para la configuración nativa de notificaciones:

| Plataforma | Archivo requerido | Ubicación |
|---|---|---|
| Android | `google-services.json` | Raíz del proyecto |
| iOS | `GoogleService-Info.plist` | Raíz del proyecto |

Estos archivos contienen credenciales/configuración del proyecto Firebase y NO se incluyen en el repositorio. Cada entorno debe colocar sus propios archivos antes de compilar o ejecutar funcionalidades de notificaciones.

## Ejecución

```bash
# Iniciar Metro/Expo
npm start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## Estructura de Carpetas

```text
foodv-mobile/
├── App.tsx
├── app.json
├── eas.json
├── index.ts
├── package.json
├── assets/
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
└── src/
    ├── api/                # Clientes HTTP por módulo del backend
    ├── components/ui/      # Componentes reutilizables de interfaz
    ├── constants/          # API_URL, roles, estados y catálogos
    ├── hooks/              # Hooks de favoritos, pagos, búsqueda, notificaciones
    ├── navigation/         # Root, Auth, Student, Store y Delivery navigators
    ├── screens/
    │   ├── auth/           # Login, registro y bienvenida
    │   └── student/        # Flujo funcional de estudiante
    ├── store/              # Zustand stores
    ├── theme/              # Tokens, colores y tipografías
    ├── types/              # Tipos TypeScript compartidos
    └── utils/              # Utilidades generales
```

## Roles y Pantallas

| Rol | Estado | Pantallas |
|---|---|---|
| `ESTUDIANTE` | Funcional | `HomeScreen`, búsqueda, detalle de tienda/producto, favoritos, carrito, checkout, pedidos, tracking, perfil |
| `COMERCIO` | En desarrollo | Navegación creada con pantallas placeholder para dashboard, pedidos, productos y perfil |
| `REPARTIDOR` | En desarrollo | Navegación creada con pantallas placeholder para pedidos disponibles, entregas, ganancias, perfil y KYC |

`HomeScreen` para `ESTUDIANTE` integra productos del marketplace y recomendaciones de IA expuestas por el backend.

## Tests

Actualmente el proyecto no tiene tests automatizados configurados. `package.json` no define script `test`.

## EAS Build

El proyecto incluye configuración básica en `eas.json`.

```bash
# Instalar EAS CLI si no está disponible
npm install -g eas-cli

# Login
eas login

# Build Android interno/APK según perfil
eas build --platform android --profile preview

# Build iOS
eas build --platform ios --profile production

# Build para ambas plataformas
eas build --platform all --profile production
```

Para iOS se requiere una cuenta Apple Developer y configuración de credenciales en EAS.

## Proyectos Relacionados

- `foodv-backend-main` — Backend principal Spring Boot 4.x + Java 21.
- `foodv-ai-service` — Microservicio FastAPI para recomendaciones con Ollama/Groq.
