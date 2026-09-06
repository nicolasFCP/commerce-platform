import { supabase } from './supabase.js';

const nombreComercio = document.querySelector('#nombre-comercio');
const estado = document.querySelector('#estado');
const catalogo = document.querySelector('#catalogo');

const carritoVacio = document.querySelector('#carrito-vacio');
const itemsCarrito = document.querySelector('#items-carrito');
const totalCarrito = document.querySelector('#total-carrito');
const continuarPedido = document.querySelector('#continuar-pedido');

let productosDisponibles = [];
let carrito = [];
let comercioActual = null;

let metodosPagoActuales = {
    transfer_enabled: false,
    cash_on_delivery_enabled: false
};

/* =====================================================
   CARGAR CATÁLOGO
===================================================== */

async function cargarCatalogo() {

    const {
        data: store,
        error: storeError
    } = await supabase
        .from('stores')
        .select('id, name, slug')
        .eq('slug', 'mercado-demo')
        .eq('active', true)
        .single();


    if (storeError) {

        console.error(storeError);

        nombreComercio.textContent = 'Error';
        estado.textContent = 'No se pudo cargar el comercio';

        return;
    }


    comercioActual = store;

    const {
    data: paymentMethods,
    error: paymentMethodsError
} = await supabase.rpc(
    'get_public_payment_methods',
    {
        p_store_id: store.id
    }
);


if (paymentMethodsError) {

    console.error(
        'Error cargando métodos de pago:',
        paymentMethodsError
    );

} else if (
    paymentMethods
    &&
    paymentMethods.length > 0
) {

    metodosPagoActuales =
        paymentMethods[0];
}

nombreComercio.textContent = store.name;
estado.textContent = 'Catálogo conectado con Supabase';


    const {
        data: categories,
        error: categoriesError
    } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('store_id', store.id)
        .eq('active', true)
        .order('name');


    if (categoriesError) {

        console.error(categoriesError);

        return;
    }


    const {
        data: products,
        error: productsError
    } = await supabase
        .from('products')
        .select(`
            id,
            name,
            description,
            price,
            category_id
        `)
        .eq('store_id', store.id)
        .eq('active', true)
        .eq('available', true)
        .order('name');


    if (productsError) {

        console.error(productsError);

        return;
    }


    productosDisponibles = products;

    mostrarCatalogo(categories, products);
}


/* =====================================================
   MOSTRAR CATÁLOGO
===================================================== */

function mostrarCatalogo(categories, products) {

    catalogo.innerHTML = '';


    // ==================================================
    // SOLO CATEGORÍAS QUE TIENEN PRODUCTOS
    // ==================================================

    const categoriasConProductos =
        categories.filter(
            category =>
                products.some(
                    product =>
                        product.category_id === category.id
                )
        );


    // ==================================================
    // NAVEGACIÓN DE CATEGORÍAS
    // ==================================================

    const navegacion =
        document.createElement('div');


    navegacion.className =
        'categorias-navegacion';


    const botonTodos =
        document.createElement('button');


    botonTodos.type = 'button';

    botonTodos.className =
        'categoria-filtro activa';

    botonTodos.textContent =
        '🛒 Todos';

    botonTodos.dataset.categoryId =
        'todos';


    navegacion.appendChild(
        botonTodos
    );


    categoriasConProductos.forEach(
        category => {

            const boton =
                document.createElement(
                    'button'
                );


            boton.type =
                'button';


            boton.className =
                'categoria-filtro';


            boton.dataset.categoryId =
                category.id;


            boton.textContent =
                category.name;


            navegacion.appendChild(
                boton
            );
        }
    );


    catalogo.appendChild(
        navegacion
    );


    // ==================================================
    // CONTENEDOR DE PRODUCTOS
    // ==================================================

    const contenido =
        document.createElement('div');


    contenido.className =
        'catalogo-contenido';


    catalogo.appendChild(
        contenido
    );


    // ==================================================
    // RENDERIZAR PRODUCTOS
    // ==================================================

    function renderizarCategoria(
        categoryId = 'todos'
    ) {

        contenido.innerHTML = '';


        const categoriasAMostrar =
            categoryId === 'todos'
                ? categoriasConProductos
                : categoriasConProductos.filter(
                    category =>
                        category.id === categoryId
                );


        categoriasAMostrar.forEach(
            category => {

                const productosCategoria =
                    products.filter(
                        product =>
                            product.category_id ===
                            category.id
                    );


                if (
                    productosCategoria.length === 0
                ) {
                    return;
                }


                const section =
                    document.createElement(
                        'section'
                    );


                section.classList.add(
                    'categoria'
                );


                section.innerHTML = `
                    <h2>${category.name}</h2>

                    <div class="productos">

                        ${productosCategoria
                            .map(
                                product => `

                                    <article class="producto">

                                        <h3>
                                            ${product.name}
                                        </h3>

                                        <div class="precio">
                                            ${formatearPrecio(
                                                product.price
                                            )}
                                        </div>

                                        <button
                                            class="agregar"
                                            data-product-id="${product.id}"
                                        >
                                            Agregar
                                        </button>

                                    </article>

                                `
                            )
                            .join('')}

                    </div>
                `;


                contenido.appendChild(
                    section
                );
            }
        );
    }


    // ==================================================
    // CAMBIAR CATEGORÍA
    // ==================================================

    navegacion.addEventListener(
        'click',
        event => {

            const boton =
                event.target.closest(
                    '.categoria-filtro'
                );


            if (!boton) {
                return;
            }


            navegacion
                .querySelectorAll(
                    '.categoria-filtro'
                )
                .forEach(
                    item =>
                        item.classList.remove(
                            'activa'
                        )
                );


            boton.classList.add(
                'activa'
            );


            renderizarCategoria(
                boton.dataset.categoryId
            );
        }
    );


    // Mostrar todo inicialmente
    renderizarCategoria('todos');
}

/* =====================================================
   AGREGAR PRODUCTO
===================================================== */

catalogo.addEventListener('click', event => {

    const boton = event.target.closest('.agregar');

    if (!boton) {
        return;
    }


    const productId = boton.dataset.productId;

    const producto = productosDisponibles.find(
        product => product.id === productId
    );


    if (!producto) {
        return;
    }


    agregarAlCarrito(producto);
});


function agregarAlCarrito(producto) {

    const existente = carrito.find(
        item => item.id === producto.id
    );


    if (existente) {

        existente.quantity += 1;

    } else {

        carrito.push({
            id: producto.id,
            name: producto.name,
            price: Number(producto.price),
            quantity: 1
        });

    }


    mostrarCarrito();
}


/* =====================================================
   MOSTRAR CARRITO
===================================================== */

function mostrarCarrito() {

    if (carrito.length === 0) {

        carritoVacio.style.display = 'block';

        itemsCarrito.innerHTML = '';

        totalCarrito.textContent = formatearPrecio(0);

        continuarPedido.disabled = true;

        return;
    }


    carritoVacio.style.display = 'none';

    continuarPedido.disabled = false;


    itemsCarrito.innerHTML = carrito.map(item => `

        <div class="item-carrito">

            <div class="item-carrito-info">

                <strong>${item.name}</strong>

                <strong>
                    ${formatearPrecio(
                        item.price * item.quantity
                    )}
                </strong>

            </div>

            <div class="controles">

                <button
                    data-action="restar"
                    data-product-id="${item.id}"
                >
                    −
                </button>

                <span>
                    ${item.quantity}
                </span>

                <button
                    data-action="sumar"
                    data-product-id="${item.id}"
                >
                    +
                </button>

            </div>

        </div>

    `).join('');


    const total = carrito.reduce(
        (acumulado, item) =>
            acumulado + (item.price * item.quantity),
        0
    );


    totalCarrito.textContent = formatearPrecio(total);
}


/* =====================================================
   MODIFICAR CANTIDAD
===================================================== */

itemsCarrito.addEventListener('click', event => {

    const boton = event.target.closest('button');

    if (!boton) {
        return;
    }


    const productId = boton.dataset.productId;
    const action = boton.dataset.action;


    const item = carrito.find(
        product => product.id === productId
    );


    if (!item) {
        return;
    }


    if (action === 'sumar') {

        item.quantity += 1;

    }


    if (action === 'restar') {

        item.quantity -= 1;


        if (item.quantity <= 0) {

            carrito = carrito.filter(
                product => product.id !== productId
            );

        }

    }


    mostrarCarrito();
});


/* =====================================================
   PRECIO
===================================================== */

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

/* =====================================================
   CONTINUAR PEDIDO
===================================================== */

continuarPedido.addEventListener('click', () => {

    if (carrito.length === 0) {
        return;
    }

    mostrarFormularioPedido();
});


function mostrarFormularioPedido() {

    const existente = document.querySelector('#formulario-pedido');

    if (existente) {
        existente.scrollIntoView({
            behavior: 'smooth'
        });

        return;
    }


    const formulario = document.createElement('section');

    formulario.id = 'formulario-pedido';
    formulario.className = 'carrito';


    formulario.innerHTML = `
        <h2>Datos para tu pedido</h2>

        <form id="pedido-form">

            <label>
                Nombre
                <input
                    id="cliente-nombre"
                    type="text"
                    required
                >
            </label>

            <label>
                Teléfono
                <input
                    id="cliente-telefono"
                    type="tel"
                    required
                >
            </label>

            <label>
                Dirección
                <input
                    id="cliente-direccion"
                    type="text"
                    required
                >
            </label>

            <label>
                Notas
                <textarea
                    id="cliente-notas"
                    rows="3"
                ></textarea>
            </label>

<fieldset class="pago-opciones">

    <legend>
        Forma de pago
    </legend>

    ${
        metodosPagoActuales.transfer_enabled

            ? `
                <label class="pago-opcion">

                    <input
                        type="radio"
                        name="metodo-pago"
                        value="transfer"
                        required
                    >

                    <span>
                        Transferencia
                    </span>

                </label>
            `

            : ''
    }


    ${
        metodosPagoActuales.cash_on_delivery_enabled

            ? `
                <label class="pago-opcion">

                    <input
                        type="radio"
                        name="metodo-pago"
                        value="cash_on_delivery"
                        required
                    >

                    <span>
                        Efectivo contraentrega
                    </span>

                </label>
            `

            : ''
    }

</fieldset>

            <button
                id="enviar-pedido"
                type="submit"
            >
                Realizar pedido
            </button>

        </form>

        <p id="resultado-pedido"></p>
    `;


    document.querySelector('main').appendChild(formulario);


    agregarEstilosFormulario();


    formulario.scrollIntoView({
        behavior: 'smooth'
    });


    document
        .querySelector('#pedido-form')
        .addEventListener(
            'submit',
            enviarPedido
        );
}


/* =====================================================
   ENVIAR PEDIDO A SUPABASE
===================================================== */

async function enviarPedido(event) {

    event.preventDefault();


    if (!comercioActual) {
        return;
    }


    const boton = document.querySelector('#enviar-pedido');
    const resultado = document.querySelector('#resultado-pedido');


    const nombre =
        document.querySelector('#cliente-nombre').value.trim();

    const telefono =
        document.querySelector('#cliente-telefono').value.trim();

    const direccion =
        document.querySelector('#cliente-direccion').value.trim();

    const notas =
        document.querySelector('#cliente-notas').value.trim();

const metodoPagoSeleccionado =
    document.querySelector(
        'input[name="metodo-pago"]:checked'
    );


if (!metodoPagoSeleccionado) {

    resultado.textContent =
        'Selecciona una forma de pago.';

    return;
}


const metodoPago =
    metodoPagoSeleccionado.value;

    const items = carrito.map(item => ({
        product_id: item.id,
        quantity: item.quantity
    }));


    boton.disabled = true;
    boton.textContent = 'Enviando...';

    resultado.textContent = '';


    const {
        data,
        error
    } = await supabase.rpc(
        'place_order_v2',
        {
            p_store_id: comercioActual.id,
            p_customer_name: nombre,
            p_customer_phone: telefono,
            p_items: items,
            p_customer_email: null,
            p_fulfillment_type: 'delivery',
            p_delivery_address: direccion,
p_notes: notas || null,
p_payment_method: metodoPago
        }
    );


    if (error) {

        console.error(error);

        resultado.textContent =
            'No se pudo realizar el pedido.';

        boton.disabled = false;
        boton.textContent = 'Realizar pedido';

        return;
    }


    resultado.innerHTML = `
        <strong>Pedido realizado correctamente ✅</strong>
        <br>
        Código:
        <small>${data}</small>
    `;


    carrito = [];

    mostrarCarrito();

    boton.textContent = 'Pedido enviado';
}


/* =====================================================
   ESTILOS FORMULARIO
===================================================== */

function agregarEstilosFormulario() {

    if (document.querySelector('#estilos-formulario')) {
        return;
    }


    const style = document.createElement('style');

    style.id = 'estilos-formulario';


    style.textContent = `

        #pedido-form {
            display: grid;
            gap: 18px;
        }

        #pedido-form label {
            display: grid;
            gap: 8px;
            font-weight: bold;
        }

        #pedido-form input:not([type="radio"]),
#pedido-form textarea {
            width: 100%;
            padding: 14px;
            border: 1px solid #d1d5db;
            border-radius: 10px;
            font: inherit;
        }
.pago-opciones {
    margin: 0;
    padding: 16px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
}

.pago-opciones legend {
    font-weight: bold;
    padding: 0 6px;
}

#pedido-form .pago-opcion {
    display: flex;
    grid-template-columns: none;
    align-items: center;
    gap: 10px;
    margin-top: 12px;
    font-weight: normal;
}

.pago-opcion input {
    width: auto;
    margin: 0;
}
        #enviar-pedido {
            width: 100%;
            padding: 15px;
            border: none;
            border-radius: 12px;
            background: #111827;
            color: white;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
        }

        #resultado-pedido {
            margin-top: 18px;
        }

    `;


    document.head.appendChild(style);
}



/* =====================================================
   INICIAR
===================================================== */

cargarCatalogo();