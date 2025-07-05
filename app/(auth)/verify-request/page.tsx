"use client"

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { useAuthWithRecaptcha } from '@/hooks/use-auth-with-recaptcha'
import { ErrorContext } from 'better-auth/react'
import { Loader2, MailCheckIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState, useTransition } from 'react'
import { toast } from 'sonner'

const VerifyRequestContent = () => {
    const [otp, setOtp] = useState('')
    const [emailPending, startEmailTransition] = useTransition()
    const { signInEmailOtpWithRecaptcha } = useAuthWithRecaptcha()

    const params = useSearchParams()
    const router = useRouter()

    const email = params.get('email') as string;

    const isCompleted = otp.length === 6;

    function handleVerify() {
        startEmailTransition(async () => {
            try {
                await signInEmailOtpWithRecaptcha({
                    email: email,
                    otp: otp,
                    onSuccess: () => {
                        toast.success('Email xác thực thành công');
                        router.push('/api/auth/callback');
                    },
                    onError: (error: ErrorContext) => {
                        toast.error(error.error?.message || 'Lỗi xác thực email');
                    }
                });
            } catch {
                toast.error("Lỗi xác thực reCAPTCHA. Vui lòng thử lại.");
            }
        })
    }

    return (
        <Card className='w-[400px] py-10'>
            <CardHeader className='text-center'>
                <CardTitle className='text-xl'>
                    Vui lòng kiểm tra email của bạn
                </CardTitle>
                <CardDescription>
                    Chúng tôi đã gửi mã xác thực đến địa chỉ email của bạn. Vui lòng nhập mã bên dưới.
                </CardDescription>
            </CardHeader>

            <CardContent className='flex flex-col gap-4 items-center'>
                <div className='flex justify-center'>
                    <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)} className='gap-2' >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>
                <span className='text-sm text-muted-foreground'>
                    Nhập mã đã gửi đến địa chỉ email của bạn.
                </span>

                <Button
                    onClick={handleVerify}
                    disabled={emailPending || !isCompleted}
                    className='w-full cursor-pointer'
                >
                    {
                        emailPending ? (
                            <Loader2 className='w-4 h-4 animate-spin' />
                        ) : (
                            <>
                                <MailCheckIcon className='w-4 h-4' />
                                Xác thực
                            </>
                        )
                    }
                </Button>

                <Link href={`/login?email=${email}`} className='text-sm text-muted-foreground'>
                    Không nhận được mã? <span className='text-primary'>Gửi lại</span>
                </Link>

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

const VerifyRequest = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyRequestContent />
        </Suspense>
    )
}

export default VerifyRequest