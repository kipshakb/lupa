import Link from "next/link"
import Image from "next/image"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

import { marketingConfig } from "@/config/marketing"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { UserAccountNav } from "@/components/user-account-nav" // Импортируем человечка

interface MarketingLayoutProps {
  children: React.ReactNode
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  // 1. Инициализируем Supabase и получаем сессию
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background">
        {/* Верхняя линия */}
        <div className="container flex h-16 items-center justify-between">
          {/* Лого */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl"
          >
            <Image
              src="/logo.svg"
              alt="LUPA logo"
              width={46}
              height={46}
            />
            <span>LUPA</span>
          </Link>

          {/* Кнопка создания */}
          <div className="hidden md:flex flex-1 justify-center">
            <Link
              href="/events/new"
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "px-6"
              )}
            >
              + Создать мероприятие
            </Link>
          </div>

          {/* Город / язык / логин или человечек */}
          <div className="flex items-center gap-4">
            <button className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground">
              Астана
            </button>
            <button className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground">
              RU
            </button>

            {/* ПРОВЕРКА АВТОРИЗАЦИИ */}
            {session?.user ? (
              // Если залогинен — наш человечек
              <UserAccountNav
                user={{
                  email: session.user.email,
                  name: session.user.user_metadata?.full_name || null,
                  image: session.user.user_metadata?.avatar_url || null,
                }}
              />
            ) : (
              // Если аноним — твоя кнопка Login
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "sm" }),
                  "px-4"
                )}
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Нижняя линия с пунктами */}
        <div className="border-y-2 py-2">
          <div className="container flex h-14 items-center">
            <div className="flex w-full justify-between">
              <MainNav items={marketingConfig.mainNav} />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}