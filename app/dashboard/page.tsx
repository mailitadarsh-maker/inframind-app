'use client';

import React, { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [liveTime, setLiveTime] = useState({ sec: 1, ms: 142 });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTime(prev => ({
        sec: (prev.sec % 60) + 1,
        ms: 138 + Math.floor(Math.random() * 10)
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-bg flex font-sans text-text">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-border-2 bg-bg-2 p-6 flex flex-col hidden md:flex">
        <div className="logo mb-10">
          <div className="logo-box w-6 h-6 rounded-md">
            <i className="ti ti-check text-[10px] text-bg" aria-hidden="true"></i>
          </div>
          <span className="font-medium text-sm tracking-wide">InfraMind</span>
        </div>

        <nav className="space-y-2 flex-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-green bg-green-bg rounded-lg border border-green-border">
            <i className="ti ti-layout-dashboard"></i> Monitors
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-text-2 hover:text-text hover:bg-bg-3 rounded-lg transition-colors">
            <i className="ti ti-bell-ringing"></i> Incidents
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-text-2 hover:text-text hover:bg-bg-3 rounded-lg transition-colors">
            <i className="ti ti-settings"></i> Settings
          </a>
        </nav>

        <div className="mt-auto flex items-center gap-3 pt-4 border-t border-border-2">
          <div className="w-8 h-8 rounded-full bg-bg-3 flex items-center justify-center text-xs border border-border-2">
            U
          </div>
          <div className="text-xs">
            <div className="font-medium text-text">User Account</div>
            <div className="text-text-2">Free Beta Plan</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 animate-fade-up">
          <div>
            <h1 className="text-2xl font-serif text-text mb-1">Live Monitors</h1>
            <p className="text-xs text-text-2">Real-time status of your connected applications.</p>
          </div>
          <button className="btn-green shadow-lg shadow-green/20">
            + Add Monitor
          </button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
           <div className="p-5 bg-bg-2 border border-border-2 rounded-xl animate-fade-up" style={{ animationDelay: '0.1s' }}>
             <div className="text-xs text-text-2 mb-1">Overall Uptime</div>
             <div className="text-2xl font-serif text-green">100%</div>
           </div>
           <div className="p-5 bg-bg-2 border border-border-2 rounded-xl animate-fade-up" style={{ animationDelay: '0.2s' }}>
             <div className="text-xs text-text-2 mb-1">Active Monitors</div>
             <div className="text-2xl font-serif text-text">3 <span className="text-sm text-text-2">/ 5</span></div>
           </div>
           <div className="p-5 bg-bg-2 border border-border-2 rounded-xl animate-fade-up" style={{ animationDelay: '0.3s' }}>
             <div className="text-xs text-text-2 mb-1">Recent Incidents</div>
             <div className="text-2xl font-serif text-text">0</div>
           </div>
        </div>

        {/* Monitors List */}
        <div className="bg-bg-2 border border-border-2 rounded-xl p-2 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          
          {/* Monitor Item 1 */}
          <div className="mon group cursor-pointer">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-lg bg-bg-3 border border-border-2 flex items-center justify-center text-text-2 group-hover:text-green group-hover:border-green/30 transition-colors">
                 <i className="ti ti-api"></i>
               </div>
               <div>
                  <div className="mon-name">api.myapp.com</div>
                  <div className="mon-meta">Checked {liveTime.sec}s ago · {liveTime.ms}ms</div>
               </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-32 hidden md:block">
                <div className="progress-bar"><div className="progress-fill" style={{ width: '97%' }}></div></div>
              </div>
              <div className="status up"><div className="sdot"></div>Operational</div>
              <i className="ti ti-dots-vertical text-text-2 opacity-50 hover:opacity-100"></i>
            </div>
          </div>

          {/* Monitor Item 2 */}
          <div className="mon group cursor-pointer">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-lg bg-bg-3 border border-border-2 flex items-center justify-center text-text-2 group-hover:text-green group-hover:border-green/30 transition-colors">
                 <i className="ti ti-browser"></i>
               </div>
               <div>
                  <div className="mon-name">dashboard.myapp.com</div>
                  <div className="mon-meta">Checked 1m ago · 89ms</div>
               </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-32 hidden md:block">
                <div className="progress-bar"><div className="progress-fill" style={{ width: '100%', animationDelay: '0.2s' }}></div></div>
              </div>
              <div className="status up" style={{ animationDelay: '0.1s' }}><div className="sdot"></div>Operational</div>
              <i className="ti ti-dots-vertical text-text-2 opacity-50 hover:opacity-100"></i>
            </div>
          </div>

          {/* Monitor Item 3 */}
          <div className="mon group cursor-pointer">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-lg bg-bg-3 border border-border-2 flex items-center justify-center text-text-2 group-hover:text-yellow group-hover:border-yellow/30 transition-colors">
                 <i className="ti ti-lock"></i>
               </div>
               <div>
                  <div className="mon-name">payments.myapp.com</div>
                  <div className="mon-meta">SSL expires in 14 days</div>
               </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-32 hidden md:block">
                <div className="progress-bar"><div className="progress-fill" style={{ width: '60%', background: '#BA7517' }}></div></div>
              </div>
              <div className="status warn" style={{ animationDelay: '0.2s' }}><div className="sdot"></div>Warning</div>
              <i className="ti ti-dots-vertical text-text-2 opacity-50 hover:opacity-100"></i>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}