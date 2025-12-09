/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CW_CLIENT_ID: string;
  readonly VITE_CW_PUBLIC_KEY: string;
  readonly VITE_CW_PRIVATE_KEY: string;
  readonly VITE_CW_BASE_URL: string;
  readonly VITE_CW_COMPANY_ID: string;
  readonly VITE_OPENAI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

