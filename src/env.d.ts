/// <reference path="../.astro/db-types.d.ts" />
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type User = typeof import("astro:db").User.$inferSelect;

interface ImportMetaEnv {
	readonly GITHUB_CLIENT_ID: string;
	readonly GITHUB_CLIENT_SECRET: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare namespace App {
	interface Locals {
		session: import("lucia").Session | null;
		user: import("lucia").User | null;
		dbUser: User | null;
		isLoggedIn: boolean;
	}
}
