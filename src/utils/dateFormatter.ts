/**
 * Formatea cadenas de fecha (YYYY-MM-DD o ISO) a formato DD/MM/AAAA (es-AR)
 */
export const formatDateDisplay = (dateStr?: string | Date | null): string => {
    if (!dateStr || dateStr === '-') return '-';
    if (dateStr instanceof Date) {
        return dateStr.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    const str = String(dateStr).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
        const [year, month, day] = str.split('T')[0].split('-');
        return `${day}/${month}/${year}`;
    }
    return str;
};
