import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FileText, Search, BarChart3 } from 'lucide-react';

export default function AILogsPage() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [analytics, setAnalytics] = useState({
    totalQueries: 0,
    categoryBreakdown: [],
    commonQueries: [],
  });

  useEffect(() => {
    if (userData?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchLogs();
  }, [userData]);

  const fetchLogs = async () => {
    try {
      const logsRef = collection(db, 'aiLogs');
      const q = query(logsRef, orderBy('timestamp', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(logsData);
      
      // Calculate analytics
      const categoryCount = {};
      const queryCount = {};
      
      logsData.forEach(log => {
        if (log.query) {
          queryCount[log.query] = (queryCount[log.query] || 0) + 1;
        }
        if (log.availableCategories) {
          log.availableCategories.forEach(cat => {
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
          });
        }
      });
      
      setAnalytics({
        totalQueries: logsData.length,
        categoryBreakdown: Object.entries(categoryCount)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        commonQueries: Object.entries(queryCount)
          .map(([query, count]) => ({ query, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
      });
    } catch (error) {
      console.error('Error fetching AI logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.query?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-text-dark flex items-center space-x-2">
              <FileText className="w-8 h-8" />
              <span>AI Conversation Logs</span>
            </h1>
          </div>

          {/* Analytics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm text-gray-600 mb-2">Total Queries</h3>
              <p className="text-3xl font-bold text-text-dark">{analytics.totalQueries}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm text-gray-600 mb-2">Unique Categories</h3>
              <p className="text-3xl font-bold text-text-dark">{analytics.categoryBreakdown.length}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-sm text-gray-600 mb-2">Common Queries</h3>
              <p className="text-3xl font-bold text-text-dark">{analytics.commonQueries.length}</p>
            </div>
          </div>

          {/* Category Demand Analysis */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-text-dark mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Category Demand Analysis</span>
            </h2>
            <div className="space-y-2">
              {analytics.categoryBreakdown.length > 0 ? (
                analytics.categoryBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-background-light rounded-lg">
                    <span className="text-text-dark">{item.category}</span>
                    <span className="font-semibold text-primary-green">{item.count} queries</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-4">No category data available</p>
              )}
            </div>
          </div>

          {/* Common Queries */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-text-dark mb-4">Most Common Queries</h2>
            <div className="space-y-2">
              {analytics.commonQueries.length > 0 ? (
                analytics.commonQueries.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-background-light rounded-lg">
                    <span className="text-text-dark">{item.query}</span>
                    <span className="font-semibold text-primary-green">{item.count} times</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-4">No query data available</p>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
              />
            </div>
          </div>

          {/* Logs List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-text-dark">Recent Conversations</h2>
            </div>
            <div className="divide-y">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div key={log.id} className="p-6 hover:bg-background-light transition">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-text-dark mb-1">
                          User Query: "{log.query || 'N/A'}"
                        </p>
                        <p className="text-sm text-gray-600 mb-2">{log.message || 'No response'}</p>
                        {log.recommendations && log.recommendations.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Recommended Templates:</p>
                            <div className="flex flex-wrap gap-2">
                              {log.recommendations.map((rec, idx) => (
                                <span key={idx} className="px-2 py-1 bg-primary-green bg-opacity-20 text-primary-green rounded text-xs">
                                  {rec}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 ml-4">
                        {log.timestamp?.toDate 
                          ? log.timestamp.toDate().toLocaleString()
                          : new Date(log.timestamp?.seconds * 1000 || Date.now()).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-600">
                  {searchQuery ? 'No logs match your search' : 'No AI logs found'}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

