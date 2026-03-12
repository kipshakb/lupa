import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link" // Добавили импорт

import { db } from "@/lib/db"
import { EmptyPlaceholder } from "@/components/empty-placeholder"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { PostItem } from "@/components/post-item"
import { buttonVariants } from "@/components/ui/button" // Добавили для стилизации кнопки
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Личный кабинет",
}

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const user = session.user

  const events = await db.event.findMany({
    where: {
      authorId: user.id,
    },
    select: {
      id: true,
      title: true,
      date: true,
      createdAt: true,
    },
    orderBy: {
      date: "desc",
    },
  })

  return (
    <DashboardShell>
      {/* РАЗДЕЛ 1: МОИ МЕРОПРИЯТИЯ */}
      <DashboardHeader heading="Мои мероприятия" text="Управляйте созданными событиями.">
        {/* ЗАМЕНИЛИ PostCreateButton на Link */}
        <Link 
          href="/events/new" 
          className={cn(buttonVariants({ variant: "default" }))}
        >
          + Создать событие
        </Link>
      </DashboardHeader>
      
      <div className="mb-12">
        {events?.length ? (
          <div className="divide-y divide-border rounded-md border">
            {events.map((event) => (
              <PostItem 
                key={event.id} 
                post={{
                  id: event.id,
                  title: event.title,
                  createdAt: event.createdAt,
                  published: true 
                }} 
              />
            ))}
          </div>
        ) : (
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="post" />
            <EmptyPlaceholder.Title>Мероприятий пока нет</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              Вы еще не создали ни одного события. Пора это исправить!
            </EmptyPlaceholder.Description>
            {/* ТУТ ТОЖЕ ЗАМЕНИЛИ */}
            <Link 
              href="/events/new" 
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Создать событие
            </Link>
          </EmptyPlaceholder>
        )}
      </div>

      {/* РАЗДЕЛ 2: БИЛЕТЫ */}
      <div className="pt-10 border-t">
        <DashboardHeader 
          heading="Билеты" 
          text="Ваши купленные билеты на мероприятия." 
        />
        
        <div className="mt-4">
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="billing" />
            <EmptyPlaceholder.Title>Билетов пока нет</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              Вы еще не купили ни одного билета. Найдите интересное событие на главной.
            </EmptyPlaceholder.Description>
            {/* Кнопка перехода на главную */}
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
              На главную
            </Link>
          </EmptyPlaceholder>
        </div>
      </div>
    </DashboardShell>
  )
}