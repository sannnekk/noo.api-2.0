import jwtlib from 'jsonwebtoken';
export function parse(jwt) {
    try {
        return jwtlib.verify(jwt, process.env.JWT_SECRET);
    }
    catch (err) {
        return undefined;
    }
}
export function parseHeader(header) {
    const [type, jwt] = header.split(' ');
    if (type !== 'Bearer') {
        return undefined;
    }
    return parse(jwt);
}
export function create(payload) {
    return jwtlib.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
}
