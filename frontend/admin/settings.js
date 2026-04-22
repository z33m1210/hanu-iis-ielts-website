document.addEventListener('DOMContentLoaded', async () => {
    // RBAC Check
    const user = Auth.getUser();
    if (!user || user.role !== 'ADMIN') {
        window.location.href = '../sign-in/';
        return;
    }

    // 1. DOM Elements
    const platformNameInput = document.getElementById('platformName');
    const adminEmailInput = document.getElementById('adminEmail');
    const defaultLanguageSelect = document.getElementById('defaultLanguage');
    const maintenanceModeToggle = document.getElementById('maintenanceMode');
    const saveBtn = document.getElementById('saveSettingsBtn');

    // 2. Fetch Settings from Backend
    async function fetchSettings() {
        try {
            const data = await Auth.fetchWithAuth('/settings');
            if (data.success && data.settings) {
                const s = data.settings;
                platformNameInput.value = s.platformName || '';
                adminEmailInput.value = s.adminEmail || '';
                defaultLanguageSelect.value = s.defaultLanguage || 'English (US)';
                maintenanceModeToggle.checked = !!s.maintenanceMode;
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            // Optionally show an error toast
        }
    }

    // 3. Save Settings to Backend
    saveBtn.addEventListener('click', async () => {
        const payload = {
            platformName: platformNameInput.value,
            adminEmail: adminEmailInput.value,
            defaultLanguage: defaultLanguageSelect.value,
            maintenanceMode: maintenanceModeToggle.checked
        };

        try {
            // Disable button during save
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';

            const data = await Auth.fetchWithAuth('/settings', {
                method: 'PUT',
                body: JSON.stringify(payload)
            });

            if (data.success) {
                alert('Success: Platform settings have been updated.');
            }
        } catch (error) {
            alert('Error: Failed to save changes. ' + error.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Changes';
        }
    });

    // Initialize
    fetchSettings();
});
