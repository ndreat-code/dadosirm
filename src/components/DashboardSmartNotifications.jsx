import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Clock,
  Send,
  Phone,
  Video,
  Bot,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  BellRing
} from 'lucide-react'
import { INITIAL_SMART_NOTIFICATIONS } from './SmartNotificationToast'

export default function DashboardSmartNotifications({ className = '' }) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(INITIAL_SMART_NOTIFICATIONS)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const handleNewNotif = (e) => {
      if (e?.detail) {
        const item = {
          id: `dyn-${Date.now()}`,
          category: e.detail.category || 'inbound_lead',
          badge: e.detail.badge || '✦ NOTIFICA INTELLIGENTE',
          badgeColor: 'bg-emerald-500/20 text-emerald-700 border-emerald-400',
          title: e.detail.title || 'Nuovo evento CRM registrato',
          subtitle: e.detail.subtitle || 'Dati sincronizzati in tempo reale',
          time: 'Adesso',
          contactPerson: e.detail.contactPerson || 'Referente',
          phone: e.detail.phone || '',
          link: e.detail.link || '/crm',
          actionLabel: e.detail.actionLabel || 'Apri Dettaglio',
          urgent: true,
        }
        setNotifications(prev => [item, ...prev])
      }
    }

    window.addEventListener('dado-smart-notification', handleNewNotif)
    return () => window.removeEventListener('dado-smart-notification', handleNewNotif)
  }, [])

  const filtered = activeTab === 'all'
    ? notifications
    : notifications.filter(n => n.category === activeTab)

  return (
    <div
      className={`w-full bg-white border border-[#cce5f6] shadow-xs hover:shadow-md transition-all select-none rounded-none ${className}`}
      style={{
        borderRadius: '0px',
        fontFamily: '"Switzer", sans-serif',
      }}
    >
      {/* ── Header Sezione Notifiche Smart (Bordi Squadrati) ── */}
      <div
        className="w-full px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between border-b-2 border-teal-400 rounded-none"
        style={{ borderRadius: '0px' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-teal-400">
            <BellRing size={16} className="animate-pulse" />
          </div>
          <span className=" text-xs font-black uppercase tracking-wider text-slate-100">
            Sezione Notifiche Smart & Inbound
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-none" style={{ borderRadius: '0px' }}>
            {notifications.length}
          </span>
        </div>

        {/* Link Diretto a CRM */}
        <Link
          to="/crm"
          className="flex items-center gap-1 text-[11px] font-bold text-teal-300 hover:text-white transition-colors"
        >
          <span>Gestisci nel CRM</span>
          <ChevronRight size={13} />
        </Link>
      </div>

      {/* ── Lista Notifiche Intelligenti con Bordi Rigorosamente Quadrati ── */}
      <div className="divide-y divide-slate-100 max-h-[170px] overflow-y-auto no-scrollbar">
        {filtered.map((notif) => (
          <div
            key={notif.id}
            className="p-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 text-left rounded-none"
            style={{ borderRadius: '0px' }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 border rounded-none bg-slate-100 text-slate-800 border-slate-300"
                  style={{ borderRadius: '0px' }}
                >
                  {notif.badge}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock size={10} />
                  {notif.time}
                </span>
                {notif.contactPerson && (
                  <span className="text-[10.5px] font-bold text-slate-700 truncate hidden sm:inline">
                    • {notif.contactPerson}
                  </span>
                )}
              </div>

              <div className="text-xs font-bold text-slate-900 truncate">
                {notif.title}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {notif.subtitle}
              </div>
            </div>

            {/* Azioni Rapide con Bordi Quadrati */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (notif.link) navigate(notif.link)
                }}
                className="px-2.5 py-1 text-[11px] font-bold text-white bg-slate-900 hover:bg-teal-700 transition-colors cursor-pointer rounded-none border border-slate-800"
                style={{ borderRadius: '0px' }}
              >
                {notif.actionLabel || 'Apri'}
              </button>

              {notif.phone && (
                <a
                  href={`tel:${notif.phone.replace(/[^0-9\+]/g, '')}`}
                  className="p-1 text-slate-600 hover:text-teal-600 hover:bg-teal-50 border border-slate-200 transition-colors rounded-none"
                  style={{ borderRadius: '0px' }}
                  title={`Chiama ${notif.contactPerson}: ${notif.phone}`}
                >
                  <Phone size={13} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
