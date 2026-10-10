import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
process.env.NEXT_PUBLIC_SUPABASE_URL ||
"https://amequpgspnrxhglsdpsm.supabase.co";

const supabaseKey =
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
"sb_publishable_-Zd8hvcp9wj3M0BLjDqdrA_ZQ9u5ERn";

export const supabase = createClient(supabaseUrl, supabaseKey);
