export type TDevelopers = {
    id: number;
    name: string;
    email: string;
};

export type TDevelopersInfo = {
    id: number;
    developerSince: Date;
    preferredOS: "Windows" | "Linux" | "MacOs";
    developerId: number;
};

export type TDevelopersReq = Omit<TDevelopers, "id">;

export type TDeveloperDataType = Partial<TDevelopersReq>;

export type TDevelopersInfoReq = Omit<TDevelopersInfo, "id">;
