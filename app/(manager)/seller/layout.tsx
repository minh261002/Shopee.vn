import { RequireRole } from '@/components/layouts/RequireRole'
import React from 'react'

const SellerCheckLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <RequireRole role="SELLER">
            {children}
        </RequireRole>
    )
}

export default SellerCheckLayout