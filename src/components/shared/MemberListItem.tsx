// src/components/shared/MemberListItem.tsx
'use client';

import React from 'react';
import { ListItem, ListItemAvatar, Avatar, ListItemText, TextField, Radio, Box, Checkbox } from '@mui/material'; // Import Checkbox

interface MemberListItemProps {
  id: string;
  displayName: string;
  avatarUrl?: string;
  value?: number | string; // For amount or radio selection
  onChange?: (id: string, value: number | string) => void;
  mode: 'input' | 'radio' | 'display' | 'even-toggle'; // Added 'even-toggle' mode
  currencySymbol?: string;
  isSelected?: boolean; // For radio mode
  onToggleSelect?: (id: string, isSelected: boolean) => void; // New prop for toggle mode
  isMemberSelected?: boolean; // New prop to indicate selection in toggle mode
}

const MemberListItem: React.FC<MemberListItemProps> = ({
  id,
  displayName,
  avatarUrl,
  value,
  onChange,
  mode,
  currencySymbol = '$',
  isSelected = false,
  onToggleSelect,
  isMemberSelected = false, // Default to false
}) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = parseFloat(event.target.value);
    if (!isNaN(numericValue) && onChange) {
      onChange(id, numericValue);
    } else if (onChange) { // Allow empty string for clearing
      onChange(id, event.target.value);
    }
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(id, event.target.value); // Value will be the member ID
    }
  };

  const handleToggleClick = () => {
    if (onToggleSelect) {
      onToggleSelect(id, !isMemberSelected);
    }
  };

  const displayedValue = typeof value === 'number' ? value.toFixed(2) : value;
  const showCurrencySymbol = currencySymbol && (mode !== 'even-toggle' || (mode === 'even-toggle' && isMemberSelected)); // Show currency symbol only if selected in even-toggle

  return (
    <ListItem
      onClick={mode === 'even-toggle' ? handleToggleClick : undefined} // Make clickable in even-toggle mode
      sx={{
        py: 1,
        px: 2,
        '&:not(:last-child)': {
          borderBottom: '1px solid #eee',
        },
        cursor: mode === 'even-toggle' ? 'pointer' : 'default', // Add pointer cursor
        opacity: mode === 'even-toggle' && !isMemberSelected ? 0.5 : 1, // Dim if not selected in even-toggle
        '&:hover': {
          backgroundColor: mode === 'even-toggle' ? 'action.hover' : 'inherit', // Add hover effect
        },
      }}
      secondaryAction={
        mode === 'even-toggle' && (
          <Checkbox
            edge="end"
            checked={isMemberSelected}
            onChange={handleToggleClick} // Toggle on checkbox click
            inputProps={{ 'aria-labelledby': `list-item-label-${id}` }}
          />
        )
      }
    >
      <ListItemAvatar>
        <Avatar src={avatarUrl} sx={{ bgcolor: 'grey.300', color: 'text.secondary' }}>
          {/* Fallback to first letter if no avatarUrl */}
          {!avatarUrl && displayName.charAt(0).toUpperCase()}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        id={`list-item-label-${id}`}
        primary={displayName}
        primaryTypographyProps={{ fontWeight: 'medium' }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {mode === 'input' && (
          <TextField
            variant="standard"
            type="number"
            value={value !== undefined ? value : ''}
            onChange={handleInputChange}
            sx={{
              width: 80,
              '& .MuiInputBase-input': {
                textAlign: 'right',
                fontWeight: 'bold',
              },
            }}
            InputProps={{
              startAdornment: currencySymbol,
            }}
            onFocus={(e) => e.target.select()} // Select all text on focus
          />
        )}
        {mode === 'radio' && (
          <Radio
            checked={isSelected}
            onChange={handleRadioChange}
            value={id}
            name="paidByRadio" // Ensure all radios in a group have the same name
            sx={{ p: 0.5 }}
          />
        )}
        {(mode === 'display' || mode === 'even-toggle') && ( // Display value in 'display' and 'even-toggle' modes
          <ListItemText
            primary={`${showCurrencySymbol ? currencySymbol : ''}${(mode === 'even-toggle' && !isMemberSelected) ? (0).toFixed(2) : displayedValue}`}
            primaryTypographyProps={{
              fontWeight: 'bold',
              textAlign: 'right',
              flexGrow: 0,
              width: 80,
            }}
          />
        )}
      </Box>
    </ListItem>
  );
};

export default MemberListItem;
