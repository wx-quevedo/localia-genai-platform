import { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const STATUS_CONFIG = {
    pending:    { label: 'En cola',    className: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30' },
    processing: { label: 'Procesando', className: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' },
    completed:  { label: 'Completado', className: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30' },
    failed:     { label: 'Fallido',    className: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30' },
}

const IS_ACTIVE = (status) => status === 'pending' || status === 'processing'

function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('es', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
}

// Indicador de conexión WebSocket
function LiveIndicator({ connected }) {
    return (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`inline-block h-2 w-2 rounded-full ${
                connected
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-zinc-400'
            }`} />
            {connected ? 'En vivo' : 'Reconectando…'}
        </span>
    )
}

// Resultado según tipo
function ResultCard({ state }) {
    if (!state.result_type) {
        return (
            <p className="text-sm text-muted-foreground">
                El resultado estará disponible en breve.
            </p>
        )
    }

    if (state.result_type === 'text' && state.result_data) {
        return (
            <div className="rounded-md bg-muted p-4">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{state.result_data}</p>
            </div>
        )
    }

    if (state.result_type === 'image' && state.result_url) {
        return (
            <div className="space-y-3">
                <img
                    src={state.result_url}
                    alt="Resultado generado"
                    className="w-full rounded-lg object-contain max-h-150 border border-border"
                />
                <Button asChild variant="outline" size="sm">
                    <a href={state.result_url} download target="_blank" rel="noopener noreferrer">
                        Descargar imagen
                    </a>
                </Button>
            </div>
        )
    }

    if (state.result_type === 'video' && state.result_url) {
        return (
            <div className="space-y-3">
                <video
                    src={state.result_url}
                    controls
                    className="w-full rounded-lg border border-border max-h-125"
                />
                <Button asChild variant="outline" size="sm">
                    <a href={state.result_url} download target="_blank" rel="noopener noreferrer">
                        Descargar video
                    </a>
                </Button>
            </div>
        )
    }

    return null
}

export default function JobShow({ job: initialJob }) {
    const [state, setState] = useState(initialJob)
    const [wsConnected, setWsConnected] = useState(false)

    const statusCfg = STATUS_CONFIG[state.status] ?? STATUS_CONFIG.pending
    const jobFinished = state.status === 'completed' || state.status === 'failed'

    useEffect(() => {
        // No suscribirse si el job ya terminó al cargar la página
        if (jobFinished) return

        if (!window.Echo) return

        const channel = window.Echo.private(`jobs.${state.uuid}`)

        channel
            .subscribed(() => setWsConnected(true))
            .error(() => setWsConnected(false))
            .listen('.job.progress', (data) => {
                setState((prev) => ({ ...prev, ...data }))

                // Dejar el canal cuando el job termine
                if (data.status === 'completed' || data.status === 'failed') {
                    window.Echo.leave(`jobs.${state.uuid}`)
                    setWsConnected(false)
                }
            })

        return () => {
            window.Echo.leave(`jobs.${state.uuid}`)
            setWsConnected(false)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <AppLayout>
            <Head title={`Job — ${state.service_name}`} />

            <div className="max-w-2xl space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/jobs" className="hover:text-foreground transition-colors">
                        Mis jobs
                    </Link>
                    <span>/</span>
                    <span className="text-foreground font-mono text-xs">
                        {state.uuid.split('-')[0]}…
                    </span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">{state.service_name}</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            Enviado el {formatDate(state.created_at)}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {IS_ACTIVE(state.status) && (
                            <LiveIndicator connected={wsConnected} />
                        )}
                        <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
                    </div>
                </div>

                {/* Progreso */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between">
                            <span>Progreso</span>
                            <span className="text-muted-foreground font-normal text-sm tabular-nums">
                                {state.progress}%
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Progress
                            value={state.progress}
                            className={`h-2 transition-all duration-500 ${
                                state.status === 'processing' ? '[&>div]:animate-pulse' : ''
                            }`}
                        />
                        {state.current_stage && (
                            <p className="text-sm text-muted-foreground transition-all duration-300">
                                {state.current_stage}
                            </p>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-sm pt-1">
                            <div>
                                <p className="text-muted-foreground text-xs">Inicio</p>
                                <p>{formatDate(state.started_at)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Fin</p>
                                <p>{formatDate(state.completed_at)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Error */}
                {state.status === 'failed' && state.error_message && (
                    <Card className="border-destructive/50 bg-destructive/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-destructive">Error</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-destructive/80 font-mono whitespace-pre-wrap">
                                {state.error_message}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Resultado */}
                {state.status === 'completed' && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Resultado</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResultCard state={state} />
                        </CardContent>
                    </Card>
                )}

                <Button variant="outline" asChild>
                    <Link href="/jobs">← Volver a mis jobs</Link>
                </Button>
            </div>
        </AppLayout>
    )
}
