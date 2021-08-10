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
                sal.id AS id,
                sal.closeout_number AS closeout_number,
                sal.term,
                sal.rut,
                REPLACE(REPLACE(REPLACE(TRIM(REPLACE(TRIM(s.seller_sku), '''', '')), CHAR(9), ''), CHAR(10), ''), CHAR(13), '') AS seller_sku,
                sal.quantity,
                REPLACE(REPLACE(REPLACE(sal.sku, CHAR(9), ''), CHAR(10), ''), CHAR(13), '') AS sku,
                REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(sal.description, '''', ''), ';', ' '), CHAR(9), ''), CHAR(10), ''), CHAR(13), '') AS description,
                sal.percentage AS percentage,
                sal.gross_sale_income AS gross_sale_income,
                sal.IVA_gross_income AS IVA_gross_income,
                sal.net_sale_income AS net_sale_income,
                sal.commission_value AS commission_value,
                sal.net_sale_to_bill AS net_sale_to_bill,
                sal.IVA_to_bill AS IVA_to_bill,
                sal.gross_income_to_bill AS gross_income_to_bill,
                sal.folio AS folio,
                CONVERT(VARCHAR, sal.createdAt, 120) AS createdAt,
                CONVERT(VARCHAR, sal.updatedAt, 120) AS updatedAt,
                CONVERT(VARCHAR, sal.date_of_sale, 120) AS date_of_sale,
                CONVERT(VARCHAR, sal.reception_time, 120) AS reception_time,
                sal.category AS category,
                sal.origin AS origin,
                sal.fulfillment_type AS fulfillment_type,
                sal.purchase_order AS purchase_order,
                sal.sales_commission AS sales_commission,
                sal.discount_value AS discount_value,
                sal.discounted_commission AS discounted_commission,
                sal.total_commission AS total_commission,
                REPLACE(REPLACE(REPLACE(REPLACE(sal.ticket_number, ';', ' '), CHAR(9), ''), CHAR(10), ''), CHAR(13), '') AS ticket_number,
                sal.depth AS depth,
                sal.width AS width,
                sal.height AS height,
                sal.stock_management AS stock_management,
                sal.storage AS storage,
                sal.crossdock AS crossdock,
                sal.logistic_train AS logistic_train,
                sal.mks_ctipo AS mks_ctipo,
                sal.tienda_key AS tienda_key,
                sal.tienda_usu AS tienda_usu,
                sal.local_vent_key AS local_vent_key,
                sal.local_vent_usu AS local_vent_usu,
                sal.local_desp_key AS local_desp_key,
                sal.local_desp_usu AS local_desp_usu,
                sal.local_inter_key AS local_inter_key,
                sal.local_inter_usu AS local_inter_usu,
                sal.descto_item AS descto_item,
                sal.descto_prorrat AS descto_prorrat,
                sal.dispatch_type AS dispatch_type,
                sal.price_svl AS price_svl,
                sal.international AS international,
                sal.business AS business,
                sal.country AS country,
                clo.id AS id_clo,
                clo.number AS number_clo,
                clo.term AS term_clo,
                clo.rut AS rut_clo,
                clo.name AS name_clo,
                CONVERT(VARCHAR, clo.createdAt, 120) AS createdAt_clo,
                CONVERT(VARCHAR, clo.updatedAt, 120) AS updatedAt_clo,
                clo.gross_income_to_bill AS gross_income_to_bill_clo,
                clo.commission AS commission_clo,
                clo.gross_sale_income AS gross_sale_income_clo,
                clo.origin AS origin_clo,
                CONVERT(VARCHAR, clo.term_date, 120) AS term_date_clo,
                clo.business AS business_clo,
                clo.country AS country_clo
            FROM
                sales sal
                INNER JOIN closeouts clo ON sal.closeout_number = clo.[number]
                LEFT JOIN skus s ON sal.sku=s.sku
            WHERE
                1 = 1
                AND clo.origin = 'SVL'
                AND clo.term = '${dateFormat(new Date(), "yyyy-mm-dd")}'`
                // AND clo.term = '2021-08-06'`;
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