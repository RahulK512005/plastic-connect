import { createClient } from '@supabase/supabase-js';

// Lazy-load Supabase client to avoid environment variable issues
let supabaseInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      throw new Error('Supabase environment variables are not set');
    }
    
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

/**
 * Generate a unique order number
 * Format: PC-YYYYMMDD-XXXXX (e.g., PC-20250216-12345)
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `PC-${dateStr}-${randomNum}`;
}

/**
 * Generate a unique invoice number
 * Format: INV-YYYYMMDD-XXXXX (e.g., INV-20250216-12345)
 */
export function generateInvoiceNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `INV-${dateStr}-${randomNum}`;
}

/**
 * Generate a unique EPR certificate number
 * Format: EPR-YYYYMMDD-XXXXX (e.g., EPR-20250216-12345)
 */
export function generateCertificateNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `EPR-${dateStr}-${randomNum}`;
}

/**
 * Get applicable discount based on quantity and grade
 */
export async function getApplicableDiscount(
  plasticType: string,
  gradeQuality: string,
  quantityKg: number
): Promise<number> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('discount_tiers')
      .select('discount_percentage')
      .eq('plastic_type', plasticType)
      .eq('grade_quality', gradeQuality)
      .lte('min_quantity_kg', quantityKg)
      .or(`max_quantity_kg.is.null,max_quantity_kg.gte.${quantityKg}`)
      .order('discount_percentage', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return 0;
    }

    return data[0].discount_percentage;
  } catch (error) {
    console.error('[v0] Error fetching discount:', error);
    return 0;
  }
}

/**
 * Calculate total amount with discount
 */
export function calculateTotal(
  basePrice: number,
  quantity: number,
  discountPercentage: number
): { baseAmount: number; discountAmount: number; totalAmount: number } {
  const baseAmount = basePrice * quantity;
  const discountAmount = (baseAmount * discountPercentage) / 100;
  const totalAmount = baseAmount - discountAmount;

  return {
    baseAmount: Math.round(baseAmount * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100
  };
}

/**
 * Format currency value in INR
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}
