import React from 'react';

const UserCogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <circle cx="18" cy="15" r="3" />
    <path d="m19.5 13.4-.9.5" />
    <path d="m19.5 16.6-.9-.5" />
    <path d="m16.5 13.4.9.5" />
    <path d="m16.5 16.6.9-.5" />
    <path d="m18 12-.5.9" />
    <path d="m18 18-.5-.9" />
    <path d="m20.1 15-1 .1" />
    <path d="m15.9 15 1 .1" />
  </svg>
);

export default UserCogIcon;
