<x-mail::message>
# Bienvenido a Localia

Has sido invitado a unirte a **Localia**, una plataforma privada de generación de contenido con IA.

Haz clic en el siguiente botón para crear tu cuenta:

<x-mail::button :url="$invitationUrl">
Aceptar invitación
</x-mail::button>

> Este enlace expira el **{{ $expiresAt }}**. Si no solicitaste esta invitación, puedes ignorar este mensaje.

Saludos,<br>
El equipo de {{ config('app.name') }}
</x-mail::message>
