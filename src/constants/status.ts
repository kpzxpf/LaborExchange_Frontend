export const APPLICATION_STATUS = {
    NEW: "Новая",
    REJECTED: "Отклонена",
    WITHDRAWN: "Отозвана",
} as const;

export type ApplicationStatusValue = typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS];

export const getStatusColor = (status: string): string => {
    switch (status) {
        case APPLICATION_STATUS.NEW:
            return "blue";
        case APPLICATION_STATUS.REJECTED:
            return "red";
        case APPLICATION_STATUS.WITHDRAWN:
            return "gray";
        default:
            return "gray";
    }
};

export const getStatusBadgeClasses = (status: string): string => {
    switch (status) {
        case APPLICATION_STATUS.NEW:
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
        case APPLICATION_STATUS.REJECTED:
            return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
        case APPLICATION_STATUS.WITHDRAWN:
            return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400";
    }
};

export const getStatusIcon = (status: string): string => {
    switch (status) {
        case APPLICATION_STATUS.NEW:
            return "🕐";
        case APPLICATION_STATUS.REJECTED:
            return "❌";
        case APPLICATION_STATUS.WITHDRAWN:
            return "↩️";
        default:
            return "❓";
    }
};
