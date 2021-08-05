let configFinanzas = {
    server: process.env.DB_HOST_FINANCES_HOST,
    database: process.env.DB_HOST_FINANCES_DBNAME,
    user: process.env.DB_HOST_FINANCES_USER,
    password: process.env.DB_HOST_FINANCES_PASSWORD,
    multipleStatements: true,
    requestTimeout: 180000,
    options: {
        encrypt: true,
        enableArithAbort: true
    }
};

let configUsuarios = {
    server: process.env.DB_HOST_USERS_HOST,
    database: process.env.DB_HOST_USERS_DBNAME,
    user: process.env.DB_HOST_USERS_USER,
    password: process.env.DB_HOST_USERS_PASSWORD,
    multipleStatements: true,
    requestTimeout: 180000,
    options: {
        encrypt: true,
        enableArithAbort: true
    }
};

module.exports.validarConexionFinanzas = async () => {

    let message = [];

    if (!configFinanzas.server)
        message.push("No está configurado el host del servidor de base de datos");

    if (!configFinanzas.database)
        message.push("No está configurado el nombre del servidor de base de datos");

    if (!configFinanzas.user)
        message.push("No está configurado el usuario del servidor de base de datos");

    if (!configFinanzas.password)
        message.push("No está configurada la clave del servidor de base de datos");

    return message;

}

module.exports.validarConexionUsuarios = async () => {

    let message = [];

    if (!configUsuarios.server)
        message.push("No está configurado el host del servidor de base de datos");

    if (!configUsuarios.database)
        message.push("No está configurado el nombre del servidor de base de datos");

    if (!configUsuarios.user)
        message.push("No está configurado el usuario del servidor de base de datos");

    if (!configUsuarios.password)
        message.push("No está configurada la clave del servidor de base de datos");

    return message;

}

exports.configUsuarios = configUsuarios;
exports.configFinanzas = configFinanzas;