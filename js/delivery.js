import {
    supabaseDelivery as supabase
} from './supabase.js';


// ======================================================
// ELEMENTOS DEL LOGIN
// ======================================================

const formulario =
    document.querySelector(
        '#delivery-login-form'
    );

const emailInput =
    document.querySelector(
        '#delivery-email'
    );

const passwordInput =
    document.querySelector(
        '#delivery-password'
    );

const loginButton =
    document.querySelector(
        '#delivery-login-button'
    );

const loginMessage =
    document.querySelector(
        '#delivery-login-message'
    );


// ======================================================
// ELEMENTOS DEL PANEL
// ======================================================

const deliveryPanel =
    document.querySelector(
        '#delivery-panel'
    );

const deliveryLogoutButton =
    document.querySelector(
        '#delivery-logout-button'
    );    

const driverName =
    document.querySelector(
        '#delivery-driver-name'
    );

const ordersStatus =
    document.querySelector(
        '#delivery-orders-status'
    );

const ordersList =
    document.querySelector(
        '#delivery-orders-list'
    );

let realtimeDeliveryIniciado = false;

let realtimeDeliveryTimer = null;

// ======================================================
// LOGIN
// ======================================================

formulario.addEventListener(
    'submit',
    iniciarSesion
);

deliveryLogoutButton.addEventListener(
    'click',
    cerrarSesionDomiciliario
);


// ======================================================
// CERRAR SESIÓN DEL DOMICILIARIO
// ======================================================

async function cerrarSesionDomiciliario() {

    deliveryLogoutButton.disabled = true;

    deliveryLogoutButton.textContent =
        'Cerrando sesión...';


    const {
        error
    } = await supabase.auth.signOut();


    if (error) {

        console.error(
            'Error cerrando sesión del domiciliario:',
            error
        );


        loginMessage.textContent =
            'No se pudo cerrar la sesión.';


        deliveryLogoutButton.disabled = false;

        deliveryLogoutButton.textContent =
            'Cerrar sesión';

        return;
    }


    deliveryPanel.style.display =
        'none';


    formulario.reset();


    driverName.textContent = '';

    ordersStatus.textContent = '';

    ordersList.innerHTML = '';


    loginMessage.textContent =
        'Sesión cerrada correctamente.';


    loginButton.disabled = false;

    loginButton.textContent =
        'Iniciar sesión';


    deliveryLogoutButton.disabled = false;

    deliveryLogoutButton.textContent =
        'Cerrar sesión';
}

async function iniciarSesion(event) {

    event.preventDefault();


    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    loginButton.disabled = true;

    loginButton.textContent =
        'Ingresando...';

    loginMessage.textContent = '';


    const {
        data,
        error
    } = await supabase.auth.signInWithPassword({
        email,
        password
    });


    if (error) {

        console.error(
            'Error iniciando sesión:',
            error
        );

        loginMessage.textContent =
            'Correo o contraseña incorrectos.';

        loginButton.disabled = false;

        loginButton.textContent =
            'Iniciar sesión';

        return;
    }


       await cargarPanelDomiciliario(
        data.user,
        true
    );
}

// ======================================================
// CARGAR PANEL DEL DOMICILIARIO AUTENTICADO
// ======================================================

async function cargarPanelDomiciliario(
    user,
    cerrarSesionSiNoEsDriver = false
) {

    const {
        data: driver,
        error: driverError
    } = await supabase
        .from('delivery_drivers')
        .select(`
            id,
            name,
            phone,
            active
        `)
        .eq(
            'user_id',
            user.id
        )
        .eq(
            'active',
            true
        )
        .maybeSingle();


    if (
        driverError
        ||
        !driver
    ) {

        console.error(
            'Usuario sin perfil de domiciliario:',
            driverError
        );


        if (cerrarSesionSiNoEsDriver) {

            await supabase.auth.signOut();

        }


        loginMessage.textContent =
            'Esta cuenta no tiene acceso al panel de domicilios.';


        loginButton.disabled = false;

        loginButton.textContent =
            'Iniciar sesión';

        return;
    }


    loginMessage.textContent =
        'Sesión iniciada correctamente ✅';


    emailInput.value =
        user.email ?? '';


    passwordInput.value =
        '';


    loginButton.disabled = true;

    loginButton.textContent =
        'Sesión iniciada';


    deliveryPanel.style.display =
        'block';


    driverName.textContent =
        `Domiciliario: ${driver.name}`;


    ordersStatus.textContent =
        'Cargando pedidos...';


    ordersList.innerHTML = '';


        await cargarPedidos();

    iniciarRealtimeDelivery();
}

// ======================================================
// RESTAURAR SESIÓN AL RECARGAR
// ======================================================

async function restaurarSesionDomiciliario() {

    const {
        data,
        error
    } = await supabase.auth.getSession();


    if (error) {

        console.error(
            'Error restaurando sesión del domiciliario:',
            error
        );

        return;
    }


    const session =
        data?.session;


    if (
        !session
        ||
        !session.user
    ) {

        return;
    }


    await cargarPanelDomiciliario(
        session.user,
        false
    );
}


restaurarSesionDomiciliario();

// ======================================================
// ACTUALIZAR PEDIDOS AUTOMÁTICAMENTE
// ======================================================

function programarActualizacionDelivery() {

    clearTimeout(
        realtimeDeliveryTimer
    );


    realtimeDeliveryTimer =
        setTimeout(
            async () => {

                console.log(
                    'Cambio de asignación detectado. Actualizando domiciliario...'
                );


                await cargarPedidos();

            },
            300
        );
}


// ======================================================
// REALTIME DE ASIGNACIONES DEL DOMICILIARIO
// ======================================================

function iniciarRealtimeDelivery() {

    if (realtimeDeliveryIniciado) {

        return;
    }


    realtimeDeliveryIniciado =
        true;


    supabase
        .channel(
            'delivery-realtime'
        )

        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'delivery_assignments'
            },
            programarActualizacionDelivery
        )


                .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'orders'
            },
            programarActualizacionDelivery
        )

        .subscribe(
            status => {

                console.log(
                    'Realtime delivery:',
                    status
                );
            }
        );
}

// ======================================================
// CARGAR PEDIDOS ASIGNADOS
// ======================================================

async function cargarPedidos() {

    const {
        data: pedidos,
        error
    } = await supabase.rpc(
        'get_my_delivery_orders'
    );


    if (error) {

        console.error(
            'Error cargando pedidos del domiciliario:',
            error
        );


        ordersStatus.textContent =
            'No se pudieron cargar los pedidos.';

        return;
    }


    if (
        !pedidos
        ||
        pedidos.length === 0
    ) {

        ordersStatus.textContent =
            'No tienes pedidos asignados.';

        ordersList.innerHTML = '';

        return;
    }


    ordersStatus.textContent =
        `${pedidos.length} pedido(s) asignado(s)`;


    ordersList.innerHTML =
        pedidos.map(
            pedido => `

                <article class="delivery-order">

                    <h3>
                        ${pedido.customer_name}
                    </h3>

                    <p>
                        📞 ${pedido.customer_phone}
                    </p>

                    <p>
                        📍 ${pedido.delivery_address ?? ''}
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

                    <p>
                        Estado:
                        <strong>
                            ${pedido.status}
                        </strong>
                    </p>

                    <p>
                        Pago:
                        <strong>
                            ${
                                pedido.payment_method ===
                                    'cash_on_delivery'
                                    ? 'Efectivo contraentrega'
                                    : pedido.payment_method ===
                                        'transfer'
                                        ? 'Transferencia'
                                        : 'No especificado'
                            }
                        </strong>
                    </p>

                    <p>
                        Estado del pago:
                        <strong>
                            ${
                                pedido.payment_status ===
                                    'paid'
                                    ? 'Pagado'
                                    : 'Pendiente'
                            }
                        </strong>
                    </p>

                    <p>
                        Total:
                        <strong>
                            ${formatearPrecio(
                                pedido.total
                            )}
                        </strong>
                    </p>

                    ${
    pedido.status === 'ready'

        ? `
            <button
                class="driver-pick-up-order"
                data-order-id="${pedido.order_id}"
            >
                Recoger pedido e iniciar domicilio
            </button>
        `

        : ''
}

${
    pedido.status === 'out_for_delivery'
    &&
    pedido.payment_method === 'transfer'
    &&
    pedido.payment_status === 'paid'

        ? `
            <button
                class="driver-complete-delivery"
                data-order-id="${pedido.order_id}"
            >
                Confirmar pedido entregado
            </button>
        `

        : ''
}

${
    pedido.status === 'out_for_delivery'
    &&
    pedido.payment_method === 'cash_on_delivery'
    &&
    pedido.payment_status !== 'paid'

        ? `
            <button
                class="driver-complete-cash-delivery"
                data-order-id="${pedido.order_id}"
            >
                Confirmar efectivo recibido y entrega
            </button>
        `

        : ''
}


                </article>

            `
        ).join('');
}

// ======================================================
// RECOGER PEDIDO E INICIAR DOMICILIO
// ======================================================

ordersList.addEventListener(
    'click',
    async event => {

        const boton =
            event.target.closest(
                '.driver-pick-up-order'
            );


        if (!boton) {
            return;
        }


        const orderId =
            boton.dataset.orderId;


        const confirmar =
            window.confirm(
                '¿Confirmas que recogiste este pedido y vas a iniciar el domicilio?'
            );


        if (!confirmar) {
            return;
        }


        boton.disabled = true;

        boton.textContent =
            'Iniciando domicilio...';


        const {
            error
        } = await supabase.rpc(
            'driver_pick_up_order',
            {
                p_order_id: orderId
            }
        );


        if (error) {

            console.error(
                'Error iniciando domicilio:',
                error
            );


            alert(
                'No se pudo iniciar el domicilio.'
            );


            boton.disabled = false;

            boton.textContent =
                'Recoger pedido e iniciar domicilio';

            return;
        }


        alert(
            'Pedido recogido. Domicilio iniciado ✅'
        );


        await cargarPedidos();

    }
);

// ======================================================
// CONFIRMAR ENTREGA DEL PEDIDO
// ======================================================

ordersList.addEventListener(
    'click',
    async event => {

        const boton =
            event.target.closest(
                '.driver-complete-delivery'
            );


        if (!boton) {
            return;
        }


        const orderId =
            boton.dataset.orderId;


        const confirmar =
            window.confirm(
                '¿Confirmas que entregaste este pedido al cliente?'
            );


        if (!confirmar) {
            return;
        }


        boton.disabled = true;

        boton.textContent =
            'Confirmando entrega...';


        const {
            error
        } = await supabase.rpc(
            'driver_complete_delivery',
            {
                p_order_id: orderId
            }
        );


        if (error) {

            console.error(
                'Error confirmando entrega:',
                error
            );


            alert(
                'No se pudo confirmar la entrega.'
            );


            boton.disabled = false;

            boton.textContent =
                'Confirmar pedido entregado';

            return;
        }


        alert(
            'Pedido entregado correctamente ✅'
        );


        await cargarPedidos();

    }
);

// ======================================================
// CONFIRMAR EFECTIVO RECIBIDO Y ENTREGA
// ======================================================

ordersList.addEventListener(
    'click',
    async event => {

        const boton =
            event.target.closest(
                '.driver-complete-cash-delivery'
            );


        if (!boton) {
            return;
        }


        const orderId =
            boton.dataset.orderId;


        const confirmar =
            window.confirm(
                '¿Confirmas que recibiste el efectivo del cliente y entregaste el pedido?'
            );


        if (!confirmar) {
            return;
        }


        boton.disabled = true;

        boton.textContent =
            'Confirmando pago y entrega...';


        const {
            error
        } = await supabase.rpc(
            'driver_complete_cash_delivery',
            {
                p_order_id: orderId
            }
        );


        if (error) {

            console.error(
                'Error confirmando efectivo y entrega:',
                error
            );


            alert(
                'No se pudo confirmar el pago y la entrega.'
            );


            boton.disabled = false;

            boton.textContent =
                'Confirmar efectivo recibido y entrega';

            return;
        }


        alert(
            'Efectivo recibido y pedido entregado correctamente ✅'
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