/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

interface AnalyticsProps {
  posts: any[];
}

export const Analytics = ({ posts }: AnalyticsProps) => {
  // Calculate analytics data
  const totalPosts = posts?.length || 0;
  const resolvedPosts = posts?.filter(p => p.status === 'resolved').length || 0;
  const resolutionRate = totalPosts > 0 ? ((resolvedPosts / totalPosts) * 100).toFixed(1) : '0';

  // City-wise breakdown
  const cityData = posts?.reduce((acc: any, post) => {
    acc[post.city] = (acc[post.city] || 0) + 1;
    return acc;
  }, {}) || {};
  
  const topCities = Object.entries(cityData)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5);

  // Issue type breakdown
  const issueTypeData = posts?.reduce((acc: any, post) => {
    acc[post.issueType] = (acc[post.issueType] || 0) + 1;
    return acc;
  }, {}) || {};
  
  const topIssueTypes = Object.entries(issueTypeData)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 6);

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentPosts = posts?.filter(p => new Date(p.createdAt) >= sevenDaysAgo).length || 0;

  // Status distribution
  const statusData = [
    { status: 'Submitted', count: posts?.filter(p => p.status === 'submitted').length || 0, color: 'from-blue-500 to-blue-600' },
    { status: 'In Progress', count: posts?.filter(p => p.status === 'in_progress').length || 0, color: 'from-yellow-500 to-yellow-600' },
    { status: 'Resolved', count: posts?.filter(p => p.status === 'resolved').length || 0, color: 'from-green-500 to-green-600' },
    { status: 'Rejected', count: posts?.filter(p => p.status === 'rejected').length || 0, color: 'from-red-500 to-red-600' }
  ];

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-blue-700 text-sm font-medium mb-2">Resolution Rate</h3>
              <p className="text-3xl font-bold text-blue-700">{resolutionRate}%</p>
              <p className="text-xs text-slate-500 mt-1">{resolvedPosts} of {totalPosts} resolved</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-green-700 text-sm font-medium mb-2">Recent Activity</h3>
              <p className="text-3xl font-bold text-green-700">{recentPosts}</p>
              <p className="text-xs text-slate-500 mt-1">Posts in last 7 days</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center border border-green-200">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-purple-700 text-sm font-medium mb-2">Avg. Response Time</h3>
              <p className="text-3xl font-bold text-purple-700">2.4</p>
              <p className="text-xs text-slate-500 mt-1">Hours to first response</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center border border-purple-200">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-orange-700 text-sm font-medium mb-2">User Satisfaction</h3>
              <p className="text-3xl font-bold text-orange-700">4.7</p>
              <p className="text-xs text-slate-500 mt-1">Average rating (out of 5)</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center border border-orange-200">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Status Distribution</h3>
          <div className="space-y-4">
            {statusData.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${item.color}`}></div>
                  <span className="text-slate-700 font-medium">{item.status}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${item.color}`}
                      style={{ width: `${totalPosts > 0 ? (item.count / totalPosts) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-slate-800 font-bold min-w-[2rem] text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Top Cities by Reports</h3>
          <div className="space-y-4">
            {topCities.map(([city, count]: [string, any], index) => (
              <div key={city} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">#{index + 1}</span>
                  </div>
                  <span className="text-slate-700 font-medium">{city}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-slate-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                      style={{ width: `${totalPosts > 0 ? (count / totalPosts) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-slate-800 font-bold min-w-[2rem] text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Issue Types */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Most Reported Issue Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topIssueTypes.map(([issueType, count]: [string, any], index) => {
            const colors = [
              'from-red-500 to-red-600',
              'from-orange-500 to-orange-600', 
              'from-yellow-500 to-yellow-600',
              'from-green-500 to-green-600',
              'from-blue-500 to-blue-600',
              'from-purple-500 to-purple-600'
            ];
            const bgColors = [
              'bg-red-50',
              'bg-orange-50',
              'bg-yellow-50',
              'bg-green-50',
              'bg-blue-50',
              'bg-purple-50'
            ];
            const borderColors = [
              'border-red-200',
              'border-orange-200',
              'border-yellow-200',
              'border-green-200',
              'border-blue-200',
              'border-purple-200'
            ];
            const textColors = [
              'text-red-700',
              'text-orange-700',
              'text-yellow-700',
              'text-green-700',
              'text-blue-700',
              'text-purple-700'
            ];
            
            const colorIndex = index % colors.length;
            const color = colors[colorIndex];
            const bgColor = bgColors[colorIndex];
            const borderColor = borderColors[colorIndex];
            const textColor = textColors[colorIndex];
            
            return (
              <div key={issueType} className={`${bgColor} rounded-xl p-4 border ${borderColor} hover:shadow-lg transition-all duration-300`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-medium ${textColor} text-sm`}>{issueType}</h4>
                  <span className={`text-lg font-bold ${textColor}`}>{count}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${color}`}
                    style={{ width: `${totalPosts > 0 ? (count / totalPosts) * 100 : 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {totalPosts > 0 ? ((count / totalPosts) * 100).toFixed(1) : 0}% of total reports
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};