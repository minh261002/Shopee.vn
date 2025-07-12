"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Store, Phone, Globe, MapPin, Building2, FileText, BarChart3, Star, Users, ShoppingBag, DollarSign, ImageIcon, Calendar } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useStore } from '@/providers/store-context'

const SellerDashboard = () => {
    const { currentStore, isLoading } = useStore()

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!currentStore) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Vui lòng chọn cửa hàng để xem thông tin</p>
            </div>
        );
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
                            <p className="text-lg">{currentStore.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Loại hình</p>
                            <Badge>{currentStore.type}</Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Trạng thái</p>
                            <Badge
                                variant={
                                    currentStore.status === 'ACTIVE' ? 'default' :
                                        currentStore.status === 'PENDING_APPROVAL' ? 'secondary' :
                                            currentStore.status === 'SUSPENDED' ? 'destructive' :
                                                'outline'
                                }
                            >
                                {currentStore.status}
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
                                <p>{currentStore.phone || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium flex items-center gap-1">
                                    <Globe className="w-4 h-4" /> Website
                                </p>
                                <p>{currentStore.website || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium flex items-center gap-1">
                                    <Globe className="w-4 h-4" /> Email
                                </p>
                                <p>{currentStore.email || 'Chưa cập nhật'}</p>
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
                            <p>{currentStore.address}</p>
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
                                <p>{currentStore.businessName || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Địa chỉ doanh nghiệp</p>
                                <p>{currentStore.businessAddress || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Mã số thuế</p>
                                <p>{currentStore.taxCode || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Giấy phép kinh doanh</p>
                                <p>{currentStore.businessLicense || 'Chưa cập nhật'}</p>
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
                                <p className="whitespace-pre-wrap">{currentStore.returnPolicy || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Chính sách vận chuyển</p>
                                <p className="whitespace-pre-wrap">{currentStore.shippingPolicy || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Chính sách bảo hành</p>
                                <p className="whitespace-pre-wrap">{currentStore.warrantyPolicy || 'Chưa cập nhật'}</p>
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
                                {currentStore.facebookUrl ? (
                                    <a href={currentStore.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                        {currentStore.facebookUrl}
                                    </a>
                                ) : (
                                    <p>Chưa cập nhật</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium">Instagram</p>
                                {currentStore.instagramUrl ? (
                                    <a href={currentStore.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                        {currentStore.instagramUrl}
                                    </a>
                                ) : (
                                    <p>Chưa cập nhật</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium">Youtube</p>
                                {currentStore.youtubeUrl ? (
                                    <a href={currentStore.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                        {currentStore.youtubeUrl}
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
                                <Badge variant={currentStore.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                    {currentStore.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm ngưng'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Nổi bật</p>
                                <Badge variant={currentStore.isFeatured ? 'default' : 'secondary'}>
                                    {currentStore.isFeatured ? 'Có' : 'Không'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Xác thực</p>
                                <Badge variant={currentStore.isVerified ? 'default' : 'secondary'}>
                                    {currentStore.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
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
                                <p className="text-xl font-semibold">{currentStore.rating.toFixed(1)}/5</p>
                                <p className="text-sm text-muted-foreground">({currentStore.reviewCount} đánh giá)</p>
                            </div>
                            <div className="p-4 bg-secondary/10 rounded-lg">
                                <p className="text-sm font-medium flex items-center gap-1 mb-2">
                                    <Users className="w-4 h-4" />
                                    Người theo dõi
                                </p>
                                <p className="text-xl font-semibold">{currentStore.followerCount}</p>
                            </div>
                            <div className="p-4 bg-secondary/10 rounded-lg">
                                <p className="text-sm font-medium flex items-center gap-1 mb-2">
                                    <ShoppingBag className="w-4 h-4" />
                                    Sản phẩm & Đơn hàng
                                </p>
                                <p className="text-xl font-semibold">{currentStore.totalProducts}</p>
                                <p className="text-sm text-muted-foreground">({currentStore.totalOrders} đơn)</p>
                            </div>
                            <div className="p-4 bg-secondary/10 rounded-lg">
                                <p className="text-sm font-medium flex items-center gap-1 mb-2">
                                    <DollarSign className="w-4 h-4" />
                                    Doanh thu
                                </p>
                                <p className="text-xl font-semibold">{currentStore.totalRevenue.toLocaleString('vi-VN')}đ</p>
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
                                {currentStore.logo ? (
                                    <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                                        <Image
                                            src={currentStore.logo}
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
                                {currentStore.banner ? (
                                    <div className="relative w-full h-40 rounded-lg overflow-hidden">
                                        <Image
                                            src={currentStore.banner}
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
                                <p>{format(new Date(currentStore.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Cập nhật lần cuối</p>
                                <p>{format(new Date(currentStore.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default SellerDashboard