import QRCode from 'qrcode';

/**
 * Generates a QR code as a base64 data URL.
 * @param text The text to encode in the QR code.
 * @returns A promise that resolves to the data URL.
 */
export const generateQRCodeDataURL = async (text: string): Promise<string> => {
    try {
        return await QRCode.toDataURL(text, {
            margin: 2,
            width: 300,
            color: {
                dark: '#1a5f7a', // Match theme primary
                light: '#ffffff'
            }
        });
    } catch (err) {
        console.error('Error generating QR code:', err);
        return '';
    }
};
