"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import { Plus, Trash2 } from 'lucide-react';
import type { ContentItem } from '@/types/banner';
import Image from 'next/image';
import { CloudinaryUpload } from '@/components/layouts/cloudinary-upload';

const BannerFormPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'HERO_BANNER',
        status: 'DRAFT',
        position: 'HOMEPAGE_HERO',
        priority: 0,
        startDate: '',
        endDate: '',
        isActive: true,
        targetAudience: 'ALL_USERS',
        geographicTarget: 'ALL_VIETNAM',
        backgroundColor: '',
        textColor: '',
        customCSS: '',
        showOnMobile: true,
        showOnTablet: true,
        showOnDesktop: true,
        clickTracking: true,
        impressionTracking: true,
        conversionTracking: true,
        isFlashSale: false,
        flashSaleEndTime: '',
        discountPercent: 0,
        originalPrice: 0,
        salePrice: 0,
        campaignId: searchParams.get('campaignId') || 'none',
    });

    const [items, setItems] = useState<ContentItem[]>([]);

    // Fetch campaigns for dropdown
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await api.get('/admin/campaigns?limit=100');
                setCampaigns(response.data.campaigns);
            } catch (error) {
                console.error('Error fetching campaigns:', error);
            }
        };
        fetchCampaigns();
    }, []);
    const [newItem, setNewItem] = useState({
        title: '',
        subtitle: '',
        description: '',
        image: '',
        imageAlt: '',
        linkUrl: '',
        linkText: '',
        openInNewTab: false,
        order: 0,
    });

    const bannerTypes = [
        { value: 'HERO_BANNER', label: 'Banner chính' },
        { value: 'FLASH_SALE_BANNER', label: 'Flash Sale' },
        { value: 'CATEGORY_BANNER', label: 'Danh mục' },
        { value: 'BRAND_BANNER', label: 'Thương hiệu' },
        { value: 'PRODUCT_BANNER', label: 'Sản phẩm' },
        { value: 'PROMOTION_BANNER', label: 'Khuyến mãi' },
        { value: 'SEASONAL_BANNER', label: 'Theo mùa' },
        { value: 'SIDEBAR_BANNER', label: 'Sidebar' },
        { value: 'CHECKOUT_BANNER', label: 'Thanh toán' },
        { value: 'CART_BANNER', label: 'Giỏ hàng' },
        { value: 'SEARCH_BANNER', label: 'Tìm kiếm' },
    ];

    const bannerPositions = [
        { value: 'HOMEPAGE_HERO', label: 'Trang chủ - Hero' },
        { value: 'HOMEPAGE_FEATURED', label: 'Trang chủ - Nổi bật' },
        { value: 'HOMEPAGE_SIDEBAR', label: 'Trang chủ - Sidebar' },
        { value: 'CATEGORY_HEADER', label: 'Danh mục - Header' },
        { value: 'CATEGORY_SIDEBAR', label: 'Danh mục - Sidebar' },
        { value: 'PRODUCT_DETAIL_TOP', label: 'Sản phẩm - Top' },
        { value: 'PRODUCT_DETAIL_SIDEBAR', label: 'Sản phẩm - Sidebar' },
        { value: 'CHECKOUT_PAGE', label: 'Thanh toán' },
        { value: 'CART_PAGE', label: 'Giỏ hàng' },
        { value: 'SEARCH_RESULTS', label: 'Kết quả tìm kiếm' },
        { value: 'FLASH_SALE_PAGE', label: 'Flash Sale' },
        { value: 'BRAND_PAGE', label: 'Thương hiệu' },
    ];

    const targetAudiences = [
        { value: 'ALL_USERS', label: 'Tất cả người dùng' },
        { value: 'NEW_USERS', label: 'Người dùng mới' },
        { value: 'RETURNING_USERS', label: 'Người dùng quay lại' },
        { value: 'PREMIUM_USERS', label: 'Người dùng cao cấp' },
        { value: 'MOBILE_USERS', label: 'Người dùng mobile' },
        { value: 'DESKTOP_USERS', label: 'Người dùng desktop' },
    ];

    const geographicTargets = [
        { value: 'ALL_VIETNAM', label: 'Toàn Việt Nam' },
        { value: 'NORTH_VIETNAM', label: 'Miền Bắc' },
        { value: 'CENTRAL_VIETNAM', label: 'Miền Trung' },
        { value: 'SOUTH_VIETNAM', label: 'Miền Nam' },
        { value: 'HANOI', label: 'Hà Nội' },
        { value: 'HO_CHI_MINH', label: 'TP. Hồ Chí Minh' },
        { value: 'DA_NANG', label: 'Đà Nẵng' },
    ];

    const handleInputChange = (field: string, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleAddItem = () => {
        if (!newItem.image) {
            toast.error('Vui lòng nhập URL ảnh');
            return;
        }

        const item: ContentItem = {
            id: Date.now().toString(),
            contentBlockId: '',
            title: newItem.title,
            subtitle: newItem.subtitle,
            description: newItem.description,
            image: newItem.image,
            imageAlt: newItem.imageAlt,
            linkUrl: newItem.linkUrl,
            linkText: newItem.linkText,
            openInNewTab: newItem.openInNewTab,
            order: items.length,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setItems(prev => [...prev, item]);
        setNewItem({
            title: '',
            subtitle: '',
            description: '',
            image: '',
            imageAlt: '',
            linkUrl: '',
            linkText: '',
            openInNewTab: false,
            order: 0,
        });
    };

    const handleRemoveItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.type || !formData.position) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        if (items.length === 0) {
            toast.error('Vui lòng thêm ít nhất một ảnh cho banner');
            return;
        }

        try {
            setIsLoading(true);
            const dataToSend = {
                ...formData,
                campaignId: formData.campaignId === 'none' ? undefined : formData.campaignId,
                items,
            };
            await api.post('/admin/banners', dataToSend);

            toast.success('Tạo banner thành công');
            router.push('/admin/banners');
        } catch (error) {
            console.error('Error creating banner:', error);
            toast.error('Có lỗi xảy ra khi tạo banner');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Tạo banner mới</h1>
                    <p className="text-muted-foreground">
                        Thêm banner mới vào hệ thống
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Thông tin cơ bản */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin cơ bản</CardTitle>
                                <CardDescription>
                                    Thông tin chính của banner
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Tiêu đề *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                            placeholder="Nhập tiêu đề banner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Loại banner *</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value) => handleInputChange('type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn loại banner" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bannerTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Mô tả</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Mô tả banner"
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="position">Vị trí hiển thị *</Label>
                                        <Select
                                            value={formData.position}
                                            onValueChange={(value) => handleInputChange('position', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn vị trí" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bannerPositions.map((position) => (
                                                    <SelectItem key={position.value} value={position.value}>
                                                        {position.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Trạng thái</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) => handleInputChange('status', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DRAFT">Bản nháp</SelectItem>
                                                <SelectItem value="PUBLISHED">Đã xuất bản</SelectItem>
                                                <SelectItem value="SCHEDULED">Lên lịch</SelectItem>
                                                <SelectItem value="PAUSED">Tạm dừng</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Độ ưu tiên</Label>
                                        <Input
                                            id="priority"
                                            type="number"
                                            value={formData.priority}
                                            onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Đối tượng mục tiêu */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Đối tượng mục tiêu</CardTitle>
                                <CardDescription>
                                    Cài đặt đối tượng hiển thị banner
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="targetAudience">Đối tượng</Label>
                                        <Select
                                            value={formData.targetAudience}
                                            onValueChange={(value) => handleInputChange('targetAudience', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {targetAudiences.map((audience) => (
                                                    <SelectItem key={audience.value} value={audience.value}>
                                                        {audience.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="geographicTarget">Khu vực địa lý</Label>
                                        <Select
                                            value={formData.geographicTarget}
                                            onValueChange={(value) => handleInputChange('geographicTarget', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {geographicTargets.map((target) => (
                                                    <SelectItem key={target.value} value={target.value}>
                                                        {target.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="campaignId">Chiến dịch (tùy chọn)</Label>
                                    <Select
                                        value={formData.campaignId}
                                        onValueChange={(value) => handleInputChange('campaignId', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn chiến dịch (không bắt buộc)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Không thuộc chiến dịch nào</SelectItem>
                                            {campaigns.map((campaign) => (
                                                <SelectItem key={campaign.id} value={campaign.id}>
                                                    {campaign.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Nội dung banner */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Nội dung banner</CardTitle>
                                <CardDescription>
                                    Thêm ảnh và nội dung cho banner
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Form thêm item */}
                                <div className="border rounded-lg p-4 space-y-4">
                                    <h4 className="font-medium">Thêm ảnh mới</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="itemImage">Ảnh *</Label>
                                            <CloudinaryUpload
                                                value={newItem.image}
                                                onChange={(value) => setNewItem(prev => ({ ...prev, image: value }))}
                                                folder="banners"
                                                placeholder="Upload ảnh banner"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="itemTitle">Tiêu đề</Label>
                                            <Input
                                                id="itemTitle"
                                                value={newItem.title}
                                                onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="Tiêu đề ảnh"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="itemLink">Link</Label>
                                            <Input
                                                id="itemLink"
                                                value={newItem.linkUrl}
                                                onChange={(e) => setNewItem(prev => ({ ...prev, linkUrl: e.target.value }))}
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="itemLinkText">Text link</Label>
                                            <Input
                                                id="itemLinkText"
                                                value={newItem.linkText}
                                                onChange={(e) => setNewItem(prev => ({ ...prev, linkText: e.target.value }))}
                                                placeholder="Xem thêm"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="openInNewTab"
                                            checked={newItem.openInNewTab}
                                            onCheckedChange={(checked) => setNewItem(prev => ({ ...prev, openInNewTab: checked }))}
                                        />
                                        <Label htmlFor="openInNewTab">Mở trong tab mới</Label>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Thêm ảnh
                                    </Button>
                                </div>

                                {/* Danh sách items */}
                                {items.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Danh sách ảnh ({items.length})</h4>
                                        <div className="space-y-2">
                                            {items.map((item, index) => (
                                                <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                                                    <div className="relative w-16 h-12 rounded overflow-hidden">
                                                        <Image
                                                            src={item.image}
                                                            alt={item.title || 'Banner item'}
                                                            className="w-full h-full object-cover"
                                                            width={64}
                                                            height={64}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium">{item.title || 'Không có tiêu đề'}</p>
                                                        {item.linkUrl && (
                                                            <p className="text-sm text-muted-foreground">
                                                                Link: {item.linkUrl}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRemoveItem(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>


                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        {/* Thời gian hiển thị */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thời gian hiển thị</CardTitle>
                                <CardDescription>
                                    Cài đặt thời gian hiển thị banner
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate">Ngày bắt đầu</Label>
                                        <Input
                                            id="startDate"
                                            type="datetime-local"
                                            value={formData.startDate}
                                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endDate">Ngày kết thúc</Label>
                                        <Input
                                            id="endDate"
                                            type="datetime-local"
                                            value={formData.endDate}
                                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                                    />
                                    <Label htmlFor="isActive">Banner đang hoạt động</Label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thiết bị hiển thị */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thiết bị hiển thị</CardTitle>
                                <CardDescription>
                                    Chọn thiết bị hiển thị banner
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="showOnMobile"
                                            checked={formData.showOnMobile}
                                            onCheckedChange={(checked) => handleInputChange('showOnMobile', checked)}
                                        />
                                        <Label htmlFor="showOnMobile">Mobile</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="showOnTablet"
                                            checked={formData.showOnTablet}
                                            onCheckedChange={(checked) => handleInputChange('showOnTablet', checked)}
                                        />
                                        <Label htmlFor="showOnTablet">Tablet</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="showOnDesktop"
                                            checked={formData.showOnDesktop}
                                            onCheckedChange={(checked) => handleInputChange('showOnDesktop', checked)}
                                        />
                                        <Label htmlFor="showOnDesktop">Desktop</Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Nút submit */}
                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Đang tạo...' : 'Tạo banner'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BannerFormPage; 