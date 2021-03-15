import React from 'react';

export default ({ color }: { color?: string }) => (
  <svg width="1em" height="1em" fill={color || 'currentColor'}>
    <rect width="1em" height="1em" style={{ strokeWidth: 3, stroke: 'rgb(0,0,0)' }} />
  </svg>
);
