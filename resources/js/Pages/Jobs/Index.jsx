import { useEffect } from 'react'
import { Head, Link, usePage } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from '@/components/ui/table'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

const STATUS_CONFIG = {
    pending:    { label: 'En cola',     className: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30' },
    processing: { label: 'Procesando',  className: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' },
    completed:  { label: 'Completado',  className: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30' },
    failed:     { label: 'Fallido',     className: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30' },
}

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
    return <Badge className={cfg.className}>{cfg.label}</Badge>
}

function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('es', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

export default function JobsIndex({ jobs }) {
    const { flash } = usePage().props

    useEffect(() => {
        if (flash?.success) toast.success(flash.success)
        if (flash?.error)   toast.error(flash.error)
    }, [flash])

    return (
        <AppLayout>
            <Head title="Mis jobs" />
            <Toaster />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Mis jobs</h1>
                        <p className="text-muted-foreground mt-1">
                            Historial de tareas enviadas a la IA.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/servicios">Nuevo job</Link>
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Servicio</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="w-40">Progreso</TableHead>
                                    <TableHead>Enviado</TableHead>
                                    <TableHead>Completado</TableHead>
                                    <TableHead className="w-20" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jobs.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-16">
                                            Todavía no has enviado ningún job.{' '}
                                            <Link href="/servicios" className="underline underline-offset-2">
                                                Explorar servicios
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    jobs.data.map((job) => (
                                        <TableRow
                                            key={job.uuid}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => window.location.href = `/jobs/${job.uuid}`}
                                        >
                                            <TableCell className="font-medium">{job.service_name}</TableCell>
                                            <TableCell><StatusBadge status={job.status} /></TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={job.progress} className="h-1.5 flex-1" />
                                                    <span className="text-xs text-muted-foreground w-8 text-right">
                                                        {job.progress}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {formatDate(job.created_at)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {formatDate(job.completed_at)}
                                            </TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/jobs/${job.uuid}`}>Ver</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Paginación */}
                {jobs.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {jobs.links.map((link, i) => (
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`px-3 py-1 rounded text-sm border transition-colors ${
                                        link.active
                                            ? 'bg-foreground text-background border-foreground'
                                            : 'border-border hover:bg-accent'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="px-3 py-1 rounded text-sm border border-border text-muted-foreground"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
