import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Divider,
    Chip,
    alpha,
    useTheme,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import BadgeIcon from '@mui/icons-material/Badge';
import { AffiliateData } from '../../types/mobile';
import { jsPDF } from 'jspdf';

interface CarnetViewProps {
    affiliateData: AffiliateData | null;
}

export default function CarnetView({ affiliateData }: CarnetViewProps) {
    const theme = useTheme();

    const generatePDF = () => {
        if (!affiliateData) return;

        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [85.6, 53.98],
        });

        const bgColor = [255, 255, 255];
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.rect(0, 0, 85.6, 53.98, 'F');

        doc.setFillColor(26, 95, 122);
        doc.rect(0, 0, 85.6, 18, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('A.E.F.I.P.', 42.8, 8, { align: 'center' });
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('Seccional Noroeste', 42.8, 13, { align: 'center' });

        doc.setTextColor(26, 95, 122);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('CARNET DE AFILIADO', 42.8, 24, { align: 'center' });

        doc.setDrawColor(26, 95, 122);
        doc.setLineWidth(0.5);
        doc.line(5, 28, 80.6, 28);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Nombre:', 5, 34);
        doc.setFont('helvetica', 'normal');
        doc.text(`${affiliateData.nombre} ${affiliateData.apellido}`.toUpperCase(), 20, 34);

        doc.setFont('helvetica', 'bold');
        doc.text('CUIL:', 5, 40);
        doc.setFont('helvetica', 'normal');
        doc.text(affiliateData.cuil || '-', 20, 40);

        doc.setFont('helvetica', 'bold');
        doc.text('Legajo:', 5, 46);
        doc.setFont('helvetica', 'normal');
        doc.text(affiliateData.legajo, 20, 46);

        const currentDate = new Date().toLocaleDateString('es-AR');
        doc.setFontSize(6);
        doc.setTextColor(100, 100, 100);
        doc.text(`Emitido: ${currentDate}`, 5, 51);

        doc.setFontSize(7);
        doc.setTextColor(26, 95, 122);
        doc.text('Válido presentando DNI', 42.8, 51, { align: 'center' });

        doc.save(`Carnet_AEFIP_${affiliateData.legajo}.pdf`);
    };

    if (!affiliateData) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">Cargando datos...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: 'primary.main', textAlign: 'center' }}>
                TU CARNET
            </Typography>

            <Paper
                sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    mb: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                }}
            >
                <Box
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        p: 3,
                        textAlign: 'center',
                        position: 'relative',
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            opacity: 0.1,
                            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />
                    <BadgeIcon sx={{ fontSize: 48, mb: 1, position: 'relative', zIndex: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, position: 'relative', zIndex: 1 }}>
                        A.E.F.I.P.
                    </Typography>
                    <Typography variant="caption" sx={{ position: 'relative', zIndex: 1, opacity: 0.9 }}>
                        Seccional Noroeste
                    </Typography>
                </Box>

                <Box sx={{ p: 3 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 800,
                            mb: 0.5,
                            color: 'primary.main',
                            textAlign: 'center',
                            textTransform: 'uppercase',
                        }}
                    >
                        {affiliateData.nombre} {affiliateData.apellido}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            CUIL
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {affiliateData.cuil || '-'}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Legajo
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {affiliateData.legajo}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Estado
                        </Typography>
                        <Chip label="Afiliado Activo" color="success" size="small" sx={{ fontWeight: 700 }} />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                            Documento válido con presentación de DNI
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<DownloadIcon />}
                onClick={generatePDF}
                sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: '1rem',
                    boxShadow: '0 4px 14px rgba(26, 95, 122, 0.3)',
                }}
            >
                Descargar Carnet PDF
            </Button>

            <Paper sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.08) }}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Presentá este carnet junto con tu DNI en todos los beneficios de AEFIP Seccional Noroeste.
                </Typography>
            </Paper>
        </Box>
    );
}
