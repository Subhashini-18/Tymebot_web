import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  User,
  ChevronDown,
  ChevronUp,
  Home,
  Building,
  BookOpen,
  UserCheck,
  Activity,
  Bell,
  HelpCircle,
  Settings,
  BookTemplate,
  Users,
  Shield,
  CheckCircle,
  Calendar,
  UserPlus,
  Zap,
  BarChart3,
  FileText,
  ThumbsUp,
  ClipboardCheck,
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchMenu, clearMenu } from "../store/slice/menuSlice";
import { clearAuthData, getAuthData } from "../utils/auth";
// import { getMenuDataByType } from "../rbac/overallMenuData";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Home,
  Building,
  BookOpen,
  UserCheck,
  Activity,
  Bell,
  HelpCircle,
  Settings,
  BookTemplate,
  Users,
  Shield,
  CheckCircle,
  Calendar,
  UserPlus,
  Zap,
  BarChart3,
  FileText,
  User, // fallback
  ThumbsUp,
  ClipboardCheck,
};

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const [activeMenuItem, setActiveMenuItem] = useState<number | null>(null);
  const [activeSubMenuItem, setActiveSubMenuItem] = useState<number | null>(
    null
  );
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mockMenuData, setMockMenuData] = useState<any[]>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const menuState: any = useAppSelector((state) => state.menuData);
  const roleName = getAuthData().roleName;
  console.log(menuState?.overAll?.data);

  // Load user data and set initial state
  useEffect(() => {
    const loadUserData = () => {
      try {
        // setIsLoading(true);
        const authData = localStorage.getItem("authData");
        console.log(authData);
        if (authData) {
          const userData = JSON.parse(authData);
          console.log(userData);
          setUserProfile(userData);

          // Fetch menu from backend
          dispatch(fetchMenu(userData.roleName));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
    // Clear menu on unmount
    return () => {
      dispatch(clearMenu());
    };
    // eslint-disable-next-line
  }, []);

  // Update mockMenuData when menuState changes
  useEffect(() => {
    if (menuState.loading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
      // Handle new menuState structure
      if (menuState?.overAll && typeof menuState?.overAll === "object") {
        // alert('I AM In')
        // Determine user role
        // const role = userProfile?.role?.toLowerCase();
        // // Find the menu for the current role
        // const menuObj = menuState.overAll.data.menu.find(
        //   (m: any) => m.type === role
        // );
        // console.log(menuObj)
        // alert("I AM In")
        if (menuState.overAll) {
          // Map icon string to Lucide component
          const processedMenu = menuState?.overAll?.data?.menu?.map(
            (item: any) => ({
              ...item,
              icon: ICON_MAP[item.icon] || User,
              subMenu: Array.isArray(item?.subMenu)
                ? item?.subMenu?.map((sub: any) => ({
                    ...sub,
                  }))
                : [],
            })
          );
          console.log(processedMenu);
          setMockMenuData(processedMenu);
        } else {
          setMockMenuData([]);
        }
      } else {
        setMockMenuData([]);
      }
    }
    // eslint-disable-next-line
  }, [menuState, userProfile]);

  // Set active menu based on current path
  useEffect(() => {
    if (!isLoading) {
      const currentPath = location.pathname;
      let foundMatch = false;

      // Check sub-menus first
      mockMenuData?.forEach((menuItem, menuIndex) => {
        if (menuItem.subMenu?.length > 0) {
          const subMenuIndex = menuItem.subMenu.findIndex(
            (subItem: any) => subItem.path === currentPath
          );

          if (subMenuIndex !== -1) {
            setActiveMenuItem(menuIndex);
            setActiveMenu(menuItem.label);
            setActiveSubMenuItem(subMenuIndex);
            foundMatch = true;
          }
        }
      });

      // If no sub-menu match, check main menu
      if (!foundMatch) {
        const mainMenuIndex = mockMenuData?.findIndex(
          (item: any) => item?.path === currentPath
        );

        if (mainMenuIndex !== -1) {
          setActiveMenuItem(mainMenuIndex);
          setActiveMenu(null);
          setActiveSubMenuItem(null);
        }
      }
    }
  }, [location.pathname, isLoading, mockMenuData]);

  const handleMenuClick = (item: any, index: number) => {
    setActiveMenuItem(index);

    // If sidebar is collapsed and menu has submenus, expand the sidebar first
    if (!isCollapsed && item.subMenu?.length > 0) {
      setActiveMenu(activeMenu === item.label ? null : item.label);
      return;
    }

    if (isCollapsed && item.subMenu?.length > 0) {
      onToggle();
      setTimeout(() => {
        setActiveMenu(item.label);
      }, 300);
      return;
    }

    if (item.subMenu?.length > 0) {
      setActiveMenu(activeMenu === item.label ? null : item.label);
    } else {
      if (!item.isActive) {
        showToast({
          message: "This feature is coming soon!",
          type: "info",
        });
        return;
      }

      if (item.path) {
        navigate(item.path);
        setActiveMenu(null);
      }
    }
  };

  const handleSubMenuClick = (subItem: any, subIndex: number) => {
    setActiveSubMenuItem(subIndex);

    if (!subItem.isActive) {
      showToast({
        message: "This feature is coming soon!",
        type: "info",
      });
      return;
    }

    if (subItem.path) {
      navigate(subItem.path);
    }
  };

  const handleLogout = () => {
    clearAuthData();
    showToast({
      message: "Successfully logged out",
      type: "success",
    });
    navigate("/login");
    setShowLogoutDialog(false);
  };

  const LogoutDialog = () =>
    showLogoutDialog && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Confirm Logout
          </h3>
          <p className="text-gray-600 mb-4">Are you sure you want to logout?</p>
          <div className="flex space-x-3">
            <button
              onClick={handleLogout}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
            <button
              onClick={() => setShowLogoutDialog(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );

  if (isLoading) {
    return (
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01443B]"></div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`${
          isCollapsed ? "w-18" : "w-80"
        } bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col h-screen relative`}
      >
        {/* Header */}
        <div className="px-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex justify-start items-center space-x-1 w-full">
                <img
                  src="/src/assets/images/Frame 121.png"
                  alt="Tymebot Logo"
                  className="h-17 w-[100%] object-cover"
                  draggable={false}
                  onClick={onToggle}
                />
                <div className="">
                  {/* <img
                  src="/images/G3_sec_ai_logo.png"
                  alt="G3 SEC.AI Logo"
                  className="h-10 w-full object-cover"
                  draggable={false}
                  onClick={onToggle}
                /> */}
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="flex justify-center w-full">
                <img
                  src="/src/assets/images/tymebot_logo.png"
                  alt="G3 SEC.AI Logo"
                  className="h-10 w-10 object-contain"
                  draggable={false}
                  onClick={onToggle}
                />
              </div>
            )}
            {/* <button
              onClick={onToggle}
              className="absolute right-2 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-600 hidden" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-gray-600 " />
              )}
            </button> */}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <div className="px-2 space-y-1">
            {mockMenuData?.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeMenuItem === index;
              const hasSubMenu = item.subMenu && item.subMenu.length > 0;
              const isMenuExpanded = activeMenu === item.label;

              return (
                <div key={item.id}>
                  {/* Main Menu Item */}
                  <button
                    onClick={() => handleMenuClick(item, index)}
                    className={`w-full flex justify-center items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive && !hasSubMenu
                        ? "bg-[#01443B] text-white shadow-lg"
                        : item.isActive
                        ? "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-500 cursor-not-allowed"
                    } `}
                    disabled={!item.isActive && !hasSubMenu}
                  >
                    <Icon
                      className={`${
                        isCollapsed ? "h-5 w-5" : "h-5 w-5 mr-3"
                      } flex-shrink-0 `}
                    />
                    {!isCollapsed && (
                      <>
                        <span className={`truncate flex-1 text-left `}>
                          {item.label}
                        </span>
                        {hasSubMenu && (
                          <div className="ml-auto">
                            {isMenuExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        )}
                        {!item.isActive && !hasSubMenu && (
                          <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                            Soon
                          </span>
                        )}
                      </>
                    )}
                  </button>

                  {/* Sub Menu Items */}
                  {hasSubMenu && isMenuExpanded && !isCollapsed && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.subMenu.map((subItem: any, subIndex: number) => {
                        const isSubActive =
                          activeSubMenuItem === subIndex &&
                          activeMenuItem === index;
                        const isCurrentPath =
                          location.pathname === subItem.path;

                        return (
                          <button
                            key={subItem.id}
                            onClick={() =>
                              handleSubMenuClick(subItem, subIndex)
                            }
                            className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                              isCurrentPath
                                ? "bg-[#01443B] text-white"
                                : subItem.isActive
                                ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                : "text-gray-400 hover:bg-gray-50 hover:text-gray-500 cursor-not-allowed"
                            }`}
                            disabled={!subItem.isActive}
                          >
                            <div className="w-2 h-2 rounded-full bg-current mr-3 flex-shrink-0"></div>
                            <span className="truncate flex-1 text-left">
                              {subItem.label}
                            </span>
                            {!subItem.isActive && (
                              <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                Soon
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-gray-200 p-4">
          {userProfile && (
            <div className="space-y-3">
              {!isCollapsed && (
                <button
                  onClick={() => navigate("/client-profile")}
                  className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg w-full hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="Open client profile"
                >
                  <div className="flex-shrink-0">
                    {userProfile?.clientLogoUrl ? (
                      <img
                        src={userProfile.clientLogoUrl}
                        alt={userProfile.clientName || "Client Logo"}
                        className="h-10 w-10 rounded-full object-cover border border-gray-200 shadow"
                        onError={(e) => {
                          // fallback to initials if image fails
                          (e.target as HTMLImageElement).style.display = "none";
                          const parent = (e.target as HTMLImageElement)
                            .parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class='h-10 w-10 bg-gradient-to-br from-[#01443B] to-[#09B591] rounded-full flex items-center justify-center text-white font-bold text-lg'>
                          ${
                            (userProfile?.clientName ||
                              userProfile?.name ||
                              "U")[0]
                          }
                             </div>`;
                          }
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gradient-to-br from-[#01443B] to-[#09B591] rounded-full flex items-center justify-center">
                        {/* Show initials if available, else fallback to icon */}
                        <span className="text-white font-bold text-lg">
                          {(userProfile?.clientName ||
                            userProfile?.name ||
                            "")[0] || <User className="h-5 w-5 text-white" />}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userProfile.email}
                    </p>
                    <p className="text-xs text-gray-500">{roleName}</p>
                  </div>
                </button>
              )}
              <button
                onClick={() => setShowLogoutDialog(true)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors ${
                  isCollapsed ? "justify-center" : ""
                }`}
              >
                <LogOut
                  className={`${
                    isCollapsed ? "h-5 w-5" : "h-5 w-5 mr-3"
                  } flex-shrink-0`}
                />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutDialog />
    </>
  );
};

export default Sidebar;

// interface SidebarProps {
//   isCollapsed: boolean;
//   onToggle: () => void;
// }

//

// export default Sidebar;

// interface SidebarProps {
//   isCollapsed: boolean;
//   onToggle: () => void;
// }

//

// export default Sidebar;
