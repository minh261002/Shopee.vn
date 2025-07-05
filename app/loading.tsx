export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-6">
                {/* Shopee Logo Loading Animation */}
                <div className="relative">
                    {/* Outer rotating ring */}
                    <div className="w-16 h-16 rounded-full border-4 border-orange-200 dark:border-orange-800 animate-spin">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500" />
                        </div>
                    </div>

                    {/* Inner pulsing circle */}
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 animate-pulse opacity-80" />

                    {/* Center Shopee "S" style icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1/2 h-1/2 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                            <div className="text-orange-500 font-bold text-sm font-shopee-display">S</div>
                        </div>
                    </div>
                </div>

                {/* Loading dots */}
                <div className="flex space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>

                {/* Loading text */}
                <div className="text-center">
                    <p className="text-lg font-medium text-foreground font-shopee-display mb-2">
                        Shopee
                    </p>
                    <p className="text-sm text-muted-foreground font-shopee-display">
                        Đang tải...
                    </p>
                    <div className="flex justify-center mt-3">
                        <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                            <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                            <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
            </div>
        </div>
    )
} 