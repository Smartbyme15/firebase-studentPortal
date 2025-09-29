import { 
    auth, 
    db,
    onAuthStateChanged,
    signOut,
    doc,
    setDoc 
} from "./firebase.js";

const RegistrationApp = {
    currentUser: null,

    init() {
        console.log('🚀 Registration Page Loading...');
 
        this.checkAuth();
      
        RegistrationController.init();
        UIController.init();
        
        console.log('✅ Registration Page Loaded Successfully!');
    },

    checkAuth() {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.currentUser = user;
                console.log('User authenticated:', user.email);
            } else {
                console.log('User not authenticated, redirecting to login');
                window.location.href = 'index.html';
            }
        });
    }
};

const RegistrationController = {
    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        const registrationForm = document.getElementById('registrationForm');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (registrationForm) {
            registrationForm.addEventListener('submit', this.handleRegistration.bind(this));
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }
    },

    async handleRegistration(e) {
        e.preventDefault();
        
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) return;
        
        UIController.showLoading(true);
        
        try {
       
            await setDoc(doc(db, 'students', RegistrationApp.currentUser.uid), {
                ...formData,
                email: RegistrationApp.currentUser.email,
                userId: RegistrationApp.currentUser.uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            
            console.log('Registration data saved successfully');
            NotificationController.show('Registration completed successfully!', 'success');
            
       
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error saving registration data:', error);
            NotificationController.show('Error saving registration data. Please try again.', 'error');
        } finally {
            UIController.showLoading(false);
        }
    },

    getFormData() {
        return {
            fullName: document.getElementById('fullName').value.trim(),
            classTimings: document.getElementById('classTimings').value,
            campus: document.getElementById('campus').value,
            teacher: document.getElementById('teacher').value,
            course: document.getElementById('course').value
        };
    },

    validateForm(formData) {
        const requiredFields = ['fullName', 'classTimings', 'campus', 'teacher', 'course'];
        
        for (const field of requiredFields) {
            if (!formData[field]) {
                NotificationController.show(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`, 'error');
                return false;
            }
        }
        
        if (formData.fullName.length < 2) {
            NotificationController.show('Full name must be at least 2 characters long', 'error');
            return false;
        }
        
        return true;
    },

    async handleLogout() {
        try {
            await signOut(auth);
            console.log('User signed out');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error signing out:', error);
            NotificationController.show('Error signing out', 'error');
        }
    }
};


const UIController = {
    init() {
        this.setupAnimations();
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
       
        const card = document.querySelector('.card');
        if (card) {
            card.style.animation = 'slideInUp 0.6s ease-out';
        }
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
    RegistrationApp.init();
});

window.RegistrationApp = RegistrationApp;