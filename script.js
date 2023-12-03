let users = []; // This will hold the fetched users
let currentPage = 1;
const rowsPerPage = 10;
let filteredUsers = []; // New variable to hold filtered users
let isFiltered = false; // Flag to indicate if the users are filtered

// Fetch users from the API
function fetchUsers() {
    fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
    .then(response => response.json())
    .then(data => {
        users = data;
        displayUsers(currentPage);
    });
}
function handleSearchKeyUp(event) {
    // Check if the pressed key is 'Enter'
    if (event.keyCode === 13) {
        filterUsers();
    }
}
// Display users in the table
function displayUsers(page, usersSubset = users) {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = ''; // Clear current users

    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const usersToDisplay = usersSubset.slice(startIndex, endIndex);

    usersToDisplay.forEach(user => {
        const row = tableBody.insertRow();
        row.setAttribute('id', `row-${user.id}`);
        row.innerHTML = `
            <td><input type="checkbox" class="select-row"></td>
            <td>${user.id}</td>
            <td id="name-${user.id}">${user.name}</td>
            <td id="email-${user.id}">${user.email}</td>
            <td id="role-${user.id}">${user.role}</td>
            <td>
                <button onclick="editUser('${user.id}')">Edit</button>
                <button onclick="deleteUser('${user.id}')">Delete</button>
            </td>
        `;
        row.querySelector('.select-row').addEventListener('change', function() {
            if (this.checked) {
                row.classList.add('highlight-row'); // Add class to highlight row
            } else {
                row.classList.remove('highlight-row'); // Remove highlight class
            }
        });
    });
    updatePagination(page, usersSubset.length);
}
// Function to update pagination based on the current users subset
function updatePagination(currentPage, totalUsers) {
    const totalPages = Math.ceil(totalUsers / rowsPerPage);
    document.getElementById('currentPageDisplay').textContent = `Page ${currentPage}`;

    document.querySelector('#pagination button:first-child').disabled = currentPage === 1;
    document.querySelector('#pagination button:nth-child(2)').disabled = currentPage === 1;
    document.querySelector('#pagination button:last-child').disabled = currentPage === totalPages;
    document.querySelector('#pagination button:nth-last-child(2)').disabled = currentPage === totalPages;
}
function changePage(direction) {
    // Calculate the new page number
    const newPage = currentPage + direction;

    // Determine total pages based on whether filtering is applied
    const totalItems = isFiltered ? filteredUsers.length : users.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage);

    // Check if the new page number is within the range
    if (newPage > 0 && newPage <= totalPages) {
        currentPage = newPage;
        displayUsers(currentPage, isFiltered ? filteredUsers : users);
    }
}

function changedirectPage(direction) {
    // Determine total pages based on whether filtering is applied
    const totalItems = isFiltered ? filteredUsers.length : users.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage);

    if (direction === -1) {
        currentPage = 1;
    } else if (direction === 1) {
        currentPage = totalPages;
    }
    displayUsers(currentPage, isFiltered ? filteredUsers : users);
}

// Filter users based on search input
function filterUsers() {
    const searchText = document.getElementById('search-box').value.toLowerCase();
    console.log(searchText);
    filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchText) || 
        user.email.toLowerCase().includes(searchText) ||
        user.role.toLowerCase().includes(searchText)
    );
    console.log(filteredUsers);
    isFiltered = searchText.length > 0;
    // Update the display with filtered users
    displayUsers(1, isFiltered ? filteredUsers : users);
}
// Select or deselect all users
function toggleSelectAll(selectAllCheckbox) {
    const checkboxes = document.getElementsByClassName('select-row');
    for (const checkbox of checkboxes) {
        checkbox.checked = selectAllCheckbox.checked;

        // Update the row highlighting
        if (selectAllCheckbox.checked) {
            checkbox.closest('tr').classList.add('highlight-row');
        } else {
            checkbox.closest('tr').classList.remove('highlight-row');
        }
    }
}


// Delete selected users
function deleteSelected() {
    const selectedCheckboxes = document.querySelectorAll('.select-row:checked');
    selectedCheckboxes.forEach(checkbox => {
        const row = checkbox.parentElement.parentElement;
        const userId = row.children[1].textContent;
        deleteUser(userId);
    });

    // Deselect the select all checkbox
    const selectAllCheckbox = document.getElementById('select-all');
    selectAllCheckbox.checked = false;
}

// Delete a single user
function deleteUser(userId) {
    users = users.filter(user => user.id !== userId);
    if (isFiltered) {
        filteredUsers = filteredUsers.filter(user => user.id !== userId);
    }
    displayUsers(currentPage, isFiltered ? filteredUsers : users);
}

// Edit a user
function editUser(userId) {
    const user = users.find(user => user.id === userId);
    if (!user) return;

    const row = document.getElementById(`row-${userId}`);
    console.log(row);
    row.innerHTML = `
        <td><input type="checkbox" class="select-row"></td>
        <td>${user.id}</td>
        <td><input type="text" id="edit-name-${userId}" value="${user.name}"></td>
        <td><input type="email" id="edit-email-${userId}" value="${user.email}"></td>
        <td><input type="text" id="edit-role-${userId}" value="${user.role}"></td>
        <td>
            <button onclick="saveEdit('${userId}')">Save</button>
            <button onclick="cancelEdit('${userId}')">Cancel</button>
        </td>
    `;
}

function saveEdit(userId) {
    const updatedUser = {
        id: userId,
        name: document.getElementById(`edit-name-${userId}`).value,
        email: document.getElementById(`edit-email-${userId}`).value,
        role: document.getElementById(`edit-role-${userId}`).value
    };

    users = users.map(user => user.id === userId ? updatedUser : user);
    if (isFiltered) {
        filteredUsers = filteredUsers.map(user => user.id === userId ? updatedUser : user);
    }
    displayUsers(currentPage, isFiltered ? filteredUsers : users);
    filterUsers();
}

function cancelEdit(userId) {
    displayUsers(currentPage, isFiltered ? filteredUsers : users);
}
// Call fetchUsers on load
window.onload = fetchUsers;
