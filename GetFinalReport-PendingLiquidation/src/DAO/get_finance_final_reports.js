'use strict';
const sql = require("mssql");
const MySQL = require('../../../common/MySQL');
const FileManager = require('../../../common/FileManager');
const dateFormat = require('dateformat');

/**
 * Obtiene los folios desde la base de datos de finanzas.
 * @return {[Json]}: Respuesta de la función con la información procesada en la function, incluye respuesta satisfactoria o fallo.
 */
module.exports.getDataFoliosPendientes = async () => {

    try {

        /** CREAR CONEXIÓN A BASE DE DATOS MYSQL. */
        let valida = await MySQL.validarConexionFinanzas();
        if (valida.length > 0) return { status: 400, body: { error: 'No se pudo validar la conexión a finanzas.' }, error };
        let pool = await sql.connect(MySQL.configFinanzas);

        /** QUERY. */
        const query = `
            SELECT
                sl.id,
                sl.closeout_number,
                sl.term,
                sl.rut,
                sl.quantity,
                sl.sku,
                REPLACE(REPLACE(REPLACE(TRIM(REPLACE(sk.seller_sku, '''', '')), CHAR(9), ''), CHAR(10), ''), CHAR(13), '') AS seller_sku,
                REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(sk.product_name, '''', ''), ';', ' '), CHAR(9), ''), CHAR(10), ''), CHAR(13), '') AS description,
                sl.percentage,
                sl.gross_sale_income,
                sl.IVA_gross_income,
                sl.net_sale_income,
                sl.commission_value,
                sl.net_sale_to_bill,
                sl.IVA_to_bill,
                sl.gross_income_to_bill,
                sl.folio,
                CONVERT(VARCHAR, sl.createdAt, 120) AS createdAt,
                CONVERT(VARCHAR, sl.updatedAt, 120) AS updatedAt,
                CONVERT(VARCHAR, sl.date_of_sale, 120) AS date_of_sale,
                CONVERT(VARCHAR, sl.reception_time, 120) AS reception_time,
                sl.category,
                sl.origin,
                sl.fulfillment_type,
                sl.purchase_order,
                sl.sales_commission,
                sl.discount_value,
                sl.discounted_commission,
                sl.total_commission,
                REPLACE(REPLACE(REPLACE(REPLACE(sl.ticket_number, ';', ' '), CHAR(9), ''), CHAR(10), ''), CHAR(13), '') AS ticket_number,
                sl.international,
                sl.business,
                sl.country
            FROM
                sales sl
                LEFT JOIN skus sk ON sl.sku = sk.sku 
            WHERE
                sl.origin = 'SVL'
                AND sl.folio NOT IN ('0','-1','-2','-3','-4','-5','-6','-7','-8','-9','-10','-11')
                AND sl.quantity > 0
                AND (sl.closeout_number = 0 OR sl.closeout_number IS NULL)
                AND sl.international = 0
        `;

        /** EJECUCIÓN DE QUERY. */
        const data = await pool.request().query(query);
        if (!data)
            return { error: 'No se pudo consultar los datos de finanzas.' };

        /** RETORNO RESPUESTA. */
        return data.recordset;

    } catch (error) {

        /** CAPTURA ERROR. */
        console.log(error);
        return { status: 400, body: { error: 'No se pudo seguir validando los folios.', detalle: error }, error };

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
        return { status: 400, body: { error: 'No se pudo exportar los datos.', detalle: error }, error };

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

        console.log("FILENAME:", fileName);
        console.log("FILEPATH:", filePath);

        // ENVIAR PROCESO UPLOAD S3, SE ENVIAN 3 PARAMETROS; fileName, filePath, bucket.
        // let result = await S3.uploadFromFile(fileName, filePath, process.env.BUCKET_LIQ_PROC_3);

        // if (result.error)
        //     throw result.error;

        // result.Name = fileName;

        /** RETORNO RESPUESTA. */
        // return result;

    } catch (error) {

            /** CAPTURA ERROR. */
            console.log(error);
            return { status: 400, body: { error: 'No se pudo seguir validando los folios.', detalle: error }, error };

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
            return { status: 201, body: { error: 'Imposible eliminar archivo.' }, error };

        /** RETORNO RESPUESTA. */
        return result;

    } catch (error) {

        /** CAPTURA ERROR. */
        console.log(error);
        return { status: 400, body: { error: 'No se pudo seguir validando los folios.', detalle: error }, error };

    }

}