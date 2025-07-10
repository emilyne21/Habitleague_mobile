# HabitLeague API Documentation

Este documento proporciona información detallada sobre los endpoints disponibles en la API de HabitLeague.

## Índice

- [Autenticación](#autenticación)
- [Usuarios](#usuarios)
- [Challenges (Retos)](#challenges-retos)
- [Pagos](#pagos)
- [Ubicaciones](#ubicaciones)
- [Evidencias](#evidencias)
- [Logros (Achievements)](#logros-achievements)
- [Notas Adicionales](#notas-adicionales)

---

## Autenticación

### Registro de usuario

- **URL**: `/api/auth/register`
- **Método**: `POST`
- **Autenticación requerida**: No
- **Descripción**: Registra un nuevo usuario en el sistema.
- **Cuerpo de la solicitud**:
  ```json
  {
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@ejemplo.com",
    "password": "contraseña123",
    "bio": "Biografía del usuario",
    "profilePhotoUrl": "https://ejemplo.com/foto.jpg",
    "avatarId": "AVATAR_1"
  }
  ```
- **Respuesta exitosa**: `200 OK` - Token JWT en formato string
- **Errores**: `400 Bad Request` si faltan campos obligatorios o validaciones fallan

### Inicio de sesión

- **URL**: `/api/auth/login`
- **Método**: `POST`
- **Autenticación requerida**: No
- **Descripción**: Inicia sesión con credenciales de usuario.
- **Cuerpo de la solicitud**:
  ```json
  {
    "email": "juan@ejemplo.com",
    "password": "contraseña123"
  }
  ```
- **Respuesta exitosa**: `200 OK` - Token JWT en formato string
- **Errores**: `401 Unauthorized` si las credenciales son incorrectas

---

## Usuarios

### Obtener perfil de usuario

- **URL**: `/api/user/profile`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Descripción**: Obtiene la información del perfil del usuario autenticado.
- **Respuesta exitosa**:
  ```json
  {
    "id": 1,
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@ejemplo.com",
    "bio": "Biografía del usuario",
    "profilePhotoUrl": "https://ejemplo.com/foto.jpg",
    "avatarId": "AVATAR_1",
    "role": "USER",
    "createdAt": "2024-01-15T10:30:00"
  }
  ```

### Actualizar perfil de usuario

- **URL**: `/api/user/profile`
- **Método**: `PATCH`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Descripción**: Actualiza parcialmente la información del perfil del usuario.
- **Cuerpo de la solicitud** (todos los campos son opcionales):
  ```json
  {
    "firstName": "Nuevo nombre",
    "lastName": "Nuevo apellido",
    "bio": "Nueva biografía",
    "profilePhotoUrl": "Nueva URL de foto",
    "avatarId": "AVATAR_2"
  }
  ```
- **Respuesta exitosa**: `200 OK` - Perfil actualizado con la misma estructura que GET

---

## Challenges (Retos)

### Crear un nuevo challenge

- **URL**: `/api/challenges`
- **Método**: `POST`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Descripción**: Crea un nuevo reto (challenge) completo incluyendo pago y ubicación.
- **Cuerpo de la solicitud**:
  ```json
  {
    "name": "Correr 5K Diarios",
    "description": "Reto de correr 5 kilómetros todos los días",
    "category": "FITNESS",
    "imageUrl": "https://ejemplo.com/imagen.jpg",
    "rules": "Debes correr al menos 5 kilómetros y subir foto como evidencia",
    "durationDays": 30,
    "entryFee": 25.00,
    "startDate": "2024-02-01",
    "endDate": "2024-03-02",
    "payment": {
      "amount": 25.00,
      "currency": "USD"
    },
    "location": {
      "latitude": 19.4326,
      "longitude": -99.1332,
      "countryCode": "MX",
      "city": "Ciudad de México",
      "addressLine": "Av. Reforma 123"
    }
  }
  ```
- **Respuesta exitosa**: `200 OK` - Objeto completo con información del challenge, pago y ubicación

### Obtener todos los challenges

- **URL**: `/api/challenges`
- **Método**: `GET`
- **Autenticación requerida**: No
- **Descripción**: Obtiene la lista de todos los retos disponibles.
- **Respuesta exitosa**: `200 OK` - Lista de challenges

### Obtener challenges destacados

- **URL**: `/api/challenges/featured`
- **Método**: `GET`
- **Autenticación requerida**: No
- **Descripción**: Obtiene la lista de retos destacados por el sistema.
- **Respuesta exitosa**: `200 OK` - Lista de challenges destacados con información de ubicación

### Obtener challenges populares

- **URL**: `/api/challenges/popular`
- **Método**: `GET`
- **Autenticación requerida**: No
- **Parámetros de consulta**: `limit` (opcional, default: 10)
- **Descripción**: Obtiene la lista de retos más populares.
- **Ejemplo**: `/api/challenges/popular?limit=5`
- **Respuesta exitosa**: `200 OK` - Lista de challenges populares

### Obtener challenges por categoría

- **URL**: `/api/challenges/category/{category}`
- **Método**: `GET`
- **Autenticación requerida**: No
- **Parámetros de ruta**: `category` (FITNESS, NUTRITION, LEARNING, MINDFULNESS, PRODUCTIVITY, SOCIAL, OTHER)
- **Ejemplo**: `/api/challenges/category/FITNESS`
- **Respuesta exitosa**: `200 OK` - Lista de challenges de la categoría especificada

### Obtener un challenge específico

- **URL**: `/api/challenges/{id}`
- **Método**: `GET`
- **Autenticación requerida**: No
- **Parámetros de ruta**: `id` (ID del challenge)
- **Ejemplo**: `/api/challenges/123`
- **Respuesta exitosa**: `200 OK` - Información completa del challenge

### Obtener challenges del usuario

- **URL**: `/api/challenges/my-challenges`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Descripción**: Obtiene la lista de retos en los que participa el usuario autenticado.
- **Respuesta exitosa**: `200 OK` - Lista de challenges del usuario

### Descubrir challenges

- **URL**: `/api/challenges/discover`
- **Método**: `GET`
- **Autenticación requerida**: No
- **Descripción**: Obtiene datos agrupados para la página de descubrimiento (featured, popular, por categorías).
- **Respuesta exitosa**: `200 OK` - Objeto con secciones de challenges organizadas

### Unirse a un challenge

- **URL**: `/api/challenges/{id}/join`
- **Método**: `POST`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Parámetros de ruta**: `id` (ID del challenge)
- **Cuerpo de la solicitud**:
  ```json
  {
    "payment": {
      "amount": 25.00,
      "currency": "USD"
    },
    "location": {
      "latitude": 19.4326,
      "longitude": -99.1332,
      "countryCode": "MX",
      "city": "Ciudad de México",
      "addressLine": "Av. Reforma 456"
    }
  }
  ```
- **Respuesta exitosa**: `200 OK` - Confirmación completa de unión al challenge

### Verificar requisitos para unirse

- **URL**: `/api/challenges/{id}/requirements-status`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Parámetros de ruta**: `id` (ID del challenge)
- **Descripción**: Verifica si el usuario cumple los requisitos para unirse a un reto.
- **Respuesta exitosa**: `200 OK` - Estado de requisitos (pago, ubicación)

### Obtener información del prizepool

- **URL**: `/api/challenges/{id}/pricepool`
- **Método**: `GET`
- **Autenticación requerida**: No
- **Parámetros de ruta**: `id` (ID del challenge)
- **Descripción**: Obtiene información del fondo de premios del reto.
- **Respuesta exitosa**: `200 OK` - Datos del prizepool

### Obtener participantes de un challenge

- **URL**: `/api/challenges/{id}/participants`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Parámetros de ruta**: `id` (ID del challenge)
- **Descripción**: Obtiene la lista de participantes de un reto específico.
- **Respuesta exitosa**: `200 OK` - Lista de participantes

### Ejecutar verificación diaria manual (Admin)

- **URL**: `/api/challenges/admin/run-daily-check`
- **Método**: `POST`
- **Autenticación requerida**: Sí (Bearer Token JWT + Admin)
- **Descripción**: Ejecuta manualmente el proceso de verificación diaria de challenges.
- **Respuesta exitosa**: `200 OK` - Resultado de la verificación

---

## Pagos

### Procesar pago para un challenge

- **URL**: `/api/payments/process`
- **Método**: `POST`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Descripción**: Procesa el pago para unirse a un reto.
- **Cuerpo de la solicitud**:
  ```json
  {
    "challengeId": 123,
    "amount": 25.00,
    "currency": "USD"
  }
  ```
- **Respuesta exitosa**: `200 OK` - Confirmación del pago con detalles

### Procesar pago de penalización

- **URL**: `/api/payments/process-penalty`
- **Método**: `POST`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Descripción**: Procesa el pago de penalización por no completar un reto.
- **Cuerpo de la solicitud**:
  ```json
  {
    "challengeId": 123,
    "amount": 12.50,
    "currency": "USD"
  }
  ```
- **Respuesta exitosa**: `200 OK` - Confirmación del pago de penalización

### Obtener pagos del usuario

- **URL**: `/api/payments/my-payments`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Descripción**: Obtiene el historial de pagos del usuario autenticado.
- **Respuesta exitosa**: `200 OK` - Lista de pagos realizados

### Obtener pago por ID de Stripe

- **URL**: `/api/payments/stripe/{stripePaymentId}`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Parámetros de ruta**: `stripePaymentId` (ID del pago en Stripe)
- **Descripción**: Obtiene información de un pago específico por su ID de Stripe.
- **Respuesta exitosa**: `200 OK` - Detalles del pago

### Verificar estado de pago para challenge

- **URL**: `/api/payments/challenge/{challengeId}/status`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Parámetros de ruta**: `challengeId` (ID del challenge)
- **Descripción**: Verifica si el usuario ya pagó por un challenge específico.
- **Respuesta exitosa**: `200 OK` - Estado del pago para el challenge

### Webhook de Stripe (Desarrollo)

- **URL**: `/api/payments/webhook/stripe`
- **Método**: `POST`
- **Autenticación requerida**: No (webhook)
- **Descripción**: Endpoint para recibir webhooks de Stripe (simulado para desarrollo).
- **Respuesta exitosa**: `200 OK` - Confirmación de webhook procesado

---

## Ubicaciones

### Obtener mis ubicaciones registradas

- **URL**: `/api/location/my-registrations`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Descripción**: Obtiene todas las ubicaciones registradas por el usuario.
- **Respuesta exitosa**: `200 OK` - Lista de ubicaciones registradas

### Obtener ubicación por challenge

- **URL**: `/api/location/challenge/{challengeId}`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Parámetros de ruta**: `challengeId` (ID del challenge)
- **Descripción**: Obtiene la ubicación registrada del usuario para un challenge específico.
- **Respuesta exitosa**: `200 OK` - Ubicación registrada
- **Errores**: `404 Not Found` si no hay ubicación registrada

### Obtener ubicación del creador de un challenge

- **URL**: `/api/location/challenge/{challengeId}/creator`
- **Método**: `GET`
- **Autenticación requerida**: No
- **Parámetros de ruta**: `challengeId` (ID del challenge)
- **Descripción**: Obtiene la ubicación del creador de un challenge.
- **Respuesta exitosa**: `200 OK` - Ubicación del creador
- **Errores**: `404 Not Found` si no se encuentra

### Geocodificación simulada

- **URL**: `/api/location/geocode`
- **Método**: `GET`
- **Autenticación requerida**: No
- **Parámetros de consulta**: `latitude`, `longitude`
- **Ejemplo**: `/api/location/geocode?latitude=19.4326&longitude=-99.1332`
- **Descripción**: Simula la geocodificación de coordenadas (para desarrollo).
- **Respuesta exitosa**: `200 OK` - Información de ubicación simulada

### Verificar proximidad

- **URL**: `/api/location/verify-proximity`
- **Método**: `POST`
- **Autenticación requerida**: No
- **Parámetros de consulta**: `userLat`, `userLng`, `targetLat`, `targetLng`, `radiusMeters` (opcional, default: 100)
- **Descripción**: Verifica si dos ubicaciones están dentro de un radio específico.
- **Respuesta exitosa**: `200 OK` - Resultado de verificación de proximidad

---

## Evidencias

### Enviar evidencia diaria

- **URL**: `/api/evidences`
- **Método**: `POST`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Descripción**: Envía evidencia diaria de participación en un reto.
- **Cuerpo de la solicitud**:
  ```json
  {
    "challengeId": 123,
    "imageUrl": "https://ejemplo.com/evidencia.jpg",
    "latitude": 19.4326,
    "longitude": -99.1332
  }
  ```
- **Respuesta exitosa**: `200 OK` - Confirmación de envío con resultado de validación

### Obtener mis evidencias

- **URL**: `/api/evidences/my-evidences`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Descripción**: Obtiene todas las evidencias enviadas por el usuario.
- **Respuesta exitosa**: `200 OK` - Lista de evidencias del usuario

### Obtener evidencias por challenge

- **URL**: `/api/evidences/challenge/{challengeId}`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Parámetros de ruta**: `challengeId` (ID del challenge)
- **Descripción**: Obtiene las evidencias del usuario para un challenge específico.
- **Respuesta exitosa**: `200 OK` - Lista de evidencias para el challenge

### Verificar estado de envío diario

- **URL**: `/api/evidences/challenge/{challengeId}/daily-status`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Parámetros de ruta**: `challengeId` (ID del challenge)
- **Descripción**: Verifica si el usuario ya envió evidencia hoy para un challenge.
- **Respuesta exitosa**: 
  ```json
  {
    "challengeId": 123,
    "hasSubmittedToday": false,
    "canSubmit": true,
    "message": "Puedes enviar tu evidencia diaria",
    "submissionWindow": "00:00 - 23:59"
  }
  ```

### Obtener estadísticas de evidencias

- **URL**: `/api/evidences/my-stats`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Descripción**: Obtiene estadísticas de evidencias del usuario.
- **Respuesta exitosa**: `200 OK` - Estadísticas detalladas de evidencias

### Health check de evidencias

- **URL**: `/api/evidences/health`
- **Método**: `GET`
- **Autenticación requerida**: No
- **Descripción**: Verifica el estado del servicio de evidencias.
- **Respuesta exitosa**: `200 OK` - Estado del servicio

---

## Logros (Achievements)

### Obtener todos los logros disponibles

- **URL**: `/api/achievements`
- **Método**: `GET`
- **Autenticación requerida**: No
- **Descripción**: Obtiene la lista de todos los logros disponibles en el sistema.
- **Respuesta exitosa**: `200 OK` - Lista de todos los achievements

### Obtener mis logros

- **URL**: `/api/achievements/my-achievements`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Descripción**: Obtiene los logros desbloqueados por el usuario autenticado.
- **Respuesta exitosa**: `200 OK` - Lista de logros del usuario

### Obtener logros de un usuario

- **URL**: `/api/achievements/user/{userId}`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token JWT + Admin o mismo usuario)
- **Parámetros de ruta**: `userId` (ID del usuario)
- **Descripción**: Obtiene los logros de un usuario específico.
- **Respuesta exitosa**: `200 OK` - Lista de logros del usuario

### Obtener mis estadísticas de logros

- **URL**: `/api/achievements/my-stats`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token JWT)
- **Descripción**: Obtiene estadísticas de logros del usuario autenticado.
- **Respuesta exitosa**: `200 OK` - Estadísticas de achievements

### Obtener estadísticas de logros de un usuario

- **URL**: `/api/achievements/user/{userId}/stats`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token JWT + Admin o mismo usuario)
- **Parámetros de ruta**: `userId` (ID del usuario)
- **Descripción**: Obtiene estadísticas de logros de un usuario específico.
- **Respuesta exitosa**: `200 OK` - Estadísticas de achievements

### Obtener logros por challenge

- **URL**: `/api/achievements/challenge/{challengeId}`
- **Método**: `GET`
- **Autenticación requerida**: No
- **Parámetros de ruta**: `challengeId` (ID del challenge)
- **Descripción**: Obtiene logros relacionados con un challenge específico.
- **Respuesta exitosa**: `200 OK` - Lista de logros del challenge

### Verificar si un usuario tiene un logro

- **URL**: `/api/achievements/user/{userId}/has/{achievementType}`
- **Método**: `GET`
- **Autenticación requerida**: Sí (Bearer Token JWT + Admin o mismo usuario)
- **Parámetros de ruta**: 
  - `userId` (ID del usuario)
  - `achievementType` (Tipo de logro: FIRST_CHALLENGE, CHALLENGE_CREATOR, EVIDENCE_STREAK_7, etc.)
- **Respuesta exitosa**: `200 OK` - Boolean indicando si tiene el logro

### Desbloquear logro manualmente (Admin)

- **URL**: `/api/achievements/admin/unlock`
- **Método**: `POST`
- **Autenticación requerida**: Sí (Bearer Token JWT + Admin)
- **Parámetros de consulta**: 
  - `userId` (ID del usuario)
  - `achievementType` (Tipo de logro)
  - `challengeId` (opcional, ID del challenge)
  - `contextInfo` (opcional, información adicional)
- **Descripción**: Permite a un admin desbloquear logros manualmente.
- **Respuesta exitosa**: `200 OK` - Confirmación de logro desbloqueado

---

## Notas Adicionales

### Autenticación

Para endpoints que requieren autenticación, incluye el token JWT en el header de la solicitud:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Estructura de errores

Las respuestas de error siguen un formato estándar:
```json
{
  "timestamp": "2024-01-15T16:45:30.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Descripción del error específico",
  "path": "/api/endpoint"
}
```

### Códigos de estado HTTP

- **200 OK**: Solicitud exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Error en la solicitud o validación
- **401 Unauthorized**: Token de autenticación faltante o inválido
- **403 Forbidden**: No autorizado para realizar la acción
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error interno del servidor

### Categorías de Challenge

- **FITNESS**: Actividades físicas y ejercicio
- **NUTRITION**: Alimentación saludable y dietas
- **LEARNING**: Aprendizaje y educación
- **MINDFULNESS**: Meditación y bienestar mental
- **PRODUCTIVITY**: Productividad y organización
- **SOCIAL**: Actividades sociales y comunitarias
- **OTHER**: Otros tipos de retos

### Tipos de Avatar

Los avatares disponibles incluyen:
- **AVATAR_1** a **AVATAR_10**: Diferentes opciones de avatares predefinidos

### Tipos de Achievement

Los logros disponibles incluyen (entre otros):
- **FIRST_CHALLENGE**: Primer challenge completado
- **CHALLENGE_CREATOR**: Crear un challenge
- **EVIDENCE_STREAK_7**: Racha de 7 días enviando evidencia
- **EVIDENCE_STREAK_30**: Racha de 30 días enviando evidencia
- **EARLY_ADOPTER**: Usuario temprano de la plataforma

### Validación de Evidencias

Las evidencias son validadas por:
1. **IA**: Análisis automático del contenido de la imagen
2. **Ubicación**: Verificación de que se envió desde la ubicación registrada
3. **Tiempo**: Verificación de que se envió dentro del horario permitido

### Formatos de Fecha

- Las fechas se manejan en formato ISO 8601: `YYYY-MM-DD`
- Los timestamps incluyen hora: `YYYY-MM-DDTHH:mm:ss`

### Monedas Soportadas

Actualmente la API soporta:
- **USD**: Dólares estadounidenses
- **MXN**: Pesos mexicanos (según configuración)

### Límites y Restricciones

- **Duración de challenges**: Mínimo 21 días, máximo 365 días
- **Tarifa de entrada**: Mínimo $0.01 USD
- **Evidencias**: Una por día por challenge
- **Ubicación**: Tolerancia de 100 metros por defecto
