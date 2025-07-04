import LoginForm from './_components/LoginForm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation';

const LoginPage = async () => {

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session) return redirect("/");

    return (
        <LoginForm />
    )
}

export default LoginPage