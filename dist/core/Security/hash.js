import bcrypt from 'bcrypt';
export async function hash(value) {
    return bcrypt.hash(value, 10);
}
export async function compare(value, hashStr) {
    return bcrypt.compare(value, hashStr);
}
