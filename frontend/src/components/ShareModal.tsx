import React, { useState, useEffect } from 'react';
import { X, Link2, QrCode, Code2, Copy, Check, Download, Zap, Users, Calendar, Trophy } from 'lucide-react';
import QRCode from 'qrcode';
import type { Tournament } from '../types';
import styles from './ShareModal.module.css';

type Tab = 'qr' | 'link' | 'widget';

interface Props {
  tournament: Tournament;
  onClose: () => void;
}

export default function ShareModal({ tournament, onClose }: Props) {
  const [tab, setTab]           = useState<Tab>('qr');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied]     = useState<string | null>(null);

  const shareUrl = window.location.href;
  const confirmed = tournament.participants.filter(p => p.status === 'confirmed').length;

  const widgetHtml = `<!-- ArenaOPS Tournament Widget -->
<style>
  .ao-widget{font-family:-apple-system,sans-serif;background:#0f0f0e;border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:20px 22px;max-width:320px;color:#f3f4f6}
  .ao-badge{display:inline-flex;align-items:center;gap:5px;font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#e8ff47;background:rgba(232,255,71,.08);border:1px solid rgba(232,255,71,.2);border-radius:20px;padding:3px 10px;margin-bottom:12px}
  .ao-name{font-size:1.15rem;font-weight:700;margin:0 0 6px}
  .ao-meta{font-size:0.78rem;color:#9ca3af;margin:0 0 14px;text-transform:capitalize}
  .ao-stats{display:flex;gap:16px;margin-bottom:16px}
  .ao-stat{font-size:0.72rem;color:#9ca3af}.ao-stat strong{display:block;font-size:1rem;color:#f3f4f6;font-weight:700}
  .ao-btn{display:inline-block;padding:9px 18px;background:#e8ff47;color:#0a0a09;border-radius:9px;font-weight:700;font-size:0.82rem;text-decoration:none}
</style>
<div class="ao-widget">
  <div class="ao-badge">⚡ ArenaOPS</div>
  <p class="ao-name">${tournament.name}</p>
  <p class="ao-meta">${tournament.game} · ${tournament.format.replace(/-/g, ' ')}</p>
  <div class="ao-stats">
    <div class="ao-stat"><strong>${confirmed}/${tournament.maxParticipants}</strong>Players</div>
    <div class="ao-stat"><strong>${tournament.startDate}</strong>Start Date</div>
  </div>
  <a class="ao-btn" href="${shareUrl}" target="_blank">View Tournament →</a>
</div>`;

  useEffect(() => {
    QRCode.toDataURL(shareUrl, {
      width: 240,
      margin: 2,
      color: { dark: '#111111', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then(setQrDataUrl).catch(() => {});
  }, [shareUrl]);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2200);
  };

  const downloadQR = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${tournament.name.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
    a.click();
  };

  const tabs: { key: Tab; label: string; Icon: React.ElementType }[] = [
    { key: 'qr',     label: 'QR Code', Icon: QrCode },
    { key: 'link',   label: 'Link',    Icon: Link2  },
    { key: 'widget', label: 'Widget',  Icon: Code2  },
  ];

  return (
    <div className={styles.backdrop} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal} role="dialog" aria-modal="true">

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}><Zap size={15} /></div>
            <div>
              <p className={styles.headerEyebrow}>Share Event</p>
              <p className={styles.headerName}>{tournament.name}</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {tabs.map(({ key, label, Icon }) => (
            <button
              key={key}
              className={`${styles.tab} ${tab === key ? styles.tabActive : ''}`}
              onClick={() => setTab(key)}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* ── QR Code ── */}
        {tab === 'qr' && (
          <div className={styles.pane}>
            <div className={styles.qrFrame}>
              {/* Accent corner brackets */}
              <div className={`${styles.corner} ${styles.cornerTL}`} />
              <div className={`${styles.corner} ${styles.cornerTR}`} />
              <div className={`${styles.corner} ${styles.cornerBL}`} />
              <div className={`${styles.corner} ${styles.cornerBR}`} />

              {qrDataUrl
                ? <img src={qrDataUrl} alt="Tournament QR Code" className={styles.qrImg} />
                : <div className={styles.qrSkeleton}><span className={styles.qrPulse} /></div>
              }
            </div>

            <p className={styles.qrHint}>Scan to open the event page</p>

            <div className={styles.qrActions}>
              <button
                className={`${styles.copyBtn} ${copied === 'qr-link' ? styles.copyBtnDone : ''}`}
                onClick={() => copy(shareUrl, 'qr-link')}
              >
                {copied === 'qr-link' ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
              </button>
              <button className={styles.downloadBtn} onClick={downloadQR} disabled={!qrDataUrl}>
                <Download size={14} /> Download PNG
              </button>
            </div>
          </div>
        )}

        {/* ── Link ── */}
        {tab === 'link' && (
          <div className={styles.pane}>
            <p className={styles.fieldLabel}>Event URL</p>
            <div className={styles.urlRow}>
              <span className={styles.urlText}>{shareUrl}</span>
              <button
                className={`${styles.copyBtn} ${styles.copyBtnInline} ${copied === 'link' ? styles.copyBtnDone : ''}`}
                onClick={() => copy(shareUrl, 'link')}
              >
                {copied === 'link' ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>

            {/* Quick info card */}
            <div className={styles.infoCard}>
              <div className={styles.infoRow}>
                <Trophy size={13} className={styles.infoIcon} />
                <span className={styles.infoLabel}>Format</span>
                <span className={styles.infoValue} style={{ textTransform: 'capitalize' }}>
                  {tournament.format.replace(/-/g, ' ')}
                </span>
              </div>
              <div className={styles.infoRow}>
                <Users size={13} className={styles.infoIcon} />
                <span className={styles.infoLabel}>Players</span>
                <span className={styles.infoValue}>{confirmed}/{tournament.maxParticipants}</span>
              </div>
              <div className={styles.infoRow}>
                <Calendar size={13} className={styles.infoIcon} />
                <span className={styles.infoLabel}>Start</span>
                <span className={styles.infoValue}>{tournament.startDate}</span>
              </div>
            </div>

            {/* Share via */}
            <p className={styles.fieldLabel}>Share via</p>
            <div className={styles.shareVia}>
              <a
                href={`mailto:?subject=${encodeURIComponent(tournament.name)}&body=${encodeURIComponent(`Join or follow "${tournament.name}" on ArenaOPS:\n${shareUrl}`)}`}
                className={styles.shareViaBtn}
              >
                Email
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎮 "${tournament.name}" — join or follow live on ArenaOPS!`)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareViaBtn}
              >
                Twitter / X
              </a>
              <a
                href={`https://discord.com`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareViaBtn}
                title="Copy the link and share in Discord"
              >
                Discord
              </a>
            </div>
          </div>
        )}

        {/* ── Widget ── */}
        {tab === 'widget' && (
          <div className={styles.pane}>
            {/* Live preview */}
            <p className={styles.fieldLabel}>Preview</p>
            <div className={styles.widgetPreview}>
              <div className={styles.widgetBadge}>
                <Zap size={10} /> ArenaOPS
              </div>
              <p className={styles.widgetName}>{tournament.name}</p>
              <p className={styles.widgetMeta}>
                {tournament.game} · {tournament.format.replace(/-/g, ' ')}
              </p>
              <div className={styles.widgetStats}>
                <div className={styles.widgetStat}>
                  <strong>{confirmed}/{tournament.maxParticipants}</strong>
                  <span>Players</span>
                </div>
                <div className={styles.widgetStatDivider} />
                <div className={styles.widgetStat}>
                  <strong>{tournament.startDate}</strong>
                  <span>Start Date</span>
                </div>
              </div>
              <a href={shareUrl} target="_blank" rel="noopener noreferrer" className={styles.widgetCta}>
                View Tournament →
              </a>
            </div>

            {/* Embed code */}
            <div className={styles.codeHeader}>
              <p className={styles.fieldLabel}>Embed Code</p>
              <button
                className={`${styles.copyBtn} ${styles.copyBtnSm} ${copied === 'widget' ? styles.copyBtnDone : ''}`}
                onClick={() => copy(widgetHtml, 'widget')}
              >
                {copied === 'widget' ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy Code</>}
              </button>
            </div>
            <div className={styles.codeBox}>
              <pre className={styles.code}>{widgetHtml}</pre>
            </div>
            <p className={styles.widgetHint}>
              Paste this HTML snippet into your club site, Notion page, or anywhere that accepts custom HTML.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
