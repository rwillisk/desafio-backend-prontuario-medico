import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { AppointmentController } from "../controllers/AppointmentController";
import { CreateAppointmentController } from "../controllers/CreateAppointmentController";
import { CreatePatientController } from "../controllers/CreatePatientController";
import { LoginController } from "../controllers/LoginController";
import { PatientController } from "../controllers/PatientController";
import { authMiddleware } from "../middlewares/auth";
import { PatientRepository } from "../repositories/PatientRepository";
import { AnonymizePatientService } from "../services/AnonymizePatientService";
import { CreatePatientService } from "../services/CreatePatientService";
import { UpdatePatientService } from "../services/UpdatePatientService";

import openapiDocument from "../../openapi.json";

const router = Router();

// Repositories
const patientRepository = new PatientRepository();

// Services
const createPatientService = new CreatePatientService(patientRepository);
const updatePatientService = new UpdatePatientService(patientRepository);
const anonymizePatientService = new AnonymizePatientService(patientRepository);

// Controllers
const createPatientController = new CreatePatientController(createPatientService);
const patientController = new PatientController(
  patientRepository,
  updatePatientService,
  anonymizePatientService,
);

const createAppointmentController = new CreateAppointmentController();
const appointmentController = new AppointmentController();
const loginController = new LoginController();

// Doc Routes
router.use("/api", swaggerUi.serve, swaggerUi.setup(openapiDocument));

// Public Route
router.post("/login", (req, res) => loginController.handle(req, res));

// Authenticated Routes
router.use(authMiddleware);

// Patients
router.post("/patients", (req, res) => createPatientController.handle(req, res));
router.get("/patients", (req, res) => patientController.index(req, res));
router.put("/patients/:id", (req, res) => patientController.update(req, res));
router.delete("/patients/:id", (req, res) => patientController.delete(req, res));

// Appointments
router.post("/appointments", createAppointmentController.handle);
router.get("/appointments", appointmentController.index);
router.get("/patients/:id/appointments", appointmentController.listByPatient);
router.put("/appointments/:id", appointmentController.update);
router.delete("/appointments/:id", appointmentController.delete);

export { router };
