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
// LOGIN
// ======================================================

formulario.addEventListener(
    'submit',
    iniciarSesion
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
}


// ======================================================
// BOTÓN SEGÚN EL ESTADO DEL PEDIDO
// ======================================================

function crearBotonAccion(pedido) {

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
            total
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

            alert(
                'No se pudo actualizar el pedido.'
            );

            botonPedido.disabled = false;

            botonPedido.textContent =
                textoOriginal;

            return;
        }


        await cargarPedidos();
    }
);


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