import { supabase } from './supabase.js';

const formulario = document.querySelector('#login-form');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const boton = document.querySelector('#login-button');
const mensaje = document.querySelector('#mensaje');
const pedidosPanel = document.querySelector('#pedidos-panel');
const estadoPedidos = document.querySelector('#estado-pedidos');
const listaPedidos = document.querySelector('#lista-pedidos');


formulario.addEventListener('submit', iniciarSesion);


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
        <strong>Sesión iniciada correctamente ✅</strong>
        <br>
        ${data.user.email}
    `;

    boton.textContent = 'Sesión iniciada';
    pedidosPanel.style.display = 'block';

await cargarPedidos();
}

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

        if (pedido.fulfillment_type === 'delivery') {

            siguienteEstado = 'out_for_delivery';
            texto = 'Salió a domicilio';

        } else {

            siguienteEstado = 'completed';
            texto = 'Completar pedido';

        }

    }


    else if (pedido.status === 'out_for_delivery') {

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

async function cargarPedidos() {

    estadoPedidos.textContent = 'Cargando pedidos...';

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
        .order('created_at', {
            ascending: false
        });


    if (error) {

        console.error(error);

        estadoPedidos.textContent =
            'No se pudieron cargar los pedidos.';

        return;
    }


    if (!pedidos || pedidos.length === 0) {

        estadoPedidos.textContent =
            'Todavía no hay pedidos.';

        return;
    }


    estadoPedidos.textContent =
        `${pedidos.length} pedido(s)`;


    listaPedidos.innerHTML = pedidos.map(pedido => `

        <article class="pedido">

            <h3>
                ${pedido.customer_name}
            </h3>

            <p>
                📞 ${pedido.customer_phone}
            </p>

            <p>
                📍 ${pedido.delivery_address ?? 'Recogida en tienda'}
            </p>

            ${
                pedido.notes
                    ? `<p>📝 ${pedido.notes}</p>`
                    : ''
            }

            <span class="estado-pedido">
    ${pedido.status}
</span>

<div class="pedido-total">
    Total:
    ${formatearPrecio(pedido.total)}
</div>

${crearBotonAccion(pedido)}

        </article>

    `).join('');
}
listaPedidos.addEventListener('click', async event => {

    const boton = event.target.closest(
        '.cambiar-estado-pedido'
    );


    if (!boton) {
        return;
    }


    const orderId = boton.dataset.orderId;

    const nextStatus = boton.dataset.nextStatus;


    const textoOriginal = boton.textContent;


    boton.disabled = true;
    boton.textContent = 'Actualizando...';


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

        alert('No se pudo actualizar el pedido.');

        boton.disabled = false;
        boton.textContent = textoOriginal;

        return;
    }


    await cargarPedidos();
});


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