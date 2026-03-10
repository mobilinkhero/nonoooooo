/**
 * ============================================================
 * © 2025 Diploy — a brand of Bisht Technologies Private Limited
 * Original Author: BTPL Engineering Team
 * Website: https://diploy.in
 * Contact: cs@diploy.in
 *
 * Distributed under the Envato / CodeCanyon License Agreement.
 * Licensed to the purchaser for use as defined by the
 * Envato Market (CodeCanyon) Regular or Extended License.
 *
 * You are NOT permitted to redistribute, resell, sublicense,
 * or share this source code, in whole or in part.
 * Respect the author's rights and Envato licensing terms.
 * ============================================================
 */

import {
  Plus,
  LogOut,
  Settings,
  User,
  Menu,
  ScrollText,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

import { useSidebar } from "@/contexts/sidebar-context";
import { LanguageSelector } from "../language-selector";
import NotificationBell from "@/components/notification/NotificationBell";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  userPhotoUrl?: string;
}

export default function Header({
  title,
  subtitle,
  action,
  userPhotoUrl,
}: HeaderProps) {
  const [, setLocation] = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const username = (user?.firstName || "") + " " + (user?.lastName || "");

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const { isOpen, toggle } = useSidebar();

  const handleStopImpersonation = async () => {
    try {
      const resp = await fetch("/api/admin/management/stop-impersonation", {
        method: "POST",
      });
      if (resp.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to stop impersonation", err);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const resp = await fetch(`/api/admin/management/search?q=${searchQuery}`);
        const data = await resp.json();
        setSearchResults(data.data || []);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <>
      {user?.isImpersonating && (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between text-sm font-medium">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>
              Impersonating <strong>{user.username}</strong>. You are currently
              acting as this user.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleStopImpersonation}
            className="bg-white text-red-600 border-white hover:bg-gray-100 h-7"
          >
            Stop Impersonation
          </Button>
        </div>
      )}
      <header className="bg-white shadow-sm border-b border-gray-100  px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="lg:hidden   p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h1 className="  text-base sm:text-lg lg:text-2xl font-bold text-gray-900">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 hidden lg:block  ">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {user?.role === "superadmin" && (
            <div className="flex-1 max-w-md relative hidden md:block" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Global Search (Users, Numbers, Transactions)..."
                  className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <User className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                {isSearching && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin h-4 w-4 border-2 border-green-500 rounded-full border-t-transparent" />
                  </div>
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-xl z-[60] py-2 max-h-96 overflow-y-auto">
                  {searchResults.map((item: any) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      className="w-full px-4 py-2 flex flex-col items-start hover:bg-gray-50 border-b last:border-0"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                        if (item.type === "user") setLocation(`/users?id=${item.id}`);
                        if (item.type === "channel") setLocation(`/channels-management?id=${item.id}`);
                        if (item.type === "transaction") setLocation(`/transactions-page?id=${item.id}`);
                      }}
                    >
                      <span className="text-xs font-bold uppercase text-gray-400">
                        {item.type}
                      </span>
                      <span className="text-sm font-semibold truncate w-full text-left">
                        {item.title}
                      </span>
                      <span className="text-xs text-gray-500 truncate w-full text-left">
                        {item.subtitle}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2 sm:space-x-4 ">
            <div className=" w-fit  ">
              {action && (
                <Button
                  onClick={action.onClick}
                  className="bg-green-600 text-white px-2 py-1 "
                >
                  <Plus className=" w-2 h-2 sm:w-4 sm:h-4 " />{" "}
                  <span className="hidden lg:block  ">{action.label}</span>
                </Button>
              )}
            </div>
            <div className=" w-fit hidden sm:block ">
              <LanguageSelector />
            </div>

            {user?.role != "superadmin" && (
              <>
                <button
                  onClick={() => setLocation("/settings?tab=support")}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Support"
                >
                  <Headphones className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setLocation("/settings?tab=message_logs")}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Message Logs"
                >
                  <ScrollText className="w-5 h-5 text-gray-600" />
                </button>
                <NotificationBell />
              </>
            )}

            <div className="relative" ref={dropdownRef}>
              <button
                className="w-10 h-10 rounded-full overflow-hidden border-2"
                onClick={() => setDropdownOpen((x) => !x)}
              >
                <img
                  src={
                    userPhotoUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      username
                    )}`
                  }
                  className="w-full h-full object-cover"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                  <div className="px-4 py-2 border-b text-gray-800 font-semibold">
                    {username}
                  </div>

                  <button
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setLocation("/settings");
                      setDropdownOpen(false);
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </button>

                  <button
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setLocation("/account");
                      setDropdownOpen(false);
                    }}
                  >
                    <User className="w-4 h-4 mr-2" /> Account
                  </button>

                  <button
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

    </>
  );
}
