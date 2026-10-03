/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Activity, ActivityCategory } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { LocationProvider, useLocation } from './context/LocationContext';
import { subscribeActivities } from './firebase/activities';
import { checkAndSeedInitialActivities } from './utils/seedData';
import { Navbar } from './components/navigation/Navbar';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { HomeView } from './components/home/HomeView';
import { DiscoverView } from './components/discover/DiscoverView';
import { ProfileView } from './components/profile/ProfileView';
import { ActivityDetailModal } from './components/activities/ActivityDetailModal';
import { CreateActivityModal } from './components/activities/CreateActivityModal';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { ReportModal } from './components/safety/ReportModal';
import { Loader2 } from 'lucide-react';

function MainAppContent() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const { userLocation } = useLocation();
  const { t } = useLanguage();

  const [currentTab, setCurrentTab] = useState<'home' | 'discover' | 'profile'>('home');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Modals
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ activityId?: string; userId?: string } | null>(null);

  // Subscribe to realtime activities
  useEffect(() => {
    const unsubscribe = subscribeActivities((items) => {
      setActivities(items);
      // Keep selected activity updated with real-time participant counts
      if (selectedActivity) {
        const updated = items.find((a) => a.id === selectedActivity.id);
        if (updated) setSelectedActivity(updated);
      }
    });

    return () => unsubscribe();
  }, [selectedActivity?.id]);

  // Seed sample activities once location is ready if collection is empty
  useEffect(() => {
    if (userLocation) {
      checkAndSeedInitialActivities(userLocation.latitude, userLocation.longitude);
    }
  }, [userLocation?.latitude, userLocation?.longitude]);

  // Check if user needs onboarding
  useEffect(() => {
    if (currentUser && !currentUser.isAnonymous) {
      const onboardedKey = `onboarded_${currentUser.uid}`;
      const hasOnboarded = localStorage.getItem(onboardedKey);
      if (!hasOnboarded && (!userProfile?.interests || userProfile.interests.length === 0)) {
        setIsOnboardingOpen(true);
      }
    }
  }, [currentUser?.uid, userProfile?.interests]);

  const handleSelectActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsDetailOpen(true);
  };

  const handleSelectActivityById = (activityId: string) => {
    const act = activities.find((a) => a.id === activityId);
    if (act) {
      handleSelectActivity(act);
    }
  };

  const handleCreatedActivity = (newId: string) => {
    // Activity will arrive via Firestore onSnapshot
    setTimeout(() => {
      handleSelectActivityById(newId);
    }, 400);
  };

  const handleNavigateDiscoverWithCategory = (category?: string) => {
    setCurrentTab('discover');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenCreate={() => (currentUser ? setIsCreateOpen(true) : setIsAuthOpen(true))}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSelectActivityId={handleSelectActivityById}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-20 md:pb-8">
        {currentTab === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
            <HomeView
              activities={activities}
              onSelectActivity={handleSelectActivity}
              onOpenCreate={() => (currentUser ? setIsCreateOpen(true) : setIsAuthOpen(true))}
              onNavigateDiscover={handleNavigateDiscoverWithCategory}
            />
          </div>
        )}

        {currentTab === 'discover' && (
          <DiscoverView
            activities={activities}
            onSelectActivity={handleSelectActivity}
            onOpenCreate={() => (currentUser ? setIsCreateOpen(true) : setIsAuthOpen(true))}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            onSelectActivity={handleSelectActivity}
            onOpenAuthPrompt={() => setIsAuthOpen(true)}
            onOpenCreate={() => setIsCreateOpen(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenCreate={() => (currentUser ? setIsCreateOpen(true) : setIsAuthOpen(true))}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedActivity(null);
        }}
        onOpenReport={(activityId, creatorId) => {
          setReportTarget({ activityId, userId: creatorId });
        }}
        onOpenAuthPrompt={() => setIsAuthOpen(true)}
      />

      {/* Create Activity Modal */}
      <CreateActivityModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleCreatedActivity}
        onOpenAuthPrompt={() => setIsAuthOpen(true)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
        }}
      />

      {/* Onboarding Wizard */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => setIsOnboardingOpen(false)}
      />

      {/* Safety Report Modal */}
      <ReportModal
        isOpen={!!reportTarget}
        onClose={() => setReportTarget(null)}
        activityId={reportTarget?.activityId}
        reportedUserId={reportTarget?.userId}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <LocationProvider>
          <AuthProvider>
            <MainAppContent />
          </AuthProvider>
        </LocationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
