import React from 'react';
import { Helmet } from 'react-helmet-async';
import Formulary from '../Components/LoginForm/Formulary';

function Login() {
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
