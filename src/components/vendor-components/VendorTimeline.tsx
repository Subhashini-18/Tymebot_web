import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Shield, Award, FileText, AlertTriangle } from 'lucide-react';
import { useFormContext } from '../../context/FormContext';
import RenderFullScreenTimeline from './RenderFullScreenTimeline';


interface TimelineItem {
    date: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}
interface TimelineItemProps extends TimelineItem {
    isLeft: boolean;
    index: number;
}

const generateTimelineItems = (formData: any) => [
    {
        date: '1st Party',
        title: formData?.thirdPartyLegalName || 'N/A',
        description: `${formData?.countryOfOperations || 'Unknown Location'} - Primary Service Provider`,
        icon: <Shield className="w-6 h-6" />,
        color: '#3B82F6'
    },
    {
        date: '2nd Party',
        title: 'DataSecure Solutions',
        description: 'Cloud Infrastructure Provider',
        icon: <Award className="w-6 h-6" />,
        color: '#10B981'
    },
    {
        date: '3rd Party',
        title: 'GlobalTrust Services',
        description: 'Security Compliance Partner',
        icon: <FileText className="w-6 h-6" />,
        color: '#8B5CF6'
    },
    {
        date: '4th Party',
        title: 'CyberGuard Analytics',
        description: 'Security Monitoring Services',
        icon: <AlertTriangle className="w-6 h-6" />,
        color: '#F59E0B'
    }
];

const TimelineItem = ({ date, title, description, icon, color, isLeft, index }: TimelineItemProps) => {
    const variants = {
        hidden: {
            opacity: 0,
            x: isLeft ? -50 : 50
        },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                delay: index * 0.2
            }
        }
    };

    return (
        <div className="relative flex items-center justify-between w-full !mt-0">
            {/* Left side empty space or content */}
            <div className={`w-[45%] pr-8 text-right ${!isLeft && 'invisible'} mb-0`}>
                {isLeft && (
                    <motion.div
                        variants={variants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <span className="text-2xl font-bold block mb-2" style={{ color }}>
                            {date}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
                        <p className="text-gray-600 text-sm">{description}</p>
                    </motion.div>
                )}
            </div>

            {/* Center Icon */}
            <div className="relative flex items-center justify-center w-[10%] mt-0">
                <div className="h-full absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-200" />
                <motion.div
                    className="relative z-10"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.2 }}
                >
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: color }}
                    >
                        <div className="text-white">{icon}</div>
                    </div>
                </motion.div>
            </div>

            {/* Right side empty space or content */}
            <div className={`w-[45%] pl-8 text-left ${isLeft && 'invisible'}`}>
                {!isLeft && (
                    <motion.div
                        variants={variants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <span className="text-2xl font-bold block mb-2" style={{ color }}>
                            {date}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
                        <p className="text-gray-600 text-sm">{description}</p>
                    </motion.div>
                )}
            </div>
        </div>
    )
};



export default function VendorTimeline() {
    const { formData }: any = useFormContext();
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [expandedYear, setExpandedYear] = useState<string | null>(null);

    const timelineItems = generateTimelineItems(formData);

    const toggleFullScreen = () => setIsFullScreen(!isFullScreen);
    const toggleYearExpand = (year: string) => {
        setExpandedYear(expandedYear === year ? null : year);
    };

    const renderTimeline = () => (
        <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200" />
            <div className="space-y-24">
                {timelineItems.map((item, index) => (
                    <TimelineItem
                        key={item.date}
                        {...item}
                        isLeft={index % 2 === 0}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <>
            {!isFullScreen ? (
                <div className="mt-8 p-8 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold">Vendor Hierarchy</h2>
                        <button
                            onClick={toggleFullScreen}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <Maximize2 className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                    {renderTimeline()}
                </div>
            ) : (
                <RenderFullScreenTimeline
                    timelineItems={timelineItems}
                    expandedYear={expandedYear}
                    setIsFullScreen={setIsFullScreen}
                    toggleYearExpand={toggleYearExpand}
                />
            )}
        </>
    );
}
