# 🚀 Guía Completa: Deploy Frontend en Vercel

## 📋 Pre-requisitos Completados ✅

- ✅ Código frontend con multi-tenancy implementado
- ✅ `vercel.json` creado
- ✅ `.env.production` configurado
- ✅ Código en GitHub: `RubenRamosM/ClinicaDental-frontend`

---

## 🎯 Paso 1: Preparar el Proyecto

### Verificar que todo esté listo:

```bash
# 1. Verificar que el build funciona localmente
npm run build

# 2. Preview del build
npm run preview

# 3. Verificar archivos importantes
dir vercel.json
dir .env.production
```

✅ **Si todo funciona bien, continúa al Paso 2**

---

## 🌐 Paso 2: Crear Cuenta en Vercel

### Opción A: Registro con GitHub (Recomendado)

1. Ve a: **https://vercel.com**
2. Click en **"Sign Up"**
3. Selecciona **"Continue with GitHub"**
4. Autoriza a Vercel acceder a tus repos
5. ✅ Listo, ya tienes cuenta

### Opción B: Email

1. Registrarse con email
2. Verificar correo
3. Conectar GitHub después desde Settings

---

## 📦 Paso 3: Importar Proyecto a Vercel

### Método 1: Desde el Dashboard Web (Recomendado para principiantes)

1. **Login a Vercel Dashboard**: https://vercel.com/dashboard

2. **Click en "Add New..." → Project**

3. **Buscar tu repositorio**:
   - Busca: `ClinicaDental-frontend`
   - Si no aparece, click en "Adjust GitHub App Permissions"
   - Autoriza acceso al repositorio

4. **Click en "Import"** junto al repo

5. **Configurar el proyecto**:
   
   **Project Name:** `clinica-dental-frontend` (o el que prefieras)
   
   **Framework Preset:** Vite (detectado automáticamente)
   
   **Root Directory:** `./` (dejar por defecto)
   
   **Build Settings:**
   - Build Command: `npm run build` (detectado automáticamente)
   - Output Directory: `dist` (detectado automáticamente)
   - Install Command: `npm install` (detectado automáticamente)

6. **⚠️ NO HAGAS DEPLOY TODAVÍA** - Primero configuraremos las variables de entorno

---

## 🔐 Paso 4: Configurar Variables de Entorno

### Desde el Dashboard:

1. **Antes de hacer deploy**, click en **"Environment Variables"**

2. **Agregar una por una**:

```
Name: VITE_API_BASE
Value: https://clinicadental-backend.onrender.com/api/v1
Environment: Production

Name: VITE_BACKEND_URL
Value: https://clinicadental-backend.onrender.com
Environment: Production

Name: VITE_API_URL
Value: https://clinicadental-backend.onrender.com/api/v1
Environment: Production

Name: VITE_DOMAIN_BASE
Value: psicoadmin.xyz
Environment: Production

Name: VITE_USE_SUBDOMAIN
Value: true
Environment: Production

Name: VITE_ENVIRONMENT
Value: production
Environment: Production

Name: VITE_STRIPE_PUBLIC_KEY
Value: pk_test_51SGSX5RxIhITCnEhwyPtoKa0LAWxHpMcr3Tw20Aqw9vkB8ncErHhIP1IvXmQjTdovbeQQMx55dGqiKqvTrJsjevj00Qd4GEebn
Environment: Production
```

3. **Click "Add"** para cada una

---

## 🚀 Paso 5: Deploy Inicial

### Ahora sí, hacer el primer deploy:

1. **Click en "Deploy"**

2. **Esperar el build** (2-5 minutos):
   - Verás logs en tiempo real
   - ✅ Build exitoso → Continúa
   - ❌ Build fallido → Revisa logs y corrige

3. **Una vez completado**, verás:
   ```
   ✅ Deployment Ready
   https://clinica-dental-frontend-abc123.vercel.app
   ```

4. **Probar la URL temporal**:
   - Abre: `https://clinica-dental-frontend-abc123.vercel.app`
   - Debería cargar el login
   - Verifica consola (F12) que no haya errores

---

## 🌐 Paso 6: Configurar Dominio Personalizado

### 6.1. Agregar Dominios en Vercel

1. **Ve a**: Settings → Domains

2. **Agregar dominio principal**:
   - Ingresar: `psicoadmin.xyz`
   - Click **"Add"**

3. **Agregar www (opcional)**:
   - Ingresar: `www.psicoadmin.xyz`
   - Click **"Add"**

4. **Agregar wildcard para tenants** (¡Importante!):
   - Ingresar: `*.psicoadmin.xyz`
   - Click **"Add"**

5. **Vercel mostrará la configuración DNS necesaria**

---

### 6.2. Configurar DNS (Hostinger)

1. **Login a Hostinger**: https://hpanel.hostinger.com

2. **Ir a**: Dominios → `psicoadmin.xyz` → DNS / Name Servers

3. **Eliminar registros A antiguos** (si existen)

4. **Agregar nuevos registros**:

**Registro 1: Dominio raíz**
```
Type: A
Name: @ (o dejar vacío)
Points to: 76.76.21.21
TTL: 14400 (o Auto)
```

**Registro 2: www**
```
Type: CNAME
Name: www
Points to: cname.vercel-dns.com
TTL: 14400
```

**Registro 3: Wildcard (MUY IMPORTANTE)**
```
Type: CNAME
Name: *
Points to: cname.vercel-dns.com
TTL: 14400
```

5. **Click "Add Record"** para cada uno

6. **Guardar cambios**

---

### 6.3. Verificar Propagación DNS

```powershell
# Esperar 5-10 minutos, luego verificar:

# Verificar dominio principal
nslookup psicoadmin.xyz

# Verificar wildcard
nslookup norte.psicoadmin.xyz
nslookup sur.psicoadmin.xyz

# Resultado esperado:
# Address: 76.76.21.21
```

---

## 🔒 Paso 7: Verificar SSL

### Vercel genera certificados SSL automáticamente:

1. **Regresar a**: Vercel Dashboard → Settings → Domains

2. **Verificar cada dominio**:
   ```
   ✅ psicoadmin.xyz - Valid Configuration - SSL Certificate: Active
   ✅ *.psicoadmin.xyz - Valid Configuration - SSL Certificate: Active
   ```

3. **Tiempo estimado**: 5-15 minutos después de configurar DNS

4. **Si tarda más de 30 minutos**:
   - Click en "Refresh" junto al dominio
   - O eliminar y volver a agregar

---

## ✅ Paso 8: Testing Completo

### 8.1. Test de URLs

```powershell
# Test 1: Dominio público
curl https://psicoadmin.xyz

# Test 2: Subdominios de tenants
curl https://norte.psicoadmin.xyz
curl https://sur.psicoadmin.xyz
curl https://este.psicoadmin.xyz
curl https://oeste.psicoadmin.xyz

# Todos deberían retornar 200 OK
```

### 8.2. Test desde Navegador

1. **Sistema Central**:
   - URL: `https://psicoadmin.xyz`
   - Debería mostrar: "Sistema Central" en el TopBar
   - Login debería funcionar

2. **Clínica Norte**:
   - URL: `https://norte.psicoadmin.xyz`
   - Debería mostrar: "Clínica Norte" en el TopBar
   - Console (F12): Verificar que `X-Tenant-Subdomain: norte`

3. **Clínica inexistente**:
   - URL: `https://inventado.psicoadmin.xyz`
   - Debería mostrar: Componente "Tenant No Encontrado"

### 8.3. Verificar en Console (F12)

Abre cualquier subdominio y verifica:

```javascript
// Console debería mostrar:
🔧 API Configuration:
- Environment: production
- Tenant: norte (o el subdominio actual)
- baseURL: https://clinicadental-backend.onrender.com/api/v1
```

---

## 🔄 Paso 9: Deploy Automático (CI/CD)

### Ahora cada push a GitHub despliega automáticamente:

```bash
# Hacer cambios en el código
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# Vercel detecta el push y despliega automáticamente
# Monitorear en: Dashboard → Deployments
```

### Preview Deployments:

```bash
# Feature branch → Preview
git checkout -b feature/nueva-funcion
git push origin feature/nueva-funcion

# Vercel crea preview URL:
# https://clinica-dental-frontend-git-feature-xxx.vercel.app
```

---

## 📊 Paso 10: Monitoreo

### 10.1. Ver Logs

1. **Dashboard** → Tu proyecto → **"Logs"**
2. Ver errores en tiempo real
3. Filtrar por: Errors, Warnings, Info

### 10.2. Analytics

1. **Dashboard** → Tu proyecto → **"Analytics"**
2. Ver:
   - Visitas por página
   - Performance (Web Vitals)
   - Top pages
   - Tráfico por país

---

## 🆘 Troubleshooting

### Problema 1: "Build failed"

**Solución:**
```bash
# Probar build local
npm run build

# Ver logs en Vercel Dashboard → Deployments → Click en el fallido
# Errores comunes:
# - Falta dependencia → npm install [paquete]
# - Error TypeScript → Revisar código
# - Variable de entorno faltante → Agregar en Settings
```

### Problema 2: "Domain is not configured"

**Solución:**
```powershell
# Verificar DNS
nslookup psicoadmin.xyz

# Si no resuelve:
# 1. Revisar registros DNS en Hostinger
# 2. Esperar 10-30 min para propagación
# 3. Limpiar caché DNS: ipconfig /flushdns
```

### Problema 3: "SSL Certificate pending"

**Solución:**
- Esperar 15 minutos
- Verificar que DNS esté correcto
- Click "Refresh" en Vercel Domains
- Si persiste, eliminar dominio y volver a agregar

### Problema 4: "Cannot connect to backend"

**Solución:**
```javascript
// Verificar en console:
console.log(import.meta.env.VITE_API_BASE);
// Debe mostrar: https://clinicadental-backend.onrender.com/api/v1

// Verificar backend esté corriendo:
// 1. Ir a Render Dashboard
// 2. Verificar que servicio esté "Live"
// 3. Revisar logs para errores CORS
```

---

## 📝 Checklist Final

Antes de dar por terminado el deploy:

- [ ] ✅ Build exitoso en Vercel
- [ ] ✅ Dominio `psicoadmin.xyz` agregado
- [ ] ✅ Wildcard `*.psicoadmin.xyz` agregado
- [ ] ✅ SSL válido en todos los dominios
- [ ] ✅ DNS propagado correctamente
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Login funciona en `norte.psicoadmin.xyz`
- [ ] ✅ Detección de tenant correcta
- [ ] ✅ Headers `X-Tenant-Subdomain` enviándose
- [ ] ✅ Backend respondiendo desde Render
- [ ] ✅ CORS configurado correctamente

---

## 🎉 ¡Deploy Completado!

### URLs de tu aplicación:

**Producción:**
- 🌐 Sistema Central: `https://psicoadmin.xyz`
- 🏥 Clínica Norte: `https://norte.psicoadmin.xyz`
- 🏥 Clínica Sur: `https://sur.psicoadmin.xyz`
- 🏥 Clínica Este: `https://este.psicoadmin.xyz`
- 🏥 Clínica Oeste: `https://oeste.psicoadmin.xyz`

**Desarrollo:**
- 🧪 Vercel App: `https://clinica-dental-frontend.vercel.app`

### Siguientes pasos:

1. ✅ Probar login en cada tenant
2. ✅ Verificar funcionalidades principales
3. ✅ Configurar backend CORS para producción
4. ✅ Actualizar credenciales de Stripe a production
5. ✅ Configurar monitoring y alertas

---

## 📚 Recursos Útiles

- **Vercel Docs**: https://vercel.com/docs
- **Wildcard Domains**: https://vercel.com/docs/concepts/projects/domains/wildcard-domains
- **Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
- **DNS Checker**: https://www.whatsmydns.net

---

**¿Necesitas ayuda?** Revisa los logs en:
- Vercel: Dashboard → Logs
- Browser: F12 → Console / Network
- Backend: Render Dashboard → Logs

---

**Última actualización**: Noviembre 4, 2025  
**Estado**: ✅ Listo para deploy
