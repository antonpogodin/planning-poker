import { VotingScaleType, VOTING_SCALES } from '@/lib/types';

interface VotingInterfaceProps {
  currentScale: VotingScaleType;
  selectedVote: string | null;
  votesRevealed: boolean;
  onVote: (value: string) => void;
  onChangeScale: (scale: VotingScaleType) => void;
  onReveal: () => void;
  onReset: () => void;
  canReveal: boolean;
}

export default function VotingInterface({
  currentScale,
  selectedVote,
  votesRevealed,
  onVote,
  onChangeScale,
  onReveal,
  onReset,
  canReveal,
}: VotingInterfaceProps) {
  const currentScaleValues = VOTING_SCALES[currentScale];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      {/* Scale Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Voting Scale
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onChangeScale('fibonacci')}
            disabled={votesRevealed}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              currentScale === 'fibonacci'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Fibonacci
          </button>
          <button
            onClick={() => onChangeScale('powersOf2')}
            disabled={votesRevealed}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              currentScale === 'powersOf2'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Powers of 2
          </button>
        </div>
      </div>

      {/* Voting Cards */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Your Vote
        </label>
        <div className="grid grid-cols-5 gap-3">
          {currentScaleValues.map((value) => {
            const isSelected = selectedVote === value;
            return (
              <button
                key={value}
                onClick={() => onVote(value)}
                disabled={votesRevealed}
                className={`aspect-[3/4] rounded-lg font-bold text-xl transition-all transform hover:scale-105 active:scale-95 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-300 dark:ring-blue-700'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                {value}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!votesRevealed ? (
          <button
            onClick={onReveal}
            disabled={!canReveal}
            className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reveal Votes
          </button>
        ) : (
          <button
            onClick={onReset}
            className="flex-1 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            New Round
          </button>
        )}
      </div>

      {!canReveal && !votesRevealed && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
          Waiting for participants to vote...
        </p>
      )}
    </div>
  );
}
