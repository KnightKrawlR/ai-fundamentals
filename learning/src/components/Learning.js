import React from 'react';

const Learning = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Learning Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Current Progress</h2>
          <p>Track your learning journey here</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Next Steps</h2>
          <p>Recommended topics and courses</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Achievements</h2>
          <p>Your learning milestones</p>
        </div>
      </div>
    </div>
  );
};

export default Learning; 