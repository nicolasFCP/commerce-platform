import {
    createClient
} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';


const SUPABASE_URL =
    'https://qofuycxjitbeikyqrqur.supabase.co';


const SUPABASE_PUBLISHABLE_KEY =
    'sb_publishable_XzjQSozZyTNwyDy0ZB72lQ_PhtD20a4';


// ======================================================
// ADMINISTRADOR DEL COMERCIO
// ======================================================

export const supabaseAdmin = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            storageKey:
                'commerce-platform-admin-auth',

            persistSession: true,

            autoRefreshToken: true,

            detectSessionInUrl: true
        }
    }
);


// ======================================================
// DOMICILIARIO
// ======================================================

export const supabaseDelivery = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            storageKey:
                'commerce-platform-delivery-auth',

            persistSession: true,

            autoRefreshToken: true,

            detectSessionInUrl: true
        }
    }
);


// ======================================================
// PLATFORM ADMIN
// ======================================================

export const supabasePlatform = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            storageKey:
                'commerce-platform-platform-auth',

            persistSession: true,

            autoRefreshToken: true,

            detectSessionInUrl: true
        }
    }
);


// ======================================================
// CLIENTE PÚBLICO / CATÁLOGO
// ======================================================

export const supabasePublic = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            storageKey:
                'commerce-platform-public',

            persistSession: false,

            autoRefreshToken: false,

            detectSessionInUrl: false
        }
    }
);


// ======================================================
// COMPATIBILIDAD TEMPORAL
// ======================================================
//
// Mientras cambiamos archivo por archivo,
// "supabase" seguirá apuntando al cliente del admin.
// Luego eliminaremos este alias.
//

export const supabase =
    supabaseAdmin;