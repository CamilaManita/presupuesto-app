import React from 'react';
import LOGO_BASE64 from '../utils/logoData';

export const Logo = ({ className = "w-36 h-auto" }) => {
  return (
    <div className={`inline-block select-none ${className}`}>
      <img
        src={LOGO_BASE64}
        alt="Vidriería Vallcanera Logo"
        className="w-full h-auto object-contain block"
      />
    </div>
  );
};

export default Logo;
