export type AuthOptions = {
    user?: string;
    pass?: string;
    personalAccessToken?: string;
};

export const MISSING_AUTH_MESSAGE =
    "Missing configuration! You must provide either a username and password (or Cloud API token), or a personal access token.";

export function createAuthorizationToken(authOptions: AuthOptions): string | null {
    if (authOptions.personalAccessToken && authOptions.personalAccessToken.length > 0) {
        return `Bearer ${authOptions.personalAccessToken}`;
    }

    if (authOptions.user && authOptions.user.length > 0 && authOptions.pass && authOptions.pass.length > 0) {
        const encodedBasicToken = Buffer.from(`${authOptions.user}:${authOptions.pass}`).toString("base64");
        return `Basic ${encodedBasicToken}`;
    }

    return null;
}
