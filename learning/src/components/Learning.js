import React, { useState, useEffect } from 'react';

const Learning = ({ firebase }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('Learning component mounted');
    
    // Set up auth state listener
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      setUser(user);
      
      if (user) {
        fetchUserCourses(user.uid);
      } else {
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [firebase]);
  
  const fetchUserCourses = async (userId) => {
    console.log('Fetching courses for user:', userId);
    try {
      // Using a timeout to simulate loading
      setTimeout(() => {
        // Hardcoded sample courses
        const sampleCourses = [
          { id: 'intro-ai', title: 'Introduction to AI', progress: 30, totalModules: 10, completedModules: 3 },
          { id: 'ml-basics', title: 'Machine Learning Basics', progress: 15, totalModules: 8, completedModules: 1 },
          { id: 'prompt-engineering', title: 'Prompt Engineering', progress: 75, totalModules: 6, completedModules: 4 }
        ];
        
        setCourses(sampleCourses);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load your courses. Please try again later.');
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Not Logged In: </strong>
        <span className="block sm:inline">Please sign in to view your learning dashboard.</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Learning Dashboard</h1>
      
      {courses.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
          <p>You haven't enrolled in any courses yet. Explore our course catalog to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <div key={course.id} className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {course.completedModules} of {course.totalModules} modules completed ({course.progress}%)
                </div>
              </div>
              <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                Continue Learning
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Learning; 