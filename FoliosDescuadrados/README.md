# Folios Descuadrados
##### Objetivo:
El objetivo de esta función es generar la cuadratura de los folios liquidados y la orden en la base de datos de logística.
Específicamente, verifica si el folios liquidado, de la base de datos de finanzas, se encuentra en estado delivered en la base de datos de logística. En caso que no sea así, indicará que el folio no cuadra.
##### Utilización:
Se debe generar un json siguiendo el siguiente patrón:
```sh
    {
        "country": ["CL", "PE", "CO", "AR"], (País al que pertenece)
        "business": [0, 1], (Negocio al que pertenece)
        "folios": [
            "12345678",
            "87654321",
            "14235867"
        ] (Arrelgo de string en donde se indican los folios)
    }
```