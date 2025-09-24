import { create } from "zustand";

// State types
interface States {
  loggedIn: boolean;
  selectedUser: {
    name: string;
    email: string;
    stripeCustomerId: string;
  };
  selectedUserId: string;
  createUserModalOpen: boolean;
  createUserModalLoading: boolean;
  createUserPaymentMethodModalOpen: boolean;
  stripe: any;
  stripeClientSecret: any;
  paymentProcessingLoading: boolean;
}

// Action types
interface Actions {
  setLoggedIn: (newValue: States["loggedIn"]) => void;
  setSelectedUser: (newValue: States["selectedUser"]) => void;
  setSelectedUserId: (newValue: States["selectedUserId"]) => void;
  setCreateUserModalOpen: (newValue: States["createUserModalOpen"]) => void;
  setCreateUserModalLoading: (
    newValue: States["createUserModalLoading"]
  ) => void;
  setCreateUserPaymentMethodModalOpen: (
    newValue: States["createUserPaymentMethodModalOpen"]
  ) => void;
  setStripe: (newValue: States["stripe"]) => void;
  setStripeClientSecret: (newValue: States["stripeClientSecret"]) => void;
  setPaymentProcessingLoading: (
    newValue: States["paymentProcessingLoading"]
  ) => void;
}

// useAppStore
export const useAppStore = create<States & Actions>((set) => ({
  // state
  loggedIn: false,
  selectedUser: {
    name: "",
    email: "",
    stripeCustomerId: "",
  },
  selectedUserId: "",
  createUserModalOpen: false,
  createUserModalLoading: false,
  createUserPaymentMethodModalOpen: false,
  stripe: null,
  stripeClientSecret: null,
  paymentProcessingLoading: false,

  // actions
  setLoggedIn: (newValue) => set({ loggedIn: newValue }),
  setSelectedUser: (newValue) => set({ selectedUser: { ...newValue } }),
  setSelectedUserId: (newValue) => set({ selectedUserId: newValue }),
  setCreateUserModalOpen: (newValue) => set({ createUserModalOpen: newValue }),
  setCreateUserModalLoading: (newValue) =>
    set({ createUserModalLoading: newValue }),
  setCreateUserPaymentMethodModalOpen: (newValue) =>
    set({ createUserPaymentMethodModalOpen: newValue }),
  setStripe: (newValue) => set({ stripe: newValue }),
  setStripeClientSecret: (newValue) => set({ stripeClientSecret: newValue }),
  setPaymentProcessingLoading: (newValue) =>
    set({ paymentProcessingLoading: newValue }),
}));
