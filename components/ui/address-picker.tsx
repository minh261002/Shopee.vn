"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Định nghĩa types Google Maps (nếu chưa có @types/google.maps)
// declare global {
//   interface Window {
//     google: typeof google;
//     initMap: () => void;
//   }
// }

interface AddressPickerProps {
    value: {
        address: string;
        lat?: number;
        lng?: number;
        type?: 'HOME' | 'WORK' | 'OTHER';
        isDefault?: boolean;
    };
    onChange: (value: {
        address: string;
        lat?: number;
        lng?: number;
        type?: 'HOME' | 'WORK' | 'OTHER';
        isDefault?: boolean;
    }) => void;
    placeholder?: string;
    className?: string;
    isStore?: boolean;
}

const AddressPicker = ({ value, onChange, placeholder = "Chọn địa chỉ", className = "", isStore = false }: AddressPickerProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlace, setSelectedPlace] = useState<{
        address: string;
        lat: number;
        lng: number;
    } | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [marker, setMarker] = useState<google.maps.Marker | null>(null);
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);

    const mapRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Đồng bộ selectedPlace với value khi mở dialog
    useEffect(() => {
        if (isDialogOpen) {
            if (value.address && value.lat && value.lng) {
                setSelectedPlace({ address: value.address, lat: value.lat, lng: value.lng });
            } else {
                setSelectedPlace(null);
            }
        }
    }, [isDialogOpen, value]);

    // Load Google Maps API
    useEffect(() => {
        if (!isDialogOpen) return;
        if (window.google && window.google.maps && window.google.maps.places) {
            setIsMapReady(true);
            return;
        }
        setIsMapReady(false);
        const scriptId = 'google-maps-script';
        if (document.getElementById(scriptId)) return;
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setIsMapReady(true);
        document.head.appendChild(script);
    }, [isDialogOpen]);

    // Khởi tạo map và autocomplete khi Google Maps đã sẵn sàng
    useEffect(() => {
        if (!isDialogOpen || !isMapReady || !mapRef.current || !window.google) return;
        // Xóa map cũ nếu có
        if (map) setMap(null);
        if (marker) setMarker(null);
        if (autocomplete) setAutocomplete(null);

        const defaultCenter = value.lat && value.lng
            ? { lat: value.lat, lng: value.lng }
            : { lat: 10.762622, lng: 106.660172 };
        const mapInstance = new window.google.maps.Map(mapRef.current, {
            center: defaultCenter,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
        });
        setMap(mapInstance);

        // Marker nếu có tọa độ
        let markerInstance: google.maps.Marker | null = null;
        if (value.lat && value.lng) {
            markerInstance = new window.google.maps.Marker({
                position: { lat: value.lat, lng: value.lng },
                map: mapInstance,
                draggable: true,
            });
            setMarker(markerInstance);
            markerInstance.addListener('dragend', () => {
                const position = markerInstance!.getPosition();
                if (position) {
                    setSelectedPlace({
                        address: value.address,
                        lat: position.lat(),
                        lng: position.lng(),
                    });
                }
            });
        }

        // Autocomplete cho search input
        if (searchInputRef.current) {
            const autocompleteInstance = new window.google.maps.places.Autocomplete(searchInputRef.current, {
                types: ['geocode'],
            });
            autocompleteInstance.addListener('place_changed', () => {
                const place = autocompleteInstance.getPlace();
                if (place.geometry && place.geometry.location && place.formatted_address) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    const address = place.formatted_address;
                    setSelectedPlace({ address, lat, lng });
                    mapInstance.setCenter({ lat, lng });
                    mapInstance.setZoom(17);
                    if (markerInstance) markerInstance.setMap(null);
                    markerInstance = new window.google.maps.Marker({
                        position: { lat, lng },
                        map: mapInstance,
                        draggable: true,
                    });
                    setMarker(markerInstance);
                    markerInstance.addListener('dragend', () => {
                        const position = markerInstance!.getPosition();
                        if (position) {
                            setSelectedPlace({
                                address,
                                lat: position.lat(),
                                lng: position.lng(),
                            });
                        }
                    });
                }
            });
            setAutocomplete(autocompleteInstance);
        }

        // Click trên map để chọn địa chỉ
        mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (!event.latLng) return;
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const address = results[0].formatted_address;
                    setSelectedPlace({ address, lat, lng });
                    if (markerInstance) markerInstance.setMap(null);
                    markerInstance = new window.google.maps.Marker({
                        position: { lat, lng },
                        map: mapInstance,
                        draggable: true,
                    });
                    setMarker(markerInstance);
                    markerInstance.addListener('dragend', () => {
                        const position = markerInstance!.getPosition();
                        if (position) {
                            setSelectedPlace({
                                address,
                                lat: position.lat(),
                                lng: position.lng(),
                            });
                        }
                    });
                }
            });
        });
        // eslint-disable-next-line
    }, [isDialogOpen, isMapReady]);

    // Reset state khi đóng dialog
    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setSelectedPlace(null);
        setSearchQuery('');
        setMap(null);
        setMarker(null);
        setAutocomplete(null);
    };

    const handleConfirm = () => {
        if (!selectedPlace) {
            toast.error('Vui lòng chọn một địa chỉ');
            return;
        }
        onChange({
            address: selectedPlace.address,
            lat: selectedPlace.lat,
            lng: selectedPlace.lng,
            type: value.type || 'HOME',
            isDefault: value.isDefault || false,
        });
        handleDialogClose();
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="space-y-2">
                <Label>Địa chỉ</Label>
                <div className="flex gap-2">
                    <Input
                        value={value.address}
                        placeholder={placeholder}
                        readOnly
                        className="flex-1"
                    />
                    <Button
                        type="button"
                        onClick={() => setIsDialogOpen(true)}
                        variant="default"
                    >
                        <MapPin className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            {value.address && !isStore && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Loại địa chỉ</Label>
                        <Select
                            value={value.type || 'HOME'}
                            onValueChange={(type: 'HOME' | 'WORK' | 'OTHER') =>
                                onChange({ ...value, type })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HOME">Nhà riêng</SelectItem>
                                <SelectItem value="WORK">Văn phòng</SelectItem>
                                <SelectItem value="OTHER">Khác</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isDefault"
                            checked={value.isDefault || false}
                            onCheckedChange={(checked) =>
                                onChange({ ...value, isDefault: checked })
                            }
                        />
                        <Label htmlFor="isDefault">Địa chỉ mặc định</Label>
                    </div>
                </div>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Chọn địa chỉ</DialogTitle>
                        <DialogDescription>
                            Tìm kiếm hoặc click trên bản đồ để chọn địa chỉ
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tìm kiếm địa chỉ</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    ref={searchInputRef}
                                    placeholder="Nhập địa chỉ để tìm kiếm..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <div
                                ref={mapRef}
                                className="w-full h-96 rounded-lg border"
                                style={{ minHeight: '400px' }}
                            />
                            {!isMapReady && (
                                <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                        <span>Đang tải bản đồ...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {selectedPlace && (
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="font-medium">Địa chỉ đã chọn:</p>
                                <p className="text-sm text-muted-foreground">{selectedPlace.address}</p>
                                <p className="text-xs text-muted-foreground">
                                    Tọa độ: {selectedPlace.lat.toFixed(6)}, {selectedPlace.lng.toFixed(6)}
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleDialogClose}>
                            Hủy
                        </Button>
                        <Button onClick={handleConfirm} disabled={!selectedPlace}>
                            Xác nhận
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AddressPicker; 