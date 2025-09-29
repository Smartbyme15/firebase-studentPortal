import { 
    auth, 
    db,
    onAuthStateChanged,
    signOut,
    doc,
    getDoc 
} from "./firebase.js";


const DashboardApp = {
    currentUser: null,
    studentData: null,

    init() {
        console.log('🚀 Dashboard Loading...');
        
       
        this.checkAuth();
      
        DashboardController.init();
        NavigationController.init();
        UIController.init();
        
        console.log('✅ Dashboard Loaded Successfully!');
    },

    checkAuth() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.currentUser = user;
                console.log('User authenticated:', user.email);
                
             
                const userEmailElement = document.getElementById('userEmail');
                if (userEmailElement) {
                    userEmailElement.innerHTML = `<i class="fas fa-user me-1"></i>${user.email}`;
                }
                
                // Load student data
                await this.loadStudentData();
                
            } else {
                console.log('User not authenticated, redirecting to login');
                window.location.href = 'index.html';
            }
        });
    },

    async loadStudentData() {
        try {
            const studentDoc = await getDoc(doc(db, 'students', this.currentUser.uid));
            
            if (studentDoc.exists()) {
                this.studentData = studentDoc.data();
                console.log('Student data loaded:', this.studentData);
                
                DashboardController.updateProfile(this.studentData);
                
            } else {
                console.log('No student data found, redirecting to registration');
                window.location.href = 'registration.html';
            }
        } catch (error) {
            console.error('Error loading student data:', error);
            NotificationController.show('Error loading student data', 'error');
        }
    }
};

const DashboardController = {
    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }
    },

    updateProfile(studentData) {
        const profileContent = document.getElementById('profileContent');
        const currentCourse = document.getElementById('currentCourse');
        const scheduleTable = document.getElementById('scheduleTable');
        
        if (profileContent) {
            profileContent.innerHTML = `
                <div class="col-lg-4 text-center">
                    <div class="profile-avatar">
                        <i class="fas fa-user-graduate"></i>
                    </div>
                </div>
                <div class="col-lg-8">
                    <div class="profile-info">
                        <h3>${studentData.fullName}</h3>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="info-item">
                                    <i class="fas fa-envelope"></i>
                                    <span>${studentData.email}</span>
                                </div>
                                <div class="info-item">
                                    <i class="fas fa-book"></i>
                                    <span>${studentData.course}</span>
                                </div>
                                <div class="info-item">
                                    <i class="fas fa-building"></i>
                                    <span>${studentData.campus}</span>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="info-item">
                                    <i class="fas fa-clock"></i>
                                    <span>${studentData.classTimings}</span>
                                </div>
                                <div class="info-item">
                                    <i class="fas fa-chalkboard-teacher"></i>
                                    <span>${studentData.teacher}</span>
                                </div>
                                <div class="info-item">
                                    <i class="fas fa-calendar"></i>
                                    <span>Registered: ${new Date(studentData.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (currentCourse) {
            currentCourse.textContent = studentData.course;
        }
        
        if (scheduleTable) {
            scheduleTable.innerHTML = this.generateSchedule(studentData);
        }
    },

    generateSchedule(studentData) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const subjects = this.getSubjectsForCourse(studentData.course);
        
        return days.map(day => `
            <tr>
                <td><strong>${day}</strong></td>
                <td>${studentData.classTimings}</td>
                <td>${subjects[Math.floor(Math.random() * subjects.length)]}</td>
                <td>${studentData.teacher}</td>
                <td>${studentData.campus}</td>
            </tr>
        `).join('');
    },

    getSubjectsForCourse(course) {
        const courseSubjects = {
            'Computer Science': ['Programming Fundamentals', 'Data Structures', 'Algorithms', 'Database Systems'],
            'Information Technology': ['Web Development', 'Network Security', 'System Analysis', 'IT Project Management'],
            'Software Engineering': ['Software Design', 'Testing Methods', 'Project Management', 'Requirements Engineering'],
            'Data Science': ['Statistics', 'Machine Learning', 'Data Mining', 'Python Programming'],
            'Cybersecurity': ['Network Security', 'Ethical Hacking', 'Cryptography', 'Security Policies'],
            'Web Development': ['HTML/CSS', 'JavaScript', 'React', 'Node.js'],
            'Mobile App Development': ['Android Development', 'iOS Development', 'React Native', 'UI/UX Design']
        };
        
        return courseSubjects[course] || ['General Studies', 'Mathematics', 'English', 'Computer Basics'];
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

const NavigationController = {
    init() {
        this.setupSidebarNavigation();
    },

    setupSidebarNavigation() {
        const sidebarLinks = document.querySelectorAll('[data-section]');
        
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const sectionName = link.getAttribute('data-section');
                this.showSection(sectionName);
             
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    },

    showSection(sectionName) {
   
        const sections = document.querySelectorAll('.dashboard-section');
        sections.forEach(section => section.classList.add('d-none'));
        
        const targetSection = document.getElementById(`${sectionName}Section`);
        if (targetSection) {
            targetSection.classList.remove('d-none');
        }
    }
};

const UIController = {
    init() {
        this.setupAnimations();
    },

    setupAnimations() {
    
        const cards = document.querySelectorAll('.card');
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
    DashboardApp.init();
});

window.DashboardApp = DashboardApp;