import { User } from '@/lib/types';

interface ParticipantsListProps {
  users: User[];
  votes: Record<string, string | null>;
  votesRevealed: boolean;
  currentUserId: string;
}

export default function ParticipantsList({
  users,
  votes,
  votesRevealed,
  currentUserId,
}: ParticipantsListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Participants ({users.length})
      </h2>

      <div className="space-y-3">
        {users.map((user) => {
          const hasVoted = votes[user.id] !== undefined && votes[user.id] !== null;
          const voteValue = votes[user.id];
          const isCurrentUser = user.id === currentUserId;

          return (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    isCurrentUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                        (You)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {votesRevealed ? (
                  hasVoted ? (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md font-semibold">
                      {voteValue}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-md text-sm">
                      No vote
                    </span>
                  )
                ) : hasVoted ? (
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-10 bg-blue-500 rounded-md flex items-center justify-center text-white">
                      ?
                    </span>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Voted
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Waiting...
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
