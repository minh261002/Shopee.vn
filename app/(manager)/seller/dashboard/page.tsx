"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Store, Phone, Globe, MapPin, Building2, FileText, BarChart3, Star, Users, ShoppingBag, DollarSign, ImageIcon, Calendar } from 'lucide-react'
import Image from 'next/image'
import { api } from '@/lib/axios'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'
import type { StoreData } from '@/types/store'

const SellerDashboard = () => {
    const [store, setStore] = useState<StoreData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const response = await api.get('/stores/me');
                setStore(response.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStore();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-[200px] w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-[300px]" />
                    <Skeleton className="h-[300px]" />
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!store) {
        return <div>Không tìm thấy thông tin cửa hàng</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Store className="w-5 h-5" />
                        <CardTitle>Thông tin cửa hàng</CardTitle>
                    </div>
                    <CardDescription>Chi tiết và thống kê cửa hàng của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium">Tên cửa hàng</p>
                            <p className="text-lg">{store.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Loại hình</p>
                            <Badge>{store.type}</Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Trạng thái</p>
                            <Badge
                                variant={
                                    store.status === 'ACTIVE' ? 'default' :
                                        store.status === 'PENDING_APPROVAL' ? 'secondary' :
                                            store.status === 'SUSPENDED' ? 'destructive' :
                                                'outline'
                                }
                            >
                                {store.status}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Xác thực</p>
                            <Badge
                                variant={
                                    store.verificationStatus === 'VERIFIED' ? 'default' :
                                        store.verificationStatus === 'PENDING' ? 'secondary' :
                                            store.verificationStatus === 'REJECTED' ? 'destructive' :
                                                'outline'
                                }
                            >
                                {store.verificationStatus}
                            </Badge>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            Thông tin liên hệ
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium flex items-center gap-1">
                                    <Phone className="w-4 h-4" /> Điện thoại
                                </p>
                                <p>{store.phone || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium flex items-center gap-1">
                                    <Globe className="w-4 h-4" /> Website
                                </p>
                                <p>{store.website || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium flex items-center gap-1">
                                    <Globe className="w-4 h-4" /> Email
                                </p>
                                <p>{store.email || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Địa chỉ
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            <p className="text-sm font-medium">Địa chỉ chi tiết</p>
                            <p>{store.address}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm font-medium">Phường/Xã</p>
                                    <p>{store.ward || 'Chưa cập nhật'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Tỉnh/Thành phố</p>
                                    <p>{store.city || 'Chưa cập nhật'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Quốc gia</p>
                                    <p>{store.country}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Business Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Thông tin doanh nghiệp
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium">Tên doanh nghiệp</p>
                                <p>{store.businessName || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Địa chỉ doanh nghiệp</p>
                                <p>{store.businessAddress || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Mã số thuế</p>
                                <p>{store.taxCode || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Giấy phép kinh doanh</p>
                                <p>{store.businessLicense || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Policies */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Chính sách cửa hàng
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium">Chính sách đổi trả</p>
                                <p className="whitespace-pre-wrap">{store.returnPolicy || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Chính sách vận chuyển</p>
                                <p className="whitespace-pre-wrap">{store.shippingPolicy || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Chính sách bảo hành</p>
                                <p className="whitespace-pre-wrap">{store.warrantyPolicy || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Mạng xã hội
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium">Facebook</p>
                                {store.facebookUrl ? (
                                    <a href={store.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                        {store.facebookUrl}
                                    </a>
                                ) : (
                                    <p>Chưa cập nhật</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium">Instagram</p>
                                {store.instagramUrl ? (
                                    <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                        {store.instagramUrl}
                                    </a>
                                ) : (
                                    <p>Chưa cập nhật</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium">Youtube</p>
                                {store.youtubeUrl ? (
                                    <a href={store.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                        {store.youtubeUrl}
                                    </a>
                                ) : (
                                    <p>Chưa cập nhật</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Store Status */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Store className="w-5 h-5" />
                            Trạng thái hoạt động
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm font-medium">Hoạt động</p>
                                <Badge variant={store.isActive ? 'default' : 'secondary'}>
                                    {store.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Nổi bật</p>
                                <Badge variant={store.isFeatured ? 'default' : 'secondary'}>
                                    {store.isFeatured ? 'Có' : 'Không'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Xác thực</p>
                                <Badge variant={store.isVerified ? 'default' : 'secondary'}>
                                    {store.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Cửa hàng chính thức</p>
                                <Badge variant={store.isOfficialStore ? 'default' : 'secondary'}>
                                    {store.isOfficialStore ? 'Có' : 'Không'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Thống kê
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-secondary/10 rounded-lg">
                                <p className="text-sm font-medium flex items-center gap-1 mb-2">
                                    <Star className="w-4 h-4" />
                                    Đánh giá
                                </p>
                                <p className="text-xl font-semibold">{store.rating.toFixed(1)}/5</p>
                                <p className="text-sm text-muted-foreground">({store.reviewCount} đánh giá)</p>
                            </div>
                            <div className="p-4 bg-secondary/10 rounded-lg">
                                <p className="text-sm font-medium flex items-center gap-1 mb-2">
                                    <Users className="w-4 h-4" />
                                    Người theo dõi
                                </p>
                                <p className="text-xl font-semibold">{store.followerCount}</p>
                            </div>
                            <div className="p-4 bg-secondary/10 rounded-lg">
                                <p className="text-sm font-medium flex items-center gap-1 mb-2">
                                    <ShoppingBag className="w-4 h-4" />
                                    Sản phẩm & Đơn hàng
                                </p>
                                <p className="text-xl font-semibold">{store.totalProducts}</p>
                                <p className="text-sm text-muted-foreground">({store.totalOrders} đơn)</p>
                            </div>
                            <div className="p-4 bg-secondary/10 rounded-lg">
                                <p className="text-sm font-medium flex items-center gap-1 mb-2">
                                    <DollarSign className="w-4 h-4" />
                                    Doanh thu
                                </p>
                                <p className="text-xl font-semibold">{store.totalRevenue.toLocaleString('vi-VN')}đ</p>
                            </div>
                        </div>
                    </div>

                    {/* Store Images */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            Hình ảnh cửa hàng
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium mb-2">Logo</p>
                                {store.logo ? (
                                    <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                                        <Image
                                            src={store.logo}
                                            alt="Store logo"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 bg-secondary/10 rounded-lg flex items-center justify-center">
                                        <Store className="w-12 h-12 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-2">Banner</p>
                                {store.banner ? (
                                    <div className="relative w-full h-40 rounded-lg overflow-hidden">
                                        <Image
                                            src={store.banner}
                                            alt="Store banner"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-40 bg-secondary/10 rounded-lg flex items-center justify-center">
                                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Store Timestamps */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Thời gian
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium">Ngày tạo</p>
                                <p>{format(new Date(store.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Cập nhật lần cuối</p>
                                <p>{format(new Date(store.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default SellerDashboard