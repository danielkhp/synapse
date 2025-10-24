import React from 'react';
import Icon from './Icon';
import ActionHint from './ActionHint';

interface ResultsItemProps {
  isHighlighted: boolean;
  text: string;
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
