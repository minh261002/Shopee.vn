"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Store,
    AlertCircle,
    Upload,
    ArrowLeft
} from 'lucide-react'
import { CloudinaryUpload } from '@/components/layouts/cloudinary-upload'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/axios'
import { useRouter } from 'next/navigation'
import { BrandRegistrationStatus, BrandRegistrationType } from '@prisma/client'
import Link from 'next/link'

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

const BrandRegistrationResubmit = () => {
    const router = useRouter()
    const { success, error: showError } = useToast()

    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [rejectedRegistration, setRejectedRegistration] = useState<BrandRegistration | null>(null)
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

    useEffect(() => {
        const fetchRejectedRegistration = async () => {
            try {
                const response = await api.get('/seller/brand-registration')
                const registrations = response.data.registrations || []

                // Find the latest rejected or resubmission required registration
                const rejected = registrations.find((r: BrandRegistration) =>
                    r.status === 'REJECTED' || r.status === 'RESUBMISSION'
                )

                if (!rejected) {
                    showError('Không tìm thấy đăng ký bị từ chối hoặc yêu cầu nộp lại')
                    router.push('/seller/brand-registration')
                    return
                }

                setRejectedRegistration(rejected)

                // Pre-fill form with existing data
                setFormData({
                    type: rejected.type,
                    brandName: rejected.brandName || '',
                    description: rejected.description || '',
                    companyName: rejected.companyName || '',
                    companyAddress: rejected.companyAddress || '',
                    taxCode: rejected.taxCode || '',
                    legalRepName: rejected.legalRepName || '',
                    legalRepPhone: rejected.legalRepPhone || '',
                    legalRepEmail: rejected.legalRepEmail || '',
                    returnPolicy: rejected.returnPolicy || '',
                    authenticity: rejected.authenticity || false,
                })

                // Pre-fill documents
                setDocuments({
                    businessLicense: rejected.businessLicense || '',
                    trademarkCertificate: rejected.trademarkCertificate || '',
                    distributionContract: rejected.distributionContract || '',
                    authorizationLetter: rejected.authorizationLetter || '',
                    supportingDocuments: rejected.supportingDocuments ?
                        JSON.parse(rejected.supportingDocuments) : [],
                })
            } catch (error) {
                console.error('Error fetching rejected registration:', error)
                showError('Có lỗi xảy ra khi tải thông tin đăng ký')
                router.push('/seller/brand-registration')
            } finally {
                setIsLoading(false)
            }
        }

        fetchRejectedRegistration()
    }, [])

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

            const registrationData = {
                ...formData,
                ...documents,
                supportingDocuments: JSON.stringify(documents.supportingDocuments),
            }

            await api.post('/seller/brand-registration', registrationData)

            success('Đăng ký thương hiệu đã được gửi lại thành công! Chúng tôi sẽ xem xét và phản hồi trong vòng 3-5 ngày làm việc.')
            router.push('/seller/brand-registration')
        } catch (error) {
            console.error('Error resubmitting brand registration:', error)
            showError('Có lỗi xảy ra khi gửi lại đăng ký thương hiệu')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/seller/brand-registration">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại
                            </Link>
                        </Button>
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="w-6 h-6" />
                                Gửi lại đăng ký thương hiệu
                            </CardTitle>
                            <p className="text-muted-foreground">
                                Cập nhật và gửi lại hồ sơ đăng ký thương hiệu
                            </p>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {rejectedRegistration && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            Lý do từ chối / Yêu cầu bổ sung
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <Badge variant="destructive" className="mb-2">
                                {rejectedRegistration.status === 'REJECTED' ? 'Đã từ chối' : 'Yêu cầu nộp lại'}
                            </Badge>
                            <p className="text-red-800 text-sm">
                                {rejectedRegistration.rejectionReason}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                            Vui lòng upload lại tài liệu theo yêu cầu
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
                                        <li>• Vui lòng xem kỹ lý do từ chối ở trên và cập nhật thông tin cho phù hợp</li>
                                        <li>• Thời gian xem xét: 3-5 ngày làm việc</li>
                                        <li>• Hãy đảm bảo tài liệu được upload rõ ràng và đầy đủ</li>
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
                            {isSubmitting ? 'Đang gửi lại...' : 'Gửi lại đăng ký thương hiệu'}
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}

export default BrandRegistrationResubmit 