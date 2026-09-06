import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";


export default {

    fetch: withSupabase(
        { auth: "user" },

        async (req, ctx) => {

            // ==========================================
            // SOLO POST
            // ==========================================

            if (req.method !== "POST") {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "Método no permitido."
                    },
                    {
                        status: 405
                    }
                );
            }


            // ==========================================
            // CREDENCIALES SEGURAS
            // ==========================================

            const supabaseUrl =
                Deno.env.get(
                    "SUPABASE_URL"
                );

            const serviceRoleKey =
                Deno.env.get(
                    "SUPABASE_SERVICE_ROLE_KEY"
                );


            if (
                !supabaseUrl
                ||
                !serviceRoleKey
            ) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "Faltan credenciales del backend."
                    },
                    {
                        status: 500
                    }
                );
            }


            // ==========================================
            // IDENTIFICAR USUARIO AUTENTICADO
            // ==========================================

            const {
                data: userData,
                error: userError
            } = await ctx.supabase
                .auth
                .getUser();


            const currentUser =
                userData?.user;


            if (
                userError
                ||
                !currentUser
            ) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "Usuario no autenticado."
                    },
                    {
                        status: 401
                    }
                );
            }


            // ==========================================
            // VERIFICAR PLATFORM ADMIN
            // ==========================================

            const adminResponse =
                await fetch(
                    `${supabaseUrl}/rest/v1/platform_admins?user_id=eq.${
                        encodeURIComponent(
                            currentUser.id
                        )
                    }&active=eq.true&select=user_id&limit=1`,
                    {
                        headers: {

                            "apikey":
                                serviceRoleKey,

                            "Authorization":
                                `Bearer ${serviceRoleKey}`
                        }
                    }
                );


            if (!adminResponse.ok) {

                console.error(
                    "Error verificando platform admin:",
                    await adminResponse.text()
                );


                return Response.json(
                    {
                        ok: false,
                        message:
                            "No se pudo validar el administrador."
                    },
                    {
                        status: 500
                    }
                );
            }


            const adminRows =
                await adminResponse.json();


            if (
                !Array.isArray(adminRows)
                ||
                adminRows.length === 0
            ) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "No tienes permiso para crear comercios."
                    },
                    {
                        status: 403
                    }
                );
            }


            // ==========================================
            // RECIBIR DATOS
            // ==========================================

            const body =
                await req.json().catch(
                    () => ({})
                );


            const storeName =
                String(
                    body.store_name
                    ?? ""
                ).trim();


            const slug =
                String(
                    body.slug
                    ?? ""
                )
                    .trim()
                    .toLowerCase();


            const phone =
                String(
                    body.phone
                    ?? ""
                ).trim();


            const ownerEmail =
                String(
                    body.owner_email
                    ?? ""
                )
                    .trim()
                    .toLowerCase();


            const ownerPassword =
                String(
                    body.owner_password
                    ?? ""
                );


            // ==========================================
            // VALIDACIONES
            // ==========================================

            if (!storeName) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "Falta el nombre del comercio."
                    },
                    {
                        status: 400
                    }
                );
            }


            if (!slug) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "Falta el slug del comercio."
                    },
                    {
                        status: 400
                    }
                );
            }


            if (
                !/^[a-z0-9]+(?:-[a-z0-9]+)*$/
                    .test(slug)
            ) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "El slug solo puede contener letras minúsculas, números y guiones."
                    },
                    {
                        status: 400
                    }
                );
            }


            if (
                !ownerEmail
                ||
                !ownerEmail.includes("@")
            ) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "El correo del propietario no es válido."
                    },
                    {
                        status: 400
                    }
                );
            }


            if (
                ownerPassword.length < 8
            ) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "La contraseña inicial debe tener mínimo 8 caracteres."
                    },
                    {
                        status: 400
                    }
                );
            }


            // ==========================================
            // VERIFICAR SLUG DISPONIBLE
            // ==========================================

            const slugResponse =
                await fetch(
                    `${supabaseUrl}/rest/v1/stores?slug=eq.${
                        encodeURIComponent(slug)
                    }&select=id&limit=1`,
                    {
                        headers: {

                            "apikey":
                                serviceRoleKey,

                            "Authorization":
                                `Bearer ${serviceRoleKey}`
                        }
                    }
                );


            if (!slugResponse.ok) {

                console.error(
                    "Error verificando slug:",
                    await slugResponse.text()
                );


                return Response.json(
                    {
                        ok: false,
                        message:
                            "No se pudo verificar el slug."
                    },
                    {
                        status: 500
                    }
                );
            }


            const existingStores =
                await slugResponse.json();


            if (
                Array.isArray(existingStores)
                &&
                existingStores.length > 0
            ) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "Ese slug ya está siendo utilizado."
                    },
                    {
                        status: 409
                    }
                );
            }


            // ==========================================
            // CREAR USUARIO OWNER EN AUTH
            // ==========================================

            const createUserResponse =
                await fetch(
                    `${supabaseUrl}/auth/v1/admin/users`,
                    {
                        method: "POST",

                        headers: {

                            "apikey":
                                serviceRoleKey,

                            "Authorization":
                                `Bearer ${serviceRoleKey}`,

                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            email:
                                ownerEmail,

                            password:
                                ownerPassword,

                            email_confirm:
                                true
                        })
                    }
                );


            const createUserData =
                await createUserResponse
                    .json()
                    .catch(
                        () => ({})
                    );


            if (!createUserResponse.ok) {

                console.error(
                    "Error creando owner:",
                    createUserData
                );


                return Response.json(
                    {
                        ok: false,
                        message:
                            "No se pudo crear el usuario propietario.",

                        detail:
                            createUserData
                                ?.message
                            ?? null
                    },
                    {
                        status:
                            createUserResponse.status
                    }
                );
            }


            const ownerUserId =
                createUserData?.id
                ??
                createUserData
                    ?.user
                    ?.id;


            if (!ownerUserId) {

                console.error(
                    "Auth no devolvió user id:",
                    createUserData
                );


                return Response.json(
                    {
                        ok: false,
                        message:
                            "El usuario fue creado pero no se recibió su identificador."
                    },
                    {
                        status: 500
                    }
                );
            }


            // ==========================================
            // FUNCIÓN AUXILIAR DE LIMPIEZA DE AUTH
            // ==========================================

            async function eliminarUsuarioCreado() {

                const response =
                    await fetch(
                        `${supabaseUrl}/auth/v1/admin/users/${ownerUserId}`,
                        {
                            method: "DELETE",

                            headers: {

                                "apikey":
                                    serviceRoleKey,

                                "Authorization":
                                    `Bearer ${serviceRoleKey}`
                            }
                        }
                    );


                if (!response.ok) {

                    console.error(
                        "No se pudo revertir usuario Auth:",
                        await response.text()
                    );
                }
            }


            // ==========================================
            // CREAR STORE
            // ==========================================

            const createStoreResponse =
                await fetch(
                    `${supabaseUrl}/rest/v1/stores`,
                    {
                        method: "POST",

                        headers: {

                            "apikey":
                                serviceRoleKey,

                            "Authorization":
                                `Bearer ${serviceRoleKey}`,

                            "Content-Type":
                                "application/json",

                            "Prefer":
                                "return=representation"
                        },

                        body: JSON.stringify({

                            name:
                                storeName,

                            slug:
                                slug,

                            phone:
                                phone
                                || null,

                            active:
                                true
                        })
                    }
                );


            const storeRows =
                await createStoreResponse
                    .json()
                    .catch(
                        () => []
                    );


            if (
                !createStoreResponse.ok
                ||
                !Array.isArray(storeRows)
                ||
                storeRows.length === 0
            ) {

                console.error(
                    "Error creando store:",
                    storeRows
                );


                await eliminarUsuarioCreado();


                return Response.json(
                    {
                        ok: false,
                        message:
                            "No se pudo crear el comercio."
                    },
                    {
                        status: 500
                    }
                );
            }


            const store =
                storeRows[0];


            // ==========================================
            // CREAR MEMBRESÍA OWNER
            // ==========================================

            const memberResponse =
                await fetch(
                    `${supabaseUrl}/rest/v1/store_members`,
                    {
                        method: "POST",

                        headers: {

                            "apikey":
                                serviceRoleKey,

                            "Authorization":
                                `Bearer ${serviceRoleKey}`,

                            "Content-Type":
                                "application/json",

                            "Prefer":
                                "return=minimal"
                        },

                        body: JSON.stringify({

                            store_id:
                                store.id,

                            user_id:
                                ownerUserId,

                            role:
                                "owner",

                            active:
                                true
                        })
                    }
                );


            if (!memberResponse.ok) {

                const memberError =
                    await memberResponse
                        .text();


                console.error(
                    "Error creando store_member:",
                    memberError
                );


                // ======================================
                // REVERTIR STORE
                // ======================================

                const deleteStoreResponse =
                    await fetch(
                        `${supabaseUrl}/rest/v1/stores?id=eq.${
                            encodeURIComponent(
                                store.id
                            )
                        }`,
                        {
                            method: "DELETE",

                            headers: {

                                "apikey":
                                    serviceRoleKey,

                                "Authorization":
                                    `Bearer ${serviceRoleKey}`
                            }
                        }
                    );


                if (!deleteStoreResponse.ok) {

                    console.error(
                        "No se pudo revertir store:",
                        await deleteStoreResponse.text()
                    );
                }


                await eliminarUsuarioCreado();


                return Response.json(
                    {
                        ok: false,
                        message:
                            "No se pudo asociar el propietario al comercio."
                    },
                    {
                        status: 500
                    }
                );
            }


// ==========================================
// CREAR CATEGORÍA INICIAL
// ==========================================

const categoryResponse =
    await fetch(
        `${supabaseUrl}/rest/v1/categories`,
        {
            method: "POST",

            headers: {

                "apikey":
                    serviceRoleKey,

                "Authorization":
                    `Bearer ${serviceRoleKey}`,

                "Content-Type":
                    "application/json",

                "Prefer":
                    "return=minimal"
            },

            body: JSON.stringify({

                store_id:
                    store.id,

                name:
                    "General",

                slug:
                    "general",

                active:
                    true
            })
        }
    );


if (!categoryResponse.ok) {

    const categoryError =
        await categoryResponse.text();


    console.error(
        "Error creando categoría inicial:",
        categoryError
    );


    // ======================================
    // REVERTIR STORE
    // ======================================

    const deleteStoreResponse =
        await fetch(
            `${supabaseUrl}/rest/v1/stores?id=eq.${
                encodeURIComponent(
                    store.id
                )
            }`,
            {
                method: "DELETE",

                headers: {

                    "apikey":
                        serviceRoleKey,

                    "Authorization":
                        `Bearer ${serviceRoleKey}`
                }
            }
        );


    if (!deleteStoreResponse.ok) {

        console.error(
            "No se pudo revertir store:",
            await deleteStoreResponse.text()
        );
    }


    await eliminarUsuarioCreado();


    return Response.json(
        {
            ok: false,
            message:
                "No se pudo crear la categoría inicial del comercio."
        },
        {
            status: 500
        }
    );
}

            // ==========================================
            // ALTA COMPLETADA
            // ==========================================

            console.log(
                "Comercio creado:",
                JSON.stringify({
                    store_id:
                        store.id,

                    slug:
                        store.slug,

                    owner_user_id:
                        ownerUserId,

                    created_by:
                        currentUser.id
                })
            );


            return Response.json({

                ok:
                    true,

                message:
                    "Comercio creado correctamente ✅",

                store: {

                    id:
                        store.id,

                    name:
                        store.name,

                    slug:
                        store.slug,

                    phone:
                        store.phone
                        ?? null
                },

                owner: {

                    id:
                        ownerUserId,

                    email:
                        ownerEmail
                }
            });

        }
    )
};