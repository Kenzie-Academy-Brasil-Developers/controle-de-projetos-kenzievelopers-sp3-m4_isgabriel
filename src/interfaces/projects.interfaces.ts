export type TProject = {
    id: number;
    name: string;
    description: string;
    estimatedTime: string;
    repository: string;
    startDate: Date;
    endDate: Date | null;
    developerId: number | null;
};

export type TProjectTechs = {
    id: number;
    addedIn: Date;
    projectId: number;
    technologyId: number;
};

export type TTechnologies = {
    id: number;
    name: string;
};

export type TProjectReq = Omit<TProject, "id">;

export type TProjectData = Partial<TProject>;

export type TProjectTechsReq = Omit<TProjectTechs, "id">;

export type TProjectDataType = Partial<TProjectReq>;
