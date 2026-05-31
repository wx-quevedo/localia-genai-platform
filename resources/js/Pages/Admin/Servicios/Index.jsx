import { useEffect } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from '@/components/ui/table'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

const ENGINE_LABELS = { comfyui: 'ComfyUI', lmstudio: 'LM Studio' }
const ENGINE_COLORS = {
    comfyui:  'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    lmstudio: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
}

export default function AdminServiciosIndex({ services }) {
    const { flash } = usePage().props

    useEffect(() => {
        if (flash?.success) toast.success(flash.success)
        if (flash?.error)   toast.error(flash.error)
    }, [flash])

    function handleToggle(id) {
        router.patch(`/admin/servicios/${id}/toggle`, {}, { preserveScroll: true })
    }

    function handleDelete(id, name) {
        if (confirm(`¿Eliminar el servicio "${name}"? Esta acción no se puede deshacer.`)) {
            router.delete(`/admin/servicios/${id}`)
        }
    }

    return (
        <AppLayout>
            <Head title="Servicios — Admin" />
            <Toaster />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Servicios</h1>
                        <p className="text-muted-foreground mt-1">
                            Gestiona los servicios disponibles en la plataforma.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/servicios/crear">Nuevo servicio</Link>
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Motor</TableHead>
                                    <TableHead className="text-center">Inputs</TableHead>
                                    <TableHead className="text-center">Activo</TableHead>
                                    <TableHead className="w-32" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {services.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                                            No hay servicios creados todavía.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    services.map((svc) => (
                                        <TableRow key={svc.id}>
                                            <TableCell className="font-medium">{svc.name}</TableCell>
                                            <TableCell>
                                                <Badge className={ENGINE_COLORS[svc.engine]}>
                                                    {ENGINE_LABELS[svc.engine]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center text-muted-foreground">
                                                {svc.inputs_count}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Switch
                                                    checked={svc.is_active}
                                                    onCheckedChange={() => handleToggle(svc.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 justify-end">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/admin/servicios/${svc.id}/editar`}>
                                                            Editar
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDelete(svc.id, svc.name)}
                                                    >
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
