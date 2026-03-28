import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SERVER = "http://localhost:5000";

// ─── SOCKET SINGLETON ─────────────────────────────────────────────────────────
let socket = null;
function getSocket() {
  if (!socket) socket = io(SERVER, { autoConnect: false });
  return socket;
}

// ─── USERS REFERENCE (for display only) ──────────────────────────────────────
const USERS_REF = {
  mentor1: { id: "mentor1", name: "Dr. Aisha Rao", role: "mentor", avatar: "AR", title: "Senior Software Architect", mentees: ["mentee1", "mentee2"] },
  mentee1: { id: "mentee1", name: "Rohan Mehta", role: "mentee", avatar: "RM", title: "Junior Developer", mentor: "mentor1" },
  mentee2: { id: "mentee2", name: "Priya Singh", role: "mentee", avatar: "PS", title: "Data Analyst", mentor: "mentor1" },
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    chat: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    task: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
    calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    announce: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    progress: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    profile: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    send: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    clock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    file: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    menu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    link: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
    upload: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
    wifi: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>,
  };
  return icons[name] || null;
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("mb-styles")) return;
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#0b0f1a;--bg2:#111827;--bg3:#1a2234;--bg4:#1e2a40;
      --border:#2a3a52;--border2:#334466;
      --primary:#3b82f6;--primary-d:#2563eb;--primary-glow:rgba(59,130,246,0.25);
      --accent:#06d6a0;--accent-d:#05b385;
      --warn:#f59e0b;--danger:#ef4444;--purple:#8b5cf6;
      --text:#e2e8f0;--text2:#94a3b8;--text3:#64748b;
      --mentor:#8b5cf6;--mentee:#3b82f6;
      --radius:12px;--radius-sm:8px;--radius-lg:16px;
      --shadow:0 4px 24px rgba(0,0,0,0.4);
      --transition:all 0.2s cubic-bezier(0.4,0,0.2,1);
    }
    body{font-family:'Sora',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-track{background:var(--bg2)}
    ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:99px}

    /* AUTH */
    .auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
    .auth-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 20% 50%,rgba(59,130,246,0.12) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(139,92,246,0.1) 0%,transparent 50%),var(--bg)}
    .auth-grid{position:absolute;inset:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:40px 40px;opacity:0.3}
    .auth-card{position:relative;z-index:2;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:2.5rem;width:min(420px,90vw);box-shadow:var(--shadow)}
    .auth-logo{display:flex;align-items:center;gap:12px;margin-bottom:2rem}
    .auth-logo-icon{width:44px;height:44px;background:linear-gradient(135deg,var(--primary),var(--purple));border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem}
    .auth-logo-text{font-size:1.25rem;font-weight:700;letter-spacing:-0.02em}
    .auth-logo-sub{font-size:0.7rem;color:var(--text3);text-transform:uppercase;letter-spacing:0.1em}
    .auth-title{font-size:1.5rem;font-weight:700;margin-bottom:0.4rem}
    .auth-sub{color:var(--text2);font-size:0.85rem;margin-bottom:1.8rem}
    .form-group{margin-bottom:1rem}
    .form-label{display:block;font-size:0.78rem;font-weight:600;color:var(--text2);margin-bottom:0.4rem;text-transform:uppercase;letter-spacing:0.05em}
    .form-input{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.65rem 0.9rem;color:var(--text);font-family:inherit;font-size:0.9rem;transition:var(--transition);outline:none}
    .form-input:focus{border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-glow)}
    .form-select{appearance:none;cursor:pointer}
    .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:0.65rem 1.2rem;border-radius:var(--radius-sm);font-family:inherit;font-size:0.875rem;font-weight:600;cursor:pointer;border:none;transition:var(--transition)}
    .btn-primary{background:var(--primary);color:#fff}
    .btn-primary:hover{background:var(--primary-d);transform:translateY(-1px)}
    .btn-accent{background:var(--accent);color:#0a1628}
    .btn-accent:hover{background:var(--accent-d)}
    .btn-ghost{background:transparent;color:var(--text2);border:1px solid var(--border)}
    .btn-ghost:hover{background:var(--bg3);color:var(--text)}
    .btn-full{width:100%}
    .role-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:1.5rem}
    .role-tab{padding:0.65rem;border-radius:var(--radius-sm);border:1.5px solid var(--border);background:var(--bg3);color:var(--text2);cursor:pointer;text-align:center;font-size:0.85rem;font-weight:600;transition:var(--transition);font-family:inherit}
    .role-tab.mentor.active{border-color:var(--mentor);background:rgba(139,92,246,0.1);color:var(--mentor)}
    .role-tab.mentee.active{border-color:var(--mentee);background:rgba(59,130,246,0.1);color:var(--mentee)}
    .demo-creds{margin-top:1.2rem;padding:0.8rem;background:var(--bg3);border-radius:var(--radius-sm);border:1px solid var(--border);font-size:0.75rem;color:var(--text3)}
    .demo-creds strong{color:var(--text2)}
    .demo-creds code{font-family:'JetBrains Mono',monospace;color:var(--accent);font-size:0.72rem}

    /* LAYOUT */
    .app-layout{display:flex;height:100vh;overflow:hidden}
    .sidebar{width:240px;min-width:240px;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;transition:var(--transition);position:relative;z-index:50}
    .sidebar.collapsed{width:68px;min-width:68px}
    .sidebar-header{padding:1.2rem 1rem;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px}
    .sidebar-logo{width:36px;height:36px;background:linear-gradient(135deg,var(--primary),var(--purple));border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
    .sidebar-title{font-size:0.9rem;font-weight:700;letter-spacing:-0.01em;white-space:nowrap;overflow:hidden}
    .sidebar-title span{display:block;font-size:0.65rem;font-weight:400;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em}
    .sidebar-nav{flex:1;padding:0.75rem 0.5rem;overflow-y:auto;display:flex;flex-direction:column;gap:2px}
    .nav-item{display:flex;align-items:center;gap:12px;padding:0.55rem 0.75rem;border-radius:var(--radius-sm);cursor:pointer;transition:var(--transition);color:var(--text2);font-size:0.85rem;font-weight:500;white-space:nowrap;position:relative}
    .nav-item:hover{background:var(--bg3);color:var(--text)}
    .nav-item.active{background:rgba(59,130,246,0.12);color:var(--primary)}
    .nav-item.active::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:60%;background:var(--primary);border-radius:0 3px 3px 0}
    .nav-badge{margin-left:auto;background:var(--danger);color:#fff;font-size:0.65rem;padding:1px 6px;border-radius:99px;font-weight:700}
    .sidebar-footer{padding:0.75rem 0.5rem;border-top:1px solid var(--border)}
    .user-chip{display:flex;align-items:center;gap:10px;padding:0.5rem 0.75rem;border-radius:var(--radius-sm);cursor:pointer}
    .avatar{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;flex-shrink:0;color:#fff}
    .avatar.mentor{background:linear-gradient(135deg,var(--purple),#6d28d9)}
    .avatar.mentee{background:linear-gradient(135deg,var(--primary),#1d4ed8)}
    .avatar-lg{width:48px;height:48px;font-size:1rem;border-radius:12px}
    .avatar-xl{width:72px;height:72px;font-size:1.4rem;border-radius:16px}
    .user-chip-name{font-size:0.8rem;font-weight:600}
    .user-chip-role{font-size:0.65rem;color:var(--text3);text-transform:uppercase;letter-spacing:0.06em}
    .role-badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:0.65rem;font-weight:700;text-transform:uppercase}
    .role-badge.mentor{background:rgba(139,92,246,0.15);color:var(--mentor)}
    .role-badge.mentee{background:rgba(59,130,246,0.15);color:var(--mentee)}

    /* MAIN */
    .main-area{flex:1;display:flex;flex-direction:column;overflow:hidden}
    .topbar{height:56px;border-bottom:1px solid var(--border);padding:0 1.5rem;display:flex;align-items:center;justify-content:space-between;background:var(--bg2);flex-shrink:0}
    .topbar-title{font-size:1rem;font-weight:700}
    .topbar-right{display:flex;align-items:center;gap:8px}
    .icon-btn{width:36px;height:36px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg3);color:var(--text2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:var(--transition);position:relative}
    .icon-btn:hover{background:var(--bg4);color:var(--text)}
    .notif-dot{position:absolute;top:6px;right:6px;width:7px;height:7px;background:var(--danger);border-radius:50%;border:1.5px solid var(--bg2)}
    .page{flex:1;overflow-y:auto;padding:1.5rem}

    /* CONNECTION STATUS */
    .conn-bar{padding:6px 1.5rem;font-size:0.75rem;font-weight:600;display:flex;align-items:center;gap:8px;transition:var(--transition)}
    .conn-bar.connected{background:rgba(6,214,160,0.1);color:var(--accent);border-bottom:1px solid rgba(6,214,160,0.2)}
    .conn-bar.disconnected{background:rgba(239,68,68,0.1);color:var(--danger);border-bottom:1px solid rgba(239,68,68,0.2)}
    .conn-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
    .conn-bar.connected .conn-dot{background:var(--accent);animation:pulse 2s infinite}
    .conn-bar.disconnected .conn-dot{background:var(--danger)}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}

    /* CARDS */
    .card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:1.25rem}
    .card-title{font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--text3);margin-bottom:1rem}
    .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem}
    .section-title{font-size:0.95rem;font-weight:700}

    /* STATS */
    .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-bottom:1.5rem}
    .stat-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:1.25rem;position:relative;overflow:hidden;transition:var(--transition)}
    .stat-card:hover{border-color:var(--border2);transform:translateY(-2px)}
    .stat-card-glow{position:absolute;top:-20px;right:-20px;width:80px;height:80px;border-radius:50%;opacity:0.15;filter:blur(20px)}
    .stat-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:0.75rem}
    .stat-value{font-size:1.75rem;font-weight:700;letter-spacing:-0.03em;line-height:1}
    .stat-label{font-size:0.75rem;color:var(--text3);margin-top:0.3rem}

    /* DASHBOARD GRID */
    .dash-grid{display:grid;grid-template-columns:1fr 320px;gap:1.25rem}

    /* CHAT */
    .chat-layout{display:flex;height:100%}
    .chat-sidebar{width:260px;border-right:1px solid var(--border);display:flex;flex-direction:column;background:var(--bg2)}
    .chat-list{flex:1;overflow-y:auto;padding:0.5rem}
    .chat-item{display:flex;align-items:center;gap:10px;padding:0.6rem 0.75rem;border-radius:var(--radius-sm);cursor:pointer;transition:var(--transition)}
    .chat-item:hover{background:var(--bg3)}
    .chat-item.active{background:rgba(59,130,246,0.1)}
    .online-indicator{width:8px;height:8px;border-radius:50%;flex-shrink:0}
    .online-indicator.online{background:var(--accent)}
    .online-indicator.offline{background:var(--text3)}
    .chat-main{flex:1;display:flex;flex-direction:column;background:var(--bg)}
    .chat-header{padding:0.9rem 1.2rem;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;background:var(--bg2)}
    .chat-messages{flex:1;overflow-y:auto;padding:1.2rem;display:flex;flex-direction:column;gap:0.75rem}
    .message{max-width:65%;display:flex;flex-direction:column;gap:3px}
    .message.own{align-self:flex-end;align-items:flex-end}
    .message.other{align-self:flex-start;align-items:flex-start}
    .msg-bubble{padding:0.6rem 0.9rem;border-radius:12px;font-size:0.85rem;line-height:1.5;word-break:break-word}
    .message.own .msg-bubble{background:var(--primary);color:#fff;border-bottom-right-radius:4px}
    .message.other .msg-bubble{background:var(--bg3);border:1px solid var(--border);border-bottom-left-radius:4px}
    .msg-ts{font-size:0.68rem;color:var(--text3)}
    .chat-input-area{padding:0.9rem 1.2rem;border-top:1px solid var(--border);background:var(--bg2);display:flex;gap:10px;align-items:center}
    .chat-input{flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.6rem 0.9rem;color:var(--text);font-family:inherit;font-size:0.875rem;outline:none;transition:var(--transition)}
    .chat-input:focus{border-color:var(--primary)}
    .typing-dots span{display:inline-block;width:5px;height:5px;background:var(--text3);border-radius:50%;animation:bounce 1.2s infinite;margin:0 1px}
    .typing-dots span:nth-child(2){animation-delay:0.2s}
    .typing-dots span:nth-child(3){animation-delay:0.4s}
    @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}

    /* TASKS */
    .task-filters{display:flex;gap:8px;margin-bottom:1.2rem;flex-wrap:wrap}
    .filter-chip{padding:0.35rem 0.9rem;border-radius:99px;border:1px solid var(--border);font-size:0.78rem;font-weight:600;cursor:pointer;transition:var(--transition);background:var(--bg2);color:var(--text2)}
    .filter-chip:hover{border-color:var(--border2);color:var(--text)}
    .filter-chip.active{background:rgba(59,130,246,0.12);border-color:var(--primary);color:var(--primary)}
    .task-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:1.1rem;margin-bottom:0.75rem;transition:var(--transition)}
    .task-card:hover{border-color:var(--border2);transform:translateY(-1px)}
    .task-card-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:0.6rem}
    .task-title{font-size:0.9rem;font-weight:600}
    .priority-badge{font-size:0.65rem;font-weight:700;padding:2px 8px;border-radius:99px;text-transform:uppercase}
    .priority-high{background:rgba(239,68,68,0.15);color:var(--danger)}
    .priority-medium{background:rgba(245,158,11,0.15);color:var(--warn)}
    .priority-low{background:rgba(6,214,160,0.15);color:var(--accent)}
    .status-badge{font-size:0.65rem;font-weight:700;padding:2px 8px;border-radius:99px;text-transform:uppercase}
    .status-pending{background:rgba(100,116,139,0.2);color:var(--text3)}
    .status-in-progress{background:rgba(59,130,246,0.15);color:var(--primary)}
    .status-completed{background:rgba(6,214,160,0.15);color:var(--accent)}
    .progress-bar{height:4px;background:var(--bg4);border-radius:99px;overflow:hidden;margin-top:0.7rem}
    .progress-fill{height:100%;border-radius:99px;transition:width 0.5s ease;background:linear-gradient(90deg,var(--primary),var(--accent))}
    .task-meta{display:flex;align-items:center;gap:0.75rem;margin-top:0.6rem;font-size:0.75rem;color:var(--text3)}

    /* MEETINGS */
    .meeting-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:1.1rem;margin-bottom:0.75rem;display:flex;align-items:center;gap:1rem;transition:var(--transition)}
    .meeting-card:hover{border-color:var(--border2)}
    .meeting-date-block{background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.5rem 0.75rem;text-align:center;min-width:56px;flex-shrink:0}
    .meeting-day{font-size:1.4rem;font-weight:700;line-height:1}
    .meeting-month{font-size:0.65rem;color:var(--text3);text-transform:uppercase}
    .meeting-info{flex:1}
    .meeting-title{font-size:0.9rem;font-weight:600;margin-bottom:3px}
    .meeting-details{font-size:0.78rem;color:var(--text2);display:flex;align-items:center;gap:0.75rem}
    .upcoming-tag{padding:2px 8px;border-radius:99px;font-size:0.68rem;font-weight:700;background:rgba(59,130,246,0.1);color:var(--primary);text-transform:uppercase}
    .completed-tag{padding:2px 8px;border-radius:99px;font-size:0.68rem;font-weight:700;background:rgba(6,214,160,0.1);color:var(--accent);text-transform:uppercase}

    /* ANNOUNCEMENTS */
    .announce-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:1.1rem;margin-bottom:0.75rem}
    .announce-card.important{border-left:3px solid var(--warn)}
    .announce-title{font-size:0.9rem;font-weight:700;margin-bottom:0.4rem}
    .announce-body{font-size:0.82rem;color:var(--text2);line-height:1.6}

    /* MODAL */
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;padding:1rem}
    .modal{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.75rem;width:min(500px,95vw);max-height:85vh;overflow-y:auto}
    .modal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem}
    .modal-title{font-size:1.1rem;font-weight:700}

    /* NOTIF PANEL */
    .notif-panel{position:absolute;top:52px;right:8px;width:320px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow);z-index:90;overflow:hidden}
    .notif-header{padding:0.9rem 1rem;border-bottom:1px solid var(--border);font-size:0.85rem;font-weight:700;display:flex;justify-content:space-between;align-items:center}
    .notif-item{padding:0.75rem 1rem;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;gap:10px;cursor:pointer;transition:var(--transition)}
    .notif-item:hover{background:var(--bg3)}
    .notif-item.unread{background:rgba(59,130,246,0.05)}

    /* MISC */
    .profile-header{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:2rem;margin-bottom:1.25rem;position:relative;overflow:hidden}
    .profile-bg-strip{position:absolute;top:0;left:0;right:0;height:80px;background:linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.2))}
    .profile-info{position:relative;display:flex;align-items:flex-end;gap:1.25rem;margin-top:2rem}
    .skill-tag{display:inline-block;padding:3px 10px;border-radius:99px;font-size:0.72rem;background:var(--bg3);border:1px solid var(--border);color:var(--text2);margin:2px}
    .edit-field{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.55rem 0.8rem;color:var(--text);font-family:inherit;font-size:0.875rem;outline:none;transition:var(--transition)}
    .edit-field:focus{border-color:var(--primary)}
    .divider{height:1px;background:var(--border);margin:1rem 0}
    .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
    .msg-preview-item{display:flex;align-items:flex-start;gap:10px;padding:0.75rem;border-radius:var(--radius-sm);cursor:pointer;transition:var(--transition)}
    .msg-preview-item:hover{background:var(--bg3)}
    .fade-in{animation:fadeIn 0.3s ease}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    .empty-state{text-align:center;padding:3rem 1rem;color:var(--text3)}
    .mobile-toggle{display:none}
    .sidebar-overlay{display:none}
    textarea.form-input{resize:vertical;min-height:80px}
    @media(max-width:768px){
      .mobile-toggle{display:flex}
      .sidebar{position:fixed;left:-240px;top:0;bottom:0;transition:left 0.3s ease;z-index:200}
      .sidebar.mobile-open{left:0}
      .sidebar-overlay{display:block;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:199}
      .dash-grid{grid-template-columns:1fr}
      .chat-sidebar{width:200px}
      .stats-grid{grid-template-columns:repeat(2,1fr)}
    }
    @media(max-width:500px){
      .chat-sidebar{display:none}
      .stats-grid{grid-template-columns:1fr 1fr}
      .page{padding:1rem}
      .grid-2{grid-template-columns:1fr}
    }
  `;
  const el = document.createElement("style");
  el.id = "mb-styles";
  el.textContent = css;
  document.head.appendChild(el);
};

// ─── API HELPERS ──────────────────────────────────────────────────────────────
const api = {
  login: (data) => fetch(`${SERVER}/api/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  getTasks: () => fetch(`${SERVER}/api/tasks`).then(r => r.json()),
  addTask: (data) => fetch(`${SERVER}/api/tasks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  updateTask: (id, data) => fetch(`${SERVER}/api/tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  getMeetings: () => fetch(`${SERVER}/api/meetings`).then(r => r.json()),
  addMeeting: (data) => fetch(`${SERVER}/api/meetings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  getAnnouncements: () => fetch(`${SERVER}/api/announcements`).then(r => r.json()),
  addAnnouncement: (data) => fetch(`${SERVER}/api/announcements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
};

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [role, setRole] = useState("mentee");
  const [email, setEmail] = useState("rohan@mentee.com");
  const [password, setPassword] = useState("mentee123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true); setError("");
    try {
      const res = await api.login({ email, password, role });
      if (res.success) onLogin(res.user);
      else setError(res.message || "Invalid credentials");
    } catch {
      setError("Cannot connect to server. Make sure backend is running on port 5000.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-bg" /><div className="auth-grid" />
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">🎓</div>
          <div><div className="auth-logo-text">MentorBridge</div><div className="auth-logo-sub">Real-time Platform</div></div>
        </div>
        <div className="auth-title">Welcome back</div>
        <div className="auth-sub">Sign in to connect with your mentor/mentee</div>
        <div className="role-tabs">
          <button className={`role-tab mentor ${role==="mentor"?"active":""}`} onClick={()=>{setRole("mentor");setEmail("aisha.rao@mentor.com");setPassword("mentor123")}}>🧑‍🏫 Mentor</button>
          <button className={`role-tab mentee ${role==="mentee"?"active":""}`} onClick={()=>{setRole("mentee");setEmail("rohan@mentee.com");setPassword("mentee123")}}>🎓 Mentee</button>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
        </div>
        {error && <div style={{color:"var(--danger)",fontSize:"0.8rem",marginBottom:"0.75rem",padding:"0.5rem",background:"rgba(239,68,68,0.1)",borderRadius:"6px"}}>{error}</div>}
        <button className="btn btn-primary btn-full" onClick={handleLogin} disabled={loading}>{loading?"Signing in...":"Sign In →"}</button>
        <div className="demo-creds">
          <strong>Demo Accounts:</strong><br/>
          Mentor: <code>aisha.rao@mentor.com</code> / <code>mentor123</code><br/>
          Mentee 1: <code>rohan@mentee.com</code> / <code>mentee123</code><br/>
          Mentee 2: <code>priya@mentee.com</code> / <code>mentee123</code>
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ user, page, setPage, onLogout, collapsed, setCollapsed, mobileOpen, setMobileOpen, unreadCount }) {
  const navItems = [
    { id:"dashboard", label:"Dashboard", icon:"dashboard" },
    { id:"chat", label:"Messages", icon:"chat", badge: unreadCount },
    { id:"tasks", label:"Tasks", icon:"task" },
    { id:"meetings", label:"Meetings", icon:"calendar" },
    { id:"announcements", label:"Announcements", icon:"announce" },
    { id:"progress", label:"Progress", icon:"progress" },
    { id:"files", label:"Files", icon:"file" },
    { id:"profile", label:"Profile", icon:"profile" },
  ];
  const go = (id) => { setPage(id); setMobileOpen(false); };
  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={()=>setMobileOpen(false)} />}
      <div className={`sidebar ${collapsed?"collapsed":""} ${mobileOpen?"mobile-open":""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">🎓</div>
          {!collapsed && <div className="sidebar-title">MentorBridge<span>Growth Platform</span></div>}
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <div key={item.id} className={`nav-item ${page===item.id?"active":""}`} onClick={()=>go(item.id)}>
              <Icon name={item.icon} size={17} />
              {!collapsed && <span style={{flex:1}}>{item.label}</span>}
              {!collapsed && item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip" onClick={()=>go("profile")}>
            <div className={`avatar ${user.role}`}>{user.avatar}</div>
            {!collapsed && <div><div className="user-chip-name">{user.name}</div><div className="user-chip-role">{user.role}</div></div>}
          </div>
          <div className="nav-item" onClick={onLogout} style={{marginTop:"4px"}}>
            <Icon name="logout" size={17} />
            {!collapsed && <span>Sign Out</span>}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── CHAT PAGE (REAL-TIME) ────────────────────────────────────────────────────
function ChatPage({ user, socket, onlineUsers, messages, setMessages, setUnread }) {
  const isMentor = user.role === "mentor";
  const peers = isMentor
    ? (USERS_REF[user.id]?.mentees || []).map(id => USERS_REF[id])
    : [USERS_REF[user.mentor]];

  const [activePeer, setActivePeer] = useState(peers[0]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  const getKey = (peerId) => {
    const ids = [user.id, peerId];
    const mentor = ids.find(id => USERS_REF[id]?.role === "mentor");
    const mentee = ids.find(id => USERS_REF[id]?.role === "mentee");
    return `${mentor}-${mentee}`;
  };

  const key = activePeer ? getKey(activePeer.id) : null;
  const conv = (key && messages[key]) ? messages[key] : [];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [conv, activePeer]);

  // Listen for typing events
  useEffect(() => {
    if (!socket) return;
    const handleTypingStart = ({ from }) => setTypingUsers(p => ({ ...p, [from]: true }));
    const handleTypingStop = ({ from }) => setTypingUsers(p => { const n = { ...p }; delete n[from]; return n; });
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);
    return () => { socket.off("typing:start", handleTypingStart); socket.off("typing:stop", handleTypingStop); };
  }, [socket]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!socket || !activePeer) return;
    socket.emit("typing:start", { toUserId: activePeer.id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing:stop", { toUserId: activePeer.id });
    }, 1500);
  };

  const sendMessage = () => {
    if (!input.trim() || !socket || !activePeer) return;
    socket.emit("message:send", { toUserId: activePeer.id, text: input.trim() });
    socket.emit("typing:stop", { toUserId: activePeer.id });
    setInput("");
  };

  const isOnline = (peerId) => onlineUsers.includes(peerId);

  return (
    <div style={{ display:"flex", height:"calc(100vh - 56px)", margin:"-1.5rem", overflow:"hidden" }}>
      <div className="chat-sidebar">
        <div style={{ padding:"1rem", borderBottom:"1px solid var(--border)", fontWeight:700, fontSize:"0.85rem" }}>Conversations</div>
        <div className="chat-list">
          {peers.map(peer => (
            <div key={peer.id} className={`chat-item ${activePeer?.id===peer.id?"active":""}`} onClick={()=>setActivePeer(peer)}>
              <div style={{ position:"relative" }}>
                <div className={`avatar ${peer.role}`}>{peer.avatar}</div>
                <div className={`online-indicator ${isOnline(peer.id)?"online":"offline"}`} style={{ position:"absolute", bottom:-1, right:-1, border:"2px solid var(--bg2)" }} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:"0.82rem", fontWeight:600 }}>{peer.name}</div>
                <div style={{ fontSize:"0.72rem", color: isOnline(peer.id) ? "var(--accent)" : "var(--text3)" }}>
                  {isOnline(peer.id) ? "● Online" : "○ Offline"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {activePeer && (
          <>
            <div className="chat-header">
              <div style={{ position:"relative" }}>
                <div className={`avatar ${activePeer.role}`}>{activePeer.avatar}</div>
                <div className={`online-indicator ${isOnline(activePeer.id)?"online":"offline"}`} style={{ position:"absolute", bottom:-1, right:-1, border:"2px solid var(--bg2)" }} />
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:"0.9rem" }}>{activePeer.name}</div>
                <div style={{ fontSize:"0.72rem", color: isOnline(activePeer.id) ? "var(--accent)" : "var(--text3)" }}>
                  {isOnline(activePeer.id) ? "● Online now" : "○ Offline"}
                </div>
              </div>
              <span className={`role-badge ${activePeer.role}`} style={{ marginLeft:"auto" }}>{activePeer.role}</span>
            </div>

            <div className="chat-messages">
              {conv.length === 0 && (
                <div className="empty-state">
                  <div style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>💬</div>
                  <div>No messages yet. Say hello!</div>
                </div>
              )}
              {conv.map((msg, i) => {
                const isOwn = msg.from === user.id;
                return (
                  <div key={msg.id || i} className={`message ${isOwn?"own":"other"} fade-in`}>
                    <div className="msg-bubble">{msg.text}</div>
                    <div className="msg-ts">{msg.time}</div>
                  </div>
                );
              })}
              {typingUsers[activePeer.id] && (
                <div className="message other fade-in">
                  <div className="msg-bubble">
                    <div className="typing-dots"><span/><span/><span/></div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="chat-input-area">
              <input className="chat-input" value={input} onChange={handleInputChange} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder={`Message ${activePeer.name.split(" ")[0]}...`} />
              <button className="btn btn-primary" style={{ padding:"0.6rem 1rem" }} onClick={sendMessage}>
                <Icon name="send" size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, tasks, meetings, messages, setPage, onlineUsers }) {
  const isMentor = user.role === "mentor";
  const myTasks = tasks.filter(t => isMentor ? t.assignedBy===user.id : t.assignedTo===user.id);
  const completed = myTasks.filter(t => t.status==="completed").length;
  const upcoming = meetings.filter(m => m.status==="upcoming" && (m.mentor===user.id || m.mentee===user.id));
  const peers = isMentor ? (USERS_REF[user.id]?.mentees||[]).map(id=>USERS_REF[id]) : [USERS_REF[user.mentor]];

  const stats = isMentor
    ? [
        { label:"Active Mentees", value: user.mentees?.length||0, icon:"users", color:"var(--purple)", glow:"#8b5cf6" },
        { label:"Tasks Assigned", value: tasks.filter(t=>t.assignedBy===user.id).length, icon:"task", color:"var(--primary)", glow:"#3b82f6" },
        { label:"Upcoming Meetings", value: upcoming.length, icon:"calendar", color:"var(--accent)", glow:"#06d6a0" },
        { label:"Online Now", value: peers.filter(p=>onlineUsers.includes(p?.id)).length, icon:"wifi", color:"var(--warn)", glow:"#f59e0b" },
      ]
    : [
        { label:"Tasks Assigned", value: myTasks.length, icon:"task", color:"var(--primary)", glow:"#3b82f6" },
        { label:"Completed", value: completed, icon:"check", color:"var(--accent)", glow:"#06d6a0" },
        { label:"Upcoming Meetings", value: upcoming.length, icon:"calendar", color:"var(--purple)", glow:"#8b5cf6" },
        { label:"Progress", value:`${Math.round((completed/Math.max(myTasks.length,1))*100)}%`, icon:"progress", color:"var(--warn)", glow:"#f59e0b" },
      ];

  const allMsgs = Object.values(messages).flat().slice(-4).reverse();

  return (
    <div className="fade-in">
      <div style={{ marginBottom:"1.5rem" }}>
        <h1 style={{ fontSize:"1.3rem", fontWeight:700, letterSpacing:"-0.02em" }}>Good morning, {user.name.split(" ")[0]} 👋</h1>
        <p style={{ color:"var(--text2)", fontSize:"0.85rem", marginTop:"4px" }}>Here's what's happening today.</p>
      </div>
      <div className="stats-grid">
        {stats.map((s,i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-glow" style={{ background:s.glow }} />
            <div className="stat-icon" style={{ background:`${s.glow}22` }}><span style={{ color:s.color }}><Icon name={s.icon} size={17} /></span></div>
            <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="dash-grid">
        <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
          <div className="card">
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"1rem" }}>
              <div style={{ fontWeight:700 }}>Recent Tasks</div>
              <button className="btn btn-ghost" style={{ fontSize:"0.75rem", padding:"0.3rem 0.75rem" }} onClick={()=>setPage("tasks")}>View All</button>
            </div>
            {myTasks.slice(0,3).map(task => (
              <div key={task.id} style={{ marginBottom:"0.9rem" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"4px" }}>
                  <span style={{ fontSize:"0.85rem", fontWeight:600 }}>{task.title}</span>
                  <span className={`status-badge status-${task.status.replace(" ","-")}`}>{task.status}</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width:`${task.progress}%` }} /></div>
                <div style={{ fontSize:"0.72rem", color:"var(--text3)", marginTop:"4px" }}>{task.progress}% · Due {task.due}</div>
              </div>
            ))}
            {myTasks.length===0 && <div style={{ color:"var(--text3)", fontSize:"0.82rem" }}>No tasks yet</div>}
          </div>
          <div className="card">
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"1rem" }}>
              <div style={{ fontWeight:700 }}>Recent Messages</div>
              <button className="btn btn-ghost" style={{ fontSize:"0.75rem", padding:"0.3rem 0.75rem" }} onClick={()=>setPage("chat")}>Open Chat</button>
            </div>
            {allMsgs.map((msg,i) => {
              const sender = USERS_REF[msg.from];
              return (
                <div key={i} className="msg-preview-item">
                  <div className={`avatar ${sender?.role}`}>{sender?.avatar}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:"0.82rem", fontWeight:600 }}>{sender?.name}</span>
                      <span style={{ fontSize:"0.7rem", color:"var(--text3)" }}>{msg.time}</span>
                    </div>
                    <div style={{ fontSize:"0.78rem", color:"var(--text2)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{msg.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
          <div className="card">
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"1rem" }}>
              <div style={{ fontWeight:700 }}>Upcoming Meetings</div>
              <button className="btn btn-ghost" style={{ fontSize:"0.75rem", padding:"0.3rem 0.75rem" }} onClick={()=>setPage("meetings")}>View All</button>
            </div>
            {upcoming.slice(0,3).map(m => {
              const d = new Date(m.date);
              return (
                <div key={m.id} style={{ display:"flex", gap:"10px", marginBottom:"0.75rem", alignItems:"center" }}>
                  <div className="meeting-date-block">
                    <div className="meeting-day">{d.getDate()}</div>
                    <div className="meeting-month">{d.toLocaleString("default",{month:"short"})}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:"0.85rem", fontWeight:600 }}>{m.title}</div>
                    <div style={{ fontSize:"0.75rem", color:"var(--text2)" }}>{m.time} · {m.duration}min</div>
                  </div>
                </div>
              );
            })}
            {upcoming.length===0 && <div style={{ color:"var(--text3)", fontSize:"0.82rem" }}>No upcoming meetings</div>}
          </div>
          <div className="card">
            <div style={{ fontWeight:700, marginBottom:"1rem" }}>Online Status</div>
            {peers.map(peer => (
              <div key={peer?.id} style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"0.75rem" }}>
                <div style={{ position:"relative" }}>
                  <div className={`avatar ${peer?.role}`}>{peer?.avatar}</div>
                  <div className={`online-indicator ${onlineUsers.includes(peer?.id)?"online":"offline"}`} style={{ position:"absolute", bottom:-1, right:-1, border:"2px solid var(--bg2)", width:8, height:8, borderRadius:"50%" }} />
                </div>
                <div>
                  <div style={{ fontSize:"0.82rem", fontWeight:600 }}>{peer?.name}</div>
                  <div style={{ fontSize:"0.72rem", color: onlineUsers.includes(peer?.id) ? "var(--accent)" : "var(--text3)" }}>
                    {onlineUsers.includes(peer?.id) ? "● Online" : "○ Offline"}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {isMentor && (
            <div className="card">
              <div className="card-title">Quick Actions</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                <button className="btn btn-primary" style={{ justifyContent:"flex-start" }} onClick={()=>setPage("tasks")}><Icon name="plus" size={15}/> Assign Task</button>
                <button className="btn btn-ghost" style={{ justifyContent:"flex-start" }} onClick={()=>setPage("meetings")}><Icon name="calendar" size={15}/> Schedule Meeting</button>
                <button className="btn btn-ghost" style={{ justifyContent:"flex-start" }} onClick={()=>setPage("announcements")}><Icon name="announce" size={15}/> Post Announcement</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TASKS PAGE ───────────────────────────────────────────────────────────────
function TasksPage({ user, tasks, onAdd, onUpdate }) {
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title:"", description:"", assignedTo:"mentee1", due:"", priority:"medium" });
  const isMentor = user.role === "mentor";
  const myTasks = tasks.filter(t => isMentor ? t.assignedBy===user.id : t.assignedTo===user.id);
  const filtered = filter==="all" ? myTasks : myTasks.filter(t=>t.status===filter);

  const addTask = async () => {
    if (!newTask.title || !newTask.due) return;
    await onAdd({ ...newTask, assignedBy: user.id });
    setShowModal(false);
    setNewTask({ title:"", description:"", assignedTo:"mentee1", due:"", priority:"medium" });
  };

  const updateProgress = async (id, progress) => {
    await onUpdate(id, { progress, status: progress===100?"completed":progress>0?"in-progress":"pending" });
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <div>
          <div style={{ fontSize:"1.2rem", fontWeight:700 }}>Tasks</div>
          <div style={{ color:"var(--text2)", fontSize:"0.82rem" }}>{myTasks.length} total</div>
        </div>
        {isMentor && <button className="btn btn-primary" onClick={()=>setShowModal(true)}><Icon name="plus" size={16}/> Assign Task</button>}
      </div>
      <div className="task-filters">
        {["all","pending","in-progress","completed"].map(f => (
          <button key={f} className={`filter-chip ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>
            {f==="all"?"All":f==="in-progress"?"In Progress":f.charAt(0).toUpperCase()+f.slice(1)}
            <span style={{ marginLeft:"5px", opacity:0.7 }}>{f==="all"?myTasks.length:myTasks.filter(t=>t.status===f).length}</span>
          </button>
        ))}
      </div>
      {filtered.length===0 ? <div className="empty-state"><div style={{fontSize:"2rem"}}>📋</div><div>No tasks found</div></div>
      : filtered.map(task => (
        <div key={task.id} className="task-card">
          <div className="task-card-header">
            <div>
              <div className="task-title">{task.title}</div>
              <div style={{ fontSize:"0.78rem", color:"var(--text2)", marginTop:"3px" }}>{task.description}</div>
            </div>
            <div style={{ display:"flex", gap:"6px", flexShrink:0, marginLeft:"1rem" }}>
              <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
              <span className={`status-badge status-${task.status.replace(" ","-")}`}>{task.status}</span>
            </div>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width:`${task.progress}%` }} /></div>
          <div className="task-meta">
            <span><Icon name="clock" size={12}/> Due: {task.due}</span>
            <span>{task.progress}% complete</span>
            {isMentor && <span>→ {USERS_REF[task.assignedTo]?.name}</span>}
          </div>
          {!isMentor && task.status!=="completed" && (
            <div style={{ marginTop:"0.75rem", display:"flex", gap:"6px" }}>
              <input type="range" min="0" max="100" value={task.progress} onChange={e=>updateProgress(task.id,parseInt(e.target.value))} style={{ flex:1, accentColor:"var(--primary)" }} />
              <button className="btn btn-accent" style={{ fontSize:"0.75rem", padding:"0.3rem 0.75rem" }} onClick={()=>updateProgress(task.id,100)}>
                <Icon name="check" size={13}/> Done
              </button>
            </div>
          )}
        </div>
      ))}
      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal fade-in">
            <div className="modal-header">
              <div className="modal-title">Assign New Task</div>
              <button className="icon-btn" onClick={()=>setShowModal(false)}><Icon name="x"/></button>
            </div>
            <div className="form-group"><label className="form-label">Task Title</label><input className="form-input" value={newTask.title} onChange={e=>setNewTask(p=>({...p,title:e.target.value}))} placeholder="e.g. Build a REST API" /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" value={newTask.description} onChange={e=>setNewTask(p=>({...p,description:e.target.value}))} placeholder="Task details..." /></div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Assign To</label>
                <select className="form-input form-select" value={newTask.assignedTo} onChange={e=>setNewTask(p=>({...p,assignedTo:e.target.value}))}>
                  {user.mentees?.map(id=><option key={id} value={id}>{USERS_REF[id]?.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Priority</label>
                <select className="form-input form-select" value={newTask.priority} onChange={e=>setNewTask(p=>({...p,priority:e.target.value}))}>
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Due Date</label><input className="form-input" type="date" value={newTask.due} onChange={e=>setNewTask(p=>({...p,due:e.target.value}))} /></div>
            <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end" }}>
              <button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addTask}>Assign Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MEETINGS PAGE ────────────────────────────────────────────────────────────
function MeetingsPage({ user, meetings, onAdd }) {
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState("upcoming");
  const [newMtg, setNewMtg] = useState({ title:"", mentee:"mentee1", date:"", time:"", duration:60, link:"" });
  const isMentor = user.role === "mentor";
  const myMeetings = meetings.filter(m => m.mentor===user.id || m.mentee===user.id);
  const filtered = myMeetings.filter(m => m.status===tab);

  const addMeeting = async () => {
    if (!newMtg.title || !newMtg.date || !newMtg.time) return;
    await onAdd({ ...newMtg, mentor: user.id });
    setShowModal(false);
    setNewMtg({ title:"", mentee:"mentee1", date:"", time:"", duration:60, link:"" });
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <div><div style={{ fontSize:"1.2rem", fontWeight:700 }}>Meetings</div><div style={{ color:"var(--text2)", fontSize:"0.82rem" }}>{myMeetings.length} total</div></div>
        {isMentor && <button className="btn btn-primary" onClick={()=>setShowModal(true)}><Icon name="plus" size={16}/> Schedule</button>}
      </div>
      <div className="task-filters">
        <button className={`filter-chip ${tab==="upcoming"?"active":""}`} onClick={()=>setTab("upcoming")}>Upcoming ({myMeetings.filter(m=>m.status==="upcoming").length})</button>
        <button className={`filter-chip ${tab==="completed"?"active":""}`} onClick={()=>setTab("completed")}>Completed ({myMeetings.filter(m=>m.status==="completed").length})</button>
      </div>
      {filtered.length===0 ? <div className="empty-state"><div style={{fontSize:"2rem"}}>📅</div><div>No {tab} meetings</div></div>
      : filtered.map(m => {
        const d = new Date(m.date);
        const peer = isMentor ? USERS_REF[m.mentee] : USERS_REF[m.mentor];
        return (
          <div key={m.id} className="meeting-card">
            <div className="meeting-date-block">
              <div className="meeting-day">{d.getDate()}</div>
              <div className="meeting-month">{d.toLocaleString("default",{month:"short"})}</div>
            </div>
            <div className="meeting-info">
              <div className="meeting-title">{m.title}</div>
              <div className="meeting-details">
                <span><Icon name="clock" size={12}/> {m.time}</span><span>· {m.duration} min</span><span>· with {peer?.name}</span>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"6px", alignItems:"flex-end" }}>
              <span className={m.status==="upcoming"?"upcoming-tag":"completed-tag"}>{m.status}</span>
              {m.status==="upcoming" && m.link && <a href={m.link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize:"0.72rem", padding:"0.2rem 0.6rem" }}><Icon name="link" size={12}/> Join</a>}
            </div>
          </div>
        );
      })}
      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal fade-in">
            <div className="modal-header"><div className="modal-title">Schedule Meeting</div><button className="icon-btn" onClick={()=>setShowModal(false)}><Icon name="x"/></button></div>
            <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={newMtg.title} onChange={e=>setNewMtg(p=>({...p,title:e.target.value}))} placeholder="e.g. Weekly 1:1"/></div>
            <div className="form-group"><label className="form-label">Mentee</label>
              <select className="form-input form-select" value={newMtg.mentee} onChange={e=>setNewMtg(p=>({...p,mentee:e.target.value}))}>
                {user.mentees?.map(id=><option key={id} value={id}>{USERS_REF[id]?.name}</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={newMtg.date} onChange={e=>setNewMtg(p=>({...p,date:e.target.value}))}/></div>
              <div className="form-group"><label className="form-label">Time</label><input className="form-input" type="time" value={newMtg.time} onChange={e=>setNewMtg(p=>({...p,time:e.target.value}))}/></div>
            </div>
            <div className="form-group"><label className="form-label">Meeting Link</label><input className="form-input" value={newMtg.link} onChange={e=>setNewMtg(p=>({...p,link:e.target.value}))} placeholder="https://meet.google.com/..."/></div>
            <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end" }}>
              <button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addMeeting}>Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
function AnnouncementsPage({ user, announcements, onAdd }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title:"", body:"", important:false });
  const isMentor = user.role === "mentor";

  const post = async () => {
    if (!form.title || !form.body) return;
    await onAdd({ ...form, from: user.id });
    setShowModal(false);
    setForm({ title:"", body:"", important:false });
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <div><div style={{ fontSize:"1.2rem", fontWeight:700 }}>Announcements</div></div>
        {isMentor && <button className="btn btn-primary" onClick={()=>setShowModal(true)}><Icon name="plus" size={16}/> Post</button>}
      </div>
      {announcements.map(a => {
        const author = USERS_REF[a.from];
        return (
          <div key={a.id} className={`announce-card ${a.important?"important":""}`} style={{ marginBottom:"1rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"8px" }}>
              <div className={`avatar ${author?.role}`} style={{ width:28, height:28, fontSize:"0.65rem" }}>{author?.avatar}</div>
              <span style={{ fontSize:"0.82rem", fontWeight:600 }}>{author?.name}</span>
              {a.important && <span style={{ fontSize:"0.65rem", background:"rgba(245,158,11,0.15)", color:"var(--warn)", padding:"1px 7px", borderRadius:"99px", fontWeight:700 }}>IMPORTANT</span>}
              <span style={{ marginLeft:"auto", fontSize:"0.72rem", color:"var(--text3)" }}>{a.time}</span>
            </div>
            <div className="announce-title">{a.title}</div>
            <div className="announce-body" style={{ marginTop:"4px" }}>{a.body}</div>
          </div>
        );
      })}
      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal fade-in">
            <div className="modal-header"><div className="modal-title">Post Announcement</div><button className="icon-btn" onClick={()=>setShowModal(false)}><Icon name="x"/></button></div>
            <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Message</label><textarea className="form-input" rows={4} value={form.body} onChange={e=>setForm(p=>({...p,body:e.target.value}))}/></div>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"1.25rem" }}>
              <input type="checkbox" id="imp" checked={form.important} onChange={e=>setForm(p=>({...p,important:e.target.checked}))}/>
              <label htmlFor="imp" style={{ fontSize:"0.82rem", cursor:"pointer" }}>Mark as Important</label>
            </div>
            <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end" }}>
              <button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={post}>Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PROGRESS PAGE ────────────────────────────────────────────────────────────
function ProgressPage({ user, tasks }) {
  const isMentor = user.role === "mentor";
  if (isMentor) {
    return (
      <div className="fade-in">
        <div style={{ fontSize:"1.2rem", fontWeight:700, marginBottom:"1.5rem" }}>Mentee Progress</div>
        {(USERS_REF[user.id]?.mentees||[]).map(menteeId => {
          const mentee = USERS_REF[menteeId];
          const mt = tasks.filter(t=>t.assignedTo===menteeId);
          const done = mt.filter(t=>t.status==="completed").length;
          const pct = mt.length ? Math.round((done/mt.length)*100) : 0;
          return (
            <div key={menteeId} className="card" style={{ marginBottom:"1.25rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"1rem" }}>
                <div className={`avatar avatar-lg ${mentee?.role}`}>{mentee?.avatar}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700 }}>{mentee?.name}</div>
                  <div style={{ color:"var(--text2)", fontSize:"0.8rem" }}>{mentee?.title}</div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:"2rem", fontWeight:700, color:"var(--accent)" }}>{pct}%</div>
                  <div style={{ fontSize:"0.7rem", color:"var(--text3)" }}>Completion</div>
                </div>
              </div>
              {mt.map(task => (
                <div key={task.id} style={{ marginBottom:"0.75rem" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"3px" }}>
                    <span style={{ fontSize:"0.82rem" }}>{task.title}</span>
                    <span style={{ fontSize:"0.72rem", color:"var(--text3)" }}>{task.progress}%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width:`${task.progress}%` }} /></div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  }
  const myTasks = tasks.filter(t=>t.assignedTo===user.id);
  const done = myTasks.filter(t=>t.status==="completed").length;
  const pct = myTasks.length ? Math.round((done/myTasks.length)*100) : 0;
  return (
    <div className="fade-in">
      <div style={{ fontSize:"1.2rem", fontWeight:700, marginBottom:"1.5rem" }}>My Progress</div>
      <div className="stats-grid" style={{ marginBottom:"1.5rem" }}>
        {[{l:"Overall",v:`${pct}%`,c:"var(--accent)"},{l:"Completed",v:done,c:"var(--primary)"},{l:"Remaining",v:myTasks.length-done,c:"var(--warn)"},{l:"Total",v:myTasks.length,c:"var(--purple)"}].map((s,i) => (
          <div key={i} className="stat-card">
            <div style={{ fontSize:"2rem", fontWeight:700, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:"0.75rem", color:"var(--text3)", marginTop:"4px" }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div className="card">
        {myTasks.map(task => (
          <div key={task.id} style={{ marginBottom:"1rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
              <span style={{ fontSize:"0.85rem", fontWeight:600 }}>{task.title}</span>
              <span className={`status-badge status-${task.status.replace(" ","-")}`}>{task.status}</span>
            </div>
            <div className="progress-bar" style={{ height:"6px" }}><div className="progress-fill" style={{ width:`${task.progress}%` }} /></div>
            <div style={{ fontSize:"0.72rem", color:"var(--text3)", marginTop:"4px" }}>{task.progress}% · Due {task.due}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FILES PAGE ───────────────────────────────────────────────────────────────
const DEMO_FILES = [
  { name:"System Design Resources.pdf", size:"2.4 MB", type:"pdf", date:"Mar 20, 2026", from:"mentor1" },
  { name:"Clean Code Summary.docx", size:"340 KB", type:"doc", date:"Mar 18, 2026", from:"mentee1" },
  { name:"API Project Starter.zip", size:"1.1 MB", type:"zip", date:"Mar 15, 2026", from:"mentor1" },
  { name:"Weekly Notes - Week 12.md", size:"12 KB", type:"md", date:"Mar 12, 2026", from:"mentee1" },
];
function FilesPage() {
  const typeIcon = t => ({pdf:"📄",doc:"📝",zip:"📦",md:"📋"}[t]||"📁");
  return (
    <div className="fade-in">
      <div className="section-header">
        <div><div style={{ fontSize:"1.2rem", fontWeight:700 }}>Shared Files</div></div>
        <button className="btn btn-primary"><Icon name="upload" size={16}/> Upload</button>
      </div>
      <div className="card">
        {DEMO_FILES.map((f,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"0.75rem", borderRadius:"var(--radius-sm)", cursor:"pointer" }}
            onMouseEnter={e=>e.currentTarget.style.background="var(--bg3)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{ fontSize:"1.5rem" }}>{typeIcon(f.type)}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:"0.85rem", fontWeight:600 }}>{f.name}</div>
              <div style={{ fontSize:"0.72rem", color:"var(--text3)", marginTop:"2px" }}>{f.size} · {f.date} · by {USERS_REF[f.from]?.name}</div>
            </div>
            <button className="btn btn-ghost" style={{ fontSize:"0.75rem", padding:"0.3rem 0.65rem" }}>Download</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function ProfilePage({ user, setUser }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name:user.name, title:user.title, company:user.company, bio:user.bio });
  const save = () => { setUser(p=>({...p,...form})); setEditing(false); };
  return (
    <div className="fade-in">
      <div className="profile-header">
        <div className="profile-bg-strip"/>
        <div className="profile-info">
          <div className={`avatar avatar-xl ${user.role}`}>{user.avatar}</div>
          <div style={{ flex:1 }}>
            {editing ? (
              <div className="grid-2">
                <div><label className="form-label">Name</label><input className="edit-field" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
                <div><label className="form-label">Title</label><input className="edit-field" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/></div>
              </div>
            ) : (
              <>
                <div style={{ fontSize:"1.3rem", fontWeight:700 }}>{user.name}</div>
                <div style={{ color:"var(--text2)", fontSize:"0.85rem" }}>{user.title} at {user.company}</div>
                <span className={`role-badge ${user.role}`} style={{ marginTop:"6px", display:"inline-block" }}>{user.role}</span>
              </>
            )}
          </div>
          <div>
            {editing ? <><button className="btn btn-accent" onClick={save}>Save</button><button className="btn btn-ghost" onClick={()=>setEditing(false)} style={{ marginLeft:"8px" }}>Cancel</button></>
            : <button className="btn btn-ghost" onClick={()=>setEditing(true)}><Icon name="edit" size={15}/> Edit</button>}
          </div>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">About</div>
          <div style={{ marginBottom:"0.75rem" }}><div style={{ fontSize:"0.72rem", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"3px" }}>Email</div><div style={{ fontSize:"0.85rem" }}>{user.email}</div></div>
          <div><div style={{ fontSize:"0.72rem", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"3px" }}>Bio</div><div style={{ fontSize:"0.85rem", color:"var(--text2)", lineHeight:1.6 }}>{user.bio}</div></div>
        </div>
        <div className="card">
          <div className="card-title">Skills</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
            {user.skills?.map(s=><span key={s} className="skill-tag">{s}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NOTIFICATION PANEL ───────────────────────────────────────────────────────
function NotifPanel({ notifications, setNotifications }) {
  const markAll = () => setNotifications(p=>p.map(n=>({...n,read:true})));
  const typeIcon = t => ({task:"📋",meeting:"📅",message:"💬",announce:"📢"}[t]||"🔔");
  return (
    <div className="notif-panel fade-in">
      <div className="notif-header"><span>Notifications</span><button onClick={markAll} style={{ background:"none", border:"none", color:"var(--primary)", fontSize:"0.75rem", cursor:"pointer" }}>Mark all read</button></div>
      {notifications.map(n => (
        <div key={n.id} className={`notif-item ${!n.read?"unread":""}`} onClick={()=>setNotifications(p=>p.map(x=>x.id===n.id?{...x,read:true}:x))}>
          <div style={{ width:32, height:32, borderRadius:8, background:"var(--bg3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{typeIcon(n.type)}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"0.8rem" }}>{n.text}</div>
            <div style={{ fontSize:"0.68rem", color:"var(--text3)", marginTop:"2px" }}>{n.time}</div>
          </div>
          {!n.read && <div style={{ width:7, height:7, borderRadius:"50%", background:"var(--primary)", flexShrink:0, marginTop:4 }}/>}
        </div>
      ))}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => { injectStyles(); }, []);

  const [authUser, setAuthUser] = useState(null);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState({});
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const socketRef = useRef(null);

  // Load initial data from API
  const loadData = useCallback(async () => {
    try {
      const [t, m, a] = await Promise.all([api.getTasks(), api.getMeetings(), api.getAnnouncements()]);
      setTasks(t);
      setMeetings(m);
      setAnnouncements(a);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  }, []);

  // Setup Socket.IO when user logs in
  useEffect(() => {
    if (!authUser) return;
    loadData();

    const sock = getSocket();
    socketRef.current = sock;
    sock.connect();

    sock.on("connect", () => {
      setConnected(true);
      sock.emit("user:join", authUser.id);
    });

    sock.on("disconnect", () => setConnected(false));

    sock.on("users:online", (users) => setOnlineUsers(users));

    sock.on("messages:history", (history) => setMessages(history));

    sock.on("message:received", (msg) => {
      setMessages(prev => {
        const room = msg.room;
        const existing = prev[room] || [];
        // Avoid duplicate
        if (existing.find(m => m.id === msg.id)) return prev;
        return { ...prev, [room]: [...existing, msg] };
      });
      if (msg.from !== authUser.id) {
        setUnread(p => p + 1);
        setNotifications(p => [{
          id: Date.now(), type: "message",
          text: `${USERS_REF[msg.from]?.name}: ${msg.text.slice(0,40)}`,
          time: "Just now", read: false,
        }, ...p.slice(0,19)]);
      }
    });

    sock.on("tasks:updated", (updatedTasks) => setTasks(updatedTasks));
    sock.on("meetings:updated", (updatedMeetings) => setMeetings(updatedMeetings));
    sock.on("announcements:updated", (updatedAnnouncements) => setAnnouncements(updatedAnnouncements));

    sock.on("notification:new", (notif) => {
      setNotifications(p => [{ id: Date.now(), ...notif, time: "Just now", read: false }, ...p.slice(0,19)]);
    });

    return () => {
      sock.off("connect"); sock.off("disconnect"); sock.off("users:online");
      sock.off("messages:history"); sock.off("message:received");
      sock.off("tasks:updated"); sock.off("meetings:updated"); sock.off("announcements:updated");
      sock.off("notification:new");
      sock.disconnect();
      socket = null;
    };
  }, [authUser]);

  const handleLogin = (u) => { setAuthUser(u); setUser(u); setPage("dashboard"); };
  const handleLogout = () => {
    socketRef.current?.disconnect();
    socket = null;
    setAuthUser(null); setUser(null); setConnected(false);
    setOnlineUsers([]); setMessages({}); setNotifications([]);
  };

  if (!authUser) return <AuthPage onLogin={handleLogin} />;

  const pageTitle = { dashboard:"Dashboard", chat:"Messages", tasks:"Tasks", meetings:"Meetings", announcements:"Announcements", progress:"Progress", files:"Files", profile:"Profile" }[page];

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard user={user} tasks={tasks} meetings={meetings} messages={messages} setPage={setPage} onlineUsers={onlineUsers} />;
      case "chat": return <ChatPage user={user} socket={socketRef.current} onlineUsers={onlineUsers} messages={messages} setMessages={setMessages} setUnread={setUnread} />;
      case "tasks": return <TasksPage user={user} tasks={tasks} onAdd={async(d)=>{await api.addTask(d)}} onUpdate={async(id,d)=>{await api.updateTask(id,d)}} />;
      case "meetings": return <MeetingsPage user={user} meetings={meetings} onAdd={async(d)=>{await api.addMeeting(d)}} />;
      case "announcements": return <AnnouncementsPage user={user} announcements={announcements} onAdd={async(d)=>{await api.addAnnouncement(d)}} />;
      case "progress": return <ProgressPage user={user} tasks={tasks} />;
      case "files": return <FilesPage />;
      case "profile": return <ProfilePage user={user} setUser={setUser} />;
      default: return null;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar user={user} page={page} setPage={setPage} onLogout={handleLogout} collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} unreadCount={unread} />
      <div className="main-area">
        <div className="topbar">
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <button className="icon-btn mobile-toggle" onClick={()=>setMobileOpen(!mobileOpen)}><Icon name="menu"/></button>
            <button className="icon-btn" onClick={()=>setCollapsed(!collapsed)}><Icon name="menu"/></button>
            <div className="topbar-title">{pageTitle}</div>
          </div>
          <div className="topbar-right" style={{ position:"relative" }}>
            <div className="icon-btn" onClick={()=>setShowNotif(!showNotif)}>
              <Icon name="bell"/>
              {unread > 0 && <div className="notif-dot"/>}
            </div>
            <div className={`avatar ${user.role}`} style={{ cursor:"pointer" }} onClick={()=>setPage("profile")}>{user.avatar}</div>
            {showNotif && (
              <>
                <div style={{ position:"fixed", inset:0, zIndex:89 }} onClick={()=>setShowNotif(false)}/>
                <NotifPanel notifications={notifications} setNotifications={n=>{ setNotifications(n); setUnread(0); }}/>
              </>
            )}
          </div>
        </div>

        {/* Connection Status Bar */}
        <div className={`conn-bar ${connected?"connected":"disconnected"}`}>
          <div className="conn-dot"/>
          {connected ? `Connected · ${onlineUsers.length} user${onlineUsers.length!==1?"s":""} online` : "Connecting to server..."}
        </div>

        <div className="page" style={page==="chat"?{padding:0,overflow:"hidden"}:{}}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
