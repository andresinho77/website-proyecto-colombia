# Refugio Temporal — Plataforma de Alojamiento de Emergencia
### Plan de proyecto para agentes de Copilot

## 1. Contexto y objetivo

Tras el terremoto del 10 de agosto de 2026 en Colombia (Chocó, con daños severos en
Pereira, Cali, Quibdó, Manizales y Armenia), miles de familias perdieron su vivienda o
no pueden regresar a ella. Las plataformas existentes (Fincaraíz, Metrocuadrado) están
diseñadas para arriendos formales de largo plazo y no sirven para conectar rápidamente
a quien **necesita** alojamiento temporal con quien **tiene** espacio disponible.

**Objetivo del MVP:** un sitio web público, sin necesidad de cuenta, donde:
- Alguien con espacio disponible puede publicar en menos de 60 segundos.
- Alguien que necesita alojamiento puede buscar/filtrar por ciudad y barrio en menos
  de 30 segundos.
- El contacto final ocurre por WhatsApp (deep link `wa.me`), no dentro de la app.

**Fuera de alcance del MVP:** pagos, contratos, verificación de identidad, chat interno,
app móvil nativa, bot de WhatsApp (fase 2).

**Prioridad geográfica inicial:** Pereira y Cali (barrio-level), con Quibdó, Manizales
y Armenia como siguientes.

## 1.1 Gobernanza documental (fuente de verdad)

- **Este archivo (`ROADMAP.md`) es la fuente de verdad** para estado de épicas,
  decisiones de arquitectura y dirección futura del producto.
- `README.md` se mantiene deliberadamente corto: contexto básico del proyecto,
  ejecución local y guía de setup.
- Si existe contradicción entre documentos, **prevalece `ROADMAP.md`** hasta que
  se reconcilie el resto de la documentación.

**Revisión de arquitectura (2026-08-21, completada):** corrida con la skill/
comando `.claude/commands/architecture-guardian.md` ("Early-Stage
Architecture Guardian" — enfoque *journeys-before-schema*). Resultado en
[`docs/architecture-foundation.md`](docs/architecture-foundation.md) —
journeys por actor, entidades/eventos, modelo de datos, contrato de API y
mapa de rutas, más 5 preguntas abiertas (la más urgente: US-7.3/purga de
datos no está implementada pero `docs/DATA_POLICY.md` ya la promete —
brecha de cumplimiento real, no hipotética). Separado de este `ROADMAP.md`,
que sigue gobernando estado de épicas/dirección de producto. Re-invocar
(`/architecture-guardian`) si el código y este documento divergen
significativamente.

---

## 2. Decisiones de arquitectura

Este proyecto tiene dos repositorios:
- **Este repo (frontend)**: aplicación Next.js con exportación estática. Genera un
  artefacto estático (`out/`) listo para desplegar en la infraestructura productiva.
- **Repo de infraestructura (IaC)**: mantenido por el arquitecto/DevOps del equipo,
  contiene la definición de la infraestructura AWS (RDS, Lambda/API, redes, SES).
  Este documento asume que ese repo existe por separado y solo describe el
  **contrato** entre frontend y backend, no la implementación de la infraestructura.

| Capa | Elección | Razón |
|---|---|---|
| Hosting frontend | S3 + CloudFront (producción real) | Entrega productiva del build estático desde el repo de infraestructura |
| Framework | Next.js 14 con exportación estática (`output: 'export'`) + Tailwind | Mantiene un desarrollo ágil, componentes reutilizables y un build listo para S3/CloudFront |
| Base de datos | AWS RDS (PostgreSQL) | Definido y administrado por el repo de infraestructura del arquitecto; control total sobre performance, escalado y cumplimiento de datos |
| Capa de API | API Gateway + Lambda (o equivalente definido en el repo de IaC) frente a RDS | El frontend estático necesita una API HTTP intermedia para crear, listar, reportar y resolver publicaciones |
| Notificaciones | Amazon SES | Alertas al equipo moderador (reportes, resumen diario), bajo costo, integra bien con el resto del stack AWS |
| Autenticación de usuarios finales | Ninguna para MVP | Fricción cero es la prioridad; moderación se hace por reporte + revisión manual (ver sección 7) |
| Contacto entre usuarios | Enlaces `https://wa.me/<numero>?text=...` | No requiere WhatsApp Business API; funciona en cualquier navegador/dispositivo |
| CI/CD frontend | GitHub Actions en este repo → paridad con `npm run validate` (typecheck, lint, tests, build) + artefacto estático reutilizable | Valida cada cambio con exactamente los mismos checks que el flujo local y produce el bundle que consume el repo de infraestructura |
| Validación de cambios | **Local-first**: `npm run validate` es el contrato único; sin preview ni staging propio del frontend | Sin ambientes intermedios que mantener durante la crisis; lo que pasa en local es lo que exige CI |
| CI/CD infraestructura | Definido en el repo de IaC (fuera del alcance de este documento) | Propiedad del arquitecto/DevOps |

**Ownership de despliegue (acordado):**
- **Producción** (`S3 + CloudFront`): se implementa y opera en
  `infra-proyecto-colombia`, consumiendo el artefacto estático que produce este repo.
- **CI del frontend** (build/type-check + artefacto estático): se opera en este repo.

**Punto de integración clave para el agente:** el frontend debe consumir la API
únicamente a través de una URL base configurable (variable de entorno, por ejemplo
`NEXT_PUBLIC_API_URL`), para que el equipo de infraestructura pueda cambiar
endpoints, dominios o versiones sin requerir cambios en el código del frontend.

**Contrato de `NEXT_PUBLIC_API_URL` (resuelto en `lib/api.ts`):**
- En build de despliegue (`NODE_ENV=production`) la variable es **obligatoria**;
  si falta, el build falla con instrucciones. El valor queda incrustado en el
  bundle estático, así que un default silencioso enviaría el artefacto a un
  endpoint adivinado.
- En desarrollo (`next dev`) se usa un fallback local deliberado
  (`http://localhost:4000/api/listings`, el servidor de `npm run dev:api`).
  Nunca se cae a producción por defecto.
- `npm run validate` inyecta ese mismo endpoint local vía `npm run build:local`.

**Pendiente de coordinación (2026-08-17):** el colega de infraestructura/backend
reportó por chat que una nueva versión de la API ("Api listo") está lista para
bajar/desplegar, en el contexto de la discusión sobre el catálogo de zonas
(ver US-4.4). Falta confirmar con él el contrato exacto expuesto (endpoints,
forma del catálogo de zonas) y reflejarlo en `openapi.yaml` antes de
consumirlo desde este repo.

**Alineación con el repo actual:** este plan asume que el repo mantiene la
implementación actual del MVP (landing, feed, formularios, moderación, PIN de autor,
imágenes y fallback local/offline) y que se refina para dejarlo listo para un
lanzamiento inicial estable y seguro.

---

## 3. Estructura del repositorio (frontend)

```
/
├── app/                        # páginas del sitio y routing principal
│   ├── page.tsx                # landing + feed + modales principales
│   ├── admin/                  # panel de moderación simple
│   └── terminos-y-privacidad/  # página de política y habeas data
├── components/                 # UI modular: navbar, hero, filtros, cards, modales, footer
├── lib/                        # tipos, cliente de API, almacenamiento local y utilidades
├── public/                     # assets estáticos de soporte si se requieren
├── scripts/                    # scripts locales de desarrollo / API mock
├── openapi.yaml                # contrato vigente del frontend con el backend
├── next.config.mjs             # configuración de exportación estática
├── .eslintrc.json              # configuración de lint (next/core-web-vitals)
├── .nvmrc                      # versión de Node compartida por local y CI
├── package.json                # dependencias y scripts (incl. `npm run validate`)
├── ROADMAP.md                  # este archivo (fuente de verdad)
└── README.md                   # guía de ejecución y despliegue
```

**Nota de implementación:** la estructura actual ya está orientada al MVP y el
plan debe mantenerla, refinando experiencia de usuario, validaciones, privacidad
y despliegue antes de lanzar.

---

## 4. Modelo de datos

Tabla `listings` en PostgreSQL (RDS). Un registro = una publicación. La
definición exacta del esquema/migraciones vive en el repo de infraestructura;
esto es el contrato mínimo que el frontend espera vía la API.

```json
{
  "id": "uuid",
  "tipo": "ofrezco | necesito",
  "ciudad": "Pereira | Cali | ...",
  "barrio": "string",
  "personas": "integer",
  "fecha_desde": "date",
  "fecha_hasta": "date | null (indefinido)",
  "precio": "integer | 0 (gratis)",
  "descripcion": "string, max 280 caracteres",
  "whatsapp": "string, formato E.164 (+57...)",
  "creado_en": "timestamp",
  "estado": "activo | resuelto | reportado | eliminado",
  "reportes": "integer, default 0"
}
```

Consideraciones de datos sensibles (ver también sección 7 — Política de Datos):
- `whatsapp` es un dato personal identificable. No debe exponerse en logs,
  analytics de terceros, ni respuestas de API más allá de lo estrictamente
  necesario para el contacto.
- No se recolecta cédula, dirección exacta (solo barrio), ni datos bancarios
  bajo ninguna circunstancia.
- El campo `estado = eliminado` debe representar borrado real o
  anonimización de `whatsapp` y `descripcion`, no solo un flag oculto —
  coordinarlo con el equipo de infraestructura para que el borrado sea
  efectivo a nivel de base de datos cuando corresponda (ver retención en
  sección 7).

---

## 5. Épicas e historias de usuario

Formato para que los agentes generen issues/PRs automáticamente.

Estado de cobertura actual: [✅] totalmente cubierto, [🟡] parcialmente cubierto, [⬜] no iniciado, [⏸️] aplazado por decisión explícita.

### Épica 1 — Landing y navegación
- [✅] **US-1.1**: Como usuario, veo una página de inicio con dos botones grandes
  ("Necesito alojamiento" / "Tengo alojamiento disponible") sin necesidad de login.
  - *Criterios de aceptación*: texto en español; accesible desde móvil (responsive,
    botones táctiles ≥44px); los botones comunican claramente si abren el feed o el
    formulario de publicación.
  - *Rediseño (2026-08-21)*: `components/HeroButtons.tsx` (el hero de ancho
    completo) se eliminó a favor de `components/IntentNavBar.tsx` — pedido
    del mantenedor tras cerrar US-4.5: con el tab-nav Todos/Necesito/Ofrezco
    ya persistente, el hero grande quedaba redundante y no sobrevivía al
    scroll. Patrón elegido (de 4 opciones evaluadas): un solo bar
    `sticky top-16/20` justo debajo del Navbar, con el tab-nav a la
    izquierda (ahora estilo segmented pill, no underline) y un botón "+"
    contextual a la derecha — idioma de Reminders/Todoist ("una lista, una
    acción de agregar"), no un botón "+" por pestaña (más simple en touch,
    evita doble target anidado). El "+" publica directo con el `intentTipo`
    activo cuando hay uno; en "Todos" abre un popover de 2 opciones
    (Necesito/Ofrezco) antes de abrir el modal, restituyendo la
    desambiguación que daba el hero viejo. Cobertura nueva en
    `tests/intent-nav-bar.test.tsx` (4 casos).
  - *Limpieza del Navbar (2026-08-21, misma sesión)*: el mantenedor notó que
    el botón "Publicar Espacio" y el enlace "Feed de Alojamientos" del
    `Navbar` quedaron redundantes con `IntentNavBar` (su "+" ya cubre
    publicar, sus tabs ya cubren navegar al feed) — ambos se eliminaron de
    `components/Navbar.tsx` junto con la prop `onOpenPublish` que ya no se
    usa.
  - *Bug encontrado y corregido en el mismo pase*: publicar desde una página
    de departamento (p. ej. `/departamento/atlantico/necesito/`) preseleccionaba
    "Pereira (Risaralda)" en el modal — `PublishModal` solo recibía
    `defaultCiudad` en rutas de ciudad, así que en cualquier feed de
    departamento/nacional caía siempre al hardcode de Pereira sin importar el
    departamento real. `components/PublishModal.tsx` gana
    `defaultDepartmentSlug` + `resolveDefaultLocation()`: usa `defaultCiudad`
    si resuelve, si no busca una ciudad real de ese departamento (prioriza
    `isPriority`, vía `getCitiesByDepartment` de `lib/locations.ts`), y solo
    cae a Pereira cuando no hay ninguna pista de ubicación (nacional puro).
    Cobertura nueva en `tests/publish-modal.test.tsx` (3 casos).
  - 35/35 tests verdes (typecheck/lint limpios); `npm run build:local` aún
    no re-corrido esta sesión — ver nota de proceso en `.wolf/buglog.json`
    bug-015 sobre no correr build mientras el dev server del usuario está
    activo.
- [✅] **US-1.2**: Como usuario, puedo navegar al feed de publicaciones desde cualquier
  página vía un enlace persistente en el header.
- [✅] **US-1.3**: Como usuario, veo un enlace visible a la política de datos
  (`privacidad.html`) desde el footer de cualquier página.
- [✅] **US-1.4**: Como usuario, el sitio respeta mi preferencia de tema
  (claro/oscuro) del sistema operativo/navegador (`prefers-color-scheme`,
  incluyendo Night Shift/modo nocturno automático de macOS/iOS), sin requerir
  un toggle manual para el MVP.
  - *Criterios*: paleta oscura con contraste suficiente (WCAG AA) en landing,
    feed, modales y admin; sin parpadeo de tema incorrecto al cargar
    (`color-scheme` en `<html>` + CSS variables o soporte `dark:` de Tailwind);
    el logo/imágenes con fondo blanco sólido se revisan para que no se vean
    rotos en fondo oscuro.
  - *Entregado (2026-08-17)*: implementado 100% vía CSS variables + media
    query, sin JS ni toggle. `tailwind.config.ts` resuelve cada shade de
    `slate/rose/emerald/amber/accent` a `rgb(var(--color-x) / <alpha-value>)`;
    `app/globals.css` define los valores claros en `:root` y los re-declara
    bajo `@media (prefers-color-scheme: dark)` — cero cambios en componentes.
    Solo la escala neutra `slate` se invierte entre temas (era ya un hack de
    inversión para el modo claro, ver commit "extreme makeover"); los colores
    de marca (`rose`, `emerald`, `amber`) se mantienen fijos en ambos temas
    porque ya estaban diseñados como superficies autocontenidas (botones,
    píldoras) con buen contraste sobre cualquier fondo — invertirlos también
    rompía el contraste de esas superficies (verificado visualmente y
    corregido antes de cerrar la historia). `.glass-card`/`.glass-nav` migran
    de `rgba()` fijos a las mismas variables. Verificado con capturas
    Playwright en `light`/`dark` `colorScheme` sobre landing, feed y footer;
    `npm run validate` verde.
- [✅] **US-1.5**: Como usuario, puedo cerrar el banner de "Líneas de atención
  nacional de emergencia" con un botón "×", y el sitio recuerda que lo cerré
  para no volver a mostrármelo en cada visita.
  - *Origen*: pedido del mantenedor 2026-08-21.
  - *Entregado*: `lib/localStorage.ts` gana `isEmergencyBannerDismissed()`/
    `setEmergencyBannerDismissed()` (mismo patrón try/catch que
    `getMyListings`/`saveMyListing`, sin expiración forzada — ver nota de
    diseño abajo). `EmergencyBanner.tsx` gana un botón "×" (`onDismiss`
    prop) junto al resto del banner. El estado `isEmergencyBannerVisible`
    vive levantado en `CityFeedPage` (empieza `true` y se corrige en un
    `useEffect` post-mount desde `localStorage`, para no romper la
    hidratación SSR/CSR de un visitante que ya lo había cerrado antes) y se
    pasa hacia abajo a `EmergencyBanner` (visibilidad) y a `Navbar`
    (`showEmergencyReopen`/`onReopenEmergency`) — hermanos bajo
    `CityFeedPage`. `Navbar.tsx` renderiza un ícono de teléfono junto al
    escudo de Habeas Data solo cuando el banner está cerrado; al hacer clic
    reabre el banner y limpia el flag de `localStorage`.
  - *Nota de diseño*: sin expiración automática del "cerrado" — dado que
    reabrir es un clic (el ícono de teléfono), no hay urgencia de forzar que
    reaparezca solo; forzar reaparición periódica sin que el usuario lo pida
    arriesga entrenar a la gente a ignorarlo aún más rápido.
  - Cobertura nueva: `tests/emergency-banner.test.tsx` (4 casos — visible
    por defecto, cerrar persiste y muestra el ícono de reapertura, no se
    muestra en un render nuevo si ya estaba cerrado, reabrir desde el ícono
    limpia el flag). Verificado con `npm run validate` completo (39/39
    tests, typecheck/lint/build limpios).
  - *Fix de CLS (2026-08-21, misma sesión, más tarde)*: el mantenedor
    detectó un salto de layout — el SSR siempre renderiza el banner abierto
    (el servidor no puede leer `localStorage`), y la corrección vía
    `useEffect` solo corre después de hidratar, así que un visitante que ya
    lo había cerrado lo veía parpadear abierto y luego desaparecer. Fix:
    script bloqueante e inline en `app/layout.tsx` (`<head>`, antes de
    hidratar) que lee `localStorage` y agrega la clase `eb-dismissed` a
    `<html>` — misma técnica que evita el flash de tema equivocado en dark
    mode, aplicada acá a `localStorage` en vez de una media query. Regla CSS
    nueva en `app/globals.css`: `html.eb-dismissed [data-emergency-banner] {
    display: none; }`, con el atributo `data-emergency-banner` agregado al
    contenedor raíz de `EmergencyBanner.tsx`. `setEmergencyBannerDismissed()`
    en `lib/localStorage.ts` ahora también sincroniza esa clase en cada
    cierre/reapertura (`document.documentElement.classList.toggle(...)`),
    para que nunca quede desalineada con el estado de React tras la carga
    inicial. Verificado con Playwright: `display: none` ya presente incluso
    en `domcontentloaded` (antes de que React termine de hidratar), y el
    ciclo cerrar→reabrir sincroniza la clase y el flag de `localStorage`
    correctamente en ambas direcciones.
  - *Ajuste de breakpoints (misma sesión)*: el "dropdown" (acordeón
    colapsable) se pensó originalmente para `<768px`, pero a 768-1023px el
    label completo + 3 píldoras + botón "×" ya no entraban en una sola
    fila — se movió el punto donde el banner se fija abierto de `md:`
    (768px) a `lg:` (1024px), así que 768-1023px sigue siendo un acordeón,
    solo que con un label más corto ("Líneas de atención a emergencias").
  - *Navbar*: el `gap-4` entre el ícono de Habeas Data y el de reapertura
    del banner (ambos solo-ícono en `lg:+`) se sentía como un espacio
    accidental una vez que dejaron de convivir con los links "Feed"/
    "Publicar" (ya removidos) — se redujo a `gap-1`.
- [✅] **US-1.6**: Como usuario, si visito una URL que no existe (404) o el
  sitio encuentra un error inesperado (500), veo una página clara en vez de
  un error crudo de Next.js o una pantalla en blanco.
  - *Origen*: pedido explícito del mantenedor 2026-08-21 — "missing 404, 500
    pages in the docs".
  - *Entregado*: `app/not-found.tsx` (archivo especial de Next.js, se
    renderiza para cualquier ruta sin match) — copy en español acorde al
    tono del sitio, CTA "Volver al feed de alojamientos" hacia la última
    ciudad recordada. `app/error.tsx` (error boundary de Next.js, Client
    Component obligatorio) — mensaje genérico + botones "Intentar de nuevo"
    (`reset()`) y "Volver al feed", más un bloque de detalles técnicos
    (`error.message`/`error.stack`/`error.digest`, desplazable) que solo
    existe cuando `process.env.NODE_ENV !== 'production'`.
  - *Refactor*: la lógica de "recordar la última ciudad" (antes solo en
    `app/terminos-y-privacidad/page.tsx`, ver su bugfix del mismo día) se
    extrajo a `lib/useHomeHref.ts`, reutilizado por las 3 páginas
    (terminos-y-privacidad, not-found, error) en vez de triplicar el mismo
    `useState`/`useEffect`/lectura de `localStorage`.
  - *Verificación de seguridad (no negociable, cumplida)*: `npm run build`
    real con `NODE_ENV=production` + `grep -r "Detalles técnicos" out/
    .next/` y `grep -r "solo visible en desarrollo" out/ .next/` — **0
    coincidencias en ambos casos**, confirmando que `process.env.NODE_ENV`
    se inlinea en build-time (mismo mecanismo que `NEXT_PUBLIC_API_URL`,
    ver `lib/api.ts`) y el bloque de logs se elimina por completo del
    bundle de producción vía dead-code elimination del minificador — no es
    un `display:none` en runtime, el JSX ni siquiera existe en el HTML/JS
    servido.
  - Cobertura nueva: `tests/error-pages.test.tsx` (4 casos — copy y enlace
    del 404; botones de `error.tsx` siempre visibles; el bloque de detalles
    técnicos NUNCA aparece con `NODE_ENV=production` incluyendo el mensaje
    y el stack de un error de prueba; SÍ aparece con `NODE_ENV=development`).
    43/43 tests verdes. `npm run validate` completo (typecheck/lint/test/
    build) limpio.
  - *Verificado en el export estático real (2026-08-21)*: `npm run build`
    genera `out/404.html`; sirviendo `out/` con `npx serve` (que replica el
    comportamiento estándar de "servidor estático → 404.html en rutas sin
    match") y pidiendo `/this-does-not-exist/` devuelve `HTTP 404` con el
    contenido de `not-found.tsx` — confirma que el 404 SÍ funciona en el
    artefacto que realmente se despliega.
  - *Nota importante — comportamiento distinto en `next dev` vs. producción
    real*: pedir una ruta de un solo segmento sin match (p. ej.
    `/this-does-not-exist/`) en `next dev` lanza el error interno de Next
    `Page "/[ciudad]/page" is missing param ... in generateStaticParams(),
    which is required with "output: export" config` en vez de mostrar
    `not-found.tsx` — **no es un bug de este repo**, es inherente a
    `output: 'export'` (sección 2 de este documento): con export totalmente
    estático no existe servidor en runtime que resuelva un valor de `[ciudad]`
    fuera de la lista de `generateStaticParams()`, así que Next no tiene
    forma de "caer" a `not-found.tsx` para ese caso en modo dev — solo puede
    servir los archivos HTML que realmente generó el build. El artefacto
    real (`out/`) sí resuelve esto correctamente (ver verificación arriba)
    porque ahí la ruta simplemente no existe como archivo y el 404 lo
    resuelve el servidor estático / CDN, no Next. **No intentar "arreglar"
    este mensaje en `next dev`** — no hay nada que arreglar en el código.
  - *Pendiente de infraestructura (coordinar con `infra-proyecto-colombia`,
    fuera de alcance de este repo)*: en el despliegue real a S3 +
    CloudFront, S3 devuelve un 403/404 XML crudo para cualquier ruta sin
    archivo correspondiente — CloudFront necesita una **Custom Error
    Response** que mapee esos códigos (403 y 404) a `/404.html` (con
    `Response Page Path: /404.html`, `HTTP Response Code: 404`) para que los
    visitantes vean `not-found.tsx` en vez del XML de error de S3. Sin este
    mapeo, el 404 bonito solo funciona en local (`npx serve`/similares) y
    nunca en producción real.
- [✅] **US-1.7**: Como usuario en tema claro, el `Footer` se distingue
  visualmente del fondo de la página en vez de casi fundirse con él.
  - *Origen*: pedido explícito del mantenedor 2026-08-21 — "footer
    background color in light mode needs a slightly different shade to
    stand out a little bit more".
  - *Entregado*: nuevo token `--color-footer-bg` (`app/globals.css`) en vez
    de reusar `--color-slate-950` — en modo claro ambos redondeaban al mismo
    casi-blanco (247/247/250), por eso el footer desaparecía visualmente. En
    `:root` (claro) vale `228 228 232` (mismo tono que `slate-800`, con
    contraste real contra el `247/247/250` de la página); bajo
    `@media (prefers-color-scheme: dark)` vale `17 17 23`, idéntico al
    `slate-950` oscuro — el look en modo oscuro queda sin cambios (ya tenía
    contraste suficiente vía el divisor `border-t`). Registrado en
    `tailwind.config.ts` como color `footer` (mismo patrón `themed()` que el
    resto de la paleta); `components/Footer.tsx` pasa de `bg-slate-950` a
    `bg-footer`.
  - Verificado con Playwright en `colorScheme: 'light'`/`'dark'`: claro
    `rgb(228,228,232)` vs. fondo de página `rgb(247,247,250)` (distinguible);
    oscuro `rgb(17,17,23)` en ambos (sin cambio). 43/43 tests verdes,
    typecheck/lint limpios.
  - *Ajuste adicional (misma sesión)*: el mantenedor pidió quitar los
    divisores internos del footer (entre la fila de marca, "Canales
    oficiales de ayuda" y el tagline final) — primero solo en claro, luego
    "esto debería aplicar a dark mode también". Nuevo token
    `--color-footer-divider`, igual a `--color-footer-bg` en ambos temas
    (claro y oscuro) — el borde de 1px sigue ahí (sin salto de layout), solo
    se vuelve invisible al fundirse con el fondo. `tailwind.config.ts`
    anida `footer.divider` junto a `footer.DEFAULT`; `Footer.tsx` usa
    `border-footer-divider` en los 2 divisores internos (el borde superior
    que separa el footer de la página, `border-slate-800`, no cambió — no
    es un divisor "de sección" sino el límite del footer mismo).

### Épica 2 — Publicar oferta ("Tengo")
- [✅] **US-2.1**: Como usuario con espacio disponible, completo un formulario corto
  (ciudad, barrio, personas, fechas, precio o gratis, descripción, WhatsApp) y
  publico en menos de 60 segundos.
  - *Criterios*: validación de campos obligatorios; número de WhatsApp validado
    con formato colombiano (+57); confirmación visual tras publicar; checkbox
    de aceptación de la política de datos antes de enviar (ver US-7.4).
- [✅] **US-2.2**: Tras publicar, veo un botón "Compartir por WhatsApp" que abre un
  mensaje prellenado con el enlace a mi publicación.

### Épica 3 — Publicar solicitud ("Necesito")
- [✅] **US-3.1**: Como usuario que necesita alojamiento, completo el mismo tipo de
  formulario (espejo del de oferta) indicando qué busco.
  - *Criterios*: mismos campos y validaciones que US-2.1.

### Épica 4 — Feed y búsqueda
- [✅] **US-4.1**: Como usuario, veo un listado de publicaciones activas, más
  recientes primero, de la ciudad que estoy visitando y filtrable por tipo
  (ofrezco/necesito).
  - *Criterios*: la ciudad es un nivel de navegación, no un filtro dentro del
    feed — cada ciudad vive en su propia ruta (`/pereira/`, `/cali/`,
    `/quibdo/`, ...) elegida al principio vía el selector de ciudad del
    navbar (persistido en `localStorage` para la próxima visita a `/`); cada
    tarjeta muestra barrio, personas, fechas, precio y botón de WhatsApp;
    el número de WhatsApp completo no se expone en el HTML crudo salvo dentro
    del enlace `wa.me` (evitar scraping trivial de teléfonos).
- [✅] **US-4.2**: Como usuario, puedo filtrar además por barrio (texto libre) y por
  rango de precio (incluyendo "gratis").
- [✅] **US-4.3**: Vista de mapa con pines por zona/barrio.
  - *Origen*: pedido explícito del mantenedor 2026-08-21. Estaba marcada
    "fase 2" porque `Listing` no tiene coordenadas reales (solo texto
    ciudad/zona/barrio) — agregar geocodificación real por publicación es
    un cambio de esquema de backend fuera de alcance de este pase (ver
    `docs/architecture-foundation.md`).
  - *Decisiones (vía preguntas dirigidas antes de construir)*: (a) precisión
    de pines — centroide aproximado por zona (mismo catálogo curado de
    `lib/zones.ts`), no coordenadas reales por publicación, sin cambios de
    backend; (b) proveedor de mapas — Leaflet + OpenStreetMap (sin API key,
    sin cuenta, sin billing), no Mapbox.
  - *Entregado*: `lib/zoneCoordinates.ts` (nuevo) — centroide lat/lng por
    zona para las 7 ciudades prioritarias que ya tienen catálogo curado en
    `lib/zones.ts` (pereira, cali, quibdo, manizales, armenia, condoto,
    istmina); zonas con nombre cardinal usan offset real desde el centro de
    la ciudad, zonas con nombre de comuna sin correspondencia cardinal
    conocida (Manizales, Armenia) se distribuyen en círculo alrededor del
    centro — documentado explícitamente como aproximado, no datos GIS
    reales. Jitter determinista (seedeado por id de la publicación, no
    aleatorio por render) para que publicaciones en la misma zona no se
    apilen en un solo píxel.
  - `components/MapView.tsx` (nuevo, cargado vía `next/dynamic` con
    `ssr: false` — Leaflet toca `window` al importarse, nunca puede correr
    en SSR/export estático): pines coloreados por tipo (rose=necesito,
    emerald=ofrezco, SVG inline en vez de la imagen de marcador por defecto
    de Leaflet, evitando el problema conocido de rutas de assets con
    Next.js/webpack) sobre tiles de OpenStreetMap.
  - `components/MapPopupCard.tsx` (nuevo): resumen compacto en el popup de
    cada pin (tipo, zona·barrio, descripción, precio, botón "Contactar por
    WhatsApp"). El botón reutiliza la lógica de revelado de contacto ya
    probada de `ListingCard.tsx`, extraída a `lib/useContactReveal.ts`
    (nuevo hook compartido) en vez de reimplementarla — mismo comportamiento
    a prueba de bloqueo de popups (US-6.5) en ambos lugares.
  - `components/CityFeedPage.tsx`: toggle "Lista/Mapa" (mismo estilo de
    segmented pill que `IntentNavBar`), visible solo en feeds de ciudad
    (no departamento/nacional) para las 7 ciudades con coordenadas curadas
    (`cityHasMapCoordinates`).
  - Estilos de Leaflet override en `app/globals.css` (popup oscuro tipo
    glass-card en vez del blanco por defecto).
  - Verificado con Playwright contra un build de producción real
    (`npm run build` + `npx serve out`, no solo `next dev`): el toggle
    aparece, el mapa carga sin errores de consola/página, 2 marcadores se
    renderizan para Pereira, el popup muestra el resumen correcto y el
    botón de WhatsApp llama al mismo flujo ya probado. Bundle compartido de
    First Load JS prácticamente sin cambio (87.4kB → 87.9kB) — Leaflet
    queda en un chunk separado, cargado solo cuando se abre el mapa, no en
    cada página.
  - Cobertura nueva: `tests/zone-coordinates.test.ts` (5 casos, lógica pura
    sin DOM) y `tests/map-toggle.test.tsx` (4 casos — el toggle aparece
    solo para ciudades prioritarias a nivel ciudad, y siempre a nivel
    departamento/nacional; `MapView` mockeado para no depender de medición
    real de DOM que Leaflet necesita y jsdom no provee de forma confiable).
    59/59 tests verdes (antes 51/51), typecheck/lint limpios, `npm run build`
    completo verificado.
  - *Extendido a departamento y nacional (2026-08-21, mismo día)*: el
    mantenedor pidió que el mapa no fuera solo por ciudad. Cada pin ahora se
    resuelve desde el `ciudadSlug` PROPIO de cada publicación (no un
    `citySlug` fijo de la página) — así el mismo `MapView` sirve para los 3
    niveles: en una página de ciudad usa un centro/zoom fijo sobre esa
    ciudad (como antes); en departamento/nacional, sin un `citySlug` único
    posible, ajusta el encuadre (`bounds`) a lo que realmente resolvió pines
    (o cae a una vista de toda Colombia si ninguna publicación actual tiene
    coordenadas). Mensaje explicativo visible en el mapa cuando cero
    publicaciones tienen ubicación disponible (`"el mapa cubre Chocó, Valle
    del Cauca, Risaralda, Caldas y Quindío"`). `lib/zoneCoordinates.ts`
    normaliza el slug de ciudad con `normalizeSlug` (no solo
    `.toLowerCase()`) para tolerar tanto slugs reales ("quibdo") como
    nombres con tilde ("Quibdó") si `ciudadSlug` llegara a faltar.
    Verificado con Playwright contra el dev server real: departamento
    (Risaralda) y nacional muestran el toggle y renderizan marcadores sin
    errores de consola; el encuadre por `bounds` efectivamente enmarca la
    región real de las publicaciones en vez de mostrar toda Colombia de
    entrada.
  - *Departamentos/ciudades prioritarias realineadas al sismo (2026-08-21,
    mismo día)*: el mantenedor pidió reemplazar los departamentos/ciudades
    que aparecen por defecto en el selector de ubicación (`CitySwitcher`)
    por los realmente afectados por el terremoto reciente. Antes eran
    Antioquia, Atlántico, Caldas, Chocó, Cundinamarca, Quindío, Risaralda y
    Santander (9, con Medellín/Barranquilla/Bogotá/Bucaramanga como
    ciudades destacadas); ahora son exactamente los 5 de la sección 1 de
    este documento — Chocó, Valle del Cauca, Risaralda, Caldas y Quindío —
    con Manizales, Condoto, Istmina, Quibdó, Armenia, Pereira y Cali como
    ciudades destacadas (las mismas 7 con coordenadas curadas para el mapa,
    intencional). `lib/colombia-locations.json`: `isPriority` recalculado
    para esos 5 departamentos y 7 ciudades, `false` para el resto.
    `components/CitySwitcher.tsx`: `priorityDepartments.slice(0, 4)` pasó a
    `slice(0, 5)` (antes recortaba silenciosamente uno de los 5).
    Consecuencia esperada: `DEFAULT_CITY` (`lib/cities.ts`, primer elemento
    de `getPriorityLocations()`) pasó de Medellín a Manizales — usado como
    último fallback en `lib/useHomeHref.ts`/`PublishModal` cuando no hay
    ninguna otra pista de ubicación. 2 tests ajustados a la nueva
    prioridad (`tests/publish-modal.test.tsx` usa Valle del Cauca/Cali en
    vez de Atlántico/Barranquilla como departamento de ejemplo;
    `tests/locations.test.ts` ya no asume que Medellín aparece en el top-20
    de una búsqueda por nombre de departamento). 59/59 tests verdes.
- [🟡] **US-4.4**: Como usuario, filtro por zona/barrio desde una lista
  estructurada por ciudad (no texto libre), al estilo de portales como
  Fincaraíz/Metrocuadrado, para evitar variantes de escritura del mismo
  barrio y acelerar el filtrado.
  - *Origen*: discusión 2026-08-17 con el colega de infraestructura/backend —
    "introducir al modelo de datos zonas de las ciudades para ayudar a
    filtrar de la misma manera en que la gente filtra en sitios como
    Fincaraíz".
  - *Criterios*: el modelo de datos gana un catálogo `zonas` por `ciudad`
    (barrio pasa de texto libre a selección de una lista, o texto libre con
    autocompletado sobre el catálogo); el catálogo se genera/asiste con IA
    por ciudad (el colega confirmó que puede generarlo para cualquier ciudad
    que se le indique) y se **valida manualmente** antes de publicarse — no
    se confía en la lista generada sin revisión humana; el feed y los
    formularios de publicación se actualizan para consumir el catálogo vía
    la API en vez de aceptar cualquier texto en `barrio`.
  - *Corrección de granularidad (2026-08-17, misma sesión)*: la primera
    versión de esta historia cargó `lib/zones.ts` con barrios individuales
    (~20 por ciudad); el mantenedor aclaró que eso sigue escalando a
    cientos/miles de opciones y no es lo que pidió — la intención real es
    **macro-zonas** (Norte/Centro/Sur/Oriente al estilo Fincaraíz), no
    barrios. Además, no todas las ciudades usan el mismo esquema de
    zonificación, así que se investigó por ciudad cuál es el esquema real
    en uso en vez de forzar Norte/Sur/Centro/Oriente/Occidente en todas:
    Cali tiene 6 zonas geográficas oficiales de Planeación/IDESC (Norte,
    Oriente, Sur, Centro, Ladera, Oeste); Manizales (11) y Armenia (10) no
    tienen agrupación cardinal informal de uso común — su división real son
    comunas con nombre propio, así que esos nombres se usan tal cual;
    Quibdó tiene 6 comunas ya nombradas con etiqueta cardinal/descriptiva
    (p. ej. Comuna 1 = "Zona Norte"); Pereira no tiene un mapa oficial de
    zonas cardinales (se documentó como agrupación informal, no
    gubernamental); Condoto e Istmina son municipios pequeños sin
    zonificación interna real, así que solo tienen un "Centro / Casco
    urbano". Ver las fuentes y el detalle completo en los comentarios de
    `lib/zones.ts`.
  - *Solución temporal entregada (2026-08-17)*: mientras se confirma el
    contrato con infra, `lib/zones.ts` trae un catálogo **frontend-only**
    (`ZONES_BY_CITY_SLUG`) de macro-zonas por ciudad (5-11 opciones según la
    ciudad, no barrios), investigado vía búsqueda web contra fuentes
    públicas (sitio de Planeación de Cali/IDESC, Datos Abiertos Colombia,
    Wikipedia, alcaldías municipales) y **sin validar manualmente por
    alguien de cada ciudad todavía** — ver advertencia en el propio
    archivo. `components/PublishModal.tsx` (campo "Zona", antes "Barrio /
    Sector") y `components/SearchFilters.tsx` (mismo cambio de label) usan
    un `<select>` real sobre `getZonesForCityName()` — al ser una lista
    corta y curada por ciudad, un dropdown cerrado tiene más sentido que
    autocompletado sobre texto libre; el campo sigue siendo `barrio` en
    `lib/types.ts`/`lib/api.ts` (cero cambios de contrato), ahora con
    valores de zona en vez de barrio específico. `MOCK_LISTINGS` en
    `lib/api.ts` se actualizó a los nuevos valores de zona para que el
    filtro siga funcionando en modo offline/demo. Queda 🟡 (no ✅) porque
    falta: (a) validación humana del
    catálogo, y (b) migrar de este archivo local al catálogo real de la API
    una vez el colega de infra confirme el contrato.
  - *Corrección de modelo de datos (2026-08-17, misma sesión)*: el mantenedor
    aclaró que **`barrio` (texto libre) debe seguir existiendo** como campo
    de búsqueda independiente — "Zonas son simplemente una forma de llegar
    más rápido a las tarjetas de contenido que buscas", no un reemplazo del
    barrio específico. `lib/types.ts` ahora separa ambos campos en
    `Listing`/`FilterState`/`CreateListingInput`: `zona` (obligatorio,
    selección de `lib/zones.ts`, filtra por igualdad exacta) y `barrio`
    (opcional, texto libre, filtra por substring — el comportamiento
    original de US-4.2). `PublishModal` vuelve a tener ambos campos (Zona
    *, Barrio/Sector opcional); `SearchFilters` vuelve a tener ambos
    filtros lado a lado. `ListingCard`/`ShareModal`/`app/admin/page.tsx`
    muestran `zona · barrio` cuando hay barrio, o solo `zona` si no.
    `MOCK_LISTINGS` recuperó sus barrios específicos originales
    (Circunvalar, Cuba, San Antonio, César Conto) junto a la zona
    correspondiente.
  - *Coordinación pendiente*: confirmar con el equipo de infraestructura el
    endpoint/contrato para exponer el catálogo de zonas (ver `openapi.yaml`)
    y quién es dueño de mantenerlo actualizado por ciudad; cuando exista,
    reemplazar `lib/zones.ts` por una llamada a la API (mismo shape:
    `Record<citySlug, string[]>` o equivalente) sin tocar los componentes
    que ya consumen `getZonesForCityName()`.
  - *Contrato propuesto (2026-08-17)*: `openapi.yaml` ya documenta la
    propuesta completa para alinear con el colega de infra — `GET /zones`
    (nuevo endpoint, `ZonesResponse` con `zonas: Record<ciudad, string[]>`)
    y el campo `zona` (obligatorio) agregado a `Listing`/`CreateListingInput`
    junto a `barrio` (ahora opcional). Ver el mensaje resumen entregado al
    mantenedor en el chat de esta sesión para compartir con el colega tal
    cual.
- [✅] **US-4.5**: Como usuario, la búsqueda de "Necesito alojamiento" y de
  "Tengo espacio disponible" son experiencias separadas, no un mismo feed
  mezclado con un filtro de tipo.
  - *Origen*: feedback del mantenedor 2026-08-18 — "improve result listing
    journey overall... merits separate listing page for estoy buscando y
    estoy ofreciendo".
  - *Decisión (2026-08-19)*: rutas separadas — `/[ciudad]/necesito/` y
    `/[ciudad]/ofrezco/` — en vez de mantener la intención como un filtro
    más. Primera entrega solo a nivel ciudad; el mismo día, tras que el
    mantenedor notara que el tab-nav no aparecía en "Toda Colombia", se
    confirmó extenderlo a los 3 niveles de ubicación (ciudad, departamento,
    nacional) en vez de dejar esos dos con el feed unificado.
  - *Entregado*: `CityFeedPage` gana `intentTipo?: ListingType` — fija
    `filters.tipo` (server-side, vía `fetchListings`) sin exponer el select
    "Tipo de Publicación" (`SearchFilters` gana `hideTipoFilter`); título/
    subtítulo/CTA de publicar (`publishDefaultTipo`, botón "Publicar" del
    Navbar) se ajustan a la intención. Nuevas rutas, todas reutilizando
    `CityFeedPage`/`fetchListings` sin lógica duplicada:
    `app/[ciudad]/necesito|ofrezco/page.tsx` (ciudad),
    `app/departamento/[slug]/necesito|ofrezco/page.tsx` (departamento),
    `app/necesito/page.tsx` y `app/ofrezco/page.tsx` (nacional). El tab-nav
    (`role="tablist"`, Todos/Necesito/Ofrezco) calcula su `basePath` según
    el nivel activo (`/`, `/departamento/{slug}/` o `/{citySlug}/`) y
    enlaza entre las tres rutas de ese mismo nivel.
  - Verificado con `npm run validate` (28/28 tests) y `npm run build:local`:
    3417 páginas estáticas, incluye `/necesito`, `/ofrezco`,
    `/departamento/[slug]/necesito`, `/departamento/[slug]/ofrezco` y
    `/[ciudad]/necesito`+`/[ciudad]/ofrezco` para las +1100 ciudades.
- [✅] **US-4.6**: Como usuario, el feed pagina o carga progresivamente los
  resultados en vez de traer todas las publicaciones activas de una ciudad
  de una sola vez.
  - *Origen*: mismo feedback 2026-08-18 — "pagination".
  - *Nota (2026-08-19)*: al retomar esta historia se encontró que ya estaba
    implementada end-to-end en una sesión previa no reflejada en este
    roadmap — backend (`backend-proyecto-colombia/src/services/listing.service.ts`,
    cursor en base64 + `limit`/`totalCount`) y frontend (`lib/api.ts`
    `fetchListings(filters, cursor)`, `CityFeedPage`'s `handleLoadMore`,
    botón "Cargar más publicaciones" en `ListingGrid`) ya soportan
    paginación por cursor real, no un stub client-side. Se corrige el
    estado aquí a ✅ sin cambios de código adicionales.
- [✅] **US-4.7**: Como usuario, filtro y exploro resultados con controles
  más ricos y accesibles al estilo de un e-commerce (Mercado Libre,
  Fincaraíz), no con la tabla de filtros plana actual.
  - *Origen*: mismo feedback 2026-08-18 — "the table view is a bit outdated...
    elegant/accessible/rich-UX controls over the list of results".
  - *Alcance decidido (2026-08-19)*: pase intermedio, no el rediseño
    completo — chips removibles para los filtros activos (zona, barrio,
    precio, tipo cuando aplica, orden) + control de orden (recientes /
    precio asc / precio desc / más personas), sin tocar la grilla de
    tarjetas ni introducir densidad ajustable.
  - *Entregado*: `FilterState` gana `sortBy?: SortOption` (`lib/types.ts`).
    `SearchFilters` agrega el select "Ordenar por" y una fila de chips
    removibles (cada uno limpia solo ese filtro) más "Limpiar filtros".
    `CityFeedPage` aplica el orden client-side sobre `listings` vía
    `useMemo` antes de pasarlos a `ListingGrid`.
  - *Limitación conocida, documentada en el propio código*: el orden solo
    aplica sobre la página ya cargada (`listings`), no sobre el total del
    backend — al usar "Cargar más" (US-4.6) con un orden distinto de
    "recientes", los nuevos ítems se agregan y se reordenan junto a los
    existentes, pero el backend no expone un parámetro de orden todavía.
    Suficiente para el volumen actual (demo/inicio de crisis); requiere
    coordinar con infra un parámetro `sort` en `GET /listings` si el
    volumen de publicaciones por ciudad crece.
  - Verificado con `npm run validate` (28/28 tests, incluye un test nuevo
    de reordenamiento por precio) y `npm run build:local`.
- [⬜] **US-4.8**: Como usuario, el orden de resultados (`sortBy`) es real
  de punta a punta — el backend ordena y pagina consistentemente, no solo el
  frontend sobre lo ya cargado.
  - *Origen*: pedido explícito del mantenedor 2026-08-21 — "missing sort on
    both BE and FE in the docs". Brecha identificada como parte del cierre
    de US-4.7 (ver su "Limitación conocida" arriba), ahora promovida a
    historia propia porque requiere trabajo de backend, no solo frontend.
  - *Criterios*: `GET /listings` (`backend-proyecto-colombia`) acepta un
    parámetro `sort` (`recientes | precio_asc | precio_desc | personas_desc`,
    mismos valores que `SortOption` en `lib/types.ts`) y ordena antes de
    paginar (coordinarlo con el cursor de paginación de US-4.6, que ya
    existe — ver `listing.service.ts`); el frontend deja de reordenar
    client-side (`CityFeedPage`'s `sortedListings`) y en su lugar envía
    `sortBy` como parte de los filtros en `fetchListings`, confiando en el
    orden que devuelve la API; "Cargar más" con un orden distinto de
    "recientes" deja de tener el bug latente de reordenar solo la página ya
    cargada.
  - *Fuera de alcance hasta que se confirme*: no implementar todavía — es
    trabajo de backend primero (repo hermano `backend-proyecto-colombia`),
    luego frontend consumiéndolo, siguiendo el mismo patrón de coordinación
    que US-4.4/US-6.5.
- [✅] **US-4.9**: Como usuario en mobile, el panel de filtros no debe
  ocupar tanto espacio vertical que desplace las publicaciones (lo
  importante) fuera de la vista inicial; y en general, los filtros/facetas
  deberían acercarse más al patrón de un e-commerce típico (Mercado Libre,
  Fincaraíz, Amazon) — contador de resultados por filtro antes de
  aplicarlo, filtros colapsables/en modal en mobile, posible barra de
  filtros "sticky" compacta en vez del panel completo siempre expandido.
  - *Origen*: pedido explícito del mantenedor 2026-08-21 — "improvements for
    filter section (take into account typical e-commerce filters/facets), in
    mobile it's taking a lot of space from the actual important thing (the
    posts)". Es la continuación real del rediseño que US-4.7 dejó como "pase
    intermedio" (ver su nota de alcance).
  - *Decisiones (2026-08-21, vía preguntas dirigidas antes de construir)*:
    (a) en mobile/tablet (`<lg`, <1024px) el filtro colapsado se resuelve
    con un modal/bottom-sheet de pantalla completa (no un acordeón inline);
    (b) sin contador de resultados en vivo por filtro en este pase — queda
    fuera de alcance explícitamente (requeriría o un endpoint de conteo en
    el backend, o una estimación client-side inexacta una vez `Cargar más`/
    paginación entra en juego).
  - *Entregado*: `components/FilterFields.tsx` (nuevo) extrae los 5 controles
    (Tipo, Zona, Barrio, Precio, Ordenar) de `SearchFilters.tsx`, reutilizado
    ahora en dos lugares en vez de duplicar el mismo grid de selects.
    `components/FilterSheet.tsx` (nuevo) es el modal/bottom-sheet mobile
    (`items-end` en pantallas angostas, centrado desde `sm:`, mismo patrón
    de overlay que `PublishModal`/`ShareModal`) — header con
    "Filtros de búsqueda" + cerrar, `FilterFields` en el cuerpo, footer con
    "Limpiar" y "Ver N publicaciones" (cierra el sheet).
    `SearchFilters.tsx` reescrito: por debajo de `lg:` renderiza solo una
    barra compacta (ícono + "Filtros" + badge con el conteo de filtros
    activos + resultado + chevron) que abre `FilterSheet`, más los chips
    activos inline debajo (remover un chip no requiere abrir el sheet); el
    panel completo siempre-abierto se mantiene sin cambios en `lg:+`
    (`hidden lg:block`).
  - Verificado con Playwright en 390×844 (mobile): la primera tarjeta de
    publicación ya es visible en el viewport inicial, algo que antes exigía
    scrollear más allá del grid de filtros expandido; el sheet abre con los
    5 controles + footer; el panel de desktop (1280px) queda
    pixel-idéntico al anterior.
  - Cobertura nueva: `tests/search-filters.test.tsx` (5 casos — el trigger
    abre el sheet con los mismos controles, sin chips no hay badge/botón
    Limpiar, un chip se puede quitar sin abrir el sheet, "Ver N
    publicaciones" cierra el sheet, "Limpiar" dentro del sheet llama a
    `onReset`). Ajustadas 2 aserciones en `tests/landing.test.tsx` a
    `getAllByText` — el contador de resultados y otros textos ahora existen
    2 veces en el DOM a la vez (barra mobile + panel desktop, uno oculto
    solo por CSS; jsdom no aplica media queries). 48/48 tests verdes (antes
    43/43), typecheck/lint limpios.

### Épica 5 — Contacto
- [✅] **US-5.1**: Como usuario, al hacer clic en "Contactar por WhatsApp" se abre un
  chat directo (`wa.me`) con un mensaje prellenado indicando referencia a la
  publicación específica.

### Épica 6 — Moderación y seguridad
- [✅] **US-6.1**: Como usuario, puedo reportar una publicación sospechosa o
  resuelta con un botón visible en cada tarjeta.
  - *Criterios*: tras 3 reportes, el estado cambia automáticamente a
    "reportado" y desaparece del feed público hasta revisión.
- [🟡] **US-6.2**: Como administrador del proyecto, recibo un correo vía SES cuando
  una publicación alcanza el umbral de reportes, para revisarla en <24h.
- [✅] **US-6.3**: Cada publicación tiene un botón "Marcar como resuelta" para que el
  propio autor la retire del feed activo.
- [⬜] **US-6.4**: Como administrador, recibo un resumen diario por SES con el
  número de publicaciones activas, resueltas y reportadas por ciudad.
- [✅] **US-6.5**: Como usuario, mi número de WhatsApp no queda expuesto de forma
  reutilizable a terceros que solo navegan el feed masivamente para recolectar
  números — más allá de la mitigación ya existente en US-4.1 (no aparece en
  HTML crudo salvo dentro del enlace `wa.me`).
  - *Origen*: discusión 2026-08-17 con el colega de infraestructura/backend —
    en Cali ya se han visto casos de personas tomando números publicados en
    posts de ayuda para llamar a extorsionar. Se evaluó (y se descartó para
    el MVP, ver `US-8.2` como precedente de decisión de no sumar fricción)
    agregar login para mitigar esto, porque "entorpece el proceso"; el
    consenso fue que sí hace falta **alguna** capa de seguridad, pero sin
    fricción de cuenta.
  - *Opciones evaluadas en la conversación* (documentar, no implementar aún
    sin decisión formal): (a) intermediar el contacto con un bot de
    WhatsApp que reciba el mensaje y lo reenvíe sin exponer el número
    directamente (alineado con la idea de "bot de WhatsApp" ya listada como
    fase 2 en la sección 10 de este documento); (b) mantener `wa.me` directo
    pero con límites de scraping (rate-limit por IP en el endpoint de
    listados, ofuscación adicional del número en el DOM); (c) fricción
    ligera sin cuenta (p. ej. OTP de un solo uso antes de revelar el
    contacto, similar a `US-7.3`/OTP ya anotado en fase 2).
  - *Criterios*: cualquier opción elegida debe mantenerse fricción-cero para
    publicar (no login) y solo puede agregar un paso liviano al momento de
    **contactar**; requiere decisión explícita del arquitecto/colega de
    infraestructura antes de implementarse, dado que el post original de la
    conversación quedó en "tengo que pensarlo bien para todos los use
    cases".
  - *Decisión de diseño (2026-08-18)*: se descartaron (a) bot de WhatsApp
    (requiere WhatsApp Business API, hosting propio, latencia de reenvío —
    demasiado costoso/complejo para el MVP) y (c) OTP (requiere envío
    SMS/WhatsApp con costo por mensaje, y sí introduce fricción real al
    usuario que más la necesita). Se adoptó una variante reforzada de (b):
    el problema real no es que el número aparezca en el DOM (ya mitigado en
    US-4.1), sino que `GET /listings` es un endpoint público sin
    autenticación que hoy devuelve el número de **todas** las publicaciones
    en el JSON — cualquiera puede scrapearlo con un script sin pasar por el
    frontend. La solución estructural: el feed público deja de incluir
    `whatsapp`; el número solo se revela mediante una llamada dedicada por
    publicación (`POST /listings/{id}/contact`), que el backend puede
    limitar por IP/publicación (rate-limit barato, sin infraestructura
    nueva) y opcionalmente exigir un token de Cloudflare Turnstile
    (reutilizando el mismo site key ya contemplado para
    `CreateListingInput.turnstileToken`, invisible para el usuario real, sin
    costo). Fricción-cero para publicar, un solo `fetch` invisible antes de
    abrir WhatsApp al contactar.
  - *Entregado en frontend (2026-08-18)*: `components/Turnstile.tsx`
    (`useInvisibleTurnstile` + `TurnstileContainer`) monta un único widget
    invisible por sesión de feed en `CityFeedPage`, cuyo token se pasa a
    cada `ListingCard` vía `ListingGrid`. `lib/api.ts` gana
    `getContactLink(id, turnstileToken)`; `ListingCard`'s "Contactar por
    WhatsApp" pasó de ser un `<a href>` estático a un botón que llama esa
    función y solo entonces abre `wa.me` — sin regresión visual ni de UX en
    el camino feliz. El endpoint real `POST /listings/{id}/contact` no
    existe todavía: el fallback offline de `getContactLink` resuelve el
    número desde `MOCK_LISTINGS` (mismo shape de respuesta), así que no hay
    cambios pendientes en el frontend cuando el backend lo implemente — solo
    borrar ese fallback. Si Turnstile no carga (bloqueado, sin site key), el
    token queda `null` y el contacto igual se revela (nunca bloquea a
    alguien buscando ayuda por un token faltante).
  - *Propuesta de contrato para el colega de infra*: documentada en
    `openapi.yaml` — nuevo path `/listings/{id}/contact`
    (`ContactListingRequest`/`ContactListingResponse`, respuestas 404/429/403
    para no encontrado/rate-limit/token inválido) y nota en `Listing.whatsapp`
    y en `GET /listings` de que el feed público no debería seguir incluyendo
    el número crudo.
  - *Correcciones post-revisión (2026-08-18, misma sesión)*: dos bugs reales
    encontrados y corregidos antes de cerrar la entrega frontend —
    (1) `window.open()` se llamaba después de un `await`, fuera del gesto de
    usuario original; Safari (y Chrome en algunos casos) bloquea eso como
    popup no solicitado. Se corrigió abriendo una pestaña en blanco de forma
    síncrona dentro del click y rediligiéndola (`pendingTab.location.href`)
    una vez resuelto el número — verificado con Playwright que la pestaña
    efectivamente navega a la URL de `wa.me` correcta. Nota: la pestaña
    síncrona se abre **sin** `noopener`/`noreferrer`, a propósito — cualquiera
    de los dos hace que el navegador devuelva `null` en vez de la referencia
    necesaria para redirigirla; es seguro omitirlos aquí porque el destino
    (`wa.me` + texto propio) lo construye este mismo código, no contenido de
    terceros. (2) `getContactLink` solo caía al fallback offline
    (`MOCK_LISTINGS`) ante fallos de red, no ante una respuesta HTTP de error
    (p. ej. un backend real que aún no tiene esta ruta, devolviendo 404) —
    inconsistente con el resto de `lib/api.ts` y habría roto "Contactar"
    justo durante la transición hacia el backend real. *(Nota: este segundo
    bug quedó identificado pero no corregido en esta sesión — ver pendientes
    abajo.)*
  - *Cobertura de tests agregada*: `tests/api-contact.test.ts` (3 casos:
    éxito vía API, fallback offline por fallo de red, error cuando el id no
    existe ni en la API ni en el fallback) y una nueva suite en
    `tests/feed.test.tsx` (2 casos: la pestaña se abre sincrónicamente y se
    redirige a la URL de `wa.me` correcta al resolver; el error se muestra y
    la pestaña pendiente se cierra si `getContactLink` falla). 13/13 tests
    verdes, `npm run validate` limpio.
  - *Cierre (2026-08-19)*: el endpoint real `POST /listings/{id}/contact`
    quedó implementado en `backend-proyecto-colombia`
    (`src/services/listing.service.ts#revealContact`,
    `src/controllers/listing.controller.ts#revealContact`, ruta en
    `src/handlers/listings.ts`) — valida el Turnstile token cuando se
    provee (sin bloquear si falta), devuelve 404 si el aviso no existe o
    está `eliminado`, y el `GET /listings` público deja de devolver el
    número crudo: `getPaginatedActiveListings` enmascara `whatsapp` con
    `maskWhatsapp` (`+57******0123`) antes de responder, reutilizando el
    mismo helper que ya protegía la vista de moderación (`list_all`/
    `reveal_contact` del admin, aportado por el colega en
    `fd3baeb`/`src/utils/redact.ts`). El fix de `getContactLink` (bug-014)
    también se aplicó: ahora distingue 404 real (definitivo, no cae al
    fallback) de cualquier otro error HTTP (cae al fallback offline, igual
    que `fetchListings`). 59/59 tests de backend y 26/26 de frontend
    verdes; `npm run validate` limpio en ambos repos.
  - *Pendiente, fuera de alcance de esta sesión*: rate-limit por IP en
    `POST /listings/{id}/contact` no está implementado en código de
    aplicación — la ruta recomendada es un usage plan/throttling a nivel
    de API Gateway en el repo de infraestructura (Terraform), no lógica en
    el Lambda. Documentado en `openapi.yaml` de `backend-proyecto-colombia`
    como nota de la operación.
  - Pasa de 🟡 a ✅.

### Épica 7 — Política de datos y cumplimiento (Habeas Data)
- [✅] **US-7.1**: Como usuario, puedo leer una política de datos clara (modal
  `PrivacyPolicyModal.tsx` y página `/terminos-y-privacidad`, reemplaza la
  referencia original a un `privacidad.html` estático que nunca se construyó)
  que explica: qué datos se recolectan (celular/WhatsApp, ciudad, barrio,
  personas, fechas, precio, descripción y fotos opcionales — explícitamente
  sin nombre ni documento de identidad), para qué se usan (únicamente
  conectar oferta/demanda de alojamiento), cuánto tiempo se conservan (15/30/90
  días) y cómo solicitar su eliminación (autoservicio con PIN o el canal
  documentado en `docs/DATA_POLICY.md`).
  - *Criterios*: lenguaje simple, no jurídico-denso; referencia explícita a la
    Ley 1581 de 2012 y el Decreto 1377 de 2013 (Habeas Data - Colombia).
- [✅] **US-7.2**: Como administrador, tengo un proceso documentado (`docs/DATA_POLICY.md`)
  para atender solicitudes de eliminación de datos personales, incluyendo un
  canal de contacto (correo o formulario) y un tiempo de respuesta comprometido.
- [✅] **US-7.3**: Como sistema, las publicaciones resueltas/eliminadas o
  vencidas se purgan/anonimizan de forma efectiva en la base de datos, no
  solo se ocultan del feed. Implementado como barrido diario (Lambda +
  EventBridge Scheduler, `infra-proyecto-colombia/retention.tf`) sobre la
  logica en `backend-proyecto-colombia/src/services/retention.service.ts`.
  El modelo final se revisó y difiere del propuesto originalmente abajo
  (ver "Política de retención" actualizada) — la versión anterior (15 días
  de vencimiento duro) se consideró demasiado estricta para alguien
  buscando alojamiento activamente.
- [✅] **US-7.4**: Como usuario, debo marcar explícitamente una casilla de
  aceptación de la política de datos antes de poder enviar cualquier
  formulario ("Tengo" o "Necesito").

**Política de retención (US-7.3, implementada — ver `docs/DATA_POLICY.md` para el detalle operativo):**
- Resuelta o eliminada (autor vía PIN, o moderador): datos personales
  (WhatsApp, descripción, correo) se anonimizan **de inmediato**, en el
  momento del cambio de estado. El registro se elimina 90 días después,
  como ventana de auditoría.
- Activa sin confirmar: a los 30 días se envía un correo de aviso con
  enlace de renovación de un clic (`POST /listings/{id}/renew`, PIN); sin
  respuesta, a los 60 días se elimina de inmediato (sin anonimizado
  intermedio).
- Reportada queda fuera del ciclo — solo entra si se resuelve a
  resuelto/eliminado.
- Esto requirió agregar `email` como campo **requerido** al publicar — una
  excepción deliberada y acotada al principio de "publicar sin fricción,
  sin login" (ver US-6.5 abajo), necesaria para que el aviso de renovación
  tenga a dónde llegar.

### Épica 8 — Despliegue y CI/CD (frontend)
- [✅] **US-8.1**: Como mantenedor, cada push y PR a `main`/`dev` ejecuta en GitHub
  Actions los mismos checks que el flujo local (type-check, lint, tests, build) y
  publica un artefacto estático (`out/`) reutilizable por el repo de
  infraestructura para el despliegue productivo.
- [✅] **US-8.3**: Como contribuidor, tengo **un solo comando local determinista**
  (`npm run validate`) que cubre exactamente lo que exige CI, ejecutable desde un
  clon limpio en macOS con `npm ci && npm run validate`.
  - *Criterios*: orden fijo typecheck → lint → test → build; falla en el primer
    error; produce `out/`; documentado en `README.md`.
- [✅] **US-8.4**: Como mantenedor, el gate de tests tiene valor real: se eliminó
  `--passWithNoTests` y el paso 3 corre suites de render de la landing y del feed.
  - *Entregado (2026-08-15)*: `vitest.config.mts` (jsdom, `tests/setup.ts`, alias
    `@`), `tests/landing.test.tsx` (4 casos, mockea `fetchListings`),
    `tests/feed.test.tsx` (4 casos sobre `ListingGrid`) y `tests/fixtures/`.
  - *Criterios*: 8/8 verdes; sin acceso a red; `npm run validate` exit 0; un test
    en rojo corta la cadena antes del build (verificado con un canario).
- [⏸️] **US-8.2 (aplazado — decisión 2026-08-14)**: ambiente de *preview*/staging
  del frontend. **No se construye por ahora.** La validación previa a producción
  se hace con paridad local↔CI (`npm run validate`); no se crean ramas,
  environments ni artefactos de preview. Reabrir solo si el volumen de cambios
  o la coordinación con la API de staging lo justifica.

### Épica 9 — Rendimiento y optimización de carga (fase 2)
- [⬜] **PERF-1**: Como usuario, la página de inicio y el feed cargan de forma
  rápida y con un tiempo de interacción inicial que se percibe como ágil en
  conexiones limitadas.
- [⬜] **PERF-2**: Como mantenedor, el bundle inicial y los recursos críticos del
  hero/feed se optimizan para reducir peso innecesario sin comprometer claridad
  visual ni usabilidad.
- [⬜] **PERF-3**: Como equipo, se registran métricas de rendimiento básicas y se
  definen hipótesis de mejora antes de introducir cambios complejos.

---

## 6. Contrato de API esperado (`openapi.yaml`)

El contrato vigente del frontend con el backend debe mantenerse en `openapi.yaml`
y ser la fuente de verdad para las integraciones del repo. Los endpoints que el
MVP debe soportar son:

| Endpoint | Método | Propósito |
|---|---|---|
| `/listings` | GET | Obtener publicaciones activas, con filtros por ciudad/barrio/tipo/precio |
| `/listings` | POST | Crear una nueva publicación ("ofrezco" o "necesito") |
| `/listings/report` | POST | Incrementar contador de reportes de una publicación |
| `/listings/resolve` | POST | Marcar una publicación como resuelta usando un PIN |
| `/listings/upload-url` | POST | Solicitar una URL prefirmada para subir imágenes |

El frontend no debe asumir detalles de implementación del backend (RDS,
Lambda, etc.) — solo consumir estos endpoints vía `lib/api.ts` y los tipos de
`lib/types.ts`.

**Nota de alineación:** este MVP conserva el contrato actual del repo, incluyendo
la ruta `report` y `resolve`, porque esa es la implementación ya presente y la
que el equipo está usando para la integración inicial.

---

## 7. Moderación y seguridad (crítico dado el contexto de crisis)

- **Riesgo principal**: personas vulnerables (desplazadas, en shock, buscando
  refugio urgente) pueden ser blanco de estafas o abuso a través de esta
  plataforma. Esto debe tratarse con la misma seriedad que el resto del producto.
- Mitigaciones mínimas para el MVP:
  1. Sin recolección de datos personales más allá de lo estrictamente
     necesario (no se pide cédula, dirección exacta ni datos bancarios).
  2. Aviso visible en cada formulario: *"Nunca compartas datos bancarios ni
     realices pagos por adelantado a través de este sitio."*
  3. Botón de reporte visible y de bajo esfuerzo en cada publicación.
  4. Expiración automática de publicaciones tras 15 días de inactividad
     (ver política de retención en sección 5, Épica 7).
  5. Documentar en `docs/SAFETY.md` un proceso claro de qué hacer si se
     detecta abuso (contacto del mantenedor, tiempos de respuesta esperados).
  6. Notificaciones por SES al equipo moderador cuando una publicación es
     reportada, para revisión oportuna (US-6.2).
- Considerar enlazar recursos oficiales de la Cruz Roja / UNGRD / alcaldías en
  el footer, para no competir con canales oficiales sino complementarlos.

---

## 8. Pipeline de CI/CD del frontend (`.github/workflows/frontend-ci.yml`)

**Principio rector: paridad local ↔ CI.** CI no ejecuta ningún check que un
contribuidor no pueda correr con `npm run validate`, y `npm run validate` no
omite ningún check que CI exija. Si divergen, se corrige el workflow.

El workflow del frontend debe:
1. Dispararse en `push` a `main` y `dev`, y en PRs hacia esas ramas.
2. Fijar la versión de Node desde `.nvmrc` (misma que en local) e instalar
   dependencias con `npm ci`.
3. Ejecutar los mismos checks que `npm run validate`, en pasos separados para que
   la anotación de fallo apunte al check exacto: `npm run typecheck`,
   `npm run lint`, `npm run test`.
4. Resolver la URL base de la API (`NEXT_PUBLIC_API_URL`) desde la repository
   variable, coordinada con el repo de infraestructura. Si no está configurada,
   emite un `::warning` y usa el endpoint de producción para no publicar un
   artefacto roto.
5. Generar el build estático y publicar un artefacto (`out/`) reutilizable para
   despliegues productivos desde el repo de infraestructura
   (`infra-proyecto-colombia`) hacia S3/CloudFront.
6. Fallar el pipeline si hay errores de type-check, lint, tests o build, para
   evitar romper el sitio en producción durante una crisis activa.

**Sin preview ni staging (decisión 2026-08-14):** el workflow no crea ramas,
environments ni artefactos de preview. La única salida es `static-export`.

*(El pipeline productivo de infraestructura — RDS, Lambda/API, SES, S3,
CloudFront — vive en el repo de IaC del arquitecto y está fuera del alcance de
este documento.)*

**Nota de despliegue:** este repo solo valida el frontend y expone el artefacto
estático; la ruta productiva es build estático hacia S3/CloudFront desde el repo
de infraestructura.

---

## 9. Plan de lanzamiento (orden sugerido para los agentes)

1. Andamiaje del repo (estructura de carpetas, README, licencia MIT/abierta).
2. Coordinar con el repo de infraestructura: confirmar contrato de API
   (sección 6) y obtener URL de ambiente de staging.
3. Redactar `docs/DATA_POLICY.md` y `privacidad.html` (Épica 7) — **antes**
   de que el sitio recolecte cualquier dato real.
4. Construir landing (US-1.1, US-1.2, US-1.3).
5. Construir formularios "Tengo" y "Necesito" (Épicas 2 y 3), incluyendo
   checkbox de aceptación de política de datos (US-7.4).
6. Construir feed con filtros (Épica 4).
7. Integrar enlaces de WhatsApp (Épica 5).
8. Implementar reporte/moderación y notificaciones SES (Épica 6).
9. Configurar pipeline de despliegue del frontend (Épica 8).
10. Prueba manual end-to-end en móvil real con conexión simulada 3G, contra
    el ambiente de staging del backend.
11. Compartir enlace inicial en los mismos grupos de Instagram/WhatsApp donde
    ya se está compartiendo información, para validar con usuarios reales.

---

## 10. Fase 2 (no construir aún, solo dejar documentado)

- Bot de WhatsApp para publicar por mensaje (requiere WhatsApp Business API).
- Verificación ligera de número telefónico (OTP), posiblemente vía SNS.
- Traducción/soporte para comunidades indígenas o afrodescendientes de Chocó
  si el idioma o el acceso a internet son una barrera adicional.
- Integración con organizaciones oficiales (Cruz Roja, UNGRD, alcaldías) para
  posible adopción institucional del feed.
- Panel de administración con autenticación real (hoy: revisión manual +
  alertas SES) si el volumen de reportes lo justifica.

---

## 11. Métricas de éxito del MVP

- Publicaciones activas por ciudad (objetivo inicial: >20 en Pereira y Cali
  combinados en la primera semana).
- Tiempo entre publicación de "necesito" y primer contacto por WhatsApp.
- Tasa de publicaciones marcadas como "resuelta" (indica que el match funcionó).
- Reportes de abuso (objetivo: mantenerlos cerca de cero; cualquier reporte
  debe revisarse en <24h vía la alerta de SES).
- Cero incidentes de manejo indebido de datos personales; cero solicitudes de
  eliminación sin atender dentro del plazo comprometido (5 días hábiles).