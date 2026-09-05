import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

export default {
    fetch: withSupabase(
        { auth: "user" },

        async (req, ctx) => {

            // ==========================================
            // CREDENCIALES SEGURAS
            // ==========================================

            const accessToken =
                Deno.env.get("WHATSAPP_ACCESS_TOKEN");

            const phoneNumberId =
                Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");


            if (!accessToken || !phoneNumberId) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "Faltan credenciales de WhatsApp."
                    },
                    {
                        status: 500
                    }
                );

            }


            // ==========================================
            // RECIBIR SOLO EL ID DEL PEDIDO
            // ==========================================

            const body =
                await req.json().catch(
                    () => ({})
                );


            const orderId =
                String(
                    body.order_id ?? ""
                ).trim();


            if (!orderId) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "Falta order_id."
                    },
                    {
                        status: 400
                    }
                );

            }


            // ==========================================
            // BUSCAR PEDIDO RESPETANDO RLS
            // ==========================================

            const {
                data: order,
                error: orderError
            } = await ctx.supabase
                .from("orders")
                .select(`
                    id,
                    customer_name,
                    customer_phone,
                    status,
                    fulfillment_type
                `)
                .eq("id", orderId)
                .maybeSingle();


            if (orderError) {

                console.error(
                    "Error buscando pedido:",
                    orderError
                );


                return Response.json(
                    {
                        ok: false,
                        message:
                            "No se pudo consultar el pedido."
                    },
                    {
                        status: 500
                    }
                );

            }


            if (!order) {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "Pedido no encontrado o no autorizado."
                    },
                    {
                        status: 404
                    }
                );

            }


            // ==========================================
            // SOLO PEDIDOS ACEPTADOS
            // ==========================================

            if (order.status !== "accepted") {

                return Response.json(
                    {
                        ok: false,
                        message:
                            "El pedido todavía no está aceptado."
                    },
                    {
                        status: 400
                    }
                );

            }


            // ==========================================
            // NORMALIZAR TELÉFONO
            // ==========================================

            let recipient =
                String(
                    order.customer_phone ?? ""
                ).replace(/\D/g, "");


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
                            "El pedido no tiene teléfono."
                    },
                    {
                        status: 400
                    }
                );

            }


            // ==========================================
            // DATOS REALES DEL PEDIDO
            // ==========================================

            const customerName =
                order.customer_name
                ?? "Cliente";


            const orderNumber =
                `CP-${
                    order.id
                        .slice(0, 8)
                        .toUpperCase()
                }`;


            const estimatedDelivery =
                new Intl.DateTimeFormat(
                    "en-US",
                    {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        timeZone:
                            "America/Bogota"
                    }
                ).format(
                    new Date()
                );


            // ==========================================
            // ENVIAR A META
            // ==========================================

            const metaResponse =
                await fetch(
                    `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`,
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

                            to:
                                recipient,

                            type:
                                "template",

                            template: {

                                name:
                                    "jaspers_market_order_confirmation_v1",

                                language: {
                                    code: "en_US"
                                },

                                components: [
                                    {
                                        type: "body",

                                        parameters: [
                                            {
                                                type: "text",
                                                text:
                                                    customerName
                                            },
                                            {
                                                type: "text",
                                                text:
                                                    orderNumber
                                            },
                                            {
                                                type: "text",
                                                text:
                                                    estimatedDelivery
                                            }
                                        ]
                                    }
                                ]
                            }
                        })
                    }
                );


            const metaData =
                await metaResponse.json();


            if (!metaResponse.ok) {

                console.error(
                    "Error Meta:",
                    JSON.stringify(metaData)
                );


                return Response.json(
                    {
                        ok: false,
                        message:
                            "Meta rechazó el envío.",

                        meta_error:
                            metaData?.error?.message
                            ?? null
                    },
                    {
                        status:
                            metaResponse.status
                    }
                );

            }


            return Response.json({
                ok: true,

                message:
                    "WhatsApp del pedido enviado ✅",

                order_id:
                    order.id,

                message_id:
                    metaData?.messages?.[0]?.id
                    ?? null
            });

        }
    )
};