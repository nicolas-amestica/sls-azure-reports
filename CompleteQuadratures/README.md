# Complete Quadratures
##### Objetivo:
El objetivo de esta función es generar la cuadratura de las ordenes de la base de datos de logística.
Específicamente, verifica si la órden y el externalCompanieId existen en la base datos. En caso que no sea así, indicará que el folio no cuadra.
##### Utilización:
Se debe generar un json siguiendo el siguiente patrón:
```sh
    {
        "country": ["CL", "PE", "CO", "AR"], (País al que pertenece)
        "business": [0, 1], (Negocio al que pertenece)
        "folios": [
            { "folio": "12345678", "externalCompanyId": 222 },
            { "folio": "87654321", "externalCompanyId": 333 },
        ] (Arrelgo de objetos en donde se indica folio y externalCompanyId)
    }
```
Estos datos los debe proporcionar la contrarte solicitante.
##### Preparar data para Endpoint:
En algún editor de texto (de preferencia VSCode) dejar la lista de folios y externalCompanyId separados por punto y coma (;), como se ve a continuación:
```sh
folio;externalCompanyId
folio;externalCompanyId
folio;externalCompanyId
folio;externalCompanyId
```
Luego, realizar la siguiente búsqueda en el editor de texto:
```sh
(.*);(.*)
```
y reemplazar por:
```sh
{ "folio": "$1", "externalCompanyId": $2 },
```
quedará se la siguiente forma:
```sh
{ "folio": "12345678", "externalCompanyId": 222 },
{ "folio": "87654321", "externalCompanyId": 333 },
{ "folio": "12345678", "externalCompanyId": 222 },
{ "folio": "87654321", "externalCompanyId": 333 },
```
El resultado se debe inyectar en la propiedad "folios" del endpoint como parámetros de entrada.