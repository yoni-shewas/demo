import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Users, BookOpen, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import * as instructorService from '../services/instructorService';

const Sections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'INSTRUCTOR') {
      loadSections();
    } else if (user?.role === 'ADMIN') {
      // Redirect admins to the admin batches page for section management
      navigate('/admin/batches');
    }
  }, [user, navigate]);

  const loadSections = async () => {
    try {
      setLoading(true);
      const response = await instructorService.getSections();
      setSections(response.data || response || []);
    } catch (error) {
      console.error('Error loading sections:', error);
      toast.error('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <div className="text-gray-600">Loading sections...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Sections</h1>
        <p className="text-sm text-gray-600 mt-1">
          View your assigned sections and students
        </p>
      </div>

      {/* Sections Grid */}
      {sections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-indigo-400 hover:shadow-md transition-all"
            >
              {/* Section Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                  {section.batch && (
                    <div className="mt-2 space-y-1">
                      <span className="inline-block text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 font-medium">
                        {section.batch.name}
                      </span>
                      <p className="text-xs text-gray-600">
                        {section.batch.type} - {section.batch.year} E.C.
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <School className="h-6 w-6 text-indigo-600" />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Users className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                  <div className="text-lg font-bold text-gray-900">
                    {section._count?.students || 0}
                  </div>
                  <div className="text-xs text-gray-600">Students</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <ClipboardList className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                  <div className="text-lg font-bold text-gray-900">
                    {section._count?.assignments || 0}
                  </div>
                  <div className="text-xs text-gray-600">Assignments</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <BookOpen className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                  <div className="text-lg font-bold text-gray-900">
                    {section._count?.lessons || 0}
                  </div>
                  <div className="text-xs text-gray-600">Lessons</div>
                </div>
              </div>

              {/* Students List Preview */}
              {section.students && section.students.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Students:</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {section.students.slice(0, 3).map((student) => (
                      <div key={student.id} className="flex items-center gap-2 text-sm">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-indigo-700">
                            {student.user?.firstName?.charAt(0)}
                            {student.user?.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 truncate">
                            {student.user?.firstName} {student.user?.lastName}
                          </p>
                          {student.studentId && (
                            <p className="text-xs text-gray-500">{student.studentId}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {section.students.length > 3 && (
                      <p className="text-xs text-gray-500 italic pl-9">
                        +{section.students.length - 3} more students
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="text-center">
            <School className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sections Assigned</h3>
            <p className="text-sm text-gray-600">
              Contact an administrator to be assigned to sections
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sections;
