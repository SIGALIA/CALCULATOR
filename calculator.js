// calculator.js - קובץ JavaScript מינימלי ומפושט למחשבון כבלים

// טבלת ערכי Imax ו-S המתאימים
const cablesTable = [
    { Imax: 111, S: "5x16" },
    { Imax: 143, S: "3x25+16" },
    { Imax: 173, S: "3x35+16" },
    { Imax: 205, S: "3x50+25" },
    { Imax: 252, S: "3x70+35" },
    { Imax: 303, S: "3x95+50" },
    { Imax: 346, S: "3x120+70" },
    { Imax: 390, S: "3x150+70" },
    { Imax: 441, S: "3x185+95" },
    { Imax: 511, S: "3x240+120" }
];

// טבלת פקטור לתיקון רטרואקטיבי
const correctionFactors = {
    1: 1,
    2: 0.79,
    3: 0.67,
    4: 0.61,
    5: 0.56,
    6: 0.53
};

// מערך גלובלי לשמירת הנתונים ומשתנה למעקב אחר חישוב
let calculationRows = [];
let currentProject = null; // To store the current project details
let isCalculated = false;

// פונקציה לבחירת כבל מתאים לערך
function findCableForAmpacity(value) {
    for (let i = 0; i < cablesTable.length; i++) {
        if (cablesTable[i].Imax >= value) {
            return cablesTable[i];
        }
    }
    return cablesTable[cablesTable.length - 1];
}

// הפונקציה מחלקת את הערך במקרה שהוא גבוה מהמקסימום
function splitValue(value) {
    const maxImax = cablesTable[cablesTable.length - 1].Imax;
    const numSplits = Math.ceil(value / maxImax);
    
    if (numSplits <= 1) {
        return [value];
    }
    
    let result = [];
    const baseValue = Math.floor(value / numSplits);
    let remainder = value % numSplits;
    
    for (let i = 0; i < numSplits; i++) {
        let splitValue = baseValue;
        if (remainder > 0) {
            splitValue++;
            remainder--;
        }
        result.push(splitValue);
    }
    
    return result;
}

// פונקציה לעדכון מצב כל הלינקים והכפתורים
function updateButtonStates() {
    const calculateBtn = document.getElementById('calculate-btn');
    const resetLink = document.getElementById('reset-link');
    const downloadLink = document.getElementById('download-link');
    const saveLink = document.getElementById('save-link');
    
    if (calculationRows.length === 0) {
        calculateBtn.classList.remove('active');
        resetLink.classList.remove('active');
        downloadLink.classList.remove('active');
        if (saveLink) saveLink.classList.remove('active');
    } else {
        calculateBtn.classList.add('active');
        resetLink.classList.add('active');
        downloadLink.classList.add('active');
        if (saveLink) saveLink.classList.add('active');
    }
}

// פונקציה להפעלת/כיבוי כפתור ה-Calculate
function toggleCalculateButton(enabled) {
    const calculateBtn = document.getElementById('calculate-btn');
    if (enabled) {
        calculateBtn.classList.add('active');
        calculateBtn.disabled = false;
    } else {
        calculateBtn.classList.remove('active');
        calculateBtn.disabled = true;
    }
}

// פונקציה להצגת פרטי הפרויקט
function displayProjectInfo() {
    const projectInfoStrip = document.getElementById('project-info-strip');
    const projectTitle = document.getElementById('project-title');
    const projectCustomer = document.getElementById('project-customer');
    const projectFacility = document.getElementById('project-facility');
    const projectRemarks = document.getElementById('project-remarks');

    if (currentProject) {
        projectTitle.textContent = currentProject.name || 'New Calculation';
        projectCustomer.textContent = currentProject.customer || '-';
        projectFacility.textContent = currentProject.facility || '-';
        projectRemarks.textContent = currentProject.remarks || '-';
        projectInfoStrip.style.display = 'block';
    } else {
        projectInfoStrip.style.display = 'none';
    }
}

// הפונקציה להוספת שורה חדשה לטבלה
function addRow() {
    const ampacityInput = document.getElementById('ampacity');
    if (!ampacityInput) {
        console.error('לא נמצא שדה להזנת ערך Ampacity');
        return;
    }
    
    const ampacity = parseInt(ampacityInput.value);
    if (isNaN(ampacity) || ampacity <= 0) {
        console.error('נא להזין ערך Ampacity תקין');
        return;
    }
    
    const description = document.getElementById('itemDesc') ? document.getElementById('itemDesc').value : '';
    
    let power = '';
    const powerSelect = document.getElementById('power');
    if (powerSelect && powerSelect.selectedIndex > 0) {
        power = powerSelect.options[powerSelect.selectedIndex].value;
    }
    
    let material = '';
    const materialRadios = document.getElementsByName('material');
    for (let i = 0; i < materialRadios.length; i++) {
        if (materialRadios[i].checked) {
            material = materialRadios[i].value;
            break;
        }
    }
    
    let wiring = '';
    const wiringRadios = document.getElementsByName('wiring');
    for (let i = 0; i < wiringRadios.length; i++) {
        if (wiringRadios[i].checked) {
            wiring = wiringRadios[i].value;
            break;
        }
    }
    
    const maxImax = cablesTable[cablesTable.length - 1].Imax;
    let valuesToAdd = ampacity > maxImax ? splitValue(ampacity) : [ampacity];
    
    for (let i = 0; i < valuesToAdd.length; i++) {
        let value = valuesToAdd[i];
        let cable = findCableForAmpacity(value);
        
        const initialFactor = 1;
        const correctedImax = cable.Imax * initialFactor;
        const reserve = Math.round(((correctedImax - value) / correctedImax) * 100);
        
        calculationRows.push({
            originalAmpacity: ampacity, // שמירת הערך המקורי שהמשתמש הזין
            description: description,
            ampacity: value,
            power: power,
            material: material,
            wiring: wiring,
            Imax: cable.Imax,
            S: cable.S,
            factor: initialFactor,
            correctedImax: correctedImax,
            reserve: reserve
        });
    }
    
    ampacityInput.value = '';
    if (document.getElementById('itemDesc')) document.getElementById('itemDesc').value = '';
    if (powerSelect) powerSelect.selectedIndex = 0;
    
    for (let i = 0; i < materialRadios.length; i++) materialRadios[i].checked = false;
    for (let i = 0; i < wiringRadios.length; i++) wiringRadios[i].checked = false;
    
    isCalculated = false; // עריכה מבטלת את מצב החישוב
    refreshTable();
    updateButtonStates();
    toggleCalculateButton(true); // מפעיל מחדש את הכפתור לאחר שינוי
    displayProjectInfo(); // Update project info if exists
}

// הפונקציה למחיקת שורה מהטבלה
function deleteRow(index) {
    calculationRows.splice(index, 1);
    isCalculated = false; // עריכה מבטלת את מצב החישוב
    refreshTable();
    updateButtonStates();
    toggleCalculateButton(true); // מפעיל מחדש את הכפתור לאחר שינוי
    displayProjectInfo(); // Update project info if exists
}

// פונקציה לקבלת פקטור תיקון לפי מספר שורות
function getCorrectionFactor(numRows) {
    if (numRows <= 0) return 1;
    if (numRows === 1) return 1;
    if (numRows === 2) return 0.79;
    if (numRows === 3) return 0.67;
    if (numRows === 4) return 0.61;
    if (numRows === 5) return 0.56;
    return 0.53;
}

// פונקציה אולטימטיבית פשוטה לחישוב פקטור התיקון
function calculateFactorClick() {
    console.log("פונקציית calculateFactorClick הופעלה");
    
    if (calculationRows.length === 0) {
        console.log('אין שורות בטבלה לחישוב');
        return;
    }
    
    const correctionFactor = getCorrectionFactor(calculationRows.length);
    console.log("פקטור תיקון:", correctionFactor, "עבור", calculationRows.length, "שורות");
    
    let needsRecalculation = false;
    
    do {
        needsRecalculation = false;
        
        for (let i = 0; i < calculationRows.length; i++) {
            const row = calculationRows[i];
            
            calculationRows[i].factor = correctionFactor;
            calculationRows[i].correctedImax = Math.round(row.Imax * correctionFactor);
            calculationRows[i].reserve = Math.round(((calculationRows[i].correctedImax - row.ampacity) / calculationRows[i].correctedImax) * 100);
            
            console.log("שורה", i, "- ampacity:", row.ampacity, "correctedImax:", calculationRows[i].correctedImax, "reserve:", calculationRows[i].reserve + "%");
            
            if (calculationRows[i].reserve < 0) {
                console.log("שורה", i, "עם רזרבה שלילית:", calculationRows[i].reserve + "%. חיפוש כבל גדול יותר.");
                
                let currentCableIndex = -1;
                for (let j = 0; j < cablesTable.length; j++) {
                    if (cablesTable[j].Imax === row.Imax) {
                        currentCableIndex = j;
                        break;
                    }
                }
                
                if (currentCableIndex !== -1 && currentCableIndex < cablesTable.length - 1) {
                    const newCable = cablesTable[currentCableIndex + 1];
                    console.log("החלפת כבל משורה", i, "מ-", row.Imax, "ל-", newCable.Imax);
                    
                    calculationRows[i].Imax = newCable.Imax;
                    calculationRows[i].S = newCable.S;
                    calculationRows[i].correctedImax = Math.round(newCable.Imax * correctionFactor);
                    calculationRows[i].reserve = Math.round(((calculationRows[i].correctedImax - row.ampacity) / calculationRows[i].correctedImax) * 100);
                    
                    needsRecalculation = true;
                } else if (currentCableIndex === cablesTable.length - 1) {
                    console.log("נדרשת חלוקה של שורה", i, "לשני כבלים נפרדים");
                    
                    const originalAmpacity = calculationRows[i].ampacity;
                    const originalDescription = calculationRows[i].description;
                    const originalPower = calculationRows[i].power;
                    const originalMaterial = calculationRows[i].material;
                    const originalWiring = calculationRows[i].wiring;
                    const originalOriginalAmpacity = calculationRows[i].originalAmpacity; // שמירת ה-VALUE המקורי
                    
                    calculationRows.splice(i, 1);
                    
                    const splitAmpacity = Math.ceil(originalAmpacity / 2);
                    
                    for (let j = 0; j < 2; j++) {
                        const splitCable = findCableForAmpacity(splitAmpacity);
                        const splitCorrectedImax = Math.round(splitCable.Imax * correctionFactor);
                        const splitReserve = Math.round(((splitCorrectedImax - splitAmpacity) / splitCorrectedImax) * 100);
                        
                        calculationRows.splice(i + j, 0, {
                            originalAmpacity: originalOriginalAmpacity, // שימור הערך המקורי
                            description: originalDescription,
                            ampacity: splitAmpacity,
                            power: originalPower,
                            material: originalMaterial,
                            wiring: originalWiring,
                            Imax: splitCable.Imax,
                            S: splitCable.S,
                            factor: correctionFactor,
                            correctedImax: splitCorrectedImax,
                            reserve: splitReserve
                        });
                        
                        console.log("שורה מפוצלת", j + 1, "- אמפסיטי:", splitAmpacity, "Imax:", splitCable.Imax, "רזרבה:", splitReserve + "%");
                    }
                    
                    needsRecalculation = true;
                    break;
                }
            }
        }
    } while (needsRecalculation);
    
    isCalculated = true; // סימון שהחישוב בוצע
    refreshTable();
    updateButtonStates();
    toggleCalculateButton(false); // מכבה את הכפתור לאחר החישוב
    displayProjectInfo(); // Update project info if exists
    console.log("חישוב מקדם ההפחתה הושלם");
}

// פונקציה לרענון הטבלה כולה
function refreshTable() {
    const tableBody = document.querySelector('.calc-table tbody');
    if (!tableBody) {
        console.error("לא נמצא גוף הטבלה");
        return;
    }
    
    tableBody.innerHTML = '';
    
    // Create a reversed copy of calculationRows to display newest first
    const reversedRows = [...calculationRows].reverse();
    
    for (let i = 0; i < reversedRows.length; i++) {
        const row = reversedRows[i];
        const newRow = document.createElement('tr');
        const reserveColor = row.reserve < 0 ? 'red' : 'green';
        
        // Adjust the delete button index to match the original calculationRows index
        const originalIndex = calculationRows.length - 1 - i;
        newRow.innerHTML = 
            '<td>' + (row.description || '-') + '</td>' +
            '<td>' + (row.originalAmpacity || '-') + '</td>' + // הצגת הערך המקורי בעמודה החדשה
            '<td><b>' + row.ampacity + '</b></td>' +
            '<td>' + (row.power || '-') + '</td>' +
            '<td>' + (row.wiring || '-') + '</td>' +
            '<td>' + (row.material || '-') + '</td>' +
            '<td style="color: ' + reserveColor + '"><b>' + row.reserve + '%</b></td>' +
            '<td><b>' + row.correctedImax + '</b></td>' +
            '<td><b>' + row.S + '</b></td>' +
            '<td><button class="delete-btn" onclick="deleteRow(' + originalIndex + ')">×</button></td>';
        
        tableBody.appendChild(newRow);
    }
}// פונקציה להצגת המודל החדש לשמירת חישוב
function showNewCalculationModal() {
    // Reset form
    document.getElementById('calculation-name').value = currentProject ? currentProject.name || '' : '';
    document.getElementById('customer-name').value = currentProject ? currentProject.customer || '' : '';
    document.getElementById('facility-name').value = currentProject ? currentProject.facility || '' : '';
    document.getElementById('remarks').value = currentProject ? currentProject.remarks || '' : '';
    
    updateSaveButtonState();
    
    // Show modal
    const modal = document.getElementById('new-calculation-modal');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        console.error('new-calculation-modal not found in DOM');
    }
    
    // Add input event listeners to check when form is valid
    document.getElementById('calculation-name').addEventListener('input', updateSaveButtonState);
}

// פונקציה לסגירת המודל
function closeNewCalculationModal() {
    const modal = document.getElementById('new-calculation-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// פונקציה לעדכון מצב כפתור השמירה
function updateSaveButtonState() {
    const calculationName = document.getElementById('calculation-name').value.trim();
    const saveBtn = document.getElementById('save-calculation-btn');
    
    if (calculationName) {
        saveBtn.classList.add('active');
    } else {
        saveBtn.classList.remove('active');
    }
}

// פונקציה לשמירת החישוב החדש
function saveNewCalculation() {
    const calculationName = document.getElementById('calculation-name').value.trim();
    if (!calculationName) {
        return; // Don't proceed if no name provided
    }
    
    const customerName = document.getElementById('customer-name').value.trim();
    const facilityName = document.getElementById('facility-name').value.trim();
    const remarks = document.getElementById('remarks').value.trim();
    
    // Create or update project data object
    const projectData = {
        name: calculationName,
        customer: customerName,
        facility: facilityName,
        remarks: remarks,
        date: new Date().toISOString(),
        rows: JSON.parse(JSON.stringify(calculationRows)), // Deep copy of the rows
        isCalculated: isCalculated
    };
    
    // Update currentProject if editing or set new project
    currentProject = projectData;

    // Get existing saved projects or initialize empty array
    let savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    
    // If editing, update existing project; otherwise, add new one
    if (sessionStorage.getItem('editingProjectIndex') !== null) {
        const index = sessionStorage.getItem('editingProjectIndex');
        savedProjects[index] = projectData;
        sessionStorage.removeItem('editingProjectIndex');
    } else {
        savedProjects.push(projectData);
    }
    
    // Save back to localStorage
    localStorage.setItem('savedProjects', JSON.stringify(savedProjects));
    console.log('Saved projects to localStorage:', JSON.parse(localStorage.getItem('savedProjects'))); // Debug log
    
    // Close modal and redirect to dashboard with reload
    closeNewCalculationModal();
    window.location.href = 'dashboard.html'; // Redirect to dashboard to reload projects
}

// פונקציה לשמירת הטבלה כ-PDF
function saveCalculations(event) {
    event.preventDefault(); // מניעת התנהגות ברירת מחדל של הקישור
    if (calculationRows.length === 0) {
        console.log('אין נתונים לשמירה');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // הגדרות עמוד A4
    const pageHeight = 297; // גובה A4 במ"מ
    const pageWidth = 210; // רוחב A4 במ"מ
    const marginTop = 10;
    const marginBottom = 15;
    const marginLeft = 15;
    const headerHeight = 45; // גובה הכותרת ופרטי הפרויקט
    const footerHeight = 10; // גובה הפוטר
    const usableHeightFirstPage = pageHeight - marginTop - headerHeight - marginBottom;
    const usableHeightSecondPage = pageHeight - marginTop - marginBottom - footerHeight;
    let currentY = marginTop;

    // כותרת
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor('#000000');
    const title = `Calculation Results: ${currentProject?.name || 'Unnamed Project'}`;
    doc.text(title, pageWidth / 2, currentY + 10, { align: 'center' });
    currentY += 20;

    // פרטי הפרויקט - כל אחד בשורה נפרדת, מיושר לשמאל
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor('#000000');
    const projectDetails = [
        `Customer: ${currentProject?.customer || '-'}`,
        `Facility: ${currentProject?.facility || '-'}`,
        `Remarks: ${currentProject?.remarks || '-'}`,
    ];
    projectDetails.forEach((detail, index) => {
        doc.text(detail, marginLeft, currentY + (index * 7));
    });
    currentY += 25;

    // יצירת טבלה זמנית
    const tempTable = document.createElement('table');
    tempTable.className = 'calc-table';
    tempTable.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        font-family: 'Helvetica', sans-serif;
    `;
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th style="border-bottom: 1px solid #333333; padding: 8pt; font-size: 8pt; background-color: #f0f0f0; color: #000000; text-align: left; white-space: nowrap;">Item Description</th>
            <th style="border-bottom: 1px solid #333333; padding: 8pt; font-size: 8pt; background-color: #f0f0f0; color: #000000; text-align: center; white-space: nowrap;">VALUE</th>
            <th style="border-bottom: 1px solid #333333; padding: 8pt; font-size: 8pt; background-color: #f0f0f0; color: #000000; text-align: center; white-space: nowrap;">Ampacity</th>
            <th style="border-bottom: 1px solid #333333; padding: 8pt; font-size: 8pt; background-color: #f0f0f0; color: #000000; text-align: center; white-space: nowrap;">Power [Kw]</th>
            <th style="border-bottom: 1px solid #333333; padding: 8pt; font-size: 8pt; background-color: #f0f0f0; color: #000000; text-align: center; white-space: nowrap;">3 Wire/Single</th>
            <th style="border-bottom: 1px solid #333333; padding: 8pt; font-size: 8pt; background-color: #f0f0f0; color: #000000; text-align: center; white-space: nowrap;">Ai/Cu</th>
            <th style="border-bottom: 1px solid #333333; padding: 8pt; font-size: 8pt; background-color: #f0f0f0; color: #000000; text-align: center; white-space: nowrap;">Reserve (%)</th>
            <th style="border-bottom: 1px solid #333333; padding: 8pt; font-size: 8pt; background-color: #f0f0f0; color: #000000; text-align: center; white-space: nowrap;">Imax [A]</th>
            <th style="border-bottom: 1px solid #333333; padding: 8pt; font-size: 8pt; background-color: #f0f0f0; color: #000000; text-align: center; white-space: nowrap;">S [mm²]</th>
        </tr>
    `;
    tempTable.appendChild(thead);

    const tbody = document.createElement('tbody');
    calculationRows.forEach(row => {
        const tr = document.createElement('tr');
        const reserveColor = row.reserve < 0 ? 'red' : 'green';
        tr.innerHTML = `
            <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: left; width: 30%;">${row.description || '-'}</td>
            <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 40px; max-width: 40px;">${row.originalAmpacity || '-'}</td>
            <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 40px; max-width: 40px;"><b>${row.ampacity}</b></td>
            <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 30px; max-width: 30px;">${row.power || '-'}</td>
            <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 40px; max-width: 40px;">${row.wiring || '-'}</td>
            <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 30px; max-width: 30px;">${row.material || '-'}</td>
            <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 40px; max-width: 40px; color: ${reserveColor};"><b>${row.reserve}%</b></td>
            <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 40px; max-width: 40px;"><b>${row.correctedImax}</b></td>
            <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center;"><b>${row.S}</b></td>
        `;
        tbody.appendChild(tr);
    });
    tempTable.appendChild(tbody);

    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = 'position: absolute; left: -9999px; width: 180mm; padding: 0 15mm;';
    tempContainer.appendChild(tempTable);
    document.body.appendChild(tempContainer);

    html2canvas(tempTable, { scale: 2, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = 180; // 210mm - 15mm left - 15mm right
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        const rowHeight = pdfHeight / calculationRows.length; // גובה ממוצע לשורה

        // חישוב כמה שורות נכנסות בעמוד הראשון והשני
        const rowsPerFirstPage = Math.floor(usableHeightFirstPage / rowHeight);
        const remainingRows = calculationRows.length - rowsPerFirstPage;
        const maxRowsSecondPage = Math.floor(usableHeightSecondPage / rowHeight);

        if (calculationRows.length <= rowsPerFirstPage) {
            // הכל נכנס בעמוד אחד
            doc.addImage(imgData, 'PNG', marginLeft, currentY, pdfWidth, pdfHeight);
            currentY += pdfHeight + 10;

            // הוספת פוטר
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor('#000000');
            const date = new Date().toLocaleString();
            doc.text(`Generated on: ${date}`, marginLeft, currentY);
            doc.text('BES Electric Cables Cross Section Calculator', pageWidth - marginLeft, currentY, { align: 'right' });
            doc.save(`${currentProject?.name || 'calculation'}_results.pdf`);
        } else {
            // חלוקה לשני עמודים
            const firstPageRows = Math.min(rowsPerFirstPage, calculationRows.length);
            const secondPageRows = calculationRows.length - firstPageRows;

            // עמוד ראשון
            const firstPageTbody = document.createElement('tbody');
            for (let i = 0; i < firstPageRows; i++) {
                const row = calculationRows[i];
                const tr = document.createElement('tr');
                const reserveColor = row.reserve < 0 ? 'red' : 'green';
                tr.innerHTML = `
                    <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: left; width: 30%;">${row.description || '-'}</td>
                    <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 40px; max-width: 40px;">${row.originalAmpacity || '-'}</td>
                    <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 40px; max-width: 40px;"><b>${row.ampacity}</b></td>
                    <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 30px; max-width: 30px;">${row.power || '-'}</td>
                    <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 40px; max-width: 40px;">${row.wiring || '-'}</td>
                    <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 30px; max-width: 30px;">${row.material || '-'}</td>
                    <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 40px; max-width: 40px; color: ${reserveColor};"><b>${row.reserve}%</b></td>
                    <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 40px; max-width: 40px;"><b>${row.correctedImax}</b></td>
                    <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center;"><b>${row.S}</b></td>
                `;
                firstPageTbody.appendChild(tr);
            }

            const firstPageTable = document.createElement('table');
            firstPageTable.className = 'calc-table';
            firstPageTable.style.cssText = 'width: 100%; border-collapse: collapse; font-family: "Helvetica", sans-serif;';
            firstPageTable.appendChild(thead.cloneNode(true));
            firstPageTable.appendChild(firstPageTbody);

            const firstPageContainer = document.createElement('div');
            firstPageContainer.style.cssText = 'position: absolute; left: -9999px; width: 180mm; padding: 0 15mm;';
            firstPageContainer.appendChild(firstPageTable);
            document.body.appendChild(firstPageContainer);

            html2canvas(firstPageTable, { scale: 2, useCORS: true }).then(firstCanvas => {
                const firstImgData = firstCanvas.toDataURL('image/png');
                const firstImgProps = doc.getImageProperties(firstImgData);
                const firstPdfHeight = (firstImgProps.height * pdfWidth) / firstImgProps.width;
                doc.addImage(firstImgData, 'PNG', marginLeft, currentY, pdfWidth, firstPdfHeight);
                document.body.removeChild(firstPageContainer);

                // עמוד שני
                doc.addPage();
                currentY = marginTop;

                const secondPageTbody = document.createElement('tbody');
                for (let i = firstPageRows; i < calculationRows.length; i++) {
                    const row = calculationRows[i];
                    const tr = document.createElement('tr');
                    const reserveColor = row.reserve < 0 ? 'red' : 'green';
                    tr.innerHTML = `
                        <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: left; width: 30%;">${row.description || '-'}</td>
                        <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 40px; max-width: 40px;">${row.originalAmpacity || '-'}</td>
                        <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 40px; max-width: 40px;"><b>${row.ampacity}</b></td>
                        <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 30px; max-width: 30px;">${row.power || '-'}</td>
                        <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 40px; max-width: 40px;">${row.wiring || '-'}</td>
                        <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 30px; max-width: 30px;">${row.material || '-'}</td>
                        <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 40px; max-width: 40px; color: ${reserveColor};"><b>${row.reserve}%</b></td>
                        <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center; min-width: 40px; max-width: 40px;"><b>${row.correctedImax}</b></td>
                        <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: center;"><b>${row.S}</b></td>
                    `;
                    secondPageTbody.appendChild(tr);
                }

                const secondPageTable = document.createElement('table');
                secondPageTable.className = 'calc-table';
                secondPageTable.style.cssText = 'width: 100%; border-collapse: collapse; font-family: "Helvetica", sans-serif;';
                secondPageTable.appendChild(thead.cloneNode(true));
                secondPageTable.appendChild(secondPageTbody);

                const secondPageContainer = document.createElement('div');
                secondPageContainer.style.cssText = 'position: absolute; left: -9999px; width: 180mm; padding: 0 15mm;';
                secondPageContainer.appendChild(secondPageTable);
                document.body.appendChild(secondPageContainer);

                html2canvas(secondPageTable, { scale: 2, useCORS: true }).then(secondCanvas => {
                    const secondImgData = secondCanvas.toDataURL('image/png');
                    const secondImgProps = doc.getImageProperties(secondImgData);
                    const secondPdfHeight = (secondImgProps.height * pdfWidth) / secondImgProps.width;
                    doc.addImage(secondImgData, 'PNG', marginLeft, currentY, pdfWidth, secondPdfHeight);

                    // הוספת פוטר בסוף העמוד השני
                    currentY += secondPdfHeight + 10;
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor('#000000');
                    const date = new Date().toLocaleString();
                    doc.text(`Generated on: ${date}`, marginLeft, currentY);
                    doc.text('BES Electric Cables Cross Section Calculator', pageWidth - marginLeft, currentY, { align: 'right' });
                    doc.save(`${currentProject?.name || 'calculation'}_results.pdf`);

                    document.body.removeChild(secondPageContainer);
                }).catch(error => {
                    console.error('Error generating second page PDF:', error);
                    document.body.removeChild(secondPageContainer);
                });
            }).catch(error => {
                console.error('Error generating first page PDF:', error);
                document.body.removeChild(firstPageContainer);
            });
        }

        document.body.removeChild(tempContainer);
    }).catch(error => {
        console.error('Error generating PDF:', error);
        document.body.removeChild(tempContainer);
    });
}

// פונקציה להצגת מודל אישור עבור ריפרש של הטבלה
function showRefreshConfirmation() {
    const modal = document.getElementById('refresh-modal');
    modal.style.display = 'flex';
}

// פונקציה להצגת מודל אישור עבור ריסט של הטופס
function showResetConfirmation() {
    const modal = document.getElementById('reset-form-modal');
    modal.style.display = 'flex';
}

// פונקציה להצגת מודל אישור עבור איפוס הטבלה
function showResetTableConfirmation(event) {
    event.preventDefault();
    const modal = document.getElementById('reset-table-modal');
    modal.style.display = 'flex';
}

// פונקציה לאיפוס הטבלה
function resetTable() {
    calculationRows = [];
    isCalculated = false;
    currentProject = null; // Reset current project
    refreshTable();
    updateButtonStates();
    toggleCalculateButton(true); // מפעיל מחדש את הכפתור לאחר איפוס
    displayProjectInfo(); // Update project info
    const modal = document.getElementById('reset-table-modal');
    modal.style.display = 'none';
}

// פונקציה לאיפוס הטופס
function resetForm() {
    const form = document.querySelector('.calculator-form');
    form.reset();
    const modal = document.getElementById('reset-form-modal');
    modal.style.display = 'none';
}

// פונקציה לסגירת המודל בלי איפוס
function closeModal() {
    const refreshModal = document.getElementById('refresh-modal');
    const resetFormModal = document.getElementById('reset-form-modal');
    const resetTableModal = document.getElementById('reset-table-modal');
    refreshModal.style.display = 'none';
    resetFormModal.style.display = 'none';
    resetTableModal.style.display = 'none';
}

// פונקציה לשמירת החישוב (עכשיו מפעילה את המודל)
function saveCalculation(event) {
    event.preventDefault();
    if (typeof showNewCalculationModal === 'function') {
        showNewCalculationModal(); // Open the same modal as New Calculation
    } else {
        console.error('showNewCalculationModal function is not available');
    }
}

// Check if we're editing an existing project
function checkForEditingProject() {
    const urlParams = new URLSearchParams(window.location.search);
    const isEditing = urlParams.get('edit') === 'true';
    
    if (isEditing) {
        const projectData = JSON.parse(sessionStorage.getItem('editingProject') || 'null');
        const projectIndex = sessionStorage.getItem('editingProjectIndex');
        
        if (projectData) {
            // Load the project data
            calculationRows = projectData.rows;
            currentProject = projectData; // Set current project
            isCalculated = projectData.isCalculated;
            
            // Refresh the table and display project info
            refreshTable();
            displayProjectInfo();
            updateButtonStates();
            
            // Clear session storage
            sessionStorage.removeItem('editingProject');
            sessionStorage.removeItem('editingProjectIndex');
            
            // Update calculate button state
            if (isCalculated) {
                toggleCalculateButton(false);
            } else {
                toggleCalculateButton(true);
            }
        }
    }
}

// הגדרת מאזינים לאירועים בעמוד
function setupEventListeners() {
    console.log("הגדרת מאזיני אירועים");
    
    const addBtn = document.getElementById('add-btn');
    if (addBtn) {
        console.log("כפתור ADD נמצא");
        addBtn.onclick = function() {
            addRow();
            return false;
        };
    } else {
        console.log("כפתור ADD לא נמצא");
    }
    
    const calculateBtn = document.getElementById('calculate-btn');
    if (calculateBtn) {
        console.log("כפתור CALCULATE נמצא");
        calculateBtn.onclick = function() {
            calculateFactorClick();
            return false;
        };
    } else {
        console.log("כפתור CALCULATE לא נמצא");
    }
    
    const resetLink = document.getElementById('reset-link');
    if (resetLink) {
        console.log("לינק RESET נמצא");
        resetLink.onclick = function(event) {
            showResetTableConfirmation(event);
            return false;
        };
    } else {
        console.log("לינק RESET לא נמצא");
    }
    
    const downloadLink = document.getElementById('download-link');
    if (downloadLink) {
        console.log("לינק DOWNLOAD נמצא");
        downloadLink.onclick = function(event) {
            saveCalculations(event);
            return false;
        };
    } else {
        console.log("לינק DOWNLOAD לא נמצא");
    }

    const saveLink = document.getElementById('save-link');
    if (saveLink) {
        console.log("לינק SAVE נמצא");
        saveLink.onclick = function(event) {
            saveCalculation(event);
            return false;
        };
    } else {
        console.log("לינק SAVE לא נמצא");
    }

    // הוספת מאזין אירוע לכפתור Reset שבטופס להצגת המודל
    const resetBtn = document.querySelector('.reset-btn');
    if (resetBtn) {
        console.log("כפתור RESET FORM נמצא");
        resetBtn.onclick = function() {
            showResetConfirmation();
            return false;
        };
    } else {
        console.log("כפתור RESET FORM לא נמצא");
    }

    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.onclick = function() {
            showRefreshConfirmation();
            return false;
        };
    }

    // תיקון: הגדרת חדשה של מאזיני האירועים עבור כפתורי Yes/No במודלים
    const refreshYesBtn = document.getElementById('refresh-yes');
    if (refreshYesBtn) {
        console.log("כפתור refresh-yes נמצא");
        refreshYesBtn.onclick = function() {
            resetTable();
        };
    } else {
        console.log("כפתור refresh-yes לא נמצא");
    }

    const refreshNoBtn = document.getElementById('refresh-no');
    if (refreshNoBtn) {
        console.log("כפתור refresh-no נמצא");
        refreshNoBtn.onclick = function() {
            closeModal();
        };
    } else {
        console.log("כפתור refresh-no לא נמצא");
    }

    const resetFormYesBtn = document.getElementById('reset-form-yes');
    if (resetFormYesBtn) {
        console.log("כפתור reset-form-yes נמצא");
        resetFormYesBtn.onclick = function() {
            resetForm();
        };
    } else {
        console.log("כפתור reset-form-yes לא נמצא");
    }

    const resetFormNoBtn = document.getElementById('reset-form-no');
    if (resetFormNoBtn) {
        console.log("כפתור reset-form-no נמצא");
        resetFormNoBtn.onclick = function() {
            closeModal();
        };
    } else {
        console.log("כפתור reset-form-no לא נמצא");
    }

    const resetTableYesBtn = document.getElementById('reset-table-yes');
    if (resetTableYesBtn) {
        console.log("כפתור reset-table-yes נמצא");
        resetTableYesBtn.onclick = function() {
            resetTable();
        };
    } else {
        console.log("כפתור reset-table-yes לא נמצא");
    }

    const resetTableNoBtn = document.getElementById('reset-table-no');
    if (resetTableNoBtn) {
        console.log("כפתור reset-table-no נמצא");
        resetTableNoBtn.onclick = function() {
            closeModal();
        };
    } else {
        console.log("כפתור reset-table-no לא נמצא");
    }
    
    // Add input event listener for calculation name field
    const calculationNameInput = document.getElementById('calculation-name');
    if (calculationNameInput) {
        calculationNameInput.addEventListener('input', updateSaveButtonState);
    }
}

// תיקון: הוספת קריאה לפונקציה setupEventListeners עם טעינת הדף
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded - מאתחל את מאזיני האירועים");
    setupEventListeners();
    checkForEditingProject(); // Check if we're editing an existing project
    displayProjectInfo(); // Display project info on load if exists
});

// פונקציות למאזינים גלובליים בחלון
window.addRow = addRow;
window.calculateFactorClick = calculateFactorClick;
window.saveCalculations = saveCalculations;
window.saveCalculation = saveCalculation;
window.saveNewCalculation = saveNewCalculation;
window.deleteRow = deleteRow;
window.showRefreshConfirmation = showRefreshConfirmation;
window.showResetConfirmation = showResetConfirmation;
window.showResetTableConfirmation = showResetTableConfirmation;
window.resetTable = resetTable;
window.resetForm = resetForm;
window.closeModal = closeModal;
window.showNewCalculationModal = showNewCalculationModal;
window.closeNewCalculationModal = closeNewCalculationModal;
window.updateSaveButtonState = updateSaveButtonState;