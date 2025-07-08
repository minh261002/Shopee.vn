"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Store,
    Eye,
    CheckCircle,
    XCircle,
    RotateCcw,
    Clock,
    AlertCircle,
    Download
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/axios'
import { BrandRegistrationStatus, BrandRegistrationType } from '@prisma/client'

interface BrandRegistration {
    id: string;
    type: BrandRegistrationType;
    status: BrandRegistrationStatus;
    brandName: string;
    description: string | null;
    companyName: string | null;
    submittedAt: Date;
    reviewedAt: Date | null;
    rejectionReason: string | null;
    legalRepName: string | null;
    legalRepPhone: string | null;
    legalRepEmail: string | null;
    businessLicense: string | null;
    trademarkCertificate: string | null;
    distributionContract: string | null;
    authorizationLetter: string | null;
    store: {
        id: string;
        name: string;
        owner: {
            name: string;
            email: string;
        };
    };
}

const statusConfig = {
    PENDING: {
        label: 'Chờ duyệt',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock
    },
    UNDER_REVIEW: {
        label: 'Đang xem xét',
        color: 'bg-blue-100 text-blue-800',
        icon: AlertCircle
    },
    APPROVED: {
        label: 'Đã duyệt',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
    },
    REJECTED: {
        label: 'Từ chối',
        color: 'bg-red-100 text-red-800',
        icon: XCircle
    },
    RESUBMISSION: {
        label: 'Yêu cầu nộp lại',
        color: 'bg-purple-100 text-purple-800',
        icon: RotateCcw
    }
}

const BrandRegistrationsPage = () => {
    const { success, error: showError } = useToast()

    const [registrations, setRegistrations] = useState<BrandRegistration[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedRegistration, setSelectedRegistration] = useState<BrandRegistration | null>(null)
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
    const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_resubmission'>('approve')
    const [reviewNotes, setReviewNotes] = useState('')
    const [rejectionReason, setRejectionReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Filters
    const [statusFilter, setStatusFilter] = useState<BrandRegistrationStatus | 'ALL'>('ALL')
    const [typeFilter, setTypeFilter] = useState<BrandRegistrationType | 'ALL'>('ALL')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchRegistrations()
    }, [statusFilter, typeFilter])

    const fetchRegistrations = async () => {
        try {
            setIsLoading(true)
            let url = '/admin/brand-registrations'
            const params = new URLSearchParams()

            if (statusFilter !== 'ALL') {
                params.append('status', statusFilter)
            }
            if (typeFilter !== 'ALL') {
                params.append('type', typeFilter)
            }
            if (searchTerm) {
                params.append('search', searchTerm)
            }

            if (params.toString()) {
                url += `?${params.toString()}`
            }

            const response = await api.get(url)
            setRegistrations(response.data.registrations || [])
        } catch (error) {
            console.error('Error fetching registrations:', error)
            showError('Có lỗi xảy ra khi tải danh sách đăng ký')
        } finally {
            setIsLoading(false)
        }
    }

    const handleReview = (registration: BrandRegistration) => {
        setSelectedRegistration(registration)
        setReviewNotes('')
        setRejectionReason('')
        setIsReviewDialogOpen(true)
    }

    const submitReview = async () => {
        if (!selectedRegistration) return

        setIsSubmitting(true)
        try {
            const data: {
                action: 'approve' | 'reject' | 'request_resubmission';
                reviewNotes?: string;
                rejectionReason?: string;
            } = {
                action: reviewAction,
                reviewNotes,
            }

            if (reviewAction === 'reject' || reviewAction === 'request_resubmission') {
                if (!rejectionReason.trim()) {
                    showError('Vui lòng nhập lý do từ chối hoặc yêu cầu nộp lại')
                    return
                }
                data.rejectionReason = rejectionReason
            }

            await api.post(`/admin/brand-registrations/${selectedRegistration.id}/review`, data)

            success(
                reviewAction === 'approve' ? 'Đã duyệt đăng ký thương hiệu' :
                    reviewAction === 'reject' ? 'Đã từ chối đăng ký thương hiệu' :
                        'Đã yêu cầu nộp lại hồ sơ'
            )

            setIsReviewDialogOpen(false)
            fetchRegistrations()
        } catch (error) {
            console.error('Error reviewing registration:', error)
            showError('Có lỗi xảy ra khi xử lý đăng ký')
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredRegistrations = registrations.filter(registration => {
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            return (
                registration.brandName.toLowerCase().includes(searchLower) ||
                registration.companyName?.toLowerCase().includes(searchLower) ||
                registration.store.name.toLowerCase().includes(searchLower) ||
                registration.store.owner.name.toLowerCase().includes(searchLower)
            )
        }
        return true
    })

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Store className="w-6 h-6" />
                        Quản lý đăng ký thương hiệu
                    </CardTitle>
                    <p className="text-muted-foreground">
                        Duyệt và quản lý các đăng ký thương hiệu từ seller
                    </p>
                </CardHeader>
            </Card>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Tìm kiếm</Label>
                            <Input
                                placeholder="Tên thương hiệu, công ty, cửa hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Trạng thái</Label>
                            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BrandRegistrationStatus)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả</SelectItem>
                                    <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                                    <SelectItem value="UNDER_REVIEW">Đang xem xét</SelectItem>
                                    <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                                    <SelectItem value="REJECTED">Từ chối</SelectItem>
                                    <SelectItem value="RESUBMISSION">Yêu cầu nộp lại</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Loại đăng ký</Label>
                            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as BrandRegistrationType)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả</SelectItem>
                                    <SelectItem value="BRAND_OWNER">Thương hiệu chính chủ</SelectItem>
                                    <SelectItem value="DISTRIBUTOR">Nhà phân phối</SelectItem>
                                    <SelectItem value="SHOPEE_MALL">Shopee Mall</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>&nbsp;</Label>
                            <Button onClick={fetchRegistrations} className="w-full">
                                Tìm kiếm
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Registrations Table */}
            <Card>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Thương hiệu</TableHead>
                                    <TableHead>Cửa hàng</TableHead>
                                    <TableHead>Loại đăng ký</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Ngày gửi</TableHead>
                                    <TableHead>Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRegistrations.map((registration) => {
                                    const status = statusConfig[registration.status]
                                    const StatusIcon = status.icon

                                    return (
                                        <TableRow key={registration.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{registration.brandName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {registration.companyName}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{registration.store.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {registration.store.owner.name}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {registration.type === 'BRAND_OWNER' ? 'Chính chủ' :
                                                        registration.type === 'DISTRIBUTOR' ? 'Phân phối' :
                                                            'Shopee Mall'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${status.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {status.label}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(registration.submittedAt).toLocaleDateString('vi-VN')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleReview(registration)}
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        Xem
                                                    </Button>
                                                    {registration.status === 'PENDING' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedRegistration(registration)
                                                                    setReviewAction('approve')
                                                                    setIsReviewDialogOpen(true)
                                                                }}
                                                            >
                                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                                Duyệt
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => {
                                                                    setSelectedRegistration(registration)
                                                                    setReviewAction('reject')
                                                                    setIsReviewDialogOpen(true)
                                                                }}
                                                            >
                                                                <XCircle className="w-4 h-4 mr-1" />
                                                                Từ chối
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Review Dialog */}
            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Chi tiết đăng ký thương hiệu
                        </DialogTitle>
                        <DialogDescription>
                            Xem chi tiết và thực hiện duyệt đăng ký
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRegistration && (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Thông tin thương hiệu</h3>
                                    <div className="space-y-2">
                                        <Label>Tên thương hiệu</Label>
                                        <p className="font-medium">{selectedRegistration.brandName}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tên công ty</Label>
                                        <p>{selectedRegistration.companyName}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mô tả</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedRegistration.description || 'Không có mô tả'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold">Thông tin cửa hàng</h3>
                                    <div className="space-y-2">
                                        <Label>Tên cửa hàng</Label>
                                        <p className="font-medium">{selectedRegistration.store.name}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Chủ cửa hàng</Label>
                                        <p>{selectedRegistration.store.owner.name}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <p>{selectedRegistration.store.owner.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="space-y-4">
                                <h3 className="font-semibold">Tài liệu đính kèm</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {selectedRegistration.businessLicense && (
                                        <div className="space-y-2">
                                            <Label>Giấy phép kinh doanh</Label>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(selectedRegistration.businessLicense!, '_blank')}
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Xem tài liệu
                                            </Button>
                                        </div>
                                    )}
                                    {selectedRegistration.trademarkCertificate && (
                                        <div className="space-y-2">
                                            <Label>Giấy chứng nhận nhãn hiệu</Label>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(selectedRegistration.trademarkCertificate!, '_blank')}
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Xem tài liệu
                                            </Button>
                                        </div>
                                    )}
                                    {selectedRegistration.distributionContract && (
                                        <div className="space-y-2">
                                            <Label>Hợp đồng phân phối</Label>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(selectedRegistration.distributionContract!, '_blank')}
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Xem tài liệu
                                            </Button>
                                        </div>
                                    )}
                                    {selectedRegistration.authorizationLetter && (
                                        <div className="space-y-2">
                                            <Label>Giấy ủy quyền</Label>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(selectedRegistration.authorizationLetter!, '_blank')}
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Xem tài liệu
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Review Section */}
                            {selectedRegistration.status === 'PENDING' && (
                                <div className="space-y-4 border-t pt-4">
                                    <h3 className="font-semibold">Xử lý đăng ký</h3>

                                    <div className="space-y-2">
                                        <Label>Hành động</Label>
                                        <Select value={reviewAction} onValueChange={(value) => setReviewAction(value as 'approve' | 'reject' | 'request_resubmission')}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="approve">Duyệt đăng ký</SelectItem>
                                                <SelectItem value="reject">Từ chối đăng ký</SelectItem>
                                                <SelectItem value="request_resubmission">Yêu cầu nộp lại</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {(reviewAction === 'reject' || reviewAction === 'request_resubmission') && (
                                        <div className="space-y-2">
                                            <Label>Lý do từ chối / Yêu cầu bổ sung</Label>
                                            <Textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Nhập lý do từ chối hoặc yêu cầu bổ sung tài liệu..."
                                                rows={3}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Ghi chú review (không bắt buộc)</Label>
                                        <Textarea
                                            value={reviewNotes}
                                            onChange={(e) => setReviewNotes(e.target.value)}
                                            placeholder="Ghi chú nội bộ về việc duyệt..."
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                            Đóng
                        </Button>
                        {selectedRegistration?.status === 'PENDING' && (
                            <Button onClick={submitReview} disabled={isSubmitting}>
                                {isSubmitting ? 'Đang xử lý...' :
                                    reviewAction === 'approve' ? 'Duyệt đăng ký' :
                                        reviewAction === 'reject' ? 'Từ chối đăng ký' :
                                            'Yêu cầu nộp lại'}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default BrandRegistrationsPage 