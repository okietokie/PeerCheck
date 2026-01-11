// StatCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

const StatCardComponent = ({ icon, value, label, colorType = 'primary', progress = null, theme, getThemeColor, getCardGradient, getBorderColor }) => {
  const color = getThemeColor(colorType);
  
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <div
        style={{
          padding: '24px',
          borderRadius: '16px',
          background: getCardGradient(colorType),
          border: `1.5px solid ${getBorderColor(colorType, 0.3)}`,
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: `${color}26`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${color}4D`,
          }}>
            {icon}
          </div>
          <div style={{ 
            fontFamily: '"Alkatra", cursive',
            fontSize: '2.5rem',
            fontWeight: 800,
            color: color,
            lineHeight: 1,
            textShadow: `0 2px 4px ${color}33`,
          }}>
            {value}
          </div>
        </div>
        <div style={{ 
          color: theme.palette.text.secondary,
          fontFamily: '"Adlam Display", serif',
          fontWeight: 500,
        }}>
          {label}
        </div>
        {progress !== null && (
          <div 
            style={{
              marginTop: '16px',
              height: '6px',
              borderRadius: '12px',
              backgroundColor: `${color}1A`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${Math.min(progress, 100)}%`,
                background: `linear-gradient(90deg, ${color}, ${color}B3)`,
                borderRadius: '12px',
              }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCardComponent;