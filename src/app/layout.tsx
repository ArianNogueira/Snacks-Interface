"use client";

import "@/app/global.css";
import { Provider } from 'react-redux';
import  { store }  from "../store/reduceres/store";
import { AuthProvider } from "@/contexts/AuthContext";
 
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="icon" type="image/png" href="/assets/Logo%20Favicon.ico" />
      </head>
      <body>
        <Provider store={store}>
          <AuthProvider>
          {children}
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}
