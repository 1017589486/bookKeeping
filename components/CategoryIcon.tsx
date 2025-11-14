
import React from 'react';

// A map of icon names to SVG path data
const ICONS_SVG_PATHS: Record<string, string> = {
    'briefcase': "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4",
    'shopping-cart': "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    'home': "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    'truck': "M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M21 11V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10h16v-4a2 2 0 00-2-2h-3zM3 11V5a2 2 0 012-2h3v10H5a2 2 0 01-2-2z",
    'utensils': "M17.657 18.657l-4.243-4.243m0 0l-4.243 4.243M12.707 15H17V5H7v10h4.293l1.414 1.414zM7 5l1.55-1.55a1 1 0 011.414 0L12 5.01V5m2.05-1.55a1 1 0 011.414 0L17 5",
    'film': "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z",
    'plane': "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
    'gift': "M20 12v10H4V12 M20 12L12 4 4 12 M20 12H4 M12 4v16",
    'heart': "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    'medkit': "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z",
    'book': "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z",
    'graduation-cap': "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
    'dollar-sign': "M12 6v12m-3-6h6",
    'piggy-bank': "M11 5H6a2 2 0 00-2 2v3a2 2 0 002 2h1v1a3 3 0 003 3h2a3 3 0 003-3v-1h1a2 2 0 002-2V7a2 2 0 00-2-2h-5z M11 5a2 2 0 00-2 2v1h4V7a2 2 0 00-2-2z M10 12H4v-1a1 1 0 011-1h5v2zm4-2h-2v-1a1 1 0 011-1h1v2z",
    'box': "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4",
    'scale': "M3.055 11H5a2 2 0 012 2v1a2 2 0 01-2 2H3a2 2 0 01-2-2v-1a2 2 0 012-2m13 0h1.945a2 2 0 012 2v1a2 2 0 01-2 2h-2a2 2 0 01-2-2v-1a2 2 0 012-2M12 3v18m-5-18l-2 4h4l-2-4zm10 0l-2 4h4l-2-4z"
};

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ icon, color, size = 'h-8 w-8' }) => {
  const pathData = ICONS_SVG_PATHS[icon] || ICONS_SVG_PATHS['briefcase'];

  return (
    <div className={`flex items-center justify-center rounded-full p-2 ${size}`} style={{ backgroundColor: `${color}20` }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5`}
        fill="none"
        viewBox="0 0 24 24"
        stroke={color}
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={pathData} />
      </svg>
    </div>
  );
};

export default CategoryIcon;