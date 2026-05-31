import { Head, useForm, router, usePage } from '@inertiajs/react'
import { useEffect } from 'react'
import AppLayout from '@/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

function estadoBadge(inv) {
    if (inv.is_accepted) return <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30">Aceptada</Badge>
    if (inv.is_expired)  return <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30">Expirada</Badge>
    return <Badge className="bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30">Pendiente</Badge>
}

function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Invitaciones({ invitations }) {
    const { flash } = usePage().props
    const { data, setData, post, processing, errors, reset } = useForm({ email: '' })

    useEffect(() => {
        if (flash?.success) toast.success(flash.success)
        if (flash?.error)   toast.error(flash.error)
    }, [flash])

    function handleSubmit(e) {
        e.preventDefault()
        post('/admin/invitaciones', { onSuccess: () => reset() })
    }

    function handleDelete(id) {
        if (confirm('¿Eliminar esta invitación?')) {
            router.delete(`/admin/invitaciones/${id}`)
        }
    }

    return (
        <AppLayout>
            <Head title="Invitaciones" />
            <Toaster />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Invitaciones</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona el acceso de nuevos usuarios a Localia.
                    </p>
                </div>

                {/* Formulario */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Nueva invitación</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
                            <div className="flex-1 space-y-1.5">
                                <Label htmlFor="email">Correo electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="usuario@ejemplo.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Enviando...' : 'Enviar invitación'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Tabla */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Invitaciones enviadas</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Correo</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Enviada</TableHead>
                                    <TableHead>Expira</TableHead>
                                    <TableHead>Invitado por</TableHead>
                                    <TableHead className="w-20" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invitations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                            No hay invitaciones todavía.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    invitations.map((inv) => (
                                        <TableRow key={inv.id}>
                                            <TableCell className="font-medium">{inv.email}</TableCell>
                                            <TableCell>{estadoBadge(inv)}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{formatDate(inv.created_at)}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{formatDate(inv.expires_at)}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{inv.invited_by ?? '—'}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(inv.id)}
                                                >
                                                    Eliminar
                                                </Button>
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
