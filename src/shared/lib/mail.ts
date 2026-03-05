export async function sendConfirmationEmail(email: string, name: string) {
    const apiKey = process.env.BREVO_API_KEY;
    const url = 'https://api.brevo.com/v3/smtp/email';

    const body = {
        sender: { name: "Les Gants Méléciens", email: "lesgantsmeleciens@gmail.com" },
        to: [{ email, name }],
        subject: "Confirmation de votre demande d'adhésion",
        htmlContent: `<html><body><h1>Bonjour ${name}</h1><p>Votre inscription a été reçue. Nous vous rappelons que vous bénéficiez de <b>3 cours d'essai gratuits</b> avant validation définitive.</p></body></html>`
    };

    return fetch(url, {
        method: 'POST',
        headers: { 'api-key': apiKey!, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
}