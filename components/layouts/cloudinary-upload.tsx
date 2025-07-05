"use client";

import { CldUploadWidget, CloudinaryUploadWidgetResults } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";

interface CloudinaryUploadProps {
    value?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    folder?: string;
    multiple?: boolean;
    maxFiles?: number;
    className?: string;
    placeholder?: string;
}

export function CloudinaryUpload({
    value,
    onChange,
    disabled = false,
    folder = "uploads",
    multiple = false,
    maxFiles = 1,
    className = "",
    placeholder = "Upload ảnh"
}: CloudinaryUploadProps) {
    const [isLoading, setIsLoading] = useState(false);
    const onUpload = (result: CloudinaryUploadWidgetResults) => {
        if (typeof result.info === 'object' && 'secure_url' in result.info) {
            onChange(result.info.secure_url);
            setIsLoading(false);
        }
    };

    const onRemove = () => {
        onChange("");
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"}
                options={{
                    folder,
                    multiple,
                    maxFiles,
                    resourceType: "auto",
                    sources: ["local", "url", "camera", "image_search", "google_drive", "dropbox"],
                    showAdvancedOptions: true,
                    cropping: false,
                    clientAllowedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
                    maxImageFileSize: 5000000, // 5MB
                }}
                onSuccess={onUpload}
                onError={(error) => {
                    console.error("Upload error:", error);
                    setIsLoading(false);
                }}
                onOpen={() => setIsLoading(true)}
                onClose={() => setIsLoading(false)}
            >
                {({ open }) => (
                    <div className="space-y-4">
                        {value ? (
                            <div className="relative w-full max-w-sm mx-auto">
                                <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                                    <Image
                                        src={value}
                                        alt="Uploaded image"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    onClick={onRemove}
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                                    disabled={disabled}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div
                                onClick={() => !disabled && open()}
                                className={`
                  relative cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors
                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                  ${isLoading ? "opacity-75" : ""}
                `}
                            >
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    {isLoading ? (
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    ) : (
                                        <ImageIcon className="h-8 w-8 text-gray-400" />
                                    )}
                                    <div className="text-sm text-gray-600">
                                        <p className="font-medium">
                                            {isLoading ? "Đang mở widget..." : placeholder}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PNG, JPG, GIF tối đa 5MB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {value && (
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    onClick={() => open()}
                                    variant="outline"
                                    className="flex-1"
                                    disabled={disabled}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Thay đổi ảnh
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CldUploadWidget>
        </div>
    );
}

// Component cho multiple upload
interface CloudinaryMultipleUploadProps {
    values?: string[];
    onChange: (values: string[]) => void;
    disabled?: boolean;
    folder?: string;
    maxFiles?: number;
    className?: string;
    placeholder?: string;
}

export function CloudinaryMultipleUpload({
    values = [],
    onChange,
    disabled = false,
    folder = "uploads",
    maxFiles = 10,
    className = "",
    placeholder = "Upload nhiều ảnh"
}: CloudinaryMultipleUploadProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [renderKey, setRenderKey] = useState(0);
    const [currentValues, setCurrentValues] = useState<string[]>(values);
    const valuesRef = useRef<string[]>(values);

    useEffect(() => {
        setCurrentValues(values);
        valuesRef.current = values;
    }, [values]);

    const onUpload = (result: CloudinaryUploadWidgetResults) => {
        if (result.info && typeof result.info === 'object') {
            let urlToAdd: string | null = null;

            if (Array.isArray(result.info)) {
                const newUrls = result.info
                    .filter(info => info && typeof info === 'object' && 'secure_url' in info)
                    .map(info => (info as { secure_url: string }).secure_url);

                for (const url of newUrls) {
                    const refValues = valuesRef.current;
                    if (refValues.length < maxFiles && !refValues.includes(url)) {
                        const newValues = [...refValues, url];
                        onChange(newValues);
                        setCurrentValues(newValues);
                        valuesRef.current = newValues;
                    }
                }
            }
            else if ('secure_url' in result.info) {
                urlToAdd = (result.info as { secure_url: string }).secure_url;

                const refValues = valuesRef.current;

                if (refValues.length < maxFiles && !refValues.includes(urlToAdd)) {

                    const newValues = [...refValues, urlToAdd];
                    onChange(newValues);
                    setCurrentValues(newValues);
                    valuesRef.current = newValues;

                    setRenderKey(prev => prev + 1);
                } else {
                }
            } else {
            }
        } else {
        }
    };

    const onRemove = (urlToRemove: string) => {
        const newValues = valuesRef.current.filter(url => url !== urlToRemove);
        onChange(newValues);
        setCurrentValues(newValues);
    };

    return (
        <div className={`space-y-4 ${className}`}>

            <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"}
                options={{
                    folder,
                    multiple: true,
                    maxFiles: Math.max(1, maxFiles - valuesRef.current.length),
                    resourceType: "auto",
                    sources: ["local", "url", "camera", "image_search", "google_drive", "dropbox"],
                    showAdvancedOptions: true,
                    cropping: false,
                    clientAllowedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
                    maxImageFileSize: 5000000, // 5MB
                    queueViewPosition: "bottom",
                    showPoweredBy: false,
                    theme: "minimal",
                    styles: {
                        palette: {
                            window: "#FFFFFF",
                            windowBorder: "#90A0B3",
                            tabIcon: "#0078FF",
                            menuIcons: "#5A616A",
                            textDark: "#000000",
                            textLight: "#FFFFFF",
                            link: "#0078FF",
                            action: "#FF620C",
                            inactiveTabIcon: "#0E2F5A",
                            error: "#F44235",
                            inProgress: "#0078FF",
                            complete: "#20B832",
                            sourceBg: "#E4EBF1"
                        }
                    }
                }}
                onSuccess={onUpload}
                onError={(error) => {
                    console.error("Upload error:", error);
                    setIsLoading(false);
                }}
                onOpen={() => {
                    setIsLoading(true);
                }}
                onClose={() => {
                    setIsLoading(false);
                }}
                onQueuesEnd={() => {
                    setIsLoading(false);
                }}
                onUpload={() => {
                    setIsLoading(false);
                }}
            >
                {({ open }) => (
                    <div className="space-y-4">
                        {currentValues.length > 0 && (
                            <div key={`gallery-${renderKey}`} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                                {currentValues.map((url, index) => {
                                    const uniqueKey = `${url}-${index}-${url.split('/').pop()}`;
                                    return (
                                        <div key={uniqueKey} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100 min-h-[120px]">
                                            <Image
                                                src={url}
                                                alt={`Uploaded image ${index + 1}`}
                                                fill
                                                className="object-cover w-full h-full"
                                                unoptimized
                                                priority={index < 4}
                                                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                            />
                                            <Button
                                                type="button"
                                                onClick={() => onRemove(url)}
                                                variant="destructive"
                                                size="sm"
                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 z-10"
                                                disabled={disabled}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {valuesRef.current.length < maxFiles ? (
                            <div
                                onClick={() => !disabled && open()}
                                className={`
                  relative cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors
                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                  ${isLoading ? "opacity-75" : ""}
                `}
                            >
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    {isLoading ? (
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    ) : (
                                        <Upload className="h-8 w-8 text-gray-400" />
                                    )}
                                    <div className="text-sm text-gray-600">
                                        <p className="font-medium">
                                            {isLoading ? "Đang upload..." : placeholder}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PNG, JPG, GIF tối đa 5MB ({valuesRef.current.length}/{maxFiles})
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-6 text-center">
                                <div className="text-sm text-gray-500">
                                    <p className="font-medium">Đã đạt giới hạn tối đa</p>
                                    <p className="text-xs mt-1">
                                        {valuesRef.current.length}/{maxFiles} ảnh
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CldUploadWidget>
        </div>
    );
} 