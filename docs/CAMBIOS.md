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

## Versión 0.0.7

Fecha: 31 de agosto de 2026

- Se creó la tabla `order_items`.
- Se conectó `order_items` con `orders`.
- Se conectó `order_items` con `products`.
- Se configuró conservación del historial si se elimina un producto.
- Se vinculó `Coca-Cola 1.5L` al primer pedido.
- Se verificaron cantidad, precio unitario y total de línea.

## Versión 0.0.8

Fecha: 31 de agosto de 2026

- Se creó la tabla `order_events`.
- Se conectó `order_events` con `orders`.
- Se creó el primer evento del pedido de prueba.
- Se registró el evento `created → pending`.
- Se verificó el historial básico de pedidos.

## Versión 0.0.9

Fecha: 1 de septiembre de 2026

- Se agregaron restricciones de estados y tipos de entrega.
- Se bloquearon cantidades, precios y valores negativos.
- Se agregaron reglas de unicidad por comercio.
- Se blindaron las relaciones multi-comercio.
- Se agregaron triggers de validación para pedidos, clientes y productos.
- Se verificó el aislamiento multi-comercio mediante pruebas temporales con `ROLLBACK`.

## Versión 0.0.10

Fecha: 1 de septiembre de 2026

- Se creó la tabla `store_members`.
- Se conectó `store_members` con `stores` y `auth.users`.
- Se agregaron roles `owner` y `staff`.
- Se vinculó el primer usuario autenticado con `Mercado Demo`.
- Se creó la función privada `private.user_store_ids()`.
- Se implementó RLS para `stores`.
- Se implementó RLS para `categories` y `products`.
- Se implementó RLS para `customers` y `orders`.
- Se implementó RLS para `order_items` y `order_events`.
- Se verificó mediante pruebas con `ROLLBACK` que un comercio no puede acceder a información de otro comercio.
- Se verificó correctamente el acceso del owner de `Mercado Demo` a sus clientes, pedidos, productos e historial.

## Versión 0.0.11

Fecha: 1 de septiembre de 2026

- Se habilitó el catálogo público para visitantes anónimos.
- Se permitió consultar comercios activos.
- Se permitió consultar categorías activas.
- Se permitió consultar productos activos y disponibles.
- Se verificó el acceso público mediante el rol `anon`.
- Se creó `public.place_order()` para recibir pedidos públicos.
- Los precios y totales son calculados por la base de datos y no por el navegador.
- Se validan comercio, productos, disponibilidad, cantidades y tipo de entrega.
- Se crea automáticamente el cliente, pedido, detalle del pedido e historial inicial.
- Se verificó mediante una prueba con `ROLLBACK` la creación segura de un pedido público.

## Versión 0.0.12

Fecha: 1 de septiembre de 2026

- Se conectó el frontend HTML/JavaScript con Supabase.
- Se creó una demo pública de comercio.
- El catálogo carga comercios, categorías y productos directamente desde la base de datos.
- Se implementó un carrito con control de cantidades.
- Se agregó formulario para nombre, teléfono, dirección y notas.
- El frontend utiliza `public.place_order()` para crear pedidos.
- Se realizó el primer pedido real desde el navegador.
- Se verificó la creación correcta en `orders`, `order_items` y `order_events`.
- Los precios y totales continúan siendo calculados y validados por la base de datos.

## Versión 0.0.13

Fecha: 1 de septiembre de 2026

- Se creó el primer acceso administrativo desde el frontend.
- Se conectó el login con Supabase Auth.
- Se verificó el inicio de sesión del owner de Mercado Demo.
- Se conectó el panel administrativo con la tabla `orders`.
- Los pedidos son consultados mediante la sesión autenticada y RLS.
- Se verificó que Mercado Demo puede visualizar sus pedidos recibidos.
- El panel muestra cliente, teléfono, dirección, notas, estado y total.

## Versión 0.0.14

Fecha: 1 de septiembre de 2026

- Se creó `public.change_order_status()`.
- Se implementaron transiciones controladas de estados de pedidos.
- Se verificó que únicamente usuarios pertenecientes al comercio puedan administrar sus pedidos.
- Se agregó el botón `Aceptar pedido` al panel administrativo.
- Se cambió correctamente un pedido de `pending` a `accepted` desde el navegador.
- Se registró automáticamente el evento `status_changed`.
- Se guardaron `from_status`, `to_status`, `actor_type` y `actor_user_id`.
- Se verificó que el historial identifica al usuario administrativo que realizó el cambio.

## Versión 0.0.15

Fecha: 1 de septiembre de 2026

- Se convirtió la gestión de pedidos en un flujo dinámico según el estado actual.
- El panel administrativo muestra automáticamente la acción correspondiente a cada pedido.
- Se verificó el flujo `accepted → preparing`.
- Se verificó el flujo `preparing → ready`.
- Se verificó el flujo `ready → out_for_delivery`.
- Se verificó el flujo `out_for_delivery → completed`.
- Los pedidos completados dejan de mostrar acciones administrativas.
- Se verificó en `order_events` el historial completo del ciclo de un pedido a domicilio.
- Cada cambio de estado registra al usuario administrativo responsable.
- Se completó correctamente el primer ciclo operativo completo de un pedido desde el frontend.

## Versión 0.0.16

Fecha: 1 de septiembre de 2026

- Se publicó Commerce Platform en GitHub.
- Se activó GitHub Pages desde la rama `main`.
- Se verificó el catálogo conectado a Supabase desde Internet.
- Se verificó el panel administrativo desde Internet.
- Se verificó el inicio de sesión del comercio desde la versión pública.
- Se verificó la consulta de pedidos mediante RLS desde GitHub Pages.
- Commerce Platform ya cuenta con una demo pública accesible sin servidor local.
- Se agregó `index.html` para redirigir la URL principal al catálogo.

## Versión 0.0.17

Fecha: 2 de septiembre de 2026

- Se agregó la consulta de productos al panel administrativo.
- El comercio puede visualizar sus productos desde su sesión autenticada.
- Se creó `public.set_product_availability()`.
- El comercio puede marcar productos como disponibles o agotados desde el panel.
- Se verificó que los productos agotados dejan de aparecer automáticamente en el catálogo público.
- Se verificó que al volver a marcar un producto como disponible aparece nuevamente en el catálogo.
- Se creó `public.set_product_price()`.
- El comercio puede modificar el precio de sus productos desde el panel administrativo.
- Se verificó que los cambios de precio se reflejan automáticamente en el catálogo público.
- Las operaciones de disponibilidad y precio verifican que el usuario pertenezca al comercio correspondiente.
- Se creó `public.create_product()` como base segura para la creación de productos.
- Se agregó al panel administrativo el formulario visual inicial para crear productos.
- El formulario incluye nombre, categoría, precio y descripción.
- La creación de productos desde el frontend todavía está pendiente de conectar con JavaScript.

## Versión 0.0.18

Fecha: 2 de septiembre de 2026

- Se conectó el formulario de creación de productos con Supabase.
- Se implementó la carga dinámica de categorías disponibles en el panel administrativo.
- Las categorías del comercio son consultadas desde la tabla `categories`.
- Se conectó el formulario con `public.create_product()`.
- El comercio puede crear productos indicando nombre, categoría, precio y descripción.
- La creación de productos valida permisos mediante la pertenencia del usuario al comercio.
- Los productos nuevos se crean activos y disponibles por defecto.
- Se realizó la primera creación real de un producto desde el panel administrativo.
- Se creó `Agua 600ml` dentro de la categoría `Bebidas` con precio de $2.500.
- Se verificó que el nuevo producto aparece automáticamente en el catálogo público.
- Se verificó que los productos existentes continúan funcionando correctamente.

## Versión 0.0.19

Fecha: 3 de septiembre de 2026

- Se creó el primer dashboard operativo del comercio.
- Se agregó una sección `Resumen del negocio` al panel administrativo.
- El dashboard consulta información real desde Supabase.
- Se muestra la cantidad total de pedidos recibidos.
- Se muestra la cantidad de pedidos pendientes.
- Se muestra la cantidad de pedidos completados.
- Se calcula el valor total de las ventas completadas.
- Se muestra la cantidad de productos registrados.
- Los datos del dashboard están protegidos mediante la sesión autenticada y las políticas RLS existentes.
- Se verificó correctamente el dashboard con los datos actuales de Mercado Demo.
## Versión 0.0.20

Fecha: 3 de septiembre de 2026

- Se agregó una sección de reportes al panel administrativo.
- Se implementó el cálculo de pedidos realizados durante el día actual.
- Se implementó el cálculo de ventas completadas durante el día actual.
- Se implementó el cálculo de ventas completadas durante los últimos 7 días.
- Se implementó el cálculo del ticket promedio de los pedidos completados.
- Los reportes utilizan información real de los pedidos almacenados en Supabase.
- Solo los pedidos con estado `completed` se contabilizan como ventas.
- Se verificó correctamente el funcionamiento de los reportes con los datos de Mercado Demo.

## Versión 0.0.21

Fecha: 3 de septiembre de 2026

- Se agregó una sección de análisis de productos al panel administrativo.
- Se conectó el análisis con las tablas `orders` y `order_items`.
- Para los análisis de ventas solo se consideran pedidos con estado `completed`.
- Se implementó el cálculo automático del producto más vendido.
- Se implementó el cálculo de unidades vendidas del producto líder.
- Se implementó el cálculo de ingresos generados por el producto líder.
- Se agrupan automáticamente las ventas de un mismo producto entre diferentes pedidos completados.
- Se verificó correctamente que `Coca-Cola 1.5L` es actualmente el producto más vendido.
- Se verificaron 3 unidades vendidas y $19.500 en ingresos para dicho producto.

## Versión 0.0.22

Fecha: 3 de septiembre de 2026

- Se agregó contacto directo por WhatsApp desde los pedidos del panel administrativo.
- Cada pedido muestra un botón `Contactar por WhatsApp`.
- El sistema obtiene automáticamente el número telefónico registrado en el pedido.
- Los números colombianos de 10 dígitos reciben automáticamente el prefijo internacional `57`.
- Se implementó la generación automática de mensajes según el estado actual del pedido.
- Los mensajes incluyen el nombre del cliente y el total del pedido.
- Se verificó correctamente la apertura de WhatsApp desde el administrador.
- La prueba utilizó un número ficticio, por lo que WhatsApp confirmó que dicho número no está registrado.

## Versión 0.0.23

Fecha: 3 de septiembre de 2026

- Se agregó infraestructura inicial para gestionar pagos en los pedidos.
- Se agregaron `payment_method`, `payment_status`, `payment_proof_url`, `paid_at` y `payment_verified_by` a `orders`.
- Se definieron los métodos de pago `transfer` y `cash_on_delivery`.
- Se definieron estados iniciales de pago: `pending`, `proof_received`, `paid` y `rejected`.
- Se creó `public.place_order_v2()` para recibir pedidos con método de pago sin modificar el flujo anterior.
- Se verificó `place_order_v2()` mediante una prueba segura con `ROLLBACK`.
- El checkout público permite elegir entre transferencia y efectivo contraentrega.
- Se realizó correctamente el primer pedido real con método de pago `transfer`.
- El panel administrativo muestra los productos incluidos en cada pedido.
- El panel administrativo muestra el método y estado del pago.
- Se agregó una protección para impedir que un pedido pagado por transferencia pase de `accepted` a `preparing` mientras el pago no esté confirmado.
- Se verificó correctamente el bloqueo desde el navegador.
- Se agregó un mensaje comprensible para informar al comercio cuando debe confirmar el pago antes de preparar.

## Versión 0.0.24

Fecha: 3 de septiembre de 2026

- Se agregó una estructura de revisión para los pedidos mediante `review_status`.
- Se agregaron estados individuales para los productos del pedido mediante `item_status`.
- Los productos pueden conservarse como `active`, `removed` o `replaced`.
- Se agregó información de auditoría para modificaciones de productos.
- Se creó `public.remove_order_item()`.
- La tienda puede quitar productos no disponibles sin borrar el historial original.
- Los totales del pedido se recalculan automáticamente usando únicamente los productos activos.
- Cuando un pedido es modificado, pasa a `changes_pending_customer`.
- Se impide eliminar el último producto activo del pedido.
- Se impide modificar productos una vez iniciada la preparación.
- El panel administrativo muestra productos quitados y el motivo del cambio.
- Se agregó protección para impedir aceptar un pedido mientras existan cambios pendientes de aprobación por el cliente.
- Se creó `public.confirm_order_changes()`.
- Se agregó una acción administrativa para registrar la aprobación del cliente.
- Después de la aprobación, el pedido puede ser aceptado por la tienda.
- Se verificó el flujo completo de quitar un producto, recalcular el total, obtener aprobación del cliente y aceptar el pedido.
- Se verificó un cambio real de total de $9.000 a $6.500 conservando el producto eliminado en el historial.

## Versión 0.0.25

Fecha: 4 de septiembre de 2026

- Se creó `public.replace_order_item()`.
- La tienda puede reemplazar un producto no disponible por otro producto activo y disponible del mismo comercio.
- El producto original se conserva en el historial con estado `replaced`.
- Se registra el motivo del reemplazo y la fecha del cambio.
- El nuevo producto se crea como un elemento activo del pedido.
- Se relaciona el nuevo producto con el elemento original mediante `replacement_for_item_id`.
- Se impide reemplazar un producto por sí mismo.
- Se impide utilizar como reemplazo productos inactivos, agotados o pertenecientes a otro comercio.
- Se recalculan automáticamente subtotal y total después del reemplazo.
- Todo reemplazo cambia el pedido a `changes_pending_customer`.
- El panel administrativo permite seleccionar un producto de reemplazo entre los productos disponibles del comercio.
- Se excluye del selector el mismo producto solicitado originalmente.
- El panel identifica visualmente los productos reemplazados.
- Se verificó el flujo completo de reemplazo, aprobación del cliente y aceptación posterior del pedido.
- Se verificó un reemplazo real de Coca-Cola 1.5L por Agua 600ml.
- El total del pedido cambió correctamente de $6.500 a $2.500.
- Se verificó que la relación entre el producto original y su reemplazo queda conservada en Supabase.

## Versión 0.0.26

Fecha: 4 de septiembre de 2026

- Se completó el primer flujo operativo de pagos por transferencia.
- Se creó `public.register_payment_proof()`.
- Un pedido por transferencia puede registrar la recepción de un comprobante.
- El estado de pago puede pasar de `pending` a `proof_received`.
- Se creó `public.confirm_order_payment()`.
- La confirmación de pago requiere que exista previamente un comprobante recibido.
- La confirmación solo puede ser realizada por un usuario autorizado del comercio.
- Al confirmar un pago se registra `payment_status = paid`.
- Se registra automáticamente la fecha del pago mediante `paid_at`.
- Se registra el usuario que verificó el pago mediante `payment_verified_by`.
- El panel administrativo muestra acciones según el estado del pago.
- Los pedidos con transferencia pendiente muestran `Registrar comprobante recibido`.
- Los pedidos con comprobante recibido muestran `Confirmar pago`.
- Los pedidos pagados muestran `Pago confirmado`.
- Se verificó que una transferencia sin pago confirmado no puede iniciar preparación.
- Se verificó que después de confirmar el pago el pedido puede pasar de `accepted` a `preparing`.
- La estructura queda preparada para integrar posteriormente la recepción automática de comprobantes mediante WhatsApp.

## Versión 0.0.27

Fecha: 4 de septiembre de 2026

- Se creó la tabla `store_payment_settings`.
- Cada comercio puede tener su propia configuración para pagos por transferencia.
- Se agregaron campos para banco, tipo de cuenta, número de cuenta, titular e instrucciones para el cliente.
- Se habilitó RLS para aislar la configuración entre comercios.
- Solo usuarios autenticados del comercio pueden consultar o modificar su configuración.
- Se creó `public.save_store_payment_settings()`.
- La función identifica automáticamente el comercio mediante el usuario autenticado y `store_members`.
- El panel administrativo permite cargar y modificar la configuración de transferencias.
- Se verificó la persistencia de la configuración después de recargar el panel.
- Se dejó preparada la información necesaria para generar posteriormente mensajes automáticos de cobro por WhatsApp.

## Versión 0.0.28

Fecha: 4 de septiembre de 2026

- Se integró la configuración bancaria del comercio con los mensajes de WhatsApp.
- Los pedidos aceptados con transferencia pendiente generan un mensaje con:
  - total definitivo del pedido;
  - banco o medio de pago;
  - tipo de cuenta;
  - número de cuenta;
  - titular;
  - instrucciones del comercio.
- Se agregó un mensaje específico cuando el comprobante fue recibido y está pendiente de verificación.
- Se agregó un mensaje específico cuando el pago fue confirmado.
- El botón "Empezar preparación" ya no aparece en pedidos por transferencia mientras el pago no esté confirmado.
- La preparación vuelve a habilitarse únicamente cuando `payment_status = paid`.
- Se verificaron correctamente los estados:
  - `pending`;
  - `proof_received`;
  - `paid`.
- El backend continúa protegiendo la transición hacia preparación aunque el frontend sea manipulado.
- El flujo de transferencia queda preparado para su futura automatización mediante WhatsApp Cloud API.

## Versión 0.0.29

Fecha: 4 de septiembre de 2026

- Se agregó configuración por comercio para habilitar o deshabilitar efectivo contraentrega.
- Los comercios pueden configurar independientemente:
  - pagos por transferencia;
  - efectivo contraentrega.
- Se creó `public.get_public_payment_methods()` para que el catálogo pueda consultar de forma segura únicamente los métodos de pago habilitados.
- El catálogo ahora muestra solamente los métodos de pago disponibles para cada comercio.
- Se verificó correctamente:
  - solo transferencia;
  - solo efectivo contraentrega;
  - ambos métodos habilitados.
- Se agregó protección en `change_order_status()` para impedir completar un pedido contraentrega mientras el pago siga pendiente.
- Se creó `public.confirm_cash_on_delivery_payment()`.
- La función registra:
  - `payment_status = paid`;
  - `paid_at`;
  - `payment_verified_by`;
  - cambio del pedido a `completed`.
- El panel muestra "Confirmar efectivo recibido y entrega" cuando un pedido contraentrega está `out_for_delivery` y el pago sigue pendiente.
- El pago y la entrega se confirman mediante una única operación segura.
- Se verificó el flujo completo:
  - pending;
  - accepted;
  - preparing;
  - ready;
  - out_for_delivery;
  - completed.
- Se verificó que `order_events` registra correctamente toda la secuencia y la razón `Efectivo contraentrega recibido`.
- Esta operación queda preparada para ser reutilizada posteriormente desde un panel exclusivo para domiciliarios.

