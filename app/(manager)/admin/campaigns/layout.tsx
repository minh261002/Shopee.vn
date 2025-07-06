import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Quản lý chiến dịch",
    description: "Quản lý các chiến dịch marketing và quảng cáo",
};

export default function CampaignsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
} 