import { useState, useEffect } from 'react';
import {
  FiDownload,
  FiFileText,
  FiFile,
  FiBarChart2,
  FiCalendar,
} from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import api from '../api/axios';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const Reports = () => {
  const [complaints, setComplaints] = useState([]);
  const [welfare, setWelfare] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('complaints');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cRes, wRes] = await Promise.all([
        api.get('/complaints'),
        api.get('/welfare'),
      ]);
      setComplaints(cRes.data);
      setWelfare(wRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterByDate = (items) => {
    return items.filter((item) => {
      const itemDate = new Date(item.createdAt);
      if (startDate && itemDate < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59);
        if (itemDate > end) return false;
      }
      return true;
    });
  };

  const getFilteredData = () => {
    if (reportType === 'complaints') return filterByDate(complaints);
    return filterByDate(welfare);
  };

  const exportPDF = () => {
    const data = getFilteredData();
    const doc = new jsPDF();

    // Logo (top) — bundled via Vite so it works in dev & build
    const logoUrl = new URL('../assets/logo.png', import.meta.url).href;
    try {
      doc.addImage(logoUrl, 'PNG', 14, 8, 22, 22);
    } catch {
      /* logo optional — never block PDF export */
    }

    // Title
    doc.setFontSize(20);
    doc.setTextColor(34, 197, 94);
    doc.text('Umeed', 42, 20);

    doc.setFontSize(11);
    doc.setTextColor(22, 163, 74);
    doc.text('Your Hope, Our Mission', 42, 27);

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `${reportType === 'complaints' ? 'Complaints' : 'Welfare'} Report`,
      14,
      40
    );

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 14, 48);
    if (startDate || endDate) {
      doc.text(
        `Period: ${startDate || 'Start'} to ${endDate || 'Today'}`,
        14,
        54
      );
    }

    // Table
    if (reportType === 'complaints') {
      autoTable(doc, {
        startY: 62,
        head: [['Date', 'User', 'Category', 'Location', 'Priority', 'Status']],
        body: data.map((c) => [
          format(new Date(c.createdAt), 'MMM dd, yyyy'),
          c.user?.name || 'N/A',
          c.category,
          c.location?.building || 'N/A',
          c.priority,
          c.status,
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [34, 197, 94] },
      });
    } else {
      autoTable(doc, {
        startY: 62,
        head: [['Date', 'Applicant', 'Type', 'Amount', 'Fund', 'Status']],
        body: data.map((w) => [
          format(new Date(w.createdAt), 'MMM dd, yyyy'),
          w.user?.name || 'N/A',
          w.type,
          `PKR ${w.amountRequested?.toLocaleString()}`,
          w.fundType,
          w.status,
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [34, 197, 94] },
      });
    }

    doc.save(`${reportType}-report-${Date.now()}.pdf`);
    toast.success('PDF downloaded');
  };

  const exportExcel = () => {
    const data = getFilteredData();
    let excelData;

    if (reportType === 'complaints') {
      excelData = data.map((c) => ({
        Date: format(new Date(c.createdAt), 'MMM dd, yyyy'),
        User: c.user?.name || 'N/A',
        Email: c.user?.email || 'N/A',
        Category: c.category,
        Location: c.location?.building || 'N/A',
        Priority: c.priority,
        Status: c.status,
        Description: c.description,
      }));
    } else {
      excelData = data.map((w) => ({
        Date: format(new Date(w.createdAt), 'MMM dd, yyyy'),
        Applicant: w.user?.name || 'N/A',
        Email: w.user?.email || 'N/A',
        Type: w.type,
        Amount: w.amountRequested,
        Fund: w.fundType,
        Status: w.status,
        Reason: w.reason,
      }));
    }

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${reportType}-report-${Date.now()}.xlsx`);
    toast.success('Excel downloaded');
  };

  const exportCSV = () => {
    const data = getFilteredData();
    let csvContent = '';

    if (reportType === 'complaints') {
      csvContent = 'Date,User,Email,Category,Location,Priority,Status\n';
      data.forEach((c) => {
      csvContent += `${format(new Date(c.createdAt), 'yyyy-MM-dd')},${c.user?.name || 'N/A'},${c.user?.email || 'N/A'},${c.category},${c.location?.building || 'N/A'},${c.priority},${c.status}\n`;
      });
    } else {
      csvContent = 'Date,Applicant,Email,Type,Amount,Fund,Status\n';
      data.forEach((w) => {
        csvContent += `${format(new Date(w.createdAt), 'yyyy-MM-dd')},${
          w.user?.name || 'N/A'
        },${w.user?.email || 'N/A'},${w.type},${w.amountRequested},${w.fundType},${
          w.status
        }\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${reportType}-report-${Date.now()}.csv`;
    link.click();
    toast.success('CSV downloaded');
  };

  if (loading) return <Loader />;

  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reports & Export</h1>
        <p className="text-gray-500 text-sm">
          Generate and download reports in multiple formats
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiBarChart2 className="text-primary" /> Report Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="complaints">Complaints Report</option>
              <option value="welfare">Welfare Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>
      </div>

      {/* Preview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Records</p>
          <p className="text-3xl font-bold text-primary mt-1">
            {filteredData.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Report Type</p>
          <p className="text-xl font-bold text-gray-800 mt-1 capitalize">
            {reportType}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Date Range</p>
          <p className="text-sm font-bold text-gray-800 mt-1">
            {startDate || endDate
              ? `${startDate || 'Start'} → ${endDate || 'Today'}`
              : 'All Time'}
          </p>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiDownload className="text-primary" /> Export Options
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={exportPDF}
            disabled={filteredData.length === 0}
            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiFileText /> Export as PDF
          </button>

          <button
            onClick={exportExcel}
            disabled={filteredData.length === 0}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiFile /> Export as Excel
          </button>

          <button
            onClick={exportCSV}
            disabled={filteredData.length === 0}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiDownload /> Export as CSV
          </button>
        </div>

        {filteredData.length === 0 && (
          <p className="text-sm text-gray-500 mt-3 text-center">
            No data available for the selected filters
          </p>
        )}
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Preview</h3>
          <p className="text-sm text-gray-500">
            Showing first 10 records of {filteredData.length}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                  {reportType === 'complaints' ? 'User' : 'Applicant'}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                  {reportType === 'complaints' ? 'Category' : 'Type'}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                  {reportType === 'complaints' ? 'Location' : 'Amount'}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.slice(0, 10).map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {item.user?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                    {reportType === 'complaints' ? item.category : item.type}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {reportType === 'complaints' ? item.location?.building || 'N/A' : `PKR ${item.amountRequested?.toLocaleString()}`}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                      {item.status?.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
