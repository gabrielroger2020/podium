import { Inter } from "next/font/google";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Podium",
  description: "Sistema de gerenciamento de competições",
};

export default function RootLayout({ children }) {
  return (
    
      <html lang="pt-BR">
        <body className={inter.className}><MantineProvider withGlobalStyles withCSSVariables  withNormalizeCSS>
          <ModalsProvider>
          <Notifications></Notifications>
          {children}
          </ModalsProvider>
          </MantineProvider></body>
        
      </html>
    
  );
}
