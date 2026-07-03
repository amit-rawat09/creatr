import { Inter } from "next/font/google";
import "./globals.css";
import { shadesOfPurple } from "@clerk/ui/themes";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Content Platform",
  description: "Content Creation powered by AI",
};

export default function RootLayout({ children }) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${inter.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {" "}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider
            appearance={{
              theme: shadesOfPurple,
            }}
          >
            <ConvexClientProvider>
              {/* HAEDER */}
              <Header />
              <main className="bg-slate-900 min-h-screen text-white overflow-x-hidden">
                {children}
              </main>
              <footer className="relative z-10 border-t py-8 px-4 sm:px-6">
                <div className="max-w-7x1 mx-auto text-center">
                  <p className="text-muted-foreground">
                    Made with ❤️ by{" "}
                    <span className="text-foreground font-semibold">
                      Amit Rawat
                    </span>
                  </p>
                </div>
              </footer>
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
