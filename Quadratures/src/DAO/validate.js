'use strict';
const MongoDB = require('../../../common/MongoDB');

/**
 * Itera los folios ingresados y los mapea con los existentes en la base de datos.
 * @param {Intener} business: Variable que identica el negocio.
 * @param {String} country: Variable que identifica el país.
 * @param {[String]} externalIds: Variable que identica el arreglo de folios.
 * @return {json}: Respuesta de la función con la información procesada en la function, incluye respuesta satisfactoria o fallo.
 */
module.exports.validateQuadratures = async (business, country, externalIds) => {

    try {

        /** CREAR CONEXIÓN A MONGO. */
        const db = await MongoDB();

        if (db.error)
            return error;

        /** DEFINIR COLLECCIÓN A OCUOPAR DE LA BASE DE DATOS. */
        let collection = db.collection('order');

        /** DECLARAR CONSTANTE DE PROJECTION PARA LA CONSULTA SQL A MONGO. */
        const projection = { externalId: 1 };

        /** DECLARACIÓN DE VARIABLES PARA ALMACENAR RESULTADO Y FOLIOS QUE EXISTEN EN DB. */
        let consolidated = [];
        let existen = [];

        /** EJECUTAR SQL EN BASE DE DATOS. */
        const data = await collection.find({ countryCode: country, business, externalId: { $in: externalIds } }, { projection: projection }).toArray();

        /** ITERAR RESULTADO (data) Y ALMACENAR DATOS EN VARAIBLE "EXISTEN". ESTO SE HACE PARA DEJAR AFUERA EL CAMPO _ID QUE VIENE POR DEFECTO DE MONGO. */
        data.map(order => existen.push( order.externalId ));

        /**
         * ITERAR VARIABLE DE ENTRADA DE EXTERNALIDS Y VERIFICAR SI EXISTE EL OBJETO
         * EXISTENTE EN BD (VARIABLE EXISTEN) ALMACENANDO LOS QUE NO ENCUENTRA EN VARIABLE CONSOLIDATE.
         */
        for (const externalId of externalIds) {
            if (!existen.includes(externalId))
                consolidated.push(externalId)
        }

        /** RETORNO RESPUESTA. */
        return consolidated;

    } catch (error) {

        /** CAPTURA ERROR. */
        console.log(error);
        return { status: 400, body: { error: 'No se pudo seguir validando las cuadraturas.', detalle: error }, error };

    }

};