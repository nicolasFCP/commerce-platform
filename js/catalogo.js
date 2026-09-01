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


    categories.forEach(category => {

        const productosCategoria = products.filter(
            product => product.category_id === category.id
        );


        if (productosCategoria.length === 0) {
            return;
        }


        const section = document.createElement('section');

        section.classList.add('categoria');


        section.innerHTML = `
            <h2>${category.name}</h2>

            <div class="productos">

                ${productosCategoria.map(product => `

                    <article class="producto">

                        <h3>${product.name}</h3>

                        <div class="precio">
                            ${formatearPrecio(product.price)}
                        </div>

                        <button
                            class="agregar"
                            data-product-id="${product.id}"
                        >
                            Agregar
                        </button>

                    </article>

                `).join('')}

            </div>
        `;


        catalogo.appendChild(section);
    });
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
        'place_order',
        {
            p_store_id: comercioActual.id,
            p_customer_name: nombre,
            p_customer_phone: telefono,
            p_items: items,
            p_customer_email: null,
            p_fulfillment_type: 'delivery',
            p_delivery_address: direccion,
            p_notes: notas || null
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

        #pedido-form input,
        #pedido-form textarea {
            width: 100%;
            padding: 14px;
            border: 1px solid #d1d5db;
            border-radius: 10px;
            font: inherit;
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