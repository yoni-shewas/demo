import { useState, useEffect } from 'react';
import { BookOpen, Eye, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import * as studentService from '../../services/studentService';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const StudentLessons = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const data = await studentService.getLessons();
      setLessons(data.lessons || data || []);
      toast.success('Lessons loaded successfully');
    } catch (error) {
      console.error('Error loading lessons:', error);
      toast.error('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  const openPdfViewer = (lesson) => {
    setSelectedLesson(lesson);
    setPageNumber(1);
    setShowPdfModal(true);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Lessons</h1>
        <p className="text-sm text-gray-600 mt-1">Access your learning materials and tutorials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{lesson.title}</h3>
              {lesson.description && <p className="text-sm text-gray-600 mb-4 line-clamp-3">{lesson.description}</p>}
              
              {lesson.content && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 line-clamp-4">{lesson.content}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-500">{new Date(lesson.createdAt).toLocaleDateString()}</span>
                {lesson.hasFile && (
                  <button onClick={() => openPdfViewer(lesson)} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">View PDF</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {lessons.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Lessons Available</h3>
            <p className="text-sm text-gray-600">Your instructor hasn't posted any lessons yet</p>
          </div>
        )}
      </div>

      {showPdfModal && selectedLesson && selectedLesson.fileUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">{selectedLesson.title}</h2>
              <button onClick={() => { setShowPdfModal(false); setSelectedLesson(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-gray-100 flex items-center justify-center">
              <Document file={selectedLesson.fileUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4 mx-auto"></div><p>Loading PDF...</p></div>}>
                <Page pageNumber={pageNumber} renderTextLayer={true} renderAnnotationLayer={true} className="shadow-lg" />
              </Document>
            </div>
            {numPages && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <button onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))} disabled={pageNumber <= 1} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
                <span className="text-sm text-gray-600">Page {pageNumber} of {numPages}</span>
                <button onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))} disabled={pageNumber >= numPages} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLessons;
