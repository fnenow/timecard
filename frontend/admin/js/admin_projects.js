document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) return;

    const projectsTableBody = document.getElementById('projectsTableBody');
    const projectForm = document.getElementById('projectForm');
    const formTitle = document.getElementById('formTitle');
    const projectIdInput = document.getElementById('projectId');
    const projectNameInput = document.getElementById('projectName');
    const projectDescriptionInput = document.getElementById('projectDescription');
    const projectIsActiveInput = document.getElementById('projectIsActive');
    const saveProjectBtn = document.getElementById('saveProjectBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const showAddProjectFormBtn = document.getElementById('showAddProjectFormBtn');
    const messageArea = document.getElementById('messageArea');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');

    const API_BASE_URL = '..'; // Relative to admin folder

    let editingProjectId = null;

    async function loadProjects() {
        projectsTableBody.innerHTML = '<tr><td colspan="4">Loading projects...</td></tr>';
        try {
            const response = await makeApiCall(`${API_BASE_URL}/api/projects`);
            // Adjust based on actual API response (e.g., if data is in response.data)
            const projects = response.data || response;

            if (projects && projects.message === 'Project.findAll called') { // Placeholder check
                renderProjects([{ id: 1, project_name: 'Alpha Mock', description: 'Mock project Alpha', is_active: true }, { id: 2, project_name: 'Beta Mock', description: 'Mock project Beta', is_active: false }]);
                return;
            }

            if (projects && Array.isArray(projects)) {
                renderProjects(projects);
            } else {
                projectsTableBody.innerHTML = '<tr><td colspan="4">No projects found.</td></tr>';
            }
        } catch (error) {
            showMessage(`Error loading projects: ${error.message}`, 'error');
            projectsTableBody.innerHTML = `<tr><td colspan="4">Error: ${error.message}</td></tr>`;
        }
    }

    function renderProjects(projects) {
        projectsTableBody.innerHTML = '';
        if (projects.length === 0) {
            projectsTableBody.innerHTML = '<tr><td colspan="4">No projects found. Add one!</td></tr>';
            return;
        }
        projects.forEach(project => {
            const row = projectsTableBody.insertRow();
            row.insertCell().textContent = project.project_name;
            row.insertCell().textContent = project.description || '-';
            row.insertCell().textContent = project.is_active ? 'Active' : 'Inactive';

            const actionsCell = row.insertCell();
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.onclick = () => populateFormForEdit(project);
            actionsCell.appendChild(editBtn);

            // Add delete button if needed:
            // const deleteBtn = document.createElement('button');
            // deleteBtn.textContent = 'Delete';
            // deleteBtn.classList.add('danger');
            // deleteBtn.onclick = () => deleteProject(project.id || project.project_id);
            // actionsCell.appendChild(deleteBtn);
        });
    }

    function populateFormForEdit(project) {
        editingProjectId = project.id || project.project_id; // Use the correct ID property
        formTitle.textContent = 'Edit Project';
        projectIdInput.value = editingProjectId;
        projectNameInput.value = project.project_name;
        projectDescriptionInput.value = project.description || '';
        projectIsActiveInput.checked = project.is_active;
        projectForm.style.display = 'block';
        showAddProjectFormBtn.style.display = 'none';
        cancelEditBtn.style.display = 'inline-block';
        saveProjectBtn.textContent = 'Update Project';
    }

    function resetForm() {
        editingProjectId = null;
        projectForm.reset();
        formTitle.textContent = 'Add New Project';
        projectIdInput.value = '';
        projectIsActiveInput.checked = true; // Default for new
        projectForm.style.display = 'none';
        showAddProjectFormBtn.style.display = 'inline-block';
        cancelEditBtn.style.display = 'none';
        saveProjectBtn.textContent = 'Save Project';
    }

    showAddProjectFormBtn.addEventListener('click', () => {
        resetForm();
        projectForm.style.display = 'block';
        showAddProjectFormBtn.style.display = 'none';
        cancelEditBtn.style.display = 'inline-block'; // Show cancel when adding too
    });

    cancelEditBtn.addEventListener('click', resetForm);

    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const projectData = {
            project_name: projectNameInput.value,
            description: projectDescriptionInput.value,
            is_active: projectIsActiveInput.checked
        };

        if (!projectData.project_name) {
            showMessage('Project name is required.', 'error');
            return;
        }

        try {
            if (editingProjectId) {
                await makeApiCall(`${API_BASE_URL}/api/projects/${editingProjectId}`, 'PUT', projectData);
                showMessage('Project updated successfully!', 'success');
            } else {
                await makeApiCall(`${API_BASE_URL}/api/projects`, 'POST', projectData);
                showMessage('Project added successfully!', 'success');
            }
            resetForm();
            loadProjects();
        } catch (error) {
            showMessage(`Error saving project: ${error.message}`, 'error');
        }
    });

    // async function deleteProject(id) {
    //     if (!confirm(`Are you sure you want to delete project ID ${id}? This might affect existing time entries.`)) return;
    //     try {
    //         await makeApiCall(`${API_BASE_URL}/api/projects/${id}`, 'DELETE');
    //         showMessage('Project deleted successfully.', 'success');
    //         loadProjects();
    //     } catch (error) {
    //         showMessage(`Error deleting project: ${error.message}`, 'error');
    //     }
    // }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            adminLogout();
        });
    }

    function showMessage(msg, type = 'info') {
        if (messageArea) {
            messageArea.textContent = msg;
            messageArea.className = `message ${type}`;
            messageArea.style.display = 'block';
            setTimeout(() => { messageArea.style.display = 'none'; }, 3000);
        }
    }

    loadProjects();
});