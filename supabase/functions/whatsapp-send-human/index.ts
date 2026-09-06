import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";


export default {

    fetch: withSupabase(
        { auth: "user" },

        async (req, ctx) => {

            // ==========================================
            // CREDENCIALES SEGURAS DEL BACKEND
            // ==========================================

            const accessToken =
                Deno.env.get(
                    "WHATSAPP_ACCESS_TOKEN"
                );

            const supabaseUrl =
                Deno.env.get(
                    "SUPABASE_URL"
                );

            const serviceRoleKey =
                Deno.env.get(
                    "SUPABASE_SERVICE_ROLE_KEY"
                );


            if (
                !accessToken
                ||
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
            // RECIBIR DATOS DEL PANEL
            // ==========================================

            const body =
                await req.json().catch(
                    () => ({})
                );


            const conversationId =
                String(
                    body.conversation_id
                    ?? ""
                ).trim();


            const messageText =
                String(
                    body.message
                    ?? ""
                ).trim();


            if (!conversationId) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "Falta conversation_id."
                    },
                    {
                        status: 400
                    }
                );
            }


            if (!messageText) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "El mensaje está vacío."
                    },
                    {
                        status: 400
                    }
                );
            }


            if (
                messageText.length > 4000
            ) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "El mensaje es demasiado largo."
                    },
                    {
                        status: 400
                    }
                );
            }


            // ==========================================
            // BUSCAR CONVERSACIÓN RESPETANDO RLS
            // ==========================================

            const {
                data: conversation,
                error: conversationError
            } = await ctx.supabase
                .from(
                    "whatsapp_conversations"
                )
                .select(`
                    id,
                    store_id,
                    customer_phone,
                    human_handoff_requested
                `)
                .eq(
                    "id",
                    conversationId
                )
                .maybeSingle();


            if (conversationError) {

                console.error(
                    "Error consultando conversación:",
                    conversationError
                );


                return Response.json(
                    {
                        ok: false,
                        message:
                            "No se pudo consultar la conversación."
                    },
                    {
                        status: 500
                    }
                );
            }


            if (!conversation) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "Conversación no encontrada o no autorizada."
                    },
                    {
                        status: 404
                    }
                );
            }


            // ==========================================
            // SOLO DURANTE ATENCIÓN HUMANA
            // ==========================================

            if (
                conversation
                    .human_handoff_requested
                !== true
            ) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "Esta conversación no está en atención humana."
                    },
                    {
                        status: 400
                    }
                );
            }


            // ==========================================
            // CONFIGURACIÓN WHATSAPP DEL COMERCIO
            // ==========================================

            const {
                data: whatsappSettings,
                error: settingsError
            } = await ctx.supabase
                .from(
                    "store_whatsapp_settings"
                )
                .select(`
                    phone_number_id,
                    display_phone_number,
                    active
                `)
                .eq(
                    "store_id",
                    conversation.store_id
                )
                .eq(
                    "active",
                    true
                )
                .maybeSingle();


            if (settingsError) {

                console.error(
                    "Error consultando configuración WhatsApp:",
                    settingsError
                );


                return Response.json(
                    {
                        ok: false,
                        message:
                            "No se pudo consultar la configuración de WhatsApp."
                    },
                    {
                        status: 500
                    }
                );
            }


            if (
                !whatsappSettings
                ||
                !whatsappSettings
                    .phone_number_id
            ) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "El comercio no tiene WhatsApp configurado."
                    },
                    {
                        status: 400
                    }
                );
            }


            // ==========================================
            // NORMALIZAR TELÉFONO DEL CLIENTE
            // ==========================================

            let recipient =
                String(
                    conversation
                        .customer_phone
                    ?? ""
                ).replace(
                    /\D/g,
                    ""
                );


            if (
                recipient.length === 10
                &&
                recipient.startsWith("3")
            ) {

                recipient =
                    `57${recipient}`;
            }


            if (!recipient) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "La conversación no tiene teléfono válido."
                    },
                    {
                        status: 400
                    }
                );
            }


            // ==========================================
            // ENVIAR MENSAJE DE TEXTO A META
            // ==========================================

            const metaResponse =
                await fetch(
                    `https://graph.facebook.com/v25.0/${
                        whatsappSettings
                            .phone_number_id
                    }/messages`,
                    {
                        method: "POST",

                        headers: {

                            "Authorization":
                                `Bearer ${accessToken}`,

                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            messaging_product:
                                "whatsapp",

                            recipient_type:
                                "individual",

                            to:
                                recipient,

                            type:
                                "text",

                            text: {

                                preview_url:
                                    false,

                                body:
                                    messageText
                            }
                        })
                    }
                );


            const metaData =
                await metaResponse
                    .json()
                    .catch(
                        () => ({})
                    );


            if (!metaResponse.ok) {

                console.error(
                    "Meta rechazó mensaje humano:",
                    JSON.stringify(
                        metaData
                    )
                );


                return Response.json(
                    {
                        ok: false,

                        message:
                            "Meta rechazó el mensaje.",

                        meta_error:
                            metaData
                                ?.error
                                ?.message
                            ?? null
                    },
                    {
                        status:
                            metaResponse.status
                    }
                );
            }


            const whatsappMessageId =
                metaData
                    ?.messages
                    ?.[0]
                    ?.id
                ?? null;


            if (!whatsappMessageId) {

                console.error(
                    "Meta no devolvió message id:",
                    metaData
                );


                return Response.json(
                    {
                        ok: false,
                        message:
                            "WhatsApp aceptó la solicitud pero no devolvió identificador del mensaje."
                    },
                    {
                        status: 502
                    }
                );
            }


            // ==========================================
            // GUARDAR RESPUESTA COMO OUTGOING
            // ==========================================

            const saveResponse =
                await fetch(
                    `${supabaseUrl}/rest/v1/whatsapp_messages`,
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
                                conversation.store_id,

                            conversation_id:
                                conversation.id,

                            order_id:
                                null,

                            whatsapp_message_id:
                                whatsappMessageId,

                            direction:
                                "outgoing",

                            message_type:
                                "text",

                            message_text:
                                messageText,

                            sender_phone:
                                whatsappSettings
                                    .display_phone_number
                                ?? null,

                            recipient_phone:
                                recipient,

                            message_status:
                                "accepted",

                            raw_payload:
                                metaData
                        })
                    }
                );


            if (!saveResponse.ok) {

                const saveError =
                    await saveResponse
                        .text()
                        .catch(
                            () => ""
                        );


                console.error(
                    "Mensaje enviado pero no guardado:",
                    saveError
                );


                return Response.json(
                    {
                        ok: true,

                        sent:
                            true,

                        saved:
                            false,

                        warning:
                            "El mensaje fue enviado a WhatsApp, pero no pudo registrarse en Commerce Platform.",

                        message_id:
                            whatsappMessageId
                    }
                );
            }


            console.log(
                "Respuesta humana WhatsApp enviada:",
                JSON.stringify({
                    conversation_id:
                        conversation.id,

                    whatsapp_message_id:
                        whatsappMessageId
                })
            );


            return Response.json({

                ok:
                    true,

                sent:
                    true,

                saved:
                    true,

                message:
                    "Mensaje enviado correctamente ✅",

                message_id:
                    whatsappMessageId
            });

        }
    )
};