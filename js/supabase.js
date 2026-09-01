import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://qofuycxjitbeikyqrqur.supabase.co';

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_XzjQSozZyTNwyDy0ZB72lQ_PhtD20a4';

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);