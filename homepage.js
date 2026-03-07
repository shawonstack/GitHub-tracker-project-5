// ==========================================
//  GitHub Issues Tracker - script.js
// ==========================================

const API_ALL = 'https://phi-lab-server.vercel.app/api/v1/lab/issues';
const API_SINGLE = 'https://phi-lab-server.vercel.app/api/v1/lab/issue/';
const API_SEARCH =
  'https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=';

let allIssues = [];
let currentFilter = 'all';

// ─── Fetch all issues on page load ───────────────────────────────────────────
async function fetchIssues() {
  showLoader(true);
  try {
    const res = await fetch(API_ALL);
    const data = await res.json();
    allIssues = data.data || data || [];
    renderIssues(allIssues);
  } catch (err) {
    console.error('Error fetching issues:', err);
  } finally {
    showLoader(false);
  }
}

// ─── Loader toggle ────────────────────────────────────────────────────────────
function showLoader(show) {
  document.getElementById('loader').classList.toggle('hidden', !show);
  document.getElementById('issuesGrid').classList.toggle('hidden', show);
}

// ─── Priority badge class ─────────────────────────────────────────────────────
function getPriorityClass(priority) {
  if (!priority) return 'priority-low';
  const p = priority.toLowerCase();
  if (p === 'high') return 'priority-high';
  if (p === 'medium') return 'priority-medium';
  return 'priority-low';
}

// ─── Label badge class ────────────────────────────────────────────────────────
function getLabelClass(label) {
  if (!label) return 'label-default';
  const l = label.toLowerCase();
  if (l.includes('bug')) return 'label-bug';
  if (l.includes('enhancement')) return 'label-enhancement';
  if (l.includes('help')) return 'label-help';
  return 'label-default';
}

// ─── Label icon ───────────────────────────────────────────────────────────────
function getLabelIcon(label) {
  if (!label) return '<i class="fa-solid fa-life-ring"></i>';
  const l = label.toLowerCase();
  if (l.includes('bug')) return '<i class="fa-solid fa-bug"></i>';
  return '<i class="fa-solid fa-life-ring"></i>';
}

// ─── Format date ──────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Render issues grid ───────────────────────────────────────────────────────
function renderIssues(issues) {
  const grid = document.getElementById('issuesGrid');
  const noResults = document.getElementById('noResults');

  document.getElementById('issueCount').textContent = `${issues.length} Issues`;

  if (issues.length === 0) {
    grid.innerHTML = '';
    grid.classList.add('hidden');
    noResults.classList.remove('hidden');
    return;
  }

  noResults.classList.add('hidden');
  grid.classList.remove('hidden');

  grid.innerHTML = issues
    .map(issue => {
      const isOpen = issue.status?.toLowerCase() === 'open';
      const borderClass = isOpen ? 'card-open' : 'card-closed';
      const priorityClass = getPriorityClass(issue.priority);
      const labels = Array.isArray(issue.labels)
        ? issue.labels
        : issue.label
          ? [issue.label]
          : [];

      const labelsHTML = labels
        .map(l => {
          return `<span class="text-xs px-2 py-0.5 rounded-full font-semibold ${getLabelClass(l)}">${getLabelIcon(l)} ${l}</span>`;
        })
        .join('');

      const statusIcon = isOpen
        ? `<img src="./assets/Open-Status.png" class="w-5 h-5" alt="open">`
        : `<img src="./assets/Closed- Status .png" class="w-5 h-5" alt="closed">`;

      return `
      <div class="bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow ${borderClass} flex flex-col gap-2" onclick="openModal(${issue.id})">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1">${statusIcon}</div>
          <span class="text-xs px-2 py-0.5 rounded-full font-bold ${priorityClass}">${issue.priority?.toUpperCase() || 'N/A'}</span>
        </div>
        <h3 class="font-bold text-gray-800 text-sm leading-snug">${issue.title || 'No Title'}</h3>
        <p class="text-gray-400 text-xs leading-relaxed line-clamp-2">${issue.description || ''}</p>
        <div class="flex flex-wrap gap-1 mt-1">${labelsHTML}</div>
        <div class="mt-auto pt-2 border-t border-gray-100 text-xs text-gray-400">
          <p>#${issue.id} by ${issue.author || 'unknown'}</p>
          <p>${formatDate(issue.created_at || issue.createdAt)}</p>
        </div>
      </div>
    `;
    })
    .join('');
}

// ─── Tab filter ───────────────────────────────────────────────────────────────
function filterIssues(type) {
  currentFilter = type;

  const baseClass =
    'bg-white text-gray-600 px-5 py-2 rounded-lg text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-all';
  const activeClass =
    'tab-active px-5 py-2 rounded-lg text-sm font-semibold transition-all';

  ['tabAll', 'tabOpen', 'tabClosed'].forEach(id => {
    document.getElementById(id).className = baseClass;
  });

  const activeMap = { all: 'tabAll', open: 'tabOpen', closed: 'tabClosed' };
  document.getElementById(activeMap[type]).className = activeClass;

  const filtered =
    type === 'all'
      ? allIssues
      : allIssues.filter(i => i.status?.toLowerCase() === type);

  renderIssues(filtered);
}

// ─── Open modal with single issue ─────────────────────────────────────────────
async function openModal(id) {
  const modal = document.getElementById('issueModal');
  document.getElementById('modalLoader').classList.remove('hidden');
  document.getElementById('modalContent').classList.add('hidden');
  modal.showModal();

  try {
    const res = await fetch(API_SINGLE + id);
    const data = await res.json();
    const issue = data.data || data;

    document.getElementById('modalTitle').textContent =
      issue.title || 'No Title';

    const isOpen = issue.status?.toLowerCase() === 'open';
    const statusEl = document.getElementById('modalStatus');
    statusEl.textContent = isOpen ? 'Opened' : 'Closed';
    statusEl.className = `badge px-3 py-1 rounded-full text-xs font-semibold text-white ${isOpen ? 'badge-success' : 'badge-secondary'}`;

    document.getElementById('modalAuthor').textContent =
      `Opened by ${issue.author || 'unknown'}`;
    document.getElementById('modalDate').textContent = formatDate(
      issue.created_at || issue.createdAt,
    );
    document.getElementById('modalDescription').textContent =
      issue.description || '';
    document.getElementById('modalAssignee').textContent =
      issue.assignee || issue.author || 'N/A';

    const priorityEl = document.getElementById('modalPriority');
    priorityEl.textContent = issue.priority?.toUpperCase() || 'N/A';
    priorityEl.className = `badge px-3 py-1 text-xs font-bold ${getPriorityClass(issue.priority)}`;

    const labels = Array.isArray(issue.labels)
      ? issue.labels
      : issue.label
        ? [issue.label]
        : [];

    document.getElementById('modalLabels').innerHTML = labels
      .map(l => {
        return `<span class="text-xs px-2 py-1 rounded-full font-semibold ${getLabelClass(l)}">${getLabelIcon(l)} ${l}</span>`;
      })
      .join('');

    document.getElementById('modalLoader').classList.add('hidden');
    document.getElementById('modalContent').classList.remove('hidden');
  } catch (err) {
    console.error('Error fetching issue details:', err);
  }
}

// ─── Search ───────────────────────────────────────────────────────────────────
async function doSearch() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) {
    renderIssues(allIssues);
    return;
  }
  showLoader(true);
  try {
    const res = await fetch(API_SEARCH + encodeURIComponent(q));
    const data = await res.json();
    const results = data.data || data || [];
    renderIssues(results);
  } catch (err) {
    console.error('Search error:', err);
  } finally {
    showLoader(false);
  }
}

// ─── Event Listeners ──────────────────────────────────────────────────────────
document.getElementById('searchBtn').addEventListener('click', doSearch);
document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

// ─── Init ─────────────────────────────────────────────────────────────────────
fetchIssues();
