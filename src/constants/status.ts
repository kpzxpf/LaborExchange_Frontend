export const APPLICATION_STATUS = {
    NEW: "NEW",
    ACCEPTED: "ACCEPTED",
    REJECTED: "REJECTED",
    WITHDRAWN: "WITHDRAWN",
} as const;

export const STATUS_LABELS: Record<string, string> = {
    NEW: "На рассмотрении",
    ACCEPTED: "Принято",
    REJECTED: "Отклонено",
    WITHDRAWN: "Отозвано",
};

export type ApplicationStatusValue = typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS];

export const getStatusColor = (status: string): string => {
    switch (status) {
        case APPLICATION_STATUS.NEW:      return "indigo";
        case APPLICATION_STATUS.ACCEPTED: return "emerald";
        case APPLICATION_STATUS.REJECTED: return "red";
        case APPLICATION_STATUS.WITHDRAWN: return "slate";
        default:                          return "slate";
    }
};

// Returns the badge modifier class (combine with "badge" base)
export const getStatusBadgeClasses = (status: string): string => {
    switch (status) {
        case APPLICATION_STATUS.NEW:      return "badge badge-indigo";
        case APPLICATION_STATUS.ACCEPTED: return "badge badge-emerald";
        case APPLICATION_STATUS.REJECTED: return "badge badge-red";
        case APPLICATION_STATUS.WITHDRAWN: return "badge badge-slate";
        default:                          return "badge badge-slate";
    }
};

export const getStatusIcon = (status: string): string => {
    switch (status) {
        case APPLICATION_STATUS.NEW:      return "🕐";
        case APPLICATION_STATUS.ACCEPTED: return "✅";
        case APPLICATION_STATUS.REJECTED: return "❌";
        case APPLICATION_STATUS.WITHDRAWN: return "↩️";
        default:                          return "❓";
    }
};

export const getStatusLabel = (status: string): string => {
    return STATUS_LABELS[status] ?? status;
};
