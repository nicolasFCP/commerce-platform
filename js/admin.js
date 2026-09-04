import { supabase } from './supabase.js';


// ======================================================
// ELEMENTOS DEL LOGIN
// ======================================================

const formulario = document.querySelector('#login-form');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const boton = document.querySelector('#login-button');
const mensaje = document.querySelector('#mensaje');


// ======================================================
// ELEMENTOS DEL PANEL DE PEDIDOS
// ======================================================

const pedidosPanel = document.querySelector('#pedidos-panel');
const estadoPedidos = document.querySelector('#estado-pedidos');
const listaPedidos = document.querySelector('#lista-pedidos');


// ======================================================
// ELEMENTOS DEL PANEL DE PRODUCTOS
// ======================================================

const productosResumen = document.querySelector(
    '#productos-resumen'
);

const listaProductos = document.querySelector(
    '#lista-productos'
);

// ======================================================
// ELEMENTOS DEL DASHBOARD
// ======================================================

const dashboardPedidos = document.querySelector(
    '#dashboard-pedidos'
);

const dashboardPendientes = document.querySelector(
    '#dashboard-pendientes'
);

const dashboardCompletados = document.querySelector(
    '#dashboard-completados'
);

const dashboardVentas = document.querySelector(
    '#dashboard-ventas'
);

const dashboardProductos = document.querySelector(
    '#dashboard-productos'
);

// ======================================================
// ELEMENTOS DE REPORTES
// ======================================================

const reportePedidosHoy = document.querySelector(
    '#reporte-pedidos-hoy'
);

const reporteVentasHoy = document.querySelector(
    '#reporte-ventas-hoy'
);

const reporteVentasSemana = document.querySelector(
    '#reporte-ventas-semana'
);

const reporteTicketPromedio = document.querySelector(
    '#reporte-ticket-promedio'
);

// ======================================================
// ELEMENTOS DEL ANÁLISIS DE PRODUCTOS
// ======================================================

const analisisProductoTop = document.querySelector(
    '#analisis-producto-top'
);

const analisisUnidadesTop = document.querySelector(
    '#analisis-unidades-top'
);

const analisisIngresosTop = document.querySelector(
    '#analisis-ingresos-top'
);

// ======================================================
// ELEMENTOS DEL FORMULARIO DE PRODUCTOS
// ======================================================

const productoForm = document.querySelector(
    '#producto-form'
);

const productoNombre = document.querySelector(
    '#producto-nombre'
);

const productoCategoria = document.querySelector(
    '#producto-categoria'
);

const productoPrecio = document.querySelector(
    '#producto-precio'
);

const productoDescripcion = document.querySelector(
    '#producto-descripcion'
);

const crearProductoButton = document.querySelector(
    '#crear-producto-button'
);

const productoMensaje = document.querySelector(
    '#producto-mensaje'
);
// ======================================================
// LOGIN
// ======================================================

formulario.addEventListener(
    'submit',
    iniciarSesion
);

productoForm.addEventListener(
    'submit',
    crearProducto
);


async function iniciarSesion(event) {

    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;


    boton.disabled = true;
    boton.textContent = 'Ingresando...';

    mensaje.textContent = '';


    const {
        data,
        error
    } = await supabase.auth.signInWithPassword({
        email,
        password
    });


    if (error) {

        console.error(error);

        mensaje.textContent =
            'Correo o contraseña incorrectos.';

        boton.disabled = false;
        boton.textContent = 'Iniciar sesión';

        return;
    }


    mensaje.innerHTML = `
        <strong>
            Sesión iniciada correctamente ✅
        </strong>

        <br>

        ${data.user.email}
    `;


    boton.textContent = 'Sesión iniciada';

    pedidosPanel.style.display = 'block';


    await cargarPedidos();

    await cargarProductos();

    await cargarCategorias();

    await cargarDashboard();

    await cargarReportes();

    await cargarAnalisisProductos();
}

// ======================================================
// CARGAR DASHBOARD
// ======================================================

async function cargarDashboard() {

    dashboardPedidos.textContent = '...';
    dashboardPendientes.textContent = '...';
    dashboardCompletados.textContent = '...';
    dashboardVentas.textContent = '...';
    dashboardProductos.textContent = '...';


    const {
        data: pedidos,
        error: pedidosError
    } = await supabase
        .from('orders')
        .select(`
            status,
            total
        `);


    if (pedidosError) {

        console.error(
            'Error cargando dashboard de pedidos:',
            pedidosError
        );

        return;
    }


    const {
        data: productos,
        error: productosError
    } = await supabase
        .from('products')
        .select(`
            id
        `);


    if (productosError) {

        console.error(
            'Error cargando dashboard de productos:',
            productosError
        );

        return;
    }


    const totalPedidos =
        pedidos.length;


    const pedidosPendientes =
        pedidos.filter(
            pedido =>
                pedido.status === 'pending'
        );


    const pedidosCompletados =
        pedidos.filter(
            pedido =>
                pedido.status === 'completed'
        );


    const ventasCompletadas =
        pedidosCompletados.reduce(
            (total, pedido) =>
                total + Number(pedido.total),
            0
        );


    dashboardPedidos.textContent =
        totalPedidos;


    dashboardPendientes.textContent =
        pedidosPendientes.length;


    dashboardCompletados.textContent =
        pedidosCompletados.length;


    dashboardVentas.textContent =
        formatearPrecio(
            ventasCompletadas
        );


    dashboardProductos.textContent =
        productos.length;
}

// ======================================================
// CARGAR REPORTES
// ======================================================

async function cargarReportes() {

    reportePedidosHoy.textContent = '...';
    reporteVentasHoy.textContent = '...';
    reporteVentasSemana.textContent = '...';
    reporteTicketPromedio.textContent = '...';


    const {
        data: pedidos,
        error
    } = await supabase
        .from('orders')
        .select(`
            created_at,
            status,
            total
        `);


    if (error) {

        console.error(
            'Error cargando reportes:',
            error
        );

        return;
    }


    // ==================================================
    // FECHAS
    // ==================================================

    const ahora =
        new Date();


    const inicioHoy =
        new Date(
            ahora.getFullYear(),
            ahora.getMonth(),
            ahora.getDate()
        );


    const haceSieteDias =
        new Date(ahora);

    haceSieteDias.setDate(
        haceSieteDias.getDate() - 7
    );


    // ==================================================
    // PEDIDOS DE HOY
    // ==================================================

    const pedidosHoy =
        pedidos.filter(
            pedido => {

                const fechaPedido =
                    new Date(
                        pedido.created_at
                    );


                return (
                    fechaPedido >= inicioHoy
                );
            }
        );


    // ==================================================
    // PEDIDOS COMPLETADOS
    // ==================================================

    const pedidosCompletados =
        pedidos.filter(
            pedido =>
                pedido.status === 'completed'
        );


    // ==================================================
    // VENTAS DE HOY
    // ==================================================

    const ventasHoy =
        pedidosHoy
            .filter(
                pedido =>
                    pedido.status === 'completed'
            )
            .reduce(
                (total, pedido) =>
                    total +
                    Number(pedido.total),
                0
            );


    // ==================================================
    // VENTAS ÚLTIMOS 7 DÍAS
    // ==================================================

    const ventasSemana =
        pedidosCompletados
            .filter(
                pedido => {

                    const fechaPedido =
                        new Date(
                            pedido.created_at
                        );


                    return (
                        fechaPedido >= haceSieteDias
                    );
                }
            )
            .reduce(
                (total, pedido) =>
                    total +
                    Number(pedido.total),
                0
            );


    // ==================================================
    // TICKET PROMEDIO
    // ==================================================

    const totalVentasCompletadas =
        pedidosCompletados.reduce(
            (total, pedido) =>
                total +
                Number(pedido.total),
            0
        );


    const ticketPromedio =
        pedidosCompletados.length > 0

            ? (
                totalVentasCompletadas
                /
                pedidosCompletados.length
            )

            : 0;


    // ==================================================
    // MOSTRAR RESULTADOS
    // ==================================================

    reportePedidosHoy.textContent =
        pedidosHoy.length;


    reporteVentasHoy.textContent =
        formatearPrecio(
            ventasHoy
        );


    reporteVentasSemana.textContent =
        formatearPrecio(
            ventasSemana
        );


    reporteTicketPromedio.textContent =
        formatearPrecio(
            ticketPromedio
        );
}

// ======================================================
// CARGAR ANÁLISIS DE PRODUCTOS
// ======================================================

async function cargarAnalisisProductos() {

    analisisProductoTop.textContent = '...';
    analisisUnidadesTop.textContent = '...';
    analisisIngresosTop.textContent = '...';


    // ==================================================
    // BUSCAR PEDIDOS COMPLETADOS
    // ==================================================

    const {
        data: pedidosCompletados,
        error: pedidosError
    } = await supabase
        .from('orders')
        .select(`
            id
        `)
        .eq(
            'status',
            'completed'
        );


    if (pedidosError) {

        console.error(
            'Error cargando pedidos completados:',
            pedidosError
        );

        return;
    }


    if (
        !pedidosCompletados
        ||
        pedidosCompletados.length === 0
    ) {

        analisisProductoTop.textContent =
            'Sin ventas';

        analisisUnidadesTop.textContent =
            '0';

        analisisIngresosTop.textContent =
            formatearPrecio(0);

        return;
    }


    const pedidosIds =
        pedidosCompletados.map(
            pedido => pedido.id
        );


    // ==================================================
    // BUSCAR PRODUCTOS DE ESOS PEDIDOS
    // ==================================================

    const {
        data: items,
        error: itemsError
    } = await supabase
        .from('order_items')
        .select(`
            product_name,
            quantity,
            line_total
        `)
        .in(
            'order_id',
            pedidosIds
        );


    if (itemsError) {

        console.error(
            'Error cargando productos vendidos:',
            itemsError
        );

        return;
    }


    if (
        !items
        ||
        items.length === 0
    ) {

        analisisProductoTop.textContent =
            'Sin ventas';

        analisisUnidadesTop.textContent =
            '0';

        analisisIngresosTop.textContent =
            formatearPrecio(0);

        return;
    }


    // ==================================================
    // AGRUPAR VENTAS POR PRODUCTO
    // ==================================================

    const productosVendidos = {};


    items.forEach(
        item => {

            const nombre =
                item.product_name;


            if (!productosVendidos[nombre]) {

                productosVendidos[nombre] = {
                    unidades: 0,
                    ingresos: 0
                };
            }


            productosVendidos[nombre].unidades +=
                Number(item.quantity);


            productosVendidos[nombre].ingresos +=
                Number(item.line_total);
        }
    );


    // ==================================================
    // ENCONTRAR EL PRODUCTO MÁS VENDIDO
    // ==================================================

    let nombreTop = null;
    let unidadesTop = 0;
    let ingresosTop = 0;


    Object.entries(
        productosVendidos
    ).forEach(
        ([nombre, datos]) => {

            if (
                datos.unidades > unidadesTop
            ) {

                nombreTop = nombre;

                unidadesTop =
                    datos.unidades;

                ingresosTop =
                    datos.ingresos;
            }
        }
    );


    // ==================================================
    // MOSTRAR RESULTADOS
    // ==================================================

    analisisProductoTop.textContent =
        nombreTop;


    analisisUnidadesTop.textContent =
        unidadesTop;


    analisisIngresosTop.textContent =
        formatearPrecio(
            ingresosTop
        );
}

// ======================================================
// BOTÓN SEGÚN EL ESTADO DEL PEDIDO
// ======================================================

function crearBotonAccion(pedido) {

    if (
    pedido.status === 'pending'
    &&
    pedido.review_status ===
        'changes_pending_customer'
) {

    return `
        <div class="esperando-aprobacion">
            ⏳ Esperando aprobación del cliente
        </div>

        <button
            class="confirmar-cambios-cliente"
            data-order-id="${pedido.id}"
        >
            Registrar aprobación del cliente
        </button>
    `;
}
    let siguienteEstado = null;
    let texto = null;


    if (pedido.status === 'pending') {

        siguienteEstado = 'accepted';
        texto = 'Aceptar pedido';

    }


    else if (pedido.status === 'accepted') {

        siguienteEstado = 'preparing';
        texto = 'Empezar preparación';

    }


    else if (pedido.status === 'preparing') {

        siguienteEstado = 'ready';
        texto = 'Marcar como listo';

    }


    else if (pedido.status === 'ready') {

        if (
            pedido.fulfillment_type === 'delivery'
        ) {

            siguienteEstado =
                'out_for_delivery';

            texto =
                'Salió a domicilio';

        }

        else {

            siguienteEstado =
                'completed';

            texto =
                'Completar pedido';
        }
    }


    else if (
        pedido.status === 'out_for_delivery'
    ) {

        siguienteEstado = 'completed';

        texto = 'Marcar como entregado';
    }


    if (!siguienteEstado) {

        return '';
    }


    return `
        <button
            class="cambiar-estado-pedido"
            data-order-id="${pedido.id}"
            data-next-status="${siguienteEstado}"
        >
            ${texto}
        </button>
    `;
}

// ======================================================
// MENSAJE AUTOMÁTICO DE WHATSAPP
// ======================================================

function crearMensajeWhatsApp(pedido) {

    let mensajeEstado = 'Tenemos información sobre tu pedido.';


    if (pedido.status === 'pending') {

        mensajeEstado =
            'Hemos recibido tu pedido y pronto será revisado.';

    }


    else if (pedido.status === 'accepted') {

        mensajeEstado =
            'Tu pedido fue aceptado.';

    }


    else if (pedido.status === 'preparing') {

        mensajeEstado =
            'Estamos preparando tu pedido.';

    }


    else if (pedido.status === 'ready') {

        mensajeEstado =
            'Tu pedido ya está listo.';

    }


    else if (
        pedido.status === 'out_for_delivery'
    ) {

        mensajeEstado =
            'Tu pedido ya salió a domicilio.';

    }


    else if (pedido.status === 'completed') {

        mensajeEstado =
            'Tu pedido fue entregado. Gracias por tu compra.';

    }


    return `
Hola ${pedido.customer_name}.

${mensajeEstado}

Total: ${formatearPrecio(pedido.total)}
    `.trim();
}


// ======================================================
// BOTÓN DE WHATSAPP
// ======================================================

function crearBotonWhatsApp(pedido) {

    return `
        <button
            class="contactar-whatsapp"
            data-phone="${pedido.customer_phone}"
            data-order-id="${pedido.id}"
            style="margin-top: 10px;"
        >
            Contactar por WhatsApp
        </button>
    `;
}

// ======================================================
// CARGAR PEDIDOS
// ======================================================

async function cargarPedidos() {

    estadoPedidos.textContent =
        'Cargando pedidos...';

    listaPedidos.innerHTML = '';


    const {
        data: pedidos,
        error
    } = await supabase
        .from('orders')
        .select(`
    id,
    created_at,
    customer_name,
    customer_phone,
    fulfillment_type,
    delivery_address,
    notes,
    status,
    subtotal,
    delivery_fee,
    total,
    payment_method,
payment_status,
review_status,

    order_items (
    id,
    product_name,
    quantity,
    unit_price,
    line_total,
    item_status,
    change_reason,
    changed_at,
    replacement_for_item_id
)
`)
        .order(
            'created_at',
            {
                ascending: false
            }
        );


    if (error) {

        console.error(error);

        estadoPedidos.textContent =
            'No se pudieron cargar los pedidos.';

        return;
    }

    window.pedidosActuales =
    pedidos;

    if (
        !pedidos ||
        pedidos.length === 0
    ) {

        estadoPedidos.textContent =
            'Todavía no hay pedidos.';

        return;
    }


    estadoPedidos.textContent =
        `${pedidos.length} pedido(s)`;


    listaPedidos.innerHTML =
        pedidos.map(
            pedido => `

                <article class="pedido">

                    <h3>
                        ${pedido.customer_name}
                    </h3>

                    <p>
                        📞 ${pedido.customer_phone}
                    </p>

                    <p>
                        📍 ${
                            pedido.delivery_address
                            ??
                            'Recogida en tienda'
                        }
                    </p>

                    ${
                        pedido.notes
                            ? `
                                <p>
                                    📝 ${pedido.notes}
                                </p>
                            `
                            : ''
                    }

<div class="pedido-productos">

    <strong>
        Productos del pedido
    </strong>

    ${
        pedido.order_items &&
        pedido.order_items.length > 0

            ? pedido.order_items.map(item => `

    <div class="pedido-producto-item">

        <div>

            <span>
                ${item.quantity}
                ×
                ${item.product_name}
            </span>

            ${
                item.item_status === 'removed'
                    ? `
                        <div class="producto-quitado">
                            Quitado del pedido
                            ${
                                item.change_reason
                                    ? `— ${item.change_reason}`
                                    : ''
                            }
                        </div>
                    `
                    : ''
            }

        </div>


        <div class="pedido-producto-acciones">

            <span>
                ${formatearPrecio(
                    item.line_total
                )}
            </span>


            ${
                item.item_status === 'active'

                && ['pending', 'accepted']
                    .includes(pedido.status)

                && [
                    'pending_review',
                    'changes_pending_customer'
                ].includes(
                    pedido.review_status
                )

                && pedido.order_items.filter(
                    otroItem =>
                        otroItem.item_status === 'active'
                ).length > 1

                    ? `
                        <button
                            class="quitar-producto-pedido"
                            data-order-item-id="${item.id}"
                        >
                            Quitar por no disponible
                        </button>
                    `

                    : ''
            }

        </div>

    </div>

`).join('')

            : `
                <p>
                    Sin productos registrados.
                </p>
            `
    }

</div>

<div class="pedido-pago">

    <p>
        💳 Método de pago:
        <strong>
            ${
                pedido.payment_method === 'transfer'
                    ? 'Transferencia'
                    : pedido.payment_method === 'cash_on_delivery'
                        ? 'Efectivo contraentrega'
                        : 'No especificado'
            }
        </strong>
    </p>

    <p>
        💰 Estado del pago:
        <strong>
            ${
                pedido.payment_status === 'paid'
                    ? 'Pagado'
                    : pedido.payment_status === 'proof_received'
                        ? 'Comprobante recibido'
                        : pedido.payment_status === 'rejected'
                            ? 'Rechazado'
                            : 'Pendiente'
            }
        </strong>
    </p>

</div>

                    <span class="estado-pedido">
                        ${pedido.status}
                    </span>

                    <div class="pedido-total">

                        Total:

                        ${formatearPrecio(
                            pedido.total
                        )}

                    </div>

                    ${crearBotonAccion(pedido)}

                    ${crearBotonWhatsApp(pedido)}

                </article>

            `
        ).join('');
}


// ======================================================
// CAMBIAR ESTADO DE PEDIDO
// ======================================================

listaPedidos.addEventListener(
    'click',
    async event => {

        const botonPedido = event.target.closest(
            '.cambiar-estado-pedido'
        );


        if (!botonPedido) {

            return;
        }


        const orderId =
            botonPedido.dataset.orderId;

        const nextStatus =
            botonPedido.dataset.nextStatus;

        const textoOriginal =
            botonPedido.textContent;


        botonPedido.disabled = true;

        botonPedido.textContent =
            'Actualizando...';


        const {
            error
        } = await supabase.rpc(
            'change_order_status',
            {
                p_order_id: orderId,
                p_new_status: nextStatus,
                p_reason: null
            }
        );


        if (error) {

    console.error(error);


    if (
        error.message &&
        error.message.includes(
            'PAYMENT_REQUIRED_BEFORE_PREPARING'
        )
    ) {

        alert(
            'Debes confirmar el pago antes de empezar a preparar este pedido.'
        );

    } else {

        alert(
            'No se pudo actualizar el pedido.'
        );

    }


    boton.disabled = false;
    boton.textContent = textoOriginal;

    return;
}


        await cargarPedidos();
    }
);

listaPedidos.addEventListener(
    'click',
    async event => {

        const boton =
            event.target.closest(
                '.quitar-producto-pedido'
            );


        if (!boton) {
            return;
        }


        const orderItemId =
            boton.dataset.orderItemId;


        const confirmar = window.confirm(
            '¿Seguro que este producto no está disponible y deseas quitarlo del pedido?'
        );


        if (!confirmar) {
            return;
        }


        const textoOriginal =
            boton.textContent;


        boton.disabled = true;

        boton.textContent =
            'Quitando...';


        const {
            error
        } = await supabase.rpc(
            'remove_order_item',
            {
                p_order_item_id:
                    orderItemId,

                p_reason:
                    'Producto no disponible'
            }
        );


        if (error) {

            console.error(error);


            if (
                error.message &&
                error.message.includes(
                    'CANNOT_REMOVE_LAST_ACTIVE_ITEM'
                )
            ) {

                alert(
                    'No puedes quitar el último producto. Si no hay ningún producto disponible, deberá cancelarse el pedido.'
                );

            } else {

                alert(
                    'No se pudo quitar el producto del pedido.'
                );

            }


            boton.disabled = false;

            boton.textContent =
                textoOriginal;

            return;
        }


        await cargarPedidos();

    }
);

// ======================================================
// CONTACTAR CLIENTE POR WHATSAPP
// ======================================================

listaPedidos.addEventListener(
    'click',
    event => {

        const botonWhatsApp =
            event.target.closest(
                '.contactar-whatsapp'
            );


        if (!botonWhatsApp) {

            return;
        }


        const orderId =
            botonWhatsApp.dataset.orderId;


        const pedido =
            window.pedidosActuales?.find(
                pedido =>
                    pedido.id === orderId
            );


        if (!pedido) {

            alert(
                'No se encontró la información del pedido.'
            );

            return;
        }


        let telefono =
            pedido.customer_phone
                .replace(/\D/g, '');


        if (
            telefono.length === 10
            &&
            telefono.startsWith('3')
        ) {

            telefono =
                `57${telefono}`;
        }


        const mensaje =
            crearMensajeWhatsApp(
                pedido
            );


        const url =
            `https://wa.me/${telefono}?text=${
                encodeURIComponent(mensaje)
            }`;


        window.open(
            url,
            '_blank'
        );
    }
);

// ======================================================
// CARGAR CATEGORÍAS
// ======================================================

async function cargarCategorias() {

    if (!productoCategoria) {

        return;
    }


    productoCategoria.innerHTML = `
        <option value="">
            Selecciona una categoría
        </option>
    `;


    const {
        data: categorias,
        error
    } = await supabase
        .from('categories')
        .select(`
            id,
            name
        `)
        .eq(
            'active',
            true
        )
        .order(
            'name',
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            'Error cargando categorías:',
            error
        );

        return;
    }


    categorias.forEach(
        categoria => {

            const opcion =
                document.createElement('option');


            opcion.value =
                categoria.id;


            opcion.textContent =
                categoria.name;


            productoCategoria.appendChild(
                opcion
            );
        }
    );
}

// ======================================================
// CREAR PRODUCTO
// ======================================================

async function crearProducto(event) {

    event.preventDefault();


    const nombre =
        productoNombre.value.trim();

    const categoryId =
        productoCategoria.value;

    const precio =
        Number(productoPrecio.value);

    const descripcion =
        productoDescripcion.value.trim();


    productoMensaje.textContent = '';


    if (!nombre) {

        productoMensaje.textContent =
            'Escribe el nombre del producto.';

        return;
    }


    if (!categoryId) {

        productoMensaje.textContent =
            'Selecciona una categoría.';

        return;
    }


    if (
        !Number.isFinite(precio)
        ||
        precio < 0
    ) {

        productoMensaje.textContent =
            'Ingresa un precio válido.';

        return;
    }


    crearProductoButton.disabled = true;

    crearProductoButton.textContent =
        'Creando producto...';


    const {
        data,
        error
    } = await supabase.rpc(
        'create_product',
        {
            p_category_id: categoryId,
            p_name: nombre,
            p_price: precio,
            p_description:
                descripcion || null
        }
    );


    if (error) {

        console.error(
            'Error creando producto:',
            error
        );


        productoMensaje.textContent =
            'No se pudo crear el producto.';


        crearProductoButton.disabled = false;

        crearProductoButton.textContent =
            'Crear producto';

        return;
    }


    console.log(
        'Producto creado:',
        data
    );


    productoMensaje.textContent =
        'Producto creado correctamente ✅';


    productoForm.reset();


    await cargarProductos();


    crearProductoButton.disabled = false;

    crearProductoButton.textContent =
        'Crear producto';
}

// ======================================================
// CARGAR PRODUCTOS
// ======================================================

async function cargarProductos() {

    if (
        !productosResumen ||
        !listaProductos
    ) {

        return;
    }


    productosResumen.textContent =
        'Cargando productos...';

    listaProductos.innerHTML = '';


    const {
        data: productos,
        error
    } = await supabase
        .from('products')
        .select(`
            id,
            name,
            description,
            price,
            available,
            active
        `)
        .order(
            'name',
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            'Error cargando productos:',
            error
        );

        productosResumen.textContent =
            'No se pudieron cargar los productos.';

        return;
    }


    if (
        !productos ||
        productos.length === 0
    ) {

        productosResumen.textContent =
            '0 producto(s)';

        listaProductos.innerHTML = `
            <p>
                No hay productos registrados.
            </p>
        `;

        return;
    }


    productosResumen.textContent =
        `${productos.length} producto(s)`;


    productos.forEach(
        producto => {

            const tarjeta =
                document.createElement('article');


            tarjeta.className =
                'producto-admin';


            const textoDisponibilidad =
                producto.available
                    ? 'Marcar como agotado'
                    : 'Marcar como disponible';


            tarjeta.innerHTML = `

                <h3>
                    ${producto.name}
                </h3>


                <p>
                    Precio actual:
                    <strong>
                        ${formatearPrecio(
                            producto.price
                        )}
                    </strong>
                </p>


                <label
                    style="margin-top: 14px;"
                >
                    Nuevo precio

                    <input
                        class="precio-producto"
                        type="number"
                        min="0"
                        step="100"
                        value="${producto.price}"
                    >

                </label>


                <button
                    class="guardar-precio-producto"
                    data-product-id="${producto.id}"
                    style="margin-top: 12px;"
                >
                    Guardar nuevo precio
                </button>


                <p
                    style="margin-top: 18px;"
                >
                    Disponible:
                    ${
                        producto.available
                            ? 'Sí'
                            : 'No'
                    }
                </p>


                <p>
                    Activo:
                    ${
                        producto.active
                            ? 'Sí'
                            : 'No'
                    }
                </p>


                <button
                    class="cambiar-disponibilidad-producto"
                    data-product-id="${producto.id}"
                    data-current-available="${producto.available}"
                    style="margin-top: 14px;"
                >
                    ${textoDisponibilidad}
                </button>

            `;


            listaProductos.appendChild(
                tarjeta
            );
        }
    );
}


// ======================================================
// ACCIONES DE PRODUCTOS
// ======================================================

listaProductos.addEventListener(
    'click',
    async event => {


        // ==================================================
        // CAMBIAR PRECIO
        // ==================================================

        const botonPrecio =
            event.target.closest(
                '.guardar-precio-producto'
            );


        if (botonPrecio) {

            const tarjeta =
                botonPrecio.closest(
                    '.producto-admin'
                );


            const inputPrecio =
                tarjeta.querySelector(
                    '.precio-producto'
                );


            const nuevoPrecio =
                Number(inputPrecio.value);


            if (
                !Number.isFinite(nuevoPrecio)
                ||
                nuevoPrecio < 0
            ) {

                alert(
                    'Ingresa un precio válido.'
                );

                return;
            }


            const productId =
                botonPrecio.dataset.productId;


            botonPrecio.disabled = true;

            botonPrecio.textContent =
                'Guardando precio...';


            const {
                error
            } = await supabase.rpc(
                'set_product_price',
                {
                    p_product_id: productId,
                    p_price: nuevoPrecio
                }
            );


            if (error) {

                console.error(
                    'Error cambiando precio:',
                    error
                );


                alert(
                    'No se pudo cambiar el precio.'
                );


                botonPrecio.disabled = false;

                botonPrecio.textContent =
                    'Guardar nuevo precio';

                return;
            }


            await cargarProductos();

            return;
        }


        // ==================================================
        // CAMBIAR DISPONIBILIDAD
        // ==================================================

        const botonDisponibilidad =
            event.target.closest(
                '.cambiar-disponibilidad-producto'
            );


        if (!botonDisponibilidad) {

            return;
        }


        const productId =
            botonDisponibilidad.dataset.productId;


        const disponibilidadActual =
            botonDisponibilidad
                .dataset
                .currentAvailable === 'true';


        const nuevaDisponibilidad =
            !disponibilidadActual;


        botonDisponibilidad.disabled = true;

        botonDisponibilidad.textContent =
            'Actualizando...';


        const {
            error
        } = await supabase.rpc(
            'set_product_availability',
            {
                p_product_id: productId,
                p_available: nuevaDisponibilidad
            }
        );


        if (error) {

            console.error(
                'Error cambiando disponibilidad:',
                error
            );


            alert(
                'No se pudo cambiar la disponibilidad del producto.'
            );


            botonDisponibilidad.disabled = false;


            botonDisponibilidad.textContent =
                disponibilidadActual
                    ? 'Marcar como agotado'
                    : 'Marcar como disponible';


            return;
        }


        await cargarProductos();
    }
);

listaPedidos.addEventListener(
    'click',
    async event => {

        const boton =
            event.target.closest(
                '.confirmar-cambios-cliente'
            );


        if (!boton) {
            return;
        }


        const orderId =
            boton.dataset.orderId;


        const confirmar = window.confirm(
            '¿El cliente confirmó que acepta los cambios y el nuevo total del pedido?'
        );


        if (!confirmar) {
            return;
        }


        const textoOriginal =
            boton.textContent;


        boton.disabled = true;

        boton.textContent =
            'Registrando aprobación...';


        const {
            error
        } = await supabase.rpc(
            'confirm_order_changes',
            {
                p_order_id: orderId
            }
        );


        if (error) {

            console.error(error);

            alert(
                'No se pudo registrar la aprobación del cliente.'
            );

            boton.disabled = false;

            boton.textContent =
                textoOriginal;

            return;
        }


        alert(
            'Aprobación del cliente registrada correctamente.'
        );


        await cargarPedidos();

    }
);

// ======================================================
// FORMATEAR PRECIOS
// ======================================================

function formatearPrecio(value) {

    return new Intl.NumberFormat(
        'es-CO',
        {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }
    ).format(value);
}