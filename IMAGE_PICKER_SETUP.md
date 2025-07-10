# Integración con Galería de Fotos - HabitLeague

## 📸 Funcionalidad Implementada

La aplicación ahora permite seleccionar imágenes directamente desde la galería del dispositivo o tomar fotos con la cámara para los challenges.

## ✨ Características

### Selección de Imagen
- **Galería**: Acceso completo a la galería de fotos del dispositivo
- **Cámara**: Tomar fotos directamente desde la aplicación
- **Editor**: Recorte y ajuste de imágenes con proporción 16:9
- **Preview**: Vista previa de la imagen seleccionada
- **Calidad**: Compresión automática a 80% para optimizar tamaño

### Interfaz de Usuario
- **Botón de Selección**: Área visual atractiva con icono de cámara
- **Preview Grande**: Muestra la imagen seleccionada en formato completo
- **Botón de Cambio**: Permite cambiar la imagen fácilmente
- **Indicadores Visuales**: Textos descriptivos para guiar al usuario

## 🔧 Implementación Técnica

### Dependencias
```bash
npx expo install expo-image-picker
```

### Permisos Requeridos
Los siguientes permisos se solicitan automáticamente:
- `android.permission.CAMERA` - Para acceder a la cámara
- `android.permission.READ_EXTERNAL_STORAGE` - Para leer la galería
- `android.permission.WRITE_EXTERNAL_STORAGE` - Para guardar fotos

### Código Principal
```typescript
// Selección desde galería
const pickImageFromGallery = async () => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
  });
  
  if (!result.canceled && result.assets[0]) {
    setSelectedImage(result.assets[0].uri);
  }
};

// Tomar foto con cámara
const takePhotoWithCamera = async () => {
  const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
  
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
  });
};
```

## 📱 Flujo de Usuario

1. **Acceder a Crear Challenge** → Usuario navega a la página de creación
2. **Seleccionar Imagen** → Toca el área de selección de imagen
3. **Elegir Fuente** → Selecciona entre "Galería" o "Cámara"
4. **Tomar/Seleccionar** → Toma foto o elige de galería
5. **Editar** → Recorta y ajusta la imagen si es necesario
6. **Confirmar** → La imagen se muestra como preview
7. **Continuar** → Completa el resto del formulario

## 🎨 Estilos y Diseño

### Botón de Selección (Estado Vacío)
- Área con bordes punteados
- Icono grande de cámara
- Texto explicativo
- Fondo claro con borde gris

### Preview de Imagen
- Imagen en tamaño completo
- Botón de "Cambiar Imagen" superpuesto
- Bordes redondeados
- Proporción 16:9 mantenida

## ⚠️ Consideraciones

### Formato de Imagen
- **Proporción**: 16:9 (ideal para challenges)
- **Calidad**: 80% de compresión
- **Formatos**: JPG, PNG soportados
- **Edición**: Recorte habilitado

### Permisos
- Los permisos se solicitan en tiempo de ejecución
- Manejo de errores si se deniegan permisos
- Mensajes informativos al usuario

### Almacenamiento
- **Local**: Las imágenes se guardan temporalmente
- **Backend**: Se envía la URI local (requiere procesamiento en servidor)
- **Futura mejora**: Subida a cloud storage (AWS S3, Cloudinary, etc.)

## 🔄 Próximas Mejoras

1. **Subida a Cloud**: Integración con servicio de almacenamiento
2. **Múltiples Imágenes**: Permitir varias fotos por challenge
3. **Filtros**: Efectos y filtros para las imágenes
4. **Compresión Avanzada**: Optimización automática según conexión
5. **Caché**: Sistema de caché para imágenes frecuentes

## 🐛 Resolución de Problemas

### Error de Permisos
```
Error: Se necesita permiso para acceder a la galería/cámara
```
**Solución**: Verificar permisos en configuración del dispositivo

### Imagen no se Muestra
```
Error: URI de imagen inválida
```
**Solución**: Reintentar selección o reiniciar la aplicación

### Aplicación se Cierra
```
Error: Memoria insuficiente
```
**Solución**: Aumentar compresión de imagen o liberar memoria

## 💡 Notas para Desarrolladores

- La funcionalidad está completamente integrada en `CreateChallengePage.tsx`
- Los estilos están definidos en el mismo archivo
- La validación incluye verificación de imagen seleccionada
- Compatible con iOS y Android
- Requiere dispositivo físico para pruebas completas (cámara no funciona en emulador) 