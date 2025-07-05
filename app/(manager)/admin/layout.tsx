import { RequireRole } from '@/components/layouts/RequireRole'
import React from 'react'

const AdminCheckLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <RequireRole role="ADMIN">
            {children}
        </RequireRole>
    )
}

export default AdminCheckLayout