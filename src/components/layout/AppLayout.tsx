
import React from "react";
import BottomNavigation from "./BottomNavigation";
import { useLocation } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith("/auth");

  return (
    <div className="min-h-screen bg-background">
      <main className={`${!isAuthPage ? "pb-16" : ""}`}>
        {children}
      </main>
      {!isAuthPage && <BottomNavigation />}
    </div>
  );
};

export default AppLayout;
