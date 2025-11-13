import { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Upload, FileText, Eye, X, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import * as instructorService from '../../services/instructorService';
import apiClient from '../../utils/apiClient';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const Lessons = () => {
  const [lessons, setLessons] = useState([]);
  const [sections, setSections] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    sectionId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterLessons();
  }, [lessons, sectionFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lessonsRes, sectionsRes, profileRes] = await Promise.allSettled([
        instructorService.getLessons(),
        apiClient.get('/api/instructor/sections'),
        instructorService.getProfile(),
      ]);

      if (lessonsRes.status === 'fulfilled') {
        setLessons(lessonsRes.value.lessons || lessonsRes.value || []);
      }

      if (sectionsRes.status === 'fulfilled') {
        setSections(sectionsRes.value.data?.sections || sectionsRes.value.data || []);
      }

      if (profileRes.status === 'fulfilled' && profileRes.value.sections) {
        setSections(profileRes.value.sections);
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
    if (sectionFilter === 'ALL') {
      setFilteredLessons(lessons);
    } else {
      setFilteredLessons(lessons.filter((l) => l.sectionId === sectionFilter));
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    try {
      toast.info('Creating lesson...');
      await instructorService.createLesson(formData, selectedFile);
      toast.success('Lesson created successfully!');
      setShowCreateModal(false);
      setFormData({ title: '', content: '', description: '', sectionId: '' });
      setSelectedFile(null);
      loadData();
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast.error(error.response?.data?.message || 'Failed to create lesson');
    }
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    try {
      toast.info('Updating lesson...');
      await instructorService.updateLesson(selectedLesson.id, formData, selectedFile);
      toast.success('Lesson updated successfully!');
      setShowEditModal(false);
      setSelectedLesson(null);
      setFormData({ title: '', content: '', description: '', sectionId: '' });
      setSelectedFile(null);
      loadData();
    } catch (error) {
      console.error('Error updating lesson:', error);
      toast.error(error.response?.data?.message || 'Failed to update lesson');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    try {
      await instructorService.deleteLesson(lessonId);
      toast.success('Lesson deleted successfully!');
      loadData();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error(error.response?.data?.message || 'Failed to delete lesson');
    }
  };

  const openEditModal = (lesson) => {
    setSelectedLesson(lesson);
    setFormData({
      title: lesson.title,
      content: lesson.content || '',
      description: lesson.description || '',
      sectionId: lesson.sectionId || '',
    });
    setShowEditModal(true);
  };

  const openViewModal = (lesson) => {
    setSelectedLesson(lesson);
    setPageNumber(1);
    setShowViewModal(true);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const getSectionName = (sectionId) => {
    const section = sections.find((s) => s.id === sectionId);
    return section ? section.name : 'Unknown Section';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <div className="text-gray-600">Loading lessons...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Lessons</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage your teaching materials
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Lesson</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="ALL">All Sections</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600">
            {filteredLessons.length} {filteredLessons.length === 1 ? 'lesson' : 'lessons'}
          </div>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">
                    {lesson.title}
                  </h3>
                  {lesson.hasFile && (
                    <div className="flex items-center text-sm text-blue-600 mb-2">
                      <FileText className="h-4 w-4 mr-1" />
                      <span>PDF attached</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {lesson.hasFile && (
                    <button
                      onClick={() => openViewModal(lesson)}
                      className="text-purple-600 hover:text-purple-900"
                      title="View PDF"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(lesson)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {lesson.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{lesson.description}</p>
              )}

              <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-200">
                <span className="text-gray-600">{getSectionName(lesson.sectionId)}</span>
                <span className="text-gray-500">
                  {new Date(lesson.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredLessons.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Lessons Yet</h3>
            <p className="text-sm text-gray-600 mb-6">
              Create your first lesson to share with students
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              <span>Create Lesson</span>
            </button>
          </div>
        )}
      </div>

      {/* Create Lesson Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create New Lesson</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ title: '', content: '', description: '', sectionId: '' });
                  setSelectedFile(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="e.g., Introduction to Python"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section *
                </label>
                <select
                  value={formData.sectionId}
                  onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                >
                  <option value="">Select Section</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Brief description of the lesson"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Lesson content (text)"
                  rows="6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload PDF (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="hidden"
                    id="file-upload-create"
                  />
                  <label
                    htmlFor="file-upload-create"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF files only (Max 50MB)</p>
                    {selectedFile && (
                      <p className="text-sm text-green-600 mt-2 font-medium">
                        ✓ {selectedFile.name}
                      </p>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Create Lesson
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ title: '', content: '', description: '', sectionId: '' });
                    setSelectedFile(null);
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lesson Modal - Similar structure to Create */}
      {showEditModal && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Lesson</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedLesson(null);
                  setFormData({ title: '', content: '', description: '', sectionId: '' });
                  setSelectedFile(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateLesson} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section *
                </label>
                <select
                  value={formData.sectionId}
                  onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                >
                  <option value="">Select Section</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  rows="6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New PDF (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="hidden"
                    id="file-upload-edit"
                  />
                  <label
                    htmlFor="file-upload-edit"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload new PDF
                    </p>
                    {selectedLesson.hasFile && !selectedFile && (
                      <p className="text-xs text-blue-600 mt-2">Current: PDF attached</p>
                    )}
                    {selectedFile && (
                      <p className="text-sm text-green-600 mt-2 font-medium">
                        ✓ {selectedFile.name}
                      </p>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Update Lesson
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedLesson(null);
                    setFormData({ title: '', content: '', description: '', sectionId: '' });
                    setSelectedFile(null);
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {showViewModal && selectedLesson && selectedLesson.fileUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">{selectedLesson.title}</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedLesson(null);
                  setPageNumber(1);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-gray-100 flex items-center justify-center">
              <Document
                file={selectedLesson.fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) => {
                  console.error('Error loading PDF:', error);
                  toast.error('Failed to load PDF');
                }}
                loading={
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                    <p>Loading PDF...</p>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-lg"
                />
              </Document>
            </div>

            {numPages && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                  disabled={pageNumber <= 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {pageNumber} of {numPages}
                </span>
                <button
                  onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))}
                  disabled={pageNumber >= numPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Lessons;
