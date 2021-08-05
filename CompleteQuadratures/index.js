'use strict';
const Business = require('./src/business');

/**
 * Función de inicio. Recibe los parámetros de entrada que vienen de http request de tipo raw/json.
 * @param {json} context: Variable de conexto, retorna resultados.
 * @param {json} req: Variable de entrada. Contiene el conexto de la petición.
 * @return {json}: Respuesta de la función con la información procesada en la function, incluye respuesta satisfactoria o fallo.
 */
module.exports = async function (context, req) {

    /** DESTRUCTURACIÓN DE PARÁMETROS DE ENTRADA. */
    const { country, business, folios } = req.body;

    /** VALIDAR QUE SE INGRESEN LOS PARÁMETROS DE ENTRADA CORRESPONDIENTES. */
    if (!business || !country || !folios)
        return context.res = { status: 400, body: { error: 'Faltan parámetros de entrada.' } };

    /** MÉTODO PARA GENERAR CUADRATURAS. */
    const result = await Business.generateQuadrature(req.body);

    /** RETORNO DE RESPUESTA. */
    context.res = result;

}