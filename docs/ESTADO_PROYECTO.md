# COMMERCE PLATFORM

## Estado actual

Commerce Platform se encuentra en desarrollo y ya cuenta con un MVP funcional publicado en Internet y conectado a Supabase.

Actualmente existe una arquitectura multi-comercio protegida mediante Row Level Security (RLS), autenticación administrativa mediante Supabase Auth, catálogo público, creación segura de pedidos y un panel administrativo para operar pedidos y productos.

El sistema ya permite que un cliente:

- consulte el catálogo de un comercio;
- consulte categorías y productos disponibles;
- agregue productos al carrito;
- cambie cantidades;
- ingrese sus datos;
- realice un pedido;
- y que el pedido quede registrado correctamente en Supabase.

El comercio puede:

- iniciar sesión en su panel administrativo;
- consultar sus pedidos;
- gestionar el ciclo operativo de cada pedido;
- consultar sus productos;
- crear productos;
- cambiar precios;
- y marcar productos como disponibles o agotados.

Los precios y totales definitivos de los pedidos son calculados y validados en la base de datos, no en el navegador.

El sistema se encuentra publicado mediante GitHub Pages y puede demostrarse sin depender de un servidor local.
---

## Paso actual

PASO 3.4 — Gestión de productos desde el panel administrativo funcionando.

El comercio ya puede consultar, crear y administrar productos directamente desde su panel.

Siguiente objetivo:

PASO 3.5 — Dashboard y resumen operativo del negocio funcionando.

Siguiente objetivo:

PASO 3.6 — Reportes básicos de ventas.

---

# Completado

## 1. Base de datos inicial

- Proyecto Supabase creado.
- Base de datos PostgreSQL activa.
- Row Level Security (RLS) habilitado.
- Se creó la tabla `stores`.
- Se insertó el primer comercio de prueba: `Mercado Demo`.
- Se verificó la generación automática de UUID y `created_at`.

---

## 2. Categorías

- Se creó la tabla `categories`.
- Se relacionó `categories.store_id` con `stores.id`.
- Se configuró actualización y eliminación en cascada.
- Se creó la categoría de prueba `Bebidas`.
- Se verificó la relación comercio → categoría.

---

## 3. Productos

- Se creó la tabla `products`.
- Se relacionó `products.store_id` con `stores.id`.
- Se relacionó `products.category_id` con `categories.id`.
- Se creó el producto de prueba `Coca-Cola 1.5L`.
- Se verificó la relación comercio → categoría → producto.

---

## 4. Clientes

- Se creó la tabla `customers`.
- Se relacionó `customers.store_id` con `stores.id`.
- Se creó el cliente de prueba `Cliente Demo`.
- Se verificó la relación comercio → cliente.

---

## 5. Pedidos

- Se creó la tabla `orders`.
- Se relacionó `orders.store_id` con `stores.id`.
- Se relacionó `orders.customer_id` con `customers.id`.
- Se configuró `SET NULL` al eliminar un cliente para conservar el historial.
- Se creó correctamente el primer pedido de prueba.
- Se verificaron subtotal, domicilio y total.

---

## 6. Productos dentro de pedidos

- Se creó la tabla `order_items`.
- Se relacionó `order_items.order_id` con `orders.id`.
- Se relacionó `order_items.product_id` con `products.id`.
- Se configuró `SET NULL` para conservar el historial si un producto desaparece.
- Se vinculó `Coca-Cola 1.5L` al primer pedido.
- Se verificaron cantidad, precio unitario y total de línea.

---

## 7. Historial de pedidos

- Se creó la tabla `order_events`.
- Se relacionó `order_events.order_id` con `orders.id`.
- Se creó el primer evento de pedido.
- Se registró correctamente el evento `created`.
- Se registró el estado inicial `pending`.
- Se verificó que el historial funciona independientemente del estado actual del pedido.

---

## 8. Reglas de integridad

- Se restringieron los estados permitidos de los pedidos.
- Se restringió `fulfillment_type` a:
  - `delivery`
  - `pickup`
- Se impidieron cantidades negativas.
- Se impidieron precios negativos.
- Se impidieron subtotales negativos.
- Se impidieron costos de domicilio negativos.
- Se impidieron totales negativos.
- Se agregaron reglas de unicidad por comercio.

---

## 9. Protección multi-comercio

- Se protegió la relación producto → categoría.
- Se impidió relacionar productos con categorías de otro comercio.
- Se protegió la relación pedido → cliente.
- Se impidió relacionar pedidos con clientes de otro comercio.
- Se protegió la relación pedido → producto.
- Se impidió agregar productos de otro comercio a un pedido.
- Se ejecutaron pruebas multi-comercio mediante transacciones y `ROLLBACK`.
- Se verificó correctamente el aislamiento entre comercios.

---

## 10. Usuarios administrativos

- Se creó la tabla `store_members`.
- Se integró Supabase Auth.
- Se relacionó `store_members.store_id` con `stores.id`.
- Se relacionó `store_members.user_id` con `auth.users.id`.
- Se creó el primer usuario administrativo de prueba.
- Se asignó el rol `owner` a Mercado Demo.
- Se agregó la posibilidad de activar o desactivar membresías.
- Se agregó unicidad por combinación comercio + usuario.

---

## 11. Row Level Security administrativo

Se implementó aislamiento multi-comercio mediante RLS.

Se protegieron las tablas:

- `stores`
- `categories`
- `products`
- `customers`
- `orders`
- `order_items`
- `order_events`
- `store_members`

Se creó lógica para identificar los comercios a los que pertenece cada usuario autenticado.

Se verificó que:

- un usuario administrativo puede acceder a su comercio;
- puede consultar sus categorías;
- puede consultar sus productos;
- puede consultar sus clientes;
- puede consultar sus pedidos;
- puede consultar los detalles de los pedidos;
- puede consultar el historial de los pedidos;
- no puede consultar información perteneciente a otro comercio.

---

## 12. Catálogo público

Se habilitó acceso público mediante el rol `anon`.

Los visitantes pueden consultar:

- comercios activos;
- categorías activas;
- productos activos;
- productos disponibles.

Los visitantes no reciben permisos administrativos.

---

## 13. Creación segura de pedidos públicos

Se creó la función:

`public.place_order()`

Esta función permite recibir pedidos desde el frontend sin entregar permisos directos de escritura sobre las tablas internas.

La función:

- valida que el comercio exista;
- valida que el comercio esté activo;
- valida el tipo de entrega;
- valida que existan productos;
- valida cantidades;
- valida que los productos pertenezcan al comercio;
- valida que los productos estén activos;
- valida que los productos estén disponibles;
- obtiene los precios directamente desde la base de datos;
- calcula los totales en el servidor;
- crea o relaciona al cliente;
- crea el pedido;
- crea los elementos del pedido;
- crea el evento inicial del pedido.

El navegador no decide el precio definitivo del pedido.

---

## 14. Pruebas de pedidos públicos

Se realizaron pruebas mediante transacciones y `ROLLBACK`.

Se verificó que:

- un visitante puede crear un pedido;
- los productos se registran correctamente;
- las cantidades se respetan;
- los precios provienen de Supabase;
- los totales son calculados correctamente;
- se crea el evento inicial;
- una prueba puede revertirse sin dejar datos temporales.

---

## 15. Frontend conectado a Supabase

Se conectó un frontend HTML + CSS + JavaScript directamente con Supabase.

Archivos principales actuales:

```text
commerce-platform/
│
├── demo.html
│
├── js/
│   ├── supabase.js
│   └── catalogo.js
│
├── css/
├── docs/
└── sql/

## 21. Panel administrativo inicial

- Se creó `admin.html`.
- Se creó `js/admin.js`.
- Se conectó el login con Supabase Auth.
- Se verificó el acceso del usuario `owner` de Mercado Demo.
- Se creó una primera vista de pedidos recibidos.
- Los pedidos son obtenidos directamente desde Supabase.
- El acceso está limitado mediante Row Level Security.
- Se muestran nombre del cliente, teléfono, dirección, notas, estado y total.

## 22. Gestión inicial de estados

- Se creó la función segura `public.change_order_status()`.
- La función verifica que el usuario autenticado pertenezca al comercio del pedido.
- Se definieron transiciones válidas entre estados.
- Se impiden cambios arbitrarios de estado.
- El panel administrativo permite aceptar pedidos pendientes.
- Se verificó el cambio `pending → accepted`.
- Cada cambio genera automáticamente un registro en `order_events`.
- El historial registra al usuario administrativo responsable mediante `actor_user_id`.

## 23. Ciclo operativo completo de pedidos

- El panel determina automáticamente qué acción corresponde según el estado del pedido.
- Los pedidos `pending` pueden ser aceptados.
- Los pedidos `accepted` pueden pasar a preparación.
- Los pedidos `preparing` pueden marcarse como listos.
- Los pedidos `ready` con entrega a domicilio pueden marcarse como enviados.
- Los pedidos `out_for_delivery` pueden marcarse como entregados.
- Los pedidos `completed` dejan de mostrar acciones adicionales.

Se verificó correctamente el ciclo:

`pending → accepted → preparing → ready → out_for_delivery → completed`

Cada transición se ejecuta mediante `public.change_order_status()`.

Cada cambio genera automáticamente un registro en `order_events`.

El historial conserva:

- estado anterior;
- estado nuevo;
- tipo de actor;
- usuario responsable;
- fecha y hora del cambio.

El primer pedido real creado desde el frontend completó correctamente todo el ciclo operativo.

## 24. Publicación web

Commerce Platform fue publicada mediante GitHub Pages.

URL principal:

`https://nicolasfcp.github.io/commerce-platform/`

Catálogo:

`https://nicolasfcp.github.io/commerce-platform/demo.html`

Panel administrativo:

`https://nicolasfcp.github.io/commerce-platform/admin.html`

Se verificó desde Internet:

- carga del comercio;
- carga de categorías y productos;
- conexión con Supabase;
- acceso administrativo mediante Supabase Auth;
- consulta de pedidos protegida mediante RLS;
- funcionamiento de las acciones administrativas.

El proyecto ya no depende de un servidor local para realizar demostraciones comerciales.

---

## 25. Gestión administrativa de productos

Se amplió el panel administrativo para permitir que el comercio gestione su catálogo sin utilizar directamente Supabase.

El panel permite:

- consultar los productos pertenecientes al comercio;
- visualizar nombre, precio, disponibilidad y estado;
- cambiar el precio de un producto;
- marcar un producto como disponible;
- marcar un producto como agotado;
- crear productos nuevos;
- seleccionar la categoría del producto;
- indicar nombre, precio y descripción.

Se crearon las funciones seguras:

- `public.set_product_availability()`;
- `public.set_product_price()`;
- `public.create_product()`.

Estas funciones verifican que el usuario autenticado pertenezca al comercio correspondiente antes de realizar cambios.

Se verificó correctamente que:

- un producto marcado como agotado deja de aparecer en el catálogo público;
- al volver a marcarlo disponible aparece nuevamente;
- los cambios de precio se reflejan en el catálogo público;
- los productos nuevos aparecen automáticamente en el catálogo;
- los productos existentes continúan funcionando después de las modificaciones.

Se creó desde el administrador el producto de prueba:

`Agua 600ml`

Categoría:

`Bebidas`

Precio:

`$2.500`

El producto apareció correctamente en el catálogo público junto con `Coca-Cola 1.5L`.

La administración de productos fue verificada tanto localmente como desde la versión publicada en GitHub Pages.

---

## 26. Dashboard operativo del negocio

Se creó una primera vista de resumen dentro del panel administrativo.

El dashboard muestra información obtenida directamente desde Supabase:

- cantidad total de pedidos;
- pedidos pendientes;
- pedidos completados;
- valor acumulado de ventas completadas;
- cantidad de productos registrados.

Con los datos actuales de Mercado Demo se verificó:

- 2 pedidos recibidos;
- 1 pedido pendiente;
- 1 pedido completado;
- $19.500 en ventas completadas;
- 2 productos registrados.

Los cálculos se realizan desde el frontend utilizando únicamente información que el usuario autenticado puede consultar mediante RLS.

Este dashboard constituye la base para futuros reportes y análisis del negocio.