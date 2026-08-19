import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Formulary from '../Components/LoginForm/Formulary';
import { isUserAdmin } from '../utils/auth';

function Login() {
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem("current_affiliate");
        if (stored) {
            try {
                const user = JSON.parse(stored);
                if (isUserAdmin(user)) {
                    navigate("/admin", { replace: true });
                } else {
                    navigate("/perfil", { replace: true });
                }
            } catch (e) {
                console.error(e);
            }
        }
    }, [navigate]);

    return (
        <>
            <Helmet>
                <title>Iniciar Sesión - A.E.F.I.P Seccional Noroeste</title>
                <meta name="description" content="Inicia sesión en tu cuenta de afiliado." />
            </Helmet>
            <Formulary />
        </>
    );
}

export default Login;
