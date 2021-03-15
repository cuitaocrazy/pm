import SquareIcon from '@/components/SquareIcon';
import React from 'react';
import color from './colorDef';

export default () => (
  <div style={{ textAlign: 'center' }}>
    <SquareIcon color={color.involved} />
    <span>涉及 </span>
    <SquareIcon color={color.exclude} />
    <span>未涉及 </span>
    <SquareIcon color={color.ended} />
    <span>结项</span>
  </div>
);
