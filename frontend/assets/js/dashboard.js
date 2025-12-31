const API_URL = 'http://localhost:5000/api';

// Check Auth & Get User
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
    window.location.href = '../login.html';
}

// Render Sidebar
function renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return; // Skip if no sidebar (e.g. new layout)
    let colorClass, iconBg;

    if (user.role === 'admin') { colorClass = 'text-purple-400'; iconBg = 'bg-purple-600'; }
    else if (user.role === 'warden') { colorClass = 'text-emerald-400'; iconBg = 'bg-emerald-600'; }
    else { colorClass = 'text-blue-400'; iconBg = 'bg-blue-600'; }

    sidebar.innerHTML = `
        <div class="p-6 text-xl font-bold tracking-tight border-b border-slate-800 flex items-center gap-2">
            CampusVoice <span class="${colorClass} text-xs uppercase border border-current px-1 rounded">${user.role}</span>
        </div>
        <div class="p-4 border-b border-slate-800 flex items-center gap-3">
             <div class="w-10 h-10 rounded-full ${iconBg} flex items-center justify-center font-bold text-white">
                 ${user.name.charAt(0)}
             </div>
             <div class="overflow-hidden">
                 <p class="font-medium text-sm truncate text-white">${user.name}</p>
                 <p class="text-xs text-slate-400 capitalize">${user.email}</p>
             </div>
        </div>
        <div id="nav-links" class="flex-1 p-4 space-y-2"></div>
        <div class="p-4 border-t border-slate-800">
            <button onclick="logout()" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition">
                <span>Sign Out</span>
            </button>
        </div>
    `;
}

// Logout
function logout() {
    localStorage.clear();
    window.location.href = '../login.html';
}

// Setup
renderSidebar();
