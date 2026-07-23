import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Geist } from "next/font/google";
import { cn } from "@workspace/ui/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("h-full", "font-sans", geist.variable)}>
      <body className="h-full">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
