import type { auth } from "@/lib/auth" // Import the type of your server-side auth config
import { createAuthClient } from "better-auth/client"
import { inferAdditionalFields } from "better-auth/client/plugins"

// The `createAuthClient` function is used to create an auth client that can be used in the browser.
// It takes an optional configuration object that can be used to customize the client.
// We also use the `inferAdditionalFields` plugin to infer the additional fields from the server config.
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
})

// You can then export the various methods from the authClient that you want to use in your components.
// For example, to sign in with email and password:
// export const { signIn } = authClient;
// Or more specifically:
// export const signInWithEmail = authClient.signIn.email;
// export const signUpWithEmail = authClient.signUp.email;
// export const signOut = authClient.signOut;
// export const getSession = authClient.getSession;

// For simplicity, we'll export the whole client, but you might prefer to export specific functions.
export default authClient
