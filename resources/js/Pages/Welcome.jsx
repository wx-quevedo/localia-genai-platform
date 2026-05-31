import { Head } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Welcome() {
    return (
        <>
            <Head title="Bienvenido" />
            <div className="min-h-screen bg-background flex items-center justify-center p-8">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Localia
                            <Badge variant="secondary">v1.0</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <p className="text-muted-foreground">
                            Stack instalado correctamente.
                        </p>
                        <Button>Ingresar</Button>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
