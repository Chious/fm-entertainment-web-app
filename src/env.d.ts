/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly TMDB_APIKEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    user: import("better-auth").User | null;
    session: import("better-auth").Session | null;
  }
}
