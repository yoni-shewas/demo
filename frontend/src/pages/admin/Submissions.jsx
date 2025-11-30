import { useState, useEffect } from 'react';
import { Send, Award, Filter, CheckCircle, Clock, ChevronDown, ChevronUp, Users, School } from 'lucide-react';
import { toast } from 'react-toastify';
import * as adminService from '../../services/adminService';

const Submissions = () => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ totalSubmissions: 0, totalGraded: 0, totalPending: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedBatches, setExpandedBatches] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllSubmissions();
      setData(response.data || []);
      setStats(response.stats || { totalSubmissions: 0, totalGraded: 0, totalPending: 0 });
      
      // Auto-expand batches with submissions
      const expanded = {};
      response.data.forEach((batch) => {
        const hasSubmissions = batch.sections.some((section) => section.submissions.length > 0);
        if (hasSubmissions) {
          expanded[batch.id] = true;
        }
      });
      setExpandedBatches(expanded);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const toggleBatch = (batchId) => {
    setExpandedBatches((prev) => ({
      ...prev,
      [batchId]: !prev[batchId],
    }));
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const filterSubmissions = (submissions) => {
    if (selectedStatus === 'ALL') return submissions;
    if (selectedStatus === 'GRADED') return submissions.filter((s) => s.grade !== null);
    if (selectedStatus === 'PENDING') return submissions.filter((s) => s.grade === null);
    return submissions;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <div className="text-gray-600">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Submissions</h1>
        <p className="text-sm text-gray-600 mt-1">View all student submissions grouped by batch and section</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalSubmissions}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <Send className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalPending}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Graded</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalGraded}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 max-w-xs border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="ALL">All Submissions</option>
            <option value="PENDING">Pending Review</option>
            <option value="GRADED">Graded</option>
          </select>
        </div>
      </div>

      {/* Submissions grouped by Batch and Section */}
      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <div className="text-center">
              <Send className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h3>
              <p className="text-sm text-gray-600">Submissions will appear here once students start submitting assignments</p>
            </div>
          </div>
        ) : (
          data.map((batch) => {
            const batchSubmissions = batch.sections.flatMap((section) => section.submissions);
            const filteredBatchSubmissions = filterSubmissions(batchSubmissions);

            if (filteredBatchSubmissions.length === 0 && selectedStatus !== 'ALL') {
              return null; // Hide batch if no submissions match filter
            }

            return (
              <div key={batch.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Batch Header */}
                <div
                  onClick={() => toggleBatch(batch.id)}
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <School className="h-5 w-5 text-indigo-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{batch.name}</h3>
                      <p className="text-sm text-gray-600">
                        {batch.type} - {batch.year} E.C.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {filteredBatchSubmissions.length} submissions
                      </p>
                      <p className="text-xs text-gray-600">
                        {batch.sections.length} sections
                      </p>
                    </div>
                    {expandedBatches[batch.id] ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Sections */}
                {expandedBatches[batch.id] && (
                  <div className="p-4 space-y-4">
                    {batch.sections.map((section) => {
                      const filteredSectionSubmissions = filterSubmissions(section.submissions);

                      if (filteredSectionSubmissions.length === 0 && selectedStatus !== 'ALL') {
                        return null;
                      }

                      return (
                        <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Section Header */}
                          <div
                            onClick={() => toggleSection(section.id)}
                            className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <Users className="h-4 w-4 text-gray-600" />
                              <div>
                                <h4 className="text-base font-semibold text-gray-900">{section.name}</h4>
                                {section.instructor && (
                                  <p className="text-xs text-gray-600">
                                    Instructor: {section.instructor.name}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  {filteredSectionSubmissions.length} submissions
                                </p>
                                <p className="text-xs text-gray-600">
                                  {section.studentCount} students
                                </p>
                              </div>
                              {expandedSections[section.id] ? (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {/* Submissions Table */}
                          {expandedSections[section.id] && filteredSectionSubmissions.length > 0 && (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Student
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Assignment
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Submitted
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Status
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Grade
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {filteredSectionSubmissions.map((submission) => (
                                    <tr key={submission.id} className="hover:bg-gray-50">
                                      <td className="px-4 py-3">
                                        <div className="flex items-center">
                                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                            <span className="text-xs font-semibold text-indigo-700">
                                              {submission.student.name.split(' ')[0]?.charAt(0)}
                                              {submission.student.name.split(' ')[1]?.charAt(0)}
                                            </span>
                                          </div>
                                          <div>
                                            <div className="text-sm font-medium text-gray-900">
                                              {submission.student.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {submission.student.studentId}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="text-sm text-gray-900">{submission.assignmentTitle}</div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="text-sm text-gray-900">
                                          {new Date(submission.submittedAt).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {new Date(submission.submittedAt).toLocaleTimeString()}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        {submission.grade !== null ? (
                                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            Graded
                                          </span>
                                        ) : (
                                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            Pending
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3">
                                        {submission.grade !== null ? (
                                          <div className="flex items-center">
                                            <Award className="h-4 w-4 text-yellow-500 mr-1" />
                                            <span className="text-sm font-semibold text-gray-900">
                                              {submission.grade}
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-sm text-gray-500">-</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {expandedSections[section.id] && filteredSectionSubmissions.length === 0 && (
                            <div className="p-8 text-center">
                              <p className="text-sm text-gray-500">No submissions in this section</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Submissions;
