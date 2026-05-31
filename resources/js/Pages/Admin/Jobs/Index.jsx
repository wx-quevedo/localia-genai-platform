import { Head, Link, router, usePage } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from '@/components/ui/table'

const STATUS_CONFIG = {
    pending:    { label: 'En cola',     className: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30' },
    processing: { label: 'Procesando',  className: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' },
    completed:  { label: 'Completado',  className: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30' },
    failed:     { label: 'Fallido',     className: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30' },
}

const STATUS_OPTIONS = [
    { value: '', label: 'Todos los estados' },
    { value: 'pending',    label: 'En cola' },
    { value: 'processing', label: 'Procesando' },
    { value: 'completed',  label: 'Completado' },
    { value: 'failed',     label: 'Fallido' },
]

function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('es', {
        day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit',
    })
}

export default function AdminJobsIndex({ jobs, services, filters }) {
    function applyFilter(key, value) {
        router.get('/admin/jobs', { ...filters, [key]: value || undefined }, {
            preserveState: true, replace: true,
        })
    }

    return (
        <AppLayout>
            <Head title="Jobs — Admin" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
                    <p className="text-muted-foreground mt-1">
                        Todos los jobs de todos los usuarios.
                    </p>
                </div>

                {/* Filtros */}
                <div className="flex items-center gap-3 flex-wrap">
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilter('status', e.target.value)}
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    <select
                        value={filters.service_id ?? ''}
                        onChange={(e) => applyFilter('service_id', e.target.value)}
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        <option value="">Todos los servicios</option>
                        {services.map((svc) => (
                            <option key={svc.id} value={svc.id}>{svc.name}</option>
                        ))}
                    </select>

                    {(filters.status || filters.service_id) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.get('/admin/jobs', {}, { replace: true })}
                        >
                            Limpiar filtros
                        </Button>
                    )}

                    <span className="ml-auto text-sm text-muted-foreground">
                        {jobs.total} jobs
                    </span>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Servicio</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="w-36">Progreso</TableHead>
                                    <TableHead>Inicio</TableHead>
                                    <TableHead>Fin</TableHead>
                                    <TableHead className="w-16" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jobs.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-16">
                                            No hay jobs con estos filtros.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    jobs.data.map((job) => {
                                        const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.pending
                                        return (
                                            <TableRow key={job.uuid}>
                                                <TableCell>
                                                    <p className="font-medium text-sm">{job.user_name}</p>
                                                    <p className="text-xs text-muted-foreground">{job.user_email}</p>
                                                </TableCell>
                                                <TableCell className="text-sm">{job.service_name}</TableCell>
                                                <TableCell>
                                                    <Badge className={cfg.className}>{cfg.label}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={job.progress} className="h-1.5 flex-1" />
                                                        <span className="text-xs text-muted-foreground w-8 text-right">
                                                            {job.progress}%
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {formatDate(job.started_at)}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {formatDate(job.completed_at)}
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/jobs/${job.uuid}`}>Ver</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
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
