'use-strinct'
const DAO = require('./DAO/get_finance_final_reports');

/**
 * Genera reporte de folios pendientes por liquidar.
 * @return {json}: Respuesta de la función con la información procesada en la function, incluye respuesta satisfactoria o fallo.
 */
module.exports.getDataFinalReport = async () => {

    try {

        /** OBTENER DATOS DE FINANZAS. */
        const getDataFinances = await DAO.getDataFoliosPendientes();
        if (getDataFinances.error !== undefined || getDataFinances.warn !== undefined)
            return getDataFinances;

        // GENERAR REPORTE FOLIOS DETALLE PENDIENTES
        const getExportFile = await DAO.exportToCSV(getDataFinances, process.env.N_PENDIENTES_LIQUIDAR_FILE);        
        if (getExportFile.error !== undefined || getExportFile.warn !== undefined)
            return getExportFile;

        // SUBIR DOCUMENTOS AL BUCKET.
        const resultUploadFile = await DAO.uploadFile(getExportFile.name, getExportFile.path)
        if (resultUploadFile.error !== undefined || resultUploadFile.warn !== undefined)
            return resultUploadFile; 

        // ELIMINAR ARCHIVO EN CARPETA TMP.
        // const resultDeleteFile = await DAO.deleteFile(getExportFile.path)
        // if (resultDeleteFile.error !== undefined)
        //     throw resultDeleteFile;

        /** RETORNO DE RESPUESTA EXITOSA. */
        return { body: { message: 'PROCESO 3: Reporte generado correctamente.', data: {
            VARIABLE: "HOLA MUNDO"
        } }};

    } catch (error) {

        return error;

    }

};