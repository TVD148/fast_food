import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import AdminVouchers from './AdminVouchers';
import AdminMenu from './AdminMenu';
import AdminCategories from './AdminCategories';
import AdminUsers from './AdminUsers';
import AdminInventory from './AdminInventory';
import './admin.css';

const NAV_ITEMS = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'vouchers',  label: 'Khuyến mãi',icon: '🎟️' },
    { key: 'menu',      label: 'Thực đơn',  icon: '🍔' },
    { key: 'categories',label: 'Danh mục',  icon: '📂' },
    { key: 'inventory', label: 'Kho hàng',  icon: '📦' },
    { key: 'users',     label: 'Người dùng',icon: '👥' },
];

export default function AdminPage({ onExitAdmin }) {
    const { currentUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => { logout(); onExitAdmin(); };

    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard':   return <AdminDashboard onNavigate={setActiveTab} />;
            case 'vouchers':    return <AdminVouchers />;
            case 'menu':        return <AdminMenu />;
            case 'categories':  return <AdminCategories />;
            case 'inventory':   return <AdminInventory />;
            case 'users':       return <AdminUsers />;
            default:            return <AdminDashboard onNavigate={setActiveTab} />;
        }
    };

    return (
        <div className={`admin-layout ${sidebarOpen ? '' : 'collapsed'}`}>
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <span className="brand-icon">🍔</span>
                    {sidebarOpen && <span className="brand-text">FastFood <span className="brand-admin">Admin</span></span>}
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.key}
                            className={`sidebar-nav-item ${activeTab === item.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.key)}
                            title={!sidebarOpen ? item.label : ''}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {sidebarOpen && <span className="nav-label">{item.label}</span>}
                            {!sidebarOpen && <span className="nav-tooltip">{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="sidebar-nav-item logout-btn" onClick={handleLogout} title="Đăng xuất">
                        <span className="nav-icon">🚪</span>
                        {sidebarOpen && <span className="nav-label">Đăng xuất</span>}
                    </button>
                    <button className="sidebar-nav-item" onClick={() => onExitAdmin()} title="Về trang chủ">
                        <span className="nav-icon">🏠</span>
                        {sidebarOpen && <span className="nav-label">Trang khách</span>}
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="admin-main">
                {/* Topbar */}
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <button className="topbar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? '◀' : '▶'}
                        </button>
                        <div className="topbar-breadcrumb">
                            <span>Admin</span>
                            <span className="breadcrumb-sep">›</span>
                            <span className="breadcrumb-active">{NAV_ITEMS.find(i => i.key === activeTab)?.label}</span>
                        </div>
                    </div>
                    <div className="topbar-right">
                        <div className="topbar-user">
                            <div className="topbar-avatar">{currentUser?.name?.charAt(0)?.toUpperCase() || 'A'}</div>
                            <div className="topbar-user-info">
                                <div className="topbar-user-name">{currentUser?.name || 'Admin'}</div>
                                <div className="topbar-user-role">👑 Quản trị viên</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="admin-content">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
