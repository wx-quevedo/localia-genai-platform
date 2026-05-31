import { Head, usePage } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Dashboard() {
    const { auth } = usePage().props

    return (
        <AppLayout>
            <Head title="Panel principal" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Bienvenido, {auth.user?.name}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Aquí verás un resumen de tu actividad en Localia.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Contenidos generados', value: '—' },
                        { label: 'Proyectos activos', value: '—' },
                        { label: 'Créditos disponibles', value: '—' },
                    ].map((stat) => (
                        <Card key={stat.label}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground text-center py-12">
                            El contenido del panel se completará en los siguientes módulos.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
