import React, { useState, useEffect, useRef } from 'react';

import { Clock, RotateCcw, CheckCircle2, Plus, Bus, UserPlus, Users2, ArrowUpRight, ArrowUpRightFromCircle, ArrowRight, CalendarSearch, Award, Pyramid, ArrowRightLeft, User, UserX, PersonStanding, Mailbox, Mail, Cog, AtSign, Shapes, Tag, Zap, AwardIcon, CalendarClock, UserCheck } from 'lucide-react';
import { apiService } from '@/service/apiservice';

// import ApiService from '@/services/api/apiService';

interface ButtonOption {
  value: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface AddisExpandButtonProps {
  onSelect: (statusId: string | null) => void;
  endpoint?: string;
  port?: number;
  optionsMapping?: {
    value: string;
    label: string;
  };
  statusId?: string;
  buttonOptions?: ButtonOption[];
  icon?: string;

  allowDeselect?: boolean;
  statusCounts?: Record<string, number>;

  isExpand?: boolean;
}

const AddisExpandButton: React.FC<AddisExpandButtonProps> = ({
  onSelect,
  endpoint,
  optionsMapping = { value: 'id', label: 'name' },
  statusId,
  port = 5000,
  buttonOptions,
  allowDeselect = true,
  statusCounts = {},

  isExpand = true,

  icon,

}) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null); // default to "Pending"
  const [data, setData] = useState<ButtonOption[]>([]);
  // Add apiCache ref
  const apiCache = useRef<Record<string, ButtonOption[]>>({});

  // Modify the setupData function to merge statusCounts with fetched data
  useEffect(() => {
    const setupData = async () => {
      let resultData: ButtonOption[] = [];

      // If buttonOptions are provided directly, use those
      if (buttonOptions && buttonOptions.length > 0) {
        resultData = [...buttonOptions];
      }
      // Otherwise fetch from API if endpoint is provided
      else if (endpoint) {
        // Generate cache key based on endpoint and port
        const cacheKey = `${endpoint}_${port}`;

        // Check if we have cached data
        if (apiCache?.current[cacheKey]) {
          resultData = [...apiCache.current[cacheKey]];
        } else {
          try {
            const url = endpoint;
            const response: any = await apiService.get(url, port);
            const fetchedOptions = (response?.data || [])
              ?.filter((item: any) => item.isActive === true)
              ?.map((item: any) => ({
                value: item[optionsMapping.value]?.toString(),
                label: item[optionsMapping.label],
                count: item.count || 0,
              }));

            // Store in cache
            apiCache.current[cacheKey] = fetchedOptions;
            resultData = [...fetchedOptions];
          } catch (error) {
            console.error('Error fetching options:', error);
          }
        }
      }


      // Update counts from statusCounts prop if provided
      if (Object.keys(statusCounts).length > 0) {
        resultData = resultData.map(item => ({
          ...item,
          // If a count exists for this label in statusCounts, use it, otherwise keep existing count
          count: statusCounts[item.label] !== undefined ? statusCounts[item.label] : item.count
        }));
      }

      setData(resultData);
    };

    setupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // useEffect(() => {
  //   if (!statusId) {
  //     const pendingOption = data.find(item => item.label === "Pending");
  //     if (pendingOption) {
  //       setActiveButton(pendingOption.label);
  //       onSelect(pendingOption.value);
  //     }
  //   } else {
  //     const activeOption = data.find(item => item.value === statusId);
  //     if (activeOption) {
  //       setActiveButton(activeOption.label);
  //     }
  //   }
  // }, [statusId, data, onSelect]);


  useEffect(() => {
    // Set active button based on statusId
    if (statusId) {
      const activeOption = data.find(item => item.value === statusId);
      if (activeOption) {
        setActiveButton(activeOption.label);
      }
    }
  }, [statusId, data]);

  const handleStatusFilter = (status: string, id: string) => {
    // Check if this button is already active and deselection is allowed
    if (activeButton === status && allowDeselect) {
      // Deselect the button
      setActiveButton(null);

      // Call the onSelect handler with null to indicate deselection
      onSelect(null);
    } else {
      // Set active status for styling
      setActiveButton(status);

      // Call the onSelect handler with the selected id
      onSelect(id);
    }
  };

  // Function to get the icon component based on status label
  const getIconComponent = (statusLabel: string): React.ReactNode => {
    switch (statusLabel) {
      case 'Pending':
        return <Clock className="w-5 h-5" />;
        // return <Clock className='w-5 h-5' />;
      case 'Return':
        return <RotateCcw className="w-5 h-5" />;
      case 'Completed':
        return <RotateCcw className='w-5 h-5' />;
      case 'Add New':
        return <Plus className='w-5 h-5' />;
      case 'Complete':
        return <CheckCircle2 className="w-5 h-5" />;
      // case 'Complete':
      //   return <CheckCircle2 className='w-5 h-5' />;
      case 'Travel Expenses':
        return <Bus className='w-5 h-5' />
      case 'New Job Role':
        return <Plus className='w-5 h-5' />
      case 'New Employee':
        return <UserPlus className='w-5 h-5' />
      case 'Recruitment':
        return <CalendarSearch className='w-5 h-5' />
      case 'Training':
        return <Award className='w-5 h-5' />
      case 'Hierarchy':
        return <Pyramid className='w-5 h-5' />
      case 'Transfer':
        return <ArrowRightLeft className='w-5 h-5' />
      case 'Dormant Partners':
        return <User className='w-5 h-5' />
      case 'In Active Partners':
        return <UserX className='w-5 h-5' />
      case 'Expired Partners':
        return <Clock className='w-5 h-5' />
      case 'Mail Room':
        return <Mail className='w-5 h-5' />;
      case 'Data Processing ':
        return <Cog className='w-5 h-5' />;
      case 'Email Correspondence':
        return <AtSign className='w-5 h-5' />;
      case 'Data Validation':
        return <RotateCcw className='w-5 h-5' />;
      case 'Blessing plan':
        return <Shapes className='w-5 h-5' />;
      case 'Letter Correspondence':
        return <Mailbox className='w-5 h-5' />;
      case 'Letters':
        return <Mail className='w-5 h-5' />;
      case 'Label':
        return <Tag className='w-5 h-5' />;
      case 'On Demand':
        return <Zap className='w-5 h-5' />;
      case 'Certificates':
        return <AwardIcon className='w-5 h-5' />;
      case 'Occasional Work':
        return <CalendarClock className='w-5 h-5' />;
      case 'Add Location':
        return <Plus className='w-5 h-5' />;
      case 'Selected':
        return <UserCheck className='w-5 h-5' />;
      case 'Rjeected':
        return <UserX className='w-5 h-5' />;
      case 'Applicant Status':
        return <User className='w-5 h-5' />;
      case 'Job Application Status':
        return <User className='w-5 h-5' />;
      case 'Exit Status':
        return <User className='w-5 h-5' />;
      case 'Shortlisted':
        return <UserCheck className='w-5 h-5' />;
      case 'WorkflowTemple':
        return <UserCheck className='w-5 h-5' />;

      default:
        return "null";
        return <PersonStanding className='w-5 h-5' />
    }
  };

  return (
    <div className='flex flex-row gap-4'>
      {data.map((item: ButtonOption) => {
        const key = item.label;
        const iconElement = item.icon || getIconComponent(item.label);

        return (
          <div
            key={item.value}
            className='relative group cursor-pointer'
            onMouseEnter={() => isExpand && setHoveredButton(key)}
            onMouseLeave={() => isExpand && setHoveredButton(null)}
            onClick={() => handleStatusFilter(key, item.value)}
          >
            <div
              className={`relative flex items-center transition-all duration-300 ease-in-out ${isExpand
                ? (hoveredButton === key || activeButton === key)
                  ? 'bg-white shadow-md rounded-full pr-4'
                  : 'bg-transparent'
                : 'bg-white shadow-lg rounded-full pr-4'
                }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${activeButton === key
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg scale-105'
                  : isExpand
                    ? hoveredButton === key
                      ? 'bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 scale-110'
                      : 'bg-gradient-to-br from-white to-gray-50 text-gray-600 hover:from-purple-50 hover:to-indigo-50'
                    : 'bg-gradient-to-br from-purple-300 to-indigo-50 text-purple-600 shadow-md'
                  }`}
              >
                {item.icon || getIconComponent(item.label)}
              </div>

              {(!isExpand || hoveredButton === key || activeButton === key) && (
                <span
                  className={`ml-2 text-sm font-medium whitespace-nowrap transition-all duration-300 ${activeButton === key
                    ? 'text-purple-800 font-semibold'
                    : isExpand
                      ? 'text-gray-800'
                      : 'text-purple-700'
                    }`}
                >
                  {key}{' '}
                  {statusCounts && statusCounts[key] !== undefined
                    ? `(${statusCounts[key]})`
                    : item.count !== undefined
                      ? ``
                      : ''}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AddisExpandButton;