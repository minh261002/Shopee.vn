'use client';

import { Store, XCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface StorePendingDialogProps {
    status?: 'PENDING_APPROVAL' | 'SUSPENDED' | 'CLOSED';
}

export function StorePendingDialog({ status = 'PENDING_APPROVAL' }: StorePendingDialogProps) {
    const getStatusInfo = () => {
        switch (status) {
            case 'SUSPENDED':
                return {
                    title: 'Cửa hàng đã bị tạm khóa',
                    description: 'Cửa hàng của bạn đã bị tạm khóa do vi phạm chính sách.',
                    icon: XCircle,
                    color: 'from-red-500 to-red-700'
                };
            case 'CLOSED':
                return {
                    title: 'Cửa hàng đã đóng',
                    description: 'Cửa hàng của bạn đã bị đóng vĩnh viễn.',
                    icon: XCircle,
                    color: 'from-gray-500 to-gray-700'
                };
            default:
                return {
                    title: 'Cửa hàng đang chờ duyệt',
                    description: 'Cửa hàng của bạn đang được đội ngũ Shopee xem xét. Vui lòng chờ trong thời gian ngắn.',
                    icon: Store,
                    color: 'from-[#ee4d2d] to-[#ff7337]'
                };
        }
    };

    const statusInfo = getStatusInfo();
    const IconComponent = statusInfo.icon;

    return (
        <Dialog open={true} onOpenChange={() => { }}>
            <DialogTitle>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <Image
                            src="/images/logo.png"
                            alt="Shopee"
                            width={150}
                            height={50}
                            className='object-contain'
                            style={{
                                filter: 'brightness(0) invert(1)',
                            }}
                        />
                    </div>
                </div>
            </DialogTitle>
            <DialogContent className="sm:max-w-md !p-0 !gap-0 overflow-hidden" showCloseButton={false}>
                <div className={`bg-gradient-to-br ${statusInfo.color} h-[400px] w-full relative flex flex-col items-center justify-center text-white overflow-hidden`}>
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
                                    <IconComponent className="w-16 h-16" />
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
                            <h2 className="text-2xl font-bold mb-4">{statusInfo.title}</h2>
                            <p className="text-white/90">
                                {statusInfo.description}
                            </p>
                            {status === 'PENDING_APPROVAL' && (
                                <p className="text-white/90 mt-2">
                                    Chúng tôi sẽ thông báo ngay khi cửa hàng được duyệt.
                                </p>
                            )}
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
    );
} 