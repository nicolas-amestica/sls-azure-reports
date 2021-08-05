# SLS-AZURE-REPORTS
## Proyecto nodejs serverless enfocado en hacer generar la cuadratura de ordenes SVL.
##### Las tecnologías utilizadas son:
- Nodejs v12.
- Azure function core tools.
- Azure CLI.

##### Contiene el siguiente endpoint:

- GenerateQuadratures: Generar la cuadratura con identificador "folio".

El cuerpo del endpoint debe contener la siguiente estructura raw/json:
```sh
    {
        "country": ["CL", "PE", "CO", "AR"], (País al que pertenece)
        "business": [0, 1], (Negocio al que pertenece)
        "folios": [
            "12345678",
            "43218765",
            "14235867"
        ] (Arrelgo de string de folios)
    }
```

- GenerateCompleteQuadratures: Generar la cuadratura con identificar "folio" y "CompanieId".

El cuerpo del endpoint debe contener la siguiente estructura raw/json:
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

- ValidateFolios: Generar la cuadratura de folios liquidados de finanzas con folios con estado distinto a delivered de orders. Solo funciona para país Chile.

El cuerpo del endpoint debe contener la siguiente estructura raw/json:
```sh
    {
        "folios": [
            "12345678",
            "43218765",
            "14235867"
        ] (Arrelgo de string de folios)
    }
```
#### Todos los endpoint no tienen HEADER (de momento).

# INSTALACIÓN
##### Instalar las siguientes dependencias:
Requiere [Node.js](https://nodejs.org/) v12+.
```sh
- npm install
```
Iniciar proyecto

```sh
npm start
```
# Preparar data para Endpoint "GenerateCompleteQuadratures"
En algún editor de texto (de preferencia VSCode) dejar la lista de folios y externalCompanyId separados por punto y coma (;) como se ve a continuación:
```sh
folio;externalCompanyId
folio;externalCompanyId
folio;externalCompanyId
folio;externalCompanyId
```
Luego, realizar la siguiente búsqueda:
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