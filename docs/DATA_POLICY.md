# DATA_POLICY

## Objetivo
Este documento define el proceso operativo del frontend para atender solicitudes de
eliminacion o anonimización de datos personales en Vecinos Héroes,
en cumplimiento de Ley 1581 de 2012 y Decreto 1377 de 2013.

## Alcance
- Aplica a datos recolectados por la publicacion: barrio, fechas, descripcion,
  numero de WhatsApp y correo electronico (US-7.3, usado solo para el aviso de
  renovacion — ver "Retencion acordada" abajo).
- No cubre infraestructura AWS interna (RDS, Lambda, jobs), que pertenece a
  `infra-proyecto-colombia`.

## Canal de solicitud
- Correo operativo: `pendiente-definir@vecinosheroes.com` — **sigue siendo un
  placeholder, en proceso de habilitación**. No existe buzon en el dominio todavia:
  ver la seccion de correo en
  `infra-proyecto-colombia/docs/DNS_PORKBUN_RUNBOOK.md`.
- Hasta definir correo final, registrar solicitudes en issue privado con etiqueta
  `data-request` y fecha de recepcion.

## SLA
- Confirmacion de recepcion: maximo 24 horas.
- Resolucion de solicitud: maximo 5 dias habiles.

## Flujo de atencion
1. Recibir solicitud y validar referencia minima de la publicacion (`id`, ciudad,
   barrio aproximado o numero de contacto).
2. Registrar ticket interno con fecha/hora, solicitante y tipo de solicitud:
   acceso, correccion, eliminacion o revocatoria.
3. Ejecutar accion en backend via equipo de infraestructura:
   - Eliminacion total, o
   - Anonimizacion (`whatsapp`, `descripcion`, `email`) segun politica vigente.
4. Verificar que la publicacion no aparezca activa en feed publico.
5. Confirmar cierre al solicitante y guardar evidencia de atencion.

## Retencion acordada (US-7.3, implementada)

El modelo distingue segun por que una publicacion dejo de estar activa:

- **Resuelta o eliminada** (por el autor via PIN, o por un moderador): los
  datos personales (`whatsapp`, `descripcion`, `email`) se **anonimizan de
  inmediato**, en el mismo momento del cambio de estado — sin espera. El
  registro (ya sin datos personales) se **elimina por completo 90 dias
  despues**, como ventana de auditoria.
- **Activa, sin confirmacion**: a los **30 dias** sin que el autor confirme
  que sigue vigente, se envia un correo de aviso con un enlace de renovacion
  de un clic (`POST /listings/{id}/renew`, mismo modelo sin login que
  "marcar como resuelta" — PIN de 4 digitos). Si no hay respuesta, a los
  **60 dias** la publicacion y sus datos se **eliminan de inmediato**, sin
  paso intermedio de anonimizado.
- **Reportada** queda fuera de este ciclo por completo — es solo una bandera
  de moderacion, no un estado terminal. Solo entra al ciclo si se resuelve
  a `resuelto` o `eliminado`.

Job tecnico: `retentionService.runRetentionSweep()` en
`backend-proyecto-colombia` (`src/services/retention.service.ts`), corrido a
diario por una Lambda programada (`infra-proyecto-colombia/retention.tf`,
EventBridge Scheduler).

**Nota de diseño**: recolectar correo electronico es una excepcion
deliberada y acotada al flujo de publicar frente al principio de
"publicar sin friccion, sin login" (ver `ROADMAP.md` US-6.5) — necesaria
para que el aviso de renovacion tenga a donde llegar.

## Responsabilidades
- Frontend repo: documentar proceso, capturar solicitudes, formulario de
  publicar (incluye el campo de correo) y pagina de renovacion
  (`/renovar`).
- Backend repo: logica de anonimizado/renovacion/barrido de retencion.
- Infra repo: Lambda programada + EventBridge Scheduler que ejecuta el
  barrido a diario.

## Pendientes
- Definir correo oficial y responsable primario para el canal de
  solicitudes manuales.
