import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import {
    createClient
} from "npm:@supabase/supabase-js@2";


// ==========================================
// CONVERTIR BYTES A HEXADECIMAL
// ==========================================

function bytesToHex(
    bytes: Uint8Array
) {

    return Array.from(bytes)
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(2, "0")
        )
        .join("");

}


// ==========================================
// COMPARACIÓN SEGURA
// ==========================================

function safeCompare(
    valueA: string,
    valueB: string
) {

    if (valueA.length !== valueB.length) {
        return false;
    }


    let result = 0;


    for (
        let i = 0;
        i < valueA.length;
        i++
    ) {

        result |=
            valueA.charCodeAt(i)
            ^
            valueB.charCodeAt(i);

    }


    return result === 0;

}


// ==========================================
// VALIDAR FIRMA DE META
// ==========================================

async function verifyMetaSignature(
    rawBody: string,
    signatureHeader: string,
    appSecret: string
) {

    if (
        !signatureHeader.startsWith(
            "sha256="
        )
    ) {

        return false;

    }


    const receivedSignature =
        signatureHeader.substring(7);


    const encoder =
        new TextEncoder();


    const key =
        await crypto.subtle.importKey(
            "raw",
            encoder.encode(appSecret),
            {
                name: "HMAC",
                hash: "SHA-256"
            },
            false,
            ["sign"]
        );


    const signatureBuffer =
        await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(rawBody)
        );


    const expectedSignature =
        bytesToHex(
            new Uint8Array(
                signatureBuffer
            )
        );


    return safeCompare(
        expectedSignature,
        receivedSignature
    );

}


// ==========================================
// EDGE FUNCTION
// ==========================================

export default {

    async fetch(req: Request) {

        const verifyToken =
            Deno.env.get(
                "WHATSAPP_WEBHOOK_VERIFY_TOKEN"
            );


        const metaAppSecret =
            Deno.env.get(
                "META_APP_SECRET"
            );

const whatsappAccessToken =
    Deno.env.get(
        "WHATSAPP_ACCESS_TOKEN"
    );

        // ==================================
        // VERIFICAR CONFIGURACIÓN
        // ==================================

        if (!verifyToken) {

            console.error(
                "Falta WHATSAPP_WEBHOOK_VERIFY_TOKEN"
            );


            return new Response(
                "Webhook no configurado",
                {
                    status: 500
                }
            );

        }


        // ==================================
        // META VERIFICA WEBHOOK CON GET
        // ==================================

        if (req.method === "GET") {

            const url =
                new URL(req.url);


            const mode =
                url.searchParams.get(
                    "hub.mode"
                );


            const token =
                url.searchParams.get(
                    "hub.verify_token"
                );


            const challenge =
                url.searchParams.get(
                    "hub.challenge"
                );


            if (
                mode === "subscribe"
                &&
                token === verifyToken
                &&
                challenge
            ) {

                console.log(
                    "Webhook verificado correctamente"
                );


                return new Response(
                    challenge,
                    {
                        status: 200,
                        headers: {
                            "Content-Type":
                                "text/plain"
                        }
                    }
                );

            }


            return new Response(
                "Verificación rechazada",
                {
                    status: 403
                }
            );

        }


        // ==================================
        // META ENVÍA EVENTOS CON POST
        // ==================================

        if (req.method === "POST") {

            if (!metaAppSecret) {

                console.error(
                    "Falta META_APP_SECRET"
                );


                return new Response(
                    "Webhook no configurado",
                    {
                        status: 500
                    }
                );

            }


            const signatureHeader =
                req.headers.get(
                    "x-hub-signature-256"
                );


            if (!signatureHeader) {

                console.error(
                    "POST rechazado: falta firma de Meta"
                );


                return new Response(
                    "Firma requerida",
                    {
                        status: 401
                    }
                );

            }


            // IMPORTANTE:
            // primero obtenemos el cuerpo ORIGINAL
            // antes de convertirlo a JSON.

            const rawBody =
                await req.text();


            const signatureValid =
                await verifyMetaSignature(
                    rawBody,
                    signatureHeader,
                    metaAppSecret
                );


            if (!signatureValid) {

                console.error(
                    "POST rechazado: firma inválida"
                );


                return new Response(
                    "Firma inválida",
                    {
                        status: 401
                    }
                );

            }


            // ==================================
            // FIRMA CORRECTA
            // ==================================

            let body;


            try {

                body =
                    JSON.parse(rawBody);

            } catch {

                return new Response(
                    "JSON inválido",
                    {
                        status: 400
                    }
                );

            }


            console.log(
                "Evento WhatsApp firmado y válido:",
                JSON.stringify(body)
            );

            // ==================================
// EXTRAER MENSAJE ENTRANTE
// ==================================

const change =
    body?.entry?.[0]
        ?.changes?.[0];


const value =
    change?.value;


const message =
    value?.messages?.[0];


const contact =
    value?.contacts?.[0];


if (message) {

    const senderPhone =
        message.from ?? null;


    const messageType =
        message.type ?? null;


    const senderName =
        contact?.profile?.name
        ?? null;

        const businessPhoneNumberId =
    value?.metadata?.phone_number_id
    ?? null;


const whatsappBusinessAccountId =
    body?.entry?.[0]?.id
    ?? null;


    // ==================================
// CLIENTE INTERNO DE SUPABASE
// ==================================

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

    console.error(
        "Faltan credenciales internas de Supabase"
    );


    return new Response(
        "Error de configuración",
        {
            status: 500
        }
    );

}


const supabaseAdmin =
    createClient(
        supabaseUrl,
        serviceRoleKey,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        }
    );


// ==================================
// IDENTIFICAR EL COMERCIO
// ==================================

const {
    data: whatsappSettings,
    error: whatsappSettingsError
} = await supabaseAdmin
    .from(
        "store_whatsapp_settings"
    )
    .select(`
        store_id,
        display_phone_number,
        active
    `)
    .eq(
        "phone_number_id",
        businessPhoneNumberId
    )
    .eq(
        "active",
        true
    )
    .maybeSingle();


if (whatsappSettingsError) {

    console.error(
        "Error identificando comercio:",
        whatsappSettingsError
    );


    return new Response(
        "Error interno",
        {
            status: 500
        }
    );

}


if (!whatsappSettings) {

    console.warn(
        "WhatsApp recibido para un número no asociado:",
        businessPhoneNumberId
    );

} else {

    console.log(
        "Comercio identificado:",
        JSON.stringify({
            store_id:
                whatsappSettings.store_id,

            phone_number_id:
                businessPhoneNumberId,

            display_phone_number:
                whatsappSettings.display_phone_number
        })
    );

}    


    const text =
        messageType === "text"
            ? message?.text?.body ?? null
            : null;

    // ==================================
// CREAR O ACTUALIZAR CONVERSACIÓN
// ==================================

let conversationId =
    null;


let humanHandoffRequested =
    false;


if (
    whatsappSettings
    &&
    senderPhone
) {

    const now =
        new Date().toISOString();


    const {
        data: conversation,
        error: conversationError
    } = await supabaseAdmin
        .from(
            "whatsapp_conversations"
        )
        .upsert(
            {
                store_id:
                    whatsappSettings.store_id,

                customer_phone:
                    senderPhone,

                customer_name:
                    senderName,

                last_message_at:
                    now,

                updated_at:
                    now,

                active:
                    true
            },
            {
                onConflict:
                    "store_id,customer_phone"
            }
        )
        .select(
    "id,human_handoff_requested"
)
        .single();


    if (conversationError) {

        console.error(
            "Error guardando conversación WhatsApp:",
            conversationError
        );


        return new Response(
            "Error interno",
            {
                status: 500
            }
        );

    }


    conversationId =
        conversation.id;

    humanHandoffRequested =
    conversation.human_handoff_requested
    ?? false;    


    console.log(
        "Conversación WhatsApp identificada:",
        JSON.stringify({
            conversation_id:
                conversationId,

            store_id:
                whatsappSettings.store_id,

            customer_phone:
                senderPhone
        })
    );

}        

// ==================================
// GUARDAR MENSAJE ENTRANTE
// ==================================

if (
    whatsappSettings
    &&
    conversationId
    &&
    message?.id
) {

    const {
        data: savedMessage,
        error: messageSaveError
    } = await supabaseAdmin
        .from(
            "whatsapp_messages"
        )
        .upsert(
            {
                store_id:
                    whatsappSettings.store_id,

                conversation_id:
                    conversationId,

                whatsapp_message_id:
                    message.id,

                direction:
                    "incoming",

                message_type:
                    messageType ?? "unknown",

                message_text:
                    text,

                sender_phone:
                    senderPhone,

                recipient_phone:
                    whatsappSettings.display_phone_number,

                message_status:
                    "received",

                raw_payload:
                    body
            },
            {
                onConflict:
                    "whatsapp_message_id"
            }
        )
        .select(
            "id"
        )
        .single();


    if (messageSaveError) {

        console.error(
            "Error guardando mensaje WhatsApp:",
            messageSaveError
        );


        return new Response(
            "Error interno",
            {
                status: 500
            }
        );

    }


    console.log(
        "Mensaje WhatsApp guardado:",
        JSON.stringify({
            message_id:
                savedMessage.id,

            conversation_id:
                conversationId,

            whatsapp_message_id:
                message.id
        })
    );

}

// ==================================
// ENVIAR RESPUESTA AUTOMÁTICA
// ==================================



    const normalizedText =
    (text ?? "")
        .trim()
        .toLowerCase();


let automaticReply: string | null =
    null;

if (humanHandoffRequested) {

    console.log(
        "Respuesta automática omitida: conversación en atención humana",
        conversationId
    );


} else if (normalizedText === "1") {


    automaticReply =
        "🛒 Puedes ver nuestros productos aquí:\n\n" +
        "https://nicolasfcp.github.io/commerce-platform/demo.html";


} else if (normalizedText === "2") {

    automaticReply =
        "📦 Claro. Envíame el número de tu pedido para consultarlo.\n\n" +
        "Ejemplo: CP-12345678";


} else if (
    /^cp-[0-9a-f]{8}$/i.test(
        normalizedText
    )
) {

    const orderPrefix =
        normalizedText
            .substring(3)
            .toLowerCase();


    const lowerOrderId =
        `${orderPrefix}-0000-0000-0000-000000000000`;


    const upperOrderId =
        `${orderPrefix}-ffff-ffff-ffff-ffffffffffff`;


    const {
        data: candidateOrders,
        error: orderLookupError
    } = await supabaseAdmin
        .from("orders")
        .select(`
            id,
            customer_phone,
            status,
            fulfillment_type
        `)
        .eq(
            "store_id",
            whatsappSettings.store_id
        )
        .gte(
            "id",
            lowerOrderId
        )
        .lte(
            "id",
            upperOrderId
        )
        .limit(10);


    if (orderLookupError) {

        console.error(
            "Error consultando pedido por WhatsApp:",
            orderLookupError
        );


        automaticReply =
            "⚠️ No pude consultar tu pedido en este momento. Intenta nuevamente.";

    } else {

        const normalizePhone =
            (phone: string | null) =>
                (phone ?? "")
                    .replace(/\D/g, "")
                    .slice(-10);


        const customerOrder =
            (candidateOrders ?? [])
                .find(
                    order =>
                        normalizePhone(
                            order.customer_phone
                        )
                        ===
                        normalizePhone(
                            senderPhone
                        )
                );


        if (!customerOrder) {

            automaticReply =
                "🔎 No encontré ese pedido asociado a este número de WhatsApp.\n\n" +
                "Revisa el número e inténtalo nuevamente.";

        } else {

            const statusLabels: Record<string, string> = {
                pending: "Pendiente",
                accepted: "Aceptado ✅",
                preparing: "En preparación 👨‍🍳",
                ready: "Listo para entregar 📦",
                out_for_delivery: "En camino 🛵",
                completed: "Entregado ✅",
                cancelled: "Cancelado"
            };


            const orderNumber =
                `CP-${
                    customerOrder.id
                        .slice(0, 8)
                        .toUpperCase()
                }`;


            const statusLabel =
                statusLabels[
                    customerOrder.status
                ]
                ??
                customerOrder.status;


            automaticReply =
                `📦 Pedido ${orderNumber}\n\n` +
                `Estado: ${statusLabel}`;

        }

    }

} else if (normalizedText === "3") {

    const handoffNow =
        new Date().toISOString();


    const {
        error: handoffError
    } = await supabaseAdmin
        .from(
            "whatsapp_conversations"
        )
        .update({
            human_handoff_requested:
                true,

            human_handoff_requested_at:
                handoffNow,

            human_handoff_resolved_at:
                null,

            updated_at:
                handoffNow
        })
        .eq(
            "id",
            conversationId
        );


    if (handoffError) {

        console.error(
            "Error activando atención humana:",
            handoffError
        );


        automaticReply =
            "⚠️ No pude solicitar atención de la tienda en este momento.";

    } else {

        humanHandoffRequested =
            true;


        automaticReply =
            "👤 Perfecto. La tienda continuará atendiendo tu conversación.";

    }

} else {

    automaticReply =
        "¡Hola! 👋 Bienvenido.\n\n" +
        "¿En qué podemos ayudarte?\n\n" +
        "1. 🛒 Ver productos\n" +
        "2. 📦 Consultar mi pedido\n" +
        "3. 👤 Hablar con la tienda\n\n" +
        "Responde con 1, 2 o 3.";

}

if (
    whatsappSettings
    &&
    conversationId
    &&
    whatsappAccessToken
    &&
    businessPhoneNumberId
    &&
    senderPhone
    &&
    messageType === "text"
    &&
    automaticReply
) {

    const metaResponse =
        await fetch(
            `https://graph.facebook.com/v25.0/${businessPhoneNumberId}/messages`,
            {
                method: "POST",

                headers: {
                    "Authorization":
                        `Bearer ${whatsappAccessToken}`,

                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    messaging_product:
                        "whatsapp",

                    to:
                        senderPhone,

                    type:
                        "text",

                    text: {
                        body:
                            automaticReply
                    }

                })
            }
        );


    const metaData =
        await metaResponse.json();


    if (!metaResponse.ok) {

        console.error(
            "Error enviando respuesta automática:",
            JSON.stringify(metaData)
        );


        return new Response(
            "Error enviando respuesta automática",
            {
                status:
                    metaResponse.status
            }
        );

    }


// ==================================
// GUARDAR MENSAJE SALIENTE
// ==================================

const outgoingMessageId =
    metaData?.messages?.[0]?.id
    ?? null;


if (outgoingMessageId) {

    const {
        data: savedOutgoingMessage,
        error: outgoingSaveError
    } = await supabaseAdmin
        .from(
            "whatsapp_messages"
        )
        .upsert(
            {
                store_id:
                    whatsappSettings.store_id,

                conversation_id:
                    conversationId,

                whatsapp_message_id:
                    outgoingMessageId,

                direction:
                    "outgoing",

                message_type:
                    "text",

                message_text:
                    automaticReply,

                sender_phone:
                    whatsappSettings.display_phone_number,

                recipient_phone:
                    senderPhone,

                message_status:
                    "accepted",

                raw_payload:
                    metaData
            },
            {
                onConflict:
                    "whatsapp_message_id"
            }
        )
        .select(
            "id"
        )
        .single();


    if (outgoingSaveError) {

        console.error(
            "Error guardando mensaje saliente WhatsApp:",
            outgoingSaveError
        );


        return new Response(
            "Error guardando respuesta",
            {
                status: 500
            }
        );

    }


    console.log(
        "Mensaje saliente WhatsApp guardado:",
        JSON.stringify({
            message_id:
                savedOutgoingMessage.id,

            conversation_id:
                conversationId,

            whatsapp_message_id:
                outgoingMessageId
        })
    );

}

    console.log(
        "Respuesta automática enviada:",
        JSON.stringify({
            recipient:
                senderPhone,

            whatsapp_message_id:
                metaData?.messages?.[0]?.id
                ?? null
        })
    );

}

    console.log(
        "Mensaje entrante procesado:",
        JSON.stringify({
            
            business_phone_number_id:
    businessPhoneNumberId,

whatsapp_business_account_id:
    whatsappBusinessAccountId,
            
            sender_phone:
                senderPhone,

            sender_name:
                senderName,

            message_type:
                messageType,

            text:
                text,

            whatsapp_message_id:
                message.id ?? null
        })
    );

}


            return new Response(
                "EVENT_RECEIVED",
                {
                    status: 200
                }
            );

        }


        // ==================================
        // OTROS MÉTODOS
        // ==================================

        return new Response(
            "Método no permitido",
            {
                status: 405
            }
        );

    }

};