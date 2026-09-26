import type { Metadata, Viewport } from "next";
import { Noto_Sans_SC, ZCOOL_XiaoWei } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
});

const display = ZCOOL_XiaoWei({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "章鱼哥接龙",
  description: "丈育谐音章鱼。在章鱼哥房子前围着石桌顺时针接成语，散场评最丈育和最有文化。",
  applicationName: "章鱼哥接龙",
};

export const viewport: Viewport = {
  themeColor: "#063044",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${noto.variable} ${display.variable} h-full antialiased`}
    >
      <head>
        <link rel="preload" as="image" href="/zhangyu/sand.webp" fetchPriority="high" />
        <link rel="preload" as="image" href="/zhangyu/sea.webp" fetchPriority="high" />
        <link rel="preload" as="image" href="/zhangyu/house.webp?v=4" fetchPriority="high" />
        <link rel="preload" as="image" href="/zhangyu/interior.webp?v=8" fetchPriority="high" />
        <link rel="preload" as="image" href="/zhangyu/octopus.webp" />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
