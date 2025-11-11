// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import ApiService from '@/services/api/apiService';
// // Define the shape of a UI control item
// interface UIControlItem {
//   id: number;
//   type: string;
//   status: string;
//   isActive: boolean;
//   auditTrailId: string;
//   moduleId: number;
//   controlName: string;
//   controlKey: string;
//   createdAt: string;
//   updatedAt: string;
// }

// // Define the shape of the context
// interface UIControlsContextType {
//   uiControls: UIControlItem[];
//   isLoading: boolean;
//   error: string | null;
//   hasAccess: (controlKey: string) => boolean;
// }

// // Create the context with default values
// const UIControlsContext = createContext<UIControlsContextType>({
//   uiControls: [],
//   isLoading: false,
//   error: null,
//   hasAccess: () => false
// });

// // Provider component
// interface UIControlsProviderProps {
//   children: ReactNode;
//   userId: number; // or string, depending on your user ID type
// }

// export const UIControlsProvider: React.FC<UIControlsProviderProps> = ({ children, userId }): React.ReactElement => {
//   const [uiControls, setUIControls] = useState<UIControlItem[]>([]);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchUIControls = async () => {
//       try {
//         setIsLoading(true);
//         const response = await ApiService.get(
//           `http://172.17.17.41:4000/api/v1/user-ui-control/accessible-ui-controls/${userId}`
//         );
        
//         if ((response as any).success && Array.isArray((response as any).data)) {
//           setUIControls((response as any).data);
//         } else {
//           setError('Failed to fetch UI controls data');
//         }
//       } catch (err) {
//         setError('An error occurred while fetching UI controls');
//         console.error(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (userId) {
//       fetchUIControls();
//     }
//   }, [userId]);

//   // Function to check if a specific control key exists in the uiControls array
//   const hasAccess = (controlKey: string): boolean => {
//     return uiControls.some(control => control.controlKey === controlKey);
//   };

//   return (
//     <UIControlsContext.Provider value={{ uiControls, isLoading, error, hasAccess }}>
//       {children}
//     </UIControlsContext.Provider>
//   );
// }

// // Custom hook for using the UIControls context
// export const useUIControls = (): UIControlsContextType => {
//   const context = useContext(UIControlsContext);
//   if (context === undefined) {
//     throw new Error('useUIControls must be used within a UIControlsProvider');
//   }
//   return context;
// };