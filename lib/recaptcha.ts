interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export async function verifyRecaptcha(token: string): Promise<{
  success: boolean;
  score?: number;
  error?: string;
}> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    return {
      success: false,
      error: "reCAPTCHA secret key not configured",
    };
  }

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const data: RecaptchaResponse = await response.json();

    if (!data.success) {
      return {
        success: false,
        error:
          data["error-codes"]?.join(", ") || "reCAPTCHA verification failed",
      };
    }

    // For reCAPTCHA v3, check the score (0.0 to 1.0)
    // Higher scores indicate the user is more likely to be human
    const minimumScore = 0.5;
    if (data.score !== undefined && data.score < minimumScore) {
      return {
        success: false,
        score: data.score,
        error: `reCAPTCHA score too low: ${data.score}`,
      };
    }

    return {
      success: true,
      score: data.score,
    };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return {
      success: false,
      error: "Failed to verify reCAPTCHA",
    };
  }
}
