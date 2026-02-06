/**
 * Normalizes various deadline string formats into a Date object.
 * Supported formats:
 * - DD/MM/YYYY
 * - YYYY-MM-DD
 * - ISO Date string
 * Returns null for "Vô thời hạn", empty strings, or invalid dates.
 */
export function parseNormalizedDeadline(deadline: any): Date | null {
    if (!deadline || deadline === "Vô thời hạn") return null;

    if (deadline instanceof Date) return deadline;

    const str = String(deadline).trim();
    if (!str) return null;

    // DD/MM/YYYY
    const dmyMatch = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dmyMatch) {
        const [_, day, month, year] = dmyMatch;
        // Convert to YYYY-MM-DD for constructor
        const date = new Date(`${year}-${month}-${day}T00:00:00+07:00`);
        return isNaN(date.getTime()) ? null : date;
    }

    // YYYY-MM-DD
    const ymdMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymdMatch) {
        const date = new Date(`${str}T00:00:00+07:00`);
        return isNaN(date.getTime()) ? null : date;
    }

    // Try parsing as generic date
    const fallbackDate = new Date(str);
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
}

/**
 * Returns the start of today in Asia/Ho_Chi_Minh timezone as a Date object.
 */
export function getStartOfToday(): Date {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
    return new Date(`${dateStr}T00:00:00+07:00`);
}
