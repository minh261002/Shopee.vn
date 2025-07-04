import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useCallback } from "react";

export const useRecaptcha = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const getReCaptchaToken = useCallback(
    async (action: string): Promise<string | null> => {
      if (!executeRecaptcha) {
        console.warn("Execute recaptcha not yet available");
        return null;
      }

      try {
        const token = await executeRecaptcha(action);
        return token;
      } catch (error) {
        console.error("Failed to execute reCAPTCHA:", error);
        return null;
      }
    },
    [executeRecaptcha]
  );

  return { getReCaptchaToken };
};
