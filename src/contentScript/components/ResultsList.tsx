import React from 'react';
import ResultsItem from './ResultsItem';
import { CommandResult } from '../../types';

interface ResultsListProps {
  results: CommandResult[];
  highlightedIndex: number;
}

const ResultsList: React.FC<ResultsListProps> = ({ results, highlightedIndex }) => {
  return (
    <ul className="helm-results-list">
      {results.map((result, index) => (
        <ResultsItem
          key={index}
          result={result}
          isHighlighted={index === highlightedIndex}
        />
      ))}
    </ul>
  );
};

export default ResultsList;
