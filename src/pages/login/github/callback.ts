import type { APIContext } from "astro";

import { github, lucia } from "../../../lib/auth";
import { OAuth2RequestError } from "arctic";
import { db, User, eq } from "astro:db";

export async function GET(context: APIContext): Promise<Response> {
	const code = context.url.searchParams.get("code");
	const state = context.url.searchParams.get("state");
	const storedState = context.cookies.get("github_oauth_state")?.value ?? null;
	if (!code || !state || !storedState || state !== storedState) {
		// return new Response(null, {
		// 	status: 403,
		// });
		return context.redirect("/login");
	}

	try {
		const tokens = await github.validateAuthorizationCode(code);
		const githubUserResponse = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`,
			},
		});

		const githubUser: GitHubUser = await githubUserResponse.json();
		const {
			id: githubId,
			login: username,
			name,
			email,
			avatar_url: avatar,
		} = githubUser;

		const existingUser = await db
			.select()
			.from(User)
			.where(eq(User.githubId, githubId))
			.get();

		if (existingUser) {
			const session = await lucia.createSession(existingUser.id.toString(), {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			context.cookies.set(
				sessionCookie.name,
				sessionCookie.value,
				sessionCookie.attributes,
			);
			return context.redirect("/");
		}

		const createdUser = await db
			.insert(User)
			.values({
				githubId,
				username,
				// A GitHub user doesn't have to have a name which would be `null` in that case.
				// As this would conflict with the db schema, we use the username as a fallback.
				name: name ?? username,
				email,
				avatar,
			})
			.returning()
			.get();

		const session = await lucia.createSession(createdUser.id.toString(), {});

		const sessionCookie = lucia.createSessionCookie(session.id);

		context.cookies.set(
			sessionCookie.name,
			sessionCookie.value,
			sessionCookie.attributes,
		);
		return context.redirect("/");
	} catch (e) {
		// the specific error message depends on the provider
		if (e instanceof OAuth2RequestError) {
			// invalid code
			return new Response(null, {
				status: 400,
			});
		}
		console.error(e);
		return new Response(null, {
			status: 500,
		});
	}
}

interface GitHubUser {
	id: number;
	login: string;
	avatar_url: string;
	name: string;
	blog: string;
	email: string;
}
