interface VotingResultsProps {
  votes: Record<string, string | null>;
  votesRevealed: boolean;
}

export default function VotingResults({ votes, votesRevealed }: VotingResultsProps) {
  if (!votesRevealed) {
    return null;
  }

  // Filter out null votes and special values
  const validVotes = Object.values(votes)
    .filter((vote): vote is string => vote !== null && vote !== '?' && vote !== '🍺')
    .map((vote) => parseFloat(vote))
    .filter((vote) => !isNaN(vote));

  if (validVotes.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
        <p className="text-yellow-800 dark:text-yellow-200 text-center">
          No numeric votes to display statistics
        </p>
      </div>
    );
  }

  // Calculate statistics
  const sum = validVotes.reduce((acc, vote) => acc + vote, 0);
  const average = sum / validVotes.length;
  const min = Math.min(...validVotes);
  const max = Math.max(...validVotes);

  // Count vote distribution
  const voteCount: Record<string, number> = {};
  Object.values(votes).forEach((vote) => {
    if (vote) {
      voteCount[vote] = (voteCount[vote] || 0) + 1;
    }
  });

  const sortedVotes = Object.entries(voteCount).sort((a, b) => {
    const aNum = parseFloat(a[0]);
    const bNum = parseFloat(b[0]);
    if (isNaN(aNum) && isNaN(bNum)) return 0;
    if (isNaN(aNum)) return 1;
    if (isNaN(bNum)) return -1;
    return aNum - bNum;
  });

  const maxCount = Math.max(...Object.values(voteCount));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Results
      </h2>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {average.toFixed(1)}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Minimum</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {min}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Maximum</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {max}
          </p>
        </div>
      </div>

      {/* Vote Distribution */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Vote Distribution
        </h3>
        <div className="space-y-2">
          {sortedVotes.map(([vote, count]) => {
            const percentage = (count / Object.keys(votes).length) * 100;
            const barWidth = (count / maxCount) * 100;

            return (
              <div key={vote} className="flex items-center gap-3">
                <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                  {vote}
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-300"
                    style={{ width: `${barWidth}%` }}
                  >
                    {barWidth > 20 && (
                      <span className="text-white font-semibold text-sm">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    )}
                  </div>
                  {barWidth <= 20 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
