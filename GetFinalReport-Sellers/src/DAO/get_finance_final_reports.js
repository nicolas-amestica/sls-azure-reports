'use strict';
const sql = require("mssql");
const MySQL = require('../../../common/MySQL');
const FileManager = require('../../../common/FileManager');
const dateFormat = require('dateformat');
const BlobStorage = require('../../../common/BlobStorage');
const path = require("path");

/**
 * Obtiene los folios desde la base de datos de finanzas.
 * @return {[Json]}: Respuesta de la función con la información procesada en la function, incluye respuesta satisfactoria o fallo.
 */
module.exports.getDataFoliosPendientes = async () => {

    try {

        /** CREAR CONEXIÓN A BASE DE DATOS MYSQL. */
        let valida = await MySQL.validarConexionFinanzas();
        if (valida.length > 0) return { status: 400, body: { error: 'No se pudo validar la conexión a finanzas.' }, error: {} };
        let pool = await sql.connect(MySQL.configFinanzas);

        /** QUERY. */
        const query = `
            SELECT
                REPLACE(REPLACE(REPLACE(id, CHAR(9), ''), CHAR(10), ''), CHAR(13), '') AS id,
                REPLACE(REPLACE(REPLACE(number, CHAR(9), ''), CHAR(10), ''), CHAR(13), '') AS number,
                REPLACE(REPLACE(REPLACE(term, CHAR(9), ''), CHAR(10), ''), CHAR(13), '') AS term,
                REPLACE(REPLACE(REPLACE(rut, CHAR(9), ''), CHAR(10), ''), CHAR(13), '') AS rut,
                REPLACE(REPLACE(REPLACE(name, CHAR(9), ''), CHAR(10), ''), CHAR(13), '') AS name,
                REPLACE(REPLACE(REPLACE(CAST(CAST(createdAt AS date) AS varchar), CHAR(9), ''), CHAR(10), ''), CHAR(13), '') AS createdAt,
                REPLACE(REPLACE(REPLACE(CAST(CAST(updatedAt AS date) AS varchar), CHAR(9), ''), CHAR(10), ''), CHAR(13), '') AS updatedAt,
                gross_income_to_bill,
                commission,
                gross_sale_income,
                REPLACE(REPLACE(REPLACE(origin, CHAR(9), ''), CHAR(10), ''), CHAR(13), '') AS origin,
                REPLACE(REPLACE(REPLACE(CAST(CAST(term_date AS date) AS varchar), CHAR(9), ''), CHAR(10), ''), CHAR(13), '') AS term_date,
                REPLACE(REPLACE(REPLACE(business, CHAR(9), ''), CHAR(10), ''), CHAR(13), '') AS business,
                REPLACE(REPLACE(REPLACE(country, CHAR(9), ''), CHAR(10), ''), CHAR(13), '') AS country
            FROM
                closeouts
            WHERE
                term = '${dateFormat(new Date(), "yyyy-mm-dd")}'`
                // term = '2021-08-06'`;
        ;

        /** EJECUCIÓN DE QUERY. */
        const data = await pool.request().query(query);
        if (!data)
            return { status: 400, body: { error: 'No se pudo consultar los datos de finanzas.' }, error: {} };

        /** RETORNO RESPUESTA. */
        return data.recordset;

    } catch (error) {

        /** CAPTURA ERROR. */
        console.log(error);
        return { status: 400, body: { error: 'No se pudo seguir validando los folios.', detalle: error }, error: {} };

    }

};

/**
 * Exportar los datos de finanzas a un archivo csv. Este es almacenado en la carpeta temporal tmp ubicada en la raíz del proyecto.
 * @param {[Json]} data: Arreglo de objetos.
 * @param {String} fileName: Nombre del archivo a generar.
 * @return {[Json]}: Respuesta de la función con la información procesada en la function, incluye respuesta satisfactoria o fallo.
 */
module.exports.exportToCSV = async (data, fileName) => {

    try {

        /** VALIDAR QUE LA VARIABLE DAT TENGA CONTENIDO. */
        if (data.length == 0)
            return { status: 201, body: { message: 'No existen datos a exportar.' }, warn: {} };

        /** CREAR NOMBRE DEL ARCHIVO A BASE DE FECHA NUMÉRICA. */
        const fullFileName = `${fileName}_${dateFormat(new Date(), "yyyymmddHMM")}`;

        /** ENVIAR A EXPORTAR DATA A UN ARCHIVO CSV. */
        const resultado = await FileManager.exportDataToCSV(data, fullFileName);
        if (resultado.error)
            return { status: 400, body: { error: 'No existen datos a exportar.' }, error: {} };

        /** RETORNO RESPUESTA. */
        return resultado;

    } catch (error) {

        /** CAPTURA ERROR. */
        console.log(error);
        return { status: 400, body: { error: 'No se pudo exportar los datos.', detalle: error }, error: {} };

    }

}

/**
 * Subir archivo csv a Azure Blob Storage.
 * @param {[Json]} fileName: Nombre del archivo a generar.
 * @param {String} filePath: Ruta del archivo.
 * @return {[Json]}: Respuesta de la función con la información procesada en la function, incluye respuesta satisfactoria o fallo.
 */
module.exports.uploadFile = async (fileName, filePath) => {

    try {

        /** DEFINIR NOMBRE DEL ARCHIVO A GUARDAR. */
        let fullPath = path.resolve(filePath);
        let fileName = path.basename(fullPath);

        /** ENVIAR A SUBIR ARCHIVO AL BLOB STORAGE. */
        let result = await BlobStorage.uploadLocalFile('reports', fileName, filePath);
        if (result.error)
            return { status: 400, body: { error: result.error }, error: {} };

        /** RETORNO RESPUESTA. */
        return result;

    } catch (error) {

        /** CAPTURA ERROR. */
        console.log(error);
        return { status: 400, body: { error: 'No se pudo subir el archivo.', detalle: error }, error: {} };

    }

}

/**
 * Eliminar el archivo csv ubicado en carpeta temporal.
 * @param {String} filePath: Ruta del archivo que está en carpeta temporal.
 * @return {[Json]}: Respuesta de la función con la información procesada en la function, incluye respuesta satisfactoria o fallo.
 */
module.exports.deleteFile = async (filePath) => {

    try {

        /** ELIMINAR ARCHIVO DE CARPETA TEMPORALES. */
        let result = await FileManager.deleteFile(filePath);
        if (result.error)
            return { status: 201, body: { error: 'Imposible eliminar archivo.' }, error: {} };

        /** RETORNO RESPUESTA. */
        return result;

    } catch (error) {

        /** CAPTURA ERROR. */
        console.log(error);
        return { status: 400, body: { error: 'No se pudo seguir validando los folios.', detalle: error }, error: {} };

    }

}