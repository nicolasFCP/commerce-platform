import {
    supabasePlatform as supabase
} from './supabase.js';


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
// ELEMENTOS CONFIGURACIÓN WHATSAPP
// ======================================================

const whatsappStore =
    document.querySelector(
        '#whatsapp-store'
    );

const whatsappSettingsForm =
    document.querySelector(
        '#whatsapp-settings-form'
    );

const whatsappPhoneNumberId =
    document.querySelector(
        '#whatsapp-phone-number-id'
    );

const whatsappWabaId =
    document.querySelector(
        '#whatsapp-waba-id'
    );

const whatsappDisplayNumber =
    document.querySelector(
        '#whatsapp-display-number'
    );

const whatsappActive =
    document.querySelector(
        '#whatsapp-active'
    );

const whatsappSettingsButton =
    document.querySelector(
        '#whatsapp-settings-button'
    );

const whatsappSettingsMessage =
    document.querySelector(
        '#whatsapp-settings-message'
    );

    const driverStore = document.querySelector('#driver-store');
const driverName = document.querySelector('#driver-name');
const driverPhone = document.querySelector('#driver-phone');
const driverEmail = document.querySelector('#driver-email');
const driverPassword = document.querySelector('#driver-password');
const createDriverButton = document.querySelector('#create-driver-button');
const createDriverMessage = document.querySelector('#create-driver-message');

whatsappSettingsButton.addEventListener(
    'click',
    guardarConfiguracionWhatsapp
);    

createDriverButton.addEventListener(
    'click',
    crearDomiciliario
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
// RESTAURAR SESIÓN DE PLATFORM ADMIN
// ======================================================

async function restaurarSesionPlatform() {

    const {
        data,
        error
    } = await supabase.auth.getSession();


    if (error) {

        console.error(
            'Error restaurando sesión de Platform Admin:',
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


    // ==================================================
    // VERIFICAR QUE SIGA SIENDO PLATFORM ADMIN
    // ==================================================

    const {
        data: esPlatformAdmin,
        error: adminError
    } = await supabase.rpc(
        'is_platform_admin'
    );


    if (
        adminError
        ||
        esPlatformAdmin !== true
    ) {

        console.error(
            'Sesión sin acceso de Platform Admin:',
            adminError
        );


        await supabase.auth.signOut();


        platformContenido.style.display =
            'none';


        platformLoginEstado.textContent =
            '⛔ Esta cuenta no tiene acceso al panel maestro.';


        platformLogin.disabled = false;

        platformLogin.textContent =
            'Iniciar sesión';

        return;
    }


    // ==================================================
    // RESTAURAR PANEL
    // ==================================================

    platformEmail.value =
        session.user.email ?? '';


    platformPassword.value =
        '';


    platformLoginEstado.innerHTML = `
        <strong>
            Acceso administrativo autorizado ✅
        </strong>

        <br>

        ${session.user.email}
    `;


    platformLogin.disabled = true;

    platformLogin.textContent =
        'Sesión iniciada';


    platformContenido.style.display =
        'block';


    await cargarComercios();
}


restaurarSesionPlatform();

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

// ======================================================
// CARGAR COMERCIOS EN SELECTOR DE WHATSAPP
// ======================================================

whatsappStore.innerHTML = `
    <option value="">
        Selecciona un comercio
    </option>
`;


activos.forEach(
    comercio => {

        const opcion =
            document.createElement(
                'option'
            );


        opcion.value =
            comercio.store_id;


        opcion.textContent =
            comercio.store_name;


        whatsappStore.appendChild(
            opcion
        );
    }
);


driverStore.innerHTML = `
    <option value="">
        Selecciona un comercio
    </option>
`;

activos.forEach(comercio => {
    const opcion = document.createElement('option');
    opcion.value = comercio.store_id;
    opcion.textContent = comercio.store_name;
    driverStore.appendChild(opcion);
});


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

// ======================================================
// GUARDAR CONFIGURACIÓN WHATSAPP
// ======================================================

async function guardarConfiguracionWhatsapp(event) {

    event.preventDefault();


    const storeId =
        whatsappStore.value;

    const phoneNumberId =
        whatsappPhoneNumberId.value.trim();

    const wabaId =
        whatsappWabaId.value.trim();

    const displayNumber =
        whatsappDisplayNumber.value.trim();


    whatsappSettingsMessage.textContent = '';


    if (!storeId) {

        whatsappSettingsMessage.textContent =
            'Selecciona un comercio.';

        return;
    }


    if (!phoneNumberId) {

        whatsappSettingsMessage.textContent =
            'Ingresa el Phone Number ID.';

        return;
    }


    whatsappSettingsButton.disabled = true;

    whatsappSettingsButton.textContent =
        'Guardando...';


    const {
        data,
        error
    } = await supabase.rpc(
        'platform_save_whatsapp_settings',
        {
            p_store_id:
                storeId,

            p_phone_number_id:
                phoneNumberId,

            p_whatsapp_business_account_id:
                wabaId || null,

            p_display_phone_number:
                displayNumber || null,

            p_active:
                whatsappActive.checked
        }
    );


    if (error) {

        console.error(
            'Error guardando WhatsApp:',
            error
        );


        whatsappSettingsMessage.textContent =
            error.message.includes(
                'ya pertenece a otro comercio'
            )
                ? 'Ese Phone Number ID ya está asignado a otro comercio.'
                : 'No se pudo guardar la configuración de WhatsApp.';


        whatsappSettingsButton.disabled = false;

        whatsappSettingsButton.textContent =
            'Guardar configuración WhatsApp';

        return;
    }


    console.log(
        'Configuración WhatsApp guardada:',
        data
    );


    whatsappSettingsMessage.textContent =
        'Configuración WhatsApp guardada correctamente ✅';


    whatsappSettingsButton.disabled = false;

    whatsappSettingsButton.textContent =
        'Guardar configuración WhatsApp';
}

// ======================================================
// CREAR DOMICILIARIO
// ======================================================

async function crearDomiciliario() {

    const storeId =
        driverStore.value;

    const name =
        driverName.value.trim();

    const phone =
        driverPhone.value.trim();

    const email =
        driverEmail.value
            .trim()
            .toLowerCase();

    const password =
        driverPassword.value;


    createDriverMessage.textContent = '';


    // ==================================================
    // VALIDACIONES
    // ==================================================

    if (!storeId) {

        createDriverMessage.textContent =
            'Selecciona un comercio.';

        return;
    }


    if (!name) {

        createDriverMessage.textContent =
            'Ingresa el nombre del domiciliario.';

        return;
    }


    if (
        !email
        ||
        !email.includes('@')
    ) {

        createDriverMessage.textContent =
            'Ingresa un correo válido.';

        return;
    }


    if (password.length < 8) {

        createDriverMessage.textContent =
            'La contraseña debe tener mínimo 8 caracteres.';

        return;
    }


    // ==================================================
    // BLOQUEAR BOTÓN DURANTE EL PROCESO
    // ==================================================

    createDriverButton.disabled =
        true;

    createDriverButton.textContent =
        'Creando domiciliario...';


    // ==================================================
    // LLAMAR EDGE FUNCTION
    // ==================================================

    const {
        data,
        error
    } = await supabase.functions.invoke(
        'platform-create-delivery-driver',
        {
            body: {

                store_id:
                    storeId,

                name:
                    name,

                phone:
                    phone || null,

                email:
                    email,

                password:
                    password
            }
        }
    );


    // ==================================================
    // ERROR DE INVOCACIÓN
    // ==================================================

    if (error) {

        console.error(
            'Error creando domiciliario:',
            error
        );


        createDriverMessage.textContent =
            'No se pudo crear el domiciliario.';


        createDriverButton.disabled =
            false;

        createDriverButton.textContent =
            'Crear domiciliario';

        return;
    }


    // ==================================================
    // RESPUESTA NO VÁLIDA
    // ==================================================

    if (
        !data
        ||
        data.ok !== true
    ) {

        console.error(
            'Respuesta creando domiciliario:',
            data
        );


        createDriverMessage.textContent =
            data?.message
            ?? 'No se pudo crear el domiciliario.';


        createDriverButton.disabled =
            false;

        createDriverButton.textContent =
            'Crear domiciliario';

        return;
    }


    // ==================================================
    // ALTA COMPLETADA
    // ==================================================

    createDriverMessage.textContent =
        `✅ ${data.driver.name} creado y asignado a ${data.store.name}.`;


    // No conservar credenciales en pantalla
    driverName.value = '';
    driverPhone.value = '';
    driverEmail.value = '';
    driverPassword.value = '';


    createDriverButton.disabled =
        false;

    createDriverButton.textContent =
        'Crear domiciliario';


    console.log(
        'Nuevo domiciliario creado:',
        data
    );
}