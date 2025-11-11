import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  text?: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  isHoverMessageShow?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  text,
  position = 'top',
  isHoverMessageShow = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        triggerRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add hover functionality if hover mode is enabled
  useEffect(() => {
    if (isHoverMessageShow && triggerRef.current) {
      const handleMouseEnter = () => setIsVisible(true);
      const handleMouseLeave = () => setIsVisible(false);
      
      const element = triggerRef.current;
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      };
    } else {
      return 
    }
  }, [isHoverMessageShow]);

  // Position the tooltip based on the desired position
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return {
          tooltip: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '12px' },
          arrow: { bottom: '-5px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' }
        };
      case 'right':
        return {
          tooltip: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '12px' },
          arrow: { left: '-5px', top: '50%', transform: 'translateY(-50%) rotate(45deg)' }
        };
      case 'bottom':
        return {
          tooltip: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '12px' },
          arrow: { top: '-5px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' }
        };
      case 'left':
        return {
          tooltip: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '12px' },
          arrow: { right: '-5px', top: '50%', transform: 'translateY(-50%) rotate(45deg)' }
        };
      default:
        return {
          tooltip: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '12px' },
          arrow: { bottom: '-5px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' }
        };
    }
  };

  const positionStyles = getPositionStyles();

  // Tooltip and arrow styles
  const tooltipStyle = {
    ...positionStyles.tooltip,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)',
    borderRadius: '10px',
    backgroundColor: '#fbecef',
    borderColor: '#f8d0d7',
    position: 'absolute' as const,
    zIndex: 50,
    width: '260px',
    margin : '12',
    padding: '12px 16px',
    border: '1px solid #f8d0d7',
    transition: 'opacity 300ms, transform 300ms ease-in-out'
  };
  
  const questionMarkStyle = {
    marginLeft : '7px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: '1px solid #276749',
    color: '#38a169',
    fontSize: '10px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'all 200ms'
  };
  
  const arrowStyle = {
    ...positionStyles.arrow,
    position: 'absolute' as const,
    width: '10px',
    height: '10px',
    backgroundColor: '#fbecef',
    borderTop: '1px solid #f8d0d7',
    borderLeft: '1px solid #f8d0d7',
    borderRadius: '2px',
    boxShadow: '-1px -1px 2px rgba(0, 0, 0, 0.05)'
  };

  // Text content style with improved formatting
  const textContentStyle = {
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: 1.6,
    letterSpacing: '0.01em',
    color: '#4a5568',
    // textAlign: 'left' as const
  };

  return (
    <div className='' style={{ position: 'relative', display: 'inline-flex', justifyContent: 'center' }}>
      {/* Question mark trigger */}
      <div
        ref={triggerRef}
        style={questionMarkStyle}
        onClick={() => !isHoverMessageShow && setIsVisible(!isVisible)}
      >
        ?
      </div>

      {/* Tooltip with improved alignment and text formatting */}
      {(isVisible || isHoverMessageShow) && (
        <div ref={tooltipRef} style={tooltipStyle}>
          <div className = '' style={textContentStyle}>
            {text}
          </div>
          
          {/* Arrow */}
          <div style={arrowStyle} />
        </div>
      )}
    </div>
  );
};