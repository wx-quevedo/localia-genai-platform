import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

const STATUS_CONFIG = {
    pending:    { label: 'En cola',     className: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30' },
    processing: { label: 'Procesando',  className: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' },
    completed:  { label: 'Completado',  className: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30' },
    failed:     { label: 'Fallido',     className: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30' },
}

function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('es', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
}

export default function JobShow({ job }) {
    const statusCfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.pending

    return (
        <AppLayout>
            <Head title={`Job — ${job.service_name}`} />

            <div className="max-w-2xl space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/jobs" className="hover:text-foreground transition-colors">
                        Mis jobs
                    </Link>
                    <span>/</span>
                    <span className="text-foreground font-mono text-xs">{job.uuid.split('-')[0]}…</span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">{job.service_name}</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            Enviado el {formatDate(job.created_at)}
                        </p>
                    </div>
                    <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
                </div>

                {/* Progreso */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between">
                            <span>Progreso</span>
                            <span className="text-muted-foreground font-normal text-sm">{job.progress}%</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Progress value={job.progress} className="h-2" />
                        {job.current_stage && (
                            <p className="text-sm text-muted-foreground">{job.current_stage}</p>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-sm pt-1">
                            <div>
                                <p className="text-muted-foreground text-xs">Inicio</p>
                                <p>{formatDate(job.started_at)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Fin</p>
                                <p>{formatDate(job.completed_at)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Error */}
                {job.status === 'failed' && job.error_message && (
                    <Card className="border-destructive/50 bg-destructive/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-destructive">Error</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-destructive/80 font-mono whitespace-pre-wrap">
                                {job.error_message}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Resultado */}
                {job.status === 'completed' && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Resultado</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {job.result_type === 'text' && job.result_data && (
                                <div className="rounded-md bg-muted p-4">
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                        {job.result_data}
                                    </p>
                                </div>
                            )}

                            {job.result_type === 'image' && job.result_url && (
                                <div className="space-y-3">
                                    <img
                                        src={job.result_url}
                                        alt="Resultado generado"
                                        className="w-full rounded-lg object-contain max-h-[600px] border border-border"
                                    />
                                    <Button asChild variant="outline" size="sm">
                                        <a href={job.result_url} download target="_blank" rel="noopener noreferrer">
                                            Descargar imagen
                                        </a>
                                    </Button>
                                </div>
                            )}

                            {job.result_type === 'video' && job.result_url && (
                                <div className="space-y-3">
                                    <video
                                        src={job.result_url}
                                        controls
                                        className="w-full rounded-lg border border-border max-h-[500px]"
                                    />
                                    <Button asChild variant="outline" size="sm">
                                        <a href={job.result_url} download target="_blank" rel="noopener noreferrer">
                                            Descargar video
                                        </a>
                                    </Button>
                                </div>
                            )}

                            {!job.result_type && (
                                <p className="text-sm text-muted-foreground">
                                    El resultado estará disponible en breve.
                                </p>
                            )}
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
