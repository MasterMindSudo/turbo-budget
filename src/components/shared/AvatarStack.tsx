// src/components/shared/AvatarStack.tsx
'use client';

import React from 'react';
import { Avatar, AvatarGroup, Box, SxProps, Theme } from '@mui/material';
import Image from 'next/image';

interface AvatarStackProps {
  members: { id: string; displayName: string; avatarUrl?: string }[];
  max?: number; // Max avatars to show before showing "+X"
  sx?: SxProps<Theme>;
}

const AvatarStack: React.FC<AvatarStackProps> = ({ members, max = 3, sx }) => {
  return (
    <Box sx={sx}>
      <AvatarGroup max={max} total={members.length}>
        {members.map((member) => (
          <Avatar
            key={member.id}
            alt={member.displayName}
            // Next/Image `src` can handle absolute paths from `/public` or remote URLs
            src={member.avatarUrl || `https://via.placeholder.com/150?text=${member.displayName.charAt(0).toUpperCase()}`}
            sx={{
              width: { xs: 32, sm: 40 },
              height: { xs: 32, sm: 40 },
              fontSize: { xs: '1rem', sm: '1.25rem' },
              border: '2px solid white',
            }}
          >
            {/* Fallback to first letter if no avatarUrl */}
            {!member.avatarUrl && member.displayName.charAt(0).toUpperCase()}
          </Avatar>
        ))}
      </AvatarGroup>
    </Box>
  );
};

export default AvatarStack;