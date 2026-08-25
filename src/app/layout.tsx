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
