const utf8encoder = new TextEncoder();

export function utf8ToHex(s) {
    const rb = utf8encoder.encode(s);
    let r = '';
    for (const b of rb) {
        r += ('0' + b.toString(16)).slice(-2);
    }
    return r;
}

export function hexToUtf8(s) {
    return decodeURIComponent(
        s.replace(/\s+/g, '') // remove spaces
        .replace(/[0-9A-F]{2}/g, '%$&') // add '%' before each 2 characters
    );
}