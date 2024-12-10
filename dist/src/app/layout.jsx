import localFont from "next/font/local";
import Header from "./components/Header.js";
import Footer from "./components/Footer.js";
import "./globals.css";
const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});
export const metadata = {
    title: "Denver Contractors | Find Trusted Local Contractors",
    description: "Connect with qualified contractors in Denver for your home improvement, renovation, and maintenance needs. Get trusted local service providers in the Denver metro area.",
    keywords: "denver contractors, home improvement denver, renovation contractors denver, local contractors, trusted contractors denver",
    metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
    openGraph: {
        title: "Denver Contractors | Find Trusted Local Contractors",
        description: "Connect with qualified contractors in Denver for your home improvement needs",
        locale: "en_US",
        type: "website"
    }
};
export default function RootLayout({ children, }) {
    return (<html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>);
}