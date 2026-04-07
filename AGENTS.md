# AGENTS.md

## Proyecto
Repositorio formativo con:
- `frontend/`: Angular 21
- `backend/`: NestJS 10

## Objetivo de trabajo
Priorizar soluciones claras, mantenibles y didácticas.
Explicar decisiones cuando ayuden al aprendizaje.
Evitar complejidad innecesaria.

## Reglas para frontend
Trabajar dentro de `frontend/` salvo que la tarea requiera cambios explícitos en backend.
Respetar la arquitectura y estilo ya existentes en el proyecto.
Preferir patrones modernos de Angular compatibles con la versión del proyecto.
Mantener el código legible para contexto de formación.

## Formularios
Usar formularios reactivos como enfoque por defecto en el frontend.
No mezclar enfoques de formularios sin una razón clara.
No migrar formularios existentes a otro patrón salvo petición expresa.

## API
Tomar Swagger y los DTOs del backend como fuente de verdad.
No asumir contratos de API si pueden verificarse en backend.

## UI y UX
Priorizar accesibilidad, estados de carga y error, diseño responsive y claridad.
Evitar añadir librerías de UI nuevas sin justificación clara.

## Verificación
Tras cambios relevantes en Angular:
- ejecutar build del frontend
- ejecutar tests si existen o si el cambio los afecta

## Cambios
No hacer refactors amplios no solicitados.
No modificar configuración global o dependencias salvo necesidad justificada.
