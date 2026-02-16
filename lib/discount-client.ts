/**
 * Client-side discount calculation utility
 * Calls API endpoint to avoid exposing service role key
 */

export async function getApplicableDiscount(
  plasticType: string,
  gradeQuality: string,
  quantityKg: number
): Promise<number> {
  try {
    const response = await fetch('/api/discounts/get-discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plasticType,
        gradeQuality,
        quantityKg
      })
    });

    if (!response.ok) {
      console.error('[v0] Discount API error:', response.status);
      return 0;
    }

    const data = await response.json();
    return data.discount || 0;
  } catch (error) {
    console.error('[v0] Error fetching discount:', error);
    return 0;
  }
}
