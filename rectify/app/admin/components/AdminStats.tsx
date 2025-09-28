'use client';

interface AdminStatsProps {
  totalPosts: number;
  highVotePosts: number;
  inProgressPosts: number;
  resolvedPosts: number;
  pendingPosts: number;
  rejectedPosts: number;
}

export const AdminStats = ({ 
  totalPosts, 
  highVotePosts, 
  inProgressPosts, 
  resolvedPosts, 
  pendingPosts,
  rejectedPosts 
}: AdminStatsProps) => {
  const stats = [
    {
      title: 'Total Posts',
      value: totalPosts,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v2a2 2 0 002 2m0 0h14" />
        </svg>
      )
    },
    {
      title: 'High Priority',
      value: highVotePosts,
      color: 'from-red-500 to-red-600',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.726-.833-2.496 0L4.318 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    {
      title: 'Pending Review',
      value: pendingPosts,
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'In Progress',
      value: inProgressPosts,
      color: 'from-yellow-500 to-yellow-600',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: 'Resolved',
      value: resolvedPosts,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Rejected',
      value: rejectedPosts,
      color: 'from-gray-500 to-gray-600',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} rounded-xl p-6 border ${stat.borderColor} hover:shadow-lg transition-all duration-300`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center ${stat.textColor} border ${stat.borderColor}`}>
              {stat.icon}
            </div>
            <div className={`text-3xl font-bold ${stat.textColor}`}>
              {stat.value}
            </div>
          </div>
          <div>
            <h3 className={`text-sm font-medium ${stat.textColor} mb-1`}>{stat.title}</h3>
            <p className="text-xs text-slate-500">
              {stat.title === 'Total Posts' && 'All community posts'}
              {stat.title === 'High Priority' && 'Posts with 10+ votes'}
              {stat.title === 'Pending Review' && 'Awaiting admin review'}
              {stat.title === 'In Progress' && 'Being actively addressed'}
              {stat.title === 'Resolved' && 'Successfully completed'}
              {stat.title === 'Rejected' && 'Not approved'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};