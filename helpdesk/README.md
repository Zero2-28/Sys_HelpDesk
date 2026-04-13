# Help Desk — Sistema de Gestión de Soporte Técnico

## Descripción

Aplicación full-stack para gestión de tickets de soporte técnico. Permite a los usuarios reportar
incidencias, a los técnicos gestionarlas y a los administradores tener visibilidad y control total
del sistema.

**Tres roles disponibles:**

| Rol | Capacidades |
|---|---|
| **CLIENTE** | Crea tickets, ve solo los suyos, agrega comentarios |
| **TECNICO** | Ve todos los tickets, cambia estados, agrega comentarios |
| **ADMIN** | Acceso completo: crea tickets, asigna técnicos, gestiona usuarios |

**Stack:**
- Backend: Spring Boot 3.2.3 · Spring Security 6 · JWT · SQLite · JPA/Hibernate
- Frontend: React 18 · Vite · React Router v6 · Axios · CSS Modules

---

## Requisitos

- Java 21
- Maven 3.8+
- Node.js 18+

---

## Cómo correr el proyecto

### Backend

```bash
cd helpdesk/backend

# Solo la primera vez (o si quieres resetear la base de datos)
rm helpdesk.db

mvn spring-boot:run
```

- La API queda disponible en `http://localhost:8080`
- El archivo `helpdesk.db` se genera automáticamente al iniciar
- Los datos de prueba (usuarios, tickets, comentarios) se insertan solos si la BD está vacía

### Frontend

```bash
cd helpdesk/frontend
npm install
npm run dev
```

- La aplicación queda disponible en `http://localhost:5173`
- Ambos servidores deben estar corriendo al mismo tiempo

---

## Usuarios de prueba

Creados automáticamente por `DataInitializer` al arrancar con base de datos vacía:

| Rol | Email | Contraseña |
|---|---|---|
| ADMIN | admin@helpdesk.com | admin123 |
| TECNICO | carlos@helpdesk.com | tecnico123 |
| CLIENTE | maria@empresa.com | cliente123 |

---

## Endpoints principales

### Autenticación (público)

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesión, devuelve JWT |
| `POST` | `/api/auth/register` | Registrar nuevo usuario |

### Tickets

| Método | Ruta | Descripción | Rol requerido |
|---|---|---|---|
| `GET` | `/api/tickets` | Listar tickets (CLIENTE ve solo los suyos) | CLIENTE, TECNICO, ADMIN |
| `POST` | `/api/tickets` | Crear nuevo ticket | CLIENTE, ADMIN |
| `GET` | `/api/tickets/{id}` | Ver detalle de un ticket | CLIENTE, TECNICO, ADMIN |
| `PUT` | `/api/tickets/{id}/estado?nuevoEstado=X` | Cambiar estado del ticket | TECNICO, ADMIN |
| `PUT` | `/api/tickets/{id}/asignar?tecnicoId=X` | Asignar técnico al ticket | ADMIN |

**Estados válidos:** `ABIERTO` · `EN_PROGRESO` · `RESUELTO` · `CERRADO`  
**Prioridades válidas:** `BAJA` · `MEDIA` · `ALTA`

### Comentarios

| Método | Ruta | Descripción | Rol requerido |
|---|---|---|---|
| `GET` | `/api/tickets/{id}/comentarios` | Ver comentarios del ticket | CLIENTE, TECNICO, ADMIN |
| `POST` | `/api/tickets/{id}/comentarios` | Agregar comentario | CLIENTE, TECNICO, ADMIN |

### Usuarios

| Método | Ruta | Descripción | Rol requerido |
|---|---|---|---|
| `GET` | `/api/usuarios` | Listar todos los usuarios | TECNICO, ADMIN |
| `POST` | `/api/usuarios` | Crear usuario | ADMIN |

Todos los endpoints protegidos requieren el header:

```
Authorization: Bearer <token>
```

---

## Probar con curl

Existe el script `test-endpoints.sh` en la raíz de `helpdesk/` que automatiza un flujo completo
con los 3 roles: login, creación de ticket, cambio de estado, asignación de técnico, comentarios y
verificación de control de acceso (401 y 403).

**Linux / Mac:**

```bash
cd helpdesk
chmod +x test-endpoints.sh
./test-endpoints.sh
```

**Windows (Git Bash o WSL):**

```bash
cd helpdesk
bash test-endpoints.sh
```

> Requisito: el backend debe estar corriendo en `http://localhost:8080` antes de ejecutar el script.

---

## Notas

- El archivo `helpdesk.db` no está en el repositorio; se genera automáticamente al iniciar el backend.
- El token JWT expira en **24 horas** (`app.jwt.expiration=86400000` ms).
- Si cambias la contraseña del secret JWT en `application.properties`, todos los tokens existentes quedan inválidos.
- El CORS del backend está configurado para aceptar únicamente `http://localhost:5173`. Si corres el frontend en otro puerto, actualiza `SecurityConfig.java`.
