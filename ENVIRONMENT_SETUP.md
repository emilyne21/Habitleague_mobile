# Configuración de Variables de Entorno

Este documento explica cómo configurar las variables de entorno para la API de Google Maps en el proyecto HabitLeague.

## 📋 Variables de Entorno Necesarias

El proyecto necesita las siguientes variables de entorno:

- `GOOGLE_MAPS_API_KEY`: API key de Google Maps para la funcionalidad de mapas y búsqueda de lugares

## 🔧 Métodos de Configuración

### Método 1: Usando app.json (Más Simple)

1. **Edita el archivo `app.json`** en la raíz del proyecto:

```json
{
  "expo": {
    "name": "habitleague",
    "slug": "habitleague",
    // ... otras configuraciones
    "extra": {
      "googleMapsApiKey": "AIzaSyC4R6AN7SmxjMVDniRSiHtH5d12345678"
    }
  }
}
```

2. **Reemplaza el valor** `"AIzaSyC4R6AN7SmxjMVDniRSiHtH5d12345678"` con tu API key real de Google Maps.

3. **Reinicia el servidor de desarrollo**:
```bash
npm start
```

### Método 2: Usando archivo .env (Más Seguro)

Este método es más seguro porque permite mantener las API keys fuera del control de versiones.

1. **Crea un archivo `.env`** en la raíz del proyecto:

```env
# Google Maps API Key
# Obtén tu API key desde: https://console.cloud.google.com/
GOOGLE_MAPS_API_KEY=AIzaSyC4R6AN7SmxjMVDniRSiHtH5d12345678

# Otras variables de entorno del proyecto
API_URL=http://192.168.83.163:8080
EXPO_PUBLIC_API_URL=http://192.168.83.163:8080
```

2. **Instala la dependencia para manejar variables de entorno**:

```bash
npm install --save-dev @dotenv/cli
```

3. **Actualiza `app.json`** para usar la variable de entorno:

```json
{
  "expo": {
    "extra": {
      "googleMapsApiKey": "${GOOGLE_MAPS_API_KEY}"
    }
  }
}
```

4. **Actualiza el archivo `.gitignore`** para excluir el archivo .env:

```gitignore
# Environment variables
.env
.env.local
.env.production
```

5. **Ejecuta la aplicación** usando dotenv:

```bash
npx dotenv expo start
```

### Método 3: Variables de Entorno de Sistema

Para producción, puedes usar variables de entorno del sistema:

1. **En Windows**:
```cmd
set GOOGLE_MAPS_API_KEY=AIzaSyC4R6AN7SmxjMVDniRSiHtH5d12345678
expo start
```

2. **En macOS/Linux**:
```bash
export GOOGLE_MAPS_API_KEY=AIzaSyC4R6AN7SmxjMVDniRSiHtH5d12345678
expo start
```

## 🔒 Seguridad y Mejores Prácticas

### 1. Nunca Commits API Keys

**❌ NUNCA hagas esto:**
```json
{
  "extra": {
    "googleMapsApiKey": "AIzaSyC4R6AN7SmxjMVDniRSiHtH5d12345678"
  }
}
```

**✅ Haz esto en su lugar:**
```json
{
  "extra": {
    "googleMapsApiKey": "${GOOGLE_MAPS_API_KEY}"
  }
}
```

### 2. Usa .env para desarrollo

Crea un archivo `.env` para desarrollo local y compártelo de forma segura con tu equipo (nunca en el repositorio).

### 3. Documenta las variables necesarias

Crea un archivo `.env.example` en la raíz del proyecto con valores de ejemplo:

```env
# .env.example
# Archivo de ejemplo para variables de entorno
# Copia este archivo a .env y reemplaza los valores con los reales

# Google Maps API Key
# Obtén tu API key desde: https://console.cloud.google.com/
# Asegúrate de habilitar: Maps SDK for Android, Maps SDK for iOS, Places API, Geocoding API
GOOGLE_MAPS_API_KEY=AIzaSyC4R6AN7SmxjMVDniRSiHtH5d123456789_EJEMPLO

# API Base URL del backend
API_URL=http://192.168.83.163:8080
EXPO_PUBLIC_API_URL=http://192.168.83.163:8080
```

### 4. Restringe tus API Keys

En Google Cloud Console:
- Restringe la API key por aplicación (Android/iOS)
- Limita las APIs que puede usar
- Configura cuotas de uso

## 🔍 Verificación

Para verificar que las variables de entorno están funcionando:

1. **Verifica en el código** que la API key se está leyendo correctamente:

```typescript
import Constants from 'expo-constants';

console.log('Google Maps API Key:', Constants.expoConfig?.extra?.googleMapsApiKey);
```

2. **Prueba la funcionalidad**:
   - Ve a la página de crear challenge
   - Intenta abrir el mapa
   - Prueba la búsqueda de lugares

## 🐛 Solución de Problemas

### Error: "API key is undefined"

```typescript
// Verifica que la configuración esté correcta
console.log('Extra config:', Constants.expoConfig?.extra);
```

**Soluciones:**
- Verifica que `app.json` tenga la sección `extra` configurada
- Reinicia el servidor de desarrollo (`npm start`)
- Si usas `.env`, asegúrate de ejecutar con `npx dotenv expo start`

### Error: "API key is not authorized"

**Soluciones:**
- Verifica que la API key sea correcta
- Asegúrate de que las APIs estén habilitadas en Google Cloud Console
- Revisa las restricciones de la API key

### La aplicación no encuentra las variables

**Soluciones:**
- Asegúrate de que `expo-constants` esté instalado
- Verifica la sintaxis en `app.json`
- Reinicia completamente el servidor de desarrollo

## 📝 Ejemplo Completo

### Estructura de archivos:

```
proyecto/
├── .env                 # Variables locales (no commitear)
├── .env.example        # Ejemplo de variables (commitear)
├── app.json            # Configuración de Expo
├── .gitignore          # Excluir .env
└── src/
    └── components/
        └── pages/
            └── CreateChallengePage.tsx
```

### .env:
```env
GOOGLE_MAPS_API_KEY=AIzaSyC4R6AN7SmxjMVDniRSiHtH5d12345678
```

### app.json:
```json
{
  "expo": {
    "extra": {
      "googleMapsApiKey": "${GOOGLE_MAPS_API_KEY}"
    }
  }
}
```

### Comando para ejecutar:
```bash
npx dotenv expo start
```

¡Con esta configuración, tu aplicación usará las variables de entorno de forma segura! 🎉 