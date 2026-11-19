# tertulia-ng

Frontend Angular de **Tertulia** (DUOC Full Stack III) — foro en línea con JWT.

Consume tres microservicios:

| Servicio | Repo | Puerto |
|----------|------|--------|
| Auth / usuarios | [ms-usuarios](https://github.com/TriniCorvalan/ms-usuarios) | 8081 |
| Foro | [ms-foro](https://github.com/TriniCorvalan/ms-foro) | 8082 |
| Moderación | [ms-moderacion](https://github.com/TriniCorvalan/ms-moderacion) | 8083 |

| Capacidad | Detalle |
|-----------|---------|
| Stack | Angular 21 (standalone), Bootstrap 5, RxJS |
| Auth | Login/registro vía `ms-usuarios`; JWT en `localStorage` |
| Foro | Categorías, temas y comentarios vía `ms-foro` |
| Moderación | Ban/desban (ADMIN) vía `ms-moderacion` |

## Arquetipo MVC (Angular)

| Pieza | En este proyecto |
|-------|------------------|
| **Modelo** | Interfaces + servicios HTTP (`AuthService`, `ForoService`, `ModeracionService`) |
| **Vista** | Templates HTML de `pages/` y `shared/` |
| **Controlador** | Componentes de página que orquestan rutas y llamadas |

## Desarrollo local (`ng serve`)

Necesitás los tres MS en local (`:8081`, `:8082`, `:8083`) y:

```bash
npm start
```

Abrí http://localhost:4200  
URLs en `src/environments/environment.ts`.

## Docker Compose (local, los 4 servicios)

Desde **este** directorio:

```bash
cp .env.example .env
docker compose up --build
```

| URL | Qué |
|-----|-----|
| http://localhost:8088 | Frontend (Nginx proxy) |
| http://localhost:8081 | ms-usuarios |
| http://localhost:8082 | ms-foro |
| http://localhost:8083 | ms-moderacion |

El wallet se monta desde `../library/Wallet_TG243BR3UDTANBR0` (o `ORACLE_WALLET_DIR`).

En producción el front usa rutas relativas (`environment.prod.ts`):

- `/auth`, `/usuarios` → ms-usuarios  
- `/api/...` → ms-foro (prefijo para no chocar con rutas Angular `/categorias` y `/temas`)  
- `/moderacion/...` → ms-moderacion  

## Credenciales de prueba

| Email | Password | Rol |
|-------|----------|-----|
| admin@foro.cl | Admin123! | ADMIN |
| juan@foro.cl | User123! | USUARIO |

## Despliegue AWS Academy (EC2) — playbook

Stack **nuevo** solo para Tertulia (instancia aparte de library).  
**Misma región `us-east-1`**, **mismo wallet S3** de library.  
Credenciales DB del schema **`FORO_APP`** (Secrets Manager).  
Nginx del host en `:80` (usar **http://**, no https).

Plantilla: [`ec2/tertulia-ec2-stack.yml`](ec2/tertulia-ec2-stack.yml).

### 1. Secreto Oracle (FORO_APP)

En Secrets Manager (`us-east-1`), JSON/key-value:

| Clave | Valor |
|-------|--------|
| `DB_URL` | Alias TNS (ej. `tg243br3udtanbr0_tp`) |
| `DB_USERNAME` | `FORO_APP` |
| `DB_PASSWORD` | Password del schema foro |
| `JWT_SECRET` | Opcional; si falta, los MS usan el default del foro |

Anotá el **ARN**.

### 2. Secrets y variables en GitHub

**Secrets** (los 4 repos: `tertulia-ng`, `ms-usuarios`, `ms-foro`, `ms-moderacion`):

| Secret | Valor |
|--------|--------|
| `AWS_ACCESS_KEY_ID` | Lab Academy |
| `AWS_SECRET_ACCESS_KEY` | Lab Academy |
| `AWS_SESSION_TOKEN` | Lab Academy (renovar los tres juntos) |

**Variables en `tertulia-ng`:**

| Variable | Valor |
|----------|--------|
| `ORACLE_CREDENTIALS_SECRET_ARN` | ARN del secreto FORO_APP |
| `ORACLE_WALLET_S3_BUCKET` | Bucket del wallet (el de library) |
| `ORACLE_WALLET_S3_KEY` | `Wallet.zip` (o la clave real) |
| `EC2_INSTANCE_ID` | Se setea **después** del prepare |
| `EC2_STACK_NAME` | Opcional (`tertulia-ec2`) |
| `AWS_ACCOUNT_ID` | Opcional |

**Variables en cada MS:** `EC2_INSTANCE_ID`, `ORACLE_CREDENTIALS_SECRET_ARN`, `ORACLE_WALLET_S3_BUCKET`, `ORACLE_WALLET_S3_KEY`.

La región está **fija en `us-east-1`** en los workflows (no hace falta `AWS_REGION`).

### 3. Crear el stack EC2

1. Actions en **tertulia-ng** → **Prepare EC2 CloudFormation stack** → Run workflow.  
2. En el summary: `InstanceId`, `PublicIp`, `WebsiteUrl`.  
3. Seteá `EC2_INSTANCE_ID` en los **4** repos.  
4. SSM → Fleet Manager: instancia **Online**.  
5. En Oracle ADB, ACL de red: permitir la IP pública de esta EC2 (o `0.0.0.0/0` en lab).

El wallet **ya debe existir** en S3 (reuso de library); este stack **no** crea bucket nuevo.

### 4. Desplegar (orden)

1. `ms-usuarios` → **Test, publish and deploy … to EC2**  
2. `ms-foro` → idem  
3. `ms-moderacion` → idem  
4. `tertulia-ng` → **Publish and deploy frontend to EC2**

### 5. Smoke (HTTP)

```bash
IP=18.234.89.87   # reemplazar por tu PublicIp

curl -s "http://$IP/" | head
curl -s "http://$IP/api/categorias"
curl -s -o /dev/null -w "%{http_code}\n" -X POST "http://$IP/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@foro.cl","password":"Admin123!"}'
```

En el browser: **http://IP/** → login con `admin@foro.cl` / `Admin123!` → categorías y (ADMIN) moderación.

| Síntoma | Qué revisar |
|---------|-------------|
| `ERR_CONNECTION_TIMED_OUT` con https | Usar **http://** (solo puerto 80) |
| `ORA-03113` / MS no arranca | ACL Oracle + IP de la EC2; re-run del workflow del MS |
| Secrets `NoCredentials` | Renovar los tres secrets Academy en todos los repos |
| IP cambió tras stop/start | Actualizar URL; no hay Elastic IP en el lab |

## Workflows

| Repo | Workflow |
|------|----------|
| tertulia-ng | Prepare EC2 / Publish frontend |
| ms-usuarios, ms-foro, ms-moderacion | Publish + deploy a EC2 |
