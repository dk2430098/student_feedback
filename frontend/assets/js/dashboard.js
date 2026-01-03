// Check Auth & Get User (Handled by clerk-auth.js, we just wait)
// We expose a render function that clerk-auth.js or this script calls

function initDashboard(user) {
    if (!user) return;

    // Legacy support: set global user for other scripts
    window.user = user;

    renderSidebar(user);

    // Trigger role-specific loads if they exist
    if (typeof loadData === 'function') loadData();
    if (typeof loadUsers === 'function') loadUsers();
}

// Listen for Clerk initialization
document.addEventListener('clerk-ready', (e) => {
    const user = e.detail.user; // Detailed Clerk user or potentially our sync'd user
    // We need the MONGO user role/details. 
    // clerk-auth.js should fetch/sync it and pass it.

    // For now, let's assume clerk-auth.js puts the Mongo User in localStorage 'mongo_user' or passes it
    // Actually, let's just use what we have.
    // If clerk-auth.js handles the sync, it should probably emit the MONGO user.

    initDashboard(e.detail.mongoUser);
});


// Render Sidebar
// Render Sidebar
function renderSidebar(user) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return; // Skip if no sidebar (e.g. new layout)
    let colorClass, iconBg;

    // Safety check for user
    if (!user) return;

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
    if (window.clerk) window.clerk.signOut();
    else window.location.href = '../login.html';
}
window.logout = logout;

// Setup handled by initDashboard via Event

