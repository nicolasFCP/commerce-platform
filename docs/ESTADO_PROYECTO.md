# COMMERCE PLATFORM

## Estado actual

Proyecto iniciado.

## Paso actual

PASO 2 — Base de datos con Supabase.

### Completado

- Proyecto Supabase creado.
- Base de datos PostgreSQL activa.
- RLS habilitado.
- Se creó la tabla `stores`.
- Se insertó correctamente el primer comercio de prueba: Mercado Demo.
- Se verificó la generación automática de UUID y fecha de creación.

### Tabla stores

Columnas:

- id: uuid, clave primaria, generado automáticamente.
- created_at: fecha de creación automática.
- name: nombre del comercio.
- slug: identificador único del comercio para URL.
- phone: teléfono del comercio.
- logo_url: dirección del logo, opcional.
- primary_color: color principal del comercio.
- active: indica si el comercio está activo.

### Próximo objetivo

Crear las demás tablas fundamentales y sus relaciones.

## Tecnología

Frontend:
- HTML
- CSS
- JavaScript

Backend:
- Supabase

## Objetivo

Crear una plataforma de catálogo y pedidos para pequeños comercios.

El comercio tendrá su propio panel para administrar:

- pedidos
- productos
- categorías
- precios
- disponibilidad

El cliente podrá:

- ver productos
- buscar
- usar categorías
- agregar al carrito
- realizar pedidos
- consultar el estado del pedido

## Diseño

La plataforma será Mobile First.

Debe poder utilizarse cómodamente desde celular tanto por clientes como por comercios.

## Modelo comercial

El software pertenece al desarrollador.

Cada comercio obtiene una licencia de uso.

No se entrega el código fuente al comercio.

## Regla de desarrollo

No pasar al siguiente paso hasta que el actual funcione correctamente.

Antes de cambios importantes crear respaldo.

No modificar varias partes del sistema al mismo tiempo sin comprobar primero que la versión anterior funciona.