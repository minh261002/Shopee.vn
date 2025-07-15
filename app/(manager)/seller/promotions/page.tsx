"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dataTables/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, Target, Users, Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ColumnDef, CellContext } from "@tanstack/react-table";
import { useStore } from "@/providers/store-context";
import { DataTableRowActions } from "@/components/dataTables/data-table-row-actions";
import { Pencil, Trash2 } from "lucide-react";

interface Promotion {
    id: string;
    name: string;
    type: string;
    status: string;
    discountValue: number;
    minOrderAmount: number;
    maxDiscountAmount: number;
    usageLimit: number;
    usagePerUser: number;
    usedCount: number;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
    description: string;
    couponCode: string;
}


const TYPE_LABELS: Record<string, string> = {
    PERCENTAGE: "Phần trăm",
    FIXED_AMOUNT: "Số tiền cố định",
    FREE_SHIPPING: "Miễn phí vận chuyển",
    BUY_X_GET_Y: "Mua X tặng Y"
};

function getStatusBadge(promo: Promotion) {
    const now = new Date();
    const isExpired = new Date(promo.endDate) < now;
    if (promo.status === "INACTIVE") return <Badge variant="destructive">Đã tắt</Badge>;
    if (isExpired) return <Badge variant="destructive">Hết hạn</Badge>;
    if (promo.status === "DRAFT") return <Badge variant="secondary">Nháp</Badge>;
    if (promo.status === "ACTIVE") return <Badge variant="default">Đang chạy</Badge>;
    return <Badge>{promo.status}</Badge>;
}

export default function SellerPromotionsPage() {
    const { error: showError, success: showSuccess } = useToast();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<string>("");
    const [type, setType] = useState<string>("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { currentStore } = useStore();
    const router = useRouter();

    // Thống kê nhanh
    const stats = useMemo(() => {
        const now = new Date();
        return {
            total: promotions.length,
            active: promotions.filter(p => p.status === "ACTIVE" && new Date(p.endDate) >= now).length,
            expired: promotions.filter(p => new Date(p.endDate) < now).length,
            used: promotions.reduce((sum, p) => sum + (p.usedCount || 0), 0)
        };
    }, [promotions]);

    useEffect(() => {
        if (!currentStore) return;
        fetchPromotions();
        // eslint-disable-next-line
    }, [currentStore, status, type, page]);

    async function fetchPromotions() {
        setIsLoading(true);
        try {
            if (!currentStore) return;
            const params = new URLSearchParams();
            params.append("storeId", currentStore.id);
            if (status) params.append("status", status);
            if (type) params.append("type", type);
            params.append("page", page.toString());
            params.append("limit", "20");
            const res = await fetch(`/api/seller/promotions?${params.toString()}`);
            const data = await res.json();
            if (res.ok) {
                const safePromotions: Promotion[] = (data.promotions || []).map((p: unknown) => {
                    const promo = p as Partial<Promotion>;
                    return {
                        id: promo.id || "",
                        name: promo.name || "",
                        type: promo.type || "PERCENTAGE",
                        status: promo.status || "ACTIVE",
                        discountValue: typeof promo.discountValue === 'number' ? promo.discountValue : 0,
                        minOrderAmount: typeof promo.minOrderAmount === 'number' ? promo.minOrderAmount : 0,
                        maxDiscountAmount: typeof promo.maxDiscountAmount === 'number' ? promo.maxDiscountAmount : 0,
                        usageLimit: typeof promo.usageLimit === 'number' ? promo.usageLimit : 0,
                        usagePerUser: typeof promo.usagePerUser === 'number' ? promo.usagePerUser : 0,
                        usedCount: typeof promo.usedCount === 'number' ? promo.usedCount : 0,
                        startDate: promo.startDate || "",
                        endDate: promo.endDate || "",
                        createdAt: promo.createdAt || "",
                        updatedAt: promo.updatedAt || "",
                        description: promo.description || "",
                        couponCode: promo.couponCode || ""
                    };
                });
                setPromotions(safePromotions);
                setTotalPages(data.pagination?.totalPages || 1);
            } else {
                showError(data.error || "Lỗi tải danh sách khuyến mãi");
            }
        } catch {
            showError("Lỗi kết nối server");
        } finally {
            setIsLoading(false);
        }
    }

    const columns: ColumnDef<Promotion, unknown>[] = [
        {
            accessorKey: "name",
            header: "Tên khuyến mãi",
            cell: (ctx: CellContext<Promotion, unknown>) => (
                <div className="font-medium max-w-[200px] truncate">{ctx.row.original.name}</div>
            )
        },
        {
            accessorKey: "type",
            header: "Loại",
            cell: (ctx: CellContext<Promotion, unknown>) => (
                <Badge variant="outline">{TYPE_LABELS[ctx.row.original.type] || ctx.row.original.type}</Badge>
            )
        },
        {
            accessorKey: "discountValue",
            header: "Giá trị giảm",
            cell: (ctx: CellContext<Promotion, unknown>) => {
                const t = ctx.row.original.type;
                if (t === "PERCENTAGE") return `${ctx.row.original.discountValue}%`;
                if (t === "FIXED_AMOUNT") return `${ctx.row.original.discountValue.toLocaleString()}đ`;
                if (t === "FREE_SHIPPING") return "Miễn phí vận chuyển";
                if (t === "BUY_X_GET_Y") return "Mua X tặng Y";
                return ctx.row.original.discountValue;
            }
        },
        {
            accessorKey: "startDate",
            header: "Bắt đầu",
            cell: (ctx: CellContext<Promotion, unknown>) => (
                <span>{new Date(ctx.row.original.startDate).toLocaleDateString()}</span>
            )
        },
        {
            accessorKey: "endDate",
            header: "Kết thúc",
            cell: (ctx: CellContext<Promotion, unknown>) => (
                <span>{new Date(ctx.row.original.endDate).toLocaleDateString()}</span>
            )
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: (ctx: CellContext<Promotion, unknown>) => getStatusBadge(ctx.row.original)
        },
        {
            id: "actions",
            header: "",
            cell: (ctx: CellContext<Promotion, unknown>) => (
                <DataTableRowActions
                    row={ctx.row}
                    actions={[
                        {
                            label: "Sửa",
                            icon: Pencil,
                            onClick: (row) => router.push(`/seller/promotions/${row.id}/edit`),
                        },
                        {
                            label: "Xóa",
                            icon: Trash2,
                            variant: "destructive",
                            confirmTitle: "Xác nhận xóa khuyến mãi",
                            confirmMessage: "Bạn có chắc chắn muốn xóa khuyến mãi này? Hành động này không thể hoàn tác.",
                            onClick: (row) => handleDelete(row.id),
                        },
                    ]}
                />
            ),
        },
    ];

    async function handleDelete(id: string) {
        if (!confirm("Bạn chắc chắn muốn xóa khuyến mãi này?")) return;
        try {
            const res = await fetch(`/api/seller/promotions/${id}`, { method: "DELETE" });
            if (res.ok) {
                setPromotions((prev) => prev.filter((p) => p.id !== id));
                showSuccess("Đã xóa khuyến mãi");
            } else {
                const data = await res.json();
                showError(data.error || "Lỗi xóa khuyến mãi");
            }
        } catch {
            showError("Lỗi kết nối server");
        }
    }

    // Filter nâng cao
    const filters = [
        {
            key: 'type',
            label: 'Loại',
            type: 'select' as const,
            placeholder: 'Chọn loại',
            options: [
                { value: 'ALL', label: 'Tất cả' },
                { value: 'PERCENTAGE', label: 'Phần trăm' },
                { value: 'FIXED_AMOUNT', label: 'Số tiền cố định' },
                { value: 'FREE_SHIPPING', label: 'Miễn phí vận chuyển' },
                { value: 'BUY_X_GET_Y', label: 'Mua X tặng Y' }
            ]
        },
        {
            key: 'status',
            label: 'Trạng thái',
            type: 'select' as const,
            placeholder: 'Chọn trạng thái',
            options: [
                { value: 'ALL', label: 'Tất cả' },
                { value: 'ACTIVE', label: 'Đang chạy' },
                { value: 'DRAFT', label: 'Nháp' },
                { value: 'INACTIVE', label: 'Đã tắt' },
                { value: 'EXPIRED', label: 'Hết hạn' }
            ]
        }
    ];

    const activeFilters = { type: type || 'ALL', status: status || 'ALL' };

    const handleFilterChange = (key: string, value: string) => {
        if (key === 'type') setType(value === 'ALL' ? '' : value);
        if (key === 'status') setStatus(value === 'ALL' ? '' : value);
        setPage(1);
    };

    const handleClearFilters = () => {
        setType("");
        setStatus("");
        setPage(1);
    };

    const handleRefresh = () => {
        fetchPromotions();
    };

    if (!currentStore) {
        return <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">Vui lòng chọn cửa hàng để xem khuyến mãi</div>;
    }
    return (
        <div className="space-y-6 w-full mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Khuyến mãi</h1>
                    <p className="text-muted-foreground">Quản lý các chương trình khuyến mãi của shop</p>
                </div>
                <Button onClick={() => router.push("/seller/promotions/new")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo khuyến mãi
                </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng khuyến mãi</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">Tất cả khuyến mãi</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đang chạy</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">Khuyến mãi đang chạy</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đã hết hạn</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.expired}</div>
                        <p className="text-xs text-muted-foreground">Khuyến mãi đã hết hạn</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lượt sử dụng</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.used}</div>
                        <p className="text-xs text-muted-foreground">Tổng lượt sử dụng</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách khuyến mãi</CardTitle>
                    <CardDescription>Quản lý tất cả chương trình khuyến mãi của shop</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={promotions}
                        isLoading={isLoading}
                        emptyMessage="Không có khuyến mãi nào."
                        filters={filters}
                        activeFilters={activeFilters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                        onRefresh={handleRefresh}
                        showToolbar={true}
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </CardContent>
            </Card>
        </div>
    );
} 