import NextAuth from "next-auth";

export async function GET(req, res) {
	const { getAuthOptions } = await import("@/lib/auth/options");
	const authOptions = await getAuthOptions();
	const handler = NextAuth(authOptions);
	return handler(req, res);
}

export async function POST(req, res) {
	const { getAuthOptions } = await import("@/lib/auth/options");
	const authOptions = await getAuthOptions();
	const handler = NextAuth(authOptions);
	return handler(req, res);
}
