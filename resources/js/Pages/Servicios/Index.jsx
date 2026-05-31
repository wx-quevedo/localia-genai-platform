import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const ENGINE_LABELS = { comfyui: 'ComfyUI', lmstudio: 'LM Studio' }
const ENGINE_COLORS = {
    comfyui:  'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    lmstudio: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
}

export default function ServiciosIndex({ services }) {
    return (
        <AppLayout>
            <Head title="Servicios" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Servicios</h1>
                    <p className="text-muted-foreground mt-1">
                        Selecciona un servicio para comenzar a generar contenido.
                    </p>
                </div>

                {services.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="text-4xl mb-4 opacity-20">◈</div>
                        <p className="text-muted-foreground">
                            No hay servicios disponibles en este momento.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {services.map((svc) => (
                            <Card
                                key={svc.id}
                                className="flex flex-col hover:border-foreground/20 transition-colors"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <CardTitle className="text-base leading-snug">
                                            {svc.name}
                                        </CardTitle>
                                        <Badge className={`shrink-0 ${ENGINE_COLORS[svc.engine]}`}>
                                            {ENGINE_LABELS[svc.engine]}
                                        </Badge>
                                    </div>
                                    {svc.description && (
                                        <CardDescription className="line-clamp-2">
                                            {svc.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardFooter className="mt-auto pt-0">
                                    <Button asChild className="w-full" variant="outline">
                                        <Link href={`/servicios/${svc.slug}`}>
                                            Usar servicio
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
