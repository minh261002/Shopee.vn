"use client";

import React from 'react';
import { ChevronRight, FolderOpen } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface CategoryLayoutProps {
    children: React.ReactNode;
}

const CategoryLayout = ({ children }: CategoryLayoutProps) => {
    const pathname = usePathname();

    const getBreadcrumbs = () => {
        const segments = pathname.split('/').filter(Boolean);
        const breadcrumbs = [
            { name: 'Dashboard', href: '/admin/dashboard' },
            { name: 'Danh mục', href: '/admin/categories' },
        ];

        if (segments.includes('new')) {
            breadcrumbs.push({ name: 'Thêm mới', href: '/admin/categories/new' });
        } else if (segments.length > 2) {
            const id = segments[2];
            if (segments.includes('edit')) {
                breadcrumbs.push({ name: 'Chỉnh sửa', href: `/admin/categories/${id}/edit` });
            } else {
                breadcrumbs.push({ name: 'Chi tiết', href: `/admin/categories/${id}` });
            }
        }

        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <div className="space-y-6 w-full max-w-screen-xl mx-auto">
            <div className='flex items-center justify-between'>
                {/* Page Icon */}
                <div className="flex items-center gap-2 text-muted-foreground">
                    <FolderOpen className="h-5 w-5" />
                    <span className="text-sm">Quản lý danh mục</span>
                </div>
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
                    {breadcrumbs.map((breadcrumb, index) => (
                        <React.Fragment key={breadcrumb.href}>
                            {index > 0 && <ChevronRight className="h-4 w-4" />}
                            <Link
                                href={breadcrumb.href}
                                className={`hover:text-foreground transition-colors ${index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''
                                    }`}
                            >
                                {breadcrumb.name}
                            </Link>
                        </React.Fragment>
                    ))}
                </nav>
            </div>

            {children}
        </div>
    );
};

export default CategoryLayout; 