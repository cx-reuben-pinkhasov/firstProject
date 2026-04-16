// ===== Screen Management =====

const screens = {
    auth: document.getElementById('auth-screen'),
    game: document.getElementById('game-screen'),
    gameover: document.getElementById('gameover-screen')
};

function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
}
