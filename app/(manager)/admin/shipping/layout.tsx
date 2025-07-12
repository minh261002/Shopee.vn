import { ReactNode } from 'react'

interface ShippingLayoutProps {
    children: ReactNode
}

export default function ShippingLayout({ children }: ShippingLayoutProps) {
    return (
        <div className="container mx-auto py-6">
            {children}
        </div>
    )
} 