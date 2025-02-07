"use client";

import "./globals.css"; 
import { Provider } from 'react-redux';
import  { store }  from "../store/reduceres/store";
 
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider store={store}>
      <html lang="pt-br">
        <body>
          {children}
        </body>
      </html>
    </Provider>
  );
}
