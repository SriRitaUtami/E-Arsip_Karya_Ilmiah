import React from 'react';

export const getIcon = (mimeType) => {
  if (mimeType === 'application/pdf') {
    return <i className="fas fa-file-pdf fa-2x"></i>;
  } else {
    return <i className="fas fa-file fa-2x"></i>;
  }
};