import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Container maxWidth="sm">
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '100vh',
                            textAlign: 'center',
                            gap: 2
                        }}
                    >
                        <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main' }} />
                        <Typography variant="h4" fontWeight={800}>
                            Algo salió mal
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            La aplicación encontró un error inesperado. Por favor, intenta recargar la página.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => window.location.reload()}
                            sx={{ mt: 2 }}
                        >
                            Recargar Página
                        </Button>
                        {process.env.NODE_ENV === 'development' && (
                            <Box
                                sx={{
                                    mt: 4,
                                    p: 2,
                                    bgcolor: 'grey.100',
                                    borderRadius: 2,
                                    textAlign: 'left',
                                    width: '100%',
                                    overflowX: 'auto'
                                }}
                            >
                                <Typography variant="caption" component="pre" sx={{ color: 'error.dark' }}>
                                    {this.state.error?.toString()}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
