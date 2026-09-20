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
  description: "丈育谐音章鱼。围着石头房子顺时针接成语，散场评最丈育和最有文化。",
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
      <body className="min-h-full">{children}</body>
    </html>
  );
}
