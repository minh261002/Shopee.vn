"use client"

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthWithRecaptcha } from '@/hooks/use-auth-with-recaptcha'
import { ErrorContext } from 'better-auth/react'
import { Loader2, MailIcon } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const LoginForm = () => {
    const router = useRouter();
    const { sendVerificationOtpWithRecaptcha, signInSocialWithRecaptcha } = useAuthWithRecaptcha();

    const [isGooglePending, startGoogleTransition] = useTransition();
    const [isEmailPending, startEmailTransition] = useTransition();
    const [email, setEmail] = useState<string>("");


    async function handleGoogleSignIn() {
        startGoogleTransition(async () => {
            try {
                await signInSocialWithRecaptcha({
                    provider: "google",
                    callbackURL: "/",
                    onSuccess: () => {
                        toast.success("Login successful, redirecting...");
                    },
                    onError: (error: ErrorContext) => {
                        toast.error(error.error?.message || "Login failed, please try again.");
                    },
                });
            } catch {
                toast.error("reCAPTCHA verification failed. Please try again.");
            }
        })
    }

    async function handleEmailSignIn() {
        startEmailTransition(async () => {
            try {
                await sendVerificationOtpWithRecaptcha({
                    email: email,
                    type: "sign-in",
                    onSuccess: () => {
                        toast.success("OTP sent to email");
                        router.push(`/verify-request?email=${email}`);
                    },
                    onError: (error: ErrorContext) => {
                        toast.error(error.error?.message || "Failed to send OTP");
                    },
                });
            } catch {
                toast.error("reCAPTCHA verification failed. Please try again.");
            }
        })
    }

    return (
        <Card>
            <CardHeader className='text-center'>
                <CardTitle className='text-xl'>Welcome back !</CardTitle>
                <CardDescription>Login with Email or Google Account to continue</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
                <Button onClick={handleGoogleSignIn}
                    className='w-full cursor-pointer'
                    variant='outline'
                    disabled={isGooglePending}
                >

                    {isGooglePending ? (
                        <Loader2 className='size-4 mr-2 animate-spin' />
                    ) : (
                        <>
                            <Image src="/images/google.png" alt="google" width={20} height={20} className='mr-2' />   Continue with Google
                        </>
                    )}
                </Button>

                <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
                    <span className='relative z-10 bg-card px-2 text-muted-foreground'>Or continue with</span>
                </div>

                <div className="grid gap-3">
                    <div className="grid gap-2">
                        <Label htmlFor='email'>Email</Label>
                        <Input
                            id='email'
                            placeholder='Enter your email'
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <Button
                    onClick={handleEmailSignIn}
                    className='w-full cursor-pointer'
                    disabled={isEmailPending || !email}
                >
                    {isEmailPending ? (
                        <Loader2 className='size-4 mr-2 animate-spin' />
                    ) : (
                        <>
                            <MailIcon className="size-4 mr-2" />
                            Continue with Email
                        </>
                    )}
                </Button>

                <p className='text-xs text-muted-foreground text-center mt-2'>
                    This site is protected by reCAPTCHA and the Google{' '}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Terms of Service
                    </a>{' '}
                    apply.
                </p>
            </CardContent>
        </Card>
    )
}

export default LoginForm