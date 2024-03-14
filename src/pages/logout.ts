import { lucia } from "../lib/auth";
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
	return context.redirect("/");
}

export async function POST(context: APIContext): Promise<Response> {
	if (!context.locals.session) {
		return context.redirect("/login");
	}

	await lucia.invalidateSession(context.locals.session.id);

	const sessionCookie = lucia.createBlankSessionCookie();
	context.cookies.set(
		sessionCookie.name,
		sessionCookie.value,
		sessionCookie.attributes,
	);

	context.locals.session = null;
	context.locals.isLoggedIn = false;
	context.locals.user = null;
	context.locals.dbUser = null;

	return context.redirect("/");
}
