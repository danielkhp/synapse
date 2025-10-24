import React from 'react';
import ResultsItem from './ResultsItem';

interface ResultsListProps {
  results: string[];
  highlightedIndex: number;
}

const ResultsList: React.FC<ResultsListProps> = ({ results, highlightedIndex }) => {
  return (
    <ul className="helm-results-list">
      {results.map((result, index) => (
        <ResultsItem
          key={index}
          isHighlighted={index === highlightedIndex}
          text={result}
        />
      ))}
    </ul>
  );
};

export default ResultsList;
