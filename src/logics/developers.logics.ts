import { Request, Response } from "express";
import {
    TDeveloperDataType,
    TDevelopers,
    TDevelopersInfo,
    TDevelopersInfoReq,
    TDevelopersReq,
} from "../interfaces/developers.interfaces";
import format from "pg-format";
import { QueryConfig, QueryResult } from "pg";
import { client } from "../database";

export const createDeveloper = async (
    request: Request,
    response: Response
): Promise<Response> => {
    const developerData: TDevelopersReq = request.body;

    const queryString: string = format(
        `
    INSERT INTO developers
        (%I)
    VALUES 
        (%L)
    RETURNING *; 
    `,
        Object.keys(developerData),
        Object.values(developerData)
    );

    const queryResult: QueryResult<TDevelopers> = await client.query(
        queryString
    );

    return response.status(201).json(queryResult.rows[0]);
};

export const searchDeveloperById = async (
    request: Request,
    response: Response
): Promise<Response> => {
    const id: number = parseInt(request.params.id);

    const queryString: string = `
        SELECT
            d."id" AS "developerId",
            d."name" AS "developerName",
            d."email" AS "developerEmail",
            di."developerSince" AS "developerInfoDeveloperSince",
            di."preferredOS" AS "developerInfoPreferredOS"
        FROM
            developers d
        FULL OUTER JOIN
            developer_infos di
        ON
            di."developerId" = d."id"
        WHERE
            d."id" = $1
        ;
    `;

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id],
    };

    const queryResult: QueryResult = await client.query(queryConfig);

    return response.status(200).json(queryResult.rows[0]);
};

export const updateDeveloper = async (
    request: Request,
    response: Response
): Promise<Response> => {
    const id: number = parseInt(request.params.id);
    const developerData: TDeveloperDataType = request.body;

    const updateColumns = Object.keys(developerData);
    const updateValues = Object.values(developerData);

    const queryString: string = format(
        `
        UPDATE
            developers
            SET(%I) = ROW(%L)
        WHERE
            id = $1
        RETURNING *;
    `,
        updateColumns,
        updateValues
    );

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id],
    };

    const queryResult: QueryResult<TDevelopers> = await client.query(
        queryConfig
    );

    return response.status(200).json(queryResult.rows[0]);
};

export const deleteDeveloper = async (
    request: Request,
    response: Response
): Promise<Response> => {
    const id: number = parseInt(request.params.id);

    const querySting: string = `
    DELETE FROM
        developers
    WHERE
        "id" =$1;    
    `;

    const queryconfig: QueryConfig = {
        text: querySting,
        values: [id],
    };

    await client.query(queryconfig);

    return response.status(204).send();
};

export const createDeveloperInfo = async (
    request: Request,
    response: Response
): Promise<Response> => {
    const developerInfoData: TDevelopersInfoReq = request.body;
    developerInfoData.developerId = parseInt(request.params.id);

    const queryString: string = format(
        `
        INSERT INTO
            developer_infos(%I)
        VALUES
            (%L)
        RETURNING *;
    `,
        Object.keys(developerInfoData),
        Object.values(developerInfoData)
    );

    const queryResult: QueryResult<TDevelopersInfo> = await client.query(
        queryString
    );

    return response.status(201).json(queryResult.rows[0]);
};
