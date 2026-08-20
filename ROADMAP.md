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
- [⬜] **US-4.3 (fase 2)**: Vista de mapa con pines por barrio.
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
- [⬜] **US-7.3**: Como sistema, las publicaciones con `estado = eliminado` o
  vencidas (ver retención abajo) deben purgarse o anonimizarse de forma
  efectiva en la base de datos, no solo ocultarse del feed — esto debe
  coordinarse con el repo de infraestructura como un job programado (p. ej.
  Lambda con EventBridge) o un proceso documentado que el arquitecto ejecute.
- [✅] **US-7.4**: Como usuario, debo marcar explícitamente una casilla de
  aceptación de la política de datos antes de poder enviar cualquier
  formulario ("Tengo" o "Necesito").

**Política de retención propuesta (a validar con el arquitecto):**
- Publicaciones activas: se auto-marcan como vencidas a los 15 días de
  inactividad.
- Datos de publicaciones vencidas/resueltas: anonimizar (remover WhatsApp y
  descripción) a los 30 días; eliminar el registro completo a los 90 días,
  salvo que exista una obligación legal de conservarlo por más tiempo.
- Solicitudes de eliminación manual: procesar en un máximo de 5 días hábiles.

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
- Vista de mapa.
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