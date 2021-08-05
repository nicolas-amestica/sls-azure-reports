const { MongoClient } = require('mongodb');

/* NOMBRE DE BASE DE DATOS. */
const dbName = process.env.DB_NAME_ORDERS_CLUSTER_1;

/* URL HOST. */
const url = process.env.DB_HOST_ORDERS_CLUSTER_1;

/* INSTANCIAR OBJETO BASE DE DATOS. */
const client = new MongoClient(url, {
  useUnifiedTopology: true
});

/* EXPORTAR MODULO DE CONEXIÓN. */
module.exports = async () => {

  try {

    /* ESTABLECER CONEXIÓN A BASE DE DATOS. */
    await client.connect();

    /* ESTABLECER CONEXIÓN A COLECCIÓN. */
    return client.db(dbName);

  } catch (error) {

    return error;

  }

};