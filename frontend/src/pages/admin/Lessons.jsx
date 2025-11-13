import { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '../../utils/apiClient';

const Lessons = () => {
  const [lessons, setLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterLessons();
  }, [lessons, searchTerm, instructorFilter, sectionFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lessonsRes, usersRes, sectionsRes] = await Promise.allSettled([
        apiClient.get('/api/admin/lessons'),
        apiClient.get('/api/admin/users'),
        apiClient.get('/api/admin/sections'),
      ]);

      if (lessonsRes.status === 'fulfilled') {
        setLessons(lessonsRes.value.data.lessons || lessonsRes.value.data || []);
      }

      if (usersRes.status === 'fulfilled') {
        const users = usersRes.value.data.users || usersRes.value.data || [];
        setInstructors(users.filter((u) => u.role === 'INSTRUCTOR'));
      }

      if (sectionsRes.status === 'fulfilled') {
        setSections(sectionsRes.value.data.sections || sectionsRes.value.data || []);
      }

      toast.success('Lessons loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  const filterLessons = () => {
    let filtered = [...lessons];

    // Apply instructor filter
    if (instructorFilter !== 'ALL') {
      filtered = filtered.filter((l) => l.instructorId === instructorFilter);
    }

    // Apply section filter
    if (sectionFilter !== 'ALL') {
      filtered = filtered.filter((l) => l.sectionId === sectionFilter);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(
        (l) =>
          l.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLessons(filtered);
    setCurrentPage(1);
  };

  const getInstructorName = (instructorId) => {
    const instructor = instructors.find((i) => i.id === instructorId);
    return instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Unknown';
  };

  const getSectionName = (sectionId) => {
    const section = sections.find((s) => s.id === sectionId);
    return section ? section.name : 'Unknown';
  };

  const viewLessonDetails = (lesson) => {
    setSelectedLesson(lesson);
    setShowDetailModal(true);
  };

  // Pagination
  const indexOfLastLesson = currentPage * itemsPerPage;
  const indexOfFirstLesson = indexOfLastLesson - itemsPerPage;
  const currentLessons = filteredLessons.slice(indexOfFirstLesson, indexOfLastLesson);
  const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading lessons...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lesson Materials</h1>
        <p className="text-sm text-gray-600 mt-1">
          View all instructor-created lessons ({filteredLessons.length} total)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Lessons</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{lessons.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Instructors</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{instructors.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sections</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{sections.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Filtered Results</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{filteredLessons.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-500">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>

          {/* Instructor Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="ALL">All Instructors</option>
              {instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.firstName} {instructor.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="ALL">All Sections</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{lesson.title}</h3>
              </div>

              {lesson.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{lesson.description}</p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium mr-2">Instructor:</span>
                  <span>{getInstructorName(lesson.instructorId)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium mr-2">Section:</span>
                  <span>{getSectionName(lesson.sectionId)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium mr-2">Created:</span>
                  <span>{new Date(lesson.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={() => viewLessonDetails(lesson)}
                className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </button>
            </div>
          </div>
        ))}

        {currentLessons.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Lessons Found</h3>
            <p className="text-sm text-gray-600">
              {searchTerm || instructorFilter !== 'ALL' || sectionFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'No lessons have been created yet'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstLesson + 1} to{' '}
            {Math.min(indexOfLastLesson, filteredLessons.length)} of {filteredLessons.length}{' '}
            lessons
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-3 py-1 border rounded-lg text-sm ${
                  currentPage === index + 1
                    ? 'bg-black text-white border-black'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Lesson Detail Modal */}
      {showDetailModal && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Lesson Details</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedLesson(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedLesson.title}</h3>
                {selectedLesson.description && (
                  <p className="text-gray-600">{selectedLesson.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Instructor</p>
                  <p className="font-medium text-gray-900">
                    {getInstructorName(selectedLesson.instructorId)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Section</p>
                  <p className="font-medium text-gray-900">
                    {getSectionName(selectedLesson.sectionId)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Created</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedLesson.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Updated</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedLesson.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">Content</h4>
                <div className="prose max-w-none bg-gray-50 rounded-lg p-4">
                  <div
                    className="text-gray-700 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: selectedLesson.content || 'No content' }}
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedLesson(null);
                }}
                className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lessons;
