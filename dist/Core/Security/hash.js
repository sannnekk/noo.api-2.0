import bcrypt from 'bcrypt';
export async function hash(value) {
    return await bcrypt.hash(value, 10);
}
export async function compare(value, hash) {
    return await bcrypt.compare(value, hash);
}
