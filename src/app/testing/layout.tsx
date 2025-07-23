'use client';

import { AuthProvider } from "@/context/AuthContext";
import { BudgetProvider } from "@/context/BudgetProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <BudgetProvider>
            {children}
          </BudgetProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
