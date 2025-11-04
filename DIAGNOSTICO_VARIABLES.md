# 🔍 DIAGNÓSTICO DE VARIABLES DE ENTORNO

## ✅ Variables en `.env.production` (CORRECTAS)

```bash
VITE_API_BASE=https://clinicadental-backend.onrender.com/api/v1
VITE_BACKEND_URL=https://clinicadental-backend.onrender.com
VITE_API_URL=https://clinicadental-backend.onrender.com/api/v1
VITE_DOMAIN_BASE=psicoadmin.xyz
VITE_USE_SUBDOMAIN=true
VITE_ENVIRONMENT=production
VITE_STRIPE_PUBLIC_KEY=pk_test_51SGSX5RxIhITCnEhwyPtoKa0LAWxHpMcr3Tw20Aqw9vkB8ncErHhIP1IvXmQjTdovbeQQMx55dGqiKqvTrJsjevj00Qd4GEebn
VITE_APP_NAME=Clínica Dental
VITE_APP_VERSION=1.0.0
```

---

## 🎯 CÓMO SE CONSTRUYE LA URL

### Código en `src/utils/tenant.ts`:

```typescript
export const getApiBaseUrl = (): string => {
  const isDevelopment = import.meta.env.DEV;
  
  if (isDevelopment) {
    return import.meta.env.VITE_API_BASE || 'http://localhost:8001/api/v1';
  }
  
  // PRODUCCIÓN
  return import.meta.env.VITE_API_BASE || 'https://clinicadental-backend.onrender.com/api/v1';
};
```

### Código en `src/lib/Api.ts`:

```typescript
import { getApiBaseUrl } from '../utils/tenant';

const baseURL = getApiBaseUrl();  // ← Lee VITE_API_BASE

export const Api = axios.create({
  baseURL,  // ← https://clinicadental-backend.onrender.com/api/v1
  withCredentials: true,
  timeout: 30000,
});
```

### Llamada en `LoginBackend.tsx`:

```typescript
const loginUrl = "/auth/login/";
await Api.post<LoginSuccess>(loginUrl, body);
```

### URL FINAL CONSTRUIDA:

```
baseURL + loginUrl
= https://clinicadental-backend.onrender.com/api/v1 + /auth/login/
= https://clinicadental-backend.onrender.com/api/v1/auth/login/  ✅ CORRECTO
```

---

## ❌ PROBLEMA DETECTADO: VERCEL NO TIENE LAS VARIABLES

El archivo `.env.production` **NO se sube a Vercel automáticamente** por razones de seguridad.

Vercel **ignora** los archivos `.env*` y necesitas configurar las variables **manualmente** en el dashboard.

---

## 🔧 SOLUCIÓN: CONFIGURAR EN VERCEL

### Paso 1: Ve a Vercel Dashboard
```
https://vercel.com/
→ Selecciona tu proyecto "ClinicaDental-frontend"
→ Settings → Environment Variables
```

### Paso 2: Agrega ESTAS 9 VARIABLES (una por una):

| # | Variable | Valor | Environment |
|---|----------|-------|-------------|
| 1 | `VITE_API_BASE` | `https://clinicadental-backend.onrender.com/api/v1` | Production, Preview, Development |
| 2 | `VITE_BACKEND_URL` | `https://clinicadental-backend.onrender.com` | Production, Preview, Development |
| 3 | `VITE_API_URL` | `https://clinicadental-backend.onrender.com/api/v1` | Production, Preview, Development |
| 4 | `VITE_DOMAIN_BASE` | `psicoadmin.xyz` | Production, Preview, Development |
| 5 | `VITE_USE_SUBDOMAIN` | `true` | Production, Preview, Development |
| 6 | `VITE_ENVIRONMENT` | `production` | Production |
| 7 | `VITE_STRIPE_PUBLIC_KEY` | `pk_test_51SGSX5RxIhITCnEhwyPtoKa0LAWxHpMcr3Tw20Aqw9vkB8ncErHhIP1IvXmQjTdovbeQQMx55dGqiKqvTrJsjevj00Qd4GEebn` | Production, Preview, Development |
| 8 | `VITE_APP_NAME` | `Clínica Dental` | Production, Preview, Development |
| 9 | `VITE_APP_VERSION` | `1.0.0` | Production, Preview, Development |

### Paso 3: REDEPLOY
```
Deployments → Click en el último → Redeploy
```

---

## 🧪 VERIFICAR QUE FUNCIONÓ

Después del redeploy, abre DevTools (F12) en Vercel:

```javascript
Console → Escribe:
import.meta.env.VITE_API_BASE

// Debería mostrar:
// "https://clinicadental-backend.onrender.com/api/v1"
```

También verás en Network tab:
```
Request URL: https://clinicadental-backend.onrender.com/api/v1/auth/login/
```

---

## 📊 RESUMEN DEL PROBLEMA

| Componente | Estado | Descripción |
|------------|--------|-------------|
| `.env.production` | ✅ CORRECTO | Tiene `/api/v1` |
| `src/utils/tenant.ts` | ✅ CORRECTO | Lee `VITE_API_BASE` |
| `src/lib/Api.ts` | ✅ CORRECTO | Usa `getApiBaseUrl()` |
| `LoginBackend.tsx` | ✅ CORRECTO | Ruta relativa `/auth/login/` |
| **Vercel Dashboard** | ❌ **FALTA** | **NO tiene las variables configuradas** |

**Por eso Vercel usa el valor por defecto hardcodeado** que está en el código:

```typescript
return import.meta.env.VITE_API_BASE || 'https://clinicadental-backend.onrender.com/api/v1';
//                                     ↑
//                            Este es el fallback
```

Si `import.meta.env.VITE_API_BASE` es `undefined` (porque no está en Vercel), usa el fallback.

**PERO** si por alguna razón el código viejo se construyó con un valor diferente, entonces necesitas **redeploy** después de agregar las variables.

---

## 🎯 ACCIÓN REQUERIDA

1. ✅ **Configura las 9 variables en Vercel** (arriba)
2. ✅ **Redeploy** el proyecto
3. ✅ **Verifica** en DevTools que `VITE_API_BASE` tenga el valor correcto
4. ✅ **Prueba login** nuevamente

---

**¿Necesitas ayuda con algún paso?** 🚀
