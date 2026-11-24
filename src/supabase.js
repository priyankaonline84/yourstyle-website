import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseReady = Boolean(url && key && !url.includes("YOUR_PROJECT_REF") && !key.includes("YOUR_SUPABASE"));
export const supabase = supabaseReady ? createClient(url, key) : null;
export const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");

export function whatsappLink(product) {
  const message = `Hello YourStyle! I am interested in ${product.name}${product.sku ? ` (SKU: ${product.sku})` : ""}${product.price != null ? `, priced at ₹${product.price}` : ""}. Please share more details.`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
