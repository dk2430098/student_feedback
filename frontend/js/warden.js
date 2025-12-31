const API_URL = `${config.API_BASE_URL}/api`;
let allComplaints = [];
let currentFilter = 'pending'; // 'pending' or 'resolved'

// Init
loadComplaints();
updateDashboardTitle();
loadProfile();

function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('p-avatar').src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function switchTab(tab) {
    const dashboardView = document.getElementById('view-dashboard');
    const profileView = document.getElementById('view-profile');
    const tabDash = document.getElementById('tab-dashboard');
    const tabProf = document.getElementById('tab-profile');

    if (tab === 'dashboard') {
        dashboardView.classList.remove('hidden');
        profileView.classList.add('hidden');
        tabDash.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
        tabDash.classList.remove('text-slate-500');
        tabProf.classList.add('text-slate-500');
        tabProf.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
    } else {
        dashboardView.classList.add('hidden');
        profileView.classList.remove('hidden');
        tabProf.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
        tabProf.classList.remove('text-slate-500');
        tabDash.classList.add('text-slate-500');
        tabDash.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
    }
}

async function updateDashboardTitle() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        const titleEl = document.getElementById('dashboard-title');
        if (user.role === 'warden') {
            titleEl.textContent = `Warden Dashboard (${user.assignedHostel || 'NITMN'})`;
        } else if (user.role === 'supervisor') {
            titleEl.textContent = 'Student Supervisor Dashboard';
        }
    }
}

async function loadProfile() {
    try {
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            const user = data.data;
            document.getElementById('p-name').value = user.name;
            document.getElementById('p-email').value = user.email;
            document.getElementById('p-role').value = user.role;
            document.getElementById('p-role-display').textContent = user.role;
            document.getElementById('p-assigned').value = user.assignedHostel || 'All Blocks';

            if (user.profileImage) {
                document.getElementById('p-avatar').src = user.profileImage;
            } else {
                document.getElementById('p-avatar').src = `https://ui-avatars.com/api/?name=${user.name}&background=EFF6FF&color=1D4ED8`;
            }
        }
    } catch (e) { console.error(e); }
}

document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', document.getElementById('p-name').value);

    const fileInput = document.getElementById('p-file');
    if (fileInput.files.length > 0) {
        formData.append('profileImage', fileInput.files[0]);
    }

    try {
        const res = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }, // Content-Type handled automatically with FormData
            body: formData
        });
        const data = await res.json();
        if (data.success) {
            alert('Profile updated successfully!');
            localStorage.setItem('user', JSON.stringify(data.data));
        } else {
            alert('Update failed: ' + data.message);
        }
    } catch (e) { alert('Connection error'); }
});

async function loadComplaints() {
    try {
        const res = await fetch(`${API_URL}/complaints`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        allComplaints = data.data || [];
        renderComplaints();
    } catch (e) { console.error('Fetch error:', e); }
}

function filterComplaints(type) {
    currentFilter = type;

    // Update Buttons
    const btnPending = document.getElementById('btn-pending');
    const btnResolved = document.getElementById('btn-resolved');
    const activeClass = ['bg-white', 'text-slate-800', 'shadow-sm'];
    const inactiveClass = ['text-slate-500', 'hover:bg-white/50'];

    if (type === 'pending') {
        btnPending.classList.add(...activeClass);
        btnPending.classList.remove(...inactiveClass);

        btnResolved.classList.remove(...activeClass);
        btnResolved.classList.add(...inactiveClass);
    } else {
        btnResolved.classList.add(...activeClass);
        btnResolved.classList.remove(...inactiveClass);

        btnPending.classList.remove(...activeClass);
        btnPending.classList.add(...inactiveClass);
    }

    renderComplaints();
}

function renderComplaints() {
    const list = document.getElementById('complaints-container');
    const filtered = allComplaints.filter(c =>
        currentFilter === 'pending' ? c.status !== 'resolved' : c.status === 'resolved'
    );

    if (filtered.length === 0) {
        list.innerHTML = `<div class="text-center p-8 bg-white rounded-xl border border-slate-200 text-slate-500 italic">No ${currentFilter} complaints found.</div>`;
        return;
    }

    list.innerHTML = filtered.map(item => `
                <div class="bg-white/90 backdrop-blur-xl p-5 rounded-xl border border-slate-200/60 shadow-[0_2px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col group relative overflow-hidden">
                    
                    <!-- Status Line -->
                    <div class="absolute top-0 left-0 w-1 h-full ${item.status === 'resolved' ? 'bg-green-500' : 'bg-amber-400'}"></div>
                    
                    <!-- Header -->
                    <div class="flex justify-between items-start mb-3 pl-3">
                        <div class="flex items-center gap-3">
                            <div class="h-9 w-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shadow-sm">
                                ${getCategoryIcon(item.category)}
                            </div>
                            <div>
                                <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 mb-0.5">${item.category}</span>
                                <h3 class="font-bold text-slate-800 text-base leading-tight line-clamp-1">${item.title}</h3>
                            </div>
                        </div>
                        <span class="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            ${new Date(item.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <!-- Content Summary -->
                    <div class="pl-3 mb-4">
                         <p class="text-slate-600 text-xs leading-relaxed line-clamp-2">${item.description}</p>
                    </div>

                    <!-- Footer Actions -->
                    <div class="mt-auto pl-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                        <div class="flex items-center gap-2">
                            <span class="h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold ring-1 ring-indigo-100">
                                ${item.student ? item.student.name.charAt(0) : '?'}
                            </span>
                            <span class="text-xs font-semibold text-slate-600 truncate max-w-[100px]">${item.student ? item.student.name : 'Unknown'}</span>
                        </div>

                        <div class="flex gap-2">
                             <button onclick="openDetails('${item._id}')" class="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm transition">
                                View Details
                            </button>
                            ${item.status !== 'resolved' ? `
                                <button onclick="openResolve('${item._id}')" class="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition">
                                    Resolve
                                </button>
                            ` : `<span class="px-2 py-1 text-[10px] font-bold text-green-700 bg-green-50 rounded border border-green-100">Resolved</span>`}
                        </div>
                    </div>
                </div>
        `).join('');
}

// ... Helpers (getStatusColor, renderMedia, updateStatus, openResolve, logout, resolveForm listener) same as before ...
function getStatusColor(status) {
    if (status === 'resolved') return 'bg-green-100 text-green-700 border border-green-200';
    if (status === 'pending') return 'bg-amber-100 text-amber-700 border border-amber-200';
    return 'bg-blue-100 text-blue-700 border border-blue-200';
}

function getCategoryIcon(category) {
    const icons = {
        'mess': '🍲',
        'hostel': '🛏️',
        'maintenance': '🔧',
        'water': '💧',
        'electricity': '⚡',
        'wifi': '📶',
        'medical': '🚑',
        'other': '📦'
    };
    return icons[category.toLowerCase()] || '📝';
}

function renderMedia(media) {
    if (!media || media.length === 0) return '';
    return `<div class="flex gap-2 mb-4 overflow-x-auto pb-2">${media.map(f => f.type === 'image' ?
        `<img src="${f.url}" class="h-24 w-auto object-cover rounded-lg border border-slate-200 hover:scale-105 transition cursor-pointer shadow-sm">` :
        `<video src="${f.url}" controls class="h-24 w-auto object-cover rounded-lg border border-slate-200 shadow-sm"></video>`
    ).join(' ')}</div>`;
}

async function updateStatus(id, status) {
    const btn = event.target;
    btn.textContent = 'Updating...';
    btn.disabled = true;

    await fetch(`${API_URL}/complaints/${id}/resolve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolutionNotes: 'Status automatically updated to In-Progress' })
    });
    loadComplaints();
}

function openResolve(id) {
    document.getElementById('resolvingId').value = id;
    document.getElementById('resolveModal').classList.remove('hidden');
}

function openDetails(id) {
    const item = allComplaints.find(c => c._id === id);
    if (!item) return;

    // Populate Fields
    document.getElementById('detail-title').textContent = item.title;
    document.getElementById('detail-category').textContent = item.category;
    document.getElementById('detail-desc').textContent = item.description;
    document.getElementById('detail-date').textContent = 'Created: ' + new Date(item.createdAt).toLocaleString();

    // User Info
    document.getElementById('detail-user-name').textContent = item.student ? item.student.name : 'Unknown';
    document.getElementById('detail-user-email').textContent = item.student ? item.student.email : 'No Email';
    document.getElementById('detail-user-initial').textContent = item.student ? item.student.name.charAt(0) : '?';
    document.getElementById('detail-hostel').textContent = item.student && item.student.hostelBlock ? item.student.hostelBlock : 'N/A';

    // Media
    const mediaContainer = document.getElementById('detail-media-container');
    const mediaDiv = document.getElementById('detail-media');
    if (item.media && item.media.length > 0) {
        mediaContainer.classList.remove('hidden');
        mediaDiv.innerHTML = item.media.map(f => f.type === 'image' ?
            `<a href="${f.url}" target="_blank"><img src="${f.url}" class="h-32 w-auto object-cover rounded-lg border border-slate-200 hover:opacity-90"></a>` :
            `<video src="${f.url}" controls class="h-32 w-auto object-cover rounded-lg border border-slate-200"></video>`
        ).join('');
    } else {
        mediaContainer.classList.add('hidden');
    }

    // Resolution
    const resContainer = document.getElementById('detail-resolution-section');
    if (item.status === 'resolved' && item.resolutionNotes) {
        resContainer.classList.remove('hidden');
        document.getElementById('detail-res-notes').textContent = item.resolutionNotes;

        // Proof
        const proofDiv = document.getElementById('detail-res-proof');
        if (item.resolutionProof && item.resolutionProof.length > 0) {
            proofDiv.innerHTML = item.resolutionProof.map(f =>
                `<a href="${f.url}" target="_blank"><img src="${f.url}" class="h-20 w-auto object-cover rounded border border-green-200 hover:opacity-90"></a>`
            ).join('');
        } else {
            proofDiv.innerHTML = '';
        }
    } else {
        resContainer.classList.add('hidden');
    }

    document.getElementById('detailsModal').classList.remove('hidden');
}

document.getElementById('resolveForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('resolvingId').value;
    const notes = document.getElementById('resNotes').value;
    const files = document.getElementById('resProof').files;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const formData = new FormData();
    formData.append('status', 'resolved');
    formData.append('resolutionNotes', notes);
    for (let i = 0; i < files.length; i++) formData.append('resolutionProof', files[i]);

    try {
        await fetch(`${API_URL}/complaints/${id}/resolve`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        document.getElementById('resolveModal').classList.add('hidden');
        e.target.reset();
        loadComplaints();
    } catch (err) {
        alert('Error resolving complaint');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

function logout() {
    localStorage.clear();
    window.location.href = '../login.html';
}

// Mobile Menu Logic
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
}

function toggleMobileMenu() {
    mobileMenu.classList.toggle('hidden');
}
