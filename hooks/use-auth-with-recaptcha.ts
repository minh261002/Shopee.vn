import { authClient } from "@/providers/auth-client";
import { useRecaptcha } from "./use-recaptcha";
import { ErrorContext } from "better-auth/react";

export const useAuthWithRecaptcha = () => {
  const { getReCaptchaToken } = useRecaptcha();

  const sendVerificationOtpWithRecaptcha = async (params: {
    email: string;
    type: "sign-in" | "email-verification" | "forget-password";
    onSuccess?: () => void;
    onError?: (error: ErrorContext) => void;
  }) => {
    const recaptchaToken = await getReCaptchaToken("email_login");
    if (!recaptchaToken) {
      throw new Error("reCAPTCHA verification failed");
    }

    // Verify reCAPTCHA on client side first (optional additional check)
    const response = await fetch("/api/verify-recaptcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: recaptchaToken, action: "email_login" }),
    });

    if (!response.ok) {
      throw new Error("reCAPTCHA verification failed");
    }

    return authClient.emailOtp.sendVerificationOtp({
      email: params.email,
      type: params.type,
      fetchOptions: {
        onSuccess: params.onSuccess,
        onError: params.onError,
      },
    });
  };

  const signInEmailOtpWithRecaptcha = async (params: {
    email: string;
    otp: string;
    onSuccess?: () => void;
    onError?: (error: ErrorContext) => void;
  }) => {
    const recaptchaToken = await getReCaptchaToken("verify_email");
    if (!recaptchaToken) {
      throw new Error("reCAPTCHA verification failed");
    }

    // Verify reCAPTCHA on client side first (optional additional check)
    const response = await fetch("/api/verify-recaptcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: recaptchaToken, action: "verify_email" }),
    });

    if (!response.ok) {
      throw new Error("reCAPTCHA verification failed");
    }

    return authClient.signIn.emailOtp({
      email: params.email,
      otp: params.otp,
      fetchOptions: {
        onSuccess: params.onSuccess,
        onError: params.onError,
      },
    });
  };

  const signInSocialWithRecaptcha = async (params: {
    provider: string;
    callbackURL?: string;
    onSuccess?: () => void;
    onError?: (error: ErrorContext) => void;
  }) => {
    const recaptchaToken = await getReCaptchaToken("google_login");
    if (!recaptchaToken) {
      throw new Error("reCAPTCHA verification failed");
    }

    // Verify reCAPTCHA on client side first (optional additional check)
    const response = await fetch("/api/verify-recaptcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: recaptchaToken, action: "google_login" }),
    });

    if (!response.ok) {
      throw new Error("reCAPTCHA verification failed");
    }

    return authClient.signIn.social({
      provider: params.provider,
      callbackURL: params.callbackURL || "/",
      fetchOptions: {
        onSuccess: params.onSuccess,
        onError: params.onError,
      },
    });
  };

  return {
    sendVerificationOtpWithRecaptcha,
    signInEmailOtpWithRecaptcha,
    signInSocialWithRecaptcha,
  };
};
