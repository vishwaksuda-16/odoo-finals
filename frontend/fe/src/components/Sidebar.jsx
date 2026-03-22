import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";

const menuIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
);

const chevronDown = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
);

const icons = {
  dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  approver: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  masterData: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  reporting: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  settings: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
};

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
    isActive
      ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
      : "text-surface-300 hover:bg-surface-800 hover:text-white"
  }`;

const subLinkClass = ({ isActive }) =>
  `block px-3 py-2 pl-12 rounded-lg text-sm transition-all duration-200 ${
    isActive
      ? "text-primary-400 bg-surface-800 font-medium"
      : "text-surface-400 hover:text-surface-200 hover:bg-surface-800/50"
  }`;

export default function Sidebar({ isOpen, onToggle }) {
  const [expandedMenu, setExpandedMenu] = useState(null);
  const location = useLocation();
  const {
    canSeeProducts,
    canSeeBom,
    canSeeReporting,
    canSeeApproverWorkspace,
    canEditStagesSettings,
    canEditApprovalsSettings,
    canManageUsers,
  } = usePermissions();

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  // Auto-expand the correct section based on current route
  const isMasterDataActive = ["/products", "/bom"].some((p) => location.pathname.startsWith(p));
  const isSettingsActive = ["/settings"].some((p) => location.pathname.startsWith(p));
  const hasSettingsMenu = canEditStagesSettings || canEditApprovalsSettings || canManageUsers;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-surface-950 border-r border-surface-800 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0 lg:w-20"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-800">
          {/* <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-primary-600/20">
            PS
          </div> */}
          <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "w-auto opacity-100" : "lg:w-0 lg:opacity-0 w-auto opacity-100"}`}>
            <h1 className="text-white font-bold text-lg whitespace-nowrap tracking-tight">PLM Sentry</h1>
            <p className="text-surface-500 text-xs whitespace-nowrap">Engineering Platform</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {/* Dashboard */}
          <NavLink to="/" className={navLinkClass} end>
            {icons.dashboard}
            <span className={`transition-all duration-300 ${isOpen ? "opacity-100" : "lg:hidden"}`}>Dashboard</span>
          </NavLink>

          {canSeeApproverWorkspace && (
            <NavLink to="/approver" className={navLinkClass}>
              {icons.approver}
              <span className={`transition-all duration-300 ${isOpen ? "opacity-100" : "lg:hidden"}`}>Approver</span>
            </NavLink>
          )}

          {/* Master Data */}
          {(canSeeProducts || canSeeBom) && (
          <div>
            <button
              onClick={() => toggleMenu("masterData")}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isMasterDataActive
                  ? "text-primary-400 bg-surface-900"
                  : "text-surface-300 hover:bg-surface-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {icons.masterData}
                <span className={`transition-all duration-300 ${isOpen ? "opacity-100" : "lg:hidden"}`}>Master Data</span>
              </div>
              <span className={`transition-transform duration-200 ${expandedMenu === "masterData" || isMasterDataActive ? "rotate-180" : ""} ${isOpen ? "opacity-100" : "lg:hidden"}`}>
                {chevronDown}
              </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${
              expandedMenu === "masterData" || isMasterDataActive ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"
            }`}>
              {canSeeProducts && <NavLink to="/products" className={subLinkClass}>Products</NavLink>}
              {canSeeBom && <NavLink to="/bom" className={subLinkClass}>Bills of Materials</NavLink>}
            </div>
          </div>
          )}

          {/* Reporting */}
          {canSeeReporting && <NavLink to="/reporting" className={navLinkClass}>
            {icons.reporting}
            <span className={`transition-all duration-300 ${isOpen ? "opacity-100" : "lg:hidden"}`}>Reporting</span>
          </NavLink>}

          {/* Settings */}
          {hasSettingsMenu && (
          <div>
            <button
              onClick={() => toggleMenu("settings")}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isSettingsActive
                  ? "text-primary-400 bg-surface-900"
                  : "text-surface-300 hover:bg-surface-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {icons.settings}
                <span className={`transition-all duration-300 ${isOpen ? "opacity-100" : "lg:hidden"}`}>Settings</span>
              </div>
              <span className={`transition-transform duration-200 ${expandedMenu === "settings" || isSettingsActive ? "rotate-180" : ""} ${isOpen ? "opacity-100" : "lg:hidden"}`}>
                {chevronDown}
              </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${
              expandedMenu === "settings" || isSettingsActive ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"
            }`}>
              {canEditStagesSettings && <NavLink to="/settings/stages" className={subLinkClass}>ECO Stages</NavLink>}
              {canEditApprovalsSettings && <NavLink to="/settings/approvals" className={subLinkClass}>Approvals</NavLink>}
              {canManageUsers && (
                <NavLink to="/settings/users" className={subLinkClass}>Create User</NavLink>
              )}
            </div>
          </div>
          )}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-surface-800">
          <p className={`text-surface-600 text-xs transition-all duration-300 ${isOpen ? "opacity-100" : "lg:hidden"}`}>
            © 2026 PLM Sentry
          </p>
        </div>
      </aside>
    </>
  );
}