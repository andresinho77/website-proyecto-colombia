# SAFETY

## Objetivo
Reducir riesgo de fraude o abuso para personas en situacion de emergencia que usan
la plataforma de alojamiento temporal.

## Señales de riesgo
- Solicitudes de pago por adelantado.
- Peticion de datos bancarios, documentos sensibles o direccion exacta.
- Comportamiento agresivo o suplantacion.

## Protocolo de respuesta
1. Recibir reporte desde boton de publicacion o canal directo.
2. Clasificar severidad:
   - Alta: posible fraude activo o amenaza.
   - Media: comportamiento sospechoso sin evidencia fuerte.
   - Baja: contenido inadecuado no critico.
3. Ejecutar mitigacion inicial:
   - Ocultar publicacion si supera umbral de reportes o hay riesgo alto.
   - Marcar para revision en panel admin.
4. Escalar a mantenimiento/infra para bloqueo definitivo o eliminacion.
5. Registrar incidente con fecha, referencia de publicacion y accion tomada.

## Tiempos de respuesta
- Riesgo alto: revision inicial en menos de 24 horas.
- Riesgo medio/bajo: revision en menos de 48 horas.

## Mensaje preventivo obligatorio
Mostrar en formularios y areas de contacto:
"Nunca compartas datos bancarios ni realices pagos por adelantado a traves de este sitio."

## Canales oficiales sugeridos para usuarios
- Cruz Roja Colombiana
- UNGRD
- Canales oficiales de alcaldias locales

## Ownership
- Frontend repo: UX de reportes, advertencias y trazabilidad documental.
- Infra repo: notificaciones SES, retencion, borrado y automatizaciones operativas.
