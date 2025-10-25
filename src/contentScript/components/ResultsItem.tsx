import React from 'react';
import Icon from './Icon';
import ActionHint from './ActionHint';
import { CommandResult } from '../../types';

interface ResultsItemProps {
  result: CommandResult
  isHighlighted: boolean;
}

const ResultsItem: React.FC<ResultsItemProps> = ({ isHighlighted, text }) => {
  return (
    <li className="helm-result-item" style={{ backgroundColor: isHighlighted ? 'lightblue' : 'white' }}>
      <Icon />
      <span>{text}</span>
      <ActionHint />
    </li>
  );
};

export default ResultsItem;
