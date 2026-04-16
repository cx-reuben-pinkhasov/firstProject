// ===== Data Layer - localStorage management & password hashing =====

function loadData() {
    try {
        return JSON.parse(localStorage.getItem('flappyBirdData')) || { users: {} };
    } catch {
        return { users: {} };
    }
}

function saveData(data) {
    localStorage.setItem('flappyBirdData', JSON.stringify(data));
}

function getSession() {
    try {
        return JSON.parse(localStorage.getItem('flappyBirdSession'));
    } catch {
        return null;
    }
}

function setSession(username) {
    localStorage.setItem('flappyBirdSession', JSON.stringify({ username }));
}

function clearSession() {
    localStorage.removeItem('flappyBirdSession');
}

// SHA-256 hashing via Web Crypto API (not production-grade - no salt)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
