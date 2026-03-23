interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface LinkedInUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture?: string;
  email?: string;
}

export class LinkedInClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  static getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
      state,
      scope: "openid profile email w_member_social",
    });
    return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
  }

  static async refreshToken(
    refreshToken: string
  ): Promise<LinkedInTokenResponse> {
    const response = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: process.env.LINKEDIN_CLIENT_ID!,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `LinkedIn token refresh failed: ${response.status} ${errorBody}`
      );
    }

    return response.json();
  }

  static async exchangeCodeForToken(
    code: string
  ): Promise<LinkedInTokenResponse> {
    const response = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: process.env.LINKEDIN_CLIENT_ID!,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
          redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`LinkedIn token exchange failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserInfo(): Promise<LinkedInUserInfo> {
    const response = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch LinkedIn userinfo: ${response.statusText}`);
    }

    return response.json();
  }

  async createPost(
    authorId: string,
    text: string,
    mediaUrls?: string[]
  ): Promise<string> {
    const body: Record<string, unknown> = {
      author: `urn:li:person:${authorId}`,
      commentary: text,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
      },
      lifecycleState: "PUBLISHED",
    };

    if (mediaUrls?.length) {
      body.content = {
        multiImage: {
          images: mediaUrls.map((url) => ({
            altText: "",
            id: url,
          })),
        },
      };
    }

    const response = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202401",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to create LinkedIn post: ${response.status} ${errorBody}`);
    }

    // The post ID is returned in the x-restli-id header
    const postId = response.headers.get("x-restli-id") ?? "";
    return postId;
  }

  async deletePost(postId: string): Promise<void> {
    const encodedId = encodeURIComponent(postId);
    const response = await fetch(
      `https://api.linkedin.com/rest/posts/${encodedId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "LinkedIn-Version": "202401",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      const errorBody = await response.text();
      throw new Error(`Failed to delete LinkedIn post: ${response.status} ${errorBody}`);
    }
  }
}
