import React from 'react';
import { Plus, MessageSquare, Trash2, Settings, LogOut, Sun, Moon, User, Menu, X } from 'lucide-react';
import { DESIGN_TOKENS } from '../styles/design-system.js';

/**
 * Clean Sidebar - Simple white sidebar design
 */
export function CleanSidebar({ 
  user = null, 
  conversations = [],
  activeConversation = null,
  onNewConversation = () => {},
  onSelectConversation = () => {},
  onDeleteConversation = () => {},
  onProfileClick = () => {},
  onLogout = () => {},
  sidebarOpen = false,
  setSidebarOpen = () => {},
  isDarkMode = false,
  setIsDarkMode = () => {}
}) {
  
  const sidebarStyle = {
    width: '280px',
    height: '100vh',
    backgroundColor: DESIGN_TOKENS.colors.background,
    borderRight: `1px solid ${DESIGN_TOKENS.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 40,
    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s ease'
  };

  return (
    <>
      {/* Sidebar */}
      <div style={sidebarStyle} id="sidebar">
        {/* Header */}
        <div style={{
          padding: DESIGN_TOKENS.spacing.lg,
          borderBottom: `1px solid ${DESIGN_TOKENS.colors.border}`
        }}>
          <button
            onClick={onNewConversation}
            style={{
              ...DESIGN_TOKENS.createStyles?.button?.primary || {},
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: DESIGN_TOKENS.spacing.sm
            }}
          >
            <Plus size={16} />
            <span>New chat</span>
          </button>
        </div>

        {/* Conversations List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: DESIGN_TOKENS.spacing.sm
        }}>
          <div style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>
            <h3 style={{
              fontSize: DESIGN_TOKENS.typography.sizes.caption,
              fontWeight: DESIGN_TOKENS.typography.weights.medium,
              color: DESIGN_TOKENS.colors.text.muted,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: DESIGN_TOKENS.spacing.sm,
              padding: `0 ${DESIGN_TOKENS.spacing.sm}`
            }}>
              Recent
            </h3>
            
            {conversations.length === 0 ? (
              <div style={{
                padding: DESIGN_TOKENS.spacing.md,
                textAlign: 'center',
                color: DESIGN_TOKENS.colors.text.muted,
                fontSize: DESIGN_TOKENS.typography.sizes.caption
              }}>
                No conversations yet
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv)}
                  style={{
                    width: '100%',
                    padding: `${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.md}`,
                    margin: `${DESIGN_TOKENS.spacing.xs} 0`,
                    borderRadius: DESIGN_TOKENS.radius.sm,
                    border: 'none',
                    backgroundColor: activeConversation?.id === conv.id 
                      ? DESIGN_TOKENS.colors.backgroundSecondary 
                      : 'transparent',
                    color: DESIGN_TOKENS.colors.text.primary,
                    fontSize: DESIGN_TOKENS.typography.sizes.body,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: DESIGN_TOKENS.spacing.sm,
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (activeConversation?.id !== conv.id) {
                      e.target.style.backgroundColor = DESIGN_TOKENS.colors.backgroundSecondary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeConversation?.id !== conv.id) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <MessageSquare size={16} style={{ color: DESIGN_TOKENS.colors.text.muted }} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.title || 'Untitled conversation'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    style={{
                      padding: DESIGN_TOKENS.spacing.xs,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: DESIGN_TOKENS.colors.text.muted,
                      opacity: 0.7
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = 1}
                    onMouseLeave={(e) => e.target.style.opacity = 0.7}
                  >
                    <Trash2 size={14} />
                  </button>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Bottom section */}
        <div style={{
          borderTop: `1px solid ${DESIGN_TOKENS.colors.border}`,
          padding: DESIGN_TOKENS.spacing.md
        }}>
          {/* Theme toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: DESIGN_TOKENS.spacing.sm,
              padding: `${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.md}`,
              marginBottom: DESIGN_TOKENS.spacing.sm,
              border: `1px solid ${DESIGN_TOKENS.colors.border}`,
              borderRadius: DESIGN_TOKENS.radius.sm,
              backgroundColor: DESIGN_TOKENS.colors.background,
              color: DESIGN_TOKENS.colors.text.secondary,
              fontSize: DESIGN_TOKENS.typography.sizes.body,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = DESIGN_TOKENS.colors.backgroundSecondary}
            onMouseLeave={(e) => e.target.style.backgroundColor = DESIGN_TOKENS.colors.background}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span style={{ flex: 1, textAlign: 'left' }}>
              {isDarkMode ? 'Light mode' : 'Dark mode'}
            </span>
          </button>
          
          {/* User section */}
          <button
            onClick={onProfileClick}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: DESIGN_TOKENS.spacing.sm,
              padding: `${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.md}`,
              marginBottom: DESIGN_TOKENS.spacing.sm,
              border: `1px solid ${DESIGN_TOKENS.colors.border}`,
              borderRadius: DESIGN_TOKENS.radius.sm,
              backgroundColor: DESIGN_TOKENS.colors.background,
              color: DESIGN_TOKENS.colors.text.secondary,
              fontSize: DESIGN_TOKENS.typography.sizes.body,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = DESIGN_TOKENS.colors.backgroundSecondary}
            onMouseLeave={(e) => e.target.style.backgroundColor = DESIGN_TOKENS.colors.background}
          >
            <Settings size={16} />
            <span style={{ flex: 1, textAlign: 'left' }}>Profile & Data</span>
          </button>
          
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: DESIGN_TOKENS.spacing.sm,
              padding: `${DESIGN_TOKENS.spacing.sm} ${DESIGN_TOKENS.spacing.md}`,
              border: `1px solid ${DESIGN_TOKENS.colors.border}`,
              borderRadius: DESIGN_TOKENS.radius.sm,
              backgroundColor: DESIGN_TOKENS.colors.background,
              color: DESIGN_TOKENS.colors.text.secondary,
              fontSize: DESIGN_TOKENS.typography.sizes.body,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = DESIGN_TOKENS.colors.backgroundSecondary}
            onMouseLeave={(e) => e.target.style.backgroundColor = DESIGN_TOKENS.colors.background}
          >
            <User size={16} />
            <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </span>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 30
          }}
          onClick={() => setSidebarOpen(false)}
          className="md:hidden"
        />
      )}

      {/* Mobile menu toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          top: DESIGN_TOKENS.spacing.md,
          left: DESIGN_TOKENS.spacing.md,
          zIndex: 50,
          padding: DESIGN_TOKENS.spacing.sm,
          borderRadius: DESIGN_TOKENS.radius.sm,
          backgroundColor: DESIGN_TOKENS.colors.background,
          border: `1px solid ${DESIGN_TOKENS.colors.border}`,
          boxShadow: DESIGN_TOKENS.shadows.sm,
          cursor: 'pointer'
        }}
        className="md:hidden"
      >
        {sidebarOpen ? <X size={24} style={{ color: DESIGN_TOKENS.colors.text.primary }} /> : <Menu size={24} style={{ color: DESIGN_TOKENS.colors.text.primary }} />}
      </button>
    </>
  );
}

export default CleanSidebar;