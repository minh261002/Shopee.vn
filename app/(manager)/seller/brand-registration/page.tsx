"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
    Store,
    FileText,
    CheckCircle,
    Upload,
    AlertCircle,
    Star,
    Clock,
    CheckCircle2,
    XCircle,
    RotateCcw
} from 'lucide-react'
import { CloudinaryUpload } from '@/components/layouts/cloudinary-upload'
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
        icon: CheckCircle2
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

const registrationTypes = [
    {
        id: BrandRegistrationType.BRAND_OWNER,
        title: 'Đăng ký thương hiệu chính chủ',
        description: 'Chủ sở hữu thương hiệu (có giấy tờ pháp lý như Giấy chứng nhận đăng ký nhãn hiệu) đăng ký với Shopee để khẳng định quyền sở hữu.',
        icon: <Store className="w-6 h-6" />,
        requirements: [
            'Giấy phép kinh doanh',
            'Giấy chứng nhận đăng ký nhãn hiệu',
            'Giấy tờ pháp nhân',
        ],
        badge: 'Ưu tiên cao'
    },
    {
        id: BrandRegistrationType.DISTRIBUTOR,
        title: 'Đăng ký phân phối thương hiệu',
        description: 'Nhà phân phối độc quyền hoặc đại lý được ủy quyền có thể cung cấp hợp đồng hoặc giấy ủy quyền để phân phối thương hiệu trên Shopee.',
        icon: <FileText className="w-6 h-6" />,
        requirements: [
            'Giấy phép kinh doanh',
            'Hợp đồng phân phối',
            'Giấy ủy quyền từ chủ thương hiệu',
        ],
        badge: 'Phổ biến'
    },
    {
        id: BrandRegistrationType.SHOPEE_MALL,
        title: 'Đăng ký vào Shopee Mall',
        description: 'Chỉ dành cho các thương hiệu chính hãng, đã đăng ký đầy đủ pháp lý. Có tiêu chí khắt khe hơn, như đảm bảo chất lượng, đổi trả 7 ngày, hàng chính hãng 100%, v.v.',
        icon: <Star className="w-6 h-6" />,
        requirements: [
            'Tất cả giấy tờ của thương hiệu chính chủ',
            'Chính sách đổi trả 7 ngày',
            'Cam kết hàng chính hãng 100%',
            'Đáp ứng tiêu chuẩn chất lượng Shopee Mall',
        ],
        badge: 'Premium',
        premium: true
    }
]

const BrandRegistrationPage = () => {
    const { success, error: showError } = useToast()

    // All state declarations at the top
    const [registration, setRegistration] = useState<BrandRegistration | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        type: '' as BrandRegistrationType | '',
        brandName: '',
        description: '',
        companyName: '',
        companyAddress: '',
        taxCode: '',
        legalRepName: '',
        legalRepPhone: '',
        legalRepEmail: '',
        returnPolicy: '',
        authenticity: false,
    })
    const [documents, setDocuments] = useState({
        businessLicense: '',
        trademarkCertificate: '',
        distributionContract: '',
        authorizationLetter: '',
        supportingDocuments: [] as string[],
    })
    const [qualityStandards, setQualityStandards] = useState({
        productQuality: false,
        customerService: false,
        deliveryCommitment: false,
        returnGuarantee: false,
        authenticityGuarantee: false,
    })

    // All useEffect hooks at the top level
    useEffect(() => {
        const fetchRegistration = async () => {
            try {
                const response = await api.get('/seller/brand-registration')
                if (response.data.registrations && response.data.registrations.length > 0) {
                    setRegistration(response.data.registrations[0])
                }
            } catch (error) {
                console.error('Error fetching registration:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchRegistration()
    }, [])

    useEffect(() => {
        const fetchStoreInfo = async () => {
            try {
                const response = await api.get('/seller/brand-registration')
                const { storeInfo } = response.data

                if (storeInfo) {
                    // Pre-fill form with store information
                    setFormData(prev => ({
                        ...prev,
                        companyName: storeInfo.businessName || storeInfo.name || '',
                        companyAddress: storeInfo.businessAddress || '',
                        taxCode: storeInfo.taxCode || '',
                        legalRepPhone: storeInfo.phone || '',
                        legalRepEmail: storeInfo.email || '',
                    }))

                    // Pre-fill business license if available
                    if (storeInfo.businessLicense) {
                        setDocuments(prev => ({
                            ...prev,
                            businessLicense: storeInfo.businessLicense,
                        }))
                    }
                }
            } catch (error) {
                console.error('Error fetching store info:', error)
            }
        }

        // Only fetch store info if there's no existing registration
        if (!registration && !isLoading) {
            fetchStoreInfo()
        }
    }, [registration, isLoading])

    // Event handlers
    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleDocumentUpload = (field: string, url: string) => {
        setDocuments(prev => ({
            ...prev,
            [field]: url
        }))
    }

    const handleQualityStandardChange = (field: string, checked: boolean) => {
        setQualityStandards(prev => ({
            ...prev,
            [field]: checked
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Validate required fields
            if (!formData.type || !formData.brandName || !formData.companyName || !formData.legalRepName) {
                showError('Vui lòng điền đầy đủ các trường bắt buộc')
                return
            }

            // Validate documents based on registration type
            if (formData.type === BrandRegistrationType.BRAND_OWNER && !documents.trademarkCertificate) {
                showError('Giấy chứng nhận đăng ký nhãn hiệu là bắt buộc cho đăng ký thương hiệu chính chủ')
                return
            }

            if (formData.type === BrandRegistrationType.DISTRIBUTOR && !documents.distributionContract) {
                showError('Hợp đồng phân phối là bắt buộc cho đăng ký phân phối thương hiệu')
                return
            }

            if (formData.type === BrandRegistrationType.SHOPEE_MALL) {
                const requiredStandards = Object.values(qualityStandards).every(Boolean)
                if (!requiredStandards || !formData.authenticity) {
                    showError('Shopee Mall yêu cầu đáp ứng đầy đủ tất cả tiêu chí chất lượng')
                    return
                }
            }

            const registrationData = {
                ...formData,
                ...documents,
                qualityStandards: JSON.stringify(qualityStandards),
                supportingDocuments: JSON.stringify(documents.supportingDocuments),
            }

            await api.post('/seller/brand-registration', registrationData)

            success('Đăng ký thương hiệu đã được gửi thành công! Chúng tôi sẽ xem xét và phản hồi trong vòng 3-5 ngày làm việc.')

            // Reload registration data
            const response = await api.get('/seller/brand-registration')
            if (response.data.registrations && response.data.registrations.length > 0) {
                setRegistration(response.data.registrations[0])
            }
        } catch (error) {
            console.error('Error submitting brand registration:', error)
            showError('Có lỗi xảy ra khi gửi đăng ký thương hiệu')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleResubmit = () => {
        // Reset registration to allow form to show again
        setRegistration(null)

        // Reset form if needed
        if (registration) {
            setFormData({
                type: registration.type,
                brandName: registration.brandName || '',
                description: registration.description || '',
                companyName: registration.companyName || '',
                companyAddress: '',
                taxCode: '',
                legalRepName: '',
                legalRepPhone: '',
                legalRepEmail: '',
                returnPolicy: '',
                authenticity: false,
            })
        }
    }

    // Render functions
    const renderLoadingState = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        </div>
    )

    const renderRegistrationStatus = () => {
        if (!registration) return null;

        const status = statusConfig[registration.status]
        const StatusIcon = status.icon

        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="w-6 h-6" />
                            Trạng thái đăng ký thương hiệu
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className={`p-4 rounded-lg ${status.color}`}>
                            <div className="flex items-center gap-2">
                                <StatusIcon className="w-5 h-5" />
                                <span className="font-medium">{status.label}</span>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div>
                                <Label>Tên thương hiệu</Label>
                                <p className="mt-1 font-medium">{registration.brandName}</p>
                            </div>

                            <div>
                                <Label>Hình thức đăng ký</Label>
                                <p className="mt-1">{
                                    registration.type === 'BRAND_OWNER' ? 'Thương hiệu chính chủ' :
                                        registration.type === 'DISTRIBUTOR' ? 'Nhà phân phối' :
                                            'Shopee Mall'
                                }</p>
                            </div>

                            {registration.description && (
                                <div>
                                    <Label>Mô tả</Label>
                                    <p className="mt-1 text-muted-foreground">{registration.description}</p>
                                </div>
                            )}

                            <div>
                                <Label>Ngày đăng ký</Label>
                                <p className="mt-1 text-muted-foreground">
                                    {new Date(registration.submittedAt).toLocaleDateString('vi-VN')}
                                </p>
                            </div>

                            {registration.reviewedAt && (
                                <div>
                                    <Label>Ngày phản hồi</Label>
                                    <p className="mt-1 text-muted-foreground">
                                        {new Date(registration.reviewedAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            )}

                            {registration.rejectionReason && (
                                <div>
                                    <Label>Lý do từ chối</Label>
                                    <p className="mt-1 text-red-600">{registration.rejectionReason}</p>
                                </div>
                            )}
                        </div>

                        {(registration.status === 'REJECTED' || registration.status === 'RESUBMISSION') && (
                            <Button
                                className="w-full"
                                onClick={handleResubmit}
                            >
                                Đăng ký lại
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        )
    }

    const renderRegistrationForm = () => {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="w-6 h-6" />
                            Đăng ký thương hiệu Shopee Mall
                        </CardTitle>
                        <p className="text-muted-foreground">
                            Chọn hình thức đăng ký phù hợp với tình trạng thương hiệu của bạn
                        </p>
                        {formData.companyName && (
                            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Lưu ý:</strong> Chúng tôi đã tự động điền sẵn thông tin từ cửa hàng của bạn.
                                    Bạn có thể chỉnh sửa nếu thông tin người đại diện pháp luật khác với thông tin cửa hàng.
                                </p>
                            </div>
                        )}
                    </CardHeader>
                </Card>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Registration Type Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Chọn hình thức đăng ký</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {registrationTypes.map((type) => (
                                    <div
                                        key={type.id}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50 ${formData.type === type.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200'
                                            }`}
                                        onClick={() => handleInputChange('type', type.id)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {type.icon}
                                                <h3 className="font-semibold text-sm">{type.title}</h3>
                                            </div>
                                            <Badge
                                                variant={type.premium ? "default" : "secondary"}
                                                className={type.premium ? "bg-yellow-500" : ""}
                                            >
                                                {type.badge}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            {type.description}
                                        </p>
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-600">Yêu cầu:</p>
                                            <ul className="text-xs text-gray-500 space-y-1">
                                                {type.requirements.map((req, index) => (
                                                    <li key={index} className="flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                                        {req}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {formData.type && (
                        <>
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Thông tin cơ bản</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="brandName">Tên thương hiệu *</Label>
                                            <Input
                                                id="brandName"
                                                value={formData.brandName}
                                                onChange={(e) => handleInputChange('brandName', e.target.value)}
                                                placeholder="Nhập tên thương hiệu"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="companyName">Tên công ty *</Label>
                                            <Input
                                                id="companyName"
                                                value={formData.companyName}
                                                onChange={(e) => handleInputChange('companyName', e.target.value)}
                                                placeholder="Nhập tên công ty"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Mô tả thương hiệu</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            placeholder="Mô tả chi tiết về thương hiệu, lĩnh vực hoạt động..."
                                            rows={4}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="taxCode">Mã số thuế</Label>
                                            <Input
                                                id="taxCode"
                                                value={formData.taxCode}
                                                onChange={(e) => handleInputChange('taxCode', e.target.value)}
                                                placeholder="Mã số thuế"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="companyAddress">Địa chỉ công ty</Label>
                                            <Input
                                                id="companyAddress"
                                                value={formData.companyAddress}
                                                onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                                                placeholder="Địa chỉ công ty"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Legal Representative */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Thông tin người đại diện pháp luật</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="legalRepName">Họ và tên *</Label>
                                            <Input
                                                id="legalRepName"
                                                value={formData.legalRepName}
                                                onChange={(e) => handleInputChange('legalRepName', e.target.value)}
                                                placeholder="Họ và tên"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="legalRepPhone">Số điện thoại *</Label>
                                            <Input
                                                id="legalRepPhone"
                                                value={formData.legalRepPhone}
                                                onChange={(e) => handleInputChange('legalRepPhone', e.target.value)}
                                                placeholder="Số điện thoại"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="legalRepEmail">Email *</Label>
                                            <Input
                                                id="legalRepEmail"
                                                type="email"
                                                value={formData.legalRepEmail}
                                                onChange={(e) => handleInputChange('legalRepEmail', e.target.value)}
                                                placeholder="Email"
                                                required
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Documents */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tài liệu pháp lý</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Upload các tài liệu cần thiết theo hình thức đăng ký đã chọn
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Business License */}
                                    <div className="space-y-2">
                                        <Label>Giấy phép kinh doanh *</Label>
                                        <CloudinaryUpload
                                            value={documents.businessLicense}
                                            onChange={(url) => handleDocumentUpload('businessLicense', url)}
                                            folder="brand-documents"
                                            placeholder="Upload giấy phép kinh doanh"
                                        />
                                    </div>

                                    {/* Trademark Certificate - Required for BRAND_OWNER */}
                                    {formData.type === BrandRegistrationType.BRAND_OWNER && (
                                        <div className="space-y-2">
                                            <Label>Giấy chứng nhận đăng ký nhãn hiệu *</Label>
                                            <CloudinaryUpload
                                                value={documents.trademarkCertificate}
                                                onChange={(url) => handleDocumentUpload('trademarkCertificate', url)}
                                                folder="brand-documents"
                                                placeholder="Upload giấy chứng nhận đăng ký nhãn hiệu"
                                            />
                                        </div>
                                    )}

                                    {/* Distribution Contract - Required for DISTRIBUTOR */}
                                    {formData.type === BrandRegistrationType.DISTRIBUTOR && (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Hợp đồng phân phối *</Label>
                                                <CloudinaryUpload
                                                    value={documents.distributionContract}
                                                    onChange={(url) => handleDocumentUpload('distributionContract', url)}
                                                    folder="brand-documents"
                                                    placeholder="Upload hợp đồng phân phối"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Giấy ủy quyền</Label>
                                                <CloudinaryUpload
                                                    value={documents.authorizationLetter}
                                                    onChange={(url) => handleDocumentUpload('authorizationLetter', url)}
                                                    folder="brand-documents"
                                                    placeholder="Upload giấy ủy quyền"
                                                />
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Shopee Mall Requirements */}
                            {formData.type === BrandRegistrationType.SHOPEE_MALL && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Star className="w-5 h-5 text-yellow-500" />
                                            Yêu cầu Shopee Mall
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Shopee Mall có tiêu chuẩn cao hơn để đảm bảo chất lượng dịch vụ
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <h4 className="font-medium">Tiêu chuẩn chất lượng (Bắt buộc đáp ứng tất cả)</h4>
                                            <div className="space-y-3">
                                                {[
                                                    { key: 'productQuality', label: 'Cam kết chất lượng sản phẩm cao' },
                                                    { key: 'customerService', label: 'Dịch vụ khách hàng 24/7' },
                                                    { key: 'deliveryCommitment', label: 'Cam kết giao hàng nhanh' },
                                                    { key: 'returnGuarantee', label: 'Chính sách đổi trả 7 ngày' },
                                                    { key: 'authenticityGuarantee', label: 'Đảm bảo hàng chính hãng 100%' },
                                                ].map((standard) => (
                                                    <div key={standard.key} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={standard.key}
                                                            checked={qualityStandards[standard.key as keyof typeof qualityStandards]}
                                                            onCheckedChange={(checked) =>
                                                                handleQualityStandardChange(standard.key, !!checked)
                                                            }
                                                        />
                                                        <Label htmlFor={standard.key} className="text-sm">
                                                            {standard.label}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="returnPolicy">Chính sách đổi trả chi tiết *</Label>
                                            <Textarea
                                                id="returnPolicy"
                                                value={formData.returnPolicy}
                                                onChange={(e) => handleInputChange('returnPolicy', e.target.value)}
                                                placeholder="Mô tả chi tiết chính sách đổi trả 7 ngày của bạn..."
                                                rows={4}
                                                required
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="authenticity"
                                                checked={formData.authenticity}
                                                onCheckedChange={(checked) => handleInputChange('authenticity', !!checked)}
                                            />
                                            <Label htmlFor="authenticity" className="text-sm">
                                                Tôi cam kết 100% sản phẩm là hàng chính hãng và chịu trách nhiệm pháp lý về cam kết này *
                                            </Label>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Submit */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-blue-900">
                                                    Lưu ý quan trọng
                                                </p>
                                                <ul className="text-sm text-blue-800 space-y-1">
                                                    <li>• Thời gian xem xét: 3-5 ngày làm việc</li>
                                                    <li>• Chúng tôi có thể yêu cầu bổ sung tài liệu nếu cần</li>
                                                    <li>• Sau khi được duyệt, bạn có thể gắn thương hiệu cho sản phẩm</li>
                                                    <li>• Shopee Mall có quy trình kiểm duyệt nghiêm ngặt hơn</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isSubmitting}
                                        size="lg"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        {isSubmitting ? 'Đang gửi đăng ký...' : 'Gửi đăng ký thương hiệu'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </form>
            </div>
        )
    }

    // Main render
    if (isLoading) {
        return renderLoadingState()
    }

    if (registration) {
        return renderRegistrationStatus()
    }

    return renderRegistrationForm()
}

export default BrandRegistrationPage 