import React, { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/SemFeeTable.css';
import AutoCompleteSearch from './AutoCompleteSearch';
import { FaSearch } from 'react-icons/fa';

const SemFeeTable = ({ selectedMonth = null, selectedCollege = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchFields] = useState(['firstName', 'lastName', 'transactionId', 'college']);

  useEffect(() => {
    fetch("http://localhost:5000/students/all")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  const filteredStudents = useMemo(() => {
      let filtered = students;
  
      // Filter by college if selected
      if (selectedCollege) {
        filtered = filtered.filter(student => 
          student?.college?.toLowerCase() === selectedCollege.toLowerCase()
        );
      }
      
      // Filter by search term if present
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(student => {
          const firstName = student?.firstName || '';
          const lastName = student?.lastName || '';
          const transactionId = student?.transactionId || '';
          const college = student?.college || '';
          return firstName.toLowerCase().includes(searchLower) ||
                 lastName.toLowerCase().includes(searchLower) ||
                 transactionId.toString().includes(searchLower) ||
                 college.toLowerCase().includes(searchLower);
        });
      }
  
      return filtered;
    }, [students, searchTerm, selectedCollege]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, selectedCollege, searchTerm]);

  // Function to handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setSearchTerm(suggestion);
    // Trigger the search immediately when a suggestion is selected
    handleSearch(suggestion);
  };

  // Modified handleSearch function
  const handleSearch = async (term = searchTerm) => {
    setSearchTerm(term);
  };

  if (!students.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="semfee-table-wrapper">
      <div className="semfee-table-header">
        <div className="semfee-table-title-section">
          <h2 className="semfee-table-title">
            Semester Fee Records
            {selectedCollege && <span> - {selectedCollege}</span>}
          </h2>
          <p className="semfee-table-date">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="semfee-table-search">
          <AutoCompleteSearch
            onSearch={handleSearch}
            onSuggestionSelect={handleSuggestionSelect}
            searchFields={searchFields}
              placeholder="Search by name, transaction ID, or college..."
            />
        </div>
      </div>

      <div className="semfee-table-container">
        <table className="semfee-table">
          <thead>
            <tr className="semfee-table-header-row">
              <th className="semfee-table-header-cell">Upload Date</th>
              <th className="semfee-table-header-cell">Date of Payment</th>
              <th className="semfee-table-header-cell">Transaction ID</th>
              <th className="semfee-table-header-cell">First Name</th>
              <th className="semfee-table-header-cell">Last Name</th>
              <th className="semfee-table-header-cell">College</th>
              <th className="semfee-table-header-cell">10K</th>
              <th className="semfee-table-header-cell">Sem Fee</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.length > 0 ? (
              currentStudents.map((student, index) => (
                <tr key={student.transactionId || index} className="semfee-table-row">
                  <td className="semfee-table-cell">{student.uploadDate || "N/A"}</td>
                  <td className="semfee-table-cell">{student.dateOfPayment || "N/A"}</td>
                  <td className="semfee-table-cell">{student.transactionId || "N/A"}</td>
                  <td className="semfee-table-cell font-semibold">{student.firstName || "N/A"}</td>
                  <td className="semfee-table-cell font-semibold">{student.lastName || "N/A"}</td>
                  <td className="semfee-table-cell">{student.college || "N/A"}</td>
                  <td>
                    {student?.feePaid ? (
                      <span className={`tenk-badge ${student.feePaid.toLowerCase() === 'yes' ? 'yes' : 'no'}`}>
                        {student.feePaid}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    {typeof student?.semFee === 'string' ? (
                      <span className={`sem-badge ${student.semFee.trim().toLowerCase() === 'yes' ? 'yes' : 'no'}`}>
                        {student.semFee}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="semfee-table-no-results">
                  No students found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="semfee-table-footer">
        <div>
          Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} entries
        </div>
        <div className="semfee-table-pagination">
          <button
            className="semfee-pagination-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`semfee-pagination-button page-number ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="semfee-pagination-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SemFeeTable;