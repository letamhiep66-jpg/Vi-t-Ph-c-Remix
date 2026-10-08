import React, { createContext, useContext, useState, useEffect, useReducer, useMemo } from 'react';
import { 
  UserProfile, 
  FriendProfile,
  TraditionalCostume, 
  ModernGarment,
  AccessoryItem,
  ColorItem,
  UserWardrobeItem, 
  AppError, 
  CanvasLayerState,
  MixOption,
  ActiveTab,
  SavedLookbookItem,
  OutfitState,
  OutfitAction
} from '../types';
import { 
  TRADITIONAL_COSTUMES, 
  MODERN_GARMENTS, 
  ACCESSORY_ITEMS, 
  TRADITIONAL_COLORS, 
  MODERN_COLORS 
} from '../services/costumeService';
import { 
  getCostumeById, 
  isInnerCostume, 
  normalizeCostumeId 
} from '../utils/costumeLookup';
import { 
  auth, 
  db, 
  doc, 
  getDoc, 
  setDoc,
  type User 
} from '../services/firebase';
import { useFirebaseAuth } from './FirebaseAuthContext';

interface AppContextType {
  // Authentication
  currentUser: User | null;
  isAuthLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginAsGuest: (customName?: string, gender?: 'male' | 'female' | 'unisex') => void;
  logout: () => Promise<void>;

  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  mixSubflow: 'event' | 'free';
  setMixSubflow: (subflow: 'event' | 'free') => void;

  // Lookbook History
  lookbookHistory: SavedLookbookItem[];
  saveLookbook: (item: Omit<SavedLookbookItem, 'id' | 'createdAt'>) => SavedLookbookItem;
  deleteLookbook: (id: string) => void;
  updateLookbookTitle: (id: string, newTitle: string) => void;
  clearLookbookHistory: () => void;
  restoreLookbookToCanvas: (item: SavedLookbookItem) => void;


  // Heritage Advisor Chatbot
  isChatOpen: boolean;
  chatInitialPrompt: string;
  chatCostumeContext: string;
  openChatWithContext: (initialPrompt?: string, costumeContext?: string) => void;
  closeChat: () => void;
  toggleChat: () => void;

  // User Profile & Onboarding
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  isOnboardingModalOpen: boolean;
  openOnboardingModal: () => void;
  closeOnboardingModal: () => void;
  completeOnboarding: (data: Partial<UserProfile>) => Promise<void>;
  skipOnboarding: () => void;

  // Friends & Family Styling Mode
  friendProfiles: FriendProfile[];
  activeStylingTargetId: 'self' | string;
  activeFriendProfile: FriendProfile | null;
  effectiveStylingProfile: {
    isFriend: boolean;
    name: string;
    relationship?: string;
    gender: 'male' | 'female' | 'unisex';
    age: number;
    height: number;
    weight: number;
    avatar?: string;
  };
  addFriendProfile: (friend: Omit<FriendProfile, 'id' | 'createdAt'>) => FriendProfile;
  updateFriendProfile: (id: string, updates: Partial<FriendProfile>) => void;
  deleteFriendProfile: (id: string) => void;
  setActiveStylingTargetId: (id: 'self' | string) => void;
  isFriendModalOpen: boolean;
  openFriendModal: () => void;
  closeFriendModal: () => void;

  // Selected costume bridge from Explore to Mix
  selectedCostumeForMix: TraditionalCostume | null;
  selectCostumeForMix: (costume: TraditionalCostume) => void;

  // Single-source-of-truth Outfit State
  outfit: OutfitState;
  dispatchOutfit: React.Dispatch<OutfitAction>;
  equipItem: (item: TraditionalCostume | ModernGarment | AccessoryItem | UserWardrobeItem) => void;
  unequipSlot: (slot: 'outer' | 'inner' | 'bottom' | 'shoes' | 'accessoryFront' | 'accessoryBack' | 'accessory') => void;
  setOutfitColor: (target: 'traditional' | 'modern', color: ColorItem) => void;
  setOutfitGender: (gender: 'male' | 'female') => void;
  resetOutfit: (gender?: 'male' | 'female') => void;
  loadOutfit: (partial: Partial<OutfitState>) => void;

  // Canvas State (Free Mix - backward compatible getter/setter)
  canvasState: CanvasLayerState;
  setCanvasState: React.Dispatch<React.SetStateAction<CanvasLayerState>>;
  updateCanvasLayer: <K extends keyof CanvasLayerState>(layer: K, value: CanvasLayerState[K]) => void;

  // Comparison State
  comparisonSlotA: CanvasLayerState | null;
  comparisonSlotB: CanvasLayerState | null;
  saveToComparison: () => void;
  clearComparison: () => void;
  isComparing: boolean;
  setIsComparing: (val: boolean) => void;

  // Wardrobe Items (Session only, max 5)
  wardrobeItems: UserWardrobeItem[];
  addWardrobeItem: (item: Omit<UserWardrobeItem, 'id' | 'addedAt'>) => { success: boolean; message?: string };
  removeWardrobeItem: (id: string) => void;

  // Camera / Fitting Modal Flow
  activeFittingOutfit: MixOption | CanvasLayerState | null;
  setActiveFittingOutfit: (outfit: MixOption | CanvasLayerState | null) => void;

  // Global Loading & Error
  isLoading: boolean;
  loadingMessage: string;
  setLoadingState: (loading: boolean, message?: string) => void;

  currentError: AppError | null;
  showError: (error: AppError) => void;
  clearError: () => void;
  simulateError: (type: 'quota' | 'network' | 'limit') => void;
}

const DEFAULT_SAVED_LOOKBOOKS: SavedLookbookItem[] = [
  {
    id: 'sample-lookbook-1',
    title: 'Lookbook Áo Tấc × Chân Váy Xếp Ly Đen',
    createdAt: new Date(Date.now() - 86400000 * 2).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    compositeImage: '/images/costumes/ao-tac-ngu-than-tay-thung.jpg',
    costumeName: 'Áo Tấc',
    costumeEra: 'Thời Nguyễn (Thế kỷ XIX - XX)',
    costumeId: 'ao-tac-ngu-than-tay-thung',
    modernGarmentName: 'Chân Váy Xếp Ly Dáng Dài',
    modernGarmentCategory: 'skirt',
    modernGarmentId: 'mod-pleated-skirt',
    accessoryNames: ['Khăn Đóng Quấn Nếp Chữ Nhân', 'Khánh Ngọc Bội Chạm Khắc'],
    traditionalColorName: 'Đỏ Điều Son',
    modernColorName: 'Đen Mực Tàu',
    occasion: 'Khai mạc triển lãm Mỹ thuật Di sản',
    harmonyScore: 96,
    notes: 'Phom dáng tay thụng uyển chuyển, kết hợp chân váy tối giản tôn lên vẻ quý phái trầm mặc.',
    canvasState: {
      traditional: getCostumeById('ao-tac-ngu-than-tay-thung') || TRADITIONAL_COSTUMES[0],
      modern: MODERN_GARMENTS[2] || null,
      accessory: ACCESSORY_ITEMS[0] || null,
      traditionalColor: TRADITIONAL_COLORS[0],
      modernColor: MODERN_COLORS[1]
    }
  },
  {
    id: 'sample-lookbook-2',
    title: 'Lookbook Áo Ngũ Thân × Blazer Dáng Suông',
    createdAt: new Date(Date.now() - 86400000 * 5).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    compositeImage: '/images/costumes/ao-ngu-than.jpg',
    costumeName: 'Áo Ngũ Thân',
    costumeEra: 'Thế kỷ XVIII - XIX (Định hình 1744 - 1827)',
    costumeId: 'ao-ngu-than',
    modernGarmentName: 'Blazer Phom Rộng Cắt Tối Giản',
    modernGarmentCategory: 'jacket',
    modernGarmentId: 'mod-blazer-oversize',
    accessoryNames: ['Khăn Đóng Nam Giới', 'Kính Râm Gọng Đồi Mồi Retro'],
    traditionalColorName: 'Xanh Chàm Lam Điền',
    modernColorName: 'Xám Ghi Tro',
    occasion: 'Gặp gỡ đối tác quốc tế & Giao lưu văn hóa',
    harmonyScore: 92,
    notes: 'Phong thái đĩnh đạc, cổ lập lĩnh đứng đoan trang bên trong lớp blazer vai xuôi hiện đại.',
    canvasState: {
      traditional: getCostumeById('ao-ngu-than') || TRADITIONAL_COSTUMES[0],
      modern: MODERN_GARMENTS[0] || null,
      accessory: ACCESSORY_ITEMS[3] || null,
      traditionalColor: TRADITIONAL_COLORS[1] || TRADITIONAL_COLORS[0],
      modernColor: MODERN_COLORS[0]
    }
  }
];

const DEFAULT_PROFILE: UserProfile = {
  name: 'Lê Minh An',
  age: 24,
  height: 168,
  weight: 56,
  gender: 'female',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  favoriteEra: 'nguyen',
  purpose: 'mix_photo',
  isOnboarded: false
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const getDefaultOutfit = (gender: 'male' | 'female' = 'female'): OutfitState => ({
  baseGender: gender,
  outer: getCostumeById('ao-giao-linh') || TRADITIONAL_COSTUMES[0] || null,
  inner: getCostumeById('ao-yem') || null,
  bottom: MODERN_GARMENTS[1],
  shoes: MODERN_GARMENTS[3],
  accessoryBack: ACCESSORY_ITEMS[0],
  accessoryFront: ACCESSORY_ITEMS[1],
  traditionalColor: TRADITIONAL_COLORS[0],
  modernColor: MODERN_COLORS[0]
});

function outfitReducer(state: OutfitState, action: OutfitAction): OutfitState {
  switch (action.type) {
    case 'EQUIP': {
      const item = action.item;
      // 1. Traditional Costume
      if ('historyStory' in item) {
        const canonicalId = normalizeCostumeId(item.id);
        if (canonicalId === 'ao-yem') {
          if (state.inner && state.inner.id === item.id) {
            return { ...state, inner: null };
          }
          return { ...state, inner: item };
        } else {
          if (state.outer && state.outer.id === item.id) {
            return { ...state, outer: null };
          }
          return { ...state, outer: item };
        }
      }

      // 2. Modern Garment / Wardrobe Item
      if ('category' in item) {
        const cat = item.category as string;
        if (cat === 'jacket') {
          if (state.outer && state.outer.id === item.id) {
            return { ...state, outer: null };
          }
          return { ...state, outer: item as ModernGarment };
        }
        if (cat === 'shirt' || cat === 'croptop') {
          if (state.inner && state.inner.id === item.id) {
            return { ...state, inner: null };
          }
          return { ...state, inner: item as unknown as ModernGarment };
        }
        if (cat === 'pants' || cat === 'skirt') {
          if (state.bottom && state.bottom.id === item.id) {
            return { ...state, bottom: null };
          }
          return { ...state, bottom: item as ModernGarment };
        }
        if (cat === 'shoes') {
          if (state.shoes && state.shoes.id === item.id) {
            return { ...state, shoes: null };
          }
          return { ...state, shoes: item as ModernGarment };
        }
      }

      // 3. Accessory
      if ('traditional' in item && 'layerType' in item) {
        if (item.layerType === 'accessory_back') {
          if (state.accessoryBack && state.accessoryBack.id === item.id) {
            return { ...state, accessoryBack: null };
          }
          return { ...state, accessoryBack: item as AccessoryItem };
        } else {
          if (state.accessoryFront && state.accessoryFront.id === item.id) {
            return { ...state, accessoryFront: null };
          }
          return { ...state, accessoryFront: item as AccessoryItem };
        }
      }

      return state;
    }

    case 'UNEQUIP': {
      if (action.slot === 'accessory') {
        return { ...state, accessoryFront: null, accessoryBack: null };
      }
      return { ...state, [action.slot]: null };
    }

    case 'SET_COLOR': {
      if (action.target === 'traditional') {
        return { ...state, traditionalColor: action.color };
      }
      return { ...state, modernColor: action.color };
    }

    case 'SET_GENDER': {
      return { ...state, baseGender: action.gender };
    }

    case 'RESET': {
      return getDefaultOutfit(action.defaultGender || state.baseGender);
    }

    case 'LOAD_OUTFIT': {
      return {
        ...state,
        ...action.payload
      };
    }

    default:
      return state;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    user: firebaseAuthUser, 
    isLoading: isFirebaseAuthLoading, 
    signOut: authProviderSignOut 
  } = useFirebaseAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('explore');
  const [mixSubflow, setMixSubflow] = useState<'event' | 'free'>('event');

  // Firebase Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(firebaseAuthUser);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(isFirebaseAuthLoading);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openOnboardingModal = () => setIsOnboardingModalOpen(true);
  const closeOnboardingModal = () => setIsOnboardingModalOpen(false);

  const loginAsGuest = (customName?: string, gender: 'male' | 'female' | 'unisex' = 'female') => {
    const name = customName?.trim() || 'Khách Quý Nếp';
    const guestUser = {
      uid: 'guest_' + Date.now(),
      displayName: name,
      email: 'khachquy@nep.vn',
      photoURL: '',
      isAnonymous: true,
    } as unknown as User;

    setCurrentUser(guestUser);
    setIsAuthLoading(false);
    setUserProfile((prev) => ({
      ...(prev || DEFAULT_PROFILE),
      name: name,
      gender: gender,
      isOnboarded: true,
    }));
    setIsAuthModalOpen(false);
    setIsOnboardingModalOpen(false);
  };

  const logout = async () => {
    try {
      await authProviderSignOut();
    } catch (e) {
      console.warn('Logout error:', e);
    } finally {
      setCurrentUser(null);
      setIsOnboardingModalOpen(false);
    }
  };

  // Lookbook History state
  const [lookbookHistory, setLookbookHistory] = useState<SavedLookbookItem[]>(() => {
    try {
      const saved = localStorage.getItem('nep_saved_lookbooks_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_SAVED_LOOKBOOKS;
    } catch {
      return DEFAULT_SAVED_LOOKBOOKS;
    }
  });

  // Persist lookbook history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nep_saved_lookbooks_v1', JSON.stringify(lookbookHistory));
    } catch (e) {
      console.warn('Cannot write lookbook history to localStorage', e);
    }
  }, [lookbookHistory]);

  const saveLookbook = (item: Omit<SavedLookbookItem, 'id' | 'createdAt'>): SavedLookbookItem => {
    const newItem: SavedLookbookItem = {
      ...item,
      id: `lookbook-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    setLookbookHistory((prev) => [newItem, ...prev]);

    // If authenticated, sync to Firestore
    if (currentUser) {
      setDoc(doc(db, 'users', currentUser.uid, 'lookbooks', newItem.id), {
        ...newItem,
        userId: currentUser.uid,
      }).catch((err) => console.warn('Could not sync lookbook to Firestore:', err));
    }

    return newItem;
  };

  const deleteLookbook = (id: string) => {
    setLookbookHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const updateLookbookTitle = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setLookbookHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title: newTitle.trim() } : item))
    );
  };

  const clearLookbookHistory = () => {
    setLookbookHistory([]);
  };

  const restoreLookbookToCanvas = (item: SavedLookbookItem) => {
    if (item.canvasState) {
      setCanvasState(item.canvasState);
    } else {
      const foundCostume = TRADITIONAL_COSTUMES.find(
        (c) => c.id === item.costumeId || c.name === item.costumeName
      ) || TRADITIONAL_COSTUMES[0];

      const foundModern = MODERN_GARMENTS.find(
        (m) => m.id === item.modernGarmentId || m.name === item.modernGarmentName
      ) || null;

      const foundAcc = ACCESSORY_ITEMS.find(
        (a) => item.accessoryNames?.includes(a.name)
      ) || null;

      const foundTradColor = TRADITIONAL_COLORS.find(
        (c) => c.name === item.traditionalColorName
      ) || TRADITIONAL_COLORS[0];

      const foundModColor = MODERN_COLORS.find(
        (c) => c.name === item.modernColorName
      ) || MODERN_COLORS[0];

      setCanvasState({
        traditional: foundCostume,
        modern: foundModern,
        accessory: foundAcc,
        traditionalColor: foundTradColor,
        modernColor: foundModColor
      });
    }

    setActiveTab('mix');
    setMixSubflow('free');
  };


  // Heritage Advisor Chatbot State
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');
  const [chatCostumeContext, setChatCostumeContext] = useState<string>('');

  const openChatWithContext = (initialPrompt?: string, costumeContext?: string) => {
    if (initialPrompt) setChatInitialPrompt(initialPrompt);
    if (costumeContext) setChatCostumeContext(costumeContext);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  // Robust helper to guarantee userProfile is never null or corrupted
  const safeParseProfile = (): UserProfile => {
    try {
      const saved = sessionStorage.getItem('nep_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return {
            name: parsed.name || DEFAULT_PROFILE.name,
            age: Number(parsed.age) || DEFAULT_PROFILE.age,
            height: Number(parsed.height) || DEFAULT_PROFILE.height,
            weight: Number(parsed.weight) || DEFAULT_PROFILE.weight,
            gender: (parsed.gender === 'male' || parsed.gender === 'female' || parsed.gender === 'unisex') ? parsed.gender : DEFAULT_PROFILE.gender,
            avatar: parsed.avatar || DEFAULT_PROFILE.avatar,
            favoriteEra: parsed.favoriteEra || DEFAULT_PROFILE.favoriteEra,
            purpose: parsed.purpose || DEFAULT_PROFILE.purpose,
            isOnboarded: Boolean(parsed.isOnboarded)
          };
        }
      }
    } catch (e) {
      console.warn('Error reading cached user profile:', e);
    }
    return DEFAULT_PROFILE;
  };

  const safeParseWardrobe = (): UserWardrobeItem[] => {
    try {
      const saved = localStorage.getItem('nep_wardrobe_items') || sessionStorage.getItem('nep_wardrobe_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading wardrobe items:', e);
    }
    return [];
  };

  const safeParseFriends = (): FriendProfile[] => {
    try {
      const saved = localStorage.getItem('nep_friend_profiles_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading friend profiles:', e);
    }
    return [];
  };

  // Load profile from sessionStorage or default with 100% guarantee
  const [userProfile, setUserProfile] = useState<UserProfile>(safeParseProfile);

  // Friend & Family styling profiles
  const [friendProfiles, setFriendProfiles] = useState<FriendProfile[]>(safeParseFriends);
  const [activeStylingTargetId, setActiveStylingTargetId] = useState<'self' | string>('self');
  const [isFriendModalOpen, setIsFriendModalOpen] = useState<boolean>(false);

  const openFriendModal = () => setIsFriendModalOpen(true);
  const closeFriendModal = () => setIsFriendModalOpen(false);

  const activeFriendProfile = activeStylingTargetId === 'self'
    ? null
    : (friendProfiles.find((f) => f.id === activeStylingTargetId) || null);

  const effectiveStylingProfile = {
    isFriend: Boolean(activeFriendProfile),
    name: activeFriendProfile ? activeFriendProfile.name : (userProfile?.name || 'Khách Quý Nếp'),
    relationship: activeFriendProfile?.relationship,
    gender: (activeFriendProfile ? activeFriendProfile.gender : (userProfile?.gender || 'female')) as 'male' | 'female' | 'unisex',
    age: activeFriendProfile ? activeFriendProfile.age : (userProfile?.age || 24),
    height: activeFriendProfile ? activeFriendProfile.height : (userProfile?.height || 165),
    weight: activeFriendProfile ? activeFriendProfile.weight : (userProfile?.weight || 55),
    avatar: activeFriendProfile ? activeFriendProfile.avatar : userProfile?.avatar
  };

  const addFriendProfile = (friendData: Omit<FriendProfile, 'id' | 'createdAt'>): FriendProfile => {
    const newFriend: FriendProfile = {
      ...friendData,
      id: `friend-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    setFriendProfiles((prev) => {
      const updated = [newFriend, ...prev];
      try {
        localStorage.setItem('nep_friend_profiles_v1', JSON.stringify(updated));
      } catch {}
      if (currentUser) {
        setDoc(doc(db, 'users', currentUser.uid), { friendProfiles: updated }, { merge: true }).catch(() => {});
      }
      return updated;
    });
    setActiveStylingTargetId(newFriend.id);
    return newFriend;
  };

  const updateFriendProfile = (id: string, updates: Partial<FriendProfile>) => {
    setFriendProfiles((prev) => {
      const updated = prev.map((f) => (f.id === id ? { ...f, ...updates } : f));
      try {
        localStorage.setItem('nep_friend_profiles_v1', JSON.stringify(updated));
      } catch {}
      if (currentUser) {
        setDoc(doc(db, 'users', currentUser.uid), { friendProfiles: updated }, { merge: true }).catch(() => {});
      }
      return updated;
    });
  };

  const deleteFriendProfile = (id: string) => {
    setFriendProfiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      try {
        localStorage.setItem('nep_friend_profiles_v1', JSON.stringify(updated));
      } catch {}
      if (currentUser) {
        setDoc(doc(db, 'users', currentUser.uid), { friendProfiles: updated }, { merge: true }).catch(() => {});
      }
      return updated;
    });
    if (activeStylingTargetId === id) {
      setActiveStylingTargetId('self');
    }
  };

  const [selectedCostumeForMix, setSelectedCostumeForMix] = useState<TraditionalCostume | null>(null);

  // Single-source-of-truth Outfit State
  const [outfit, dispatchOutfit] = useReducer(outfitReducer, undefined, () => getDefaultOutfit('female'));

  // Backward-compatible canvasState getter
  const canvasState: CanvasLayerState = useMemo(() => {
    const trad = (outfit.outer && 'historyStory' in outfit.outer ? outfit.outer : null)
      || (outfit.inner && 'historyStory' in outfit.inner ? outfit.inner : null)
      || getCostumeById('ao-giao-linh') 
      || TRADITIONAL_COSTUMES[0];

    return {
      traditional: trad,
      modern: (outfit.bottom || (outfit.outer && !('historyStory' in outfit.outer) ? outfit.outer : null) || outfit.shoes) as any,
      accessory: (outfit.accessoryFront || outfit.accessoryBack) as any,
      traditionalColor: outfit.traditionalColor,
      modernColor: outfit.modernColor,
      equippedLayers: {
        baseGender: outfit.baseGender,
        outerTop: outfit.outer,
        innerTop: outfit.inner,
        bottom: outfit.bottom,
        shoes: outfit.shoes,
        accessoryBack: outfit.accessoryBack,
        accessoryFront: outfit.accessoryFront
      }
    };
  }, [outfit]);

  const setCanvasState: React.Dispatch<React.SetStateAction<CanvasLayerState>> = (action) => {
    const nextState = typeof action === 'function' ? action(canvasState) : action;
    const payload: Partial<OutfitState> = {
      traditionalColor: nextState.traditionalColor,
      modernColor: nextState.modernColor
    };
    if (nextState.equippedLayers) {
      if (nextState.equippedLayers.baseGender) payload.baseGender = nextState.equippedLayers.baseGender;
      if (nextState.equippedLayers.outerTop !== undefined) payload.outer = nextState.equippedLayers.outerTop as TraditionalCostume | ModernGarment | null;
      if (nextState.equippedLayers.innerTop !== undefined) payload.inner = nextState.equippedLayers.innerTop as TraditionalCostume | ModernGarment | null;
      if (nextState.equippedLayers.bottom !== undefined) payload.bottom = nextState.equippedLayers.bottom as ModernGarment | UserWardrobeItem | null;
      if (nextState.equippedLayers.shoes !== undefined) payload.shoes = nextState.equippedLayers.shoes as ModernGarment | UserWardrobeItem | null;
      if (nextState.equippedLayers.accessoryBack !== undefined) payload.accessoryBack = (nextState.equippedLayers.accessoryBack as AccessoryItem) || null;
      if (nextState.equippedLayers.accessoryFront !== undefined) payload.accessoryFront = (nextState.equippedLayers.accessoryFront as AccessoryItem) || null;
    } else {
      if (nextState.traditional) {
        if (isInnerCostume(nextState.traditional.id)) payload.inner = nextState.traditional;
        else payload.outer = nextState.traditional;
      }
      if (nextState.modern) {
        if ('category' in nextState.modern && nextState.modern.category === 'jacket') payload.outer = nextState.modern as ModernGarment;
        else if ('category' in nextState.modern && (nextState.modern.category === 'pants' || nextState.modern.category === 'skirt')) payload.bottom = nextState.modern as ModernGarment;
        else if ('category' in nextState.modern && nextState.modern.category === 'shoes') payload.shoes = nextState.modern as ModernGarment;
        else payload.inner = nextState.modern as ModernGarment;
      }
      if (nextState.accessory) payload.accessoryFront = nextState.accessory as AccessoryItem;
    }
    dispatchOutfit({ type: 'LOAD_OUTFIT', payload });
  };

  // Comparison slots
  const [comparisonSlotA, setComparisonSlotA] = useState<CanvasLayerState | null>(null);
  const [comparisonSlotB, setComparisonSlotB] = useState<CanvasLayerState | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  // Wardrobe items (max 5 in session)
  const [wardrobeItems, setWardrobeItems] = useState<UserWardrobeItem[]>(safeParseWardrobe);

  const [activeFittingOutfit, setActiveFittingOutfit] = useState<MixOption | CanvasLayerState | null>(null);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Đang khởi tạo không gian trải nghiệm...');
  const [currentError, setCurrentError] = useState<AppError | null>(null);

  // Persist profile in sessionStorage
  useEffect(() => {
    try {
      if (userProfile) {
        sessionStorage.setItem('nep_user_profile', JSON.stringify(userProfile));
      }
    } catch (e) {
      console.warn('Cannot write profile to sessionStorage', e);
    }
  }, [userProfile]);

  // Persist wardrobe in sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('nep_wardrobe_items', JSON.stringify(wardrobeItems));
    } catch (e) {
      console.warn('Cannot write wardrobe to sessionStorage', e);
    }
  }, [wardrobeItems]);

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const base = prev || DEFAULT_PROFILE;
      const updated: UserProfile = { ...base, ...profile };
      if (currentUser) {
        setDoc(doc(db, 'users', currentUser.uid), {
          ...updated,
          uid: currentUser.uid,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch((err) => console.warn('Could not sync user profile to Firestore:', err));
      }
      return updated;
    });
  };

  const completeOnboarding = async (data: Partial<UserProfile>) => {
    const base = userProfile || DEFAULT_PROFILE;
    const updated: UserProfile = {
      ...base,
      ...data,
      isOnboarded: true
    };
    setUserProfile(updated);
    setIsOnboardingModalOpen(false);

    if (currentUser) {
      try {
        localStorage.setItem(`nep_onboarding_done_${currentUser.uid}`, 'true');
        // Non-blocking firestore sync (chạy ngầm không bao giờ làm đơ màn hình)
        setDoc(doc(db, 'users', currentUser.uid), {
          ...updated,
          uid: currentUser.uid,
          email: currentUser.email || '',
          isOnboarded: true,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch((err) => {
          console.warn('Could not sync user profile to Firestore (background):', err);
        });
      } catch (err) {
        console.warn('Could not persist onboarding state:', err);
      }
    }
  };

  const skipOnboarding = () => {
    setIsOnboardingModalOpen(false);
    setUserProfile((prev) => ({ ...(prev || DEFAULT_PROFILE), isOnboarded: true }));
    if (currentUser) {
      try {
        localStorage.setItem(`nep_onboarding_done_${currentUser.uid}`, 'true');
        setDoc(doc(db, 'users', currentUser.uid), {
          isOnboarded: true,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(() => {});
      } catch {}
    }
  };

  // Sync user state and load Firestore profile when firebaseAuthUser changes
  useEffect(() => {
    setIsAuthLoading(isFirebaseAuthLoading);

    if (firebaseAuthUser) {
      setCurrentUser(firebaseAuthUser);

      // Check local cache first so user is never blocked
      const isAlreadyOnboardedLocally = 
        localStorage.getItem(`nep_onboarding_done_${firebaseAuthUser.uid}`) === 'true';

      // Immediately sync basic user info to state so UI displays user instantly
      setUserProfile((prev) => {
        const base = prev || DEFAULT_PROFILE;
        return {
          ...base,
          name: firebaseAuthUser.displayName || base.name,
          avatar: firebaseAuthUser.photoURL || base.avatar,
          isOnboarded: isAlreadyOnboardedLocally || base.isOnboarded
        };
      });

      // Load Firestore profile in background with timeout
      (async () => {
        try {
          const docRef = doc(db, 'users', firebaseAuthUser.uid);
          // 2.5s safety timeout so slow Firestore never freezes state
          const snapPromise = getDoc(docRef);
          const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
          const userDoc = await Promise.race([snapPromise, timeoutPromise]);

          if (userDoc && userDoc.exists()) {
            const data = userDoc.data();
            const onboarded = Boolean(data.isOnboarded) || isAlreadyOnboardedLocally;
            setUserProfile((prev) => {
              const base = prev || DEFAULT_PROFILE;
              return {
                ...base,
                name: data.name || firebaseAuthUser.displayName || base.name,
                avatar: data.avatar || firebaseAuthUser.photoURL || base.avatar,
                age: Number(data.age) || base.age,
                height: Number(data.height) || base.height,
                weight: Number(data.weight) || base.weight,
                gender: data.gender || base.gender,
                favoriteEra: data.favoriteEra || base.favoriteEra,
                purpose: data.purpose || base.purpose,
                isOnboarded: onboarded
              };
            });

            if (onboarded) {
              localStorage.setItem(`nep_onboarding_done_${firebaseAuthUser.uid}`, 'true');
            } else if (!isAlreadyOnboardedLocally) {
              // Only open onboarding modal if user hasn't explicitly dismissed it
              setIsOnboardingModalOpen(true);
            }
          } else if (!isAlreadyOnboardedLocally) {
            // First time login - initialize doc in background without blocking
            const base = userProfile || DEFAULT_PROFILE;
            setDoc(doc(db, 'users', firebaseAuthUser.uid), {
              uid: firebaseAuthUser.uid,
              name: firebaseAuthUser.displayName || base.name,
              email: firebaseAuthUser.email || '',
              avatar: firebaseAuthUser.photoURL || base.avatar,
              age: base.age,
              height: base.height,
              weight: base.weight,
              gender: base.gender,
              favoriteEra: base.favoriteEra || 'nguyen',
              purpose: base.purpose || 'mix_photo',
              isOnboarded: false,
              updatedAt: new Date().toISOString()
            }, { merge: true }).catch((initErr) => {
              console.warn('Initial Firestore document setup notice:', initErr);
            });

            // Prompt user gently with onboarding
            setIsOnboardingModalOpen(true);
          }
        } catch (e) {
          console.warn('Notice fetching Firestore user profile:', e);
        }
      })();
    } else {
      // If not logged in as a temporary guest, clear current user
      setCurrentUser((prev) => (prev && String(prev.uid).startsWith('guest_') ? prev : null));
      setIsOnboardingModalOpen(false);
    }
  }, [firebaseAuthUser, isFirebaseAuthLoading]);

  const equipItem = (item: TraditionalCostume | ModernGarment | AccessoryItem | UserWardrobeItem) => {
    dispatchOutfit({ type: 'EQUIP', item });
  };

  const unequipSlot = (slot: 'outer' | 'inner' | 'bottom' | 'shoes' | 'accessoryFront' | 'accessoryBack' | 'accessory') => {
    dispatchOutfit({ type: 'UNEQUIP', slot });
  };

  const setOutfitColor = (target: 'traditional' | 'modern', color: ColorItem) => {
    dispatchOutfit({ type: 'SET_COLOR', target, color });
  };

  const setOutfitGender = (gender: 'male' | 'female') => {
    dispatchOutfit({ type: 'SET_GENDER', gender });
  };

  const resetOutfit = (gender?: 'male' | 'female') => {
    dispatchOutfit({ type: 'RESET', defaultGender: gender });
  };

  const loadOutfit = (partial: Partial<OutfitState>) => {
    dispatchOutfit({ type: 'LOAD_OUTFIT', payload: partial });
  };

  const selectCostumeForMix = (costume: TraditionalCostume) => {
    setSelectedCostumeForMix(costume);
    if (costume) {
      dispatchOutfit({ type: 'EQUIP', item: costume });
    }
    setMixSubflow('free');
    setActiveTab('mix');
  };

  const updateCanvasLayer = <K extends keyof CanvasLayerState>(layer: K, value: CanvasLayerState[K]) => {
    setCanvasState((prev) => ({ ...prev, [layer]: value }));
  };

  const saveToComparison = () => {
    if (!comparisonSlotA) {
      setComparisonSlotA({ ...canvasState });
      setIsComparing(true);
    } else {
      setComparisonSlotB({ ...canvasState });
      setIsComparing(true);
    }
  };

  const clearComparison = () => {
    setComparisonSlotA(null);
    setComparisonSlotB(null);
    setIsComparing(false);
  };

  useEffect(() => {
    try {
      localStorage.setItem('nep_wardrobe_items', JSON.stringify(wardrobeItems));
    } catch (e) {
      console.warn('Error saving wardrobe items to localStorage:', e);
    }
  }, [wardrobeItems]);

  const addWardrobeItem = (item: Omit<UserWardrobeItem, 'id' | 'addedAt'>) => {
    const newItem: UserWardrobeItem = {
      ...item,
      id: `wardrobe-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      addedAt: Date.now()
    };
    setWardrobeItems((prev) => [newItem, ...prev]);
    return { success: true };
  };

  const removeWardrobeItem = (id: string) => {
    setWardrobeItems((prev) => prev.filter((item) => item.id !== id));
  };

  const setLoadingState = (loading: boolean, message = 'Đang xử lý dữ liệu...') => {
    setIsLoading(loading);
    setLoadingMessage(message);
  };

  const showError = (error: AppError) => {
    setCurrentError(error);
  };

  const clearError = () => {
    setCurrentError(null);
  };

  const simulateError = (type: 'quota' | 'network' | 'limit') => {
    if (type === 'quota') {
      showError({
        type: 'quota',
        title: 'Hạn Mức Hệ Thống',
        message: 'Hệ thống đang quá tải người thử đồ, bạn nán lại uống chén trà nhé (vui lòng thử lại sau ít phút).',
        retryTime: '15 phút'
      });
    } else if (type === 'network') {
      showError({
        type: 'network',
        title: 'Lỗi Kết Nối Mạng',
        message: 'Mất kết nối mạng, vui lòng kiểm tra lại đường truyền internet.'
      });
    } else if (type === 'limit') {
      showError({
        type: 'limit',
        title: 'Giới Hạn Lượt Trải Nghiệm',
        message: 'Bạn đã đạt giới hạn lượt dùng thử trong ngày hôm nay.'
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginAsGuest,
        logout,
        activeTab,
        setActiveTab,
        mixSubflow,
        setMixSubflow,
        lookbookHistory,
        saveLookbook,
        deleteLookbook,
        updateLookbookTitle,
        clearLookbookHistory,
        restoreLookbookToCanvas,
        isChatOpen,
        chatInitialPrompt,
        chatCostumeContext,
        openChatWithContext,
        closeChat,
        toggleChat,
        userProfile,
        updateUserProfile,
        isOnboardingModalOpen,
        openOnboardingModal,
        closeOnboardingModal,
        completeOnboarding,
        skipOnboarding,
        friendProfiles,
        activeStylingTargetId,
        activeFriendProfile,
        effectiveStylingProfile,
        addFriendProfile,
        updateFriendProfile,
        deleteFriendProfile,
        setActiveStylingTargetId,
        isFriendModalOpen,
        openFriendModal,
        closeFriendModal,
        selectedCostumeForMix,
        selectCostumeForMix,
        outfit,
        dispatchOutfit,
        equipItem,
        unequipSlot,
        setOutfitColor,
        setOutfitGender,
        resetOutfit,
        loadOutfit,
        canvasState,
        setCanvasState,
        updateCanvasLayer,
        comparisonSlotA,
        comparisonSlotB,
        saveToComparison,
        clearComparison,
        isComparing,
        setIsComparing,
        wardrobeItems,
        addWardrobeItem,
        removeWardrobeItem,
        activeFittingOutfit,
        setActiveFittingOutfit,
        isLoading,
        loadingMessage,
        setLoadingState,
        currentError,
        showError,
        clearError,
        simulateError
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
