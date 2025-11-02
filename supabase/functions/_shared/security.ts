/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string, maxLength: number = 500): string {
  if (!input) return '';
  
  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength);
  
  // Remove control characters but keep basic formatting
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitized;
}

/**
 * Escape SQL wildcards for ILIKE queries
 */
export function escapeSqlWildcards(input: string): string {
  return input.replace(/[%_]/g, '\\$&');
}

/**
 * Escape XML/HTML special characters
 */
export function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Validate phone number format (E.164)
 */
export function validatePhone(phone: string): boolean {
  // E.164 format: +[country code][number] (max 15 digits)
  return /^\+[1-9]\d{1,14}$/.test(phone);
}

/**
 * Normalize phone number to E.164 format
 */
export function normalizePhone(phone: string): string {
  // Remove all non-digit characters except leading +
  const cleaned = phone.replace(/[^\\d+]/g, '');
  
  // Ensure it starts with +
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

/**
 * Generic error response for edge functions
 */
export function errorResponse(message: string = "An error occurred", status: number = 500) {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Success JSON response
 */
export function jsonResponse(data: any, options: { status?: number } = {}) {
  return new Response(
    JSON.stringify(data),
    { 
      status: options.status || 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
