'use-strinct'
const DAO = require('./DAO/validate');

/**
 * Itera los folios ingresados y los mapea con los existentes en la base de datos. Los parámetros de entrada vienen en tipo raw array.
 * @param {[String]} event: Arreglo de string que contiene los folios a consultar el descuadre.
 * @return {json}: Respuesta de la función con la información procesada en la function, incluye respuesta satisfactoria o fallo.
 */
module.exports.generateFoliosState = async (event) => {

    try {

        /** DESTRUCTURACIÓN DE PARÁMETROS DE ENTRADA. */
        const { folios } = event;

        /** VALIDAR QUE FOLIOS TENGA CONTENIDO. */
        if (folios.length == 0)
            return { status: 400, body: { error: `Parámetro folios debe contener al menos un registro.` } };

        /** OBTENER DATOS DE FINANZAS. */
        const getDataFinances = await DAO.getDataFinances(folios);
        if (getDataFinances.error !== undefined)
            return getDataFinances;

        /** OBTENER DATOS DE ORDERS. */
        const getDataOrders = await DAO.getDataOrders(folios);
        if (getDataOrders.error !== undefined)
            return getDataOrders;

        /** MAPEAR DATOS DE FINANZAS Y ORDERS. */
        const getMapOrders = await DAO.mapOrders(getDataFinances, getDataOrders);
        if (getMapOrders.error !== undefined)
            return getMapOrders;

        /** RETORNO DE RESPUESTA EXITOSA. */
        return { body: { message: 'Folios mapeados correctamente.', data: {
            Folios_descuadrados: getMapOrders
        } }};

    } catch (error) {

        return error;

    }

};