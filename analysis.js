// Analysis Dashboard Functionality
let simulationResults = JSON.parse(localStorage.getItem('simulationResults')) || [];
let simulationConfig = JSON.parse(localStorage.getItem('simulationConfig')) || {};

// Chart instances
let massBalanceChart, efficacyChart, priorityChart, instanceChart;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    updateDashboardStats();
    initializeCharts();
    updateResultsTable();
    
    // Show message if no simulation results exist
    if (simulationResults.length === 0) {
        showNoDataMessage();
    }
});

function showNoDataMessage() {
    const container = document.querySelector('.container');
    const noDataDiv = document.createElement('div');
    noDataDiv.className = 'no-data-message';
    noDataDiv.innerHTML = `
        <div style="text-align: center; padding: 3rem; background: white; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); margin: 2rem 0;">
            <h3>No Simulation Results Available</h3>
            <p>To see analysis data, please:</p>
            <ol style="text-align: left; display: inline-block; margin: 1rem 0;">
                <li>Go to the <a href="import.html">Drug Import</a> page</li>
                <li>Add demo drugs or import your own data</li>
                <li>Configure simulation parameters</li>
                <li>Start the simulation</li>
            </ol>
            <div style="margin-top: 2rem;">
                <a href="import.html" class="btn btn-primary">Go to Drug Import</a>
            </div>
        </div>
    `;
    
    // Insert after the page subtitle
    const subtitle = document.querySelector('.page-subtitle');
    if (subtitle) {
        subtitle.parentNode.insertBefore(noDataDiv, subtitle.nextSibling);
    }
}

function updateDashboardStats() {
    const totalDrugs = simulationResults.length;
    const activeSimulations = simulationResults.filter(r => r.status === 'Running').length;
    const completedTests = simulationResults.filter(r => r.status === 'Completed').length;
    const avgConfidence = totalDrugs > 0 ? 
        (simulationResults.reduce((sum, r) => sum + r.mbConfidence, 0) / totalDrugs * 100).toFixed(1) : 0;
    
    document.getElementById('totalDrugs').textContent = totalDrugs;
    document.getElementById('activeSimulations').textContent = activeSimulations;
    document.getElementById('completedTests').textContent = completedTests;
    document.getElementById('avgConfidence').textContent = avgConfidence + '%';
}

function initializeCharts() {
    // Mass Balance Distribution Chart
    const mbCtx = document.getElementById('massBalanceChart').getContext('2d');
    massBalanceChart = new Chart(mbCtx, {
        type: 'doughnut',
        data: {
            labels: ['High MB (0.8-1.0)', 'Medium MB (0.6-0.8)', 'Low MB (0.4-0.6)', 'Very Low MB (0-0.4)'],
            datasets: [{
                data: getMassBalanceDistribution(),
                backgroundColor: ['#28a745', '#ffc107', '#fd7e14', '#dc3545'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Efficacy vs Side Effects Scatter Chart
    const efficacyCtx = document.getElementById('efficacyChart').getContext('2d');
    efficacyChart = new Chart(efficacyCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Drugs',
                data: simulationResults.map(r => ({
                    x: r.efficacy,
                    y: r.sideEffects,
                    drugName: r.name
                })),
                backgroundColor: 'rgba(0, 123, 255, 0.6)',
                borderColor: '#007bff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Efficacy (%)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Side Effects Score'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.parsed;
                            const drugName = context.raw.drugName;
                            return `${drugName}: Efficacy ${point.x.toFixed(1)}%, Side Effects ${point.y}`;
                        }
                    }
                }
            }
        }
    });
    
    // Priority Queue Status Chart
    const priorityCtx = document.getElementById('priorityChart').getContext('2d');
    priorityChart = new Chart(priorityCtx, {
        type: 'bar',
        data: {
            labels: ['Priority 1', 'Priority 2', 'Priority 3', 'Priority 4', 'Priority 5'],
            datasets: [{
                label: 'Number of Drugs',
                data: getPriorityDistribution(),
                backgroundColor: [
                    '#dc3545',
                    '#fd7e14',
                    '#ffc107',
                    '#28a745',
                    '#17a2b8'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    // Instance Distribution Chart
    const instanceCtx = document.getElementById('instanceChart').getContext('2d');
    instanceChart = new Chart(instanceCtx, {
        type: 'pie',
        data: {
            labels: ['Instance 1', 'Instance 2', 'Instance 3'],
            datasets: [{
                data: getInstanceDistribution(),
                backgroundColor: ['#007bff', '#28a745', '#ffc107'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function getMassBalanceDistribution() {
    const distribution = [0, 0, 0, 0]; // High, Medium, Low, Very Low
    
    simulationResults.forEach(result => {
        const mb = result.mbScore;
        if (mb >= 0.8) distribution[0]++;
        else if (mb >= 0.6) distribution[1]++;
        else if (mb >= 0.4) distribution[2]++;
        else distribution[3]++;
    });
    
    return distribution;
}

function getPriorityDistribution() {
    const distribution = [0, 0, 0, 0, 0]; // Priority 1-5
    
    simulationResults.forEach(result => {
        if (result.priority >= 1 && result.priority <= 5) {
            distribution[result.priority - 1]++;
        }
    });
    
    return distribution;
}

function updateResultsTable() {
    const tableBody = document.getElementById('resultsTableBody');
    
    if (simulationResults.length === 0) {
        tableBody.innerHTML = '<tr class="empty-row"><td colspan="10">No simulation results available. Import drugs and run simulations first.</td></tr>';
        return;
    }
    
    // For large datasets, implement pagination or virtual scrolling
    const maxDisplayRows = 100; // Limit initial display to 100 rows
    const displayResults = simulationResults.slice(0, maxDisplayRows);
    
    tableBody.innerHTML = displayResults.map(result => `
        <tr>
            <td>${result.name}</td>
            <td>${result.complexity}</td>
            <td>${result.priority}</td>
            <td>${result.efficacy.toFixed(1)}%</td>
            <td>${result.sideEffects}</td>
            <td>${result.mbScore.toFixed(3)}</td>
            <td>${(result.mbConfidence * 100).toFixed(1)}%</td>
            <td>Instance ${result.assignedInstance ? result.assignedInstance.instanceId : 'N/A'}</td>
            <td>
                <span class="status-badge status-${result.status.toLowerCase().replace(' ', '-')}">
                    ${result.status}
                </span>
            </td>
            <td>
                <button class="btn btn-secondary" onclick="viewDetails(${result.id})" style="padding: 5px 10px; font-size: 0.8rem;">
                    Details
                </button>
            </td>
        </tr>
    `).join('');
    
    // Add pagination info if needed
    if (simulationResults.length > maxDisplayRows) {
        const paginationInfo = document.createElement('div');
        paginationInfo.className = 'pagination-info';
        paginationInfo.innerHTML = `
            <p style="text-align: center; margin: 1rem 0; color: #666;">
                Showing first ${maxDisplayRows} of ${simulationResults.length} results. 
                <button class="btn btn-secondary" onclick="showAllResults()" style="margin-left: 10px;">
                    Show All Results
                </button>
            </p>
        `;
        tableBody.parentNode.appendChild(paginationInfo);
    }
    
    // Add status badge styles
    addStatusBadgeStyles();
}

function showAllResults() {
    const tableBody = document.getElementById('resultsTableBody');
    const paginationInfo = document.querySelector('.pagination-info');
    
    if (paginationInfo) {
        paginationInfo.remove();
    }
    
    // Show loading indicator for large datasets
    if (simulationResults.length > 500) {
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 2rem;">Loading all results...</td></tr>';
        
        setTimeout(() => {
            renderAllResults();
        }, 100);
    } else {
        renderAllResults();
    }
}

function renderAllResults() {
    const tableBody = document.getElementById('resultsTableBody');
    
    tableBody.innerHTML = simulationResults.map(result => `
        <tr>
            <td>${result.name}</td>
            <td>${result.complexity}</td>
            <td>${result.priority}</td>
            <td>${result.efficacy.toFixed(1)}%</td>
            <td>${result.sideEffects}</td>
            <td>${result.mbScore.toFixed(3)}</td>
            <td>${(result.mbConfidence * 100).toFixed(1)}%</td>
            <td>Instance ${result.assignedInstance ? result.assignedInstance.instanceId : 'N/A'}</td>
            <td>
                <span class="status-badge status-${result.status.toLowerCase().replace(' ', '-')}">
                    ${result.status}
                </span>
            </td>
            <td>
                <button class="btn btn-secondary" onclick="viewDetails(${result.id})" style="padding: 5px 10px; font-size: 0.8rem;">
                    Details
                </button>
            </td>
        </tr>
    `).join('');
}

function addStatusBadgeStyles() {
    if (!document.getElementById('statusBadgeStyles')) {
        const style = document.createElement('style');
        style.id = 'statusBadgeStyles';
        style.textContent = `
            .status-badge {
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.8rem;
                font-weight: 600;
                text-transform: uppercase;
            }
            .status-completed {
                background-color: #d4edda;
                color: #155724;
            }
            .status-needs-review {
                background-color: #fff3cd;
                color: #856404;
            }
            .status-running {
                background-color: #cce7ff;
                color: #004085;
            }
            .status-failed {
                background-color: #f8d7da;
                color: #721c24;
            }
        `;
        document.head.appendChild(style);
    }
}

function viewDetails(drugId) {
    const drug = simulationResults.find(r => r.id === drugId);
    if (!drug) return;
    
    let routingDetails = '';
    if (drug.routingProbabilities) {
        routingDetails = '\n\nRouting Probabilities:\n' + 
            drug.routingProbabilities.map(rp => 
                `Instance ${rp.instanceId}: ${(rp.probability * 100).toFixed(1)}% (Weight: ${rp.weight.toFixed(3)})`
            ).join('\n');
    }
    
    const effectiveWeightFormula = drug.assignedInstance ? 
        `\nEffective Weight Calculation:\nW_${drug.assignedInstance.instanceId},d = ${drug.assignedInstance.capacity} × (${drug.priority}/${drug.complexity}) × ${drug.mbScore.toFixed(3)} = ${drug.assignedInstance.weight.toFixed(3)}` : '';
    
    const details = `
        Drug: ${drug.name}
        Complexity (C_d): ${drug.complexity}/10
        Priority (I_d): ${drug.priority}/5
        Efficacy: ${drug.efficacy.toFixed(1)}%
        Side Effects: ${drug.sideEffects}/10
        Mass Balance Score (MB_k): ${drug.mbScore.toFixed(3)}
        Confidence: ${(drug.mbConfidence * 100).toFixed(1)}%
        Assigned Instance: ${drug.assignedInstance ? `Instance ${drug.assignedInstance.instanceId} (Capacity: ${drug.assignedInstance.capacity})` : 'N/A'}
        Status: ${drug.status}
        ${effectiveWeightFormula}
        ${routingDetails}
        
        ${drug.description ? 'Description: ' + drug.description : ''}
    `;
    
    alert(details);
}

function exportToCSV() {
    if (simulationResults.length === 0) {
        alert('No data to export. Run simulations first.');
        return;
    }
    
    const headers = ['Drug Name', 'Complexity', 'Priority', 'Efficacy', 'Side Effects', 'MB Score', 'Confidence', 'Status'];
    const csvContent = [
        headers.join(','),
        ...simulationResults.map(result => [
            result.name,
            result.complexity,
            result.priority,
            result.efficacy.toFixed(1),
            result.sideEffects,
            result.mbScore.toFixed(3),
            (result.mbConfidence * 100).toFixed(1),
            result.status
        ].join(','))
    ].join('\n');
    
    downloadFile(csvContent, 'pharma-analysis-results.csv', 'text/csv');
}

function exportToJSON() {
    if (simulationResults.length === 0) {
        alert('No data to export. Run simulations first.');
        return;
    }
    
    const jsonContent = JSON.stringify({
        results: simulationResults,
        config: simulationConfig,
        exportDate: new Date().toISOString()
    }, null, 2);
    
    downloadFile(jsonContent, 'pharma-analysis-results.json', 'application/json');
}

function generateReport() {
    if (simulationResults.length === 0) {
        alert('No data to generate report. Run simulations first.');
        return;
    }
    
    const report = generateHTMLReport();
    downloadFile(report, 'pharma-analysis-report.html', 'text/html');
}

function generateHTMLReport() {
    const totalDrugs = simulationResults.length;
    const avgMB = (simulationResults.reduce((sum, r) => sum + r.mbScore, 0) / totalDrugs).toFixed(3);
    const avgConfidence = (simulationResults.reduce((sum, r) => sum + r.mbConfidence, 0) / totalDrugs * 100).toFixed(1);
    const highPriorityDrugs = simulationResults.filter(r => r.priority >= 4).length;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>PharmaBalance Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .summary-item { text-align: center; }
        .summary-value { font-size: 2rem; font-weight: bold; color: #007bff; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
        .footer { margin-top: 30px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>PharmaBalance Analysis Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <h2>Summary Statistics</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-value">${totalDrugs}</div>
                <div>Total Drugs</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${avgMB}</div>
                <div>Avg MB Score</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${avgConfidence}%</div>
                <div>Avg Confidence</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${highPriorityDrugs}</div>
                <div>High Priority Drugs</div>
            </div>
        </div>
    </div>
    
    <h2>Detailed Results</h2>
    <table>
        <thead>
            <tr>
                <th>Drug Name</th>
                <th>Complexity</th>
                <th>Priority</th>
                <th>Efficacy</th>
                <th>Side Effects</th>
                <th>MB Score</th>
                <th>Confidence</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${simulationResults.map(result => `
                <tr>
                    <td>${result.name}</td>
                    <td>${result.complexity}</td>
                    <td>${result.priority}</td>
                    <td>${result.efficacy.toFixed(1)}%</td>
                    <td>${result.sideEffects}</td>
                    <td>${result.mbScore.toFixed(3)}</td>
                    <td>${(result.mbConfidence * 100).toFixed(1)}%</td>
                    <td>${result.status}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="footer">
        <p>Report generated by PharmaBalance - Serverless Drug Efficacy Testing Platform</p>
    </div>
</body>
</html>
    `;
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function clearAllData() {
    if (confirm('This will clear all imported drugs and simulation results. Are you sure?')) {
        localStorage.removeItem('importedDrugs');
        localStorage.removeItem('simulationResults');
        localStorage.removeItem('simulationConfig');
        location.reload();
    }
}

function refreshAnalysis() {
    // Reload data from localStorage
    simulationResults = JSON.parse(localStorage.getItem('simulationResults')) || [];
    simulationConfig = JSON.parse(localStorage.getItem('simulationConfig')) || {};
    
    // Remove no-data message if it exists
    const noDataMessage = document.querySelector('.no-data-message');
    if (noDataMessage) {
        noDataMessage.remove();
    }
    
    // Update all components
    updateDashboardStats();
    updateResultsTable();
    
    // Update charts
    if (massBalanceChart) {
        massBalanceChart.data.datasets[0].data = getMassBalanceDistribution();
        massBalanceChart.update();
    }
    
    if (efficacyChart) {
        efficacyChart.data.datasets[0].data = simulationResults.map(r => ({
            x: r.efficacy,
            y: r.sideEffects,
            drugName: r.name
        }));
        efficacyChart.update();
    }
    
    if (priorityChart) {
        priorityChart.data.datasets[0].data = getPriorityDistribution();
        priorityChart.update();
    }

    if (instanceChart) {
        instanceChart.data.datasets[0].data = getInstanceDistribution();
        instanceChart.update();
    }
    
    // Show no data message if still no results
    if (simulationResults.length === 0) {
        showNoDataMessage();
    }
}

// Listen for storage changes to refresh when new simulation data is available
window.addEventListener('storage', function(e) {
    if (e.key === 'simulationResults') {
        refreshAnalysis();
    }
});

function getInstanceDistribution() {
    const distribution = [0, 0, 0]; // Instance 1, 2, 3
    
    simulationResults.forEach(result => {
        if (result.assignedInstance) {
            const instanceIndex = result.assignedInstance.instanceId - 1;
            if (instanceIndex >= 0 && instanceIndex < 3) {
                distribution[instanceIndex]++;
            }
        }
    });
    
    return distribution;
}

function calculateMassBalance(efficacy, sideEffects) {
    // Enhanced Mass Balance calculation based on pharmaceutical principles
    // Higher efficacy increases score, higher side effects decrease it
    const efficacyScore = efficacy / 100; // Normalize to 0-1
    const sideEffectPenalty = sideEffects / 10; // Normalize to 0-1
    
    // Base MB score with weighted factors
    const baseScore = (efficacyScore * 0.7) + ((1 - sideEffectPenalty) * 0.3);
    
    // Add some realistic variation
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    
    return Math.max(0.1, Math.min(1.0, baseScore + variation));
}