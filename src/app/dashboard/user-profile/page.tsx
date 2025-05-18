"use client";

import { useUser } from "@clerk/nextjs";

export default function UserProfilePage() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden">
              {user?.imageUrl && (
                <img 
                  src={user.imageUrl} 
                  alt={user?.fullName || 'Profile'} 
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.fullName}</h2>
              <p className="text-gray-600">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="space-y-2">
              <p className="text-gray-600">
                Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-gray-600">
                Last sign in: {user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 