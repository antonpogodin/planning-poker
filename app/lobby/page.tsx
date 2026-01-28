'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';

export default function Lobby() {
  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (!storedName) {
      router.push('/');
      return;
    }
    setUserName(storedName);

    // Initialize socket connection when component mounts
    console.log('Lobby: Initializing socket...');
    const socket = getSocket();

    // Just connect, don't add any listeners here
    return () => {
      // Don't disconnect on unmount, keep the connection alive
      console.log('Lobby: Component unmounting, keeping socket alive');
    };
  }, [router]);

  const handleCreateRoom = () => {
    if (!userName) return;

    setLoading(true);
    setError('');

    const socket = getSocket();
    if (!socket) {
      setError('Failed to connect to server');
      setLoading(false);
      return;
    }

    const createRoom = () => {
      if (!socket) return;
      socket.emit('create-room', userName, (code: string) => {
        setLoading(false);
        router.push(`/room/${code}`);
      });
    };

    if (socket.connected) {
      createRoom();
    } else {
      socket.once('connect', createRoom);
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !roomCode.trim()) return;

    const code = roomCode.trim();
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError('Room code must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    const socket = getSocket();
    if (!socket) {
      setError('Failed to connect to server');
      setLoading(false);
      return;
    }

    const joinRoom = () => {
      if (!socket) return;
      socket.emit('join-room', code, userName, (success, room) => {
        setLoading(false);
        if (success && room) {
          router.push(`/room/${code}`);
        } else {
          setError('Room not found. Please check the code and try again.');
        }
      });
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.once('connect', joinRoom);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-2xl px-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome, {userName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create a new room or join an existing one
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Room */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                    <svg
                      className="w-8 h-8 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Create New Room
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Start a new planning poker session
                  </p>
                </div>
                <button
                  onClick={handleCreateRoom}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </div>

            {/* Join Room */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                    <svg
                      className="w-8 h-8 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Join Existing Room
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Enter a 6-digit room code
                  </p>
                </div>
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => {
                      setError('');
                      setRoomCode(e.target.value);
                    }}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-4 py-3 text-center text-2xl font-mono rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition"
                  />
                  <button
                    type="submit"
                    disabled={loading || roomCode.length !== 6}
                    className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Joining...' : 'Join Room'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              localStorage.removeItem('userName');
              router.push('/');
            }}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            Change name
          </button>
        </div>
      </div>
    </div>
  );
}
