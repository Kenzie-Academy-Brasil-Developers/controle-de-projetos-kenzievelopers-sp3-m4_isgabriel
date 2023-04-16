import { NextFunction, Request, Response } from "express";
import {
    TDevelopers,
    TDevelopersInfo,
    TDevelopersReq,
} from "../interfaces/developers.interfaces";
import { QueryConfig, QueryResult } from "pg";
import { client } from "../database";

export const ensureEmailExists = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<Response | void> => {
    const emailData: TDevelopersReq = request.body.email;

    const queryString: string = `
    SELECT * FROM
        developers
    WHERE
        email = $1;
    `;

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [emailData],
    };

    const queryResult: QueryResult<TDevelopers> = await client.query(
        queryConfig
    );

    if (queryResult.rowCount === 1) {
        return response.status(409).json({
            message: "Email already exists.",
        });
    }

    return next();
};

export const ensureDeveloperIdExists = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<Response | void> => {
    let id: number = parseInt(request.params.id);

    if (request.route.path === "/projects") {
        id = request.body.developerId;
    } else if (
        request.route.path === "/projects/:id" &&
        request.method === "PATCH"
    ) {
        id = request.body.developerId;
    }

    const queryString: string = `
    SELECT * FROM
        developers
    WHERE
        id = $1;
    `;

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id],
    };

    const queryResult: QueryResult<TDevelopers> = await client.query(
        queryConfig
    );

    if (queryResult.rowCount === 0) {
        return response.status(404).json({
            message: "Developer not found.",
        });
    }

    response.locals.developer = queryResult.rows[0];

    return next();
};

export const ensureOSVallue = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<Response | void> => {
    const entrieOS: string = request.body.preferredOS;

    const preferredOS: Array<string> = ["Windows", "Linux", "MacOS"];

    if (!preferredOS.includes(entrieOS)) {
        return response.status(400).json({
            message: "Invalid OS option.",
            options: ["Windows", "Linux", "MacOS"],
        });
    }

    return next();
};

export const ensureDeveloperInfosExists = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<Response | void> => {
    const id: number = parseInt(request.params.id);

    const queryString: string = `
    SELECT * FROM
        developer_infos
    WHERE
        "developerId" = $1;
    `;

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id],
    };

    const queryResult: QueryResult<TDevelopersInfo> = await client.query(
        queryConfig
    );

    if (queryResult.rowCount === 1) {
        return response.status(409).json({
            message: "Developer infos already exists.",
        });
    }

    return next();
};
