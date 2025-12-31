// Init Globals
let allComplaints = [];
let allStaff = [];

// Auth Check
if (!user || user.role !== 'admin') {
    window.location.href = '../login.html';
}

// Initial Load
loadData();

/* ================= NAVIGATION ================= */
function switchTab(tab) {
    const btnC = document.getElementById('tab-complaints');
    const btnU = document.getElementById('tab-users');
    const viewC = document.getElementById('view-complaints');
    const viewU = document.getElementById('view-users');

    if (tab === 'complaints') {
        viewC.classList.remove('hidden'); viewU.classList.add('hidden');
        btnC.className = 'px-4 py-1.5 rounded-md text-sm font-bold bg-white text-indigo-900 shadow transition';
        btnU.className = 'px-4 py-1.5 rounded-md text-sm font-bold text-indigo-300 hover:text-white transition';
    } else {
        viewC.classList.add('hidden'); viewU.classList.remove('hidden');
        btnU.className = 'px-4 py-1.5 rounded-md text-sm font-bold bg-white text-indigo-900 shadow transition';
        btnC.className = 'px-4 py-1.5 rounded-md text-sm font-bold text-indigo-300 hover:text-white transition';
    }
}

/* ================= DATA LOADING ================= */
/* ================= DATA LOADING ================= */
async function loadData() {
    // 1. Load Complaints
    try {
        const resC = await fetch(`${API_URL}/complaints`, { headers: { 'Authorization': `Bearer ${token}` } });
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
            fetch(`${API_URL}/auth/users/warden`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/auth/users/supervisor`, { headers: { 'Authorization': `Bearer ${token}` } })
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
    const card = (l, v, c) => `<div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"><p class="text-xs font-bold text-slate-400 uppercase">${l}</p><p class="text-3xl font-bold text-${c}-600">${v}</p></div>`;
    document.getElementById('stats-container').innerHTML = `${card('Total', total, 'indigo')} ${card('Pending', pending, 'amber')} ${card('Resolved', resolved, 'green')}`;
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
    document.getElementById('u-id').value = '';
    form.reset();
    updateJurisdictionOptions();

    const passInput = document.getElementById('u-pass');
    document.getElementById('password-group').style.display = 'block';
    passInput.required = true;
    passInput.placeholder = "Set initial password";
    document.getElementById('pass-hint').innerText = "This password will be sent to the staff member's email.";
    modal.classList.remove('hidden');
}

function closeUserModal() {
    modal.classList.add('hidden');
}

function editUser(id) {
    const u = allStaff.find(s => s._id === id);
    if (!u) return;

    try {
        document.getElementById('modalTitle').innerText = 'Edit Staff Details';
        document.getElementById('u-id').value = u._id;
        document.getElementById('u-name').value = u.name;
        document.getElementById('u-email').value = u.email;
        document.getElementById('u-role').value = u.role;

        updateJurisdictionOptions(u.assignedHostel);

        const passInput = document.getElementById('u-pass');
        passInput.value = '';
        document.getElementById('password-group').style.display = 'block';
        passInput.required = false;
        passInput.placeholder = "Enter new password to reset (Optional)";
        document.getElementById('pass-hint').innerText = "Leave empty to keep current password.";

        modal.classList.remove('hidden');
    } catch (err) {
        console.error('Error in editUser:', err);
        alert('Error opening edit form.');
    }
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
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
    const data = {
        name: document.getElementById('u-name').value,
        email: document.getElementById('u-email').value,
        role: document.getElementById('u-role').value,
        assignedHostel: document.getElementById('u-hostel').value,
        password: document.getElementById('u-pass').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/auth/users/${id}` : `${API_URL}/auth/users`;

    try {
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
    } catch (e) { alert('Operation Failed'); }
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
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
