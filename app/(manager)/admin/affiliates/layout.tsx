"use client";

import { ChevronRight, UserCheck } from 'lucide-react';
import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface AffiliatesLayoutProps {
    children: React.ReactNode;
}

const AffiliatesLayout = ({ children }: AffiliatesLayoutProps) => {
    const pathname = usePathname();

    const getBreadcrumbs = () => {
        const segments = pathname.split('/').filter(Boolean);
        const breadcrumbs = [
            { name: 'Dashboard', href: '/admin/dashboard' },
            { name: 'Affiliate', href: '/admin/affiliates' },
        ];

        if (segments.includes('commissions')) {
            breadcrumbs.push({ name: 'Hoa hồng', href: '/admin/affiliates/commissions' });
        } else if (segments.includes('payouts')) {
            breadcrumbs.push({ name: 'Thanh toán', href: '/admin/affiliates/payouts' });
        } else if (segments.length > 2) {
            const id = segments[2];
            if (segments.includes('edit')) {
                breadcrumbs.push({ name: 'Chỉnh sửa', href: `/admin/affiliates/${id}/edit` });
            } else {
                breadcrumbs.push({ name: 'Chi tiết', href: `/admin/affiliates/${id}` });
            }
        }

        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
                {breadcrumbs.map((breadcrumb, index) => (
                    <React.Fragment key={breadcrumb.href}>
                        <Link
                            href={breadcrumb.href}
                            className="hover:text-foreground transition-colors"
                        >
                            {breadcrumb.name}
                        </Link>
                        {index < breadcrumbs.length - 1 && (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </React.Fragment>
                ))}
            </nav>

            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <UserCheck className="h-6 w-6" />
                    <h1 className="text-2xl font-bold">Quản lý Affiliate</h1>
                </div>
            </div>

            {/* Content */}
            {children}
        </div>
    );
};

export default AffiliatesLayout; 