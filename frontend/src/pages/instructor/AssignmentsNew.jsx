import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Calendar,
  Users,
  CheckCircle,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import apiClient from "../../utils/apiClient";
import * as instructorService from "../../services/instructorService";
import Editor from "@monaco-editor/react";

const LANGUAGES = {
  javascript: { name: "JavaScript", template: 'console.log("Hello World!");' },
  python: { name: "Python", template: 'print("Hello World!")' },
  cpp: {
    name: "C++",
    template:
      '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World!" << endl;\n    return 0;\n}',
  },
  java: {
    name: "Java",
    template:
      'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}',
  },
};

const AssignmentsNew = () => {
  const [assignments, setAssignments] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sectionId: "",
    dueDate: "",
    language: "javascript",
    starterCode: LANGUAGES.javascript.template,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, sectionsRes, profileRes] = await Promise.allSettled([
        apiClient.get("/api/instructor/assignments"),
        apiClient.get("/api/instructor/sections"),
        instructorService.getProfile(),
      ]);

      if (assignmentsRes.status === 'fulfilled') {
        setAssignments(
          assignmentsRes.value.data.data || assignmentsRes.value.data.assignments || []
        );
      }

      // Prioritize instructor's assigned sections from profile
      if (profileRes.status === 'fulfilled' && profileRes.value.sections) {
        const profileSections = profileRes.value.sections;
        setSections(Array.isArray(profileSections) ? profileSections : []);
      } else if (sectionsRes.status === 'fulfilled') {
        // Fallback to sections API (should already be filtered to instructor's sections)
        const sectionData = sectionsRes.value.data?.data || sectionsRes.value.data?.sections || [];
        setSections(Array.isArray(sectionData) ? sectionData : []);
      } else {
        // No sections available
        setSections([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();

    try {
      await apiClient.post("/api/instructor/assignments", {
        ...formData,
        starterCode: JSON.stringify({
          [formData.language]: formData.starterCode,
        }),
      });

      toast.success("Assignment created successfully!");
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error(
        error.response?.data?.message || "Failed to create assignment"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      sectionId: "",
      dueDate: "",
      language: "javascript",
      starterCode: LANGUAGES.javascript.template,
    });
  };

  const handleLanguageChange = (lang) => {
    setFormData({
      ...formData,
      language: lang,
      starterCode: LANGUAGES[lang].template,
    });
  };

  const stats = {
    total: assignments.length,
    active: assignments.filter((a) => new Date(a.dueDate) > new Date()).length,
    completed: assignments.filter((a) => new Date(a.dueDate) <= new Date())
      .length,
    submissions: assignments.reduce(
      (sum, a) => sum + (a.submissions?.length || 0),
      0
    ),
  };

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch = a.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Assignment Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Create and manage assignments for your students
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50">
                <FileText className="w-4 h-4 inline mr-2" />
                Templates
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                New Assignment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Assignments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.total}
                </p>
              </div>
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.active}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.completed}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Submissions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.submissions}
                </p>
              </div>
              <Users className="w-12 h-12 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Assignments
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading...</div>
          ) : filteredAssignments.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No assignments found</p>
              <p className="text-sm text-gray-500 mt-1">
                Create your first assignment to get started
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Create Assignment
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAssignments.map((assignment) => (
                <div key={assignment.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {assignment.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <span>
                          Section: {assignment.section?.name || "N/A"}
                        </span>
                        {assignment.dueDate && (
                          <span>
                            Due:{" "}
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        <span>
                          {assignment.submissions?.length || 0} submissions
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-sm text-red-600 hover:text-red-700">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-700" />
                <h2 className="text-xl font-bold text-gray-900">
                  Create New Assignment
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateAssignment}>
              <div className="grid grid-cols-2 gap-6 p-6">
                {/* Left Column - Assignment Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="w-4 h-4 text-gray-700" />
                    <h3 className="font-semibold text-gray-900">
                      Assignment Details
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assignment Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., JavaScript Fundamentals"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe what students need to accomplish..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.sectionId}
                      onChange={(e) =>
                        setFormData({ ...formData, sectionId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a section...</option>
                      {sections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.name} - {section.batch?.name || "No Batch"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Programming Language{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(LANGUAGES).map(([key, lang]) => (
                        <option key={key} value={key}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right Column - Starter Code */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <svg
                      className="w-4 h-4 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                    <h3 className="font-semibold text-gray-900">
                      Starter Code
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Provide initial code that students will start with
                    (optional)
                  </p>
                  <div className="border border-gray-300 rounded-md overflow-hidden">
                    <div className="bg-gray-100 px-3 py-2 border-b border-gray-300">
                      <span className="text-sm font-medium text-gray-700">
                        {LANGUAGES[formData.language].name}
                      </span>
                    </div>
                    <Editor
                      height="300px"
                      language={
                        formData.language === "cpp" ? "cpp" : formData.language
                      }
                      value={formData.starterCode}
                      onChange={(value) =>
                        setFormData({ ...formData, starterCode: value || "" })
                      }
                      theme="vs-dark"
                      options={{
                        fontSize: 13,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        lineNumbers: "on",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsNew;
