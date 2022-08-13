/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_USER_AGENT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
