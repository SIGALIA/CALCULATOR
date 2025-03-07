document.addEventListener('DOMContentLoaded', function() {
    // Initialize login system
    if (typeof initLoginSystem === 'function') {
        initLoginSystem();
    }
    
    // Load and display projects initially
    loadProjects();
    
    // Add event listener for New Calculation button
    const newCalculationBtn = document.querySelector('.new-calculation');
    if (newCalculationBtn) {
        newCalculationBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof showNewCalculationModal === 'function') {
                showNewCalculationModal(); // Call the existing modal function
            } else {
                console.error('showNewCalculationModal function is not available');
            }
        });
    }
});

// Function to load and display projects
function loadProjects() {
    // Get the projects container
    const projectsContainer = document.getElementById('projects-container');
    const noProjectsMessage = document.getElementById('no-projects-message');
    
    if (!projectsContainer || !noProjectsMessage) {
        console.error('Required DOM elements (projects-container or no-projects-message) not found');
        return;
    }
    
    // Clear existing content
    projectsContainer.innerHTML = '';
    
    // Add title with center alignment below the button
    const titleDiv = document.createElement('div');
    titleDiv.className = 'dashboard-title-center';
    const title = document.createElement('h2');
    title.className = 'dashboard-title';
    title.textContent = 'MY CALCULATIONS';
    titleDiv.appendChild(title);
    projectsContainer.appendChild(titleDiv);
    
    // Get saved projects from localStorage
    let savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    console.log('Loaded projects from localStorage:', savedProjects); // Debug log
    
    // Create a reversed copy to display newest first
    const reversedProjects = [...savedProjects].reverse();
    
    // Check if there are projects to display
    if (reversedProjects.length === 0) {
        noProjectsMessage.style.display = 'block';
        projectsContainer.appendChild(noProjectsMessage);
        console.log('No projects to display, showing no-projects message');
        return;
    }
    
    noProjectsMessage.style.display = 'none';
    
    // Create table structure
    const table = document.createElement('table');
    table.className = 'calc-table'; // Changed to match calculator table class for styling
    
    // Create table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th class="project-name-col">Project Name</th>
            <th>Customer</th>
            <th>Facility</th>
            <th>Items</th>
            <th>Date</th>
            <th>Status</th>
            <th class="action-cell">Actions</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Display each project in reversed order (newest first)
    reversedProjects.forEach((project, displayIndex) => {
        const originalIndex = savedProjects.length - 1 - displayIndex; // Map to original index
        const row = document.createElement('tr');
        
        // Format date
        const date = new Date(project.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Get summary info
        const rowsCount = project.rows.length;
        
        // Build row HTML with Feather Icons, using original index
        row.innerHTML = `
            <td class="project-name-col">${project.name}</td>
            <td>${project.customer || '-'}</td>
            <td>${project.facility || '-'}</td>
            <td>${rowsCount}</td>
            <td>${formattedDate}</td>
            <td>${project.isCalculated ? 'Calculated' : 'Not Calculated'}</td>
            <td class="action-cell">
                <button class="action-btn edit-btn" onclick="editProject(${originalIndex})" title="Edit">
                    <i data-feather="edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="showDeleteConfirmation(${originalIndex})" title="Delete">
                    <i data-feather="trash-2"></i>
                </button>
                <button class="action-btn download-btn" onclick="downloadProjectAsPDF(${originalIndex})" title="Download">
                    <i data-feather="download"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    projectsContainer.appendChild(table);
    feather.replace(); // Replace feather icons after adding them
    console.log('Table rendered with', savedProjects.length, 'projects'); // Debug log
}

// Function to edit a project
function editProject(index) {
    const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    const project = savedProjects[index];
    if (!project) return;

    sessionStorage.setItem('editingProject', JSON.stringify(project));
    sessionStorage.setItem('editingProjectIndex', index);
    window.location.href = 'index.html?edit=true';
}

// Function to show delete confirmation
function showDeleteConfirmation(index) {
    const modal = document.getElementById('delete-confirmation-modal');
    if (modal) {
        modal.style.display = 'flex';
        window.currentDeleteIndex = index;
    }
}

// Function to delete a project
function deleteProject() {
    const index = window.currentDeleteIndex;
    if (index === undefined) return;

    let savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    console.log('Before deletion - Projects:', savedProjects);

    if (index >= 0 && index < savedProjects.length) {
        const deletedProject = savedProjects.splice(index, 1)[0];
        console.log('Deleted project:', deletedProject);

        localStorage.setItem('savedProjects', JSON.stringify(savedProjects));
        console.log('After deletion - Saved projects in localStorage:', JSON.parse(localStorage.getItem('savedProjects')));

        const projectsContainer = document.getElementById('projects-container');
        const noProjectsMessage = document.getElementById('no-projects-message');

        projectsContainer.innerHTML = '';
        const titleDiv = document.createElement('div');
        titleDiv.className = 'dashboard-title-center';
        const title = document.createElement('h2');
        title.className = 'dashboard-title';
        title.textContent = 'MY CALCULATIONS';
        titleDiv.appendChild(title);
        projectsContainer.appendChild(titleDiv);

        if (savedProjects.length > 0) {
            // Create a reversed copy to display newest first
            const reversedProjects = [...savedProjects].reverse();
            
            const table = document.createElement('table');
            table.className = 'calc-table';
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th class="project-name-col">Project Name</th>
                    <th>Customer</th>
                    <th>Facility</th>
                    <th>Items</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th class="action-cell">Actions</th>
                </tr>
            `;
            table.appendChild(thead);
            const tbody = document.createElement('tbody');

            reversedProjects.forEach((project, displayIndex) => {
                const originalIndex = savedProjects.length - 1 - displayIndex; // Map to original index
                const row = document.createElement('tr');
                const date = new Date(project.date);
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                const rowsCount = project.rows.length;
                row.innerHTML = `
                    <td class="project-name-col">${project.name}</td>
                    <td>${project.customer || '-'}</td>
                    <td>${project.facility || '-'}</td>
                    <td>${rowsCount}</td>
                    <td>${formattedDate}</td>
                    <td>${project.isCalculated ? 'Calculated' : 'Not Calculated'}</td>
                    <td class="action-cell">
                        <button class="action-btn edit-btn" onclick="editProject(${originalIndex})" title="Edit">
                            <i data-feather="edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="showDeleteConfirmation(${originalIndex})" title="Delete">
                            <i data-feather="trash-2"></i>
                        </button>
                        <button class="action-btn download-btn" onclick="downloadProjectAsPDF(${originalIndex})" title="Download">
                            <i data-feather="download"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            table.appendChild(tbody);
            projectsContainer.appendChild(table);
            feather.replace();
            console.log('Table rendered with', savedProjects.length, 'remaining projects');
        } else {
            noProjectsMessage.style.display = 'block';
            projectsContainer.appendChild(noProjectsMessage);
        }
    } else {
        console.error('Invalid project index:', index);
    }
    closeDeleteConfirmation();
}

// Function to close delete confirmation modal
function closeDeleteConfirmation() {
    const modal = document.getElementById('delete-confirmation-modal');
    if (modal) {
        modal.style.display = 'none';
        delete window.currentDeleteIndex;
    }
}

// Event listeners for delete confirmation buttons
document.getElementById('delete-yes').addEventListener('click', function() {
    deleteProject();
});

document.getElementById('delete-no').addEventListener('click', function() {
    closeDeleteConfirmation();
});// Function to download project as PDF
function downloadProjectAsPDF(index) {
    const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    const project = savedProjects[index];
    if (!project) return;

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
    const title = `Calculation Results: ${project.name || 'Unnamed Project'}`;
    doc.text(title, pageWidth / 2, currentY + 10, { align: 'center' });
    currentY += 20;

    // פרטי הפרויקט - כל אחד בשורה נפרדת, מיושר לשמאל
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor('#000000');
    const projectDetails = [
        `Customer: ${project.customer || '-'}`,
        `Facility: ${project.facility || '-'}`,
        `Remarks: ${project.remarks || '-'}`,
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
        font-family: 'Noto Sans Hebrew', 'Helvetica', sans-serif;
    `;
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th style="border-bottom: 1px solid #333333; padding: 8pt; font-size: 8pt; background-color: #f0f0f0; color: #000000; text-align: left; white-space: nowrap;">Item Description</th>
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
    project.rows.forEach(row => {
        const tr = document.createElement('tr');
        const reserveColor = row.reserve < 0 ? 'red' : 'green';
        tr.innerHTML = `
            <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: left; width: 30%;">${row.description || '-'}</td>
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
        const rowHeight = pdfHeight / project.rows.length; // גובה ממוצע לשורה

        // חישוב כמה שורות נכנסות בעמוד הראשון והשני
        const rowsPerFirstPage = Math.floor(usableHeightFirstPage / rowHeight);
        const remainingRows = project.rows.length - rowsPerFirstPage;
        const maxRowsSecondPage = Math.floor(usableHeightSecondPage / rowHeight);

        if (project.rows.length <= rowsPerFirstPage) {
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
            doc.save(`${project.name}_calculation_results.pdf`);
        } else {
            // חלוקה לשני עמודים
            const firstPageRows = Math.min(rowsPerFirstPage, project.rows.length);
            const secondPageRows = project.rows.length - firstPageRows;

            // עמוד ראשון
            const firstPageTbody = document.createElement('tbody');
            for (let i = 0; i < firstPageRows; i++) {
                const row = project.rows[i];
                const tr = document.createElement('tr');
                const reserveColor = row.reserve < 0 ? 'red' : 'green';
                tr.innerHTML = `
                    <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: left; width: 30%;">${row.description || '-'}</td>
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
            firstPageTable.style.cssText = 'width: 100%; border-collapse: collapse; font-family: "Noto Sans Hebrew", "Helvetica", sans-serif;';
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
                for (let i = firstPageRows; i < project.rows.length; i++) {
                    const row = project.rows[i];
                    const tr = document.createElement('tr');
                    const reserveColor = row.reserve < 0 ? 'red' : 'green';
                    tr.innerHTML = `
                        <td style="border-bottom: 1px solid #333333; padding: 12pt; font-size: 10pt; text-align: left; width: 30%;">${row.description || '-'}</td>
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
                secondPageTable.style.cssText = 'width: 100%; border-collapse: collapse; font-family: "Noto Sans Hebrew", "Helvetica", sans-serif;';
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
                    doc.save(`${project.name}_calculation_results.pdf`);

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

// Expose functions to global scope
window.editProject = editProject;
window.deleteProject = deleteProject;
window.loadProjects = loadProjects;
window.showDeleteConfirmation = showDeleteConfirmation;
window.closeDeleteConfirmation = closeDeleteConfirmation;
window.downloadProjectAsPDF = downloadProjectAsPDF;