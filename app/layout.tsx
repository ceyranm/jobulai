import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = await createClient();
    const { data: settings } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['meta_title', 'meta_description', 'logo_url']);

    const metaTitle = settings?.find(s => s.key === 'meta_title')?.value || 'JobulAI';
    const metaDescription = settings?.find(s => s.key === 'meta_description')?.value || 'Yapay zeka destekli İK çözümleri ile işe alım süreçlerinizi optimize edin.';
    const logoUrl = settings?.find(s => s.key === 'logo_url')?.value || 'https://i.hizliresim.com/fug98qj.png';

    return {
      title: {
        default: metaTitle,
        template: `%s | ${metaTitle}`,
      },
      description: metaDescription,
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        type: 'website',
        images: [
          {
            url: logoUrl,
            width: 1200,
            height: 630,
            alt: metaTitle,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        images: [logoUrl],
      },
      icons: {
        icon: logoUrl,
        shortcut: logoUrl,
        apple: logoUrl,
      },
    };
  } catch (error) {
    // Hata durumunda varsayılan değerler
    const defaultLogo = 'https://i.hizliresim.com/fug98qj.png';
    return {
      title: {
        default: "JobulAI",
        template: "%s | JobulAI",
      },
      description: "Yapay zeka destekli İK çözümleri ile işe alım süreçlerinizi optimize edin.",
      openGraph: {
        title: "JobulAI",
        description: "Yapay zeka destekli İK çözümleri ile işe alım süreçlerinizi optimize edin.",
        type: 'website',
        images: [
          {
            url: defaultLogo,
            width: 1200,
            height: 630,
            alt: "JobulAI",
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: "JobulAI",
        description: "Yapay zeka destekli İK çözümleri ile işe alım süreçlerinizi optimize edin.",
        images: [defaultLogo],
      },
      icons: {
        icon: defaultLogo,
        shortcut: defaultLogo,
        apple: defaultLogo,
      },
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
