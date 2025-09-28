import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { AuthProvider } from "./lib/auth";
import { ThemeProvider } from "./context/ThemeContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Note: Aptos font will be loaded via Google Fonts web API

export const metadata: Metadata = {
  title: "Jan Samadhan - Community & Direct Digital Governance",
  description: "A digital platform for community-driven problem solving and direct digital governance - connecting citizens with local authorities to resolve civic issues efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Aptos:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${poppins.variable}`}>
        <ConvexClientProvider>
          <AuthProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
