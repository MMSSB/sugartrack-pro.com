// document.addEventListener('DOMContentLoaded', () => {
//     // --- 1. MODAL INIT LOGIC ---
//     // We recreate the bottom sheet logic here so export.js is completely standalone and safe
//     const exportOverlay = document.getElementById('exportSheetOverlay');
//     const exportSheet = document.getElementById('exportSheet');
//     const openExportBtn = document.getElementById('openExportBtn');
//     const closeExportBtn = document.getElementById('closeExportBtn');

//     if (!exportOverlay) return;

//     let startY = 0, currentY = 0, isDragging = false;

//     const openSheet = (e) => {
//         if (e) e.preventDefault();
//         exportSheet.style.transform = '';
//         exportSheet.style.transition = '';
//         void exportSheet.offsetWidth;
//         exportOverlay.classList.add('active');
//     };

//     const closeSheet = () => {
//         exportOverlay.classList.remove('active');
//         setTimeout(() => {
//             exportSheet.style.transform = '';
//             exportSheet.style.transition = '';
//         }, 300);
//     };

//     if (openExportBtn) openExportBtn.addEventListener('click', openSheet);
//     if (closeExportBtn) closeExportBtn.addEventListener('click', closeSheet);
//     exportOverlay.addEventListener('click', (e) => { if (e.target === exportOverlay) closeSheet(); });

//     // Mobile Drag Physics
//     exportSheet.addEventListener('touchstart', (e) => {
//         if (window.innerWidth <= 768 && (e.target.closest('.drag-handle-wrapper') || e.target.closest('.sheet-header'))) {
//             startY = e.touches[0].clientY;
//             isDragging = true;
//             exportSheet.style.transition = 'none';
//         }
//     }, { passive: true });

//     exportSheet.addEventListener('touchmove', (e) => {
//         if (!isDragging) return;
//         currentY = e.touches[0].clientY;
//         const diff = currentY - startY;
//         if (diff > 0) {
//             window.requestAnimationFrame(() => { exportSheet.style.transform = `translateY(${diff}px)`; });
//         }
//     }, { passive: true });

//     exportSheet.addEventListener('touchend', () => {
//         if (!isDragging) return;
//         isDragging = false;
//         exportSheet.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
//         if (currentY - startY > 80) closeSheet();
//         else exportSheet.style.transform = 'translateY(0)';
//     });

/**
 * ============================================================================
 * SUGARTRACK EXPORT CONFIGURATION DASHBOARD
 * ============================================================================
 * Easily customize your PDF, Excel, and JSON exports right here.
 * Set toggles to true/false, change sorting, or update branding instantly.
 * ============================================================================
 */
const EXPORT_CONFIG = {
    // --- BRANDING & METADATA ---
    companyName: "SugarTrack Medical Systems",
    reportTitleEn: "Clinical Glucose Report",
    reportTitleAr: "تقرير نسبة السكر في الدم",
    
    // --- PDF LAYOUT FEATURES (Toggle true/ede to show/hide) ---
    showPatientName: true,
    showStatistics: true,       // Shows Avg Glucose and Time in Range blocks
    showClinicalSuggestions: true, // Shows professional medical guidance bullets
    
    // --- SORTING PREFERENCE ---
    // Options: 'newest' (Newest logs first) or 'oldest' (Oldest logs first)
    sortOrder: 'newest', 

    // --- PDF DESIGN STYLING ---
    primaryColor: '#2563eb',    // Main brand header accent
    tableHeaderBg: '#111827',   // Dark header background color for logs table
};


document.addEventListener('DOMContentLoaded', () => {
    // --- 1. MODAL SHEET INITIALIZATION ---
    const exportOverlay = document.getElementById('exportSheetOverlay');
    const exportSheet = document.getElementById('exportSheet');
    const openExportBtn = document.getElementById('openExportBtn'); 
    const mobileExportBtn = document.getElementById('mobileExportBtn'); 
    const closeExportBtn = document.getElementById('closeExportBtn');

    if (!exportOverlay) return;

    let startY = 0, currentY = 0, isDragging = false;

    const openSheet = (e) => {
        if (e) e.preventDefault();
        exportSheet.style.transform = '';
        exportSheet.style.transition = '';
        void exportSheet.offsetWidth;
        exportOverlay.classList.add('active');
    };

    const closeSheet = () => {
        exportOverlay.classList.remove('active');
        setTimeout(() => {
            exportSheet.style.transform = '';
            exportSheet.style.transition = '';
        }, 300);
    };

    if (openExportBtn) openExportBtn.addEventListener('click', openSheet);
    if (mobileExportBtn) mobileExportBtn.addEventListener('click', openSheet);
    if (closeExportBtn) closeExportBtn.addEventListener('click', closeSheet);
    exportOverlay.addEventListener('click', (e) => { if (e.target === exportOverlay) closeSheet(); });

    // Mobile Drag Physics
    exportSheet.addEventListener('touchstart', (e) => {
        if (window.innerWidth <= 768 && (e.target.closest('.drag-handle-wrapper') || e.target.closest('.sheet-header'))) {
            startY = e.touches[0].clientY;
            isDragging = true;
            exportSheet.style.transition = 'none';
        }
    }, { passive: true });

    exportSheet.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        if (diff > 0) {
            window.requestAnimationFrame(() => { exportSheet.style.transform = `translateY(${diff}px)`; });
        }
    }, { passive: true });

    exportSheet.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        exportSheet.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'; 
        if (currentY - startY > 80) closeSheet();
        else exportSheet.style.transform = 'translateY(0)';
    });


    // --- 2. DATA PROCESSING & FORMATTING HELPERS ---
    const getProcessedReadings = () => {
        let data = JSON.parse(localStorage.getItem('glucoseReadings')) || [];
        
        // Sort based on configuration flag
        data.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return EXPORT_CONFIG.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
        
        return data;
    };

    const getPatientName = () => localStorage.getItem('userFullName') || localStorage.getItem('userName') || 'Patient / مريض';

    const getStatus = (val) => {
        if (val < 70) return { text: 'Low / منخفض', color: '#ef4444' };
        if (val > 180) return { text: 'High / مرتفع', color: '#eab308' };
        return { text: 'Normal / طبيعي', color: '#10b981' };
    };

    const formatTime12Hour = (timeStr) => {
        if (!timeStr) return '';
        let [h, m] = timeStr.split(':');
        h = parseInt(h, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${m} ${ampm}`;
    };


    // --- 3. EXPORT HANDLERS ---

    // A. Export JSON File
    document.getElementById('btnExportJSON')?.addEventListener('click', () => {
        const readings = getProcessedReadings();
        if (readings.length === 0) return alert('No data to export.');
        
        const blob = new Blob([JSON.stringify(readings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SugarTrack_Data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        closeSheet();
    });

    // B. Export Excel File (.xlsx)
    document.getElementById('btnExportExcel')?.addEventListener('click', () => {
        if (typeof XLSX === 'undefined') return alert('Excel library is still loading. Please try again in a moment.');
        
        const readings = getProcessedReadings();
        if (readings.length === 0) return alert('No data to export.');

        const excelData = readings.map(r => ({
            "Date": r.date,
            "Time": formatTime12Hour(r.time),
            "Glucose (mg/dL)": r.glucose,
            "Status": getStatus(r.glucose).text.split(' /')[0], 
            "Notes": r.comment || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Glucose Logs");
        
        XLSX.writeFile(workbook, `SugarTrack_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
        closeSheet();
    });

    // C. Export Professional Responsive PDF Report
    document.getElementById('btnExportPDF')?.addEventListener('click', () => {
        if (typeof html2pdf === 'undefined') return alert('PDF library is still loading. Please try again in a moment.');
        
        const readings = getProcessedReadings();
        if (readings.length === 0) return alert('No data to export.');

        // Calculations
        const avg = Math.round(readings.reduce((acc, curr) => acc + curr.glucose, 0) / readings.length);
        const inRange = Math.round((readings.filter(r => r.glucose >= 70 && r.glucose <= 180).length / readings.length) * 100);

        // // Build Table Rows cleanly
        // let tableRows = '';
        // readings.forEach(r => {
        //     const status = getStatus(r.glucose);
        //     const dateObj = new Date(r.date);
        //     const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
            
        //     tableRows += `
        //         <tr style="border-bottom: 1px solid #e5e7eb;">
        //             <td style="width: 15%; padding: 10px 8px; font-size: 12px; white-space: nowrap; vertical-align: middle;">${formattedDate}</td>
        //             <td style="width: 15%; padding: 10px 8px; font-size: 12px; white-space: nowrap; vertical-align: middle;">${formatTime12Hour(r.time)}</td>
        //             <td style="width: 15%; padding: 10px 8px; font-size: 13px; font-weight: bold; white-space: nowrap; vertical-align: middle;">${r.glucose} <span style="font-size:9px; font-weight:normal; color:#6b7280;">mg/dL</span></td>
        //             <td style="width: 18%; padding: 10px 8px; font-size: 11px; font-weight: bold; color: ${status.color}; white-space: nowrap; vertical-align: middle; line-height: 1.3;">${status.text}</td>
        //             <td style="width: 37%; padding: 10px 8px; font-size: 12px; color: #4b5563; word-break: break-word; overflow-wrap: break-word; vertical-align: middle; line-height: 1.4;" dir="auto">${r.comment || '-'}</td>
        //         </tr>
        //     `;
        // });



        // // Build Table Rows cleanly
        // let tableRows = '';
        // readings.forEach(r => {
        //     const status = getStatus(r.glucose);
        //     const dateObj = new Date(r.date);
        //     const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
            
        //     // Added page-break-inside: avoid; and break-inside: avoid; to prevent splitting
        //     tableRows += `
        //         <tr style="border-bottom: 1px solid #e5e7eb; page-break-inside: avoid; break-inside: avoid;">
        //             <td style="width: 15%; padding: 10px 8px; font-size: 12px; white-space: nowrap; vertical-align: middle;">${formattedDate}</td>
        //             <td style="width: 15%; padding: 10px 8px; font-size: 12px; white-space: nowrap; vertical-align: middle;">${formatTime12Hour(r.time)}</td>
        //             <td style="width: 15%; padding: 10px 8px; font-size: 13px; font-weight: bold; white-space: nowrap; vertical-align: middle;">${r.glucose} <span style="font-size:9px; font-weight:normal; color:#6b7280;">mg/dL</span></td>
        //             <td style="width: 18%; padding: 10px 8px; font-size: 11px; font-weight: bold; color: ${status.color}; white-space: nowrap; vertical-align: middle; line-height: 1.3;">${status.text}</td>
        //             <td style="width: 37%; padding: 10px 8px; font-size: 12px; color: #4b5563; word-break: break-word; overflow-wrap: break-word; vertical-align: middle; line-height: 1.4;" dir="auto">${r.comment || '-'}</td>
        //         </tr>
        //     `;
        // });
// Build Table Rows cleanly
        let tableRows = '';
        readings.forEach(r => {
            const status = getStatus(r.glucose);
            const dateObj = new Date(r.date);
            const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
            
            // Removed word-break and overflow-wrap from the Notes <td> to preserve Arabic text shaping
            tableRows += `
                <tr style="border-bottom: 1px solid #e5e7eb; page-break-inside: avoid; break-inside: avoid;">
                    <td style="width: 15%; padding: 10px 8px; font-size: 12px; white-space: nowrap; vertical-align: middle;">${formattedDate}</td>
                    <td style="width: 15%; padding: 10px 8px; font-size: 12px; white-space: nowrap; vertical-align: middle;">${formatTime12Hour(r.time)}</td>
                    <td style="width: 15%; padding: 10px 8px; font-size: 13px; font-weight: bold; white-space: nowrap; vertical-align: middle;">${r.glucose} <span style="font-size:9px; font-weight:normal; color:#6b7280;">mg/dL</span></td>
                    <td style="width: 18%; padding: 10px 8px; font-size: 11px; font-weight: bold; color: ${status.color}; white-space: nowrap; vertical-align: middle; line-height: 1.3;">${status.text}</td>
                    <td style="width: 37%; padding: 10px 8px; font-size: 12px; color: #4b5563; white-space: normal; vertical-align: middle; line-height: 1.4;" dir="auto">${r.comment || '-'}</td>
                </tr>
            `;
        });
        // Assemble PDF HTML Document
        const pdfContainer = document.createElement('div');
        pdfContainer.style.padding = '30px';
        pdfContainer.style.fontFamily = 'Arial, sans-serif';
        pdfContainer.style.color = '#111827';
        pdfContainer.style.direction = 'auto';
        pdfContainer.style.background = '#ffffff';

        pdfContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid ${EXPORT_CONFIG.primaryColor}; padding-bottom: 14px; margin-bottom: 24px;">
                <div>
                    <h1 style="margin: 0; font-size: 24px; color: ${EXPORT_CONFIG.primaryColor};">${EXPORT_CONFIG.reportTitleEn}</h1>
                    <h2 style="margin: 4px 0 0 0; font-size: 16px; color: #4b5563;">${EXPORT_CONFIG.reportTitleAr}</h2>
                </div>
                <div style="text-align: right; color: #6b7280; font-size: 11px;">
                    Generated: ${new Date().toLocaleDateString('en-US')}<br>
                    <strong>${EXPORT_CONFIG.companyName}</strong>
                </div>
            </div>

            ${EXPORT_CONFIG.showPatientName || EXPORT_CONFIG.showStatistics ? `
                <div style="background: #f3f4f6; border-radius: 10px; padding: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
                    ${EXPORT_CONFIG.showPatientName ? `
                        <div>
                            <p style="margin: 0; font-size: 11px; color: #6b7280; text-transform: uppercase;">Patient Name / اسم المريض</p>
                            <p style="margin: 3px 0 0 0; font-size: 16px; font-weight: bold; color: #111827;">${getPatientName()}</p>
                        </div>
                    ` : ''}
                    ${EXPORT_CONFIG.showStatistics ? `
                        <div style="text-align: center;">
                            <p style="margin: 0; font-size: 11px; color: #6b7280; text-transform: uppercase;">Avg Glucose / المتوسط</p>
                            <p style="margin: 3px 0 0 0; font-size: 16px; font-weight: bold; color: #111827;">${avg} mg/dL</p>
                        </div>
                        <div style="text-align: center;">
                            <p style="margin: 0; font-size: 11px; color: #6b7280; text-transform: uppercase;">Time in Range</p>
                            <p style="margin: 3px 0 0 0; font-size: 16px; font-weight: bold; color: #10b981;">${inRange}%</p>
                        </div>
                    ` : ''}
                </div>
            ` : ''}

            ${EXPORT_CONFIG.showClinicalSuggestions ? `
                <h3 style="font-size: 14px; color: #111827; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Clinical Suggestions / توصيات طبية</h3>
                <ul style="font-size: 12px; color: #4b5563; line-height: 1.5; margin-bottom: 24px; padding-left: 18px;" dir="auto">
                    <li><strong>Hydration:</strong> Maintain proper water intake to help flush excess glucose. / حافظ على شرب كميات كافية من الماء.</li>
                    <li><strong>Consistency:</strong> Try to log readings at the same times daily for accurate trend analysis. / حاول تسجيل القراءات في نفس الأوقات يومياً.</li>
                    ${avg > 140 ? '<li><strong style="color:#ef4444;">Attention:</strong> Your average is slightly elevated. Consult your physician regarding diet or medication adjustments. / متوسط السكر مرتفع قليلاً، يرجى استشارة الطبيب.</li>' : '<li><strong>Great Job:</strong> Your average glucose is well maintained. / أداء ممتاز، مستويات السكر لديك منتظمة.</li>'}
                </ul>
            ` : ''}

            <h3 style="font-size: 14px; color: #111827; margin-bottom: 12px;">Log History / سجل القراءات (${readings.length} entries)</h3>
            
            <table style="width: 100%; table-layout: fixed; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background: ${EXPORT_CONFIG.tableHeaderBg}; color: #ffffff;">
                        <th style="width: 15%; padding: 10px 8px; font-size: 10px; text-transform: uppercase; white-space: nowrap;">Date</th>
                        <th style="width: 15%; padding: 10px 8px; font-size: 10px; text-transform: uppercase; white-space: nowrap;">Time</th>
                        <th style="width: 15%; padding: 10px 8px; font-size: 10px; text-transform: uppercase; white-space: nowrap;">Glucose</th>
                        <th style="width: 18%; padding: 10px 8px; font-size: 10px; text-transform: uppercase; white-space: nowrap;">Status<br><span style="font-size:8px; color:#9ca3af; font-weight:normal;">الحالة</span></th>
                        <th style="width: 37%; padding: 10px 8px; font-size: 10px; text-transform: uppercase;">Notes<br><span style="font-size:8px; color:#9ca3af; font-weight:normal;">ملاحظات</span></th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        `;

        const printWrapper = document.createElement('div');
        printWrapper.style.position = 'absolute';
        printWrapper.style.left = '-9999px';
        printWrapper.style.top = '0';
        printWrapper.appendChild(pdfContainer);
        document.body.appendChild(printWrapper);

        const btnIcon = document.querySelector('#btnExportPDF i');
        const oldClass = btnIcon ? btnIcon.className : '';
        if (btnIcon) btnIcon.className = 'ph ph-spinner fa-spin';

        // const opt = {
        //     margin:       0.3,
        //     filename:     `SugarTrack_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        //     image:        { type: 'jpeg', quality: 1 },
        //     html2canvas:  { scale: 2, useCORS: true, logging: false },
        //     jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        // };
const opt = {
            margin:       0.3,
            filename:     `SugarTrack_Report_${new Date().toISOString().split('T')[0]}.pdf`,
            image:        { type: 'jpeg', quality: 1 },
            html2canvas:  { scale: 2, useCORS: true, logging: false },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
            pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] } // Ensures it reads the CSS break rules
        };
        html2pdf().set(opt).from(pdfContainer).save().then(() => {
            document.body.removeChild(printWrapper);
            if (btnIcon) btnIcon.className = oldClass;
            closeSheet();
        });
    });
});