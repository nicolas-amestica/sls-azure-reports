'use strict';
const MongoDB = require('../../../common/MongoDB');
const sql = require("mssql");
const MySQL = require('../../../common/MySQL');

/**
 * Obtiene los folios desde la base de datos de finanzas.
 * @param {[String]} folios: Variable que identica el arreglo de folios a buscar.
 * @return {[String]}: Respuesta de la función con la información procesada en la function, incluye respuesta satisfactoria o fallo.
 */
module.exports.getDataFinances = async (folios) => {

    try {

        let ordenes = [...new Set(folios)];

        let valida = await MySQL.validarConexionFinanzas();
        if (valida.length > 0) return { status: 400, body: { error: 'No se pudo seguir validar la conexión a finanzas.' }, error };
        let pool = await sql.connect(MySQL.configFinanzas);

        const query = `
            SELECT
                DISTINCT
                folio    
            FROM
                sales
            WHERE
                origin = 'SVL'
                AND closeout_number > 0
                AND folio IN ('${ordenes.join(`','`)}')`;

        const result = await pool.request().query(query);
        if (!result)
            throw { error: 'No se pudo consultar los folios de finanzas.' };

        let datos = result.recordset.map(order => order.folio);

        return datos;

    } catch (error) {

        /** CAPTURA ERROR. */
        console.log(error);
        return { status: 400, body: { error: 'No se pudo seguir validando los folios.', detalle: error }, error };

    }

};

/**
 * Obtiene los folios desde la base de datos de orders.
 * @param {[String]} folios: Variable que identica el arreglo de folios.
 * @return {[String]}: Respuesta de la función con la información procesada en la function, incluye respuesta satisfactoria o fallo.
 */
 module.exports.getDataOrders = async (folios) => {

    try {

        let externalIds = [...new Set(folios)];

        const db = await MongoDB();
        if (!db)
            return { status: 400, body: { error: 'Imposible conectar a la base de datos logística.' }, error }

        let collection = db.collection('order');
        if (!collection)
            return { status: 400, body: { error: 'Imposible conectar a la colección de la base de datos.' }, error }

        let result = await collection.find({ countryCode: 'CL', business: 0, deliveryState: { $nin: ['delivered'] }, externalId: { $in: externalIds } }, { projection: { externalId: 1, deliveryState: 1 } }).toArray();

        if (!result)
            return { status: 400, body: { error: 'No se pudo obtener los datos de la base de datos' }, error }

        let datos = result.map(order => {
            return { folio: order.externalId, estado: order.deliveryState };
        });

        return datos;

    } catch (error) {

        /** CAPTURA ERROR. */
        console.log(error);
        return { status: 400, body: { error: 'No se pudo seguir validando los folios.', detalle: error }, error };

    }

};

/**
 * Obtiene los folios desde la base de datos de orders.
 * @param {[String]} foliosFinanzas: Variable que identica el arreglo de folios.
 * @param {[Json]} foliosOrders: Variable que identica el arreglo de objetos de folios.
 * @return {[Json]}: Respuesta de la función con la información procesada en la function, incluye respuesta satisfactoria o fallo.
 */
 module.exports.mapOrders = async (foliosFinanzas, foliosOrders) => {

    try {

        let consolidatedOrdes = [];

        foliosFinanzas.map(folio => {
            foliosOrders.find((o, i) => {
                if (o.folio === folio) {
                    consolidatedOrdes.push({ folio: folio, estado: o.estado });
                    return true;
                }
            });
        });

        return consolidatedOrdes;

    } catch (error) {

        /** CAPTURA ERROR. */
        console.log(error);
        return { status: 400, body: { error: 'No se pudo mapear los datos.', detalle: error }, error };

    }

};