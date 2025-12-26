// =============================================================================
// MOBILE CONTEST WEBSITE - JAVASCRIPT FUNCTIONALITY
// =============================================================================

// Configuration
const ContestConfig = {
    // EmailJS Configuration - using same as portfolio
    emailjs: {
        publicKey: 'axBBGTPNeley1K35a',
        serviceId: 'service_1bucbwg',
        templateId: 'template_84in5b9',
        enabled: true
    },
    
    // Contest settings
    contest: {
        maxEntries: 1000,
        contestEndDate: '2025-12-31',
        organizerEmail: 'raghavsharma0411@gmail.com'
    },
    
    // File settings
    files: {
        csvBaseFilename: 'contest_entries'
    }
};

// Global variables
let contestEntries = [];
let isFirebaseReady = false;

// Firebase Database Functions
const FirebaseDB = {
    // Check if Firebase is available
    isReady() {
        return window.firebaseReady === true && 
               typeof window.firebaseDatabase !== 'undefined' && 
               window.firebaseDatabase !== null &&
               typeof window.firebaseRef !== 'undefined';
    },
    
    // Wait for Firebase to be ready
    async waitForFirebase(maxWaitTime = 5000) {
        return new Promise((resolve, reject) => {
            if (this.isReady()) {
                resolve(true);
                return;
            }
            
            const checkInterval = 100;
            const startTime = Date.now();
            
            const checkReady = () => {
                if (this.isReady()) {
                    console.log('🔥 Firebase is ready after waiting');
                    resolve(true);
                } else if (Date.now() - startTime > maxWaitTime) {
                    console.warn('🔥 Firebase wait timeout');
                    reject(new Error('Firebase wait timeout'));
                } else {
                    setTimeout(checkReady, checkInterval);
                }
            };
            
            // Also listen for the custom event
            const handleFirebaseReady = () => {
                console.log('🔥 Firebase ready event received');
                window.removeEventListener('firebaseReady', handleFirebaseReady);
                resolve(true);
            };
            window.addEventListener('firebaseReady', handleFirebaseReady);
            
            checkReady();
        });
    },
    
    // Save contest entry to Firebase
    async saveEntry(entryData) {
        try {
            // Wait for Firebase to be ready
            await this.waitForFirebase();
            
            if (!this.isReady()) {
                console.warn('🔥 Firebase not ready after waiting, skipping Firebase save');
                return false;
            }
            
            console.log('🔥 Attempting to save entry to Firebase...');
            
            const entriesRef = window.firebaseRef(window.firebaseDatabase, 'contest-entries');
            const newEntryRef = window.firebasePush(entriesRef);
            
            const firebaseData = {
                ...entryData,
                firebaseId: newEntryRef.key,
                createdAt: Date.now()
            };
            
            await window.firebaseSet(newEntryRef, firebaseData);
            
            console.log('🔥 Entry saved to Firebase successfully:', newEntryRef.key);
            return newEntryRef.key;
        } catch (error) {
            console.error('🔥 Error saving to Firebase:', error);
            console.error('🔥 Firebase error details:', error.message);
            return false;
        }
    },
    
    // Load all contest entries from Firebase
    async loadAllEntries() {
        try {
            // Wait for Firebase to be ready
            await this.waitForFirebase();
            
            if (!this.isReady()) {
                console.warn('🔥 Firebase not ready after waiting, loading from localStorage only');
                return [];
            }
            
            console.log('🔥 Attempting to load entries from Firebase...');
            
            const entriesRef = window.firebaseRef(window.firebaseDatabase, 'contest-entries');
            const snapshot = await window.firebaseGet(entriesRef);
            
            if (snapshot.exists()) {
                const firebaseData = snapshot.val();
                const entries = Object.values(firebaseData);
                console.log(`🔥 Loaded ${entries.length} entries from Firebase`);
                return entries;
            } else {
                console.log('🔥 No entries found in Firebase database');
                return [];
            }
        } catch (error) {
            console.error('🔥 Error loading from Firebase:', error);
            console.error('🔥 Firebase load error details:', error.message);
            return [];
        }
    },
    
    // Get entry count from Firebase
    async getEntryCount() {
        try {
            const entries = await this.loadAllEntries();
            return entries.length;
        } catch (error) {
            console.error('🔥 Error getting entry count:', error);
            return 0;
        }
    },
    
    // Clear all entries from Firebase (admin only)
    async clearAllEntries() {
        try {
            // Wait for Firebase to be ready
            await this.waitForFirebase();
            
            if (!this.isReady()) {
                console.warn('🔥 Firebase not ready after waiting');
                return false;
            }
            
            console.log('🔥 Attempting to clear all entries from Firebase...');
            
            const entriesRef = window.firebaseRef(window.firebaseDatabase, 'contest-entries');
            await window.firebaseRemove(entriesRef);
            console.log('🔥 All entries cleared from Firebase');
            return true;
        } catch (error) {
            console.error('🔥 Error clearing Firebase entries:', error);
            console.error('🔥 Firebase clear error details:', error.message);
            return false;
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 Contest website loaded successfully!');
    console.log('💾 Storage System: Using localStorage + Firebase as storage backends');
    console.log('📁 Local File: localStorage');
    console.log('🔥 Cloud File: Firebase Realtime Database');
    
    // Initialize EmailJS
    initEmailJS();
    
    // Initialize form handling
    initFormHandling();
    
    // Initialize success modal handling
    initSuccessModalHandling();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Add animations
    initAnimations();
    
    // Check Firebase status
    console.log('🔥 Checking Firebase status...');
    console.log('  - firebaseReady flag:', window.firebaseReady);
    console.log('  - firebaseDatabase:', typeof window.firebaseDatabase);
    console.log('  - firebaseRef:', typeof window.firebaseRef);
    
    // Load entries from localStorage and Firebase (with Firebase wait)
    initializeDataLoading();
    
    // Show current localStorage status
    console.log('🔍 LocalStorage Debug Info:');
    console.log('  - Browser localStorage available:', typeof(Storage) !== "undefined");
    console.log('  - Contest entries key exists:', localStorage.getItem('contestEntries') !== null);
    
    const currentData = localStorage.getItem('contestEntries');
    if (currentData) {
        const entries = JSON.parse(currentData);
        console.log(`  - Current entries count: ${entries.length}`);
    } else {
        console.log('  - No existing entries found');
    }
    
    // Debug: Check if success modal element exists
    const successModal = document.getElementById('successMessage');
    console.log('🎭 Success modal element on page load:', successModal);
    if (successModal) {
        console.log('✅ Success modal found and ready');
    } else {
        console.error('❌ Success modal element not found!');
    }
});

// Initialize data loading with Firebase waiting
async function initializeDataLoading() {
    try {
        console.log('📊 Initializing data loading...');
        
        // First try to wait for Firebase
        try {
            await FirebaseDB.waitForFirebase(3000); // 3 second timeout
            console.log('🔥 Firebase is ready, proceeding with full data loading');
        } catch (error) {
            console.warn('🔥 Firebase not ready within timeout, proceeding with localStorage only');
        }
        
        // Load entries from both sources
        await loadEntriesFromStorage();
        console.log('📊 Data loading completed successfully');
        
    } catch (error) {
        console.error('❌ Error during data initialization:', error);
        // Fallback to localStorage only
        try {
            const stored = localStorage.getItem('contestEntries');
            if (stored) {
                contestEntries = JSON.parse(stored);
                console.log(`📱 Fallback: Loaded ${contestEntries.length} entries from localStorage only`);
            }
        } catch (fallbackError) {
            console.error('❌ Even localStorage fallback failed:', fallbackError);
            contestEntries = [];
        }
    } finally {
        updateDownloadButton();
    }
}

// Initialize EmailJS
function initEmailJS() {
    if (!ContestConfig.emailjs.enabled) {
        console.warn('EmailJS is disabled in configuration');
        return;
    }
    
    try {
        if (typeof emailjs !== 'undefined') {
            emailjs.init(ContestConfig.emailjs.publicKey);
            console.log('EmailJS initialized successfully');
        } else {
            console.warn('EmailJS SDK not loaded. Email functionality will be limited.');
        }
    } catch (error) {
        console.error('EmailJS initialization failed:', error);
    }
}

// Initialize form handling
function initFormHandling() {
    const contestForm = document.getElementById('contestForm');
    const emailBtn = document.getElementById('emailBtn');
    const downloadCsvBtn = document.getElementById('downloadCsvBtn');
    
    if (contestForm) {
        contestForm.addEventListener('submit', handleFormSubmit);
    }
    
    if (emailBtn) {
        emailBtn.addEventListener('click', handleEmailSend);
    }
    
    // Download button (only available on admin page)
    if (downloadCsvBtn) {
        downloadCsvBtn.addEventListener('click', downloadCSVFile);
    }
    
    // Add real-time validation
    addRealTimeValidation();
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    console.log('📋 Form submitted!');
    
    // Show loading
    showLoading();
    
    try {
        // Get form data
        const formData = getFormData();
        console.log('📝 Form data:', formData);
        
        // Validate form
        if (!validateForm(formData)) {
            console.log('❌ Validation failed');
            hideLoading();
            return;
        }
        console.log('✅ Validation passed');
        
        // Save to persistent storage (simulating CSV file)
        saveEntryToFile(formData);
        console.log('💾 Data saved');
        
        // Hide loading first
        hideLoading();
        
        // Show success message - SIMPLE APPROACH
        console.log('🎉 Showing success message...');
        showSimpleSuccessMessage();
        
        // Update download button (admin only - hidden from customer view)
        updateDownloadButton();
        
    } catch (error) {
        console.error('❌ Form submission error:', error);
        showNotification('Failed to submit entry. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Get form data
function getFormData() {
    const form = document.getElementById('contestForm');
    const formData = new FormData(form);
    
    // Log form data for debugging
    console.log('Form data collected:');
    console.log('Address:', formData.get('address'));
    console.log('City:', formData.get('city'));
    console.log('State:', formData.get('state'));
    console.log('Country:', formData.get('country'));
    console.log('PIN Code:', formData.get('pincode'));
    
    return {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        mobile: formData.get('mobile'),
        email: formData.get('email'),
        mobileModel: formData.get('mobileModel'),
        imei: formData.get('imei'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        country: formData.get('country'),
        pincode: formData.get('pincode'),
        submissionDate: new Date().toISOString(),
        entryId: generateEntryId()
    };
}

// Generate unique entry ID
function generateEntryId() {
    return 'CE' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// Validate form data
function validateForm(data) {
    let isValid = true;
    const errors = {};
    
    // Required field validation
    const requiredFields = [
        'firstName', 'lastName', 'mobile', 'email', 'mobileModel', 
        'imei', 'address', 'city', 'state', 'country', 'pincode'
    ];
    
    requiredFields.forEach(field => {
        if (!data[field] || data[field].trim() === '') {
            errors[field] = 'This field is required';
            isValid = false;
        }
    });
    
    // Email validation
    if (data.email && !isValidEmail(data.email)) {
        errors.email = 'Please enter a valid email address';
        isValid = false;
    }
    
    // Mobile number validation (Indian format)
    if (data.mobile && !isValidMobile(data.mobile)) {
        errors.mobile = 'Mobile number must be exactly 10 digits starting with 6, 7, 8, or 9';
        isValid = false;
    }
    
    // IMEI validation
    if (data.imei && !isValidIMEI(data.imei)) {
        errors.imei = 'IMEI number must be exactly 15 digits';
        isValid = false;
    }
    
    // PIN code validation
    if (data.pincode && !isValidPincode(data.pincode)) {
        errors.pincode = 'PIN code must be exactly 6 digits';
        isValid = false;
    }
    
    // Additional validation for common mistakes
    if (data.city && data.city.toLowerCase().includes('road')) {
        errors.city = 'City field should contain city name, not street address';
        isValid = false;
    }
    
    // State validation removed since it's now a dropdown with predefined options
    
    if (data.country && data.country.toLowerCase() !== 'india' && ['maharashtra', 'karnataka', 'gujarat', 'tamil nadu'].includes(data.country.toLowerCase())) {
        errors.country = 'Country field should contain country name, not state name';
        isValid = false;
    }
    
    // Display errors
    displayValidationErrors(errors);
    
    return isValid;
}

// Validation helper functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidMobile(mobile) {
    // Remove all non-digit characters for validation
    const cleanMobile = mobile.replace(/\D/g, '');
    
    // Must be exactly 10 digits and start with 6, 7, 8, or 9 (Indian mobile format)
    const mobileRegex = /^[6-9]\d{9}$/;
    return cleanMobile.length === 10 && mobileRegex.test(cleanMobile);
}

function isValidIMEI(imei) {
    // Must be exactly 15 digits
    const cleanImei = imei.replace(/\D/g, '');
    return cleanImei.length === 15 && /^\d{15}$/.test(cleanImei);
}

function isValidPincode(pincode) {
    // Must be exactly 6 digits
    const cleanPincode = pincode.replace(/\D/g, '');
    return cleanPincode.length === 6 && /^\d{6}$/.test(cleanPincode);
}

// Display validation errors
function displayValidationErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.form-group').forEach(el => {
        el.classList.remove('error', 'success');
    });
    
    // Display new errors
    Object.keys(errors).forEach(field => {
        const formGroup = document.querySelector(`[name="${field}"]`)?.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');
            
            const errorEl = document.createElement('span');
            errorEl.className = 'error-message';
            errorEl.textContent = errors[field];
            formGroup.appendChild(errorEl);
        }
    });
    
    // Scroll to first error
    const firstError = document.querySelector('.form-group.error');
    if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Add real-time validation
function addRealTimeValidation() {
    const form = document.getElementById('contestForm');
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        const eventType = input.tagName.toLowerCase() === 'select' ? 'change' : 'input';
        input.addEventListener(eventType, function() {
            if (this.closest('.form-group').classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

// Validate individual field
function validateField(field) {
    const formGroup = field.closest('.form-group');
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Clear previous state
    formGroup.classList.remove('error', 'success');
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Required field check
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Specific field validation
    if (value) {
        switch (field.name) {
            case 'email':
                if (!isValidEmail(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'mobile':
                if (!isValidMobile(value)) {
                    isValid = false;
                    errorMessage = 'Mobile number must be exactly 10 digits starting with 6, 7, 8, or 9';
                }
                break;
            case 'imei':
                if (!isValidIMEI(value)) {
                    isValid = false;
                    errorMessage = 'IMEI number must be exactly 15 digits';
                }
                break;
            case 'pincode':
                if (!isValidPincode(value)) {
                    isValid = false;
                    errorMessage = 'PIN code must be exactly 6 digits';
                }
                break;
        }
    }
    
    // Apply validation state
    if (!isValid) {
        formGroup.classList.add('error');
        const errorEl = document.createElement('span');
        errorEl.className = 'error-message';
        errorEl.textContent = errorMessage;
        formGroup.appendChild(errorEl);
    } else if (value) {
        formGroup.classList.add('success');
    }
}

// Load entries from both localStorage and Firebase
async function loadEntriesFromStorage() {
    console.log('📁 Loading entries from storage...');
    
    // Load from localStorage first (fast)
    try {
        const stored = localStorage.getItem('contestEntries');
        if (stored) {
            contestEntries = JSON.parse(stored);
            console.log(`📱 Loaded ${contestEntries.length} entries from localStorage`);
        } else {
            contestEntries = [];
            console.log('📱 No entries found in localStorage');
        }
    } catch (error) {
        console.error('❌ Error loading from localStorage:', error);
        contestEntries = [];
    }
    
    // Load from Firebase (cloud data)
    try {
        const firebaseEntries = await FirebaseDB.loadAllEntries();
        if (firebaseEntries && firebaseEntries.length > 0) {
            console.log(`🔥 Loaded ${firebaseEntries.length} entries from Firebase`);
            
            // Merge Firebase entries with localStorage entries
            // Remove duplicates based on entryId
            const mergedEntries = [...contestEntries];
            
            firebaseEntries.forEach(firebaseEntry => {
                const existsInLocal = contestEntries.some(localEntry => 
                    localEntry.entryId === firebaseEntry.entryId
                );
                
                if (!existsInLocal) {
                    mergedEntries.push(firebaseEntry);
                    console.log('🔄 Added Firebase entry to local storage:', firebaseEntry.entryId);
                }
            });
            
            // Update contestEntries with merged data
            contestEntries = mergedEntries;
            
            // Update localStorage with merged data
            localStorage.setItem('contestEntries', JSON.stringify(contestEntries));
            
            console.log(`✅ Total entries after merge: ${contestEntries.length}`);
        } else {
            console.log('🔥 No entries found in Firebase');
        }
    } catch (error) {
        console.error('🔥 Error loading from Firebase:', error);
        console.log('📱 Using localStorage data as fallback');
    }
    
    // Sort entries by submission date (newest first)
    contestEntries.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
    
    console.log(`📊 Final total: ${contestEntries.length} entries loaded`);
    updateDownloadButton();
}

// Save entry to both localStorage and Firebase
async function saveEntryToFile(data) {
    // Add to entries array
    contestEntries.push(data);
    
    // Save to localStorage (backup storage)
    try {
        localStorage.setItem('contestEntries', JSON.stringify(contestEntries));
        console.log('✅ Entry saved to localStorage:', data);
        console.log(`📊 Total entries in localStorage: ${contestEntries.length}`);
        
        // Verify localStorage save
        const verification = localStorage.getItem('contestEntries');
        console.log('🔍 localStorage verification:', JSON.parse(verification).length, 'entries');
        
    } catch (error) {
        console.error('❌ Error saving entry to localStorage:', error);
        showNotification('Error saving data. Please try again.', 'error');
    }
    
    // Save to Firebase (cloud storage)
    try {
        const firebaseId = await FirebaseDB.saveEntry(data);
        if (firebaseId) {
            console.log('🔥 Entry saved to Firebase with ID:', firebaseId);
            
            // Update the entry with Firebase ID for future reference
            data.firebaseId = firebaseId;
            
            // Update localStorage with Firebase ID
            localStorage.setItem('contestEntries', JSON.stringify(contestEntries));
            
            showNotification('Data saved successfully! ✅', 'success');
        } else {
            console.warn('🔥 Firebase save failed, but localStorage backup successful');
            showNotification('Data saved successfully! ✅', 'success');
        }
    } catch (error) {
        console.error('🔥 Error saving to Firebase:', error);
        console.log('📱 Entry still saved to localStorage as backup');
        showNotification('Data saved successfully! ✅', 'success');
    }
}

// Update download button text with entry count (mainly for admin page)
function updateDownloadButton() {
    const downloadBtn = document.getElementById('downloadCsvBtn');
    const entryCounter = document.getElementById('entryCount');
    
    const count = contestEntries.length;
    
    // Update admin page download button
    if (downloadBtn) {
        const buttonText = count === 0 ? 
            '<i class="fas fa-download"></i> Download All Entries CSV (Empty)' : 
            `<i class="fas fa-download"></i> Download All Entries CSV (${count} ${count === 1 ? 'Entry' : 'Entries'})`;
        downloadBtn.innerHTML = buttonText;
        downloadBtn.disabled = false; // Always allow download
    }
    
    // Entry counter is now just a success message, no need to update count
}

// Handle email sending
async function handleEmailSend() {
    const currentEntry = contestEntries[contestEntries.length - 1];
    if (!currentEntry) {
        showNotification('No entry data found to send', 'error');
        return;
    }
    
    // Show loading
    const emailBtn = document.getElementById('emailBtn');
    const originalText = emailBtn.innerHTML;
    emailBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    emailBtn.disabled = true;
    
    try {
        if (typeof emailjs === 'undefined') {
            handleEmailFallback(currentEntry);
            return;
        }
        
        // Prepare email data
        const emailData = {
            title: 'Contest Entry Submission',
            name: `${currentEntry.firstName} ${currentEntry.lastName}`,
            time: new Date(currentEntry.submissionDate).toLocaleString(),
            subject: 'Mobile Purchase Contest Entry',
            from_name: `${currentEntry.firstName} ${currentEntry.lastName}`,
            from_email: currentEntry.email,
            message: formatEntryForEmail(currentEntry),
            email: currentEntry.email,
            to_email: ContestConfig.contest.organizerEmail
        };
        
        // Send email
        await emailjs.send(
            ContestConfig.emailjs.serviceId, 
            ContestConfig.emailjs.templateId, 
            emailData
        );
        
        showNotification('Contest entry sent successfully via email! 📧', 'success');
        
    } catch (error) {
        console.error('Email sending failed:', error);
        handleEmailFallback(currentEntry);
    } finally {
        // Reset button
        emailBtn.innerHTML = originalText;
        emailBtn.disabled = false;
    }
}

// Format entry data for email
function formatEntryForEmail(entry) {
    const submissionDate = new Date(entry.submissionDate);
    const formattedDate = formatDate(submissionDate);
    const formattedTime = formatTime(submissionDate);
    
    return `
Contest Entry Details:

Personal Information:
- Name: ${entry.firstName} ${entry.lastName}
- Mobile: ${entry.mobile}
- Email: ${entry.email}

Mobile Details:
- Model: ${entry.mobileModel}
- IMEI: ${entry.imei}

Address:
${entry.address}
${entry.city}, ${entry.state}
${entry.country} - ${entry.pincode}

Entry ID: ${entry.entryId}
Submission Date: ${formattedDate}
Submission Time: ${formattedTime}

Thank you for participating in our mobile purchase contest!
    `.trim();
}

// Handle email fallback
function handleEmailFallback(entry) {
    const subject = encodeURIComponent('Mobile Purchase Contest Entry');
    const body = encodeURIComponent(formatEntryForEmail(entry));
    const mailtoLink = `mailto:${ContestConfig.contest.organizerEmail}?subject=${subject}&body=${body}`;
    
    showNotificationWithMailto(
        'Unable to send email automatically. Click below to open your email client:',
        mailtoLink,
        'Send Contest Entry via Email'
    );
}

// Download CSV file from combined data (localStorage + Firebase)
async function downloadCSVFile() {
    try {
        console.log('📥 Starting CSV download process...');
        
        // Ensure we have the latest data from both sources
        await loadEntriesFromStorage();
        
        const allEntries = contestEntries || [];
        
        console.log(`📊 Found ${allEntries.length} total entries (localStorage + Firebase)`);
        console.log('📋 Entries data:', allEntries);
        
        // Generate CSV content
        const csvContent = generateCSV(allEntries);
        console.log('📄 Generated CSV content preview:', csvContent.substring(0, 200) + '...');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const filename = 'contest_entries.csv';
            
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the URL
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            console.log('✅ CSV download completed successfully');
            
            if (allEntries.length === 0) {
                showNotification('Downloaded empty contest_entries.csv file 📁', 'info');
            } else {
                showNotification(`Downloaded contest_entries.csv with ${allEntries.length} entries 📁`, 'success');
            }
        }
    } catch (error) {
        console.error('❌ CSV download error:', error);
        showNotification('Failed to download contest_entries.csv', 'error');
    }
}

// Format date as dd/mm/yyyy
function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Format time as HH:MM:SS
function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Generate CSV content
function generateCSV(entries) {
    const headers = [
        'Entry ID', 'First Name', 'Last Name', 'Mobile', 'Email',
        'Mobile Model', 'IMEI', 'Address', 'City', 'State',
        'Country', 'PIN Code', 'Date', 'Time'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    entries.forEach((entry, index) => {
        console.log(`Processing entry ${index + 1}:`, entry);
        
        // Format date and time separately
        const submissionDate = new Date(entry.submissionDate);
        const formattedDate = formatDate(submissionDate); // dd/mm/yyyy format
        const formattedTime = formatTime(submissionDate); // HH:MM:SS format
        
        // Helper function to escape CSV field if it contains commas, quotes, or newlines
        const escapeCSVField = (field) => {
            if (field == null) return '';
            const fieldStr = field.toString();
            if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n') || fieldStr.includes('\r')) {
                return `"${fieldStr.replace(/"/g, '""')}"`;
            }
            return fieldStr;
        };
        
        const row = [
            entry.entryId,
            escapeCSVField(entry.firstName),
            escapeCSVField(entry.lastName),
            entry.mobile,
            entry.email,
            escapeCSVField(entry.mobileModel),
            entry.imei,
            escapeCSVField(entry.address),
            escapeCSVField(entry.city),
            escapeCSVField(entry.state),
            escapeCSVField(entry.country),
            entry.pincode || '',
            formattedDate,
            formattedTime
        ];
        
        console.log('CSV row data:', row);
        csvContent += row.join(',') + '\n';
    });
    
    console.log('Final CSV content:', csvContent);
    return csvContent;
}

// Initialize success handling (simplified)
function initSuccessModalHandling() {
    console.log('🎭 Success message system ready');
    // Nothing complex needed for the simple approach
}

// Loading functions
function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        removeNotification(notification);
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        removeNotification(notification);
    });
}

function removeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Enhanced notification with mailto link
function showNotificationWithMailto(message, mailtoLink, linkText) {
    const notification = document.createElement('div');
    notification.className = 'notification notification-info';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-message">
                ${message}
                <br><br>
                <a href="${mailtoLink}" class="btn btn-primary" style="margin-top: 0.5rem;">
                    <i class="fas fa-envelope"></i> ${linkText}
                </a>
            </div>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove after longer time
    setTimeout(() => {
        removeNotification(notification);
    }, 10000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        removeNotification(notification);
    });
}

// Initialize smooth scrolling
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize animations
function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.prize-card, .rule-item, .form-container'
    );
    animateElements.forEach(element => {
        observer.observe(element);
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    showNotification('An unexpected error occurred. Please refresh the page.', 'error');
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // Escape key closes notifications
    if (e.key === 'Escape') {
        const notifications = document.querySelectorAll('.notification.show');
        notifications.forEach(notification => {
            removeNotification(notification);
        });
    }
});

// Debugging utilities
window.debugContestStorage = async function() {
    console.log('=== Contest Storage Debug ===');
    
    // Check localStorage
    const stored = localStorage.getItem('contestEntries');
    if (stored) {
        const localEntries = JSON.parse(stored);
        console.log(`📱 localStorage entries: ${localEntries.length}`);
        localEntries.forEach((entry, index) => {
            console.log(`  Local ${index + 1}. ${entry.firstName} ${entry.lastName} - ${entry.email} ${entry.firebaseId ? '(Firebase: ' + entry.firebaseId + ')' : '(Local only)'}`);
        });
    } else {
        console.log('📱 No entries found in localStorage');
    }
    
    // Check Firebase
    try {
        const firebaseEntries = await FirebaseDB.loadAllEntries();
        console.log(`🔥 Firebase entries: ${firebaseEntries.length}`);
        firebaseEntries.forEach((entry, index) => {
            console.log(`  Firebase ${index + 1}. ${entry.firstName} ${entry.lastName} - ${entry.email} (ID: ${entry.firebaseId || 'N/A'})`);
        });
    } catch (error) {
        console.log('🔥 Error loading Firebase entries:', error);
    }
    
    // Current merged data
    console.log(`📊 Current merged total: ${contestEntries.length}`);
    console.log('========================');
};

window.clearContestStorage = async function() {
    // Clear localStorage
    localStorage.removeItem('contestEntries');
    console.log('🗑️ localStorage contest storage cleared');
    
    // Clear Firebase
    try {
        const success = await FirebaseDB.clearAllEntries();
        if (success) {
            console.log('🔥 Firebase contest storage cleared');
            showNotification('All contest entries cleared from both local and cloud storage! 🗑️', 'success');
        } else {
            console.warn('🔥 Firebase clear failed, but localStorage cleared');
            showNotification('Local storage cleared (cloud clear failed)', 'warning');
        }
    } catch (error) {
        console.error('🔥 Error clearing Firebase:', error);
        showNotification('Local storage cleared (cloud clear failed)', 'warning');
    }
    
    // Reload page
    setTimeout(() => {
        location.reload();
    }, 1500);
};

console.log('🎯 Contest JavaScript loaded successfully!');
console.log('💡 Debug commands available:');
console.log('  - debugContestStorage() - Show all stored entries');
console.log('  - clearContestStorage() - Clear all entries and reload page');
console.log('  - testSuccessModal() - Test the success modal display');
console.log('  - testFirebaseConnection() - Test Firebase connection');
console.log('  - getFirebaseEntryCount() - Get entry count from Firebase');
console.log('  - testFirebaseSave() - Test saving a dummy entry to Firebase');

// Test function for debugging success modal
window.testSuccessModal = function() {
    console.log('🧪 Testing success message display...');
    showSimpleSuccessMessage();
};

// Firebase debug functions
window.testFirebaseConnection = async function() {
    console.log('🔥 Testing Firebase connection...');
    console.log('🔥 Firebase ready flag:', window.firebaseReady);
    console.log('🔥 Firebase functions available:');
    console.log('  - firebaseDatabase:', typeof window.firebaseDatabase);
    console.log('  - firebaseRef:', typeof window.firebaseRef);
    console.log('  - firebasePush:', typeof window.firebasePush);
    console.log('  - firebaseSet:', typeof window.firebaseSet);
    console.log('  - firebaseGet:', typeof window.firebaseGet);
    
    try {
        // Test Firebase ready check
        const isReady = FirebaseDB.isReady();
        console.log('🔥 FirebaseDB.isReady():', isReady);
        
        if (!isReady) {
            console.log('🔥 Waiting for Firebase to be ready...');
            await FirebaseDB.waitForFirebase(5000);
            console.log('🔥 Firebase is now ready after waiting');
        }
        
        // Test getting entry count
        const count = await FirebaseDB.getEntryCount();
        console.log(`🔥 Firebase connection successful! Entry count: ${count}`);
        showNotification(`Firebase connected! ${count} entries found 🔥`, 'success');
        
        return { success: true, entryCount: count };
    } catch (error) {
        console.error('🔥 Firebase connection failed:', error);
        console.error('🔥 Error details:', error.message);
        showNotification('Firebase connection failed ❌', 'error');
        return { success: false, error: error.message };
    }
};

window.getFirebaseEntryCount = async function() {
    console.log('🔥 Getting Firebase entry count...');
    try {
        const count = await FirebaseDB.getEntryCount();
        console.log(`🔥 Firebase entries: ${count}`);
        return count;
    } catch (error) {
        console.error('🔥 Error getting Firebase count:', error);
        return 0;
    }
};

window.testFirebaseSave = async function() {
    console.log('🧪 Testing Firebase save with dummy entry...');
    
    try {
        // Create a test entry
        const testEntry = {
            firstName: 'Test',
            lastName: 'User',
            mobile: '9876543210',
            email: 'test@example.com',
            mobileModel: 'Test Phone',
            imei: '123456789012345',
            address: 'Test Address',
            city: 'Test City',
            state: 'Maharashtra',
            country: 'India',
            pincode: '123456',
            submissionDate: new Date().toISOString(),
            entryId: 'TEST' + Date.now()
        };
        
        console.log('🔥 Test entry data:', testEntry);
        
        // Try to save it
        const firebaseId = await FirebaseDB.saveEntry(testEntry);
        
        if (firebaseId) {
            console.log('✅ Test Firebase save successful! Firebase ID:', firebaseId);
            showNotification(`Test Firebase save successful! ID: ${firebaseId} 🔥`, 'success');
            return { success: true, firebaseId };
        } else {
            console.error('❌ Test Firebase save failed');
            showNotification('Test Firebase save failed ❌', 'error');
            return { success: false };
        }
        
    } catch (error) {
        console.error('🔥 Error during test Firebase save:', error);
        showNotification('Test Firebase save error ❌', 'error');
        return { success: false, error: error.message };
    }
};

// Simple success message - replaces form content
function showSimpleSuccessMessage() {
    console.log('🎉 Showing simple success message');
    
    // Find the form container
    const formContainer = document.querySelector('.form-container');
    const contestForm = document.getElementById('contestForm');
    
    if (contestForm) {
        // Replace the form with success message
        contestForm.innerHTML = `
            <div class="success-celebration" style="text-align: center; padding: 40px 20px;">
                
                <!-- Big celebration emojis -->
                <div style="font-size: 5rem; margin-bottom: 20px; animation: bounce 1s infinite;">
                    🎉🎊✨
                </div>
                
                <!-- Main congratulations -->
                <h2 style="color: #667eea; font-size: 2.5rem; margin-bottom: 10px; font-weight: bold;">
                    CONGRATULATIONS!
                </h2>
                
                <h3 style="color: #f093fb; font-size: 1.5rem; margin-bottom: 30px;">
                    You're Now in the Contest!
                </h3>
                
                <!-- Success message -->
                <div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(240, 147, 251, 0.1)); 
                            padding: 30px; border-radius: 15px; margin: 30px 0; 
                            border-left: 5px solid #667eea;">
                    
                    <p style="font-size: 1.2rem; color: #1f2937; margin-bottom: 25px; line-height: 1.6;">
                        📱 Your mobile purchase contest entry has been <strong style="color: #667eea;">successfully submitted</strong>!
                    </p>
                    
                    <!-- Next steps -->
                    <h4 style="color: #667eea; font-size: 1.3rem; margin-bottom: 15px;">🏆 What's Next?</h4>
                    
                    <div style="text-align: left; max-width: 500px; margin: 0 auto;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; 
                                    padding: 15px; background: rgba(255,255,255,0.7); border-radius: 10px; 
                                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                            <span style="font-size: 1.5rem;">✅</span>
                            <span style="color: #1f2937; font-weight: 500;">Your entry is confirmed and recorded</span>
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; 
                                    padding: 15px; background: rgba(255,255,255,0.7); border-radius: 10px; 
                                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                            <span style="font-size: 1.5rem;">🎯</span>
                            <span style="color: #1f2937; font-weight: 500;">Contest results will be announced soon</span>
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 15px; 
                                    padding: 15px; background: rgba(255,255,255,0.7); border-radius: 10px; 
                                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                            <span style="font-size: 1.5rem;">📞</span>
                            <span style="color: #1f2937; font-weight: 500;">Winners will be contacted directly</span>
                        </div>
                    </div>
                </div>
                
                <!-- Best of luck section -->
                <div style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 140, 0, 0.2)); 
                            border-radius: 20px; padding: 30px; margin: 30px 0; 
                            border: 3px solid rgba(255, 215, 0, 0.4);">
                    
                    <h3 style="color: #f59e0b; font-size: 2rem; margin-bottom: 15px; font-weight: bold;">
                        🍀 BEST OF LUCK! 🍀
                    </h3>
                    
                    <p style="color: #1f2937; font-size: 1.1rem; margin-bottom: 20px; font-weight: 500;">
                        Stay tuned for the exciting results!
                    </p>
                    
                    <!-- Prize emojis -->
                    <div style="font-size: 2.5rem; margin-top: 15px;">
                        <span style="margin: 0 10px; animation: bounce 1s infinite; animation-delay: 0s;">🏆</span>
                        <span style="margin: 0 10px; animation: bounce 1s infinite; animation-delay: 0.2s;">💰</span>
                        <span style="margin: 0 10px; animation: bounce 1s infinite; animation-delay: 0.4s;">⌚</span>
                        <span style="margin: 0 10px; animation: bounce 1s infinite; animation-delay: 0.6s;">🎧</span>
                    </div>
                </div>
                
                <!-- Thank you message -->
                <div style="margin-top: 30px; padding: 20px; background: rgba(102, 126, 234, 0.1); 
                            border-radius: 10px;">
                    <p style="color: #667eea; font-size: 1rem; font-style: italic; font-weight: 500;">
                        <em>Thank you for participating in our mobile purchase contest!</em>
                    </p>
                </div>
                
            </div>
            
            <style>
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% {
                        transform: translateY(0);
                    }
                    40% {
                        transform: translateY(-20px);
                    }
                    60% {
                        transform: translateY(-10px);
                    }
                }
            </style>
        `;
        
        console.log('✅ Success message displayed in form container');
        
        // Scroll to the success message
        contestForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
    } else {
        console.error('❌ Contest form not found!');
    }
}
