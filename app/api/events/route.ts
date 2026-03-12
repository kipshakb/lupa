import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // 1. Проверяем сессию Supabase
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: "Вы должны быть авторизованы" },
        { status: 401 }
      )
    }

    // 2. СИНХРОНИЗАЦИЯ ПОЛЬЗОВАТЕЛЯ (ВОТ РЕШЕНИЕ ОШИБКИ)
    // Проверяем, знает ли Prisma этого юзера
    const existingUser = await db.user.findUnique({
      where: { id: session.user.id }
    })

    // Если не знает — создаем запись в таблице User
    if (!existingUser) {
      await db.user.create({
        data: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "Организатор",
        }
      })
    }

    // 3. Получаем данные из формы
    const body = await request.json()

    if (!body.title || (!body.datetime && !body.date)) {
      return NextResponse.json({ error: "Название и дата обязательны" }, { status: 400 })
    }

    // 4. Создаем событие
    const newEvent = await db.event.create({
      data: {
        title: body.title,
        description: body.description || "",
        date: new Date(body.datetime || body.date).toISOString(),
        
        lat: body.lat ? parseFloat(String(body.lat)) : 51.1283,
        lng: body.lng ? parseFloat(String(body.lng)) : 71.4305,
        format: body.format || "offline",
        
        price: body.price ? parseInt(String(body.price).replace(/\D/g, "")) || 0 : 0,
        authorId: session.user.id, 
      },
    })

    return NextResponse.json(newEvent)
  } catch (error: any) {
    console.error("API_POST_ERROR:", error)
    return NextResponse.json(
      { error: "Не удалось сохранить мероприятие", details: error.message }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const events = await db.event.findMany({
      orderBy: { date: "asc" },
    })
    return NextResponse.json(events)
  } catch (error) {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 })
  }
}