// ===== App Entry Point - Init & event wiring =====

// Logout buttons
document.getElementById('logout-btn').addEventListener('click', logout);
document.getElementById('gameover-logout-btn').addEventListener('click', logout);

// Play again button
document.getElementById('play-again-btn').addEventListener('click', () => {
    startGameForUser(currentUser);
});

// Auto-login on page load
(function init() {
    const session = getSession();
    if (session && session.username) {
        const data = loadData();
        if (data.users[session.username]) {
            startGameForUser(session.username);
            return;
        }
    }
    showScreen('auth');
})();
