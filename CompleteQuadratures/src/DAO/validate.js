'use strict';
const MongoDB = require('../../../common/MongoDB');
const MySQL = require('../../../common/MySQL');
const sql = require("mssql");

/**
 * Itera los folios ingresados y los mapea con los existentes en la base de datos.
 * @param {Intener} business: Variable que identica el negocio.
 * @param {String} country: Variable que identifica el país.
 * @param {[json]} objExternalIds: Variable que identica el objeto de folios y externalCompanyId.
 * @return {json}: Respuesta de la función con la información procesada en la function, incluye respuesta satisfactoria o fallo.
 */
module.exports.validateQuadratures = async (business, country, objExternalIds) => {

    try {

        /** ALMACENAR SOLO LOS FOLIOS DE LA VARIABLE DE ENTRADA. */
        let externalIds = objExternalIds.map(order => order.folio)

        /** CREAR CONEXIÓN A MONGO. */
        const db = await MongoDB();

        if (db.error)
            return error;

        /** DEFINIR COLLECCIÓN A OCUOPAR DE LA BASE DE DATOS. */
        let collection = db.collection('order');

        /** DECLARAR CONSTANTE DE PROJECTION PARA LA CONSULTA SQL A MONGO. */
        const projection = { externalId: 1, externalCompanyId: 1 };

        /** DECLARACIÓN DE VARIABLES PARA ALMACENAR RESULTADO Y FOLIOS QUE EXISTEN EN DB. */
        let consolidated = [];
        let existen = [];

        /** EJECUTAR SQL EN BASE DE DATOS. */
        const data = await collection.find({ countryCode: country, business, externalId: { $in: externalIds } }, { projection: projection }).toArray();

        /** ITERAR RESULTADO (data) Y ALMACENAR DATOS EN VARAIBLE "EXISTEN". ESTO SE HACE PARA DEJAR AFUERA EL CAMPO _ID QUE VIENE POR DEFECTO DE MONGO. */
        data.map(order => existen.push( { folio: order.externalId, externalCompanyId: parseInt(order.externalCompanyId) }));

        /**
         * ITERAR VARIABLE DE ENTRADA DE FOLIOS Y VERIFICAR SI EXISTE EL OBJETO
         * EXISTENTE EN BD (VARIABLE EXISTEN) ALMACENANDO LOS QUE NO ENCUENTRA EN VARIABLE CONSOLIDATE.
         */
        for (const order of objExternalIds) {
            let res = existen.some(existe => existe.folio === order.folio && existe.externalCompanyId === order.externalCompanyId);
            if (!res)
                consolidated.push(`${order.folio};${order.externalCompanyId}`)
        }

        /** RETORNO RESPUESTA. */
        return consolidated;

    } catch (error) {

        /** CAPTURA ERROR. */
        console.log(error);
        return { status: 400, body: { error: 'No se pudo seguir validando las cuadraturas.', detalle: error }, error };

    }

};

/**
 * Itera los folios ingresados y los mapea con los existentes en la base de datos.
 * @param {Intener} business: Variable que identica el negocio.
 * @param {String} country: Variable que identifica el país.
 * @param {[Integer]} orders: Variable que identica las ordenes que no fueron encontradas en sistema.
 * @return {json}: Respuesta de la función con la información procesada en la function, incluye respuesta satisfactoria o fallo.
 */
module.exports.validateCompanies = async (business, country, orders) => {

    try {

        /** DECLARACIÓN DE VARIABLES. */
        let pais = 0;
        let externalCompaniesNoExisten = [];

        /** ASIGNA EL CODIGO DEL PAIS SEGÚN EL COUNTRY CODE INGRESADO. */
        switch (country) {
            case 'CL':
                pais = 1;
                break;
            case 'PE':
                pais = 10;
                break;
            case 'AR':
                pais = 9;
                break;
            case 'CO':
                pais = 8;
                break;
        }

        /** VALIDA QUE SE HAYA INGRESADO UN COUNTRY CODE VALIDO. */
        if (pais == 0)
            return { status: 400, body: { error: 'Imposible identificar el país.', detalle: { message: 'No se ha podido identificar el país' } }, error: {} };

        /** ALMACENAR SOLO LOS EXTERNAL REFERENCES DE LA VARIABLE DE ENTRADA. */
        let externalReferenceIds = orders.map(order => {
            let external = order.split(';');
            return external[1].toString();
        });

        /** QUITAR EXTERNAL REFERENCES DUPLICADOS. */
        externalReferenceIds = [...new Set(externalReferenceIds)];

        /** GENERA CONEXIÓN CON BASE DE DATOS MYSQL. */
        let valida = await MySQL.validarConexionUsuarios();
        if (valida.length > 0) throw valida;
        let pool = await sql.connect(MySQL.configUsuarios);

        const query = `SELECT id, external_reference_id FROM companies WHERE svl_country_id = ${pais} AND business = ${business} AND external_reference_id IN ('${externalReferenceIds.join(`','`)}')`;

        let data;

        /** EJECUTA QUERY. */
        data = await pool.request().query(query);

        sql.close();

        /** ITERAR RESULTADO (data) Y ALMACENAR DATOS EN VARAIBLE "datos". ESTO SE HACE PARA ALMACENAR LOS EXTERNAL RECERENCES EXISTENTES. */
        let datos = data.recordset.map(order => order.external_reference_id);

        /**
         * ITERAR VARIABLE DE ENTRADA EXTERNAL REFERENCES Y VERIFICAR SI EXISTE EL EXTERNAL REFERENCE
         * EXISTENTE EN BD (VARIABLE EXISTEN) ALMACENANDO LOS QUE NO ENCUENTRA EN VARIABLE CONSOLIDATE.
         */
        for (const order of externalReferenceIds) {
            let res = datos.some(existe => existe === order);
            if (!res)
                externalCompaniesNoExisten.push(`${order}`)
        }

        /** RETORNO RESPUESTA. */
        return externalCompaniesNoExisten;

    } catch (error) {

        /** CAPTURA ERROR. */
        console.log(error);
        return { status: 400, body: { error: 'No se pudo seguir validando las companies.', detalle: error }, error };

    }

};