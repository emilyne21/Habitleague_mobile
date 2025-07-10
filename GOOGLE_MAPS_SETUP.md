# Configuración de Google Maps API

Para que la funcionalidad de selección de ubicación funcione correctamente en la página de crear challenges, necesitas configurar Google Maps API.

## Pasos para configurar Google Maps API

### 1. Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Asegúrate de que la facturación esté habilitada (Google Maps requiere una cuenta de facturación)

### 2. Habilitar las APIs necesarias

En Google Cloud Console, habilita las siguientes APIs:
- **Maps SDK for Android** (para la vista del mapa en Android)
- **Maps SDK for iOS** (para la vista del mapa en iOS)  
- **Places API** (para la búsqueda de lugares con autocompletado)
- **Geocoding API** (para convertir direcciones en coordenadas)

### 3. Crear API Key

1. Ve a "Credenciales" en la sección de APIs y servicios
2. Haz clic en "Crear credenciales" > "Clave de API"
3. Copia la API key generada

### 4. Configurar la API Key en el proyecto

#### Opción A: Usando app.json (Recomendado)

Actualiza el archivo `app.json` en la sección `extra`:

```json
{
  "expo": {
    "extra": {
      "googleMapsApiKey": "TU_API_KEY_REAL_AQUI"
    }
  }
}
```

#### Opción B: Usando archivo .env (Más seguro)

1. Crea un archivo `.env` en la raíz del proyecto:

```env
GOOGLE_MAPS_API_KEY=TU_API_KEY_REAL_AQUI
```

2. Instala dotenv:
```bash
npm install @dotenv/cli
```

3. Actualiza `app.json` para usar variables de entorno:
```json
{
  "expo": {
    "extra": {
      "googleMapsApiKey": "${GOOGLE_MAPS_API_KEY}"
    }
  }
}
```

4. Ejecuta la app con:
```bash
npx dotenv expo start
```

### 5. Configurar para Android

Agrega tu API key al archivo `android/app/src/main/AndroidManifest.xml`:

```xml
<application
  android:name=".MainApplication"
  android:label="@string/app_name"
  android:icon="@mipmap/ic_launcher"
  android:allowBackup="false"
  android:theme="@style/AppTheme">
  
  <!-- Agregar esta línea -->
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="TU_API_KEY_AQUI"/>
    
  <!-- Resto de la configuración -->
</application>
```

### 6. Configurar para iOS

Para iOS, agrega tu API key al archivo `ios/Runner/Info.plist`:

```xml
<key>GMSApiKey</key>
<string>TU_API_KEY_AQUI</string>
```

### 7. Restringir la API Key (Recomendado)

Para mayor seguridad, restringe tu API key:

1. En Google Cloud Console, ve a "Credenciales"
2. Haz clic en tu API key
3. En "Restricciones de aplicación", selecciona:
   - **Android apps**: Agrega el package name de tu app (ej: `com.anonymous.habitleague`)
   - **iOS apps**: Agrega el bundle identifier de tu app
4. En "Restricciones de API", selecciona las APIs que necesitas

## Verificar la configuración

El código ya está configurado para usar la API key desde las variables de entorno:

```typescript
import Constants from 'expo-constants';

// En CreateChallengePage.tsx
query={{
  key: Constants.expoConfig?.extra?.googleMapsApiKey || 'YOUR_FALLBACK_KEY',
  language: 'es',
  components: 'country:mx',
}}
```

## Verificación

Una vez configurado correctamente, deberías poder:
- Ver el mapa en la página de crear challenge
- Buscar ubicaciones usando el campo de búsqueda
- Seleccionar ubicaciones tocando el mapa
- Ver la información de la ubicación seleccionada

## Troubleshooting

### Error: "Google Maps API key is required"
- Verifica que hayas agregado correctamente la API key
- Asegúrate de que las APIs necesarias estén habilitadas
- Verifica que la facturación esté habilitada en Google Cloud

### Error: "This API key is not authorized to use this service"
- Verifica que hayas habilitado todas las APIs necesarias
- Revisa las restricciones de tu API key
- Asegúrate de que el package name/bundle identifier sea correcto

### El mapa no se carga
- Verifica la configuración específica de la plataforma (Android/iOS)
- Revisa los logs de la aplicación para errores específicos
- Asegúrate de que tienes conexión a internet

## Costos

Google Maps API tiene un modelo de pago por uso:
- Primeras 28,000 solicitudes de Maps por mes: GRATIS
- Places API: $32 por 1000 solicitudes adicionales
- Geocoding API: $5 por 1000 solicitudes adicionales

Para desarrollo y testing, normalmente no excederás los límites gratuitos. 