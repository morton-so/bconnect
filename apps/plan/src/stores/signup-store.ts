import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface SignupFormData {
  signupToken: string
}

interface SignupState {
  formData: SignupFormData
  setSignupToken: (token: string) => void
  reset: () => void
}

const initialFormData: SignupFormData = {
  signupToken: '',
}

export const useSignupStore = create<SignupState>()(
  persist(
    (set) => ({
      formData: initialFormData,

      setSignupToken: (signupToken) =>
        set((state) => ({
          formData: { ...state.formData, signupToken },
        })),

      reset: () => set({ formData: initialFormData }),
    }),
    {
      name: 'plan-signup-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ formData: state.formData }),
    }
  )
)
