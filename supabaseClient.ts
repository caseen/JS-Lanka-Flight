
import { createClient } from "@supabase/supabase-js";

// REPLACE THESE WITH YOUR ACTUAL SUPABASE PROJECT DETAILS
const SUPABASE_URL = "https://fdhfkaqpjabwwipznrqt.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_uCb2Pd0PWEcuM14Jy3m7LQ_VIvO7oxB";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
