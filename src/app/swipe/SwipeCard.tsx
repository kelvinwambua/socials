import React from 'react';
import { motion, PanInfo } from 'framer-motion';

interface SwipeCardProps {
  user: {
    id: string;
    displayName: string;
    bio?: string;
    university: string;
    major: string;
    graduationYear: number;
    interests: string[];
  };
  onSwipe: (direction: 'left' | 'right') => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ user, onSwipe }) => {
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto"
    >
      <h2 className="text-2xl font-bold mb-2">{user.displayName}</h2>
      <p className="text-gray-600 mb-4">{user.bio}</p>
      <div className="mb-4">
        <p><strong>University:</strong> {user.university}</p>
        <p><strong>Major:</strong> {user.major}</p>
        <p><strong>Graduation Year:</strong> {user.graduationYear}</p>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Interests:</h3>
        <div className="flex flex-wrap gap-2">
          {user.interests.map((interest, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {interest}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;