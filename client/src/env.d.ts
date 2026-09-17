/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del backend, p. ej. https://mi-api.vercel.app */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
