const CONFIG = {
    maxHistoryItems: 3
};

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. WELCOME SCREEN & FULL NAME HANDLING ---
    const welcomeScreen = document.getElementById('welcomeScreen');
    const welcomeForm = document.getElementById('welcomeForm');
    const nameInput = document.getElementById('nameInput');
    const displayUserName = document.getElementById('displayUserName'); 
    const displayUserFullName = document.getElementById('displayUserFullName'); 

    const savedFullName = localStorage.getItem('userFullName');
    const savedName = localStorage.getItem('userName');

    if (!savedName) {
        document.documentElement.classList.remove('has-user');
    } else {
        if (displayUserName) displayUserName.textContent = savedName.split(' ')[0];
        if (displayUserFullName) displayUserFullName.textContent = savedFullName || savedName;
    }

    if (welcomeForm) {
        welcomeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = nameInput.value.trim();
            if (fullName) {
                const firstName = fullName.split(' ')[0];
                localStorage.setItem('userName', firstName);
                localStorage.setItem('userFullName', fullName);
                if (displayUserName) displayUserName.textContent = firstName;
                if (displayUserFullName) displayUserFullName.textContent = fullName;
                document.documentElement.classList.add('has-user');
                // ADD THESE TWO LINES TO UPDATE SIDEBAR IMMEDIATELY:
                if (typeof SugarTrackGoogle !== 'undefined') {
                    SugarTrackGoogle.updateUI();
                }
            }
        });
    }
    // --- MOBILE DRIVE DROPDOWN ---
    const mobileDriveBtn = document.getElementById('mobileDriveBtn');
    const mobileDriveMenu = document.getElementById('mobileDriveMenu');
    if (mobileDriveBtn && mobileDriveMenu) {
        mobileDriveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            mobileDriveMenu.classList.toggle('show');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileDriveBtn.contains(e.target) && !mobileDriveMenu.contains(e.target)) {
                mobileDriveMenu.classList.remove('show');
            }
        });
    }

    // --- 2. STATE & DOM ELEMENTS ---
    let readings = JSON.parse(localStorage.getItem('glucoseReadings')) || [
        // { date: "2026-09-17", time: "08:00", glucose: 110, comment: "Fasting" },
        // { date: "2026-09-17", time: "12:00", glucose: 145, comment: "Post Lunch" },
        // { date: "2026-09-17", time: "18:00", glucose: 95, comment: "Pre Dinner" }
    ];
    let chartInstance = null;
    let currentFilter = 'all'; 
    let searchQuery = '';      

    const sidebarToggle = document.getElementById('sidebarToggle');
    const valCurrent = document.getElementById('valCurrent');
    const valRange = document.getElementById('valRange');
    const valAvg = document.getElementById('valAvg');
    const valVar = document.getElementById('valVar');
    const historyList = document.getElementById('historyList');
    const allReadingsList = document.getElementById('allReadingsList');
    const insightsContainer = document.getElementById('insightsContainer');
    const refreshBtn = document.getElementById('refreshBtn');

    // --- 3. MOBILE MENU DROPDOWNS ---
    const mobileThemeMenuBtn = document.getElementById('mobileThemeMenuBtn');
    const mobileThemeSubmenu = document.getElementById('mobileThemeSubmenu');
    
    if (mobileThemeMenuBtn && mobileThemeSubmenu) {
        mobileThemeMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isHidden = mobileThemeSubmenu.style.display === 'none';
            mobileThemeSubmenu.style.display = isHidden ? 'flex' : 'none';
            mobileThemeMenuBtn.querySelector('.ph-caret-down').style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
        });
    }

    // --- 4. GLOBAL THEME & COLOR MANAGEMENT ---
    const applyThemeActiveStates = (theme) => {
        const allThemeSelectors = document.querySelectorAll('.theme-btn, .theme-option, .theme-card-option, .theme-menu-opt');
        allThemeSelectors.forEach(el => {
            if (el.getAttribute('data-theme-val') === theme) el.classList.add('active');
            else el.classList.remove('active');
        });
    };

    const currentSavedTheme = localStorage.getItem('theme') || 'system';
    applyThemeActiveStates(currentSavedTheme);

    const applyThemeChange = (newTheme) => {
        if (window.ThemeManager) {
            ThemeManager.setTheme(newTheme);
        } else {
            localStorage.setItem('theme', newTheme);
            const isDark = newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        }

        applyThemeActiveStates(newTheme);
        if (chartInstance) updateChart();
        
        const currentThemeIcon = document.getElementById('currentThemeIcon');
        if (currentThemeIcon) {
            currentThemeIcon.className = ''; 
            if (newTheme === 'light') currentThemeIcon.classList.add('ph', 'ph-sun');
            else if (newTheme === 'dark') currentThemeIcon.classList.add('ph', 'ph-moon');
            else currentThemeIcon.classList.add('ph', 'ph-desktop');
        }
    };

    const allThemeClickables = document.querySelectorAll('.theme-btn, .theme-option, .theme-card-option, .theme-menu-opt');
    allThemeClickables.forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            applyThemeChange(el.getAttribute('data-theme-val'));
            const themeIconMenu = document.getElementById('themeIconMenu');
            if (themeIconMenu && el.classList.contains('theme-menu-opt')) {
                themeIconMenu.classList.remove('show');
            }
        });
    });

    const themeIconBtn = document.getElementById('themeIconBtn');
    const themeIconMenu = document.getElementById('themeIconMenu');
    if (themeIconBtn && themeIconMenu) {
        themeIconBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            themeIconMenu.classList.toggle('show');
        });
        
        document.addEventListener('click', (e) => {
            if (!themeIconBtn.contains(e.target) && !themeIconMenu.contains(e.target)) {
                themeIconMenu.classList.remove('show');
            }
        });
        
        const currentThemeIcon = document.getElementById('currentThemeIcon');
        if (currentThemeIcon) {
            if (currentSavedTheme === 'light') currentThemeIcon.classList.add('ph', 'ph-sun');
            else if (currentSavedTheme === 'dark') currentThemeIcon.classList.add('ph', 'ph-moon');
            else currentThemeIcon.classList.add('ph', 'ph-desktop');
        }
    }

    const colorSwatches = document.querySelectorAll('.color-swatch');
    const customColorInput = document.getElementById('customColorInput');

    const updateActiveSwatch = (color) => {
        colorSwatches.forEach(swatch => {
            if (swatch.dataset.color.toLowerCase() === color.toLowerCase()) swatch.classList.add('active');
            else swatch.classList.remove('active');
        });
        if(customColorInput) customColorInput.value = color;
    };

    const currentSavedColor = localStorage.getItem('accentColor') || '#09090b';
    updateActiveSwatch(currentSavedColor);

    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            const color = swatch.dataset.color;
            if (window.ThemeManager) ThemeManager.setColor(color);
            updateActiveSwatch(color);
        });
    });

    if (customColorInput) {
        customColorInput.addEventListener('input', (e) => {
            const color = e.target.value;
            if (window.ThemeManager) ThemeManager.setColor(color);
            updateActiveSwatch(color);
        });
    }

    // --- 5. SIDEBAR (DESKTOP) ---
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            const html = document.documentElement;
            html.classList.toggle('sidebar-collapsed');
            localStorage.setItem('sidebarCollapsed', html.classList.contains('sidebar-collapsed'));
            setTimeout(() => { if (chartInstance) chartInstance.resize(); }, 310);
        });
    }

    // --- 6. DATA PROCESSING & CHART ---
    const formatTime12Hour = (time) => {
        let [h, m] = time.split(':');
        h = parseInt(h, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${m} ${ampm}`;
    };

    const getGlucoseStatus = (val) => {
        if (val < 70) return { text: 'Low' };
        if (val > 180) return { text: 'High' };
        return { text: 'Normal' };
    };

    const updateChart = () => {
        const canvas = document.getElementById('mainChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const isMobile = window.innerWidth <= 768;
        
        const gridColor = isDark ? '#27272a' : '#e5e7eb';
        const textColor = isDark ? '#a1a1aa' : '#6b7280';
        
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#0ea5e9';
        
        const maxPoints = isMobile ? 8 : 15;
        const chartData = readings.slice(-maxPoints);
        const labels = chartData.map(r => formatTime12Hour(r.time));
        const dataValues = chartData.map(r => r.glucose);

        const pointColors = dataValues.map(val => {
            if (val > 180) return '#eab308'; 
            if (val < 70) return '#ef4444';  
            return primaryColor;                
        });

        let gradientColor = 'rgba(14, 165, 233, 0.22)';
        if (primaryColor.startsWith('#')) {
            const hex = primaryColor.replace('#', '');
            if (hex.length === 6) {
                const r = parseInt(hex.substr(0, 2), 16);
                const g = parseInt(hex.substr(2, 2), 16);
                const b = parseInt(hex.substr(4, 2), 16);
                gradientColor = `rgba(${r}, ${g}, ${b}, 0.22)`;
            }
        }

        let gradient = ctx.createLinearGradient(0, 0, 0, 220);
        gradient.addColorStop(0, gradientColor);
        gradient.addColorStop(1, 'rgba(14, 165, 233, 0)');

        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    data: dataValues,
                    borderColor: primaryColor,
                    borderWidth: isMobile ? 2.5 : 3,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: pointColors,
                    pointBorderColor: isDark ? '#18181b' : '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: isMobile ? 3.5 : 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? '#18181b' : '#ffffff',
                        titleColor: isDark ? '#f4f4f5' : '#111827',
                        bodyColor: textColor,
                        borderColor: gridColor,
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: { label: (context) => `${context.raw} mg/dL` }
                    }
                }
            }
        });
    };

    const generateInsights = (tir, current) => {
        if (!insightsContainer) return;
        insightsContainer.innerHTML = '';
        let insights = [];
        if (tir >= 70) insights.push({ icon: 'ph-check-circle', color: '#16a34a', title: 'On Track', text: `Great! Your time in range is ${tir}%. Keep up the good work.` });
        else insights.push({ icon: 'ph-warning-circle', color: '#eab308', title: 'Attention Needed', text: `Your time in range is ${tir}%. Try adjusting meals.` });

        if (current > 180) insights.push({ icon: 'ph-trend-up', color: '#ef4444', title: 'High Glucose', text: `Latest reading is high. Stay hydrated and consider a light walk.` });
        else if (current < 70) insights.push({ icon: 'ph-trend-down', color: '#ef4444', title: 'Low Glucose', text: `Latest reading is low! Consume 15g of fast-acting carbs.` });
        else insights.push({ icon: 'ph-smiley', color: '#0ea5e9', title: 'Perfect Range', text: `Your latest reading is safely in target.` });

        insights.forEach(ins => {
            const div = document.createElement('div');
            div.className = 'insight-item';
            div.innerHTML = `<div class="insight-icon" style="background: ${ins.color}20; color: ${ins.color};"><i class="ph ${ins.icon}"></i></div><div class="insight-content"><h4>${ins.title}</h4><p>${ins.text}</p></div>`;
            insightsContainer.appendChild(div);
        });
    };

    // --- 7. DETAILS MODAL, DASHBOARD & READINGS PAGE LOGIC ---
    window.detailsSheetCtrl = null; 
    let currentViewIndex = -1; 
    let currentEditIndex = -1; 

    // Opens the details modal
    window.openReadingDetails = (idx) => {
        currentViewIndex = idx;
        const reading = readings[idx];
        const status = getGlucoseStatus(reading.glucose);
        
        document.getElementById('detGlucose').textContent = reading.glucose;
        document.getElementById('detDate').textContent = new Date(reading.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        document.getElementById('detTime').textContent = formatTime12Hour(reading.time);
        
        const notesEl = document.getElementById('detNotes');
        if (reading.comment) {
            notesEl.textContent = `"${reading.comment}"`;
            notesEl.style.opacity = '1';
        } else {
            notesEl.textContent = 'No notes provided for this log.';
            notesEl.style.opacity = '0.6';
        }
        
        const badge = document.getElementById('detStatusBadge');
        badge.textContent = status.text;
        
        let statusClass = 'status-good-bg', statusTextColor = 'var(--status-good-text)';
        if (status.text === 'High') { statusClass = 'status-warn-bg'; statusTextColor = 'var(--status-warn-text)'; }
        if (status.text === 'Low') { statusClass = 'status-bad-bg'; statusTextColor = 'var(--status-bad-text)'; }
        
        badge.style.background = `var(--${statusClass})`;
        badge.style.color = statusTextColor;

        if (window.detailsSheetCtrl) window.detailsSheetCtrl.open();
    };

    // Dashboard Renderer
    const updateDashboard = () => {
        if (!valCurrent) return; 
        
        if (readings.length === 0) {
            valCurrent.innerHTML = '--'; valAvg.innerHTML = '--'; valRange.textContent = '--'; valVar.textContent = '--';
            if(historyList) historyList.innerHTML = '<div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 13px;">No readings logged yet.</div>';
            updateChart();
            return;
        }

        readings.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
        const latest = readings[readings.length - 1];
        valCurrent.innerHTML = `${latest.glucose}`;

        const sum = readings.reduce((acc, curr) => acc + curr.glucose, 0);
        const avg = Math.round(sum / readings.length);
        valAvg.innerHTML = `${avg}`;

        const inRangeCount = readings.filter(r => r.glucose >= 70 && r.glucose <= 180).length;
        const rangePercent = Math.round((inRangeCount / readings.length) * 100);
        valRange.textContent = `${rangePercent}`;

        if (readings.length > 1) {
            const variance = readings.reduce((acc, curr) => acc + Math.pow(curr.glucose - avg, 2), 0) / readings.length;
            valVar.textContent = Math.round((Math.sqrt(variance) / avg) * 100);
        } else {
            valVar.textContent = '--';
        }

        if(historyList) {
            historyList.innerHTML = '';
            const reversedReadings = [...readings].reverse();
            const limitedReadings = reversedReadings.slice(0, CONFIG.maxHistoryItems);
            
            limitedReadings.forEach((reading, index) => {
                const status = getGlucoseStatus(reading.glucose);
                const dateObj = new Date(reading.date);
                const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const originalIndex = readings.length - 1 - index;

                const item = document.createElement('div');
                item.className = 'history-item clickable';
                item.onclick = () => openReadingDetails(originalIndex);
                
                let statusClass = 'status-good-bg', statusTextColor = 'var(--status-good-text)';
                if (status.text === 'High') { statusClass = 'status-warn-bg'; statusTextColor = 'var(--status-warn-text)'; }
                if (status.text === 'Low') { statusClass = 'status-bad-bg'; statusTextColor = 'var(--status-bad-text)'; }

                item.innerHTML = `
                    <div class="hist-left">
                        <div class="hist-val">${reading.glucose} mg/dL <span class="status-badge" style="background: var(--${statusClass}); color: ${statusTextColor};">${status.text}</span></div>
                        <div class="hist-time">${dateStr}, ${formatTime12Hour(reading.time)}</div>
                    </div>
                    <i class="ph ph-caret-right" style="color: var(--text-light); font-size: 18px;"></i>
                `;
                historyList.appendChild(item);
            });
        }

        generateInsights(rangePercent, latest.glucose);
        updateChart();
    };

    // Action Menu handler (Desktop 3-Dots)
    window.openActionMenu = (idx, event) => {
        event.stopPropagation();
        currentEditIndex = idx;
        if (window.actionMenuCtrl) window.actionMenuCtrl.open();
    };

    // Full Logs Search & Filter Event Listeners
    const searchInput = document.getElementById('searchReadingsInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            updateAllReadings();
        });
    }

    const filterPills = document.querySelectorAll('.r-filter-pills .r-pill');
    filterPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.getAttribute('data-filter');
            updateAllReadings();
        });
    });

    // Full Logs Renderer (readings.html)
    const updateAllReadings = () => {
        if (!allReadingsList) return; 
        allReadingsList.innerHTML = '';
        
        const statLatest = document.getElementById('rStatLatest');
        const statAvg = document.getElementById('rStatAvg');
        const statRange = document.getElementById('rStatRange');
        const statTotal = document.getElementById('rStatTotal');
        
        if (readings.length === 0) {
            allReadingsList.innerHTML = '<div style="padding: 32px; text-align: center; color: var(--text-muted);">No readings logged yet.</div>';
            if(statLatest) { statLatest.textContent = '--'; statAvg.textContent = '--'; statRange.textContent = '--%'; statTotal.textContent = '0'; }
            return;
        }

        readings.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
        
        // Populate Stats (Stats represent the FULL data set, not the filtered set)
        if (statLatest) {
            const latest = readings[readings.length - 1];
            const sum = readings.reduce((acc, curr) => acc + curr.glucose, 0);
            const inRange = readings.filter(r => r.glucose >= 70 && r.glucose <= 180).length;
            
            statLatest.textContent = latest.glucose;
            statAvg.textContent = Math.round(sum / readings.length);
            statRange.textContent = Math.round((inRange / readings.length) * 100) + '%';
            statTotal.textContent = readings.length;
        }

        // Apply Search and Filters to a copy of the array for rendering
        let filteredReadings = [...readings];

        // 1. Text Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filteredReadings = filteredReadings.filter(r => {
                const dateStr = new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toLowerCase();
                const notesStr = (r.comment || '').toLowerCase();
                const glucoseStr = r.glucose.toString();
                return dateStr.includes(lowerQuery) || notesStr.includes(lowerQuery) || glucoseStr.includes(lowerQuery);
            });
        }

        // 2. Pill Filter
        if (currentFilter === 'today') {
            const now = new Date();
            const localToday = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            filteredReadings = filteredReadings.filter(r => r.date === localToday);
        } else if (currentFilter === 'high') {
            filteredReadings = filteredReadings.filter(r => r.glucose > 180);
        } else if (currentFilter === 'low') {
            filteredReadings = filteredReadings.filter(r => r.glucose < 70);
        }

        if (filteredReadings.length === 0) {
            allReadingsList.innerHTML = '<div style="padding: 32px; text-align: center; color: var(--text-muted);">No logs match your search.</div>';
            return;
        }

        // Render Reverse Chronological (Newest First)
        filteredReadings.reverse().forEach((reading) => {
            const originalIndex = readings.indexOf(reading);
            const status = getGlucoseStatus(reading.glucose);
            const dateObj = new Date(reading.date);
            const desktopDate = `${dateObj.getMonth()+1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
            const mobileDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const finalDate = window.innerWidth <= 768 ? mobileDate : desktopDate;

            const item = document.createElement('div');
            item.className = 'r-row clickable'; 
            
            item.onclick = (e) => {
                if (!e.target.closest('.r-action-btn')) {
                    openReadingDetails(originalIndex);
                }
            };
            
            let statusColor = '#10b981';
            if (status.text === 'High') statusColor = '#eab308';
            if (status.text === 'Low') statusColor = '#ef4444';

            item.innerHTML = `
                <div class="r-col-date">${finalDate}</div>
                <div class="r-col-time">${formatTime12Hour(reading.time)}</div>
                <div class="r-col-glucose">
                    <span class="r-val" style="color: ${statusColor}">${reading.glucose}</span><span class="r-unit">mg/dL</span>
                </div>
                <div class="r-col-status">
                    <span class="status-badge" style="background: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}40;">${status.text}</span>
                </div>
                <div class="r-col-context">General</div>
                <div class="r-col-notes"><span class="r-notes-text">${reading.comment || 'No notes'}</span></div>
                <div class="r-col-actions">
                    <button class="r-action-btn" onclick="openActionMenu(${originalIndex}, event)"><i class="ph ph-dots-three"></i></button>
                </div>
            `;
            allReadingsList.appendChild(item);
        });
    };

    updateDashboard();
    updateAllReadings();

    // --- 8. STABLE SINGLE-STOP BOTTOM SHEETS ---
    function initBottomSheet(overlayId, openBtnIds, closeBtnId) {
        const overlay = document.getElementById(overlayId);
        if (!overlay) return null;
        const sheet = overlay.querySelector('.bottom-sheet');
        const closeBtn = document.getElementById(closeBtnId);
        
        let startY = 0, currentY = 0, isDragging = false;
        
        const openSheet = (e) => { 
            if(e) e.preventDefault(); 
            sheet.style.transform = ''; 
            sheet.style.transition = '';
            void sheet.offsetWidth; 
            overlay.classList.add('active'); 
        };
        
        const closeSheet = () => { 
            overlay.classList.remove('active'); 
            setTimeout(() => {
                sheet.style.transform = ''; 
                sheet.style.transition = '';
            }, 300);
        };

        openBtnIds.forEach(id => {
            const btn = document.getElementById(id);
            if(btn) btn.addEventListener('click', openSheet);
        });

        if (closeBtn) closeBtn.addEventListener('click', closeSheet);
        overlay.addEventListener('click', (e) => { if(e.target === overlay) closeSheet(); });

        sheet.addEventListener('touchstart', (e) => {
            if (window.innerWidth <= 768 && (e.target.closest('.drag-handle-wrapper') || e.target.closest('.sheet-header'))) {
                startY = e.touches[0].clientY;
                isDragging = true;
                sheet.style.transition = 'none'; 
            }
        }, {passive: true});

        sheet.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            if (diff > 0) { 
                window.requestAnimationFrame(() => {
                    sheet.style.transform = `translateY(${diff}px)`;
                });
            }
        }, {passive: true});

        sheet.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            sheet.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'; 
            const diff = currentY - startY;
            if (diff > 80) closeSheet();
            else sheet.style.transform = 'translateY(0)';
        });

        return { open: openSheet, close: closeSheet };
    }

    const logSheetCtrl = initBottomSheet('logSheetOverlay', ['openLogBtn', 'mobileLogBtn'], 'closeLogBtn');
    initBottomSheet('menuSheetOverlay', ['openMobileMenuBtn'], 'closeMobileMenuBtn');
    window.detailsSheetCtrl = initBottomSheet('detailsSheetOverlay', [], 'closeDetailsBtn'); 
    window.actionMenuCtrl = initBottomSheet('actionMenuOverlay', [], 'closeActionMenuBtn'); 

    // --- 9. FORM ACTIONS (Add, Edit, Delete) ---
    
    // SAFE Pre-fill form for Add
    const openAddLog = () => {
        const titleEl = document.getElementById('logModalTitle');
        if (titleEl) titleEl.textContent = 'Log Glucose';
        
        const editIdxEl = document.getElementById('editIndex');
        if (editIdxEl) editIdxEl.value = '-1';
        
        const formEl = document.getElementById('logForm');
        if (formEl) formEl.reset();
        
        const now = new Date();
        const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        
        const dateInput = document.getElementById('logDate');
        const timeInput = document.getElementById('logTime');
        if(dateInput) dateInput.value = localDate;
        if(timeInput) timeInput.value = now.toTimeString().slice(0, 5);
    };

    const openLogBtn = document.getElementById('openLogBtn');
    const mobileLogBtn = document.getElementById('mobileLogBtn');
    if(openLogBtn) openLogBtn.addEventListener('click', openAddLog);
    if(mobileLogBtn) mobileLogBtn.addEventListener('click', openAddLog);

    // Trigger Edit
    const handleEditTrigger = (idx) => {
        if (idx === -1) return;
        currentEditIndex = idx;
        const reading = readings[currentEditIndex];
        
        const titleEl = document.getElementById('logModalTitle');
        if (titleEl) titleEl.textContent = 'Edit Log';
        
        const editIdxEl = document.getElementById('editIndex');
        if (editIdxEl) editIdxEl.value = currentEditIndex;
        
        document.getElementById('logDate').value = reading.date;
        document.getElementById('logTime').value = reading.time;
        document.getElementById('logGlucose').value = reading.glucose;
        document.getElementById('logNotes').value = reading.comment || '';
        
        if (window.actionMenuCtrl) window.actionMenuCtrl.close();
        if (window.detailsSheetCtrl) window.detailsSheetCtrl.close();
        if (logSheetCtrl) setTimeout(() => logSheetCtrl.open(), 300);
    };

    document.getElementById('btnEditAction')?.addEventListener('click', () => handleEditTrigger(currentEditIndex));
    document.getElementById('btnDetailsEdit')?.addEventListener('click', () => handleEditTrigger(currentViewIndex));

    // Trigger Delete
    const handleDeleteTrigger = (idx) => {
        if (idx === -1) return;
        readings.splice(idx, 1);
        localStorage.setItem('glucoseReadings', JSON.stringify(readings));
        
        updateDashboard();
        updateAllReadings();
        
        if (window.actionMenuCtrl) window.actionMenuCtrl.close();
        if (window.detailsSheetCtrl) window.detailsSheetCtrl.close();
    };

    document.getElementById('btnDeleteAction')?.addEventListener('click', () => handleDeleteTrigger(currentEditIndex));
    document.getElementById('btnDetailsDelete')?.addEventListener('click', () => handleDeleteTrigger(currentViewIndex));

    // SAFE Handle Save Log Submit (Create or Update)
    const logForm = document.getElementById('logForm');
    if(logForm) {
        logForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Safe index retrieval
            const editIndexInput = document.getElementById('editIndex');
            const idx = editIndexInput && editIndexInput.value ? parseInt(editIndexInput.value, 10) : -1;
            
            const updatedReading = {
                date: document.getElementById('logDate').value,
                time: document.getElementById('logTime').value,
                glucose: parseInt(document.getElementById('logGlucose').value, 10),
                comment: (document.getElementById('logNotes')?.value || '').trim()
            };
            
            if (idx === -1 || isNaN(idx)) {
                readings.push(updatedReading); // Add
            } else {
                readings[idx] = updatedReading; // Update
            }
            
            localStorage.setItem('glucoseReadings', JSON.stringify(readings));
            
            if(logSheetCtrl) logSheetCtrl.close();
            logForm.reset();
            if (editIndexInput) editIndexInput.value = '-1'; // Reset state
            
            updateDashboard();
            updateAllReadings();
            
            const timeSpan = document.getElementById('lastUpdateTime');
            if (timeSpan) timeSpan.textContent = 'Just now';
        });
    }

    // Refresh layout dynamically on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { 
            if (chartInstance) updateChart(); 
            if (allReadingsList) updateAllReadings(); 
        }, 150);
    });

    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon) icon.classList.add('ph-spinner', 'fa-spin'); 
            setTimeout(() => {
                updateDashboard();
                if (icon) icon.classList.remove('ph-spinner', 'fa-spin');
                const timeSpan = document.getElementById('lastUpdateTime');
                if (timeSpan) timeSpan.textContent = 'Just now';
            }, 400);
        });
    }
});