import { supabase } from './supabase.js';

const nombreComercio = document.querySelector('#nombre-comercio');
const estado = document.querySelector('#estado');
const catalogo = document.querySelector('#catalogo');


async function cargarCatalogo() {

    // Buscar Mercado Demo
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


    nombreComercio.textContent = store.name;
    estado.textContent = 'Catálogo conectado con Supabase';


    // Buscar categorías
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


    // Buscar productos
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


    mostrarCatalogo(categories, products);
}


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

                    </article>

                `).join('')}

            </div>
        `;


        catalogo.appendChild(section);
    });
}


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


cargarCatalogo();