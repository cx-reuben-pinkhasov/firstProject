// ===== Authentication - Login & Registration =====

let isRegisterMode = false;

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const confirmField = document.getElementById('confirm-field');
const authBtn = document.getElementById('auth-btn');
const errorMsg = document.getElementById('error-msg');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');

tabLogin.addEventListener('click', () => {
    isRegisterMode = false;
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    confirmField.classList.remove('visible');
    authBtn.textContent = 'התחבר';
    errorMsg.textContent = '';
});

tabRegister.addEventListener('click', () => {
    isRegisterMode = true;
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    confirmField.classList.add('visible');
    authBtn.textContent = 'הירשם';
    errorMsg.textContent = '';
});

authBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    errorMsg.textContent = '';

    if (username.length < 3) {
        errorMsg.textContent = 'שם משתמש חייב להכיל לפחות 3 תווים';
        return;
    }

    if (password.length < 4) {
        errorMsg.textContent = 'סיסמה חייבת להכיל לפחות 4 תווים';
        return;
    }

    authBtn.disabled = true;
    const data = loadData();
    const hash = await hashPassword(password);

    if (isRegisterMode) {
        const confirmPwd = confirmPasswordInput.value;
        if (password !== confirmPwd) {
            errorMsg.textContent = 'הסיסמאות אינן תואמות';
            authBtn.disabled = false;
            return;
        }
        if (data.users[username]) {
            errorMsg.textContent = 'שם משתמש כבר קיים';
            authBtn.disabled = false;
            return;
        }
        data.users[username] = { passwordHash: hash, highScore: 0 };
        saveData(data);
        setSession(username);
        startGameForUser(username);
    } else {
        if (!data.users[username] || data.users[username].passwordHash !== hash) {
            errorMsg.textContent = 'שם משתמש או סיסמה שגויים';
            authBtn.disabled = false;
            return;
        }
        setSession(username);
        startGameForUser(username);
    }

    authBtn.disabled = false;
    usernameInput.value = '';
    passwordInput.value = '';
    confirmPasswordInput.value = '';
});

// Allow Enter key to submit
document.getElementById('auth-form').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') authBtn.click();
});

function logout() {
    clearSession();
    currentUser = null;
    if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
    showScreen('auth');
}
