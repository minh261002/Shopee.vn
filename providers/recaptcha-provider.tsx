"use client"

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { ReactNode } from 'react'

interface RecaptchaProviderProps {
    children: ReactNode
}

export function RecaptchaProvider({ children }: RecaptchaProviderProps) {
    const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''

    if (!recaptchaSiteKey) {
        console.warn('NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set')
        return <>{children}</>
    }

    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={recaptchaSiteKey}
            scriptProps={{
                async: false,
                defer: false,
                appendTo: "head",
                nonce: undefined,
            }}
        >
            {children}
        </GoogleReCaptchaProvider>
    )
} 