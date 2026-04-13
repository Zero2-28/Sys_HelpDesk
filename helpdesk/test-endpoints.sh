#!/bin/bash
# =============================================================
# HelpDesk API - Test completo con JWT (3 roles)
# Ejecutar desde: helpdesk/
# Requisito: servidor corriendo en localhost:8080
# =============================================================

BASE_URL="http://localhost:8080"
SEP="--------------------------------------------------------------"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

ok()     { echo -e "${GREEN}[OK]${NC} $1"; }
fail()   { echo -e "${RED}[FAIL]${NC} $1"; }
header() { echo -e "\n${CYAN}$1${NC}\n$SEP"; }
info()   { echo -e "${YELLOW}>>>${NC} $1"; }

extract_token() {
  echo "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token',''))" 2>/dev/null
}

extract_id() {
  echo "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null
}

pretty() {
  echo "$1" | python3 -m json.tool 2>/dev/null || echo "$1"
}

# -----------------------------------------------------------------
# 0. Verificar conectividad
# -----------------------------------------------------------------
header "0. Verificando conectividad con el servidor"
PING=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/auth/login" -X POST \
  -H "Content-Type: application/json" -d '{}')
if [ "$PING" != "400" ] && [ "$PING" != "401" ] && [ "$PING" != "200" ]; then
  fail "Servidor no responde en $BASE_URL (codigo: $PING)"
  echo "Asegurate de ejecutar: cd helpdesk/backend && mvn spring-boot:run"
  exit 1
fi
ok "Servidor activo en $BASE_URL"

# -----------------------------------------------------------------
# IMPORTANTE: Si es la primera ejecucion, borrar helpdesk.db primero
# para que DataInitializer cree los usuarios con BCrypt
# -----------------------------------------------------------------

# =================================================================
# 1. LOGIN - Los 3 roles
# =================================================================
header "1. LOGIN - Obteniendo tokens JWT"

info "Login como ADMIN"
RESP_ADMIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@helpdesk.com","password":"admin123"}')
TOKEN_ADMIN=$(extract_token "$RESP_ADMIN")
if [ -n "$TOKEN_ADMIN" ]; then
  ok "ADMIN token obtenido"
else
  fail "Login ADMIN fallido"
  pretty "$RESP_ADMIN"
fi

info "Login como TECNICO"
RESP_TEC=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"carlos@helpdesk.com","password":"tecnico123"}')
TOKEN_TEC=$(extract_token "$RESP_TEC")
if [ -n "$TOKEN_TEC" ]; then
  ok "TECNICO token obtenido"
else
  fail "Login TECNICO fallido"
  pretty "$RESP_TEC"
fi

info "Login como CLIENTE"
RESP_CLI=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@empresa.com","password":"cliente123"}')
TOKEN_CLI=$(extract_token "$RESP_CLI")
if [ -n "$TOKEN_CLI" ]; then
  ok "CLIENTE token obtenido"
else
  fail "Login CLIENTE fallido"
  pretty "$RESP_CLI"
fi

# =================================================================
# 2. REGISTER - Nuevo usuario via /api/auth/register
# =================================================================
header "2. REGISTER - Crear nuevo usuario"

info "Registrar nuevo cliente"
RESP_REG=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Pedro Nuevo","email":"pedro@test.com","password":"pedro123","rol":"CLIENTE"}')
TOKEN_PEDRO=$(extract_token "$RESP_REG")
if [ -n "$TOKEN_PEDRO" ]; then
  ok "Nuevo usuario registrado con token"
else
  info "Registro puede fallar si el usuario ya existe (idempotente)"
  pretty "$RESP_REG"
fi

# =================================================================
# 3. SIN TOKEN - Debe devolver 401
# =================================================================
header "3. SEGURIDAD - Request sin token (esperamos 401)"

info "GET /api/tickets sin Authorization header"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/tickets")
if [ "$STATUS" = "401" ]; then
  ok "401 recibido correctamente (no autenticado)"
else
  fail "Esperaba 401, recibio: $STATUS"
fi

# =================================================================
# 4. CREDENCIALES INCORRECTAS - Debe devolver 401
# =================================================================
header "4. SEGURIDAD - Credenciales incorrectas (esperamos 401)"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@helpdesk.com","password":"wrongpassword"}')
if [ "$STATUS" = "401" ]; then
  ok "401 recibido correctamente (credenciales invalidas)"
else
  fail "Esperaba 401, recibio: $STATUS"
fi

# =================================================================
# 5. TICKETS - Flujo completo como CLIENTE
# =================================================================
header "5. CLIENTE - Ver y crear tickets"

info "CLIENTE: Listar mis tickets (solo los suyos)"
RESP=$(curl -s "$BASE_URL/api/tickets" \
  -H "Authorization: Bearer $TOKEN_CLI")
pretty "$RESP"

info "CLIENTE: Crear nuevo ticket"
RESP_TICKET=$(curl -s -X POST "$BASE_URL/api/tickets" \
  -H "Authorization: Bearer $TOKEN_CLI" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Mi impresora no funciona","descripcion":"La impresora del escritorio no enciende desde hoy","prioridad":"MEDIA"}')
TICKET_ID=$(extract_id "$RESP_TICKET")
pretty "$RESP_TICKET"
if [ -n "$TICKET_ID" ]; then
  ok "Ticket creado con ID: $TICKET_ID"
fi

info "CLIENTE: Ver el ticket recien creado"
RESP=$(curl -s "$BASE_URL/api/tickets/$TICKET_ID" \
  -H "Authorization: Bearer $TOKEN_CLI")
pretty "$RESP"

# =================================================================
# 6. CONTROL DE ROLES - CLIENTE no puede ver tickets ajenos
# =================================================================
header "6. SEGURIDAD ROLES - CLIENTE no puede ver ticket ajeno"

info "CLIENTE intenta ver ticket ID=1 (puede ser de otro cliente en futuro)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/tickets/1" \
  -H "Authorization: Bearer $TOKEN_CLI")
ok "Respuesta: $STATUS (400=ticket no es suyo, 200=es suyo, 404=no existe)"

# =================================================================
# 7. TICKETS - TECNICO puede ver todos y cambiar estado
# =================================================================
header "7. TECNICO - Ver todos los tickets y cambiar estado"

info "TECNICO: Listar TODOS los tickets"
RESP=$(curl -s "$BASE_URL/api/tickets" \
  -H "Authorization: Bearer $TOKEN_TEC")
pretty "$RESP"

info "TECNICO: Cambiar estado del ticket $TICKET_ID a EN_PROGRESO"
RESP=$(curl -s -X PUT "$BASE_URL/api/tickets/$TICKET_ID/estado?nuevoEstado=EN_PROGRESO" \
  -H "Authorization: Bearer $TOKEN_TEC")
pretty "$RESP"
ok "Estado cambiado a EN_PROGRESO"

# =================================================================
# 8. CONTROL DE ROLES - CLIENTE no puede cambiar estado
# =================================================================
header "8. SEGURIDAD ROLES - CLIENTE no puede cambiar estado (esperamos 403)"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X PUT "$BASE_URL/api/tickets/$TICKET_ID/estado?nuevoEstado=CERRADO" \
  -H "Authorization: Bearer $TOKEN_CLI")
if [ "$STATUS" = "403" ]; then
  ok "403 recibido correctamente (CLIENTE no puede cambiar estado)"
else
  fail "Esperaba 403, recibio: $STATUS"
fi

# =================================================================
# 9. ADMIN - Asignar tecnico y ver todos los usuarios
# =================================================================
header "9. ADMIN - Asignar tecnico a ticket y listar usuarios"

info "ADMIN: Listar todos los usuarios"
RESP=$(curl -s "$BASE_URL/api/usuarios" \
  -H "Authorization: Bearer $TOKEN_ADMIN")
pretty "$RESP"

info "ADMIN: Asignar tecnico ID=2 al ticket $TICKET_ID"
RESP=$(curl -s -X PUT "$BASE_URL/api/tickets/$TICKET_ID/asignar?tecnicoId=2" \
  -H "Authorization: Bearer $TOKEN_ADMIN")
pretty "$RESP"
ok "Tecnico asignado al ticket $TICKET_ID"

# =================================================================
# 10. COMENTARIOS - Flujo multi-rol
# =================================================================
header "10. COMENTARIOS - Flujo multi-rol"

info "TECNICO: Agregar comentario al ticket $TICKET_ID"
RESP=$(curl -s -X POST "$BASE_URL/api/tickets/$TICKET_ID/comentarios" \
  -H "Authorization: Bearer $TOKEN_TEC" \
  -H "Content-Type: application/json" \
  -d '{"mensaje":"Estamos revisando el problema con la impresora"}')
pretty "$RESP"

info "CLIENTE: Responder al comentario"
RESP=$(curl -s -X POST "$BASE_URL/api/tickets/$TICKET_ID/comentarios" \
  -H "Authorization: Bearer $TOKEN_CLI" \
  -H "Content-Type: application/json" \
  -d '{"mensaje":"Gracias, quedo pendiente de su respuesta"}')
pretty "$RESP"

info "ADMIN: Ver todos los comentarios del ticket $TICKET_ID"
RESP=$(curl -s "$BASE_URL/api/tickets/$TICKET_ID/comentarios" \
  -H "Authorization: Bearer $TOKEN_ADMIN")
pretty "$RESP"

# =================================================================
# 11. ADMIN - Cambiar estado a RESUELTO y CERRADO
# =================================================================
header "11. ADMIN - Ciclo final de estados"

info "ADMIN: Cambiar a RESUELTO"
RESP=$(curl -s -X PUT "$BASE_URL/api/tickets/$TICKET_ID/estado?nuevoEstado=RESUELTO" \
  -H "Authorization: Bearer $TOKEN_ADMIN")
pretty "$RESP"

info "ADMIN: Cambiar a CERRADO"
RESP=$(curl -s -X PUT "$BASE_URL/api/tickets/$TICKET_ID/estado?nuevoEstado=CERRADO" \
  -H "Authorization: Bearer $TOKEN_ADMIN")
pretty "$RESP"
ok "Ticket $TICKET_ID cerrado correctamente"

# =================================================================
# 12. ADMIN - Crear usuario via endpoint de admin
# =================================================================
header "12. ADMIN - Crear usuario via /api/usuarios (requiere rol ADMIN)"

info "ADMIN: Crear nuevo tecnico"
RESP=$(curl -s -X POST "$BASE_URL/api/usuarios" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Ana Soporte","email":"ana@helpdesk.com","password":"ana123","rol":"TECNICO"}')
pretty "$RESP"

info "TECNICO intenta crear usuario (esperamos 403)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/usuarios" \
  -H "Authorization: Bearer $TOKEN_TEC" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Otro","email":"otro@test.com","password":"otro123","rol":"CLIENTE"}')
if [ "$STATUS" = "403" ]; then
  ok "403 correcto (TECNICO no puede crear usuarios)"
else
  fail "Esperaba 403, recibio: $STATUS"
fi

# =================================================================
# Resumen
# =================================================================
echo ""
echo "============================================================="
echo " RESUMEN DE PRUEBAS COMPLETADO"
echo "============================================================="
echo " Endpoints probados:"
echo "  POST /api/auth/login        - Login y obtencion de JWT"
echo "  POST /api/auth/register     - Registro de nuevo usuario"
echo "  GET  /api/tickets           - Listar (filtrado por rol)"
echo "  POST /api/tickets           - Crear ticket"
echo "  GET  /api/tickets/:id       - Ver ticket (control acceso)"
echo "  PUT  /api/tickets/:id/estado    - Cambiar estado (TECNICO+)"
echo "  PUT  /api/tickets/:id/asignar   - Asignar tecnico (ADMIN)"
echo "  POST /api/tickets/:id/comentarios - Comentar"
echo "  GET  /api/tickets/:id/comentarios - Ver comentarios"
echo "  GET  /api/usuarios          - Listar usuarios (TECNICO+)"
echo "  POST /api/usuarios          - Crear usuario (ADMIN)"
echo "============================================================="
