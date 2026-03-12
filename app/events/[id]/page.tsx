import { notFound } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// 1. ИСПРАВИЛ ТУТ: eventId -> id (потому что папка называется [id])
interface EventPageProps {
  params: {
    id: string
  }
}

export default async function EventPage({ params }: EventPageProps) {
  // 2. ИСПРАВИЛ ТУТ: params.eventId -> params.id
  const event = await db.event.findUnique({
    where: {
      id: params.id, 
    },
    include: {
      author: {
        select: {
          name: true,
        }
      }
    }
  })

  if (!event) {
    // 3. ИСПРАВИЛ ТУТ: params.eventId -> params.id
    if (["1", "2", "3", "4", "5"].includes(params.id)) {
       return (
         <div className="container py-10 max-w-4xl">
            <Link href="/" className="inline-flex items-center text-sm mb-6 hover:underline text-muted-foreground">
              ← Назад
            </Link>
            <div className="p-10 border rounded-xl text-center">
              <h2 className="text-xl font-bold">Это тестовый шаблон</h2>
              <p className="text-muted-foreground">Попробуйте открыть событие, созданное через личный кабинет.</p>
            </div>
         </div>
       )
    }

    return notFound()
  }

  // 3. Если событие найдено в базе, форматируем данные для вывода
  const formattedDate = new Date(event.date).toLocaleDateString('ru-RU', { 
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
  })
  
  const priceDisplay = event.price > 0 ? `${event.price} ₸` : "Бесплатно"

  // 4. Отрисовываем страницу
  return (
    <div className="container py-10 max-w-3xl">
      <Link href="/" className="inline-flex items-center text-sm mb-6 hover:underline text-muted-foreground bg-muted/20 px-4 py-2 rounded-lg">
        ← Назад
      </Link>

      <div className="border rounded-2xl overflow-hidden bg-card shadow-sm">
        {/* Картинка (если есть) или заглушка */}
        <div className="w-full aspect-video bg-muted relative border-b flex items-center justify-center">
          {(event as any).imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={(event as any).imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-muted-foreground font-medium uppercase tracking-widest text-sm opacity-50">
              {event.format || "Мероприятие LUPA"}
            </span>
          )}
        </div>

        {/* Инфо блок */}
        <div className="p-8">
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">
            {formattedDate}
          </p>
          <h1 className="text-3xl font-bold leading-tight mb-4">{event.title}</h1>
          
          <div className="flex flex-col gap-2 mb-8 text-sm text-muted-foreground">
            <p>📍 {event.lat && event.lng ? `Координаты: ${event.lat}, ${event.lng}` : "Астана (локация уточняется)"}</p>
            <p>💰 {priceDisplay}</p>
            <p>👤 Организатор: {event.author?.name || "Пользователь LUPA"}</p>
          </div>

          <div className="prose prose-sm md:prose-base max-w-none text-foreground mb-8">
            <h3 className="text-xl font-semibold mb-2">О событии</h3>
            <p className="whitespace-pre-wrap">{event.description || "Организатор не добавил описание."}</p>
          </div>

          <div className="pt-6 border-t">
            <button className={cn(buttonVariants({ size: "lg" }), "w-full md:w-auto font-bold")}>
              Купить билет • {priceDisplay}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}