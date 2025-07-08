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
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

const LoginForm = () => {
    const router = useRouter();
    const { sendVerificationOtpWithRecaptcha, signInSocialWithRecaptcha } = useAuthWithRecaptcha();
    const { success, error: showError, info } = useToast();

    const [isGooglePending, startGoogleTransition] = useTransition();
    const [isEmailPending, startEmailTransition] = useTransition();
    const [email, setEmail] = useState<string>("");


    async function handleGoogleSignIn() {
        startGoogleTransition(async () => {
            try {
                await signInSocialWithRecaptcha({
                    provider: "google",
                    callbackURL: "/api/auth/callback",
                    onSuccess: () => {
                        info("Đang chuyển hướng...");
                    },
                    onError: (error: ErrorContext) => {
                        showError(error.error?.message || "Lỗi đăng nhập. Vui lòng thử lại.");
                    },
                });
            } catch {
                showError("Lỗi xác thực reCAPTCHA. Vui lòng thử lại.");
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
                        success("OTP đã được gửi đến email");
                        router.push(`/verify-request?email=${email}`);
                    },
                    onError: (error: ErrorContext) => {
                        showError(error.error?.message || "Lỗi gửi OTP");
                    },
                });
            } catch {
                showError("Lỗi xác thực reCAPTCHA. Vui lòng thử lại.");
            }
        })
    }

    return (
        <Card className='w-[400px] py-10'>
            <CardHeader className='text-center'>
                <CardTitle className='text-xl'>
                    Shopee Xin Chào !
                </CardTitle>
                <CardDescription>
                    Đăng nhập với Email hoặc tài khoản Google
                </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
                <Button onClick={handleGoogleSignIn}
                    className='w-full cursor-pointer h-10'
                    variant='outline'
                    disabled={isGooglePending}
                >

                    {isGooglePending ? (
                        <Loader2 className='size-4 mr-2 animate-spin' />
                    ) : (
                        <>
                            <Image src="/images/google.png" alt="google" width={20} height={20} className='mr-2' />   Đăng nhập với Google
                        </>
                    )}
                </Button>

                <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
                    <span className='relative z-10 bg-card px-2 text-muted-foreground'>Hoặc đăng nhập với</span>
                </div>

                <div className="grid gap-3">
                    <div className="grid gap-2">
                        <Label htmlFor='email'>Email</Label>
                        <Input
                            id='email'
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='h-10'
                        />
                    </div>
                </div>

                <Button
                    onClick={handleEmailSignIn}
                    className='w-full cursor-pointer h-10'
                    disabled={isEmailPending || !email}
                >
                    {isEmailPending ? (
                        <Loader2 className='size-4 mr-2 animate-spin' />
                    ) : (
                        <>
                            <MailIcon className="size-4 mr-2" />
                            Đăng nhập với Email
                        </>
                    )}
                </Button>

                <p className='text-xs text-muted-foreground text-center mt-2'>
                    Trang web này được bảo vệ bởi reCAPTCHA và Google <br />
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Chính sách bảo mật
                    </a>{' '}
                    và{' '}
                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Điều khoản dịch vụ
                    </a>{' '}
                    được áp dụng.
                </p>
            </CardContent>
        </Card>
    )
}

export default LoginForm