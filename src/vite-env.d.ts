/// <reference types="vite/client" />

enum Mode {
  DEV = 'development',
  PROD = 'production',
}

interface ViteEnv {
  readonly VITE_API_USER_AGENT: string
}

interface ImportMetaEnv extends ViteEnv {
  readonly BASE_URL: string
  readonly SSR: boolean
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: Mode
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
