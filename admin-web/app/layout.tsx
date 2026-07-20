import type { Metadata } from "next";
import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import "./globals.css";

export const metadata: Metadata = {
  title: "Restaurant POS",
  description: "The Restaurant POS Admin Panel",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      {...mantineHtmlProps}
    >
      <head>
        <ColorSchemeScript defaultColorScheme="light"/>
      </head>
      <body><MantineProvider defaultColorScheme="light">{children}</MantineProvider></body>
    </html>
  );
}
