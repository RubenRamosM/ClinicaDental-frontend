# ✅ Checklist Deploy Vercel - Clínica Dental

## Pre-requisitos ✅
- [x] Código en GitHub: `RubenRamosM/ClinicaDental-frontend`
- [x] `vercel.json` creado
- [x] `.env.production` configurado
- [x] Multi-tenancy implementado

---

## 🚀 Pasos del Deploy

### Paso 1: Cuenta Vercel
- [ ] Ir a https://vercel.com
- [ ] Sign up con GitHub
- [ ] Autorizar acceso a repositorios

### Paso 2: Importar Proyecto
- [ ] Dashboard → "Add New Project"
- [ ] Buscar: `ClinicaDental-frontend`
- [ ] Click "Import"
- [ ] **NO deployas todavía**

### Paso 3: Variables de Entorno
Agregar en "Environment Variables" (Production):

- [ ] `VITE_API_BASE` = `https://clinicadental-backend.onrender.com/api/v1`
- [ ] `VITE_BACKEND_URL` = `https://clinicadental-backend.onrender.com`
- [ ] `VITE_API_URL` = `https://clinicadental-backend.onrender.com/api/v1`
- [ ] `VITE_DOMAIN_BASE` = `psicoadmin.xyz`
- [ ] `VITE_USE_SUBDOMAIN` = `true`
- [ ] `VITE_ENVIRONMENT` = `production`
- [ ] `VITE_STRIPE_PUBLIC_KEY` = `pk_test_51SGSX5RxIhITCnEh...`

### Paso 4: Deploy Inicial
- [ ] Click "Deploy"
- [ ] Esperar build (2-5 min)
- [ ] Verificar: ✅ Deployment Ready
- [ ] Probar URL temporal: `https://clinica-dental-frontend-xxx.vercel.app`

### Paso 5: Configurar Dominios en Vercel
- [ ] Settings → Domains
- [ ] Agregar: `psicoadmin.xyz`
- [ ] Agregar: `*.psicoadmin.xyz`
- [ ] (Opcional) Agregar: `www.psicoadmin.xyz`
- [ ] Anotar configuración DNS requerida

### Paso 6: Configurar DNS en Hostinger
Ir a: https://hpanel.hostinger.com → Dominios → `psicoadmin.xyz` → DNS

**Eliminar registros A antiguos (si existen)**

**Agregar:**

Registro 1:
- [ ] Type: `A`
- [ ] Name: `@`
- [ ] Points to: `76.76.21.21`
- [ ] TTL: Auto

Registro 2:
- [ ] Type: `CNAME`
- [ ] Name: `www`
- [ ] Points to: `cname.vercel-dns.com`
- [ ] TTL: Auto

Registro 3 (IMPORTANTE):
- [ ] Type: `CNAME`
- [ ] Name: `*`
- [ ] Points to: `cname.vercel-dns.com`
- [ ] TTL: Auto

- [ ] Guardar cambios

### Paso 7: Verificar DNS (Esperar 5-15 min)

```powershell
nslookup psicoadmin.xyz
nslookup norte.psicoadmin.xyz
```

- [ ] DNS propagado correctamente

### Paso 8: Verificar SSL
- [ ] Vercel Dashboard → Domains
- [ ] Todos con "SSL Certificate: Valid"
- [ ] (Esperar hasta 15 min si dice "Pending")

### Paso 9: Testing

**URLs a probar:**

- [ ] `https://psicoadmin.xyz` → Muestra "Sistema Central"
- [ ] `https://norte.psicoadmin.xyz` → Muestra "Clínica Norte"
- [ ] `https://sur.psicoadmin.xyz` → Muestra "Clínica Sur"
- [ ] `https://este.psicoadmin.xyz` → Muestra "Clínica Este"
- [ ] `https://oeste.psicoadmin.xyz` → Muestra "Clínica Oeste"

**Testing de Login:**

- [ ] Login en `norte.psicoadmin.xyz` funciona
- [ ] Backend responde correctamente
- [ ] No hay errores CORS
- [ ] Headers `X-Tenant-Subdomain` se envían

**Verificar en Console (F12):**

- [ ] No hay errores JavaScript
- [ ] Logs muestran tenant correcto
- [ ] Requests van al backend correcto

---

## 🎉 Deploy Completado

- [ ] ✅ Todos los subdominios funcionan
- [ ] ✅ SSL activo en todos
- [ ] ✅ Login funciona
- [ ] ✅ Multi-tenancy detecta correctamente
- [ ] ✅ Backend responde sin errores

---

## 🔧 Post-Deploy

### Configurar CI/CD
- [ ] Verificar que push a `main` despliega automáticamente
- [ ] Probar feature branch → crea preview deployment

### Configurar Backend (Render)
- [ ] Actualizar CORS para permitir `*.psicoadmin.xyz`
- [ ] Verificar que backend esté Live
- [ ] Probar endpoints desde producción

### Monitoreo
- [ ] Configurar alerts en Vercel
- [ ] Revisar Analytics
- [ ] Monitorear logs

---

## 🆘 Si algo falla

**Build Error:**
```bash
# Probar local
npm run build
# Revisar logs en Vercel Dashboard → Deployments
```

**DNS no resuelve:**
```powershell
# Limpiar caché
ipconfig /flushdns
# Esperar más tiempo (hasta 30 min)
```

**SSL pending:**
- Refresh en Vercel Domains
- Eliminar y volver a agregar dominio

**Cannot connect to backend:**
- Verificar variables de entorno
- Revisar CORS en backend
- Check backend esté Live en Render

---

## 📚 Recursos

- **Guía completa**: `DEPLOY_VERCEL_GUIA.md`
- **Vercel Docs**: https://vercel.com/docs
- **DNS Checker**: https://www.whatsmydns.net

---

**Fecha de deploy**: ___________  
**Desplegado por**: ___________  
**URL principal**: https://psicoadmin.xyz
