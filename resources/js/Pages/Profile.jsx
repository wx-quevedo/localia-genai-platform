import { useEffect } from 'react'
import { Head, useForm, usePage } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

export default function Profile({ user }) {
    const { flash } = usePage().props

    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    })

    useEffect(() => {
        if (flash?.success) { toast.success(flash.success); reset() }
        if (flash?.error)   toast.error(flash.error)
    }, [flash])

    function handleSubmit(e) {
        e.preventDefault()
        put('/perfil/password')
    }

    return (
        <AppLayout>
            <Head title="Perfil" />
            <Toaster />

            <div className="max-w-lg space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Perfil</h1>
                    <p className="text-muted-foreground mt-1">Gestiona tu cuenta.</p>
                </div>

                {/* Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Información de la cuenta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Nombre</Label>
                            <Input value={user.name} readOnly className="bg-muted cursor-not-allowed" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Correo electrónico</Label>
                            <Input value={user.email} readOnly className="bg-muted cursor-not-allowed" />
                        </div>
                    </CardContent>
                </Card>

                <Separator />

                {/* Cambiar contraseña */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Cambiar contraseña</CardTitle>
                        <CardDescription>Mínimo 8 caracteres.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="current_password">Contraseña actual</Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    autoComplete="current-password"
                                />
                                {errors.current_password && (
                                    <p className="text-sm text-destructive">{errors.current_password}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password">Nueva contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password_confirmation">Confirmar contraseña</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                />
                            </div>

                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando…' : 'Actualizar contraseña'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
