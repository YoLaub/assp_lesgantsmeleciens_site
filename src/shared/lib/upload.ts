import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function uploadFile(file: File, subFolder: string) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop();
    const filename = `${randomUUID()}.${ext}`;

    const uploadDir = join(process.cwd(), 'public', 'uploads', subFolder);

    // S'assure que le dossier existe
    await mkdir(uploadDir, { recursive: true });

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return `/uploads/${subFolder}/${filename}`;
}