"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/providers/store-context";

interface PromotionForm {
    name: string;
    type: string;
    status: string;
    discountValue: number;
    minOrderAmount: number;
    maxDiscountAmount: number;
    usageLimit: number;
    usagePerUser: number;
    startDate: string;
    endDate: string;
    description: string;
    couponCode: string;
}

export default function SellerPromotionCreatePage() {
    const { error: showError, success: showSuccess } = useToast();
    const router = useRouter();
    const { currentStore } = useStore();
    const [form, setForm] = useState<PromotionForm>({
        name: "",
        type: "PERCENTAGE", // Sửa lại cho đúng enum backend
        discountValue: 0,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        usageLimit: 0,
        usagePerUser: 0,
        startDate: new Date().toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        description: "",
        couponCode: "",
        status: "ACTIVE" // Sửa lại cho đúng enum backend
    });
    const [loading, setLoading] = useState(false);

    const handleBack = () => router.back();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'number') {
            // Loại bỏ số 0 ở đầu, nếu rỗng thì là 0
            const clean = value.replace(/^0+(\d)/, '$1');
            setForm({
                ...form,
                [name]: clean === '' ? 0 : Number(clean)
            });
        } else {
            setForm({
                ...form,
                [name]: value
            });
        }
    };

    const handleSelectChange = (name: keyof PromotionForm, value: string) => {
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!currentStore) {
                showError("Vui lòng chọn cửa hàng trước.");
                setLoading(false);
                return;
            }
            // Ép lại tất cả trường số về number
            const payload = {
                ...form,
                discountValue: Number(form.discountValue),
                minOrderAmount: Number(form.minOrderAmount),
                maxDiscountAmount: Number(form.maxDiscountAmount),
                usageLimit: Number(form.usageLimit),
                usagePerUser: Number(form.usagePerUser),
                storeId: currentStore.id
            };
            if (!payload.name || !payload.type || !payload.startDate || !payload.endDate || !payload.discountValue) {
                showError("Vui lòng điền đầy đủ thông tin bắt buộc");
                setLoading(false);
                return;
            }
            if (payload.startDate >= payload.endDate) {
                showError("Thời gian kết thúc phải sau thời gian bắt đầu");
                setLoading(false);
                return;
            }
            if (payload.discountValue <= 0) {
                showError("Giá trị giảm giá phải lớn hơn 0");
                setLoading(false);
                return;
            }
            if (payload.type === "PERCENTAGE" && payload.discountValue > 100) {
                showError("Phần trăm giảm giá không được vượt quá 100%");
                setLoading(false);
                return;
            }
            const res = await fetch("/api/seller/promotions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                showSuccess("Tạo khuyến mãi thành công");
                router.push("/seller/promotions");
            } else {
                showError(data.error || "Lỗi tạo khuyến mãi");
            }
        } catch {
            showError("Lỗi kết nối server");
        } finally {
            setLoading(false);
        }
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setForm({ ...form, couponCode: result });
    };

    if (!currentStore) {
        return <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">Vui lòng chọn cửa hàng để tạo khuyến mãi</div>;
    }
    return (
        <div className="space-y-6 w-full mx-auto">
            <div className="flex items-center gap-4 mb-2">
                <Button variant="outline" size="icon" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tạo khuyến mãi mới</h1>
                    <p className="text-muted-foreground">Tạo chương trình khuyến mãi cho shop của bạn</p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Thông tin chính */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin cơ bản</CardTitle>
                                <CardDescription>Thông tin chính của khuyến mãi</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Tên khuyến mãi *</Label>
                                    <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Nhập tên khuyến mãi" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Mô tả</Label>
                                    <Textarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="Mô tả chi tiết về khuyến mãi" rows={3} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Loại *</Label>
                                        <Select value={form.type} onValueChange={v => handleSelectChange("type", v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PERCENTAGE">Phần trăm</SelectItem>
                                                <SelectItem value="FIXED_AMOUNT">Số tiền cố định</SelectItem>
                                                <SelectItem value="FREE_SHIPPING">Miễn phí vận chuyển</SelectItem>
                                                <SelectItem value="BUY_X_GET_Y">Mua X tặng Y</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Trạng thái *</Label>
                                        <Select value={form.status} onValueChange={v => handleSelectChange("status", v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ACTIVE">Đang chạy</SelectItem>
                                                <SelectItem value="DRAFT">Nháp</SelectItem>
                                                <SelectItem value="PAUSED">Tạm dừng</SelectItem>
                                                <SelectItem value="EXPIRED">Hết hạn</SelectItem>
                                                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discountValue">Giá trị giảm giá *</Label>
                                    <Input id="discountValue" name="discountValue" type="number" value={form.discountValue === 0 ? '' : String(form.discountValue)} onChange={handleChange} min={1} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="couponCode">Mã coupon (nếu có)</Label>
                                    <div className="flex gap-2">
                                        <Input id="couponCode" name="couponCode" value={form.couponCode} onChange={handleChange} placeholder="Nhập mã coupon" className="font-mono" />
                                        <Button type="button" variant="outline" onClick={generateCode}>Tạo mã</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Điều kiện & Thời gian */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Điều kiện & Thời gian</CardTitle>
                                <CardDescription>Thiết lập điều kiện áp dụng và thời gian</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="minOrderAmount">Đơn tối thiểu</Label>
                                    <Input id="minOrderAmount" name="minOrderAmount" type="number" value={form.minOrderAmount === 0 ? '' : String(form.minOrderAmount)} onChange={handleChange} min={0} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxDiscountAmount">Giảm tối đa</Label>
                                    <Input id="maxDiscountAmount" name="maxDiscountAmount" type="number" value={form.maxDiscountAmount === 0 ? '' : String(form.maxDiscountAmount)} onChange={handleChange} min={0} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="usageLimit">Tổng lượt dùng</Label>
                                    <Input id="usageLimit" name="usageLimit" type="number" value={form.usageLimit === 0 ? '' : String(form.usageLimit)} onChange={handleChange} min={0} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="usagePerUser">Lượt dùng mỗi người</Label>
                                    <Input id="usagePerUser" name="usagePerUser" type="number" value={form.usagePerUser === 0 ? '' : String(form.usagePerUser)} onChange={handleChange} min={0} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                                    <Input id="startDate" name="startDate" type="datetime-local" value={form.startDate} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">Ngày kết thúc *</Label>
                                    <Input id="endDate" name="endDate" type="datetime-local" value={form.endDate} onChange={handleChange} required />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="submit" disabled={loading}>
                        <Save className="mr-2 h-4 w-4" />
                        Lưu thay đổi
                    </Button>
                </div>
            </form>
        </div>
    );
} 