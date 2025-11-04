# 🌐 Frontend Multi-Tenancy - Sistema Clínica Dental

## 📋 Configuración Implementada

El frontend ahora soporta **detección automática de subdominios** para conectarse al tenant correcto en el backend.

---

## ✅ Características

- ✅ **Detección automática de subdominio** desde la URL
- ✅ **Headers personalizados** para identificar tenant en el backend
- ✅ **Redirección inteligente** si el usuario pertenece a otro tenant
- ✅ **Manejo de errores** para tenants no encontrados
- ✅ **Soporte desarrollo y producción** con diferentes configuraciones
- ✅ **Logging detallado** en modo desarrollo

---

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

El archivo `.env` ya está configurado para desarrollo local:

```bash
VITE_API_BASE=http://localhost:8001/api/v1
VITE_DOMAIN_BASE=localhost
VITE_USE_SUBDOMAIN=true
VITE_ENVIRONMENT=development
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

El servidor iniciará en `http://localhost:5173` con soporte para subdominios.

---

## 🌐 Acceso por Subdominios (Desarrollo Local)

### URLs Disponibles:

| URL | Tenant | Descripción |
|-----|--------|-------------|
| `http://localhost:5173` | `public` | Sistema Central (sin tenant) |
| `http://norte.localhost:5173` | `norte` | Clínica Norte |
| `http://sur.localhost:5173` | `sur` | Clínica Sur |
| `http://este.localhost:5173` | `este` | Clínica Este |
| `http://oeste.localhost:5173` | `oeste` | Clínica Oeste |

**Nota:** Los navegadores modernos (Chrome, Firefox, Edge) reconocen automáticamente `*.localhost` sin necesidad de configurar el archivo `hosts`.

---

## 🔧 Archivos Clave Implementados

### 1. `src/utils/tenant.ts`

Utilidades para detección de tenant:

```typescript
import { getTenantInfo, getApiBaseUrl, getTenantHeader } from '../utils/tenant';

// Obtener información del tenant actual
const tenantInfo = getTenantInfo();
console.log(tenantInfo);
// {
//   subdomain: 'norte',
//   isPublic: false,
//   hostname: 'norte.localhost',
//   tenantId: 'norte',
//   displayName: 'Clínica Norte'
// }

// Obtener URL del API
const apiUrl = getApiBaseUrl();
// 'http://localhost:8001/api/v1'

// Obtener headers para requests
const headers = getTenantHeader();
// { 'X-Tenant-Subdomain': 'norte' }
```

### 2. `src/lib/Api.ts` (Actualizado)

Cliente Axios configurado automáticamente:

- ✅ Detecta tenant desde la URL
- ✅ Agrega header `X-Tenant-Subdomain` en cada request
- ✅ Maneja errores 404 de tenant no encontrado
- ✅ Maneja errores 401 de autenticación
- ✅ Logs detallados en desarrollo

### 3. `src/components/TenantNotFound.tsx`

Componente que se muestra cuando un tenant no existe:

```tsx
import TenantNotFound from './components/TenantNotFound';

// En tu router o App.tsx
<Route path="/tenant-not-found" element={<TenantNotFound />} />
```

### 4. `vite.config.ts` (Actualizado)

Configuración para soportar subdominios:

```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'localhost',
      '.localhost',
      'norte.localhost',
      'sur.localhost',
      // ... más subdominios
    ]
  }
})
```

---

## 📡 Flujo de Autenticación Multi-Tenant

### Escenario 1: Usuario accede a su tenant correcto

```
1. Usuario va a: http://norte.localhost:5173/login
2. getTenantInfo() detecta: tenantId = 'norte'
3. Usuario hace login
4. Backend valida credenciales en schema 'norte'
5. ✅ Login exitoso, redirige a dashboard
```

### Escenario 2: Usuario accede a tenant incorrecto

```
1. Usuario (de 'sur') va a: http://norte.localhost:5173/login
2. Usuario hace login
3. Backend detecta: usuario pertenece a 'sur', no 'norte'
4. Frontend recibe tenant del usuario en respuesta
5. redirectToTenant('sur') ejecuta
6. ↪️ Redirige a: http://sur.localhost:5173
```

### Escenario 3: Tenant no existe

```
1. Usuario va a: http://inventado.localhost:5173
2. Hace request al backend
3. Backend retorna 404 con error de tenant
4. Interceptor detecta error
5. ↪️ Redirige a: http://localhost:5173 (público)
6. Muestra componente TenantNotFound
```

---

## 🧪 Testing Local

### 1. Verificar Subdominios Funcionan

Abre el navegador en:
- `http://localhost:5173` → Debería cargar normalmente
- `http://norte.localhost:5173` → Debería cargar con tenant 'norte'

### 2. Ver Logs en Consola

Abre DevTools (F12) → Console:

```
🔧 API Configuration:
- Environment: development
- Tenant: norte
- baseURL: http://localhost:8001/api/v1

[API] POST /autenticacion/login/ { tenant: 'norte', hasToken: false, tenantHeader: { X-Tenant-Subdomain: 'norte' } }
```

### 3. Verificar Headers en Network

DevTools → Network → Selecciona un request → Headers:

```
Request Headers:
  X-Tenant-Subdomain: norte
  Authorization: Token abc123...
```

---

## 🚀 Deployment a Producción

### 1. Actualizar `.env` para Producción

```bash
# Producción
VITE_API_BASE=https://clinicadental-backend.onrender.com/api/v1
VITE_DOMAIN_BASE=psicoadmin.xyz
VITE_USE_SUBDOMAIN=true
VITE_ENVIRONMENT=production
```

### 2. Configurar DNS Wildcard

En tu proveedor DNS (Cloudflare, Hostinger, etc.):

```
Tipo: CNAME
Nombre: *
Valor: tu-frontend.vercel.app
TTL: Automático
```

### 3. URLs de Producción

| URL | Tenant |
|-----|--------|
| `https://psicoadmin.xyz` | `public` |
| `https://norte.psicoadmin.xyz` | `norte` |
| `https://sur.psicoadmin.xyz` | `sur` |
| `https://este.psicoadmin.xyz` | `este` |
| `https://oeste.psicoadmin.xyz` | `oeste` |

---

## 🔍 Debugging

### Ver información del tenant actual

```tsx
import { getTenantInfo } from '../utils/tenant';

function MyComponent() {
  const tenantInfo = getTenantInfo();
  
  return (
    <div>
      <p>Tenant: {tenantInfo.tenantId}</p>
      <p>Display: {tenantInfo.displayName}</p>
      <p>Hostname: {tenantInfo.hostname}</p>
      <p>Is Public: {tenantInfo.isPublic ? 'Sí' : 'No'}</p>
    </div>
  );
}
```

### Forzar redirección a otro tenant

```tsx
import { redirectToTenant } from '../utils/tenant';

// Redirigir a Clínica Sur
redirectToTenant('sur');
// → http://sur.localhost:5173 (desarrollo)
// → https://sur.psicoadmin.xyz (producción)
```

---

## 📚 API de Utilidades

### `getTenantInfo()`

Retorna información del tenant actual:

```typescript
interface TenantInfo {
  subdomain: string | null;      // 'norte', 'sur', null
  isPublic: boolean;              // true si no hay subdominio
  hostname: string;               // 'norte.localhost'
  tenantId: string;               // 'norte' o 'public'
  displayName: string;            // 'Clínica Norte' o 'Sistema Central'
}
```

### `getApiBaseUrl()`

Retorna la URL base del API según el ambiente:

```typescript
// Desarrollo
getApiBaseUrl() // → 'http://localhost:8001/api/v1'

// Producción
getApiBaseUrl() // → 'https://clinicadental-backend.onrender.com/api/v1'
```

### `getTenantHeader()`

Retorna headers para incluir en requests:

```typescript
getTenantHeader() // → { 'X-Tenant-Subdomain': 'norte' }
```

### `validateTenantAccess(userTenant, currentTenant)`

Valida si un usuario puede acceder al tenant actual:

```typescript
validateTenantAccess('norte', 'norte') // → true
validateTenantAccess('sur', 'norte')   // → false
validateTenantAccess('public', 'norte') // → true (admin global)
```

### `redirectToTenant(tenantId)`

Redirige a otro tenant:

```typescript
redirectToTenant('sur')     // → http://sur.localhost:5173
redirectToTenant('public')  // → http://localhost:5173
```

---

## ⚠️ Notas Importantes

1. **Backend debe estar corriendo** en `http://localhost:8001` con configuración multi-tenant
2. **Headers CORS** deben permitir `*.localhost` en desarrollo
3. **Chrome/Firefox** funcionan mejor con subdominios `*.localhost`
4. **Safari** puede requerir configuración manual en `/etc/hosts`
5. **Logs de debugging** solo aparecen en modo desarrollo

---

## 🛠️ Solución de Problemas

### Problema: "Cannot GET /"

**Solución:** Verifica que Vite esté corriendo:
```bash
npm run dev
```

### Problema: Subdominios no funcionan

**Solución 1:** Usa Chrome o Firefox

**Solución 2:** Agrega a `hosts` (Windows):
```
C:\Windows\System32\drivers\etc\hosts

127.0.0.1 norte.localhost
127.0.0.1 sur.localhost
```

### Problema: Error CORS

**Solución:** Verifica backend en `settings.py`:
```python
CORS_ALLOW_ALL_ORIGINS = True  # Solo desarrollo
```

### Problema: Headers no se envían

**Solución:** Verifica en DevTools → Network que aparezca:
```
X-Tenant-Subdomain: norte
```

---

**Última actualización:** Noviembre 4, 2025  
**Estado:** ✅ Implementado y listo para usar
