import { create } from "zustand";

export const useAppStore = create((set, get) => ({
  data: null,
  session: null,
  credentials: null,
  loading: false,
  error: null,

  // =========================
  // 🔥 GLOBAL NAV GUARD STATE
  // =========================
  isEditingGlobal: false,
  hasChangesGlobal: false,
  pendingAction: null,
  showLeaveModal: false,

  // =========================
  // 🔥 GLOBAL NAV GUARD ACTIONS
  // =========================
  setEditingGlobal: (val) =>
    set(() => ({
      isEditingGlobal: val,
    })),

  setHasChangesGlobal: (val) =>
    set(() => ({
      hasChangesGlobal: val,
    })),

  requestLeaveGlobal: (action) => {
    const { isEditingGlobal, hasChangesGlobal } = get();

    if (!isEditingGlobal || !hasChangesGlobal) {
      action?.();
      return;
    }

    set({
      showLeaveModal: true,
      pendingAction: action,
    });
  },

  handleDiscardGlobal: () =>
    set((state) => {
      // execute pending navigation
      state.pendingAction?.();

      return {
        showLeaveModal: false,
        pendingAction: null,
        hasChangesGlobal: false,
        isEditingGlobal: false,
      };
    }),

  handleStayGlobal: () =>
    set({
      showLeaveModal: false,
      pendingAction: null,
    }),

  // =========================
  // ✅ DATA
  // =========================
  setData: (data) =>
    set(() => ({
      data,
      error: null,
    })),

  // =========================
  // ✅ SESSION (SAFE)
  // =========================
  setSession: (session) =>
    set(() => ({
      session:
        session && Object.keys(session).length > 0
          ? session
          : null,
    })),

  // =========================
  // ✅ CREDENTIALS
  // =========================
  setCredentials: (credentials) =>
    set(() => ({
      credentials:
        credentials?.email && credentials?.password
          ? credentials
          : null,
    })),

  // =========================
  // ✅ LOADING
  // =========================
  setLoading: (loading) =>
    set(() => ({
      loading,
    })),

  // =========================
  // ✅ ERROR
  // =========================
  setError: (error) =>
    set(() => ({
      error,
      loading: false,
    })),

  // =========================
  // 🔥 CLEAR ONLY DATA
  // =========================
  clearData: () =>
    set(() => ({
      data: null,
    })),

  // =========================
  // 🔥 CLEAR EVERYTHING (LOGOUT)
  // =========================
  clearAll: () =>
    set(() => ({
      data: null,
      session: null,
      credentials: null,
      error: null,
      loading: false,

      // 🔥 also reset guard
      isEditingGlobal: false,
      hasChangesGlobal: false,
      pendingAction: null,
      showLeaveModal: false,
    })),
}));