// /**
//  * google.js - Google Identity & Google Drive Integration for SugarTrack
//  */
// const GOOGLE_CONFIG = {
//     clientId: '884057504637-lo16damkhhb55v1hmmmhrl9m2dm0p5rr.apps.googleusercontent.com', // Replace with your Client ID from Google Cloud Console
//     scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile'
// };

// const SugarTrackGoogle = {
//     tokenClient: null,
//     accessToken: null,
//     userProfile: null,

//     // 1. Initialize Google Identity Services
//     init() {
//         this.restoreSavedUser();

//         // Check if GIS script is loaded
//         if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
//             this.setupTokenClient();
//         } else {
//             window.addEventListener('load', () => {
//                 if (typeof google !== 'undefined' && google.accounts) {
//                     this.setupTokenClient();
//                 }
//             });
//         }
//     },

//     setupTokenClient() {
//         this.tokenClient = google.accounts.oauth2.initTokenClient({
//             client_id: GOOGLE_CONFIG.clientId,
//             scope: GOOGLE_CONFIG.scopes,
//             callback: async (tokenResponse) => {
//                 if (tokenResponse && tokenResponse.access_token) {
//                     this.accessToken = tokenResponse.access_token;
//                     sessionStorage.setItem('st_g_token', this.accessToken);
//                     await this.fetchUserInfo();
//                     this.updateUI();
//                 }
//             }
//         });
//     },

//     // 2. Auth Actions
//     // signIn() {
//     //     if (!this.tokenClient) {
//     //         console.error('Google Token Client not ready yet.');
//     //         return;
//     //     }
//     //     this.tokenClient.requestAccessToken({ prompt: 'consent' });
//     // },
// // 2. Auth Actions
//     signIn() {
//         // Prevent opening the popup if already connected
//         if (this.accessToken) {
//             alert('You are already connected to Google Drive.');
//             return;
//         }

//         if (!this.tokenClient) {
//             console.error('Google Token Client not ready yet.');
//             return;
//         }
//         this.tokenClient.requestAccessToken({ prompt: 'consent' });
//     },
//     signOut() {
//         if (this.accessToken) {
//             google.accounts.oauth2.revoke(this.accessToken, () => {
//                 console.log('Access token revoked.');
//             });
//         }
//         this.accessToken = null;
//         this.userProfile = null;
//         sessionStorage.removeItem('st_g_token');
//         localStorage.removeItem('st_user_avatar');
//         localStorage.removeItem('st_google_user');
//         this.updateUI();
//     },

//     // 3. Fetch User Profile & Avatar
//     async fetchUserInfo() {
//         try {
//             const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
//                 headers: { Authorization: `Bearer ${this.accessToken}` }
//             });
//             const info = await res.json();
//             this.userProfile = info;

//             if (info.picture) {
//                 localStorage.setItem('st_user_avatar', info.picture);
//             }
//             if (info.name) {
//                 localStorage.setItem('st_google_user', info.name);
//             }
//             return info;
//         } catch (err) {
//             console.error('Failed to retrieve user profile:', err);
//         }
//     },

//     restoreSavedUser() {
//         this.accessToken = sessionStorage.getItem('st_g_token');
//         const savedPic = localStorage.getItem('st_user_avatar');
//         const savedName = localStorage.getItem('st_google_user');
//         if (savedPic || savedName) {
//             this.userProfile = { picture: savedPic, name: savedName };
//             this.updateUI();
//         }
//     },

//     // // 4. Update Profile & Sidebar Images
//     // updateUI() {
//     //     const avatarUrl = localStorage.getItem('st_user_avatar');
//     //     const googleName = localStorage.getItem('st_google_user');

//     //     // Target all sidebar avatar containers and profile card avatar containers
//     //     const avatarTargets = document.querySelectorAll('.profile-avatar, .user-avatar-target');
//     //     avatarTargets.forEach(el => {
//     //         if (avatarUrl) {
//     //             el.innerHTML = `<img src="${avatarUrl}" alt="Profile Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;">`;
//     //         } else {
//     //             el.innerHTML = `<i class="ph ph-user"></i>`;
//     //         }
//     //     });

//     //     // Update Google Button label / status if present
//     //     const googleBtn = document.getElementById('googleSyncBtn');
//     //     if (googleBtn) {
//     //         if (this.accessToken || avatarUrl) {
//     //             googleBtn.innerHTML = `<i class="ph ph-check-circle" style="color: #10b981;"></i> Connected`;
//     //             googleBtn.title = `Connected as ${googleName || 'Google User'}`;
//     //         } else {
//     //             googleBtn.innerHTML = `<i class="ph ph-google-logo"></i> Connect Drive`;
//     //         }
//     //     }
//     // },
// // // 4. Update Profile & Sidebar Images
// //     updateUI() {
// //         const avatarUrl = localStorage.getItem('st_user_avatar');
// //         const googleName = localStorage.getItem('st_google_user');
// //         const localName = localStorage.getItem('userName');
        
// //         // Use Google Name if connected, otherwise use local name, fallback to 'Account'
// //         const displayName = googleName || localName || 'Account';

// //         // Target all sidebar avatar containers and profile card avatar containers
// //         const avatarTargets = document.querySelectorAll('.profile-avatar, .user-avatar-target');
// //         avatarTargets.forEach(el => {
// //             if (avatarUrl) {
// //                 el.innerHTML = `<img src="${avatarUrl}" alt="Profile Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;">`;
// //             } else {
// //                 el.innerHTML = `<i class="ph ph-user"></i>`;
// //             }
            
// //             // Add the hover tooltip to the avatar
// //             el.title = displayName; 
// //         });

// //         // Update the sidebar text
// //         const sidebarNameEl = document.getElementById('sidebarProfileName');
// //         if (sidebarNameEl) {
// //             sidebarNameEl.textContent = displayName;
// //         }

// //         // Add the hover tooltip to the entire sidebar profile wrapper (for when sidebar is collapsed)
// //         const sidebarWrapper = document.querySelector('.sidebar-profile-wrapper');
// //         if (sidebarWrapper) {
// //             sidebarWrapper.title = displayName;
// //         }

// //         // Update Google Button label / status if present
// //         const googleBtn = document.getElementById('googleSyncBtn');
// //         if (googleBtn) {
// //             if (this.accessToken || avatarUrl) {
// //                 googleBtn.innerHTML = `<i class="ph ph-check-circle" style="color: #10b981;"></i> Connected`;
// //                 googleBtn.title = `Connected as ${googleName || 'Google User'}`;
// //             } else {
// //                 googleBtn.innerHTML = `<i class="ph ph-google-logo"></i> Connect Drive`;
// //             }
// //         }
// //     },


// // // 4. Update Profile, Sidebar Images & Buttons
// //     updateUI() {
// //         const avatarUrl = localStorage.getItem('st_user_avatar');
// //         const googleName = localStorage.getItem('st_google_user');
// //         const localName = localStorage.getItem('userName');
        
// //         // Use Google Name if connected, otherwise use local name, fallback to 'Account'
// //         const displayName = googleName || localName || 'Account';
// //         const isConnected = !!(this.accessToken || avatarUrl);

// //         // Update all Avatars
// //         const avatarTargets = document.querySelectorAll('.profile-avatar, .user-avatar-target');
// //         avatarTargets.forEach(el => {
// //             if (avatarUrl) {
// //                 el.innerHTML = `<img src="${avatarUrl}" alt="Profile Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;">`;
// //             } else {
// //                 el.innerHTML = `<i class="ph ph-user"></i>`;
// //             }
// //             el.title = displayName; 
// //         });

// //         // Update the sidebar profile text
// //         const sidebarNameEl = document.getElementById('sidebarProfileName');
// //         if (sidebarNameEl) sidebarNameEl.textContent = displayName;

// //         const sidebarWrapper = document.querySelector('.sidebar-profile-wrapper');
// //         if (sidebarWrapper) sidebarWrapper.title = displayName;

// //         // --- BUTTON STATE MANAGEMENT ---

// //         // 1. Header Button (googleSyncBtn)
// //         const headerBtn = document.getElementById('googleSyncBtn');
// //         if (headerBtn) {
// //             if (isConnected) {
// //                 headerBtn.innerHTML = `<i class="ph ph-check-circle" style="color: #10b981;"></i> Connected`;
// //                 headerBtn.title = `Connected as ${googleName || 'Google User'}`;
// //             } else {
// //                 headerBtn.innerHTML = `<i class="ph ph-google-logo"></i> Connect Drive`;
// //                 headerBtn.title = `Connect to Google Drive`;
// //             }
// //         }

// //         // 2. Sidebar Button (sidebarGoogleBtn)
// //         const sidebarBtn = document.getElementById('sidebarGoogleBtn');
// //         if (sidebarBtn) {
// //             if (isConnected) {
// //                 sidebarBtn.textContent = 'Drive Connected';
// //                 sidebarBtn.style.color = '#10b981';
// //             } else {
// //                 sidebarBtn.textContent = 'Connect Drive';
// //                 sidebarBtn.style.color = 'var(--accent-blue)';
// //             }
// //         }

// //         // 3. Settings Card Button (settingsGoogleBtn)
// //         const settingsBtn = document.getElementById('settingsGoogleBtn');
// //         if (settingsBtn) {
// //             if (isConnected) {
// //                 // If connected, turn the settings button into a "Disconnect" action
// //                 settingsBtn.innerHTML = `<i class="ph-fill ph-check-circle" style="color: #10b981;"></i> Connected (Sign Out)`;
// //                 settingsBtn.onclick = () => this.signOut();
// //                 settingsBtn.title = `Click to Disconnect`;
// //             } else {
// //                 // If disconnected, allow it to sign in
// //                 settingsBtn.innerHTML = `<i class="ph ph-google-logo"></i> Connect Drive`;
// //                 settingsBtn.onclick = () => this.signIn();
// //                 settingsBtn.title = `Connect to Google Drive`;
// //             }
// //         }
// //     },








// // 4. Update Profile, Sidebar Images & Buttons
//     updateUI() {
//         const avatarUrl = localStorage.getItem('st_user_avatar');
//         const googleName = localStorage.getItem('st_google_user');
//         const localName = localStorage.getItem('userName');
        
//         const displayName = googleName || localName || 'Account';
//         const isConnected = !!(this.accessToken || avatarUrl);

//         // --- UPDATE AVATARS ---
//         const avatarTargets = document.querySelectorAll('.profile-avatar, .user-avatar-target');
//         avatarTargets.forEach(el => {
//             if (avatarUrl) {
//                 // If the element is the mobile header button, ensure it stays round without a border
//                 if (el.id === 'mobileDriveBtn') {
//                     el.style.borderColor = 'var(--border-color)';
//                 }
//                 el.innerHTML = `<img src="${avatarUrl}" alt="Profile Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;">`;
//             } else {
//                 // Reset icons based on location
//                 if (el.id === 'mobileDriveBtn') {
//                     el.style.borderColor = 'transparent';
//                     el.innerHTML = `<i class="ph ph-google-logo"></i>`;
//                 } else {
//                     el.innerHTML = `<i class="ph ph-user"></i>`;
//                 }
//             }
//             el.title = displayName; 
//         });

//         // --- UPDATE SIDEBAR TEXT ---
//         const sidebarNameEl = document.getElementById('sidebarProfileName');
//         if (sidebarNameEl) sidebarNameEl.textContent = displayName;

//         const sidebarWrapper = document.querySelector('.sidebar-profile-wrapper');
//         if (sidebarWrapper) sidebarWrapper.title = displayName;


//         // --- UPDATE DESKTOP BUTTONS ---
//         const headerBtn = document.getElementById('googleSyncBtn');
//         if (headerBtn) {
//             if (isConnected) {
//                 headerBtn.innerHTML = `<i class="ph ph-check-circle" style="color: #10b981;"></i> Connected`;
//                 headerBtn.title = `Connected as ${googleName || 'Google User'}`;
//             } else {
//                 headerBtn.innerHTML = `<i class="ph ph-google-logo"></i> Connect Drive`;
//                 headerBtn.title = `Connect to Google Drive`;
//             }
//         }

//         const sidebarBtn = document.getElementById('sidebarGoogleBtn');
//         if (sidebarBtn) {
//             if (isConnected) {
//                 sidebarBtn.textContent = 'Drive Connected';
//                 sidebarBtn.style.color = '#10b981';
//             } else {
//                 sidebarBtn.textContent = 'Connect Drive';
//                 sidebarBtn.style.color = 'var(--accent-blue)';
//             }
//         }

//         const settingsBtn = document.getElementById('settingsGoogleBtn');
//         if (settingsBtn) {
//             if (isConnected) {
//                 settingsBtn.innerHTML = `<i class="ph-fill ph-check-circle" style="color: #10b981;"></i> Connected (Sign Out)`;
//                 settingsBtn.onclick = () => this.signOut();
//                 settingsBtn.title = `Click to Disconnect`;
//             } else {
//                 settingsBtn.innerHTML = `<i class="ph ph-google-logo"></i> Connect Drive`;
//                 settingsBtn.onclick = () => this.signIn();
//                 settingsBtn.title = `Connect to Google Drive`;
//             }
//         }

//         // --- UPDATE MOBILE MENU DROPDOWN ---
//         const mobileDriveStatus = document.getElementById('mobileDriveStatus');
//         const mobileDriveAuthBtn = document.getElementById('mobileDriveAuthBtn');
        
//         if (mobileDriveStatus && mobileDriveAuthBtn) {
//             if (isConnected) {
//                 mobileDriveStatus.innerHTML = `<i class="ph-fill ph-check-circle" style="color: #10b981;"></i> ${googleName || 'Connected'}`;
//                 mobileDriveAuthBtn.innerHTML = `<i class="ph ph-sign-out"></i> Disconnect`;
//                 mobileDriveAuthBtn.onclick = () => { 
//                     this.signOut(); 
//                     document.getElementById('mobileDriveMenu').classList.remove('show');
//                     return false; 
//                 };
//             } else {
//                 mobileDriveStatus.innerHTML = `<i class="ph ph-warning-circle" style="color: #eab308;"></i> Not Connected`;
//                 mobileDriveAuthBtn.innerHTML = `<i class="ph ph-link"></i> Connect`;
//                 mobileDriveAuthBtn.onclick = () => { 
//                     this.signIn(); 
//                     document.getElementById('mobileDriveMenu').classList.remove('show');
//                     return false; 
//                 };
//             }
//         }
//     },










//     // 5. Google Drive: Save Data
//     async saveToDrive() {
//         if (!this.accessToken) {
//             alert('Please connect your Google account first.');
//             this.signIn();
//             return;
//         }

//         const readings = localStorage.getItem('glucoseReadings') || '[]';
//         const fileContent = JSON.stringify(JSON.parse(readings), null, 2);
//         const fileName = 'sugartrack_data.json';

//         try {
//             // Check if file already exists
//             const searchRes = await fetch(
//                 `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and trashed=false`,
//                 { headers: { Authorization: `Bearer ${this.accessToken}` } }
//             );
//             const searchData = await searchRes.json();
//             const existingFile = searchData.files && searchData.files[0];

//             let uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
//             let method = 'POST';

//             if (existingFile) {
//                 uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`;
//                 method = 'PATCH';
//             }

//             const metadata = {
//                 name: fileName,
//                 mimeType: 'application/json'
//             };

//             const boundary = 'foo_bar_baz';
//             const delimiter = `\r\n--${boundary}\r\n`;
//             const closeDelimiter = `\r\n--${boundary}--`;

//             const multipartRequestBody =
//                 delimiter +
//                 'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
//                 JSON.stringify(metadata) +
//                 delimiter +
//                 'Content-Type: application/json\r\n\r\n' +
//                 fileContent +
//                 closeDelimiter;

//             const res = await fetch(uploadUrl, {
//                 method: method,
//                 headers: {
//                     Authorization: `Bearer ${this.accessToken}`,
//                     'Content-Type': `multipart/related; boundary=${boundary}`
//                 },
//                 body: multipartRequestBody
//             });

//             if (res.ok) {
//                 alert('Data successfully saved to Google Drive!');
//             } else {
//                 const err = await res.json();
//                 console.error(err);
//                 alert('Error uploading to Google Drive.');
//             }
//         } catch (e) {
//             console.error('Error during Google Drive save:', e);
//             alert('Failed to connect to Google Drive.');
//         }
//     },

//     // 6. Google Drive: Load/Sync Data
//     async loadFromDrive() {
//         if (!this.accessToken) {
//             alert('Please connect your Google account first.');
//             this.signIn();
//             return;
//         }

//         const fileName = 'sugartrack_data.json';
//         try {
//             const searchRes = await fetch(
//                 `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and trashed=false`,
//                 { headers: { Authorization: `Bearer ${this.accessToken}` } }
//             );
//             const searchData = await searchRes.json();

//             if (!searchData.files || searchData.files.length === 0) {
//                 alert('No backup file found in your Google Drive.');
//                 return;
//             }

//             const fileId = searchData.files[0].id;
//             const fileRes = await fetch(
//                 `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
//                 { headers: { Authorization: `Bearer ${this.accessToken}` } }
//             );
//             const data = await fileRes.json();

//             if (Array.isArray(data)) {
//                 localStorage.setItem('glucoseReadings', JSON.stringify(data));
//                 alert('Data successfully loaded from Google Drive!');
//                 window.location.reload();
//             } else {
//                 alert('Data format in Drive file is invalid.');
//             }
//         } catch (e) {
//             console.error('Error reading from Drive:', e);
//             alert('Could not download data from Google Drive.');
//         }
//     }
// };

// // Auto-run when DOM is ready
// document.addEventListener('DOMContentLoaded', () => {
//     SugarTrackGoogle.init();
// });


























/**
 * google.js - Google Identity & Google Drive Integration for SugarTrack
 */
const GOOGLE_CONFIG = {
    clientId: '884057504637-lo16damkhhb55v1hmmmhrl9m2dm0p5rr.apps.googleusercontent.com', 
    scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile',

    // =========================================================================
    // NOTIFICATION CONFIGURATION
    // Options: 'toast' | 'modal' | 'alert' | 'custom'
    // =========================================================================
    notifyMode: 'toast', 

    // Custom handler: only called if notifyMode is set to 'custom'
    onCustomNotify: (type, title, message) => {
        console.log(`[Google Drive ${type.toUpperCase()}] ${title}: ${message}`);
    }
};

const SugarTrackGoogle = {
    tokenClient: null,
    accessToken: null,
    userProfile: null,

    // --- 1. NOTIFICATION DISPATCHER ---
    notify(type, title, message, onConfirm = null) {
        // type: 'success' | 'warning' | 'error' | 'info'
        switch (GOOGLE_CONFIG.notifyMode) {
            case 'custom':
                if (typeof GOOGLE_CONFIG.onCustomNotify === 'function') {
                    GOOGLE_CONFIG.onCustomNotify(type, title, message);
                }
                if (onConfirm) onConfirm();
                break;

            case 'alert':
                window.alert(`${title}\n\n${message}`);
                if (onConfirm) onConfirm();
                break;

            case 'toast':
                this.showToast(type, title, message);
                if (onConfirm) setTimeout(onConfirm, 1000);
                break;

            case 'modal':
            default:
                this.showModal(type, title, message, onConfirm);
                break;
        }
    },

    // --- 2. BUILT-IN TOAST RENDERER ---
    showToast(type, title, message) {
        let toast = document.getElementById('stGoogleToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'stGoogleToast';
            toast.className = 'st-google-toast';
            document.body.appendChild(toast);
        }

        const icons = {
            success: 'ph-check-circle',
            warning: 'ph-warning-circle',
            error: 'ph-x-circle',
            info: 'ph-info'
        };

        const colors = {
            success: '#10b981',
            warning: '#eab308',
            error: '#ef4444',
            info: '#0ea5e9'
        };

        toast.innerHTML = `
            <i class="ph-fill ${icons[type] || 'ph-info'}" style="color: ${colors[type] || colors.info}; font-size: 20px;"></i>
            <div class="st-toast-content">
                <strong>${title}</strong>
                <span>${message}</span>
            </div>
        `;

        toast.classList.add('visible');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            toast.classList.remove('visible');
        }, 3200);
    },

    // --- 3. BUILT-IN CUSTOM MODAL RENDERER ---
    showModal(type, title, message, onConfirm = null) {
        let overlay = document.getElementById('stGoogleModalOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'stGoogleModalOverlay';
            overlay.className = 'st-modal-overlay';
            overlay.innerHTML = `
                <div class="st-modal-card">
                    <div class="st-modal-icon-wrap" id="stModalIconWrap">
                        <i id="stModalIcon" class="ph-fill ph-info"></i>
                    </div>
                    <h3 id="stModalTitle">Notice</h3>
                    <p id="stModalMessage">Message goes here.</p>
                    <div class="st-modal-actions">
                        <button type="button" id="stModalCloseBtn" class="btn-primary" style="width: 100%; justify-content: center;">OK</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        const icons = {
            success: { icon: 'ph-check-circle', bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
            warning: { icon: 'ph-warning-circle', bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308' },
            error: { icon: 'ph-x-circle', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
            info: { icon: 'ph-google-logo', bg: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' }
        };

        const config = icons[type] || icons.info;
        const iconWrap = overlay.querySelector('#stModalIconWrap');
        const iconEl = overlay.querySelector('#stModalIcon');
        
        iconWrap.style.background = config.bg;
        iconWrap.style.color = config.color;
        iconEl.className = `ph-fill ${config.icon}`;

        overlay.querySelector('#stModalTitle').textContent = title;
        overlay.querySelector('#stModalMessage').textContent = message;

        const closeBtn = overlay.querySelector('#stModalCloseBtn');
        const closeModal = () => {
            overlay.classList.remove('active');
            if (onConfirm) onConfirm();
        };

        closeBtn.onclick = closeModal;
        overlay.onclick = (e) => {
            if (e.target === overlay) closeModal();
        };

        overlay.classList.add('active');
    },

    // --- 4. INITIALIZE AUTH & TOKENS ---
    init() {
        this.injectStyles();
        this.restoreSavedUser();

        // Check if GIS script is loaded
        if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
            this.setupTokenClient();
        } else {
            window.addEventListener('load', () => {
                if (typeof google !== 'undefined' && google.accounts) {
                    this.setupTokenClient();
                }
            });
        }
    },

    setupTokenClient() {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CONFIG.clientId,
            scope: GOOGLE_CONFIG.scopes,
            callback: async (tokenResponse) => {
                if (tokenResponse && tokenResponse.access_token) {
                    this.accessToken = tokenResponse.access_token;
                    sessionStorage.setItem('st_g_token', this.accessToken);
                    await this.fetchUserInfo();
                    this.updateUI();
                    this.notify('success', 'Connected', 'Your Google Drive account has been connected.');
                }
            }
        });
    },

    signIn() {
        // Prevent opening the popup if already connected
        if (this.accessToken) {
            this.notify('info', 'Already Connected', 'You are already connected to Google Drive.');
            return;
        }

        if (!this.tokenClient) {
            console.error('Google Token Client not ready yet.');
            this.notify('error', 'Not Ready', 'Google authentication service is still initializing. Please try again.');
            return;
        }
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
    },
    
    signOut() {
        if (this.accessToken) {
            google.accounts.oauth2.revoke(this.accessToken, () => {
                console.log('Access token revoked.');
            });
        }
        this.accessToken = null;
        this.userProfile = null;
        sessionStorage.removeItem('st_g_token');
        localStorage.removeItem('st_user_avatar');
        localStorage.removeItem('st_google_user');
        this.updateUI();
        this.notify('info', 'Disconnected', 'Your Google account has been disconnected.');
    },

    // 5. Fetch User Profile & Avatar
    async fetchUserInfo() {
        try {
            const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${this.accessToken}` }
            });
            const info = await res.json();
            this.userProfile = info;

            if (info.picture) {
                localStorage.setItem('st_user_avatar', info.picture);
            }
            if (info.name) {
                localStorage.setItem('st_google_user', info.name);
            }
            return info;
        } catch (err) {
            console.error('Failed to retrieve user profile:', err);
        }
    },

    restoreSavedUser() {
        this.accessToken = sessionStorage.getItem('st_g_token');
        const savedPic = localStorage.getItem('st_user_avatar');
        const savedName = localStorage.getItem('st_google_user');
        if (savedPic || savedName) {
            this.userProfile = { picture: savedPic, name: savedName };
            this.updateUI();
        }
    },

    // 6. Update Profile, Sidebar Images & Buttons
    updateUI() {
        const avatarUrl = localStorage.getItem('st_user_avatar');
        const googleName = localStorage.getItem('st_google_user');
        const localName = localStorage.getItem('userName');
        
        const displayName = googleName || localName || 'Account';
        const isConnected = !!(this.accessToken || avatarUrl);

        // --- UPDATE AVATARS ---
        const avatarTargets = document.querySelectorAll('.profile-avatar, .user-avatar-target');
        avatarTargets.forEach(el => {
            if (avatarUrl) {
                // If the element is the mobile header button, ensure it stays round without a border
                if (el.id === 'mobileDriveBtn') {
                    el.style.borderColor = 'var(--border-color)';
                }
                el.innerHTML = `<img src="${avatarUrl}" alt="Profile Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;">`;
            } else {
                // Reset icons based on location
                if (el.id === 'mobileDriveBtn') {
                    el.style.borderColor = 'transparent';
                    el.innerHTML = `<i class="ph ph-google-logo"></i>`;
                } else {
                    el.innerHTML = `<i class="ph ph-user"></i>`;
                }
            }
            el.title = displayName; 
        });

        // --- UPDATE SIDEBAR TEXT ---
        const sidebarNameEl = document.getElementById('sidebarProfileName');
        if (sidebarNameEl) sidebarNameEl.textContent = displayName;

        const sidebarWrapper = document.querySelector('.sidebar-profile-wrapper');
        if (sidebarWrapper) sidebarWrapper.title = displayName;

        // --- UPDATE DESKTOP BUTTONS ---
        const headerBtn = document.getElementById('googleSyncBtn');
        if (headerBtn) {
            if (isConnected) {
                headerBtn.innerHTML = `<i class="ph ph-check-circle" style="color: #10b981;"></i> Connected`;
                headerBtn.title = `Connected as ${googleName || 'Google User'}`;
            } else {
                headerBtn.innerHTML = `<i class="ph ph-google-logo"></i> Connect Drive`;
                headerBtn.title = `Connect to Google Drive`;
            }
        }

        const sidebarBtn = document.getElementById('sidebarGoogleBtn');
        if (sidebarBtn) {
            if (isConnected) {
                sidebarBtn.textContent = 'Drive Connected';
                sidebarBtn.style.color = '#10b981';
            } else {
                sidebarBtn.textContent = 'Connect Drive';
                sidebarBtn.style.color = 'var(--accent-blue)';
            }
        }

        const settingsBtn = document.getElementById('settingsGoogleBtn');
        if (settingsBtn) {
            if (isConnected) {
                settingsBtn.innerHTML = `<i class="ph-fill ph-check-circle" style="color: #10b981;"></i> Connected (Sign Out)`;
                settingsBtn.onclick = () => this.signOut();
                settingsBtn.title = `Click to Disconnect`;
            } else {
                settingsBtn.innerHTML = `<i class="ph ph-google-logo"></i> Connect Drive`;
                settingsBtn.onclick = () => this.signIn();
                settingsBtn.title = `Connect to Google Drive`;
            }
        }

        // --- UPDATE MOBILE MENU DROPDOWN ---
        const mobileDriveStatus = document.getElementById('mobileDriveStatus');
        const mobileDriveAuthBtn = document.getElementById('mobileDriveAuthBtn');
        
        if (mobileDriveStatus && mobileDriveAuthBtn) {
            if (isConnected) {
                mobileDriveStatus.innerHTML = `<i class="ph-fill ph-check-circle" style="color: #10b981;"></i> ${googleName || 'Connected'}`;
                mobileDriveAuthBtn.innerHTML = `<i class="ph ph-sign-out"></i> Disconnect`;
                mobileDriveAuthBtn.onclick = () => { 
                    this.signOut(); 
                    document.getElementById('mobileDriveMenu')?.classList.remove('show');
                    return false; 
                };
            } else {
                mobileDriveStatus.innerHTML = `<i class="ph ph-warning-circle" style="color: #eab308;"></i> Not Connected`;
                mobileDriveAuthBtn.innerHTML = `<i class="ph ph-link"></i> Connect`;
                mobileDriveAuthBtn.onclick = () => { 
                    this.signIn(); 
                    document.getElementById('mobileDriveMenu')?.classList.remove('show');
                    return false; 
                };
            }
        }
    },

    // 7. Google Drive: Save Data
    async saveToDrive() {
        if (!this.accessToken) {
            this.notify('warning', 'Sign In Required', 'Please connect your Google account first.', () => this.signIn());
            return;
        }

        const readings = localStorage.getItem('glucoseReadings') || '[]';
        const fileContent = JSON.stringify(JSON.parse(readings), null, 2);
        const fileName = 'sugartrack_data.json';

        try {
            // Check if file already exists
            const searchRes = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and trashed=false`,
                { headers: { Authorization: `Bearer ${this.accessToken}` } }
            );
            const searchData = await searchRes.json();
            const existingFile = searchData.files && searchData.files[0];

            let uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
            let method = 'POST';

            if (existingFile) {
                uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`;
                method = 'PATCH';
            }

            const metadata = {
                name: fileName,
                mimeType: 'application/json'
            };

            const boundary = 'foo_bar_baz';
            const delimiter = `\r\n--${boundary}\r\n`;
            const closeDelimiter = `\r\n--${boundary}--`;

            const multipartRequestBody =
                delimiter +
                'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                fileContent +
                closeDelimiter;

            const res = await fetch(uploadUrl, {
                method: method,
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': `multipart/related; boundary=${boundary}`
                },
                body: multipartRequestBody
            });

            if (res.ok) {
                this.notify('success', 'Backup Successful', 'Data successfully saved to Google Drive!');
            } else {
                const err = await res.json();
                console.error(err);
                this.notify('error', 'Upload Error', 'Error uploading to Google Drive.');
            }
        } catch (e) {
            console.error('Error during Google Drive save:', e);
            this.notify('error', 'Connection Error', 'Failed to connect to Google Drive.');
        }
    },

    // 8. Google Drive: Load/Sync Data
    async loadFromDrive() {
        if (!this.accessToken) {
            this.notify('warning', 'Sign In Required', 'Please connect your Google account first.', () => this.signIn());
            return;
        }

        const fileName = 'sugartrack_data.json';
        try {
            const searchRes = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and trashed=false`,
                { headers: { Authorization: `Bearer ${this.accessToken}` } }
            );
            const searchData = await searchRes.json();

            if (!searchData.files || searchData.files.length === 0) {
                this.notify('warning', 'No File Found', 'No backup file found in your Google Drive.');
                return;
            }

            const fileId = searchData.files[0].id;
            const fileRes = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                { headers: { Authorization: `Bearer ${this.accessToken}` } }
            );
            const data = await fileRes.json();

            if (Array.isArray(data)) {
                localStorage.setItem('glucoseReadings', JSON.stringify(data));
                this.notify('success', 'Data Restored', 'Data successfully loaded from Google Drive!', () => window.location.reload());
            } else {
                this.notify('error', 'Invalid File', 'Data format in Drive file is invalid.');
            }
        } catch (e) {
            console.error('Error reading from Drive:', e);
            this.notify('error', 'Download Failed', 'Could not download data from Google Drive.');
        }
    },

    // --- 9. AUTO DYNAMIC CSS INJECTION ---
    injectStyles() {
        if (document.getElementById('stGoogleStyles')) return;
        const style = document.createElement('style');
        style.id = 'stGoogleStyles';
        style.textContent = `
            /* Modal Backdrop */
            .st-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100000;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.25s ease, visibility 0.25s ease;
                padding: 16px;
            }
            .st-modal-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            /* Modal Card */
            .st-modal-card {
                background: var(--bg-dashboard);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-dashboard, 24px);
                box-shadow: var(--shadow-float);
                max-width: 360px;
                width: 100%;
                padding: 28px 24px;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                transform: scale(0.92);
                transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .st-modal-overlay.active .st-modal-card {
                transform: scale(1);
            }

            .st-modal-icon-wrap {
                width: 52px;
                height: 52px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 26px;
                margin-bottom: 16px;
            }

            .st-modal-card h3 {
                font-size: 18px;
                font-weight: 700;
                color: var(--text-main);
                margin-bottom: 8px;
            }

            .st-modal-card p {
                font-size: 13.5px;
                color: var(--text-muted);
                line-height: 1.5;
                margin-bottom: 24px;
            }

            .st-modal-actions {
                width: 100%;
            }

            /* Floating Toast */
            .st-google-toast {
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: var(--bg-dashboard);
                border: 1px solid var(--border-color);
                border-radius: 40px;
                padding: 10px 20px;
                box-shadow: var(--shadow-float);
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 100001;
                opacity: 0;
                pointer-events: none;
                transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
                max-width: calc(100vw - 32px);
            }
            .st-google-toast.visible {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
            .st-toast-content {
                display: flex;
                flex-direction: column;
                text-align: left;
            }
            .st-toast-content strong {
                font-size: 13px;
                color: var(--text-main);
            }
            .st-toast-content span {
                font-size: 12px;
                color: var(--text-muted);
            }
        `;
        document.head.appendChild(style);
    }
};

// Auto-run when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    SugarTrackGoogle.init();
});