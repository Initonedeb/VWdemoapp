import React from 'react';

const QrCodeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="5" height="5" x="3" y="3" rx="1"/>
    <rect width="5" height="5" x="16" y="3" rx="1"/>
    <rect width="5" height="5" x="3" y="16" rx="1"/>
    <path d="M21 16h-1a2 2 0 0 0-2 2v1"/>
    <path d="M16 21v-1a2 2 0 0 0-2-2h-1"/>
    <path d="M3 8h1a2 2 0 0 0 2-2V5"/>
    <path d="M8 3v1a2 2 0 0 0 2 2h1"/>
    <path d="M12 12h.01"/>
    <path d="M16 12h.01"/>
    <path d="M12 16h.01"/>
    <path d="M16 16h.01"/>
    <path d="M8 12h.01"/>
    <path d="M12 8h.01"/>
    <path d="M8 8h.01"/>
    <path d="M8 16h.01"/>
  </svg>
);

export default QrCodeIcon;