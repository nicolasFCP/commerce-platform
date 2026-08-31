# HISTORIAL DE CAMBIOS

## Versión 0.0.1

Fecha: 31 de agosto de 2026

- Proyecto creado.
- Se definió estructura inicial.
- Se estableció arquitectura Mobile First.
- Se decidió utilizar HTML, CSS, JavaScript y Supabase.
- Se estableció que el código fuente seguirá siendo propiedad del desarrollador.
## Versión 0.0.2

Fecha: 31 de agosto de 2026

- Se creó el proyecto en Supabase.
- Se configuró PostgreSQL.
- Se habilitó Row Level Security.
- Se creó la tabla `stores`.
- Se creó el primer registro de prueba `Mercado Demo`.
- Se verificó la generación automática de UUID y created_at.

## Versión 0.0.3

Fecha: 31 de agosto de 2026

- Se creó la tabla `categories`.
- Se conectó `categories` con `stores` mediante Foreign Key.
- Se configuró Cascade para actualización y eliminación.
- Se creó la categoría de prueba `Bebidas` para `Mercado Demo`.
- Se verificó que la relación entre comercio y categoría funciona correctamente.

## Versión 0.0.4

Fecha: 31 de agosto de 2026

- Se creó la tabla `products`.
- Se conectó `products` con `stores`.
- Se conectó `products` con `categories`.
- Se configuró Cascade en las relaciones.
- Se creó `Coca-Cola 1.5L` por $6.500 como producto de prueba.
- Se verificó la estructura comercio → categoría → producto.

## Versión 0.0.5

Fecha: 31 de agosto de 2026

- Se creó la tabla `customers`.
- Se conectó `customers` con `stores`.
- Se creó `Cliente Demo` como cliente de prueba.
- Se verificó la relación comercio → cliente.

## Versión 0.0.6

Fecha: 31 de agosto de 2026

- Se creó la tabla `orders`.
- Se conectó `orders` con `stores`.
- Se conectó `orders` con `customers`.
- Se configuró conservación del historial si se elimina un cliente.
- Se creó el primer pedido de prueba.
- Se verificaron subtotal, domicilio y total.