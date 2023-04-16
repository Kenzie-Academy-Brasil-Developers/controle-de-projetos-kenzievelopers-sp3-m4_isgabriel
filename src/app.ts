import express, { Application } from "express";
import "dotenv/config";
import {
    ensureDeveloperInfosExists,
    ensureEmailExists,
    ensureDeveloperIdExists,
    ensureOSVallue,
} from "./middlewares/developers.middlewares";
import {
    createDeveloperInfo,
    deleteDeveloper,
    searchDeveloperById,
    createDeveloper,
    updateDeveloper,
} from "./logics/developers.logics";
import {
    createTechsByProject,
    deleteProject,
    deleteTechsByProject,
    searchProjectById,
    createProject,
    updateProject,
} from "./logics/projects.logics";
import {
    ensureProjectExists,
    ensureProjectTechNameExist,
    ensureTechsExists,
} from "./middlewares/projects.middlewares";

const app: Application = express();
app.use(express.json());

app.post("/developers", ensureEmailExists, createDeveloper);
app.get("/developers/:id", ensureDeveloperIdExists, searchDeveloperById);
app.patch(
    "/developers/:id",
    ensureDeveloperIdExists,
    ensureEmailExists,
    updateDeveloper
);
app.delete("/developers/:id", ensureDeveloperIdExists, deleteDeveloper);
app.post(
    "/developers/:id/infos",
    ensureDeveloperIdExists,
    ensureDeveloperInfosExists,
    ensureOSVallue,
    createDeveloperInfo
);

app.post("/projects", ensureDeveloperIdExists, createProject);
app.get("/projects/:id", ensureProjectExists, searchProjectById);
app.patch(
    "/projects/:id",
    ensureProjectExists,
    ensureDeveloperIdExists,
    updateProject
);
app.delete("/projects/:id", ensureProjectExists, deleteProject);
app.post(
    "/projects/:id/technologies",
    ensureProjectExists,
    ensureTechsExists,
    createTechsByProject
);
app.delete(
    "/projects/:id/technologies/:name",
    ensureProjectExists,
    ensureTechsExists,
    ensureProjectTechNameExist,
    deleteTechsByProject
);

export default app;
