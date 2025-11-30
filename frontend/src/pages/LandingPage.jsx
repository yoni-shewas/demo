import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Users, Shield, Code2, FileText, ClipboardList, 
  Inbox, ChevronDown, ChevronUp, Zap, Globe, Lock, 
  TrendingUp, MonitorSmartphone, Layers, Languages, CheckCircle2,
  Rocket, ArrowRight, Menu, X 
} from 'lucide-react';

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Do I need internet to use the platform?",
      answer: "No. Everything runs on LAN within the campus network, making it fully offline-capable."
    },
    {
      question: "What programming languages are supported?",
      answer: "The platform supports Python, JavaScript, Java, C++, C, and more through our Monaco-powered editor."
    },
    {
      question: "Can instructors create custom assignments?",
      answer: "Yes! Instructors can create assignments with deadlines, descriptions, and file requirements."
    },
    {
      question: "How do students submit their work?",
      answer: "Students can submit code files directly through the platform with automatic tracking."
    },
    {
      question: "Is the platform suitable for large class sizes?",
      answer: "Absolutely. The system is optimized to handle multiple batches and sections efficiently."
    },
    {
      question: "What are the system requirements?",
      answer: "The platform is designed to work on low-end machines with minimal resource requirements."
    },
    {
      question: "How do admins manage users?",
      answer: "Admins can import users via CSV, create batches, assign sections, and manage all accounts."
    },
    {
      question: "Can students access lessons offline?",
      answer: "Yes, all lessons and materials are accessible within the local network without internet."
    },
    {
      question: "Is there a mobile version?",
      answer: "The platform is fully responsive and works on tablets and mobile devices via browser."
    },
    {
      question: "How secure is the authentication?",
      answer: "The platform uses secure manual authentication with role-based access control."
    },
    {
      question: "Can instructors track student progress?",
      answer: "Yes, instructors can view submissions, grade assignments, and monitor student activity."
    },
    {
      question: "What file formats are supported for lessons?",
      answer: "Lessons support PDF documents, code files, and various text-based educational materials."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Patterns */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Code2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-2xl font-extrabold text-gray-900 truncate">SMU Code Platform</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <a href="#features" className="text-base font-medium text-gray-900 hover:text-blue-600 transition-colors">Features</a>
              <a href="#roles" className="text-base font-medium text-gray-900 hover:text-blue-600 transition-colors">Roles</a>
              <a href="#editor" className="text-base font-medium text-gray-900 hover:text-blue-600 transition-colors">The Editor</a>
              <a href="#how-it-works" className="text-base font-medium text-gray-900 hover:text-blue-600 transition-colors">How It Works</a>
              <a href="#faq" className="text-base font-medium text-gray-900 hover:text-blue-600 transition-colors">FAQ</a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link 
                to="/code" 
                className="text-base font-medium text-blue-600 hover:text-blue-700 transition-colors underline-offset-4 hover:underline"
              >
                Try Editor
              </Link>
              <Link 
                to="/login" 
                className="px-5 xl:px-7 py-2.5 xl:py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Sign In
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 space-y-3 border-t border-gray-200 animate-fadeIn">
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Features
              </a>
              <a 
                href="#roles" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Roles
              </a>
              <a 
                href="#editor" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                The Editor
              </a>
              <a 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                How It Works
              </a>
              <a 
                href="#faq" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                FAQ
              </a>
              <Link 
                to="/code" 
                className="block px-4 py-2 text-base font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Try Editor
              </Link>
              <Link 
                to="/login" 
                className="block mx-4 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl text-center hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Column - Text */}
            <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                A Complete Coding & Learning Platform Built for SMU
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-600">
                Fast, offline-capable, and designed for students, instructors, and admins — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  to="/login" 
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105 text-center text-sm sm:text-base"
                >
                  Get Started
                </Link>
                <a 
                  href="#features" 
                  className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all text-center text-sm sm:text-base"
                >
                  Explore Features
                </a>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2 justify-center lg:justify-start">
                <Globe className="w-4 h-4 flex-shrink-0" />
                Runs fully on local campus LAN. No internet required.
              </p>
            </div>

            {/* Right Column - Illustration */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative backdrop-blur-xl bg-white/40 border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="bg-gray-900 rounded-2xl p-6 shadow-inner">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-2 font-mono text-sm">
                    <div className="text-purple-400">def <span className="text-yellow-300">calculate</span><span className="text-gray-400">(</span><span className="text-orange-300">x, y</span><span className="text-gray-400">):</span></div>
                    <div className="pl-4 text-blue-300">return x + y</div>
                    <div className="mt-4 text-gray-500"># Fast execution</div>
                    <div className="text-green-400">print<span className="text-gray-400">(</span>calculate<span className="text-gray-400">(10, 20))</span></div>
                    <div className="text-gray-400">→ 30</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Monaco Editor</span>
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Value Pillars */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Pillar 1 */}
            <div className="group backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Structured Learning for Every Student</h3>
              <p className="text-base sm:text-lg text-gray-600">
                Access lessons, assignments, and a built-in code editor on the local network.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="group backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Tools That Help Instructors Focus on Teaching</h3>
              <p className="text-base sm:text-lg text-gray-600">
                Upload materials, create assignments, and evaluate submissions effortlessly.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="group backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Admin Control Without the Complexity</h3>
              <p className="text-base sm:text-lg text-gray-600">
                Import users, manage batches, and oversee the whole platform easily.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 text-center mb-10 sm:mb-12 lg:mb-16">
            Built for Every Role in the Learning Workflow
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Admin Card */}
            <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-200/50 rounded-2xl p-10 hover:shadow-2xl transition-all">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Admin</h3>
              <p className="text-lg text-gray-700">
                Add users, import records, manage batches and sections with comprehensive control.
              </p>
            </div>

            {/* Instructor Card */}
            <div className="backdrop-blur-xl bg-indigo-500/10 border border-indigo-200/50 rounded-2xl p-10 hover:shadow-2xl transition-all">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Instructor</h3>
              <p className="text-lg text-gray-700">
                Upload lessons, create assignments, review submissions with intuitive tools.
              </p>
            </div>

            {/* Student Card */}
            <div className="backdrop-blur-xl bg-green-500/10 border border-green-200/50 rounded-2xl p-10 hover:shadow-2xl transition-all">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Student</h3>
              <p className="text-lg text-gray-700">
                Write code, view lessons, submit assignments, and track your progress seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Platform Section */}
      <section className="py-20 px-8 bg-gradient-to-br from-gray-50 to-blue-50/50">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-5xl font-extrabold text-gray-900 text-center mb-16">
            Designed for Reliability, Speed, and Real Classroom Needs
          </h2>
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-8">
            <div className="flex items-start gap-4 backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl p-6 hover:shadow-lg transition-all">
              <Globe className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Offline-capable, designed for LAN</h4>
                <p className="text-gray-600">No internet dependency, works entirely on campus network</p>
              </div>
            </div>

            <div className="flex items-start gap-4 backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl p-6 hover:shadow-lg transition-all">
              <Zap className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Fast code execution</h4>
                <p className="text-gray-600">Optimized backend for quick compile and run cycles</p>
              </div>
            </div>

            <div className="flex items-start gap-4 backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl p-6 hover:shadow-lg transition-all">
              <Lock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Secure manual authentication</h4>
                <p className="text-gray-600">Role-based access control with manual user management</p>
              </div>
            </div>

            <div className="flex items-start gap-4 backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl p-6 hover:shadow-lg transition-all">
              <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Built for large class sizes</h4>
                <p className="text-gray-600">Scalable architecture handles multiple batches efficiently</p>
              </div>
            </div>

            <div className="flex items-start gap-4 backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl p-6 hover:shadow-lg transition-all">
              <MonitorSmartphone className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Low-end machine friendly</h4>
                <p className="text-gray-600">Optimized for performance on modest hardware</p>
              </div>
            </div>

            <div className="flex items-start gap-4 backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl p-6 hover:shadow-lg transition-all">
              <Layers className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Structured workflows for learning</h4>
                <p className="text-gray-600">Clear pathways from lessons to assignments to submissions</p>
              </div>
            </div>

            <div className="flex items-start gap-4 backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl p-6 hover:shadow-lg transition-all">
              <Languages className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Supports multiple languages</h4>
                <p className="text-gray-600">Python, JavaScript, Java, C++, C, and more</p>
              </div>
            </div>

            <div className="flex items-start gap-4 backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl p-6 hover:shadow-lg transition-all">
              <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Error-proof consistent UI</h4>
                <p className="text-gray-600">Clean interface designed for ease of use</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editor Showcase */}
      <section id="editor" className="py-20 px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left Side - Text */}
            <div className="space-y-6">
              <h2 className="text-5xl font-extrabold text-gray-900">
                Write, Run, and Debug Code — Instantly
              </h2>
              <p className="text-xl text-gray-600">
                A modern workspace powered by Monaco Editor with multi-language support, syntax highlighting, and real-time execution.
              </p>
              <Link 
                to="/code" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Try It Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Right Side - Editor Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative backdrop-blur-xl bg-gray-900/95 border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="ml-4 text-gray-400 text-sm font-mono">main.py</span>
                </div>
                <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm space-y-2">
                  <div className="text-gray-500"># Quick Sort Algorithm</div>
                  <div className="text-purple-400">def <span className="text-yellow-300">quicksort</span><span className="text-gray-400">(</span><span className="text-orange-300">arr</span><span className="text-gray-400">):</span></div>
                  <div className="pl-4 text-blue-300">if len(arr) &lt;= 1:</div>
                  <div className="pl-8 text-blue-300">return arr</div>
                  <div className="pl-4 text-blue-300">pivot = arr[len(arr) // 2]</div>
                  <div className="pl-4 text-blue-300">left = [x for x in arr if x &lt; pivot]</div>
                  <div className="pl-4 text-blue-300">middle = [x for x in arr if x == pivot]</div>
                  <div className="pl-4 text-blue-300">right = [x for x in arr if x &gt; pivot]</div>
                  <div className="pl-4 text-purple-400">return quicksort(left) + middle + quicksort(right)</div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Output:</span>
                  <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                    Run Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lessons & Assignments Section */}
      <section className="py-20 px-8 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Lessons */}
            <div className="backdrop-blur-xl bg-white/70 border border-white/60 rounded-2xl p-10 text-center hover:shadow-2xl transition-all hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Lessons</h3>
              <p className="text-lg text-gray-600">
                View PDFs, tutorials, and lecture content easily with organized categories.
              </p>
            </div>

            {/* Assignments */}
            <div className="backdrop-blur-xl bg-white/70 border border-white/60 rounded-2xl p-10 text-center hover:shadow-2xl transition-all hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ClipboardList className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Assignments</h3>
              <p className="text-lg text-gray-600">
                Structured tasks with deadlines and clear submission requirements.
              </p>
            </div>

            {/* Submissions */}
            <div className="backdrop-blur-xl bg-white/70 border border-white/60 rounded-2xl p-10 text-center hover:shadow-2xl transition-all hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Inbox className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Submissions</h3>
              <p className="text-lg text-gray-600">
                Upload code, submit files, and track your submission history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-8">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-5xl font-extrabold text-gray-900 text-center mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="relative">
              <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl p-8 text-center hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-extrabold">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Log In</h3>
                <p className="text-lg text-gray-600">
                  Sign in using your assigned role - student, instructor, or admin.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-blue-400 to-transparent"></div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl p-8 text-center hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-extrabold">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Access Your Dashboard</h3>
                <p className="text-lg text-gray-600">
                  Students, instructors, and admins get tailored tools automatically.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-indigo-400 to-transparent"></div>
            </div>

            {/* Step 3 */}
            <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl p-8 text-center hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-extrabold">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Work Offline or Online</h3>
              <p className="text-lg text-gray-600">
                Everything works inside the local campus network seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-8 bg-gradient-to-br from-gray-50 to-slate-50">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-5xl font-extrabold text-gray-900 text-center mb-16">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="backdrop-blur-xl bg-white/70 border border-white/60 rounded-xl overflow-hidden hover:shadow-lg transition-all"
              >
                <button
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/50 transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-bold text-lg text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-8 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="absolute inset-0 backdrop-blur-3xl bg-white/10"></div>
        <div className="relative max-w-[900px] mx-auto text-center">
          <h2 className="text-5xl font-extrabold text-white mb-8">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-12">
            Join hundreds of students and instructors already using the platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/login" 
              className="px-10 py-5 bg-white text-blue-600 font-bold text-lg rounded-xl hover:bg-gray-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-105"
            >
              Login Now
            </Link>
            <Link 
              to="/code" 
              className="px-10 py-5 bg-white/10 backdrop-blur-xl border-2 border-white text-white font-bold text-lg rounded-xl hover:bg-white/20 transition-all"
            >
              Try Code Editor
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Column 1 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-extrabold">SMU Code Platform</span>
              </div>
              <p className="text-gray-400">Built for Smart Learning</p>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="font-bold text-lg mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#editor" className="hover:text-white transition-colors">The Editor</a></li>
                <li><a href="#roles" className="hover:text-white transition-colors">Roles</a></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="font-bold text-lg mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Contact Admin</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 SMU Code Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
