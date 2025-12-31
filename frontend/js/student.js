// Initialize
const API_URL = `${config.API_BASE_URL}/api`;
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
        const allData = data.data || [];
        updateCache(allData);

        const pending = allData.filter(i => i.status === 'pending');

        if (pending.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">No pending requests.</div>';
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
        const allData = data.data || [];
        updateCache(allData);

        const resolved = allData.filter(i => i.status !== 'pending');

        if (resolved.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">No resolved history found.</div>';
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

// Modal Logic
let currentModalItem = null;

function renderCard(item) {
    const date = new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const statusIcon = getStatusIcon(item.status);
    const displayStatus = item.status === 'pending' ? 'IN-PROGRESS' : item.status.toUpperCase();

    return `
        <div onclick="openModal('${item._id}')" class="group bg-white p-6 rounded-[20px] border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col justify-between">
            
            <!-- Header -->
            <div class="flex justify-between items-start mb-5">
                <div class="flex items-start gap-4">
                    <!-- Icon Box -->
                    <div class="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 bg-slate-50 border border-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300">
                       <span class="material-symbols-rounded text-2xl">${getCategoryIcon(item.category)}</span>
                    </div>
                    
                    <!-- Text Info -->
                    <div>
                        <h3 class="font-bold text-[17px] text-slate-800 leading-tight mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">${item.title}</h3>
                        <div class="flex items-center gap-2 text-slate-400 text-[11px] font-semibold tracking-wide uppercase">
                             <span>${item.category}</span>
                             <span class="text-slate-300">•</span>
                             <span>${date}</span>
                        </div>
                    </div>
                </div>

                <!-- Status Pill -->
                <span class="shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-1.5 whitespace-nowrap ${getStatusColor(item.status)}">
                    <span class="material-symbols-rounded text-sm font-bold">${statusIcon}</span>
                    ${displayStatus}
                </span>
            </div>

            <!--Content Body-- >
            <div class="bg-[#F8F9FB] rounded-xl p-4 mb-5 border border-transparent group-hover:border-slate-100 transition-colors">
                <p class="text-slate-600 text-sm leading-relaxed line-clamp-3 font-medium">${item.description}</p>
            </div>

            <!--Footer -->
        <div class="flex justify-between items-center mt-auto pt-2">
            <span class="text-[13px] font-bold text-slate-400 group-hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                View Details <span class="material-symbols-rounded text-lg transition-transform group-hover:translate-x-1">arrow_right_alt</span>
            </span>

            ${item.media && item.media.length > 0 ?
            `<span class="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                    <span class="material-symbols-rounded text-sm -rotate-45">attachment</span> ${item.media.length}
                  </span>` : ''}
        </div>
        </div >
        `;
}

// Global cache to help modal find data
let cachedComplaints = [];

function updateCache(data) {
    cachedComplaints = data;
}

function openModal(id) {
    const item = cachedComplaints.find(i => i._id === id);
    if (!item) return;

    currentModalItem = item;
    const modal = document.getElementById('complaint-modal');
    const body = document.getElementById('modal-body');
    const date = new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    body.innerHTML = `
        <div class="mb-6">
            <div class="flex justify-between items-start mb-4">
                 <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(item.status)}">
                    <span class="material-symbols-rounded text-sm">${getStatusIcon(item.status)}</span>
                    ${item.status === 'pending' ? 'In Progress' : item.status}
                </span>
                <span class="text-xs font-medium text-slate-400">${date}</span>
            </div>
            
            <h2 class="text-2xl font-bold text-slate-900 mb-2">${item.title}</h2>
            
            <div class="flex items-center gap-2 mb-6">
                <span class="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200 capitalize">
                    <span class="material-symbols-rounded text-sm">category</span> ${item.category}
                </span>
            </div>
            </div>
        </div>

        <div class="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6 shadow-inner">
            <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Description</h4>
            <p class="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">${item.description}</p>
        </div>

        ${item.media && item.media.length > 0 ? `
        <div class="mb-6">
            <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Attachments</h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                ${item.media.map(f => f.type === 'image' ?
        `<a href="${f.url}" target="_blank" class="block group relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200 hover:shadow-md transition">
                        <img src="${f.url}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition"></div>
                     </a>` :
        `<video src="${f.url}" controls class="w-full rounded-xl border border-slate-200 bg-black"></video>`
    ).join('')}
            </div>
        </div>` : ''
        }

        ${renderResolution(item)} <!-- Re-use existing function -->
        `;

    // Update footer actions dynamically based on status
    const footer = document.getElementById('modal-footer');
    if (item.status === 'pending') {
        footer.innerHTML = `
            <button onclick="deleteComplaint('${item._id}'); closeModal();" class="px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-100 transition flex items-center gap-2 text-sm">
                <span class="material-symbols-rounded text-lg">delete</span> Delete Request
            </button>
            <button onclick="closeModal()" class="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition text-sm shadow-sm">Close</button>
        `;
    } else {
        footer.innerHTML = `<button onclick="closeModal()" class="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition text-sm shadow-lg shadow-slate-200">Close</button>`;
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal() {
    document.getElementById('complaint-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

function toggleCard(id, btn) {
    // Deprecated in favor of Modal, leaving empty or removing
}


function getStatusIcon(status) {
    if (status === 'resolved') return 'check_circle';
    if (status === 'rejected') return 'cancel';
    if (status === 'pending') return 'hourglass_top';
    return 'info';
}

function getCategoryIcon(cat) {
    if (cat === 'academic') return 'school';
    if (cat === 'mess') return 'restaurant';
    if (cat === 'hostel') return 'bed';
    if (cat === 'security') return 'security';
    return 'category'; // other
}

function getCategoryColor(cat) {
    if (cat === 'academic') return 'bg-blue-50 text-blue-600';
    if (cat === 'mess') return 'bg-orange-50 text-orange-600';
    if (cat === 'hostel') return 'bg-purple-50 text-purple-600';
    if (cat === 'security') return 'bg-red-50 text-red-600';
    return 'bg-slate-100 text-slate-600';
}

function getStatusColor(status) {
    if (status === 'resolved') return 'bg-emerald-100 text-emerald-700'; // Green
    if (status === 'rejected') return 'bg-red-100 text-red-700'; // Red
    if (status === 'pending') return 'bg-[#D1E5FF] text-[#0055D4]'; // Specific Blue from Screenshot
    return 'bg-slate-100 text-slate-600';
}

function renderMedia(media) {
    if (!media || media.length === 0) return '';
    return `<div class="flex gap-2 mb-4 overflow-x-auto pb-2">${media.map(f =>
        f.type === 'image' ?
            `<a href="${f.url}" target="_blank"><img src="${f.url}" class="h-24 w-24 object-cover rounded-xl border border-slate-200 hover:opacity-90 transition"></a>` :
            `<video src="${f.url}" controls class="h-24 w-auto object-cover rounded-xl border border-slate-200"></video>`
    ).join('')
        }</div>`;
}

function renderResolution(item) {
    if (!item.resolutionNotes) return '';
    return `
        <div class="bg-blue-50 p-5 rounded-xl border border-blue-100 text-sm mt-3 relative overflow-hidden">
        <div class="absolute top-0 right-0 p-2 opacity-10">
            <span class="material-symbols-rounded text-6xl text-blue-900">verified</span>
        </div>
        <div class="flex items-center gap-2 mb-2">
             <span class="material-symbols-rounded text-blue-600">verified_user</span>
             <p class="font-bold text-blue-800 text-xs uppercase tracking-wide">Official Resolution</p>
        </div>
        <p class="text-blue-900 leading-relaxed">${item.resolutionNotes}</p>
        ${item.resolutionProof && item.resolutionProof.length > 0 ?
            `<div class="mt-3 flex gap-2">${item.resolutionProof.map(f => `<a href="${f.url}" target="_blank" class="flex items-center gap-1 text-xs font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"><span class="material-symbols-rounded text-sm">attachment</span> View Proof</a>`).join('')}</div>`
            : ''
        }
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
