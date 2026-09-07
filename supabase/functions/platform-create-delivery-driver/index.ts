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
                            "No tienes permiso para crear domiciliarios."
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


            const storeId =
                String(
                    body.store_id
                    ?? ""
                ).trim();


            const driverName =
                String(
                    body.name
                    ?? ""
                ).trim();


            const driverPhone =
                String(
                    body.phone
                    ?? ""
                ).trim();


            const driverEmail =
                String(
                    body.email
                    ?? ""
                )
                    .trim()
                    .toLowerCase();


            const driverPassword =
                String(
                    body.password
                    ?? ""
                );


            // ==========================================
            // VALIDACIONES
            // ==========================================

            if (!storeId) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "Falta seleccionar el comercio."
                    },
                    {
                        status: 400
                    }
                );
            }


            if (!driverName) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "Falta el nombre del domiciliario."
                    },
                    {
                        status: 400
                    }
                );
            }


            if (
                !driverEmail
                ||
                !driverEmail.includes("@")
            ) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "El correo del domiciliario no es válido."
                    },
                    {
                        status: 400
                    }
                );
            }


            if (
                driverPassword.length < 8
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
            // VERIFICAR COMERCIO
            // ==========================================

            const storeResponse =
                await fetch(
                    `${supabaseUrl}/rest/v1/stores?id=eq.${
                        encodeURIComponent(
                            storeId
                        )
                    }&active=eq.true&select=id,name&limit=1`,
                    {
                        headers: {

                            "apikey":
                                serviceRoleKey,

                            "Authorization":
                                `Bearer ${serviceRoleKey}`
                        }
                    }
                );


            if (!storeResponse.ok) {

                console.error(
                    "Error verificando comercio:",
                    await storeResponse.text()
                );


                return Response.json(
                    {
                        ok: false,
                        message:
                            "No se pudo verificar el comercio."
                    },
                    {
                        status: 500
                    }
                );
            }


            const storeRows =
                await storeResponse.json();


            if (
                !Array.isArray(storeRows)
                ||
                storeRows.length === 0
            ) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "El comercio no existe o está inactivo."
                    },
                    {
                        status: 404
                    }
                );
            }


            const store =
                storeRows[0];


            // ==========================================
            // CREAR USUARIO DEL DOMICILIARIO EN AUTH
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
                                driverEmail,

                            password:
                                driverPassword,

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
                    "Error creando usuario domiciliario:",
                    createUserData
                );


                return Response.json(
                    {
                        ok: false,
                        message:
                            "No se pudo crear el usuario del domiciliario.",

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


            const driverUserId =
                createUserData?.id
                ??
                createUserData
                    ?.user
                    ?.id;


            if (!driverUserId) {

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
            // FUNCIÓN AUXILIAR PARA REVERTIR AUTH
            // ==========================================

            async function eliminarUsuarioCreado() {

                const response =
                    await fetch(
                        `${supabaseUrl}/auth/v1/admin/users/${driverUserId}`,
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
            // CREAR REGISTRO DEL DOMICILIARIO
            // ==========================================

            const driverResponse =
                await fetch(
                    `${supabaseUrl}/rest/v1/delivery_drivers`,
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

                            store_id:
                                storeId,

                            user_id:
                                driverUserId,

                            name:
                                driverName,

                            phone:
                                driverPhone
                                || null,

                            active:
                                true
                        })
                    }
                );


            const driverRows =
                await driverResponse
                    .json()
                    .catch(
                        () => []
                    );


            if (
                !driverResponse.ok
                ||
                !Array.isArray(driverRows)
                ||
                driverRows.length === 0
            ) {

                console.error(
                    "Error creando delivery_driver:",
                    driverRows
                );


                await eliminarUsuarioCreado();


                return Response.json(
                    {
                        ok: false,
                        message:
                            "No se pudo asociar el domiciliario al comercio."
                    },
                    {
                        status: 500
                    }
                );
            }


            const driver =
                driverRows[0];


            // ==========================================
            // ALTA COMPLETADA
            // ==========================================

            console.log(
                "Domiciliario creado:",
                JSON.stringify({

                    driver_id:
                        driver.id,

                    user_id:
                        driverUserId,

                    store_id:
                        storeId,

                    created_by:
                        currentUser.id
                })
            );


            return Response.json({

                ok:
                    true,

                message:
                    "Domiciliario creado correctamente ✅",

                driver: {

                    id:
                        driver.id,

                    user_id:
                        driverUserId,

                    name:
                        driver.name,

                    phone:
                        driver.phone
                        ?? null,

                    email:
                        driverEmail
                },

                store: {

                    id:
                        store.id,

                    name:
                        store.name
                }
            });

        }
    )
};