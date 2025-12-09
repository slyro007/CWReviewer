import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, File, Code } from 'lucide-react';
import jsPDF from 'jspdf';
import type { EmployeeMetrics, ExportOptions } from '../types';
import { formatDate, formatDateTime } from '../utils/dateHelpers';

interface WorkExportProps {
  metrics: EmployeeMetrics;
}

const WorkExport: React.FC<WorkExportProps> = ({ metrics }) => {
  const [exportFormat, setExportFormat] = useState<ExportOptions['format']>('pdf');
  const [exportOptions, setExportOptions] = useState<ExportOptions['includeSections']>({
    timeEntries: true,
    projects: true,
    notes: true,
    metrics: true,
    comparisons: false,
    review: false,
  });
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      switch (exportFormat) {
        case 'pdf':
          await exportToPDF();
          break;
        case 'excel':
          await exportToExcel();
          break;
        case 'word':
          await exportToWord();
          break;
        case 'json':
          exportToJSON();
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = async () => {
    const doc = new jsPDF();
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.text('Employee Work Report', 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.text(`Employee: ${metrics.memberName}`, 20, yPos);
    yPos += 8;
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPos);
    yPos += 15;

    // Metrics Summary
    if (exportOptions.metrics) {
      doc.setFontSize(16);
      doc.text('Summary Metrics', 20, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.text(`Total Hours: ${metrics.totalHours.toFixed(1)}`, 20, yPos);
      yPos += 7;
      doc.text(`Total Projects: ${metrics.totalProjects}`, 20, yPos);
      yPos += 7;
      doc.text(`Total Tickets: ${metrics.totalTickets}`, 20, yPos);
      yPos += 7;
      doc.text(`Average Note Quality: ${metrics.averageNoteQuality.toFixed(0)}/100`, 20, yPos);
      yPos += 15;
    }

    // Time Entries
    if (exportOptions.timeEntries && metrics.timeEntries.length > 0) {
      doc.setFontSize(16);
      doc.text('Time Entries', 20, yPos);
      yPos += 10;

      doc.setFontSize(10);
      metrics.timeEntries.slice(0, 50).forEach((entry, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(
          `${formatDate(entry.timeStart)} - ${entry.actualHours?.toFixed(2) || '0.00'}h - Ticket: ${entry.ticketId || 'N/A'}`,
          20,
          yPos
        );
        yPos += 6;
      });
      yPos += 10;
    }

    // Projects
    if (exportOptions.projects && metrics.projects.length > 0) {
      doc.setFontSize(16);
      doc.text('Project Contributions', 20, yPos);
      yPos += 10;

      doc.setFontSize(10);
      metrics.projects.forEach((project) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(
          `${project.projectName} - ${project.totalHours.toFixed(2)} hours`,
          20,
          yPos
        );
        yPos += 6;
      });
    }

    doc.save(`${metrics.memberName}_Work_Report.pdf`);
  };

  const exportToExcel = () => {
    // Create CSV content
    let csv = 'Employee Work Report\n';
    csv += `Employee,${metrics.memberName}\n`;
    csv += `Generated,${new Date().toLocaleDateString()}\n\n`;

    if (exportOptions.metrics) {
      csv += 'Summary Metrics\n';
      csv += `Total Hours,${metrics.totalHours.toFixed(1)}\n`;
      csv += `Total Projects,${metrics.totalProjects}\n`;
      csv += `Total Tickets,${metrics.totalTickets}\n`;
      csv += `Average Note Quality,${metrics.averageNoteQuality.toFixed(0)}\n\n`;
    }

    if (exportOptions.timeEntries) {
      csv += 'Time Entries\n';
      csv += 'Date,Hours,Ticket ID,Project ID,Notes\n';
      metrics.timeEntries.forEach((entry) => {
        csv += `${formatDate(entry.timeStart)},${entry.actualHours || 0},${entry.ticketId || ''},${entry.projectId || ''},"${(entry.notes || '').replace(/"/g, '""')}"\n`;
      });
      csv += '\n';
    }

    if (exportOptions.projects) {
      csv += 'Projects\n';
      csv += 'Project Name,Hours,Entries\n';
      metrics.projects.forEach((project) => {
        csv += `${project.projectName},${project.totalHours.toFixed(2)},${project.entries.length}\n`;
      });
    }

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metrics.memberName}_Work_Report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToWord = () => {
    // Simple HTML-based Word export
    let html = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Employee Work Report</title>
        </head>
        <body>
          <h1>Employee Work Report</h1>
          <p><strong>Employee:</strong> ${metrics.memberName}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
          
          ${exportOptions.metrics ? `
            <h2>Summary Metrics</h2>
            <ul>
              <li>Total Hours: ${metrics.totalHours.toFixed(1)}</li>
              <li>Total Projects: ${metrics.totalProjects}</li>
              <li>Total Tickets: ${metrics.totalTickets}</li>
              <li>Average Note Quality: ${metrics.averageNoteQuality.toFixed(0)}/100</li>
            </ul>
          ` : ''}
          
          ${exportOptions.timeEntries ? `
            <h2>Time Entries</h2>
            <table border="1" cellpadding="5">
              <tr>
                <th>Date</th>
                <th>Hours</th>
                <th>Ticket ID</th>
                <th>Notes</th>
              </tr>
              ${metrics.timeEntries.map(entry => `
                <tr>
                  <td>${formatDate(entry.timeStart)}</td>
                  <td>${entry.actualHours?.toFixed(2) || '0.00'}</td>
                  <td>${entry.ticketId || 'N/A'}</td>
                  <td>${entry.notes || ''}</td>
                </tr>
              `).join('')}
            </table>
          ` : ''}
          
          ${exportOptions.projects ? `
            <h2>Projects</h2>
            <table border="1" cellpadding="5">
              <tr>
                <th>Project Name</th>
                <th>Hours</th>
                <th>Entries</th>
              </tr>
              ${metrics.projects.map(project => `
                <tr>
                  <td>${project.projectName}</td>
                  <td>${project.totalHours.toFixed(2)}</td>
                  <td>${project.entries.length}</td>
                </tr>
              `).join('')}
            </table>
          ` : ''}
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/msword' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metrics.memberName}_Work_Report.doc`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const data = {
      employee: metrics.memberName,
      generated: new Date().toISOString(),
      metrics: exportOptions.metrics ? {
        totalHours: metrics.totalHours,
        totalProjects: metrics.totalProjects,
        totalTickets: metrics.totalTickets,
        averageNoteQuality: metrics.averageNoteQuality,
      } : undefined,
      timeEntries: exportOptions.timeEntries ? metrics.timeEntries : undefined,
      projects: exportOptions.projects ? metrics.projects : undefined,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metrics.memberName}_Work_Report.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gradient">Export Work Data</h2>
        <p className="text-gray-400 mt-2">
          Download comprehensive work reports in various formats
        </p>
      </motion.div>

      {/* Format Selection */}
      <div className="glass-bright p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Export Format</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'pdf' as const, label: 'PDF', icon: <FileText className="w-6 h-6" /> },
            { id: 'excel' as const, label: 'Excel/CSV', icon: <FileSpreadsheet className="w-6 h-6" /> },
            { id: 'word' as const, label: 'Word', icon: <File className="w-6 h-6" /> },
            { id: 'json' as const, label: 'JSON', icon: <Code className="w-6 h-6" /> },
          ].map((format) => (
            <button
              key={format.id}
              onClick={() => setExportFormat(format.id)}
              className={`p-6 rounded-xl border-2 transition-all ${
                exportFormat === format.id
                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                  : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                {format.icon}
                <span className="font-semibold">{format.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Section Selection */}
      <div className="glass-bright p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Include Sections</h3>
        <div className="space-y-3">
          {Object.entries(exportOptions).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={value}
                onChange={(e) =>
                  setExportOptions({
                    ...exportOptions,
                    [key]: e.target.checked,
                  })
                }
                className="w-5 h-5 text-cyan-400 rounded focus:ring-cyan-400"
              />
              <span className="text-gray-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          {exporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
};

export default WorkExport;

