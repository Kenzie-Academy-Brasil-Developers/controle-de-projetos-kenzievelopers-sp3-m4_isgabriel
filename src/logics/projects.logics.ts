import { Request, Response } from "express";
import format from "pg-format";
import { QueryConfig, QueryResult } from "pg";
import { client } from "../database";
import {
    TProject,
    TProjectData,
    TProjectDataType,
    TProjectTechs,
    TProjectTechsReq,
    TTechnologies,
} from "../interfaces/projects.interfaces";

export const createProject = async (
    request: Request,
    response: Response
): Promise<Response> => {
    const projectData: TProjectDataType = request.body;

    const queryString: string = format(
        `
    INSERT INTO projects
        (%I)
    VALUES 
        (%L)
    RETURNING *; 
    `,
        Object.keys(projectData),
        Object.values(projectData)
    );

    const queryResult: QueryResult<TProject> = await client.query(queryString);

    return response.status(201).json(queryResult.rows[0]);
};

export const searchProjectById = async (
    request: Request,
    response: Response
): Promise<Response> => {
    const id: number = parseInt(request.params.id);

    const queryString: string = `
        SELECT
            p."id" AS "projectId",
            p."name" AS "projectName",
            p."description" AS "projectDescription",
            p."estimatedTime" AS "projectEstimatedTime",
            p."repository" AS "projectRepository",
            p."startDate" AS"projectStartDate",
            p."endDate" AS "projectEndDate",
            p."developerId" AS "projectDeveloperId",
            t."id" AS "technologyId",
            t."name" AS "technologyName"
        FROM
            projects p
        FULL JOIN 
            projects_technologies pt ON pt."projectId" = p."id"
        FULL JOIN 
            technologies t ON t."id" = pt."technologyId"
        WHERE
            p."id" = $1;
    `;

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id],
    };

    const queryResult: QueryResult = await client.query(queryConfig);

    return response.status(200).json(queryResult.rows);
};

export const updateProject = async (
    request: Request,
    response: Response
): Promise<Response> => {
    const id: number = parseInt(request.params.id);
    const newDataProject: TProjectData = request.body;

    if (newDataProject.id) {
        delete newDataProject.id;
    }

    const updateColumns = Object.keys(newDataProject);
    const updateValues = Object.values(newDataProject);

    const queryString: string = format(
        `
        UPDATE
            projects
            SET(%I) = ROW(%L)
        WHERE
            "id" = $1
        RETURNING *;
    `,
        updateColumns,
        updateValues
    );

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id],
    };

    const queryResult: QueryResult<TProject> = await client.query(queryConfig);

    return response.status(200).json(queryResult.rows[0]);
};

export const deleteProject = async (
    request: Request,
    response: Response
): Promise<Response> => {
    const id: number = parseInt(request.params.id);

    const querySting: string = `
    DELETE FROM
        projects
    WHERE
        id =$1;    
    `;

    const queryconfig: QueryConfig = {
        text: querySting,
        values: [id],
    };

    await client.query(queryconfig);

    return response.status(204).send();
};

export const createTechsByProject = async (
    request: Request,
    response: Response
): Promise<Response> => {
    const id: number = parseInt(request.params.id);
    const techData: TTechnologies = response.locals.technology;

    const currentDate: Date = new Date();

    const techDataReq: TProjectTechsReq = {
        addedIn: currentDate,
        projectId: id,
        technologyId: techData.id,
    };

    const queryStringCheck: string = `
        SELECT * FROM
            projects_technologies
        WHERE
            "projectId" = $1 AND
            "technologyId" = $2;
    
    `;

    const queryConfigData: QueryConfig = {
        text: queryStringCheck,
        values: [techDataReq.projectId, techDataReq.technologyId],
    };

    const queryResultData: QueryResult<TProjectTechs> = await client.query(
        queryConfigData
    );

    if (queryResultData.rowCount > 0) {
        return response.status(409).json({
            message: "This technology is already associated with the project",
        });
    }

    const queryStringInsert: string = format(
        `
    INSERT INTO
        projects_technologies (%I)
    VALUES
        (%L);
    `,
        Object.keys(techDataReq),
        Object.values(techDataReq)
    );

    await client.query(queryStringInsert);

    const queryStringSelect: string = `
        SELECT
			t."id" AS "technologyId",
            t."name" AS "technologyName",
            p."id" AS "projectId",
            p."name" AS "projectName",
            p."description" AS "projectDescription",
            p."estimatedTime" AS "projectEstimatedTime",
            p."repository" AS "projectRepository",
            p."startDate" AS"projectStartDate",
            p."endDate" AS "projectEndDate"
        FROM
            projects p
        FULL JOIN 
            projects_technologies pt ON pt."projectId" = p."id"
        FULL JOIN 
            technologies t ON t."id" = pt."technologyId"
        WHERE
            p."id" = $1
        ;
    
    `;

    const queryConfigSelect: QueryConfig = {
        text: queryStringSelect,
        values: [id],
    };

    const queryResultSelect: QueryResult = await client.query(
        queryConfigSelect
    );

    return response.status(201).json(queryResultSelect.rows[0]);
};

export const deleteTechsByProject = async (
    request: Request,
    response: Response
): Promise<Response> => {
    const projectId: number = parseInt(request.params.id);
    const technologyId: number = parseInt(response.locals.technology.id);

    const queryString: string = `
    DELETE FROM
        projects_technologies
    WHERE
        "projectId" = $1 AND
        "technologyId" = $2;
    `;

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [projectId, technologyId],
    };

    await client.query(queryConfig);

    return response.status(204).send();
};
