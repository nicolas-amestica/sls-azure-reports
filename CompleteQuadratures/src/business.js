'use-strinct'
const DAO = require('./DAO/validate');

/** VARIABLES DE PARÁMETROS. */
const arBusiness = [0, 1];
const arCountries = ['CL', 'PE', 'AR', 'CO'];

/**
 * Itera los folios ingresados y los mapea con los existentes en la base de datos. Los parámetros de entrada vienen en tipo raw json.
 * @param {json} event: Variable que contiene arreglo de folios, country y business.
 * @return {json}: Respuesta de la función con la información procesada en la function, incluye respuesta satisfactoria o fallo.
 */
module.exports.generateQuadrature = async (event) => {

    try {

        /** DESTRUCTURACIÓN DE PARÁMETROS DE ENTRADA. */
        const { business, country, folios } = event;

        /** VALIDAR QUE BUSINESS SEA TIPO NUMÉRICO Y ESTE DENTRO DE LOS VALORES PERMITIDOS. */
        if (typeof business != 'number' || !arBusiness.includes(business))
            return { status: 400, body: { error: `Parámetro business debe ser numérico y estar en el rango ${arBusiness}.` } };

        /** VALIDAR QUE COUNTRY ESTE DENTRO DE LOS VALORES PERMITIDOS. */
        if (country.length == 0 || !arCountries.includes(country))
            return { status: 400, body: { error: `Parámetro country debe contener uno de los siguientes country_codes ${arCountries}.` } };

        /** VALIDAR QUE FOLIOS TENGA CONTENIDO. */
        if (folios.length == 0)
            return { status: 400, body: { error: `Parámetro folios debe contener al menos un folio.` } };

        /** EJECUTAR CUADRATURA DE ORDENES. */
        const resultGeneral = await DAO.validateQuadratures(business, country, folios);
        if (resultGeneral.error !== undefined)
            return resultGeneral;

        /** EJECUTAR VALIDACIÓN DE COMPANIES EXISTENTES. */
        const resultCompanies = await DAO.validateCompanies(business, country, resultGeneral);
        if (resultCompanies.error !== undefined) {
            return resultCompanies;
        }

        /** RETORNO DE RESPUESTA EXITOSA. */
        return { body: { message: 'Cuadratura generada correctamente.', data: {
            Ordenes_no_encontradas: resultGeneral,
            Companies_no_encontradas: resultCompanies
        }}};

    } catch (error) {

        return error;

    }

};