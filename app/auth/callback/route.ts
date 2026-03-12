import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    // Важно: cookies вызываем внутри, чтобы получить свежие данные
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Обмениваем код на сессию
    await supabase.auth.exchangeCodeForSession(code)
  }

  // После обмена ПРИНУДИТЕЛЬНО отправляем в кабинет
  // Используем origin, чтобы редирект был абсолютным (http://localhost:3000/dashboard)
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}