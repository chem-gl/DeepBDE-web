# @

## Flujo de uso de la API (Español) - `POST /api/v1/predict/` — Obtén información enriquecida de la molécula: SMILES canónico, imagen SVG, posiciones de átomos y enlaces, ID único. - `POST /api/v1/predict/single/` — Predice la BDE para un enlace específico de una molécula. - `POST /api/v1/predict/multiple/` — Predice las BDEs para varios enlaces de una molécula. - `POST /api/v1/fragment/` — Genera fragmentos moleculares en formato SMILES y/o XYZ, con valores de BDE para cada fragmento. - `POST /api/v1/predict/check/` — Valida productos de escisión y compara con los fragmentos predichos, incluyendo el cálculo de BDE. - `POST /api/v1/infer/all/` — Predice las BDEs para todos los enlaces simples de una molécula. - `POST /api/v1/download_report/` — Descarga un informe TXT  con los resultados de predicción y fragmentación. - `POST /api/v1/predict/info-smile-canonical/` — Obtén el SMILES canónico y el ID único de una molécula.  ## API usage flow (English) - `POST /api/v1/predict/` — Get enriched molecule info: canonical SMILES, SVG image, atom and bond positions, and unique ID. - `POST /api/v1/predict/single/` — Predict the BDE for a specific bond in a molecule. - `POST /api/v1/predict/multiple/` — Predict BDEs for multiple bonds in a molecule. - `POST /api/v1/fragment/` — Generate molecular fragments in SMILES and/or XYZ format, with BDE values for each fragment. - `POST /api/v1/predict/check/` — Validate cleavage products and compare with predicted fragments, including BDE calculation. - `POST /api/v1/infer/all/` — Predict BDEs for all single bonds in a molecule. - `POST /api/v1/download_report/` — Download a TXT report with prediction and fragmentation results. - `POST /api/v1/predict/info-smile-canonical/` — Get the canonical SMILES and unique ID for a molecule.

The version of the OpenAPI document: 1.0.0

## Building

To install the required dependencies and to build the typescript sources run:

```console
npm install
npm run build
```

## Publishing

First build the package then run `npm publish dist` (don't forget to specify the `dist` folder!)

## Consuming

Navigate to the folder of your consuming project and run one of next commands.

_published:_

```console
npm install @ --save
```

_without publishing (not recommended):_

```console
npm install PATH_TO_GENERATED_PACKAGE/dist.tgz --save
```

_It's important to take the tgz file, otherwise you'll get trouble with links on windows_

_using `npm link`:_

In PATH_TO_GENERATED_PACKAGE/dist:

```console
npm link
```

In your project:

```console
npm link 
```

__Note for Windows users:__ The Angular CLI has troubles to use linked npm packages.
Please refer to this issue <https://github.com/angular/angular-cli/issues/8284> for a solution / workaround.
Published packages are not effected by this issue.

### General usage

In your Angular project:

```typescript
// without configuring providers
import { ApiModule } from '';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    imports: [
        ApiModule,
        // make sure to import the HttpClientModule in the AppModule only,
        // see https://github.com/angular/angular/issues/20575
        HttpClientModule
    ],
    declarations: [ AppComponent ],
    providers: [],
    bootstrap: [ AppComponent ]
})
export class AppModule {}
```

```typescript
// configuring providers
import { ApiModule, Configuration, ConfigurationParameters } from '';

export function apiConfigFactory (): Configuration {
  const params: ConfigurationParameters = {
    // set configuration parameters here.
  }
  return new Configuration(params);
}

@NgModule({
    imports: [ ApiModule.forRoot(apiConfigFactory) ],
    declarations: [ AppComponent ],
    providers: [],
    bootstrap: [ AppComponent ]
})
export class AppModule {}
```

```typescript
// configuring providers with an authentication service that manages your access tokens
import { ApiModule, Configuration } from '';

@NgModule({
    imports: [ ApiModule ],
    declarations: [ AppComponent ],
    providers: [
      {
        provide: Configuration,
        useFactory: (authService: AuthService) => new Configuration(
          {
            basePath: environment.apiUrl,
            accessToken: authService.getAccessToken.bind(authService)
          }
        ),
        deps: [AuthService],
        multi: false
      }
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule {}
```

```typescript
import { DefaultApi } from '';

export class AppComponent {
    constructor(private apiGateway: DefaultApi) { }
}
```

Note: The ApiModule is restricted to being instantiated once app wide.
This is to ensure that all services are treated as singletons.

### Using multiple OpenAPI files / APIs / ApiModules

In order to use multiple `ApiModules` generated from different OpenAPI files,
you can create an alias name when importing the modules
in order to avoid naming conflicts:

```typescript
import { ApiModule } from 'my-api-path';
import { ApiModule as OtherApiModule } from 'my-other-api-path';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    ApiModule,
    OtherApiModule,
    // make sure to import the HttpClientModule in the AppModule only,
    // see https://github.com/angular/angular/issues/20575
    HttpClientModule
  ]
})
export class AppModule {

}
```

### Set service base path

If different than the generated base path, during app bootstrap, you can provide the base path to your service.

```typescript
import { BASE_PATH } from '';

bootstrap(AppComponent, [
    { provide: BASE_PATH, useValue: 'https://your-web-service.com' },
]);
```

or

```typescript
import { BASE_PATH } from '';

@NgModule({
    imports: [],
    declarations: [ AppComponent ],
    providers: [ provide: BASE_PATH, useValue: 'https://your-web-service.com' ],
    bootstrap: [ AppComponent ]
})
export class AppModule {}
```

### Using @angular/cli

First extend your `src/environments/*.ts` files by adding the corresponding base path:

```typescript
export const environment = {
  production: false,
  API_BASE_PATH: 'http://127.0.0.1:8080'
};
```

In the src/app/app.module.ts:

```typescript
import { BASE_PATH } from '';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [ ],
  providers: [{ provide: BASE_PATH, useValue: environment.API_BASE_PATH }],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
```

### Customizing path parameter encoding

Without further customization, only [path-parameters][parameter-locations-url] of [style][style-values-url] 'simple'
and Dates for format 'date-time' are encoded correctly.

Other styles (e.g. "matrix") are not that easy to encode
and thus are best delegated to other libraries (e.g.: [@honoluluhenk/http-param-expander]).

To implement your own parameter encoding (or call another library),
pass an arrow-function or method-reference to the `encodeParam` property of the Configuration-object
(see [General Usage](#general-usage) above).

Example value for use in your Configuration-Provider:

```typescript
new Configuration({
    encodeParam: (param: Param) => myFancyParamEncoder(param),
})
```

[parameter-locations-url]: https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameter-locations
[style-values-url]: https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#style-values
[@honoluluhenk/http-param-expander]: https://www.npmjs.com/package/@honoluluhenk/http-param-expander
