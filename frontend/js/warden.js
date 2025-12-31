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
    if (type === 'pending') {
        btnPending.classList.add('bg-slate-900', 'text-white');
        btnPending.classList.remove('bg-white', 'text-slate-600');
        btnResolved.classList.remove('bg-slate-900', 'text-white');
        btnResolved.classList.add('bg-white', 'text-slate-600');
    } else {
        btnResolved.classList.add('bg-slate-900', 'text-white');
        btnResolved.classList.remove('bg-white', 'text-slate-600');
        btnPending.classList.remove('bg-slate-900', 'text-white');
        btnPending.classList.add('bg-white', 'text-slate-600');
    }

    renderComplaints();
}

function renderComplaints() {
    const list = document.getElementById('complaint-list');
    const filtered = allComplaints.filter(c =>
        currentFilter === 'pending' ? c.status !== 'resolved' : c.status === 'resolved'
    );

    if (filtered.length === 0) {
        list.innerHTML = `<div class="text-center p-8 bg-white rounded-xl border border-slate-200 text-slate-500 italic">No ${currentFilter} complaints found.</div>`;
        return;
    }

    list.innerHTML = filtered.map(item => `
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-0.5 bg-slate-100 rounded text-xs font-bold uppercase text-slate-500 tracking-wide">${item.category}</span>
                            <span class="text-xs text-slate-400">• ${new Date(item.createdAt).toLocaleString()}</span>
                        </div>
                        <h3 class="font-bold text-lg text-slate-800 leading-tight mb-2">${item.title}</h3>
                        
                        <div class="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-2 rounded-lg inline-flex">
                            <span class="font-semibold text-slate-700">👤 ${item.student ? item.student.name : 'Unknown User'}</span>
                            <span class="font-mono text-xs opacity-75">(${item.student ? item.student.email : 'No Email'})</span>
                            ${item.student && item.student.hostelBlock ? `<span class="bg-blue-100 text-blue-700 px-1.5 rounded text-xs font-bold">${item.student.hostelBlock}</span>` : ''}
                        </div>
                    </div>

                    <div class="flex flex-col items-end gap-2 min-w-[140px]">
                        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-center w-full ${getStatusColor(item.status)}">
                            ${item.status}
                        </span>
                        ${item.status === 'resolved' ? `
                            <span class="text-xs text-green-600 font-medium">
                                Resolved: ${new Date(item.updatedAt).toLocaleDateString()}
                            </span>
                        ` : ''}
                    </div>
                </div>

                <p class="text-slate-600 text-sm mb-4 leading-relaxed bg-slate-50/50 p-3 rounded border border-slate-100">${item.description}</p>
                ${renderMedia(item.media)}

                ${item.resolutionNotes ? `
                    <div class="mt-4 p-4 bg-green-50 rounded-lg border border-green-100 text-sm">
                        <strong class="text-green-800 block mb-1">✅ Official Resolution:</strong>
                        <p class="text-green-700">${item.resolutionNotes}</p>
                        ${item.resolutionProof && item.resolutionProof.length > 0 ? `
                            <div class="mt-2 text-xs font-bold text-green-800">Proof attached</div>
                        ` : ''}
                    </div>
                ` : ''}
                
                <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                    ${item.status !== 'resolved' ? `
                        ${item.status === 'pending' ? `
                            <button onclick="updateStatus('${item._id}', 'in-progress')" class="px-4 py-2 border border-amber-200 text-amber-700 bg-amber-50 rounded-lg text-sm font-semibold hover:bg-amber-100 transition">
                                ⏳ Mark In Progress
                            </button>
                        ` : ''}
                        <button onclick="openResolve('${item._id}')" class="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-green-700 shadow-md shadow-green-600/20 transition transform hover:-translate-y-0.5">
                            ✓ Resolve Complaint
                        </button>
                    ` : ''}
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
