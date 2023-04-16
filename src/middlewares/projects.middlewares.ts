import { QueryConfig, QueryResult } from "pg";
import { NextFunction, Request, Response } from "express";
import { client } from "../database";
import { TProject, TTechnologies } from "../interfaces/projects.interfaces";

export const ensureProjectExists = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<Response | void> => {
    let id: number = parseInt(request.params.id);

    if (request.route.path === "/projects" && request.method === "POST") {
        id = request.body.projectId;
    }

    const queryString: string = `
        SELECT * FROM
            projects
        WHERE
            "id" = $1;
    `;

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id],
    };

    const queryResult: QueryResult<TProject> = await client.query(queryConfig);

    if (queryResult.rowCount === 0) {
        return response.status(404).json({
            message: "Project not found.",
        });
    }

    response.locals.project = queryResult.rows[0];

    return next();
};

export const ensureTechsExists = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<Response | void> => {
    let technologyName: string = request.body.name;

    if (request.method === "DELETE") {
        technologyName = request.params.name;
    }

    const queryString: string = `
    SELECT * FROM
        technologies
    WHERE 
        "name" = $1;
    `;

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [technologyName],
    };

    const queryResult: QueryResult<TTechnologies> = await client.query(
        queryConfig
    );

    if (queryResult.rowCount === 0) {
        return response.status(400).json({
            message: "Technology not supported.",
            options: [
                "JavaScript",
                "Python",
                "React",
                "Express.js",
                "HTML",
                "CSS",
                "Django",
                "PostgreSQL",
                "MongoDB",
            ],
        });
    }

    response.locals.technology = queryResult.rows[0];

    return next();
};

export const ensureProjectTechNameExist = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<Response | void> => {
    const projectId: number = parseInt(request.params.id);
    const technologiesId: number = parseInt(response.locals.technology.id);

    const queryString: string = `
    SELECT * FROM
        projects_technologies
    WHERE 
        "projectId" = $1 AND
        "technologyId" = $2;
    `;

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [projectId, technologiesId],
    };

    const queryResult: QueryResult<TTechnologies> = await client.query(
        queryConfig
    );

    if (queryResult.rowCount === 0) {
        return response.status(400).json({
            message: "Technology not related to the project.",
        });
    }

    return next();
};
