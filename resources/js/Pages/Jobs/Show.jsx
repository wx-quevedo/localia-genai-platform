import { useState, useEffect, useRef, useMemo } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'

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

function LiveIndicator({ connected }) {
    return (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`inline-block h-2 w-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-zinc-400'}`} />
            {connected ? 'En vivo' : 'Reconectando…'}
        </span>
    )
}

// ── Chat UI ──────────────────────────────────────────────────────────────────

function TypingIndicator() {
    return (
        <div className="flex items-end gap-2">
            <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                        <span
                            key={i}
                            className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
                            style={{ animationDelay: `${i * 150}ms` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

function ChatBubble({ role, content }) {
    const isUser = role === 'user'
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                    isUser
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                }`}
            >
                {content}
            </div>
        </div>
    )
}

function ChatView({ state, onSend, sending }) {
    const bottomRef = useRef(null)
    const [input, setInput] = useState('')

    const messages = useMemo(() => {
        const history = state.chat_history ?? []
        const msgs = [...history]

        if (state.status === 'completed' && state.result_data) {
            // Si el último mensaje del historial no es ya la respuesta del asistente
            const last = msgs[msgs.length - 1]
            if (!last || last.role !== 'assistant' || last.content !== state.result_data) {
                msgs.push({ role: 'assistant', content: state.result_data })
            }
        }
        return msgs
    }, [state.chat_history, state.status, state.result_data])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, state.status])

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
        }
    }

    function submit() {
        const text = input.trim()
        if (!text || sending) return
        setInput('')
        onSend(text)
    }

    const canSend = state.status === 'completed' || state.status === 'failed'

    return (
        <Card className="flex flex-col" style={{ minHeight: '420px' }}>
            <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base">Conversación</CardTitle>
            </CardHeader>

            {/* Mensajes */}
            <CardContent className="flex-1 overflow-y-auto py-4 space-y-3 max-h-96">
                {messages.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        Sin mensajes todavía.
                    </p>
                )}
                {messages.map((msg, i) => (
                    <ChatBubble key={i} role={msg.role} content={msg.content} />
                ))}
                {IS_ACTIVE(state.status) && <TypingIndicator />}
                <div ref={bottomRef} />
            </CardContent>

            {/* Input */}
            <div className="border-t border-border p-4">
                <div className="flex gap-2">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={canSend ? 'Escribe un mensaje… (Enter para enviar)' : 'Espera la respuesta…'}
                        disabled={!canSend || sending}
                        rows={2}
                        className="resize-none flex-1"
                    />
                    <Button
                        onClick={submit}
                        disabled={!canSend || sending || !input.trim()}
                        className="self-end"
                    >
                        {sending ? 'Enviando…' : 'Enviar'}
                    </Button>
                </div>
            </div>
        </Card>
    )
}

// ── Resultado estático (imagen / video / texto simple) ────────────────────────

function ResultCard({ state }) {
    if (!state.result_type) {
        return <p className="text-sm text-muted-foreground">El resultado estará disponible en breve.</p>
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
                <img src={state.result_url} alt="Resultado generado"
                    className="w-full rounded-lg object-contain max-h-150 border border-border" />
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
                <video src={state.result_url} controls
                    className="w-full rounded-lg border border-border max-h-125" />
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

// ── Página principal ──────────────────────────────────────────────────────────

export default function JobShow({ job: initialJob }) {
    const [state, setState] = useState(initialJob)
    const [wsConnected, setWsConnected] = useState(false)
    const [sending, setSending] = useState(false)

    const statusCfg = STATUS_CONFIG[state.status] ?? STATUS_CONFIG.pending
    const jobFinished = state.status === 'completed' || state.status === 'failed'
    const isChat = state.service_engine === 'lmstudio'

    useEffect(() => {
        if (jobFinished) return
        if (!window.Echo) return

        const channel = window.Echo.private(`jobs.${state.uuid}`)

        channel
            .subscribed(() => setWsConnected(true))
            .error(() => setWsConnected(false))
            .listen('.job.progress', (data) => {
                setState((prev) => ({ ...prev, ...data }))
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

    function handleSendMessage(text) {
        setSending(true)
        router.post(
            `/servicios/${state.service_slug}/lanzar`,
            { prompt: text, parent_job_uuid: state.uuid },
            { onFinish: () => setSending(false) },
        )
    }

    return (
        <AppLayout>
            <Head title={`Job — ${state.service_name}`} />

            <div className="max-w-2xl space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/jobs" className="hover:text-foreground transition-colors">Mis jobs</Link>
                    <span>/</span>
                    <span className="text-foreground font-mono text-xs">{state.uuid.split('-')[0]}…</span>
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
                        {IS_ACTIVE(state.status) && <LiveIndicator connected={wsConnected} />}
                        <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
                    </div>
                </div>

                {/* Progreso */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between">
                            <span>Progreso</span>
                            <span className="text-muted-foreground font-normal text-sm tabular-nums">{state.progress}%</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Progress
                            value={state.progress}
                            className={`h-2 transition-all duration-500 ${state.status === 'processing' ? '[&>div]:animate-pulse' : ''}`}
                        />
                        {state.current_stage && (
                            <p className="text-sm text-muted-foreground transition-all duration-300">{state.current_stage}</p>
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
                            <p className="text-sm text-destructive/80 font-mono whitespace-pre-wrap">{state.error_message}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Chat continuo (motor lmstudio) */}
                {isChat ? (
                    <ChatView state={state} onSend={handleSendMessage} sending={sending} />
                ) : (
                    /* Resultado estático (imagen / video / texto simple) */
                    state.status === 'completed' && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Resultado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResultCard state={state} />
                            </CardContent>
                        </Card>
                    )
                )}

                <Button variant="outline" asChild>
                    <Link href="/jobs">← Volver a mis jobs</Link>
                </Button>
            </div>
        </AppLayout>
    )
}
