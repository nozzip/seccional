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
    CircularProgress,
    Tooltip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import BadgeIcon from '@mui/icons-material/Badge';
import { AffiliateData } from '../../types/mobile';
import { jsPDF } from 'jspdf';
import { generateQRCodeDataURL } from '../../utils/qrGenerator';
import { supabase } from '../../supabaseClient';

interface CarnetViewProps {
    affiliateData: AffiliateData | null;
}

export default function CarnetView({ affiliateData }: CarnetViewProps) {
    const theme = useTheme();
    const [qrDataUrl, setQrDataUrl] = React.useState<string>('');
    const [familyMembers, setFamilyMembers] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchQR = async () => {
            if (affiliateData?.validation_token) {
                console.log("Generating QR for token:", affiliateData.validation_token);
                // Construct the validation URL
                const validationUrl = `${window.location.origin}${window.location.pathname}#/validar/${affiliateData.validation_token}`;
                const url = await generateQRCodeDataURL(validationUrl);
                setQrDataUrl(url);
            } else {
                console.warn("No validation token found in affiliateData");
            }
        };
        fetchQR();
    }, [affiliateData]);

    React.useEffect(() => {
        const fetchFamily = async () => {
            if (!affiliateData?.legajo) return;
            try {
                const { data: affData } = await supabase
                    .from('affiliates')
                    .select('id')
                    .eq('legajo', affiliateData.legajo)
                    .eq('branch', 'noroeste')
                    .limit(1);

                if (affData && affData.length > 0) {
                    const { data: famData } = await supabase
                        .from('affiliate_family_members')
                        .select('nombre, apellido, dni')
                        .eq('affiliate_id', affData[0].id)
                        .order('nombre', { ascending: true });

                    if (famData) {
                        setFamilyMembers(famData);
                    }
                }
            } catch (err) {
                console.error("Error fetching family members for carnet:", err);
            }
        };
        fetchFamily();
    }, [affiliateData]);

    const downloadQR = () => {
        if (!qrDataUrl) return;
        const link = document.createElement('a');
        link.href = qrDataUrl;
        link.download = `QR_Carnet_AEFIP_${affiliateData?.legajo || 'afiliado'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const generatePDF = async () => {
        if (!affiliateData) return;

        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [85.6, 53.98],
        });

        // Background
        const bgColor = [255, 255, 255];
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.rect(0, 0, 85.6, 53.98, 'F');

        // Header
        doc.setFillColor(26, 95, 122);
        doc.rect(0, 0, 85.6, 18, 'F');

        // Text in Header - ALWAYS SOLID
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

        // Date and Time of Download - ENSURE SOLID GRAY
        const now = new Date();
        const dateStr = now.toLocaleDateString('es-AR');
        const timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        
        doc.setFontSize(4);
        doc.setTextColor(80, 80, 80);
        doc.text(`Descargado el: ${dateStr} ${timeStr}`, 5, 52);

        doc.setFontSize(6);
        doc.setTextColor(26, 95, 122);
        doc.text('Válido presenting DNI', 75, 52, { align: 'right' });

        // QR Code - In PDF
        if (qrDataUrl) {
            doc.addImage(qrDataUrl, 'PNG', 68, 30, 15, 15);
        }

        // Page 2: Grupo Familiar
        if (familyMembers.length > 0 || affiliateData.conyuge_nombre) {
            doc.addPage([85.6, 53.98], 'landscape');

            // Background
            doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
            doc.rect(0, 0, 85.6, 53.98, 'F');

            // Header
            doc.setFillColor(26, 95, 122);
            doc.rect(0, 0, 85.6, 12, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('GRUPO FAMILIAR BENEFICIARIO', 42.8, 8, { align: 'center' });

            doc.setTextColor(0, 0, 0);
            let yOffset = 18;

            // Render Spouse/Cónyuge
            if (affiliateData.conyuge_nombre) {
                doc.setFontSize(7);
                doc.setFont('helvetica', 'bold');
                doc.text('Cónyuge:', 5, yOffset);
                doc.setFont('helvetica', 'normal');
                doc.text(`${affiliateData.conyuge_nombre}`.toUpperCase(), 18, yOffset);
                if (affiliateData.conyuge_dni) {
                    doc.setFont('helvetica', 'bold');
                    doc.text('DNI:', 55, yOffset);
                    doc.setFont('helvetica', 'normal');
                    doc.text(affiliateData.conyuge_dni, 62, yOffset);
                }
                yOffset += 5;
            }

            // Render Children
            if (familyMembers.length > 0) {
                doc.setFontSize(6.5);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(26, 95, 122);
                doc.text(`Familiares a cargo (${familyMembers.length}):`, 5, yOffset);
                doc.setTextColor(0, 0, 0);
                yOffset += 4.5;

                familyMembers.forEach((member) => {
                    if (yOffset > 48) return; // Prevent overflow
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(6);
                    doc.text(`• ${member.nombre} ${member.apellido}`.toUpperCase(), 7, yOffset);
                    if (member.dni) {
                        doc.setFont('helvetica', 'bold');
                        doc.text('DNI:', 55, yOffset);
                        doc.setFont('helvetica', 'normal');
                        doc.text(member.dni, 62, yOffset);
                    }
                    yOffset += 4;
                });
            }

            // Footer of page 2
            doc.setFontSize(5);
            doc.setTextColor(80, 80, 80);
            doc.text(`Titular: ${affiliateData.nombre} ${affiliateData.apellido} - Legajo: ${affiliateData.legajo}`, 5, 51);
        }

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
                    maxWidth: 500,
                    mx: 'auto',
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

                <Box sx={{ p: 3, position: 'relative' }}>
                    {/* UI Watermark */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '80%',
                            height: '80%',
                            backgroundImage: `url("${import.meta.env.BASE_URL}seccionalLogo.png")`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            opacity: 0.03,
                            zIndex: 0,
                            pointerEvents: 'none',
                        }}
                    />

                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 800,
                            mb: 0.5,
                            color: 'primary.main',
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            position: 'relative',
                            zIndex: 1,
                        }}
                    >
                        {affiliateData.nombre} {affiliateData.apellido}
                    </Typography>

                    <Divider sx={{ my: 2, position: 'relative', zIndex: 1 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, position: 'relative', zIndex: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            CUIL
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {affiliateData.cuil || '-'}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, position: 'relative', zIndex: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Legajo
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {affiliateData.legajo}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, position: 'relative', zIndex: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Estado
                        </Typography>
                        <Chip label="Afiliado Activo" color="success" size="small" sx={{ fontWeight: 700 }} />
                    </Box>

                    {/* Cónyuge display */}
                    {(affiliateData.conyuge_nombre || affiliateData.conyuge_dni) && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, position: 'relative', zIndex: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                Cónyuge
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {affiliateData.conyuge_nombre || '-'} {affiliateData.conyuge_dni ? `(DNI: ${affiliateData.conyuge_dni})` : ''}
                            </Typography>
                        </Box>
                    )}

                    {/* Grupo Familiar display */}
                    {familyMembers.length > 0 && (
                        <Box sx={{ mt: 1.5, mb: 1, position: 'relative', zIndex: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
                                Familiares a cargo ({familyMembers.length})
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pl: 1, borderLeft: '2px solid', borderColor: 'primary.light' }}>
                                {familyMembers.map((member, index) => (
                                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                            • {member.nombre} {member.apellido}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                            DNI: {member.dni || '-'}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    <Divider sx={{ my: 2, position: 'relative', zIndex: 1 }} />

                    <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'left', maxWidth: '60%' }}>
                            Documento válido con presentación de DNI. Escanee el QR para validar vigencia.
                        </Typography>
                        {qrDataUrl ? (
                            <Tooltip title="Hacé clic para descargar el código QR" arrow>
                                <Box 
                                    component="img" 
                                    src={qrDataUrl} 
                                    alt="QR Validation"
                                    onClick={downloadQR}
                                    sx={{ 
                                        width: 50, 
                                        height: 50, 
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: 'white',
                                        p: 0.5,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'scale(1.1)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.18)'
                                        }
                                    }}
                                />
                            </Tooltip>
                        ) : affiliateData.validation_token ? (
                            <CircularProgress size={24} />
                        ) : (
                            <Typography variant="caption" color="error" sx={{ fontSize: '0.6rem' }}>
                                [Token pendiente. Reingresa a la App]
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Paper>

            <Box sx={{ maxWidth: 500, mx: 'auto' }}>
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
                        mb: 3,
                    }}
                >
                    Descargar Carnet PDF
                </Button>
    
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.08) }}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        Presentá este carnet junto con tu DNI en todos los beneficios de AEFIP Seccional Noroeste.
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
}
