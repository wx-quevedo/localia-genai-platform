import { Head, Link, usePage } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Dashboard({ stats }) {
    const { auth } = usePage().props

    const cards = [
        { label: 'Jobs totales',    value: stats.total },
        { label: 'Completados',     value: stats.completados },
        { label: 'En proceso',      value: stats.en_proceso },
    ]

    return (
        <AppLayout>
            <Head title="Panel principal" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Bienvenido, {auth.user?.name}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Resumen de tu actividad en Localia.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {cards.map((c) => (
                        <Card key={c.label}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {c.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold tabular-nums">{c.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardContent className="pt-6 flex flex-col items-center gap-4 py-12">
                        <p className="text-muted-foreground text-sm text-center">
                            Genera contenido usando los servicios disponibles.
                        </p>
                        <Button asChild>
                            <Link href="/servicios">Explorar servicios</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
