import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { RecaptchaProvider } from "@/providers/recaptcha-provider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shopee Việt Nam | Mua và Bán Trên Ứng Dụng Di Động Hoặc Website",
  description: "Mua sắm trực tuyến hàng triệu sản phẩm ở tất cả ngành hàng. Giá tốt & Miễn phí vận chuyển. Mua và bán online trong 30 giây. Voucher Xtra | Freeship 0Đ | Shopee Đảm Bảo",
  icons: {
    icon: "/images/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="mdl-js">
      <body
        className={`${geistMono.variable} antialiased`}
      >
        <RecaptchaProvider>
          {children}
          <Toaster
            position="top-center"
            richColors
            duration={3000}
          />
        </RecaptchaProvider>
      </body>
    </html>
  );
}
