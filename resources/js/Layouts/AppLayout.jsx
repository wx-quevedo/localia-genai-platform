import { Link, usePage } from '@inertiajs/react'
import { useTheme } from '@/hooks/useTheme'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function MoonIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    )
}

function SunIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    )
}

export default function AppLayout({ children }) {
    const { auth } = usePage().props
    const { theme, toggle } = useTheme()
    const user = auth.user

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : '?'

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Sidebar */}
            <aside className="w-60 border-r border-border flex flex-col shrink-0">
                <div className="h-14 flex items-center px-5 border-b border-border">
                    <span className="font-semibold tracking-tight text-lg">Localia</span>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        Panel principal
                    </Link>
                    <Link
                        href="/servicios"
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        Servicios
                    </Link>
                    <Link
                        href="/jobs"
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        Mis jobs
                    </Link>
                    <Link
                        href="/perfil"
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        Perfil
                    </Link>

                    {user?.role === 'admin' && (
                        <>
                            <Separator className="my-2" />
                            <p className="px-3 py-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                Administración
                            </p>
                            <Link
                                href="/admin/invitaciones"
                                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                Invitaciones
                            </Link>
                            <Link
                                href="/admin/servicios"
                                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                Servicios
                            </Link>
                            <Link
                                href="/admin/jobs"
                                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                Jobs
                            </Link>
                        </>
                    )}
                </nav>

                <div className="p-3 border-t border-border">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-3 w-full px-2 py-2 rounded-md hover:bg-accent transition-colors text-left">
                                <Avatar className="h-7 w-7">
                                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                                <Link href="/logout" method="post" as="button" className="w-full cursor-pointer">
                                    Cerrar sesión
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-14 border-b border-border flex items-center justify-end px-6 gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Cambiar tema">
                        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                    </Button>
                </header>

                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
