export interface CreatePlatformInput{
    platformName: string;
    platformUrl: string;
}

export interface PlatformPayload {
    _id: string;
    platformUrl: string;
    description: string;
    platformName: string;
    platformLogo: string;
    platformTitle: string;
}