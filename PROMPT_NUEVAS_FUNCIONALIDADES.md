# Prompt para Copilot Backend: Nuevas Funcionalidades

## Cambios en Entidad Student

### 1. Actualizar Entidad Student (Backend)
Agregar nuevos campos al modelo `Student`:
```java
@Column(name = "color_estado")
private String colorEstado; // ROJO, AMARILLO, VERDE, AZUL, PURPURA, NARANJA

@Column(name = "fecha_terminacion_curso")
@Temporal(TemporalType.DATE)
private LocalDate fechaTerminacionCurso; // Opcional
```

### 2. Validar ColorEstado
Crear enum o validación que acepte:
- ROJO (No llamar)
- AMARILLO (Tiene cita)
- VERDE (Nuevo contacto)
- AZUL (Estudiante)
- PURPURA (Estudiante antiguo)
- NARANJA (Pendiente)

### 3. Actualizar DTO de Respuesta
En respuesta de Student endpoint, incluir:
```json
{
  "id": 1,
  "nombre": "...",
  "telefono": "...",
  "tieneCita": true,
  "esNuevo": true,
  "esEstudiante": false,
  "colorEstado": "AMARILLO",
  "fechaTerminacionCurso": "2026-02-14",
  "comentarios": [],
  "cita": {},
  "createdAt": "...",
  "updatedAt": "..."
}
```

### 4. Actualizar Endpoints Existentes
- GET /api/v1/students - incluir nuevos campos
- GET /api/v1/students/:id - incluir nuevos campos
- POST /api/v1/students - aceptar colorEstado y fechaTerminacionCurso
- PUT /api/v1/students/:id - permitir actualizar ambos campos

### 5. Validaciones
- `colorEstado`: campo requerido, validar contra valores permitidos
- `fechaTerminacionCurso`: opcional, debe ser fecha válida y futura si se proporciona

### 6. Base de Datos
Agregar columnas a tabla `students`:
- `color_estado VARCHAR(20)` - DEFAULT 'VERDE'
- `fecha_terminacion_curso DATE` - NULL


