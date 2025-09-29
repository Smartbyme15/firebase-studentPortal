import { 
    auth, 
    db,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    doc,
    setDoc,
    getDoc
} from "./firebase.js";
const App = {
    init() {
        console.log('🚀 Student Portal Loading...');
        AuthController.init();
        UIController.init();
        this.checkAuthState();
        
        console.log('✅ Student Portal Loaded Successfully!');
    },

    checkAuthState() {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('User is signed in:', user.email);
                this.checkRegistrationStatus(user);
            } else {
                console.log('User is signed out');
            }
        });
    },

    async checkRegistrationStatus(user) {
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            
            if (userDoc.exists()) {
          
                window.location.href = 'dashboard.html';
            } else {
              
                window.location.href = 'registration.html';
            }
        } catch (error) {
            console.error('Error checking registration status:', error);
            NotificationController.show('Error checking registration status', 'error');
        }
    }
};

const AuthController = {
    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
        
        if (signupForm) {
            signupForm.addEventListener('submit', this.handleSignup.bind(this));
        }

        const showSignup = document.getElementById('showSignup');
        const showLogin = document.getElementById('showLogin');
        
        if (showSignup) {
            showSignup.addEventListener('click', (e) => {
                e.preventDefault();
                UIController.toggleAuthForms('signup');
            });
        }
        
        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                UIController.toggleAuthForms('login');
            });
        }
    },

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!this.validateForm(email, password)) return;
        
        UIController.showLoading(true);
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful:', userCredential.user.email);
            
            NotificationController.show('Login successful! Redirecting...', 'success');
     
            
        } catch (error) {
            console.error('Login error:', error);
            NotificationController.show(this.getErrorMessage(error.code), 'error');
        } finally {
            UIController.showLoading(false);
        }
    },

    async handleSignup(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!this.validateForm(email, password)) return;
        
        UIController.showLoading(true);
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            console.log('Signup successful:', user.email);

            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                createdAt: new Date()
            });
            
            NotificationController.show('Account created successfully! Please complete your registration.', 'success');
            
            setTimeout(() => {
                window.location.href = 'registration.html';
            }, 2000);
            
        } catch (error) {
            console.error('Signup error:', error);
            NotificationController.show(this.getErrorMessage(error.code), 'error');
        } finally {
            UIController.showLoading(false);
        }
    },

    validateForm(email, password) {
        if (!email || !password) {
            NotificationController.show('Please fill in all fields', 'error');
            return false;
        }
        
        if (!this.isValidEmail(email)) {
            NotificationController.show('Please enter a valid email address', 'error');
            return false;
        }
        
        if (password.length < 6) {
            NotificationController.show('Password must be at least 6 characters long', 'error');
            return false;
        }
        
        return true;
    },

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address',
            'auth/wrong-password': 'Incorrect password',
            'auth/email-already-in-use': 'An account with this email already exists',
            'auth/weak-password': 'Password is too weak',
            'auth/invalid-email': 'Invalid email address',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later',
            'auth/network-request-failed': 'Network error. Please check your connection'
        };
        
        return errorMessages[errorCode] || 'An error occurred. Please try again.';
    }
};

const UIController = {
    init() {
        this.setupAnimations();
    },

    toggleAuthForms(formType) {
        const loginCard = document.getElementById('loginCard');
        const signupCard = document.getElementById('signupCard');
        
        if (formType === 'signup') {
            loginCard.classList.add('d-none');
            signupCard.classList.remove('d-none');
        } else {
            signupCard.classList.add('d-none');
            loginCard.classList.remove('d-none');
        }
    },

    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            if (show) {
                loadingOverlay.classList.remove('d-none');
            } else {
                loadingOverlay.classList.add('d-none');
            }
        }
    },

    setupAnimations() {
        const cards = document.querySelectorAll('.auth-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }
};

const NotificationController = {
    show(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (!toast || !toastMessage) return;
        
        toastMessage.textContent = message;
        
        toast.className = 'toast';
        if (type === 'success') {
            toast.classList.add('bg-success', 'text-white');
        } else if (type === 'error') {
            toast.classList.add('bg-danger', 'text-white');
        } else if (type === 'warning') {
            toast.classList.add('bg-warning', 'text-dark');
        } else {
            toast.classList.add('bg-info', 'text-white');
        }
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            toast.className = 'toast';
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

window.App = App;
