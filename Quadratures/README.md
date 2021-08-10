# Quadratures
##### Objetivo:
El objetivo de esta función es generar la cuadratura de las ordenes de la base de datos de logística.
Específicamente, verifica si la órden existe en la base datos. En caso que no sea así, indicará que el folio no cuadra.
##### Utilización:
Se debe generar un json siguiendo el siguiente patrón:
```sh
    {
        "country": ["CL", "PE", "CO", "AR"], (País al que pertenece)
        "business": [0, 1], (Negocio al que pertenece)
        "folios": [
            "12345678",
            "87654321",
            "14235867",
        ] (Arrelgo de string en donde se indican folios)
    }
```