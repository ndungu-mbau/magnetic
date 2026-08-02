'use client'

import { cashAdapterClient } from '@/payments/cash/client'
import { AuthProvider } from '@/providers/Auth'
import { EcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { useState } from 'react'

import { SonnerProvider } from '@/providers/Sonner'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 2,
            gcTime: 1000 * 60 * 10,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <HeaderThemeProvider>
            <SonnerProvider />
            <EcommerceProvider
              enableVariants={true}
              currenciesConfig={{
                defaultCurrency: 'KES',
                supportedCurrencies: [
                  {
                    code: 'KES',
                    decimals: 2,
                    label: 'Kenya Shilling',
                    symbol: 'KSH',
                  },
                ],
              }}
              api={{
                cartsFetchQuery: {
                  depth: 2,
                  populate: {
                    products: {
                      slug: true,
                      title: true,
                      gallery: true,
                      inventory: true,
                      priceInKES: true,
                    },
                    variants: {
                      title: true,
                      inventory: true,
                      priceInKES: true,
                    },
                  },
                },
              }}
              paymentMethods={[cashAdapterClient()]}
            >
              {children}
            </EcommerceProvider>
          </HeaderThemeProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
