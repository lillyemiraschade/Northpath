import { db } from "@/lib/db";
import { LinkedInClient } from "@/lib/linkedin";

const REFRESH_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function getLinkedInClient(
  accountId: string
): Promise<LinkedInClient> {
  const account = await db.linkedInAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new Error(`LinkedIn account not found: ${accountId}`);
  }

  const now = new Date();
  const msUntilExpiry = account.tokenExpiresAt.getTime() - now.getTime();

  if (msUntilExpiry < REFRESH_THRESHOLD_MS) {
    if (!account.refreshToken) {
      throw new Error(
        `LinkedIn account ${accountId} token is expiring soon but no refresh token is available. The user must re-authenticate.`
      );
    }

    const tokenData = await LinkedInClient.refreshToken(account.refreshToken);

    const newExpiresAt = new Date(
      Date.now() + tokenData.expires_in * 1000
    );

    await db.linkedInAccount.update({
      where: { id: accountId },
      data: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token ?? account.refreshToken,
        tokenExpiresAt: newExpiresAt,
      },
    });

    return new LinkedInClient(tokenData.access_token);
  }

  return new LinkedInClient(account.accessToken);
}
