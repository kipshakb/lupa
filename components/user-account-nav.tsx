"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar } from "@/components/user-avatar"

interface UserAccountNavProps extends React.HTMLAttributes<HTMLDivElement> {
  user: {
    email: string | undefined
    name?: string | null
    image?: string | null
  }
}

export function UserAccountNav({ user }: UserAccountNavProps) {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleSignOut = async (event: Event) => {
    event.preventDefault()
    await supabase.auth.signOut()
    
    // Освежаем страницу и перекидываем на главную
    router.refresh()
    router.push("/")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          user={{ 
            name: user.name || user.email || null, 
            image: user.image || null 
          }}
          className="h-8 w-8"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        
        {/* Оставили только Личный кабинет */}
        <DropdownMenuItem asChild>
          <Link href="/dashboard">Личный кабинет</Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Переименовали в Выйти */}
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onSelect={(event) => handleSignOut(event)}
        >
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}