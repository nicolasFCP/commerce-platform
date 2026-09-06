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

## Versión 0.0.30

Fecha: 5 de septiembre de 2026

- Se creó la infraestructura para gestionar domiciliarios independientes por comercio.

- Se creó la tabla `delivery_drivers`.

- Cada domiciliario se relaciona con:
  - un comercio;
  - un usuario independiente de Supabase Auth;
  - nombre;
  - teléfono;
  - estado activo.

- Los domiciliarios no pertenecen a `store_members`, por lo que no reciben permisos administrativos.

- Se implementó RLS para permitir que:
  - el domiciliario consulte únicamente su propio perfil;
  - el administrador consulte los domiciliarios pertenecientes a sus comercios.

- Se creó la tabla `delivery_assignments` para relacionar pedidos con domiciliarios.

- Las asignaciones registran:
  - pedido;
  - domiciliario;
  - usuario que realizó la asignación;
  - fecha de asignación;
  - fecha de recogida;
  - fecha de finalización;
  - estado activo.

- Se agregó una restricción para impedir que un pedido tenga más de una asignación activa simultáneamente.

- Se implementó RLS sobre `delivery_assignments`.

- El administrador puede consultar las asignaciones correspondientes a pedidos de sus comercios.

- Cada domiciliario puede consultar únicamente sus propias asignaciones.

- Se creó `public.assign_delivery_driver()`.

- La función permite al administrador asignar o reasignar un pedido a un domiciliario activo del mismo comercio.

- La asignación solamente puede realizarse cuando:
  - el pedido es a domicilio;
  - el pedido se encuentra en estado `ready`;
  - el usuario pertenece al comercio;
  - el domiciliario pertenece al mismo comercio y está activo.

- Se integró la asignación de domiciliarios con el panel administrativo.

- Los pedidos a domicilio en estado `ready` muestran un selector de domiciliarios disponibles.

- Se verificó correctamente la primera asignación real de un pedido a `Domiciliario Demo`.

- Se creó `delivery.html` como panel independiente para domiciliarios.

- Se creó `js/delivery.js`.

- El domiciliario puede iniciar sesión utilizando su propia cuenta de Supabase Auth.

- Se valida que la cuenta autenticada corresponda realmente a un domiciliario activo.

- Se creó `public.get_my_delivery_orders()`.

- La función devuelve únicamente los pedidos activos asignados al domiciliario autenticado.

- El domiciliario no recibe acceso general a:
  - pedidos de otros domiciliarios;
  - productos;
  - reportes;
  - configuración del comercio;
  - funciones administrativas.

- Se creó `public.driver_pick_up_order()`.

- Un domiciliario puede recoger únicamente un pedido que esté asignado activamente a su usuario.

- La recogida cambia el pedido:

  `ready → out_for_delivery`

- Se registra automáticamente `picked_up_at`.

- El historial registra:
  - `actor_type = delivery_driver`;
  - `actor_user_id = auth.uid()`;
  - razón `Pedido recogido por domiciliario`.

- Se creó `public.driver_complete_delivery()` para pedidos pagados previamente por transferencia.

- Un pedido con transferencia pagada puede ser finalizado por el domiciliario mediante:

  `out_for_delivery → completed`

- Al completar la entrega:
  - se registra `completed_at`;
  - la asignación queda inactiva;
  - se conserva el historial de la asignación;
  - el evento identifica al domiciliario como responsable.

- Se verificó correctamente el flujo completo de entrega de un pedido pagado por transferencia desde el panel del domiciliario.

- Se creó `public.driver_complete_cash_delivery()`.

- La función permite confirmar en una única operación segura:
  - recepción del efectivo;
  - pago del pedido;
  - entrega al cliente.

- Para pedidos con `cash_on_delivery` se registra:
  - `payment_status = paid`;
  - `paid_at`;
  - `payment_verified_by = auth.uid()`;
  - `status = completed`;
  - `completed_at`;
  - asignación inactiva.

- El evento de entrega contraentrega registra:
  - `actor_type = delivery_driver`;
  - usuario autenticado del domiciliario;
  - razón `Efectivo recibido y pedido entregado por domiciliario`.

- Se verificó un flujo real completo de efectivo contraentrega:

  `pending → accepted → preparing → ready → asignado → out_for_delivery → completed`

- Se verificó que el pago fue registrado por el usuario del domiciliario.

- Se verificó que al finalizar una entrega el pedido desaparece automáticamente de las asignaciones activas del domiciliario.

- Se verificaron `picked_up_at`, `completed_at`, `paid_at`, `payment_verified_by` y el historial en `order_events`.

- Commerce Platform ya cuenta con separación funcional entre:
  - cliente;
  - administrador del comercio;
  - domiciliario.

- El flujo queda preparado para continuar con mejoras de interfaz móvil y futura automatización mediante WhatsApp.

## Versión 0.0.31

Fecha: 5 de septiembre de 2026

- Se reforzó el flujo exclusivo de los domiciliarios para pedidos a domicilio.

- Se eliminó del panel administrativo la acción `Salió a domicilio` para pedidos con:
  - `fulfillment_type = delivery`;
  - `status = ready`.

- El administrador continúa pudiendo preparar el pedido y asignar un domiciliario.

- La transición `ready → out_for_delivery` debe realizarse desde el panel del domiciliario mediante `public.driver_pick_up_order()`.

- Se actualizó `public.change_order_status()` para impedir que usuarios administrativos omitan el flujo del domiciliario.

- Para pedidos a domicilio se bloquearon mediante `change_order_status()`:
  - `ready → out_for_delivery`;
  - `ready → completed`;
  - `out_for_delivery → completed`.

- Los intentos de realizar estas transiciones administrativas devuelven:

  `DELIVERY_DRIVER_REQUIRED`

- Se verificó manualmente el bloqueo utilizando la cuenta administrativa.

- Se confirmó que después del intento bloqueado el pedido permaneció correctamente en estado `ready`.

- La consulta de pedidos del administrador ahora incluye las asignaciones de domicilio y el domiciliario relacionado.

- El panel administrativo muestra el nombre del domiciliario actualmente asignado a cada pedido.

- Cuando un pedido tiene una asignación activa se muestra:

  `Domiciliario asignado: [nombre]`

- La interfaz queda preparada para cambiar el domiciliario cuando existan otros domiciliarios disponibles.

- Cuando solo existe un domiciliario disponible se evita mostrar controles de reasignación innecesarios.

- Se mantiene el historial de asignaciones anteriores mediante `delivery_assignments`.

- El flujo de domicilio queda definido como:

  `ready → asignación → recogida por domiciliario → out_for_delivery → entrega/cobro → completed`

- Frontend y backend quedan alineados para impedir que el administrador salte el flujo operativo del domiciliario.

## Versión 0.0.32

Fecha: 5 de septiembre de 2026

- Se inició la integración real de Commerce Platform con WhatsApp Business Platform mediante Meta Cloud API.

- Se creó la aplicación de Meta:

  `Commerce Platform`

  asociada al portafolio comercial:

  `NOVA Digital Studio`

- Se configuró el caso de uso de contacto con clientes mediante WhatsApp.

- Se habilitó un número de prueba de WhatsApp Cloud API.

- Se verificó correctamente un número destinatario de prueba.

- Se realizó y recibió correctamente el primer mensaje enviado directamente desde las herramientas de Meta.

- Se creó y desplegó la Supabase Edge Function:

  `whatsapp-send-test`

- La Edge Function requiere un usuario autenticado mediante:

  `auth: "user"`

- Las credenciales de WhatsApp quedaron almacenadas como secretos de Supabase:

  - `WHATSAPP_ACCESS_TOKEN`
  - `WHATSAPP_PHONE_NUMBER_ID`

- Ningún token de Meta fue agregado al frontend ni al repositorio.

- Se verificó el primer envío real desde Commerce Platform mediante el flujo:

  `admin autenticado → Edge Function → Meta Cloud API → WhatsApp`

- Posteriormente se eliminó el envío manual de nombre, teléfono y datos del cliente desde el frontend.

- La Edge Function ahora recibe únicamente:

  `order_id`

- La función consulta el pedido directamente en Supabase respetando RLS y obtiene desde PostgreSQL:

  - nombre del cliente;
  - teléfono;
  - estado del pedido;
  - tipo de entrega.

- Se agregó normalización inicial para números celulares colombianos de 10 dígitos, agregando automáticamente el prefijo:

  `57`

- Por seguridad, el mensaje de confirmación solo puede enviarse cuando el pedido se encuentra en:

  `accepted`

- Se conectó el envío de WhatsApp al cambio real de estado:

  `pending → accepted`

- Una vez Supabase confirma la aceptación del pedido, `admin.js` invoca automáticamente la Edge Function enviando solamente el `order_id`.

- Se realizó una prueba real con el pedido:

  `Cliente WhatsApp Real`

- La prueba confirmó correctamente:

  `pending → accepted → Edge Function → PostgreSQL → Meta → WhatsApp`

- El nombre real del cliente fue obtenido desde la base de datos y recibido correctamente en WhatsApp.

- El número del pedido enviado se genera inicialmente usando los primeros caracteres del UUID:

  `CP-XXXXXXXX`

- Durante esta fase se utiliza temporalmente la plantilla de prueba de Meta:

  `jaspers_market_order_confirmation_v1`

  con idioma:

  `en_US`

- La Edge Function quedó también almacenada localmente para control de versiones en:

  `supabase/functions/whatsapp-send-test/index.ts`

- Se mantiene la regla de seguridad de no almacenar secretos reales en archivos versionados ni en GitHub.

## Versión 0.0.33

Fecha: 5 de septiembre de 2026

- Se creó la infraestructura para recibir eventos reales de WhatsApp mediante una Supabase Edge Function:

  `whatsapp-webhook`

- Se configuró la verificación del webhook de Meta mediante URL pública y token de verificación.

- Se deshabilitó la verificación JWT de Supabase para permitir que Meta invoque directamente el webhook.

- Se implementó validación criptográfica de los eventos recibidos desde Meta.

- Los eventos válidos son registrados como:

  `Evento WhatsApp firmado y válido`

- Se creó la tabla `store_whatsapp_settings`.

- Cada comercio puede asociarse de manera independiente con:

  - `phone_number_id`;
  - `whatsapp_business_account_id`;
  - número visible de WhatsApp;
  - estado activo de la integración.

- Se configuró aislamiento de la configuración de WhatsApp por comercio.

- Se otorgó al backend seguro acceso de lectura a `store_whatsapp_settings` mediante `service_role`.

- El webhook identifica automáticamente a qué comercio pertenece un mensaje utilizando el `phone_number_id` recibido desde Meta.

- Se verificó correctamente la identificación de `Mercado Demo` desde un evento real de WhatsApp.

- Se creó y publicó una Política de Privacidad pública para Commerce Platform en GitHub Pages.

- La URL pública de la política fue configurada en Meta Developers.

- Se completaron los requisitos obligatorios para publicar la aplicación de Meta.

- La aplicación `Commerce Platform` fue publicada correctamente y quedó disponible para uso público.

- Se comprobó mediante Graph API la suscripción de aplicaciones a la cuenta de WhatsApp Business.

- Se detectó que inicialmente `Commerce Platform` no estaba suscrita a la cuenta de WhatsApp Business utilizada para las pruebas.

- Se suscribió correctamente `Commerce Platform` mediante:

  `/{whatsapp_business_account_id}/subscribed_apps`

- Se verificó posteriormente que `Commerce Platform` aparece entre las aplicaciones suscritas.

- Se realizó la primera recepción real desde un WhatsApp externo hacia Commerce Platform.

- Se verificó el flujo real:

  `WhatsApp → Meta → webhook → validación de firma → identificación del comercio`

- El webhook recibió correctamente:

  - `phone_number_id`;
  - `whatsapp_business_account_id`;
  - teléfono del remitente;
  - nombre del remitente;
  - tipo de mensaje;
  - texto del mensaje;
  - identificador único del mensaje de WhatsApp.

- Se confirmó que un mensaje real enviado desde WhatsApp fue asociado automáticamente con `Mercado Demo`.

- Los secretos utilizados para validar Meta y acceder a Supabase permanecen almacenados únicamente como secretos del backend y no fueron incluidos en el repositorio.


## Versión 0.0.34

Fecha: 5 de septiembre de 2026

- Se creó la tabla `whatsapp_conversations`.

- Cada conversación se relaciona con:

  - un comercio;
  - teléfono del cliente;
  - nombre del cliente;
  - fecha del último mensaje;
  - estado activo.

- Se agregó una restricción única por:

  `store_id + customer_phone`

- Un mismo cliente conserva una única conversación dentro del mismo comercio.

- Se creó la tabla `whatsapp_messages`.

- Cada mensaje puede almacenar:

  - comercio;
  - conversación;
  - pedido relacionado opcional;
  - identificador del mensaje de WhatsApp;
  - dirección del mensaje;
  - tipo de mensaje;
  - texto;
  - teléfono del remitente;
  - teléfono destinatario;
  - estado;
  - payload original recibido desde Meta.

- Se definieron las direcciones:

  - `incoming`;
  - `outgoing`.

- Se habilitó RLS para `whatsapp_conversations` y `whatsapp_messages`.

- Los usuarios autenticados del comercio pueden consultar únicamente las conversaciones y mensajes pertenecientes a sus propios comercios.

- El backend seguro utiliza `service_role` para crear y actualizar conversaciones y mensajes recibidos desde Meta.

- El webhook crea automáticamente una conversación cuando recibe el primer mensaje de un cliente.

- Si el mismo cliente vuelve a escribir al mismo comercio, se reutiliza automáticamente la conversación existente.

- Se verificó mediante una prueba real la creación de una conversación para un cliente de `Mercado Demo`.

- Se agregó persistencia automática de cada mensaje entrante en `whatsapp_messages`.

- Los mensajes recibidos quedan almacenados con:

  `direction = incoming`

  `message_type = text`

  `message_status = received`

- Se agregó protección contra mensajes duplicados utilizando el identificador único:

  `whatsapp_message_id`

- El webhook utiliza `upsert` para soportar posibles reintentos de Meta sin generar registros duplicados.

- Se verificó que no existen `whatsapp_message_id` duplicados en la base de datos.

- Se enviaron dos mensajes reales consecutivos desde el mismo cliente.

- Ambos mensajes fueron almacenados como registros independientes.

- Ambos quedaron relacionados con el mismo `conversation_id`.

- Se verificó correctamente el flujo:

  `cliente → WhatsApp → Meta → webhook → comercio → conversación → mensaje persistente`

- Commerce Platform ya puede recibir, identificar por comercio, agrupar por conversación y almacenar mensajes reales de WhatsApp.

- La estructura queda preparada para el siguiente paso:

  `respuesta automática desde Commerce Platform → WhatsApp`

  ### Version 0.0.35 — Respuestas automáticas de WhatsApp y mensajes salientes

- Se completó el PASO 3.18 de automatización bidireccional por WhatsApp.
- `whatsapp-webhook` ahora puede responder automáticamente a mensajes de texto entrantes.
- Se reutiliza la integración existente con Meta WhatsApp Cloud API.
- El envío utiliza el `phone_number_id` correspondiente al comercio identificado.
- El token de acceso se mantiene exclusivamente como secreto backend mediante `WHATSAPP_ACCESS_TOKEN`.
- Se detectó y corrigió un token anterior inválido que producía `OAuthException` código 190.
- Se creó el usuario del sistema de Meta `commerce_platform_backend`.
- Se asignaron únicamente los activos necesarios:
  - app `Commerce Platform`;
  - `Test WhatsApp Business Account`.
- Se otorgó al usuario del sistema permiso para enviar y responder mensajes.
- Se generó un token de usuario del sistema sin caducidad para evitar dependencia de tokens temporales.
- Se verificó un envío automático real desde Commerce Platform hacia WhatsApp.
- Las respuestas enviadas se almacenan en `whatsapp_messages` con:
  - `direction = outgoing`;
  - `message_type = text`;
  - texto enviado;
  - número remitente;
  - número destinatario;
  - `message_status = accepted`;
  - `whatsapp_message_id` real devuelto por Meta.
- Se verificó en PostgreSQL el flujo completo con una prueba real:
  - mensaje entrante `Prueba outgoing 1`;
  - mensaje almacenado como `incoming`;
  - respuesta automática recibida en WhatsApp;
  - respuesta almacenada como `outgoing`.
- Flujo funcional actual:

  `cliente → WhatsApp → Meta → webhook → identificar comercio/cliente → guardar incoming → responder → Meta → cliente → guardar outgoing`

### Version 0.0.36 — Menú útil de WhatsApp, consulta de pedidos y atención humana

- Se completó el PASO 3.19 del flujo conversacional básico por WhatsApp.
- La respuesta automática fija fue reemplazada por un menú inicial:

  1. Ver productos
  2. Consultar mi pedido
  3. Hablar con la tienda

- Se verificó el menú con mensajes reales enviados desde WhatsApp.

- La opción `1` permite al cliente acceder al catálogo público de Commerce Platform.
- Se verificó que el enlace abre correctamente el catálogo de Mercado Demo y carga productos reales desde Supabase.

- La opción `2` permite consultar el estado de un pedido real.
- El cliente puede enviar un código con formato:

  `CP-XXXXXXXX`

- El código público del pedido continúa utilizando la misma lógica existente:

  `CP-` + primeros 8 caracteres del UUID del pedido en mayúsculas.

- La consulta del pedido valida:
  - que pertenezca al comercio que recibió el WhatsApp;
  - que el número telefónico del pedido corresponda al cliente que está escribiendo.

- Se agregó traducción de estados internos a mensajes legibles para el cliente.
- Se probó con el pedido real:

  `CP-488B5BE0`

- Commerce Platform respondió correctamente:

  `Estado: Aceptado ✅`

- Durante la implementación se detectó que `service_role` no tenía permiso de lectura sobre `public.orders`.
- Se aplicó:

  `grant select on public.orders to service_role;`

- El permiso quedó documentado en:

  `sql/060_orders_service_role_select.sql`

- Se creó:

  `sql/059_whatsapp_human_handoff.sql`

- `whatsapp_conversations` ahora incluye:
  - `human_handoff_requested`;
  - `human_handoff_requested_at`;
  - `human_handoff_resolved_at`.

- La opción `3` activa una solicitud real de atención humana.
- Cuando el cliente solicita hablar con la tienda:
  - la conversación queda marcada con `human_handoff_requested = true`;
  - se registra la fecha de solicitud;
  - el cliente recibe una única confirmación;
  - los mensajes siguientes continúan almacenándose como `incoming`;
  - el bot deja de responder automáticamente.

- Se verificó en PostgreSQL que el mensaje:

  `Necesito ayuda con mi pedido`

  quedó guardado con:

  `direction = incoming`

  y:

  `message_status = received`

  sin generar posteriormente un mensaje `outgoing`.

- Durante la prueba del handoff se detectó y corrigió un error de alcance de la variable:

  `ReferenceError: automaticReply is not defined`

- `automaticReply` ahora se calcula antes de evaluar si corresponde realizar el envío a Meta.

- Flujo conversacional funcional actual:

  `cliente → WhatsApp → menú → catálogo / consulta de pedido / atención humana`

- Flujo de atención humana validado:

  `cliente solicita atención → conversación marcada → confirmación → mensajes continúan guardándose → bot permanece en silencio`