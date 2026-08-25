# DATA_POLICY

## Objetivo
Este documento define el proceso operativo del frontend para atender solicitudes de
eliminacion o anonimización de datos personales en Vecinos Héroes,
en cumplimiento de Ley 1581 de 2012 y Decreto 1377 de 2013.

## Alcance
- Aplica a datos recolectados por la publicacion: barrio, fechas, descripcion y
  numero de WhatsApp.
- No cubre infraestructura AWS interna (RDS, Lambda, jobs), que pertenece a
  `infra-proyecto-colombia`.

## Canal de solicitud
- Correo operativo: `pendiente-definir@vecinosheroes.com` — **sigue siendo un
  placeholder, en proceso de habilitación**. No existe buzon en el dominio todavia:
  ver la seccion de correo en
  `infra-proyecto-colombia/docs/DNS_GODADDY_RUNBOOK.md`.
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
   - Anonimizacion (`whatsapp`, `descripcion`) segun politica vigente.
4. Verificar que la publicacion no aparezca activa en feed publico.
5. Confirmar cierre al solicitante y guardar evidencia de atencion.

## Retencion acordada (objetivo)
- Vencimiento funcional: 15 dias de inactividad.
- Anonimizacion: 30 dias despues de resuelta/vencida.
- Eliminacion total: 90 dias despues, salvo obligacion legal.

## Responsabilidades
- Frontend repo: documentar proceso, capturar solicitudes y coordinar ejecucion.
- Infra repo: ejecutar cambios efectivos en base de datos y automatizaciones.

## Pendientes
- Definir correo oficial y responsable primario.
- Vincular runbook tecnico del job de retencion en infraestructura.
