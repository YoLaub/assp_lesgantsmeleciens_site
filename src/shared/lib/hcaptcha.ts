export async function verifyHCaptcha(token: string): Promise<boolean> {
    const secret = process.env.HCAPTCHA_SECRET;
    if (!secret) return false;

    const res = await fetch('https://api.hcaptcha.com/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${secret}&response=${token}`,
    });

    const data = await res.json();
    return data.success === true;
}
