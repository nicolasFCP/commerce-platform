import "jsr:@supabase/functions-js/edge-runtime.d.ts";


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


    const text =
        messageType === "text"
            ? message?.text?.body ?? null
            : null;


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