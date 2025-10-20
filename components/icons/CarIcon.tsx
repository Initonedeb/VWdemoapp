
import React from 'react';

const CarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14 16.94V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1.1" />
    <path d="M18 16.94V19a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-1.1" />
    <path d="M22 13.8V8.2a2 2 0 0 0-1.2-1.8L16.2 4.6a2 2 0 0 0-2.4 0L9 6.4a2 2 0 0 0-1.2 1.8v5.6" />
    <path d="M2 13.8V8.2a2 2 0 0 1 1.2-1.8L7.8 4.6a2 2 0 0 1 2.4 0l4.8 1.8a2 2 0 0 1 1.2 1.8v5.6" />
    <path d="M8 17h8" />
    <circle cx="8" cy="17" r="1" />
    <circle cx="16" cy="17" r="1" />
  </svg>
);

export default CarIcon;
