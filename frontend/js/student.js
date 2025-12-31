// Initialize
loadProfile();
showTab('profile'); // Default to Profile

// Branch Logic
const branches = {
    'B.Tech': ['Computer Science & Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Electronics & Communication', 'Civil Engineering'],
    'M.Tech': ['Physics', 'Chemistry', 'Mathematics', 'English/Social Sciences'],
    'Ph.D': ['Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Engineering']
};

function updateBranches() {
    const course = document.getElementById('p-course').value;
    const branchSelect = document.getElementById('p-branch');
    branchSelect.innerHTML = '<option value="">Select Branch</option>';

    if (branches[course]) {
        branches[course].forEach(b => {
            const opt = document.createElement('option');
            opt.value = b;
            opt.textContent = b;
            branchSelect.appendChild(opt);
        });
    }
}

function toggleEdit() {
    const fieldset = document.getElementById('profile-fieldset');
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');

    // Enable fields
    fieldset.disabled = false;

    // Toggle buttons
    editBtn.classList.add('hidden');
    saveBtn.classList.remove('hidden');
}

async function loadProfile() {
    try {
        const res = await fetch(`${API_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();

        if (data.success) {
            const user = data.data;
            document.getElementById('p-name').value = user.name || '';
            document.getElementById('p-enroll').value = user.enrollmentNo || '';

            // Set Selects (Need timeouts/order for dependent fields)
            document.getElementById('p-course').value = user.course || '';
            updateBranches(); // Populate branches based on course

            setTimeout(() => {
                if (user.branch) document.getElementById('p-branch').value = user.branch;
            }, 50);

            document.getElementById('p-year').value = user.year || '';
            document.getElementById('p-hostel').value = user.hostelBlock || '';

            if (user.profileImage) {
                document.getElementById('home-profile-img').src = user.profileImage;
            }
        }
    } catch (e) { console.error(e); }
}

// Handle Profile Update
document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('save-btn');
    const originalText = btn.textContent;
    btn.innerHTML = 'Saving...';
    btn.disabled = true;

    const formData = new FormData(e.target);
    const fileInput = document.getElementById('profile-upload');
    if (fileInput.files.length > 0) {
        formData.append('profileImage', fileInput.files[0]);
    }

    try {
        const res = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await res.json();
        if (data.success) {
            // Success: Switch back to view mode
            document.getElementById('profile-fieldset').disabled = true;
            document.getElementById('edit-btn').classList.remove('hidden');
            document.getElementById('save-btn').classList.add('hidden');

            // Wait a bit then refresh data to be sure
            setTimeout(loadProfile, 500);
            alert('Profile updated!');
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert('Error updating profile');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

function uploadProfileImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('home-profile-img').src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// Tab Logic
function showTab(tab) {
    // Hide all
    document.getElementById('tab-profile').classList.add('hidden');
    document.getElementById('tab-submit').classList.add('hidden');
    document.getElementById('tab-pending').classList.add('hidden');
    document.getElementById('tab-resolved').classList.add('hidden');

    // Styles
    const inactiveClass = 'px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-white transition-all flex items-center gap-2';
    const activeClass = 'px-4 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white shadow-sm transition-all flex items-center gap-2';

    // Reset
    if (document.getElementById('btn-profile')) document.getElementById('btn-profile').className = inactiveClass;
    document.getElementById('btn-submit').className = inactiveClass;
    document.getElementById('btn-pending').className = inactiveClass;
    document.getElementById('btn-resolved').className = inactiveClass;

    // Show active
    document.getElementById(`tab-${tab}`).classList.remove('hidden');
    document.getElementById(`btn-${tab}`).className = activeClass;

    if (tab === 'pending') loadPending();
    if (tab === 'resolved') loadResolved();
}

async function loadPending() {
    const container = document.getElementById('pending-content');
    container.innerHTML = '<div class="text-center text-slate-400">Loading...</div>';

    try {
        const res = await fetch(`${API_URL}/complaints`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        const pending = data.data ? data.data.filter(i => i.status === 'pending') : [];

        if (pending.length === 0) {
            container.innerHTML = '<div class="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">No pending requests.</div>';
        } else {
            container.innerHTML = pending.map(item => renderCard(item)).join('');
        }
    } catch (err) { console.error(err); }
}

async function loadResolved() {
    const container = document.getElementById('resolved-content');
    container.innerHTML = '<div class="text-center text-slate-400">Loading...</div>';

    try {
        const res = await fetch(`${API_URL}/complaints`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        const resolved = data.data ? data.data.filter(i => i.status !== 'pending') : [];

        if (resolved.length === 0) {
            container.innerHTML = '<div class="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">No resolved history found.</div>';
        } else {
            container.innerHTML = resolved.map(item => renderCard(item)).join('');
        }
    } catch (err) { console.error(err); }
}

async function deleteComplaint(id) {
    if (!confirm('Are you sure you want to delete this complaint?')) return;
    try {
        const res = await fetch(`${API_URL}/complaints/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            loadPending(); // Refresh pending list
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert('Connection error');
    }
}

// Submit Logic (Existing)
document.getElementById('complaintForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Check File Sizes (Max 90MB for Cloudinary Free Tier Buffer)
    const fileInput = e.target.querySelector('input[name="media"]');
    if (fileInput.files.length > 0) {
        for (let file of fileInput.files) {
            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > 90) {
                alert(`File "${file.name}" is too large (${fileSizeMB.toFixed(2)} MB). Max limit is 90MB for this server.`);
                return; // Stop submission
            }
        }
    }

    // Show Loading State
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<svg class="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
</svg>`;

    try {
        const res = await fetch(`${API_URL}/complaints`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }, // No Content-Type for FormData
            body: formData
        });
        const data = await res.json();
        if (data.success) {
            alert('Submitted!');
            e.target.reset();
            showTab('pending');
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert('Error submitting form');
    } finally {
        // Restore Button State
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Load History Logic
async function loadHistory() {
    try {
        const res = await fetch(`${API_URL}/complaints`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        const pendingContainer = document.getElementById('history-pending');
        const resolvedContainer = document.getElementById('history-resolved');
        document.getElementById('history-loading').classList.add('hidden');

        if (!data.data || data.data.length === 0) {
            pendingContainer.innerHTML = '<div class="text-slate-400 text-sm italic">No pending requests.</div>';
            resolvedContainer.innerHTML = '<div class="text-slate-400 text-sm italic">No history found.</div>';
            return;
        }

        const pending = data.data.filter(i => i.status === 'pending');
        const resolved = data.data.filter(i => i.status !== 'pending');

        pendingContainer.innerHTML = pending.length ? pending.map(item => renderCard(item)).join('') : '<div class="text-slate-400 text-sm italic">No pending requests.</div>';
        resolvedContainer.innerHTML = resolved.length ? resolved.map(item => renderCard(item)).join('') : '<div class="text-slate-400 text-sm italic">No history found.</div>';

    } catch (err) { console.error(err); }
}

function renderCard(item) {
    return `
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="font-bold text-lg text-slate-800">${item.title}</h3>
                    <span class="text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-600 capitalize">${item.category}</span>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(item.status)}">
                    ${item.status}
                </span>
            </div>
            <p class="text-slate-600 text-sm mb-4">${item.description}</p>
            ${renderMedia(item.media)}
            ${renderResolution(item)}
            
            <!-- Actions -->
            ${item.status === 'pending' ? `
            <div class="mt-4 pt-4 border-t border-slate-100 flex gap-3">
                <button onclick="deleteComplaint('${item._id}')" class="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Delete Request
                </button>
            </div>
            ` : ''}
        </div>
`;
}

function getStatusColor(status) {
    if (status === 'resolved') return 'bg-green-100 text-green-700';
    if (status === 'rejected') return 'bg-red-100 text-red-700';
    if (status === 'pending') return 'bg-amber-100 text-amber-700';
    return 'bg-blue-100 text-blue-700';
}

function renderMedia(media) {
    if (!media || media.length === 0) return '';
    return `<div class="flex gap-2 mb-4 overflow-x-auto">${media.map(f =>
        f.type === 'image' ? `<img src="${f.url}" class="h-20 w-20 object-cover rounded-lg border">` : `<video src="${f.url}" controls class="h-20 w-auto object-cover rounded-lg border"></video>`
    ).join('')}</div>`;
}

function renderResolution(item) {
    if (!item.resolutionNotes) return '';
    return `
    <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm">
        <p class="font-bold text-blue-800 text-xs uppercase mb-1">Resolution Note</p>
        <p class="text-blue-900">${item.resolutionNotes}</p>
        ${item.resolutionProof && item.resolutionProof.length > 0 ?
            `<div class="mt-2 flex gap-2">${item.resolutionProof.map(f => `<a href="${f.url}" target="_blank" class="text-xs text-blue-600 underline">View Proof</a>`).join('')}</div>`
            : ''}
    </div>
`;
}

// Mobile Menu Toggle
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}
function toggleMobileMenu() {
    if (mobileMenu) mobileMenu.classList.add('hidden');
}
