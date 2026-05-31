import { useState } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

const INPUT_TYPES = [
    { value: 'text',     label: 'Texto corto' },
    { value: 'textarea', label: 'Texto largo' },
    { value: 'file',     label: 'Archivo' },
    { value: 'image',    label: 'Imagen' },
    { value: 'video',    label: 'Video' },
]

function newInput(order) {
    return {
        _key: crypto.randomUUID(),
        label: '',
        key: '',
        type: 'text',
        required: true,
        placeholder: '',
        help_text: '',
        sort_order: order,
    }
}

export default function ServicioForm({ service, inputs: initialInputs }) {
    const isEditing = service !== null
    const { errors } = usePage().props

    const [form, setForm] = useState({
        name:          service?.name ?? '',
        description:   service?.description ?? '',
        engine:        service?.engine ?? 'comfyui',
        workflow_file: service?.workflow_file ?? '',
        is_active:     service?.is_active ?? true,
        sort_order:    service?.sort_order ?? 0,
    })

    const [inputs, setInputs] = useState(
        (initialInputs ?? []).map((inp) => ({ ...inp, _key: inp.id?.toString() ?? crypto.randomUUID() }))
    )

    const [processing, setProcessing] = useState(false)

    function setField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    function addInput() {
        setInputs((prev) => [...prev, newInput(prev.length)])
    }

    function removeInput(idx) {
        setInputs((prev) => prev.filter((_, i) => i !== idx))
    }

    function updateInput(idx, field, value) {
        setInputs((prev) => prev.map((inp, i) => i === idx ? { ...inp, [field]: value } : inp))
    }

    function moveUp(idx) {
        if (idx === 0) return
        setInputs((prev) => {
            const next = [...prev]
            ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
            return next.map((inp, i) => ({ ...inp, sort_order: i }))
        })
    }

    function moveDown(idx) {
        if (idx === inputs.length - 1) return
        setInputs((prev) => {
            const next = [...prev]
            ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
            return next.map((inp, i) => ({ ...inp, sort_order: i }))
        })
    }

    function handleSubmit(e) {
        e.preventDefault()
        setProcessing(true)

        const payload = {
            ...form,
            inputs: inputs.map(({ _key, ...rest }, i) => ({ ...rest, sort_order: i })),
        }

        if (isEditing) {
            router.put(`/admin/servicios/${service.id}`, payload, {
                onFinish: () => setProcessing(false),
            })
        } else {
            router.post('/admin/servicios', payload, {
                onFinish: () => setProcessing(false),
            })
        }
    }

    return (
        <AppLayout>
            <Head title={isEditing ? 'Editar servicio' : 'Nuevo servicio'} />

            <div className="max-w-2xl space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/admin/servicios" className="hover:text-foreground transition-colors">
                        Servicios
                    </Link>
                    <span>/</span>
                    <span className="text-foreground">
                        {isEditing ? 'Editar' : 'Nuevo servicio'}
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Datos del servicio */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Información del servicio</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="name">Nombre *</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={(e) => setField('name', e.target.value)}
                                    placeholder="ej: Faceswap"
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    value={form.description}
                                    onChange={(e) => setField('description', e.target.value)}
                                    placeholder="Describe brevemente para qué sirve este servicio..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="engine">Motor *</Label>
                                    <select
                                        id="engine"
                                        value={form.engine}
                                        onChange={(e) => setField('engine', e.target.value)}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="comfyui">ComfyUI</option>
                                        <option value="lmstudio">LM Studio</option>
                                    </select>
                                    {errors.engine && <p className="text-sm text-destructive">{errors.engine}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="sort_order">Orden</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={form.sort_order}
                                        onChange={(e) => setField('sort_order', parseInt(e.target.value) || 0)}
                                        min={0}
                                    />
                                </div>
                            </div>

                            {form.engine === 'comfyui' && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="workflow_file">Archivo workflow</Label>
                                    <Input
                                        id="workflow_file"
                                        value={form.workflow_file}
                                        onChange={(e) => setField('workflow_file', e.target.value)}
                                        placeholder="ej: faceswap_v2.json"
                                    />
                                    {errors.workflow_file && <p className="text-sm text-destructive">{errors.workflow_file}</p>}
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <Switch
                                    id="is_active"
                                    checked={form.is_active}
                                    onCheckedChange={(v) => setField('is_active', v)}
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    Servicio activo
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inputs dinámicos */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Campos de entrada</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addInput}>
                                + Agregar campo
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {inputs.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Sin campos todavía. Agrega al menos uno.
                                </p>
                            )}

                            {inputs.map((inp, idx) => (
                                <div key={inp._key} className="rounded-lg border border-border p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-xs">
                                            Campo {idx + 1}
                                        </Badge>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                type="button" variant="ghost" size="icon"
                                                className="h-7 w-7" onClick={() => moveUp(idx)}
                                                disabled={idx === 0}
                                            >
                                                ↑
                                            </Button>
                                            <Button
                                                type="button" variant="ghost" size="icon"
                                                className="h-7 w-7" onClick={() => moveDown(idx)}
                                                disabled={idx === inputs.length - 1}
                                            >
                                                ↓
                                            </Button>
                                            <Button
                                                type="button" variant="ghost" size="icon"
                                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => removeInput(idx)}
                                            >
                                                ✕
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Etiqueta *</Label>
                                            <Input
                                                value={inp.label}
                                                onChange={(e) => updateInput(idx, 'label', e.target.value)}
                                                placeholder="ej: Foto de origen"
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Clave interna *</Label>
                                            <Input
                                                value={inp.key}
                                                onChange={(e) => updateInput(idx, 'key', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                                                placeholder="ej: source_image"
                                                className="h-8 text-sm font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Tipo *</Label>
                                            <select
                                                value={inp.type}
                                                onChange={(e) => updateInput(idx, 'type', e.target.value)}
                                                className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            >
                                                {INPUT_TYPES.map((t) => (
                                                    <option key={t.value} value={t.value}>{t.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Placeholder</Label>
                                            <Input
                                                value={inp.placeholder}
                                                onChange={(e) => updateInput(idx, 'placeholder', e.target.value)}
                                                placeholder="Texto de ayuda en el campo"
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 items-end">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Texto de ayuda</Label>
                                            <Input
                                                value={inp.help_text}
                                                onChange={(e) => updateInput(idx, 'help_text', e.target.value)}
                                                placeholder="Instrucción adicional"
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 pb-0.5">
                                            <Switch
                                                checked={inp.required}
                                                onCheckedChange={(v) => updateInput(idx, 'required', v)}
                                                id={`req-${inp._key}`}
                                            />
                                            <Label htmlFor={`req-${inp._key}`} className="text-xs cursor-pointer">
                                                Requerido
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : (isEditing ? 'Guardar cambios' : 'Crear servicio')}
                        </Button>
                        <Button type="button" variant="ghost" asChild>
                            <Link href="/admin/servicios">Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
