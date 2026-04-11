# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

| Evento | Descripcion                       | Formato | Modo Envio |
|--------|-----------------------------     |-------|---------|
| AFS    | llegada                          | XML   | SFTP     |
| DPU    | Salida                           | XML   | SFTP     |
| EXR    | Inspeccion aduana Mexicana       | XML   | SFTP     |
| ECC    | Modulacion aduana Mex            | XML   | SFTP     |
| ILR    | Inspeccion aduana USA            | XML   | SFTP     |
| CLR    | Modulacion aduana USA            | XML   | SFTP     |
| ST1    | Desviacion de yarda / Resguardo  | XML   | SFTP     |
| TSC    | Entrega                          | XML   | SFTP     |

```
Estructura de Archivo (todo el nombre en uppercase)
scac_referencia_evento_yyyymmddhhmmss.xml
```

Ejemplo:
GALA_92B1341866_CLR_20260305121126.xml 
```
Contenido del XML dentro de la adenda:
```

|tag | Elementos|
|----|------|
|AvisoEventos|ReferenciaExpd|
||TipoOperacion|
||CodigoTransportista|
||ReferenciaTransportista|
||CodigoEvento|
||FechaHoraEvento|
||Comentarios|



``` 
Estructura del Archivo XML:

<AvisoEventos ReferenciaExpd="92B1319284" TipoOperacion="2" CodigoTransportista="GALA" ReferenciaTransportista="92B1319284" CodigoEvento="AFS" FechaHoraEvento="2025-10-30T18:05:00" Comentarios="Llegando a Patio Origen"/>

```
```
<AvisoEventos ReferenciaExpd=REFERECIA_EXPEDITORS TipoOperacion="2" CodigoTransportista=SCAC ReferenciaTransportista=NUMERO_SEGUIMIENTO_TRANSFER CodigoEvento=EVENTO FechaHoraEvento=YYYY-MM-DDTHH:MM:SS Comentarios=ESTATUS/RECIBE/>

```

