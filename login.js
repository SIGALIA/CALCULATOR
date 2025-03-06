// login.js - קובץ JavaScript מתוקן למערכת התחברות עקבית

// משתנים גלובליים
let isLoggedIn = false;
let currentUser = null;

// אלמנטים של DOM - יאותחלו בטעינת הדף
let loginModal;
let signupModal;
let userIcon;
let userDropdown;
let heroSection;

// אתחול אלמנטים של DOM
function initLoginElements() {
    loginModal = document.getElementById('login-modal');
    signupModal = document.getElementById('signup-modal');
    userIcon = document.querySelector('.header-icon img');
    heroSection = document.querySelector('.hero');

    if (!userIcon) {
        console.error("User icon not found in DOM");
        return;
    }

    // יצירת תפריט דרופדאון למשתמש אם הוא עדיין לא קיים
    if (!document.querySelector('.user-dropdown')) {
        userDropdown = document.createElement('div');
        userDropdown.className = 'user-dropdown';
        userDropdown.innerHTML = `
            <div class="user-dropdown-header">Hi <span id="user-name">Guest</span></div>
            <div class="user-dropdown-items">
                <a href="dashboard.html" class="user-dropdown-item" id="my-calculations-link">My Calculations</a>
                <a href="#" class="user-dropdown-item" id="logout-link">Logout</a>
            </div>
        `;
        document.body.appendChild(userDropdown);
    } else {
        userDropdown = document.querySelector('.user-dropdown');
    }
}

// הגדרת מאזיני אירועים
function setupLoginEventListeners() {
    if (!userIcon || !userDropdown) return;

    // הסרת מאזינים ישנים למניעת כפילויות
    userIcon.removeEventListener('click', toggleUserOrLogin);
    document.removeEventListener('click', closeDropdownOnClickOutside);

    // הוספת מאזינים חדשים
    userIcon.addEventListener('click', toggleUserOrLogin);
    document.addEventListener('click', closeDropdownOnClickOutside);

    // הגדרת כפתורי התחברות עם גוגל
    const googleButtons = document.querySelectorAll('.google-login-btn');
    googleButtons.forEach(button => {
        button.removeEventListener('click', handleGoogleSignIn);
        button.addEventListener('click', handleGoogleSignIn);
    });

    // הגדרת קישורים בדרופדאון
    const myCalculationsLink = document.getElementById('my-calculations-link');
    const logoutLink = document.getElementById('logout-link');

    if (myCalculationsLink) {
        myCalculationsLink.removeEventListener('click', goToDashboard);
        myCalculationsLink.addEventListener('click', goToDashboard);
    }
    if (logoutLink) {
        logoutLink.removeEventListener('click', handleLogoutClick);
        logoutLink.addEventListener('click', handleLogoutClick);
    }
}

// פונקציה להחלפת מצב הדרופדאון או הצגת מודל התחברות
function toggleUserOrLogin() {
    if (isLoggedIn) {
        toggleUserDropdown();
    } else {
        showLoginModal();
    }
}

// סגירת הדרופדאון בלחיצה מחוץ לו
function closeDropdownOnClickOutside(event) {
    if (isLoggedIn && userDropdown.classList.contains('show') && 
        !userIcon.contains(event.target) && 
        !userDropdown.contains(event.target)) {
        userDropdown.classList.remove('show');
    }
}

// ניווט לדשבורד
function goToDashboard(e) {
    e.preventDefault();
    window.location.href = 'dashboard.html';
}

// טיפול בהתנתקות
function handleLogoutClick(e) {
    e.preventDefault();
    handleLogout();
}

// פונקציות למודל התחברות
function showLoginModal() {
    if (loginModal) loginModal.style.display = 'flex';
}

function closeLoginModal() {
    if (loginModal) loginModal.style.display = 'none';
}

function showSignupForm() {
    if (loginModal && signupModal) {
        loginModal.style.display = 'none';
        signupModal.style.display = 'flex';
    }
}

function closeSignupModal() {
    if (signupModal) signupModal.style.display = 'none';
}

function showLoginForm() {
    if (signupModal && loginModal) {
        signupModal.style.display = 'none';
        loginModal.style.display = 'flex';
    }
}

// פונקציה להחלפת מצב הדרופדאון
function toggleUserDropdown() {
    if (userDropdown) userDropdown.classList.toggle('show');
}

// פונקציות לטיפול בהתחברות והרשמה
function handleLogin() {
    const email = document.getElementById('login-email')?.value;
    if (!email) {
        alert('Please enter your email address.');
        return;
    }

    isLoggedIn = true;
    currentUser = {
        name: email.split('@')[0],
        email: email
    };

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUIAfterLogin();
    closeLoginModal();
}

function handleSignup() {
    const name = document.getElementById('signup-name')?.value;
    const email = document.getElementById('signup-email')?.value;
    const password = document.getElementById('signup-password')?.value;

    if (!name || !email || !password) {
        alert('Please fill in all required fields.');
        return;
    }

    isLoggedIn = true;
    currentUser = {
        name: name,
        email: email
    };

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUIAfterLogin();
    closeSignupModal();
}

function handleGoogleSignIn(e) {
    e.preventDefault();
    console.log('Google sign-in clicked');

    isLoggedIn = true;
    currentUser = {
        name: 'Google User',
        email: 'user@gmail.com'
    };

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUIAfterLogin();
    closeLoginModal();
    closeSignupModal();
}

function handleLogout() {
    isLoggedIn = false;
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUIAfterLogout();
    if (userDropdown) userDropdown.classList.remove('show');
}

// עדכון ממשק המשתמש לאחר התחברות
function updateUIAfterLogin() {
    const userNameSpan = document.getElementById('user-name');
    if (userNameSpan && currentUser) {
        userNameSpan.textContent = currentUser.name;
    }

    if (heroSection) {
        heroSection.classList.add('logged-in');
        heroSection.innerHTML = `
            <div class="hero-content logged-in">
                <h1 class="hero-title">Electric Cables Cross Section Calculator</h1>
                <p class="hero-subtitle">Calculate, Save & Edit Easily</p>
            </div>
        `;
    }
    console.log('User logged in:', currentUser);
}

// עדכון ממשק המשתמש לאחר התנתקות
function updateUIAfterLogout() {
    const userNameSpan = document.getElementById('user-name');
    if (userNameSpan) userNameSpan.textContent = 'Guest';

    if (heroSection) {
        heroSection.classList.remove('logged-in');
        heroSection.innerHTML = `
            <div class="hero-images">
                <div class="hero-img-container">
                    <div class="circle"></div>
                    <img class="hero-image-left" src="assets/img-man.png" alt="Man">
                </div>
                <div class="hero-content">
                    <h1 class="hero-title">Electric Cables<br>Cross Section Calculator</h1>
                    <p class="hero-subtitle">Calculate, Save & Edit Easily</p>
                    <button class="hero-login-btn" onclick="showLoginModal()">Login</button>
                </div>
                <div class="hero-img-container">
                    <div class="circle"></div>
                    <img class="hero-image-right" src="assets/img-woman.png" alt="Woman">
                </div>
            </div>
        `;
    }
    console.log('User logged out');
}

// בדיקת מצב התחברות בטעינת העמוד
function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            isLoggedIn = true;
            updateUIAfterLogin();
        } catch (e) {
            console.error('Error parsing saved user data:', e);
            localStorage.removeItem('currentUser');
        }
    }
}

// אתחול מערכת ההתחברות
function initLoginSystem() {
    console.log("Initializing login system");
    initLoginElements();
    setupLoginEventListeners();
    checkLoginStatus();
}

// חשיפת פונקציות לסביבה הגלובלית
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
window.showSignupForm = showSignupForm;
window.closeSignupModal = closeSignupModal;
window.showLoginForm = showLoginForm;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleLogout = handleLogout;

// אתחול בעת טעינת הדף
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded - initializing login system");
    initLoginSystem();
});