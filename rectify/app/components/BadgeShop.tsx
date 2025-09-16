'use client';

import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface User {
  _id: string;
  name: string;
  phone: string;
  city: string;
  role: 'user';
  points?: number;
}

interface BadgeShopProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export function BadgeShop({ user, isOpen, onClose }: BadgeShopProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'contribution' | 'achievement' | 'premium' | 'special'>('all');
  
  const badges = useQuery(api.badges.getAllBadges);
  const userBadges = useQuery(api.badges.getUserBadges, { userId: user._id as Id<"users"> });
  const userPoints = useQuery(api.points.getUserPoints, { userId: user._id as Id<"users"> });
  const purchaseBadge = useMutation(api.badges.purchaseBadge);

  if (!isOpen) return null;

  const ownedBadgeIds = new Set(userBadges?.map(ub => ub.badgeId) || []);
  
  const filteredBadges = badges?.filter(badge => {
    if (selectedCategory === 'all') return true;
    return badge.category === selectedCategory;
  }) || [];

  const handlePurchase = async (badgeId: string) => {
    try {
      await purchaseBadge({
        userId: user._id as Id<"users">,
        badgeId: badgeId as Id<"badges">
      });
    } catch (error) {
      console.error("Failed to purchase badge:", error);
      alert(error instanceof Error ? error.message : "Failed to purchase badge");
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500 bg-gray-500/20';
      case 'rare': return 'border-blue-500 bg-blue-500/20';
      case 'epic': return 'border-purple-500 bg-purple-500/20';
      case 'legendary': return 'border-yellow-500 bg-yellow-500/20';
      default: return 'border-gray-500 bg-gray-500/20';
    }
  };

  const getRarityLabel = (rarity: string) => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-gray-900 rounded-2xl sm:rounded-3xl w-full max-w-sm sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-gray-700/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700/50">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Badge Shop
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 hidden sm:block">
              Purchase badges with your Rectify Points
            </p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-xl sm:rounded-2xl px-2 sm:px-4 py-1 sm:py-2">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-lg sm:text-2xl">⭐</span>
                <div>
                  <div className="text-blue-400 font-bold text-sm sm:text-lg">{userPoints || 0}</div>
                  <div className="text-xs text-gray-400 hidden sm:block">Rectify Points</div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-4 sm:p-6 border-b border-gray-700/50">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide">
            {[
              { id: 'all', label: 'All' },
              { id: 'contribution', label: 'Contribution' },
              { id: 'achievement', label: 'Achievement' },
              { id: 'premium', label: 'Premium' },
              { id: 'special', label: 'Special' }
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as 'all' | 'contribution' | 'achievement' | 'premium' | 'special')}
                className={`px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl font-medium transition-all duration-200 whitespace-nowrap text-sm sm:text-base ${
                  selectedCategory === category.id
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Badges Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredBadges.map((badge) => {
              const isOwned = ownedBadgeIds.has(badge._id);
              const canAfford = (userPoints || 0) >= badge.cost;
              
              return (
                <div
                  key={badge._id}
                  className={`relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 transition-all duration-300 hover:shadow-xl ${
                    isOwned ? 'border-green-500/50 bg-green-500/10' : getRarityColor(badge.rarity)
                  }`}
                >
                  {/* Rarity Label */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                    badge.rarity === 'common' ? 'bg-gray-600 text-gray-300' :
                    badge.rarity === 'rare' ? 'bg-blue-600 text-blue-300' :
                    badge.rarity === 'epic' ? 'bg-purple-600 text-purple-300' :
                    'bg-yellow-600 text-yellow-300'
                  }`}>
                    {getRarityLabel(badge.rarity)}
                  </div>

                  {/* Badge Icon */}
                  <div className="text-center mb-3 sm:mb-4">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center text-2xl sm:text-3xl ${badge.color} border-2 ${
                      isOwned ? 'border-green-500' : 'border-gray-600'
                    }`}>
                      {badge.icon}
                    </div>
                  </div>

                  {/* Badge Info */}
                  <div className="text-center mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">{badge.name}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-3">{badge.description}</p>
                  </div>

                  {/* Price and Purchase */}
                  <div className="text-center">
                    {isOwned ? (
                      <div className="bg-green-600/20 text-green-400 border border-green-500/30 rounded-lg sm:rounded-xl py-2 px-3 sm:px-4 font-medium text-sm">
                        ✓ Owned
                      </div>
                    ) : badge.cost === 0 ? (
                      <div className="bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg sm:rounded-xl py-2 px-3 sm:px-4 font-medium text-sm">
                        Free
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-1 text-yellow-400 font-bold">
                          <span className="text-base sm:text-lg">⭐</span>
                          <span className="text-sm sm:text-base">{badge.cost}</span>
                        </div>
                        <button
                          onClick={() => handlePurchase(badge._id)}
                          disabled={!canAfford}
                          className={`w-full py-2 px-3 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all duration-200 text-sm sm:text-base ${
                            canAfford
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? 'Purchase' : 'Not enough points'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredBadges.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🏪</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-300 mb-1 sm:mb-2">No badges available</h3>
              <p className="text-gray-500 text-sm sm:text-base">Check back later for new badges!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}