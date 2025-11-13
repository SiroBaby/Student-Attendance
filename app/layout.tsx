import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Điểm Danh Học Sinh",
  description: "Ứng dụng quản lý điểm danh học sinh theo ngày",
  other: {
    // Ngăn chặn một số browser extension can thiệp
    'X-UA-Compatible': 'IE=edge',
    'X-Content-Type-Options': 'nosniff',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="extension-block" content="true" />
        <meta name="no-extension" content="true" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Clean up browser extension attributes before React hydrates
              (function() {
                function cleanupExtensionAttributes() {
                  const elements = document.querySelectorAll('[bis_skin_checked], [__processed_04fbf972-6771-4057-b16c-7dce7bfdac27__]');
                  elements.forEach(el => {
                    el.removeAttribute('bis_skin_checked');
                    Array.from(el.attributes).forEach(attr => {
                      if (attr.name.startsWith('__processed_') || attr.name.includes('bis_')) {
                        el.removeAttribute(attr.name);
                      }
                    });
                  });
                }
                
                // Run immediately
                cleanupExtensionAttributes();
                
                // Run again after DOM is ready
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', cleanupExtensionAttributes);
                } else {
                  cleanupExtensionAttributes();
                }
                
                // Monitor for new extension modifications
                if (typeof MutationObserver !== 'undefined') {
                  const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                      if (mutation.type === 'attributes' && 
                          (mutation.attributeName === 'bis_skin_checked' || 
                           mutation.attributeName?.startsWith('__processed_'))) {
                        mutation.target.removeAttribute(mutation.attributeName);
                      }
                    });
                  });
                  
                  observer.observe(document.documentElement, {
                    attributes: true,
                    subtree: true,
                    attributeFilter: ['bis_skin_checked']
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
