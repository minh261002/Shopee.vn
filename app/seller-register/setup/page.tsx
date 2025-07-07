'use client';

import React, { useState, useEffect } from 'react';
import { redirect, useRouter } from 'next/navigation';
import {
  Store,
  Phone,
  MapPin,
  Building,
  FileText,
  Shield,
  Facebook,
  Instagram,
  Youtube,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Globe,
  Truck,
  Undo,
  Award
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import MaxWidthWrapper from '@/components/layouts/MaxWidthWrapper';
import AddressPicker from '@/components/ui/address-picker';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { authClient } from '@/lib/auth-client';
import type { DefaultSession } from 'better-auth';

interface FormData {
  // Basic info
  name: string;
  description: string;
  type: 'INDIVIDUAL' | 'BUSINESS' | 'CORPORATION' | 'OFFICIAL';

  // Contact
  phone: string;
  email: string;
  website: string;

  // Business info
  businessName: string;
  businessAddress: string;
  taxCode: string;
  businessLicense: string;

  // Location
  address: string;
  ward: string;
  city: string;
  country: string;
  lat?: number;
  lng?: number;

  // Policies
  returnPolicy: string;
  shippingPolicy: string;
  warrantyPolicy: string;

  // Social media
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
}

interface AddressData {
  address: string;
  lat?: number;
  lng?: number;
  type?: 'HOME' | 'WORK' | 'OTHER';
  isDefault?: boolean;
}

const SetupStore = () => {

  const router = useRouter();

  const { data: session } = authClient.useSession();
  const role = (session?.user as DefaultSession['user'])?.role;

  useEffect(() => {
    if (role && role !== 'USER') {
      return redirect('/seller-register');
    }
  }, [role, router]);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    type: 'INDIVIDUAL',
    phone: '',
    email: '',
    website: '',
    businessName: '',
    businessAddress: '',
    taxCode: '',
    businessLicense: '',
    address: '',
    ward: '',
    city: '',
    lat: undefined,
    lng: undefined,
    country: 'Vietnam',
    returnPolicy: '',
    shippingPolicy: '',
    warrantyPolicy: '',
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddressChange = (address: AddressData) => {
    setFormData({
      ...formData,
      address: address.address,
      lat: address.lat,
      lng: address.lng,
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.type) {
          toast.error('Vui lòng điền đầy đủ thông tin cơ bản');
          return false;
        }
        break;
      case 2:
        if (!formData.phone || !formData.email) {
          toast.error('Vui lòng điền đầy đủ thông tin liên hệ');
          return false;
        }
        // Validate phone format
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(formData.phone)) {
          toast.error('Số điện thoại không hợp lệ');
          return false;
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast.error('Email không hợp lệ');
          return false;
        }
        break;
      case 3:
        if (!formData.address) {
          toast.error('Vui lòng điền đầy đủ địa chỉ');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setShowLoadingModal(true);

    // Simulate progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    try {
      await api.post('/stores', formData);
      // Wait for progress to complete
      await new Promise(resolve => setTimeout(resolve, 10000));

      toast.success('Đăng ký cửa hàng thành công! Đang chờ phê duyệt.');
      router.push('/seller/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
      setShowLoadingModal(false);
    } finally {
      setIsSubmitting(false);
      clearInterval(interval);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="border-none shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#ee4d2d]">
                <Store className="w-5 h-5" />
                Thông tin cơ bản
              </CardTitle>
              <CardDescription>
                Điền thông tin cơ bản về cửa hàng của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-base">Tên cửa hàng *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="VD: Thời trang ABC"
                  className="mt-1.5"
                />
                <p className="text-sm text-gray-500 mt-1">Tên cửa hàng sẽ được hiển thị cho khách hàng</p>
              </div>

              <div>
                <Label htmlFor="type" className="text-base">Loại hình kinh doanh *</Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Chọn loại hình" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL">Cá nhân</SelectItem>
                    <SelectItem value="BUSINESS">Hộ kinh doanh</SelectItem>
                    <SelectItem value="CORPORATION">Công ty</SelectItem>
                    <SelectItem value="OFFICIAL">Cửa hàng chính hãng</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">Chọn loại hình phù hợp với cửa hàng của bạn</p>
              </div>

              <div>
                <Label htmlFor="description" className="text-base">Mô tả cửa hàng</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Giới thiệu về cửa hàng của bạn..."
                  rows={4}
                  className="mt-1.5"
                />
                <p className="text-sm text-gray-500 mt-1">Mô tả ngắn gọn về cửa hàng để khách hàng hiểu rõ hơn</p>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="border-none shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#ee4d2d]">
                <Phone className="w-5 h-5" />
                Thông tin liên hệ
              </CardTitle>
              <CardDescription>
                Thông tin để khách hàng liên hệ với bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="phone" className="text-base">Số điện thoại *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0901234567"
                  className="mt-1.5"
                />
                <p className="text-sm text-gray-500 mt-1">Số điện thoại chính để liên hệ</p>
              </div>

              <div>
                <Label htmlFor="email" className="text-base">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="shop@example.com"
                  className="mt-1.5"
                />
                <p className="text-sm text-gray-500 mt-1">Email để nhận thông báo từ Shopee</p>
              </div>

              <div>
                <Label htmlFor="website" className="text-base flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="mt-1.5"
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium text-base">Mạng xã hội</h4>

                <div>
                  <Label htmlFor="facebookUrl" className="text-base flex items-center gap-2">
                    <Facebook className="w-4 h-4" /> Facebook
                  </Label>
                  <Input
                    id="facebookUrl"
                    name="facebookUrl"
                    value={formData.facebookUrl}
                    onChange={handleInputChange}
                    placeholder="https://facebook.com/yourpage"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="instagramUrl" className="text-base flex items-center gap-2">
                    <Instagram className="w-4 h-4" /> Instagram
                  </Label>
                  <Input
                    id="instagramUrl"
                    name="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={handleInputChange}
                    placeholder="https://instagram.com/yourpage"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="youtubeUrl" className="text-base flex items-center gap-2">
                    <Youtube className="w-4 h-4" /> Youtube
                  </Label>
                  <Input
                    id="youtubeUrl"
                    name="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/@yourchannel"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="border-none shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#ee4d2d]">
                <MapPin className="w-5 h-5" />
                Địa chỉ cửa hàng
              </CardTitle>
              <CardDescription>
                Địa chỉ lấy hàng và trả hàng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AddressPicker
                value={{
                  address: formData.address,
                  lat: formData.lat,
                  lng: formData.lng,
                }}
                onChange={handleAddressChange}
              />

              <div>
                <Label htmlFor="city" className="text-base">Tỉnh/Thành phố</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Tỉnh/Thành phố"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="ward" className="text-base">Xã/Phường</Label>
                <Input
                  id="ward"
                  name="ward"
                  value={formData.ward}
                  onChange={handleInputChange}
                  placeholder="Xã/Phường"
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="border-none shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#ee4d2d]">
                <Building className="w-5 h-5" />
                Thông tin doanh nghiệp
              </CardTitle>
              <CardDescription>
                Thông tin pháp lý (không bắt buộc)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="businessName" className="text-base">Tên doanh nghiệp</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Công ty TNHH ABC"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="businessAddress" className="text-base">Địa chỉ doanh nghiệp</Label>
                <Input
                  id="businessAddress"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleInputChange}
                  placeholder="Địa chỉ đăng ký kinh doanh"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="taxCode" className="text-base">Mã số thuế</Label>
                <Input
                  id="taxCode"
                  name="taxCode"
                  value={formData.taxCode}
                  onChange={handleInputChange}
                  placeholder="0123456789"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="businessLicense" className="text-base">Giấy phép kinh doanh</Label>
                <Input
                  id="businessLicense"
                  name="businessLicense"
                  value={formData.businessLicense}
                  onChange={handleInputChange}
                  placeholder="Số giấy phép"
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card className="border-none shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#ee4d2d]">
                <Shield className="w-5 h-5" />
                Chính sách cửa hàng
              </CardTitle>
              <CardDescription>
                Chính sách bán hàng của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="returnPolicy" className="text-base flex items-center gap-2">
                  <Undo className="w-4 h-4" /> Chính sách đổi trả
                </Label>
                <Textarea
                  id="returnPolicy"
                  name="returnPolicy"
                  value={formData.returnPolicy}
                  onChange={handleInputChange}
                  placeholder="VD: Đổi trả trong vòng 7 ngày..."
                  rows={3}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="shippingPolicy" className="text-base flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Chính sách vận chuyển
                </Label>
                <Textarea
                  id="shippingPolicy"
                  name="shippingPolicy"
                  value={formData.shippingPolicy}
                  onChange={handleInputChange}
                  placeholder="VD: Miễn phí vận chuyển cho đơn từ 500k..."
                  rows={3}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="warrantyPolicy" className="text-base flex items-center gap-2">
                  <Award className="w-4 h-4" /> Chính sách bảo hành
                </Label>
                <Textarea
                  id="warrantyPolicy"
                  name="warrantyPolicy"
                  value={formData.warrantyPolicy}
                  onChange={handleInputChange}
                  placeholder="VD: Bảo hành 12 tháng..."
                  rows={3}
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <MaxWidthWrapper className="py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Đăng ký cửa hàng</h1>
            <p className="text-gray-600">Hoàn thành các bước sau để mở cửa hàng trên Shopee</p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${step <= currentStep
                    ? 'bg-[#ee4d2d] text-white'
                    : 'bg-gray-200 text-gray-600'
                    }`}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-1 bg-gray-200" />
              </div>
              <div
                className="absolute inset-0 flex items-center"
                style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
              >
                <div className="w-full h-1 bg-[#ee4d2d]" />
              </div>
            </div>
          </div>

          {/* Form content */}
          <div className="mb-8">
            {renderStep()}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại
            </Button>

            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                className="flex items-center gap-2 bg-[#ee4d2d] hover:bg-[#d73c1a]"
              >
                Tiếp theo
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-[#ee4d2d] hover:bg-[#d73c1a]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Hoàn tất đăng ký
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </MaxWidthWrapper>

      {/* Loading Modal */}
      <Dialog open={showLoadingModal} onOpenChange={() => { }}>
        <DialogContent className="sm:max-w-md !p-0 !gap-0 overflow-hidden" showCloseButton={false}>
          <div className="bg-gradient-to-br from-[#ee4d2d] to-[#ff7337] h-[400px] w-full relative flex flex-col items-center justify-center text-white overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '30px' }} />
              </div>
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/30"
                  initial={{
                    x: Math.random() * 100 - 50 + '%',
                    y: '120%',
                    scale: Math.random() * 0.5 + 0.5,
                    opacity: 0
                  }}
                  animate={{
                    y: '-20%',
                    opacity: [0, 1, 0],
                    rotate: Math.random() * 360
                  }}
                  transition={{
                    duration: Math.random() * 2 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "linear"
                  }}
                  style={{
                    left: `${Math.random() * 100}%`
                  }}
                />
              ))}
            </div>

            {/* Store Icon Container */}
            <div className="relative w-32 h-32 mb-8">
              {/* Glowing Effect */}
              <motion.div
                className="absolute inset-0 bg-white/20 blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Base Store */}
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-full h-full bg-white/20 backdrop-blur-sm flex items-center justify-center relative">
                  {/* Store Icon with Pulse & Float Effect */}
                  <motion.div
                    animate={{
                      y: [-4, 4, -4],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                      scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <Store className="w-16 h-16" />
                  </motion.div>

                  {/* Pulse Ring Effect */}
                  <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{
                      scale: [0.8, 1.2],
                      opacity: [0.5, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  >
                    <div className="w-full h-full border-2 border-white/30" />
                  </motion.div>

                  {/* Second Pulse Ring */}
                  <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{
                      scale: [0.8, 1.2],
                      opacity: [0.5, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay: 0.75
                    }}
                  >
                    <div className="w-full h-full border-2 border-white/30" />
                  </motion.div>

                  {/* Inner Glow */}
                  <motion.div
                    className="absolute inset-0 bg-white/10"
                    animate={{
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </motion.div>

              {/* Loading Border */}
              <motion.div
                className="absolute inset-0"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-full h-full border-4 border-t-white/80 border-r-white/40 border-b-white/20 border-l-white/60" />
              </motion.div>

              {/* Loading Corners with Glow */}
              <div className="absolute inset-0">
                {[
                  { position: "top-0 left-0", borders: "border-t-4 border-l-4", delay: 0 },
                  { position: "top-0 right-0", borders: "border-t-4 border-r-4", delay: 0.2 },
                  { position: "bottom-0 left-0", borders: "border-b-4 border-l-4", delay: 0.4 },
                  { position: "bottom-0 right-0", borders: "border-b-4 border-r-4", delay: 0.6 }
                ].map((corner, index) => (
                  <motion.div
                    key={index}
                    className={`absolute ${corner.position} w-8 h-8 ${corner.borders} border-white`}
                    animate={{
                      opacity: [0.2, 1, 0.2],
                      boxShadow: [
                        "0 0 0px rgba(255,255,255,0.2)",
                        "0 0 20px rgba(255,255,255,0.5)",
                        "0 0 0px rgba(255,255,255,0.2)"
                      ]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: corner.delay
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Text with Glow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center px-6 relative"
            >
              <motion.div
                animate={{
                  textShadow: [
                    "0 0 20px rgba(255,255,255,0.2)",
                    "0 0 40px rgba(255,255,255,0.4)",
                    "0 0 20px rgba(255,255,255,0.2)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <h2 className="text-2xl font-bold mb-4">Đang cấu hình cửa hàng</h2>
                <p className="text-white/90 mb-2">
                  Vui lòng đợi trong giây lát...
                </p>
                <div className="flex items-center justify-center gap-2 text-lg font-medium">
                  <span>Tiến độ</span>
                  <span>{loadingProgress}%</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Background Squares with Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                className="absolute -right-32 -top-32 w-64 h-64 bg-white/10"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1],
                  rotate: [0, 90, 0],
                  boxShadow: [
                    "0 0 0px rgba(255,255,255,0.2)",
                    "0 0 100px rgba(255,255,255,0.4)",
                    "0 0 0px rgba(255,255,255,0.2)"
                  ]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute -left-40 -bottom-40 w-80 h-80 bg-white/10"
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.2, 0.1, 0.2],
                  rotate: [90, 0, 90],
                  boxShadow: [
                    "0 0 0px rgba(255,255,255,0.2)",
                    "0 0 100px rgba(255,255,255,0.4)",
                    "0 0 0px rgba(255,255,255,0.2)"
                  ]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SetupStore;