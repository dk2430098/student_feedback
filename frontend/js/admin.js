// Init Globals
const API_URL = `${config.API_BASE_URL}/api`;
let allComplaints = [];
let allStaff = [];

// Auth Check managed by dashboard.js
// Initial Load managed by dashboard.js calling loadData()

/* ================= NAVIGATION ================= */
function switchTab(tab) {
    const btnC = document.getElementById('tab-complaints');
    const btnU = document.getElementById('tab-users');
    const viewC = document.getElementById('view-complaints');
    const viewU = document.getElementById('view-users');

    if (tab === 'complaints') {
        viewC.classList.remove('hidden'); viewU.classList.add('hidden');
        btnC.className = 'px-5 py-2 rounded-lg text-sm font-bold bg-white text-slate-800 shadow-sm transition-all duration-200 hover:shadow-md ring-1 ring-black/5';
        btnU.className = 'px-5 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-white/60 hover:text-indigo-600 transition-all duration-200';
    } else {
        viewC.classList.add('hidden'); viewU.classList.remove('hidden');
        btnU.className = 'px-5 py-2 rounded-lg text-sm font-bold bg-white text-slate-800 shadow-sm transition-all duration-200 hover:shadow-md ring-1 ring-black/5';
        btnC.className = 'px-5 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-white/60 hover:text-indigo-600 transition-all duration-200';
    }
}

/* ================= DATA LOADING ================= */
/* ================= DATA LOADING ================= */
async function loadData() {
    // 1. Load Complaints
    try {
        const resC = await fetch(`${API_URL}/complaints`, { headers: { 'Authorization': `Bearer ${window.token}` } });
        const dataC = await resC.json();
        if (dataC.success) {
            allComplaints = dataC.data || [];
            applyFilters();
            renderStats();
        } else {
            console.error('Failed to load complaints:', dataC.message);
        }
    } catch (e) {
        console.error('Complaints Fetch Error', e);
    }

    // 2. Load Staff (Wardens & Supervisors)
    try {
        // Fetch both in parallel
        const [resW, resS] = await Promise.all([
            fetch(`${API_URL}/auth/users/warden`, { headers: { 'Authorization': `Bearer ${window.token}` } }),
            fetch(`${API_URL}/auth/users/supervisor`, { headers: { 'Authorization': `Bearer ${window.token}` } })
        ]);

        const dataW = await resW.json();
        const dataS = await resS.json();

        let staffList = [];

        // robustly check results
        if (resW.ok && dataW.success && Array.isArray(dataW.data)) {
            staffList = [...staffList, ...dataW.data];
        } else {
            console.warn('Warden fetch issue:', dataW);
        }

        if (resS.ok && dataS.success && Array.isArray(dataS.data)) {
            staffList = [...staffList, ...dataS.data];
        } else {
            console.warn('Supervisor fetch issue:', dataS);
        }

        allStaff = staffList;
        console.log('Loaded Staff:', allStaff); // Debug Log
        renderStaff(allStaff);

    } catch (e) {
        console.error('Data Load Error (Staff)', e);
        document.getElementById('users-body').innerHTML = `<tr><td colspan="4" class="p-4 text-center text-red-500 font-bold">Error loading staff data.</td></tr>`;
    }
}

function applyFilters() {
    const statusFilter = document.getElementById('filter-status').value;
    const catFilter = document.getElementById('filter-category').value;

    const filtered = allComplaints.filter(c => {
        const matchStatus = statusFilter === 'all' || c.status === statusFilter;
        const matchCat = catFilter === 'all' || c.category === catFilter;
        return matchStatus && matchCat;
    });

    renderComplaints(filtered);
}

function renderStats() {
    const total = allComplaints.length;
    const pending = allComplaints.filter(c => c.status === 'pending').length;
    const resolved = allComplaints.filter(c => c.status === 'resolved').length;
    const card = (label, value, color) => `
        <div class="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-start gap-1 relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
               <div class="w-16 h-16 rounded-full bg-${color}-500 blur-xl"></div>
            </div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">${label}</p>
            <p class="text-4xl font-black text-slate-800 relative z-10 tracking-tight">${value}</p>
            <div class="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div class="h-full bg-${color}-500 w-2/3 rounded-full opacity-80"></div>
            </div>
        </div>`;

    document.getElementById('stats-container').innerHTML = `
        ${card('Total Filed', total, 'indigo')} 
        ${card('Pending Review', pending, 'amber')} 
        ${card('Successfully Resolved', resolved, 'green')}
        ${card('Active Staff', allStaff.length, 'blue')}
    `;
}

// Complaint Detail Logic
function openComplaintDetails(id) {
    const complaint = allComplaints.find(c => c._id === id);
    if (!complaint) return;

    // Hide list, show details
    document.getElementById('view-complaints').classList.add('hidden');
    document.getElementById('view-complaint-details').classList.remove('hidden');

    // Populate Data
    const date = new Date(complaint.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    document.getElementById('cd-meta').innerText = `ID: #${complaint._id.slice(-6).toUpperCase()} • Filed: ${date}`;
    document.getElementById('cd-title').innerText = complaint.title;
    document.getElementById('cd-category').innerText = complaint.category;

    // Status Badge
    const statusSpan = document.getElementById('cd-status');
    statusSpan.innerText = complaint.status;
    statusSpan.className = `px-3 py-1 rounded-full text-xs font-bold uppercase ${complaint.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`;

    // Assigned To
    document.getElementById('cd-assigned').innerText = complaint.assignedTo ? complaint.assignedTo.name : 'Unassigned';
    const assignBtn = document.getElementById('cd-assign-btn');
    assignBtn.onclick = () => openAssign(complaint._id);

    // Student Info
    if (complaint.student) {
        document.getElementById('cd-student-name').innerText = complaint.student.name;
        document.getElementById('cd-student-hostel').innerText = complaint.student.hostelBlock || 'N/A';
        document.getElementById('cd-student-email').innerText = complaint.student.email;
    } else {
        document.getElementById('cd-student-name').innerText = 'Unknown Student';
        document.getElementById('cd-student-hostel').innerText = '-';
        document.getElementById('cd-student-email').innerText = '-';
    }

    // Description
    document.getElementById('cd-desc').innerText = complaint.description;

    // Resolution
    const resSection = document.getElementById('cd-resolution-section');
    if (complaint.status === 'resolved' && complaint.resolutionNotes) {
        resSection.classList.remove('hidden');
        document.getElementById('cd-resolution-notes').innerText = complaint.resolutionNotes;
    } else {
        resSection.classList.add('hidden');
    }
}

function closeComplaintDetails() {
    document.getElementById('view-complaint-details').classList.add('hidden');
    document.getElementById('view-complaints').classList.remove('hidden');
}

function renderComplaints(list) {
    document.getElementById('table-body').innerHTML = list.map(c => {
        const date = new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        return `
        <tr onclick="openComplaintDetails('${c._id}')" class="hover:bg-slate-50 transition border-b border-slate-50 cursor-pointer">
            <td class="p-4">
                <div class="text-xs font-bold text-slate-700">${date}</div>
                <div class="text-[10px] font-mono text-slate-400 uppercase">#${c._id.slice(-6)}</div>
            </td>
            <td class="p-4">
                <div class="font-bold text-slate-700 text-sm truncate w-64">${c.title}</div>
                <div class="text-xs text-slate-500">${c.category} • ${c.student ? c.student.hostelBlock : 'N/A'}</div>
            </td>
            <td class="p-4"><span class="px-2 py-1 text-xs font-bold rounded-full uppercase ${c.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">${c.status}</span></td>
            <td class="p-4 text-xs font-medium text-slate-600">${c.assignedTo ? c.assignedTo.name : 'Unassigned'}</td>
            <td class="p-4 text-right" onclick="event.stopPropagation()">
                <button onclick="openAssign('${c._id}')" class="text-indigo-600 font-bold text-xs hover:bg-indigo-50 px-2 py-1 rounded">Re-Assign</button>
            </td>
        </tr>
    `}).join('');
}

// Staff Detail Logic
function openStaffDetails(id) {
    const staff = allStaff.find(s => s._id === id);
    if (!staff) return;

    // Hide list, show details
    document.getElementById('view-users').classList.add('hidden');
    document.getElementById('view-staff-details').classList.remove('hidden');

    // Set Header
    document.getElementById('sd-name').innerText = staff.name;
    document.getElementById('sd-role').innerText = `${staff.role.toUpperCase()} • ${staff.assignedHostel || 'N/A'}`;

    // Filter Complaints
    const assignedComplaints = allComplaints.filter(c => c.assignedTo && c.assignedTo._id === id);

    // Calculate Stats
    const total = assignedComplaints.length;
    const resolved = assignedComplaints.filter(c => c.status === 'resolved').length;
    const pending = assignedComplaints.filter(c => c.status !== 'resolved').length; // pending + in-progress
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // Render Stats
    document.getElementById('sd-total').innerText = total;
    document.getElementById('sd-resolved').innerText = resolved;
    document.getElementById('sd-pending').innerText = pending;
    document.getElementById('sd-rate').innerText = `${rate}%`;

    // Render History Table
    const tbody = document.getElementById('sd-body');
    if (total === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-slate-400 italic">No complaints assigned to this staff member yet.</td></tr>`;
    } else {
        tbody.innerHTML = assignedComplaints.map(c => `
            <tr class="hover:bg-slate-50 transition border-b border-slate-50">
                <td class="p-4 text-xs font-mono text-slate-500">${new Date(c.createdAt).toLocaleDateString()}</td>
                <td class="p-4">
                    <div class="font-bold text-slate-700 text-sm truncate w-64">${c.title}</div>
                    <div class="text-xs text-slate-400">#${c._id.slice(-6)}</div>
                </td>
                <td class="p-4"><span class="px-2 py-1 text-xs font-bold rounded-full uppercase ${c.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">${c.status}</span></td>
                <td class="p-4 text-sm text-slate-600 text-right italic max-w-xs truncate">${c.resolutionNotes || '-'}</td>
            </tr>
        `).join('');
    }
}

function closeStaffDetails() {
    document.getElementById('view-staff-details').classList.add('hidden');
    document.getElementById('view-users').classList.remove('hidden');
}

function renderStaff(list) {
    const body = document.getElementById('users-body');
    if (!list || list.length === 0) {
        body.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-slate-400 italic">No staff members found. Add a Warden or Supervisor to get started.</td></tr>`;
        return;
    }
    body.innerHTML = list.map(u => `
        <tr onclick="openStaffDetails('${u._id}')" class="hover:bg-slate-50 transition border-b border-slate-50 cursor-pointer">
            <td class="p-4">
                <div class="font-bold text-sm text-slate-800">${u.name}</div>
                <div class="text-xs text-slate-500">${u.email}</div>
            </td>
            <td class="p-4"><span class="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold uppercase">${u.role}</span></td>
            <td class="p-4 text-sm font-mono text-slate-600">${u.role === 'warden' ? (u.assignedHostel || 'N/A') : (u.assignedHostel || 'All Departments')}</td>
            <td class="p-4 text-right flex justify-end gap-2" onclick="event.stopPropagation()">
                <button onclick="editUser('${u._id}')" class="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded text-xs font-bold">Edit</button>
                <button onclick="deleteUser('${u._id}')" class="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded text-xs font-bold">Delete</button>
            </td>
        </tr>
    `).join('');
}

/* ================= USER MANAGEMENT ================= */
const modal = document.getElementById('userModal');
const form = document.getElementById('userForm');

function toggleHostelField() {
    updateJurisdictionOptions();
}

function updateJurisdictionOptions(selectedVal = '') {
    const role = document.getElementById('u-role').value;
    const select = document.getElementById('u-hostel');
    const label = document.getElementById('jurisdiction-label');
    select.innerHTML = '';

    if (role === 'warden') {
        label.innerText = 'Assign Hostel Block';
        const hostels = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10', 'New Hostel', 'Outside'];
        hostels.forEach(h => {
            const opt = document.createElement('option');
            opt.value = h;
            opt.innerText = h;
            if (h === selectedVal) opt.selected = true;
            select.appendChild(opt);
        });
        document.getElementById('hostelField').style.display = 'block';
    } else if (role === 'supervisor') {
        label.innerText = 'Assign Department';
        const depts = ['Academic', 'Security', 'Mess', 'Other'];
        depts.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.innerText = d;
            if (d === selectedVal) opt.selected = true;
            select.appendChild(opt);
        });
        document.getElementById('hostelField').style.display = 'block';
    } else {
        document.getElementById('hostelField').style.display = 'none';
    }
}

function openAddUser() {
    document.getElementById('modalTitle').innerText = 'Add New Staff';
    document.getElementById('userForm').reset();
    document.getElementById('u-id').value = '';

    // Password field removed from UI, so no need to manage its display

    document.getElementById('userModal').classList.remove('hidden');
}

function closeUserModal() {
    document.getElementById('userModal').classList.add('hidden');
}

function editUser(id) {
    // Find user in the global list
    const user = allStaff.find(s => s._id === id);
    if (!user) {
        alert('User not found in local data. Please refresh.');
        return;
    }

    try {
        document.getElementById('modalTitle').innerText = 'Edit Staff';
        document.getElementById('u-id').value = user._id;
        document.getElementById('u-name').value = user.name;
        document.getElementById('u-email').value = user.email;
        document.getElementById('u-role').value = user.role;
        toggleHostelField();
        document.getElementById('u-hostel').value = user.assignedHostel || '';

        // Password editing removed

        document.getElementById('userModal').classList.remove('hidden');
    } catch (e) {
        console.error(e);
        alert('Error opening edit form.');
    }
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
        const token = await window.clerk.session.getToken();
        await fetch(`${API_URL}/auth/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        loadData();
    } catch (e) { alert('Delete failed'); }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    // Loading State
    btn.disabled = true;
    btn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block"
xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
<path class="opacity-75" fill="currentColor"
    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
</path>
</svg> Saving...`;

    const id = document.getElementById('u-id').value;
    // NOTE: Password handling removed as Clerk handles auth.
    const data = {
        name: document.getElementById('u-name').value,
        email: document.getElementById('u-email').value,
        role: document.getElementById('u-role').value,
        assignedHostel: document.getElementById('u-hostel').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/auth/users/${id}` : `${API_URL}/auth/users`;

    try {
        const token = await window.clerk.session.getToken();
        const res = await fetch(url, {
            method: method,
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (json.success) {
            closeUserModal();
            alert(id ? 'Updated successfully' : 'Created successfully');
            loadData();
        } else {
            alert(json.message);
        }
    } catch (e) {
        console.error(e);
        alert('Operation Failed: ' + e.message);
    }
    finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
});

// Assign Modal
function openAssign(id) {
    document.getElementById('assignId').value = id;
    const sel = document.getElementById('wardenSelect');
    sel.innerHTML = `<option value="">-- Select --</option>` + allStaff.map(s =>
        `<option value="${s._id}">${s.name} (${s.role === 'warden' ? s.assignedHostel : 'Sup.'})</option>`
    ).join('');
    document.getElementById('assignModal').classList.remove('hidden');
}

async function submitAssign() {
    const id = document.getElementById('assignId').value;
    const wardenId = document.getElementById('wardenSelect').value;
    if (!wardenId) return;
    await fetch(`${API_URL}/complaints/${id}/assign`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${window.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ wardenId })
    });
    document.getElementById('assignModal').classList.add('hidden');
    loadData();
}

function logout() { localStorage.clear(); window.location.href = '../login.html'; }

// Mobile Menu Toggle
document.getElementById('admin-menu-btn').addEventListener('click', toggleAdminMenu);
function toggleAdminMenu() {
    document.getElementById('admin-mobile-menu').classList.toggle('hidden');
}
