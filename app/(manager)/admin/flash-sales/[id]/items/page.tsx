"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Package, Trash2, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import type { FlashSaleItem } from '@/types/flash-sale';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    sku: string;
    originalPrice: number;
    salePrice: number | null;
    stock: number;
    images: Array<{
        url: string;
        alt?: string;
    }>;
}

interface FlashSaleItemWithProduct extends FlashSaleItem {
    product: {
        id: string;
        name: string;
        slug: string;
        sku: string;
        originalPrice: number;
        salePrice: number | undefined;
        stock: number;
        images: Array<{
            url: string;
            alt?: string;
        }>;
    };
}

const FlashSaleItemsPage = () => {
    const router = useRouter();
    const params = useParams();
    const [items, setItems] = useState<FlashSaleItemWithProduct[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [isEditingItem, setIsEditingItem] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showProductSelector, setShowProductSelector] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [editingItem, setEditingItem] = useState<FlashSaleItemWithProduct | null>(null);
    const [productSearch, setProductSearch] = useState('');
    const [formData, setFormData] = useState({
        originalPrice: '',
        salePrice: '',
        discountPercent: '',
        totalQuantity: '',
        maxPerUser: '1',
        priority: '0',
    });
    const [editFormData, setEditFormData] = useState({
        originalPrice: '',
        salePrice: '',
        discountPercent: '',
        totalQuantity: '',
        maxPerUser: '1',
        priority: '0',
    });

    const id = params.id as string;

    useEffect(() => {
        fetchItems();
        fetchProducts();
    }, [id]);

    const fetchItems = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/admin/flash-sales/${id}/items`);
            setItems(response.data.items);
        } catch (error) {
            console.error('Error fetching items:', error);
            toast.error('Lỗi khi tải danh sách sản phẩm khuyến mãi');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProducts = async (search = '') => {
        try {
            const response = await api.get('/admin/products', {
                params: { search, limit: 50 }
            });
            setProducts(response.data.products);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleEditInputChange = (field: string, value: string) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const calculateDiscountPercent = (originalPrice: number, salePrice: number) => {
        return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    };

    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
        setFormData(prev => ({
            ...prev,
            originalPrice: product.originalPrice.toString(),
            salePrice: (product.salePrice || product.originalPrice).toString(),
            discountPercent: calculateDiscountPercent(product.originalPrice, product.salePrice || product.originalPrice).toString(),
            totalQuantity: Math.min(product.stock, 100).toString(),
        }));
        setShowProductSelector(false);
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedProduct) {
            toast.error('Vui lòng chọn sản phẩm');
            return;
        }

        if (!formData.originalPrice || !formData.salePrice) {
            toast.error('Vui lòng nhập giá gốc và giá khuyến mãi');
            return;
        }

        const originalPrice = parseFloat(formData.originalPrice);
        const salePrice = parseFloat(formData.salePrice);
        const discountPercent = calculateDiscountPercent(originalPrice, salePrice);

        if (salePrice >= originalPrice) {
            toast.error('Giá khuyến mãi phải nhỏ hơn giá gốc');
            return;
        }

        try {
            setIsAddingItem(true);

            const payload = {
                productId: selectedProduct.id,
                originalPrice,
                salePrice,
                discountPercent,
                totalQuantity: parseInt(formData.totalQuantity),
                maxPerUser: parseInt(formData.maxPerUser),
                priority: parseInt(formData.priority),
            };

            await api.post(`/admin/flash-sales/${id}/items`, payload);

            toast.success('Thêm sản phẩm khuyến mãi thành công');
            setShowAddDialog(false);
            setSelectedProduct(null);
            setFormData({
                originalPrice: '',
                salePrice: '',
                discountPercent: '',
                totalQuantity: '',
                maxPerUser: '1',
                priority: '0',
            });
            fetchItems();
        } catch (error) {
            console.error('Error adding item:', error);
            toast.error('Lỗi khi thêm sản phẩm khuyến mãi');
        } finally {
            setIsAddingItem(false);
        }
    };

    const handleEditItem = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingItem) {
            toast.error('Không tìm thấy sản phẩm khuyến mãi cần sửa');
            return;
        }

        if (!editFormData.salePrice) {
            toast.error('Vui lòng nhập giá khuyến mãi');
            return;
        }

        const originalPrice = editingItem.originalPrice; // Use the original price from the item
        const salePrice = parseFloat(editFormData.salePrice);
        const discountPercent = calculateDiscountPercent(originalPrice, salePrice);

        if (salePrice >= originalPrice) {
            toast.error('Giá khuyến mãi phải nhỏ hơn giá gốc');
            return;
        }

        try {
            setIsEditingItem(true);

            const payload = {
                salePrice,
                discountPercent,
                totalQuantity: parseInt(editFormData.totalQuantity),
                maxPerUser: parseInt(editFormData.maxPerUser),
                priority: parseInt(editFormData.priority),
            };

            await api.put(`/admin/flash-sales/${id}/items/${editingItem.id}`, payload);

            toast.success('Cập nhật sản phẩm khuyến mãi thành công');
            setShowEditDialog(false);
            setEditingItem(null);
            setEditFormData({
                originalPrice: '',
                salePrice: '',
                discountPercent: '',
                totalQuantity: '',
                maxPerUser: '1',
                priority: '0',
            });
            fetchItems();
        } catch (error) {
            console.error('Error updating item:', error);
            toast.error('Lỗi khi cập nhật sản phẩm khuyến mãi');
        } finally {
            setIsEditingItem(false);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        try {
            await api.delete(`/admin/flash-sales/${id}/items/${itemId}`);
            toast.success('Xóa sản phẩm khuyến mãi thành công');
            fetchItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error('Lỗi khi xóa sản phẩm khuyến mãi');
        }
    };

    const getStatusBadge = (item: FlashSaleItemWithProduct) => {
        if (item.remainingQuantity === 0) {
            return <Badge variant="destructive">Hết hàng</Badge>;
        }
        if (item.remainingQuantity <= 5) {
            return <Badge variant="secondary">Sắp hết</Badge>;
        }
        return <Badge variant="default">Còn hàng</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm khuyến mãi</h1>
                        <p className="text-muted-foreground">
                            Thêm và quản lý sản phẩm trong chương trình khuyến mãi
                        </p>
                    </div>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm sản phẩm
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Thêm sản phẩm khuyến mãi</DialogTitle>
                            <DialogDescription>
                                Chọn sản phẩm và cài đặt giá khuyến mãi
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Chọn sản phẩm *</Label>
                                <Popover open={showProductSelector} onOpenChange={setShowProductSelector}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-full justify-between"
                                        >
                                            {selectedProduct ? selectedProduct.name : "Chọn sản phẩm..."}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[400px] p-0">
                                        <Command>
                                            <CommandInput
                                                placeholder="Tìm kiếm sản phẩm..."
                                                value={productSearch}
                                                onValueChange={(value) => {
                                                    setProductSearch(value);
                                                    fetchProducts(value);
                                                }}
                                            />
                                            <CommandList>
                                                <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
                                                <CommandGroup>
                                                    {products.map((product) => (
                                                        <CommandItem
                                                            key={product.id}
                                                            onSelect={() => handleProductSelect(product)}
                                                            className="flex items-center gap-3 p-3"
                                                        >
                                                            <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100">
                                                                {product.images?.[0] ? (
                                                                    <Image
                                                                        src={product.images[0].url}
                                                                        alt={product.name}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                                        <Package className="h-5 w-5 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium truncate">
                                                                    {product.name}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    SKU: {product.sku} • Tồn kho: {product.stock}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    Giá hiện tại: {product.originalPrice.toLocaleString()}đ
                                                                </div>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {selectedProduct && (
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
                                            {selectedProduct.images?.[0] ? (
                                                <Image
                                                    src={selectedProduct.images[0].url}
                                                    alt={selectedProduct.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                    <Package className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">{selectedProduct.name}</div>
                                            <div className="text-xs text-gray-500">SKU: {selectedProduct.sku}</div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedProduct(null)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="originalPrice">Giá gốc *</Label>
                                    <Input
                                        id="originalPrice"
                                        type="number"
                                        value={formData.originalPrice}
                                        onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                                        placeholder="0"
                                        disabled
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="salePrice">Giá khuyến mãi *</Label>
                                    <Input
                                        id="salePrice"
                                        type="number"
                                        value={formData.salePrice}
                                        onChange={(e) => handleInputChange('salePrice', e.target.value)}
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="totalQuantity">Số lượng *</Label>
                                    <Input
                                        id="totalQuantity"
                                        type="number"
                                        min="1"
                                        max={selectedProduct?.stock || 100}
                                        value={formData.totalQuantity}
                                        onChange={(e) => handleInputChange('totalQuantity', e.target.value)}
                                        placeholder="0"
                                        required
                                    />
                                    {selectedProduct && (
                                        <p className="text-xs text-gray-500">
                                            Tối đa: {selectedProduct.stock} sản phẩm
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxPerUser">Giới hạn/user</Label>
                                    <Input
                                        id="maxPerUser"
                                        type="number"
                                        min="1"
                                        value={formData.maxPerUser}
                                        onChange={(e) => handleInputChange('maxPerUser', e.target.value)}
                                        placeholder="1"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Độ ưu tiên</Label>
                                <Input
                                    id="priority"
                                    type="number"
                                    min="0"
                                    value={formData.priority}
                                    onChange={(e) => handleInputChange('priority', e.target.value)}
                                    placeholder="0"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAddDialog(false)}
                                    disabled={isAddingItem}
                                >
                                    Hủy
                                </Button>
                                <Button type="submit" disabled={isAddingItem || !selectedProduct}>
                                    {isAddingItem ? 'Đang thêm...' : 'Thêm sản phẩm'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Edit Modal */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Sửa sản phẩm Chương trình khuyến mãi</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin sản phẩm trong chương trình khuyến mãi
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditItem} className="space-y-4">
                        {editingItem && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
                                        {editingItem.product.images?.[0] ? (
                                            <Image
                                                src={editingItem.product.images[0].url}
                                                alt={editingItem.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <Package className="h-6 w-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">{editingItem.product.name}</div>
                                        <div className="text-xs text-gray-500">SKU: {editingItem.product.sku}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="editOriginalPrice">Giá gốc</Label>
                                <Input
                                    id="editOriginalPrice"
                                    type="number"
                                    value={editFormData.originalPrice}
                                    disabled
                                    className="bg-gray-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editSalePrice">Giá khuyến mãi *</Label>
                                <Input
                                    id="editSalePrice"
                                    type="number"
                                    value={editFormData.salePrice}
                                    onChange={(e) => handleEditInputChange('salePrice', e.target.value)}
                                    placeholder="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="editTotalQuantity">Số lượng *</Label>
                                <Input
                                    id="editTotalQuantity"
                                    type="number"
                                    min="1"
                                    max={editingItem?.product.stock || 100}
                                    value={editFormData.totalQuantity}
                                    onChange={(e) => handleEditInputChange('totalQuantity', e.target.value)}
                                    placeholder="0"
                                    required
                                />
                                {editingItem && (
                                    <p className="text-xs text-gray-500">
                                        Tối đa: {editingItem.product.stock} sản phẩm
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editMaxPerUser">Giới hạn/user</Label>
                                <Input
                                    id="editMaxPerUser"
                                    type="number"
                                    min="1"
                                    value={editFormData.maxPerUser}
                                    onChange={(e) => handleEditInputChange('maxPerUser', e.target.value)}
                                    placeholder="1"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editPriority">Độ ưu tiên</Label>
                            <Input
                                id="editPriority"
                                type="number"
                                min="0"
                                value={editFormData.priority}
                                onChange={(e) => handleEditInputChange('priority', e.target.value)}
                                placeholder="0"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowEditDialog(false)}
                                disabled={isEditingItem}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isEditingItem || !editingItem}>
                                {isEditingItem ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Danh sách sản phẩm ({items.length})
                    </CardTitle>
                    <CardDescription>
                        Quản lý các sản phẩm trong chương trình khuyến mãi này
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-20 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có sản phẩm</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Bắt đầu bằng cách thêm sản phẩm vào chương trình khuyến mãi
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                                        {item.product.images?.[0] ? (
                                            <Image
                                                src={item.product.images[0].url}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <Package className="h-6 w-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                            {item.product.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm text-gray-500 line-through">
                                                {item.originalPrice.toLocaleString()}đ
                                            </span>
                                            <span className="text-sm font-medium text-red-600">
                                                {item.salePrice?.toLocaleString() || item.originalPrice.toLocaleString()}đ
                                            </span>
                                            <Badge variant="destructive" className="text-xs">
                                                -{item.discountPercent}%
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-sm font-medium">
                                            {item.soldQuantity}/{item.totalQuantity}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            đã bán
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-sm font-medium">
                                            {item.remainingQuantity}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            còn lại
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        {getStatusBadge(item)}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setEditingItem(item);
                                                setEditFormData({
                                                    originalPrice: item.originalPrice.toString(),
                                                    salePrice: item.salePrice?.toString() || item.originalPrice.toString(),
                                                    discountPercent: item.discountPercent.toString(),
                                                    totalQuantity: item.totalQuantity.toString(),
                                                    maxPerUser: item.maxPerUser.toString(),
                                                    priority: item.priority.toString(),
                                                });
                                                setShowEditDialog(true);
                                            }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteItem(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default FlashSaleItemsPage; 