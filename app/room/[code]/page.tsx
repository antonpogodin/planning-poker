'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { RoomState, VotingScaleType } from '@/lib/types';
import ParticipantsList from '@/components/ParticipantsList';
import VotingInterface from '@/components/VotingInterface';
import VotingResults from '@/components/VotingResults';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.code as string;

  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (!storedName) {
      router.push('/');
      return;
    }

    setUserName(storedName);

    const socket = getSocket();

    const initializeRoom = () => {
      setUserId(socket.id);

      // Listen for room updates
      socket.on('room-update', (room: RoomState) => {
        setRoomState(room);
        setLoading(false);
      });

      socket.on('room-joined', (room: RoomState) => {
        setRoomState(room);
        setLoading(false);
      });

      socket.on('error', (message: string) => {
        setError(message);
        setLoading(false);
      });

      // Try to join the room
      socket.emit('join-room', roomCode, storedName, (success, room) => {
        if (success && room) {
          setRoomState(room);
          setLoading(false);
        } else {
          setError('Failed to join room. Please check the room code.');
          setLoading(false);
        }
      });
    };

    // Wait for socket to connect before joining room
    if (socket.connected) {
      initializeRoom();
    } else {
      socket.on('connect', initializeRoom);
    }

    return () => {
      socket.off('connect', initializeRoom);
      socket.off('room-update');
      socket.off('room-joined');
      socket.off('error');
      if (socket.connected) {
        socket.emit('leave-room', roomCode, socket.id);
      }
    };
  }, [roomCode, router]);

  const handleVote = (value: string) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('vote', roomCode, socket.id, value);
  };

  const handleChangeScale = (scale: VotingScaleType) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('change-scale', roomCode, scale);
  };

  const handleReveal = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('reveal-votes', roomCode);
  };

  const handleReset = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('reset-votes', roomCode);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveRoom = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('leave-room', roomCode, socket.id);
    router.push('/lobby');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Joining room...</p>
        </div>
      </div>
    );
  }

  if (error || !roomState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Room Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'The room you are trying to join does not exist.'}
            </p>
            <button
              onClick={() => router.push('/lobby')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentUserVote = roomState.votes[userId];
  const hasVoted = currentUserVote !== undefined && currentUserVote !== null;
  const allVoted = roomState.users.every(
    (user) => roomState.votes[user.id] !== undefined && roomState.votes[user.id] !== null
  );
  const canReveal = hasVoted || allVoted;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Planning Poker
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Room Code:
                </span>
                <code className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
                  {roomCode}
                </code>
                <button
                  onClick={handleCopyCode}
                  className="ml-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-sm transition-colors"
                  title="Copy room code"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <button
              onClick={handleLeaveRoom}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Leave Room
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Participants */}
          <div className="lg:col-span-1">
            <ParticipantsList
              users={roomState.users}
              votes={roomState.votes}
              votesRevealed={roomState.votesRevealed}
              currentUserId={userId}
            />
          </div>

          {/* Right Column - Voting Interface and Results */}
          <div className="lg:col-span-2 space-y-6">
            <VotingInterface
              currentScale={roomState.currentScale}
              selectedVote={currentUserVote}
              votesRevealed={roomState.votesRevealed}
              onVote={handleVote}
              onChangeScale={handleChangeScale}
              onReveal={handleReveal}
              onReset={handleReset}
              canReveal={canReveal}
            />

            {roomState.votesRevealed && (
              <VotingResults
                votes={roomState.votes}
                votesRevealed={roomState.votesRevealed}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
