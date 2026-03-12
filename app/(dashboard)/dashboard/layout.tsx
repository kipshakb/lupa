import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

import { UserAccountNav } from "@/components/user-account-nav"
import { SiteFooter } from "@/components/site-footer"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect("/login")

  const user = session.user

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-10">
            {/* Логотип LUPA */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/logo.svg"
                  alt="Lupa"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-xl tracking-tight uppercase">LUPA</span>
                
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right leading-none mr-2">
              <span className="font-bold text-sm">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </span>
            </div>
            <UserAccountNav
              user={{
                name: user.user_metadata?.full_name || null,
                image: user.user_metadata?.avatar_url || null,
                email: user.email ?? undefined,
              }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 container py-10 max-w-5xl">
        {children}
      </main>
      <SiteFooter className="border-t" />
    </div>
  )
}