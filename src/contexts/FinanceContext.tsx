
import React, { createContext, useContext } from "react";
import { FinanceContextType } from "./types";
import { useFinanceState } from "@/hooks/finance/useFinanceState";
import { useFinanceActions } from "@/hooks/finance/useFinanceActions";

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { state, dispatch } = useFinanceState();
  const actions = useFinanceActions(dispatch);

  return (
    <FinanceContext.Provider
      value={{
        state,
        ...actions
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance חייב להיות בתוך FinanceProvider");
  }
  return context;
};
