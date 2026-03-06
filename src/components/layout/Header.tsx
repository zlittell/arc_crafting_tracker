import { useAuth } from '../../context/AuthContext';

export function Header() {
  const { user, loading, isAvailable, signInWithGoogle, signOut } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-700 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-white tracking-tight">
          Arc Raiders Crafting Tracker
        </h1>
        <span className="text-xs text-gray-500 hidden sm:block">Arc Raiders crafting planner</span>
      </div>

      {isAvailable && !loading && (
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-xs text-gray-400 hidden sm:block truncate max-w-[160px]">
                {user.displayName ?? user.email}
              </span>
              <button
                onClick={signOut}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Sign in with Google
            </button>
          )}
        </div>
      )}
    </header>
  );
}
