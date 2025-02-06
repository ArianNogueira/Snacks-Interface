import "./globals.css"; 
import { Main } from "../components/main";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body>
        {<Main/>}
        {children}
      </body>
    </html>
  );
}
