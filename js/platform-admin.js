import { supabase } from './supabase.js';


// ======================================================
// ELEMENTOS DEL LOGIN
// ======================================================

const platformEmail =
    document.querySelector(
        '#platform-email'
    );

const platformPassword =
    document.querySelector(
        '#platform-password'
    );

const platformLogin =
    document.querySelector(
        '#platform-login'
    );

const platformLoginEstado =
    document.querySelector(
        '#platform-login-estado'
    );

const platformContenido =
    document.querySelector(
        '#platform-contenido'
    );

// ======================================================
// ELEMENTOS DE ALTA DE COMERCIO
// ======================================================

const nuevoStoreName =
    document.querySelector(
        '#nuevo-store-name'
    );

const nuevoStoreSlug =
    document.querySelector(
        '#nuevo-store-slug'
    );

const nuevoStorePhone =
    document.querySelector(
        '#nuevo-store-phone'
    );

const nuevoOwnerEmail =
    document.querySelector(
        '#nuevo-owner-email'
    );

const nuevoOwnerPassword =
    document.querySelector(
        '#nuevo-owner-password'
    );

const crearNuevoComercio =
    document.querySelector(
        '#crear-nuevo-comercio'
    );

const altaComercioEstado =
    document.querySelector(
        '#alta-comercio-estado'
    );

    // ======================================================
// ELEMENTOS DE COMERCIOS
// ======================================================

const totalComercios =
    document.querySelector(
        '#total-comercios'
    );

const comerciosEstado =
    document.querySelector(
        '#comercios-estado'
    );

const comerciosLista =
    document.querySelector(
        '#comercios-lista'
    );
// ======================================================
// INICIAR SESIÓN
// ======================================================

platformLogin.addEventListener(
    'click',
    iniciarSesionPlatform
);


async function iniciarSesionPlatform() {

    const email =
        platformEmail.value.trim();

    const password =
        platformPassword.value;


    platformLoginEstado.textContent = '';

    platformContenido.style.display =
        'none';


    if (
        !email
        ||
        !password
    ) {

        platformLoginEstado.textContent =
            'Ingresa correo y contraseña.';

        return;
    }


    platformLogin.disabled = true;

    platformLogin.textContent =
        'Ingresando...';


    // ==================================================
    // AUTENTICAR USUARIO
    // ==================================================

    const {
        data,
        error
    } = await supabase.auth
        .signInWithPassword({
            email,
            password
        });


    if (error) {

        console.error(
            'Error de login:',
            error
        );


        platformLoginEstado.textContent =
            'Correo o contraseña incorrectos.';


        platformLogin.disabled = false;

        platformLogin.textContent =
            'Iniciar sesión';

        return;
    }


    // ==================================================
    // VERIFICAR PLATFORM ADMIN
    // ==================================================

    const {
        data: esPlatformAdmin,
        error: adminError
    } = await supabase.rpc(
        'is_platform_admin'
    );


    if (adminError) {

        console.error(
            'Error verificando platform admin:',
            adminError
        );


        platformLoginEstado.textContent =
            'No se pudo verificar el acceso administrativo.';


        platformLogin.disabled = false;

        platformLogin.textContent =
            'Iniciar sesión';

        return;
    }


    if (esPlatformAdmin !== true) {

        platformLoginEstado.textContent =
            '⛔ Este usuario no tiene acceso al panel maestro.';


        platformLogin.disabled = false;

        platformLogin.textContent =
            'Iniciar sesión';

        return;
    }


    // ==================================================
    // ACCESO AUTORIZADO
    // ==================================================

    platformLoginEstado.innerHTML = `
        <strong>
            Acceso administrativo autorizado ✅
        </strong>

        <br>

        ${data.user.email}
    `;


    platformLogin.textContent =
        'Sesión iniciada';


    platformContenido.style.display =
        'block';

        await cargarComercios();

}

// ======================================================
// CREAR NUEVO COMERCIO
// ======================================================

crearNuevoComercio.addEventListener(
    'click',
    crearComercio
);


async function crearComercio() {

    const storeName =
        nuevoStoreName.value.trim();

    const slug =
        nuevoStoreSlug.value
            .trim()
            .toLowerCase();

    const phone =
        nuevoStorePhone.value.trim();

    const ownerEmail =
        nuevoOwnerEmail.value
            .trim()
            .toLowerCase();

    const ownerPassword =
        nuevoOwnerPassword.value;


    altaComercioEstado.textContent = '';


    if (
        !storeName
        ||
        !slug
        ||
        !ownerEmail
        ||
        !ownerPassword
    ) {

        altaComercioEstado.textContent =
            'Completa nombre, slug, correo y contraseña.';

        return;
    }


    crearNuevoComercio.disabled =
        true;

    crearNuevoComercio.textContent =
        'Creando comercio...';


    const {
        data,
        error
    } = await supabase.functions.invoke(
        'platform-create-store',
        {
            body: {

                store_name:
                    storeName,

                slug:
                    slug,

                phone:
                    phone || null,

                owner_email:
                    ownerEmail,

                owner_password:
                    ownerPassword
            }
        }
    );


    if (error) {

        console.error(
            'Error creando comercio:',
            error
        );


        altaComercioEstado.textContent =
            'No se pudo crear el comercio.';


        crearNuevoComercio.disabled =
            false;

        crearNuevoComercio.textContent =
            'Crear comercio';

        return;
    }


    if (
        !data
        ||
        data.ok !== true
    ) {

        console.error(
            'Respuesta del alta:',
            data
        );


        altaComercioEstado.textContent =
            data?.message
            ?? 'No se pudo crear el comercio.';


        crearNuevoComercio.disabled =
            false;

        crearNuevoComercio.textContent =
            'Crear comercio';

        return;
    }


    altaComercioEstado.textContent =
        `✅ ${data.store.name} creado correctamente. Slug: ${data.store.slug}`;


    // No conservar la contraseña
    nuevoOwnerPassword.value = '';


    crearNuevoComercio.disabled =
        false;

    crearNuevoComercio.textContent =
        'Crear comercio';


    console.log(
        'Nuevo comercio creado:',
        data
    );
}

// ======================================================
// CARGAR COMERCIOS DE LA PLATAFORMA
// ======================================================

async function cargarComercios() {

    comerciosEstado.textContent =
        'Cargando comercios...';

    comerciosLista.innerHTML = '';


    const {
        data,
        error
    } = await supabase.rpc(
        'platform_list_stores'
    );


    if (error) {

        console.error(
            'Error cargando comercios:',
            error
        );

        comerciosEstado.textContent =
            'No se pudieron cargar los comercios.';

        return;
    }


    const comercios =
        data ?? [];


    const activos =
        comercios.filter(
            comercio =>
                comercio.store_active === true
        );


    totalComercios.textContent =
        activos.length;


    if (comercios.length === 0) {

        comerciosEstado.textContent =
            'No hay comercios registrados.';

        return;
    }


    comerciosEstado.textContent =
        `${comercios.length} comercio(s) registrado(s)`;


    comercios.forEach(
        comercio => {

            const tarjeta =
                document.createElement(
                    'div'
                );


            tarjeta.className =
                'resumen-card';


            tarjeta.style.marginTop =
                '12px';


            tarjeta.innerHTML = `
                <strong>
                    ${comercio.store_name}
                </strong>

                <p>
                    ${comercio.store_active
                        ? '🟢 Activo'
                        : '🔴 Inactivo'}
                </p>

                <p>
                    <b>Slug:</b>
                    ${comercio.store_slug}
                </p>

                <p>
                    <b>Propietario:</b>
                    ${comercio.owner_email ?? 'Sin propietario'}
                </p>

                <p>
                    <b>Teléfono:</b>
                    ${comercio.store_phone ?? 'No registrado'}
                </p>
            `;


            comerciosLista.appendChild(
                tarjeta
            );
        }
    );
}