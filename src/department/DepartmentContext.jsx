import { createContext, useContext, useMemo } from "react";
import { DEPTS } from "../data/departments";
import { buildDepartmentPath, normalizeDeptKey } from "./paths";

const DepartmentContext = createContext(null);

export function DepartmentProvider({ deptName, children }) {
  const deptKey = normalizeDeptKey(deptName);
  const deptInfo = DEPTS[deptKey];

  const value = useMemo(
    () => ({
      deptKey,
      deptInfo,
      deptName: deptInfo?.name || deptKey.toUpperCase(),
      deptPath: (path = "") => buildDepartmentPath(deptKey, path),
    }),
    [deptInfo, deptKey],
  );

  return (
    <DepartmentContext.Provider value={value}>
      {children}
    </DepartmentContext.Provider>
  );
}

export function useDepartment() {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error("useDepartment must be used within DepartmentProvider");
  }
  return context;
}
