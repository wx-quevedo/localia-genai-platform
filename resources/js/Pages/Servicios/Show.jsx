import { useState, useRef } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

const ENGINE_LABELS = { comfyui: 'ComfyUI', lmstudio: 'LM Studio' }
const ENGINE_COLORS = {
    comfyui:  'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    lmstudio: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
}

function FileUploadZone({ input, value, onChange }) {
    const fileRef = useRef(null)
    const [preview, setPreview] = useState(null)

    function handleFile(file) {
        if (!file) return
        onChange(file)
        if (input.type === 'image' || input.type === 'video') {
            setPreview({ url: URL.createObjectURL(file), type: input.type })
        } else {
            setPreview({ name: file.name })
        }
    }

    function handleDrop(e) {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }

    return (
        <div
            className="relative border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-foreground/30 transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
        >
            <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept={
                    input.type === 'image' ? 'image/*' :
                    input.type === 'video' ? 'video/*' : '*'
                }
                onChange={(e) => handleFile(e.target.files[0])}
            />
            {preview ? (
                <div className="space-y-2">
                    {preview.url && input.type === 'image' && (
                        <img src={preview.url} alt="preview" className="max-h-40 mx-auto rounded object-contain" />
                    )}
                    {preview.url && input.type === 'video' && (
                        <video src={preview.url} className="max-h-40 mx-auto rounded" controls />
                    )}
                    {preview.name && <p className="text-sm font-medium">{preview.name}</p>}
                    <p className="text-xs text-muted-foreground">Haz clic para cambiar el archivo</p>
                </div>
            ) : (
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        Arrastra aquí o{' '}
                        <span className="text-foreground font-medium underline underline-offset-2">
                            selecciona un archivo
                        </span>
                    </p>
                    {input.placeholder && (
                        <p className="text-xs text-muted-foreground">{input.placeholder}</p>
                    )}
                </div>
            )}
        </div>
    )
}

function DynamicInput({ input, value, onChange }) {
    if (input.type === 'textarea') {
        return (
            <Textarea
                id={input.key}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={input.placeholder ?? ''}
                rows={4}
            />
        )
    }
    if (input.type === 'file' || input.type === 'image' || input.type === 'video') {
        return <FileUploadZone input={input} value={value} onChange={onChange} />
    }
    return (
        <Input
            id={input.key}
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={input.placeholder ?? ''}
        />
    )
}

export default function ServicioShow({ service, inputs }) {
    const [values, setValues] = useState(() =>
        Object.fromEntries(inputs.map((inp) => [inp.key, inp.type === 'file' || inp.type === 'image' || inp.type === 'video' ? null : '']))
    )
    const [processing, setProcessing] = useState(false)

    function setValue(key, val) {
        setValues((prev) => ({ ...prev, [key]: val }))
    }

    function handleSubmit(e) {
        e.preventDefault()

        const missing = inputs
            .filter((inp) => inp.required && !values[inp.key])
            .map((inp) => inp.label)

        if (missing.length > 0) {
            toast.error(`Completa los campos requeridos: ${missing.join(', ')}`)
            return
        }

        setProcessing(true)

        // Construir FormData para soportar archivos (multipart)
        const formData = new FormData()
        inputs.forEach((inp) => {
            const val = values[inp.key]
            if (val !== null && val !== undefined && val !== '') {
                formData.append(inp.key, val)
            }
        })

        router.post(`/servicios/${service.slug}/lanzar`, formData, {
            forceFormData: true,
            onError: (errors) => {
                const firstError = Object.values(errors)[0]
                toast.error(firstError ?? 'Error al enviar el job.')
                setProcessing(false)
            },
            onFinish: () => setProcessing(false),
        })
    }

    return (
        <AppLayout>
            <Head title={service.name} />
            <Toaster />

            <div className="max-w-xl space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/servicios" className="hover:text-foreground transition-colors">
                        Servicios
                    </Link>
                    <span>/</span>
                    <span className="text-foreground">{service.name}</span>
                </div>

                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight">{service.name}</h1>
                    <Badge className={ENGINE_COLORS[service.engine]}>
                        {ENGINE_LABELS[service.engine]}
                    </Badge>
                </div>

                {service.description && (
                    <p className="text-muted-foreground">{service.description}</p>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Parámetros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {inputs.map((inp) => (
                                <div key={inp.key} className="space-y-1.5">
                                    <Label htmlFor={inp.key}>
                                        {inp.label}
                                        {inp.required && <span className="text-destructive ml-1">*</span>}
                                    </Label>
                                    <DynamicInput
                                        input={inp}
                                        value={values[inp.key]}
                                        onChange={(val) => setValue(inp.key, val)}
                                    />
                                    {inp.help_text && (
                                        <p className="text-xs text-muted-foreground">{inp.help_text}</p>
                                    )}
                                </div>
                            ))}

                            {inputs.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Este servicio no tiene parámetros configurados.
                                </p>
                            )}

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Enviando job…' : 'Lanzar job'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
