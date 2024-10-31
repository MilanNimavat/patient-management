import express, { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  findPatientsByAddress,
  findPatientsByCondition,
} from './modules/dynamo';
import { authenticate } from './middleware/authentication.middleware';
import { searchByCondition, searchByAddress } from './modules/search';
import Configs from './config';

const app = express();
app.use(express.json());

// this is a test route for health check
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Patient Management API');
});

/**
 * Creates a new patient in the system.
 *
 * @param {Request} req - The patient data to be stored.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Object>} Returns the created patient object.
 */
app.post('/patients', authenticate, async (req: Request, res: Response) => {
  try {
    console.log('create patient route has been called');
    const { Name, Address, Conditions, Allergies } = req.body;
    const patientData = {
      PatientID: uuidv4(),
      Name,
      Address,
      Conditions,
      Allergies,
    };
    const result = await createPatient(patientData);
    console.log('patient has been created successfully');
    const response = {
      statusCode: 'CREATED_SUCCESSFULLY',
      data: result,
      description: 'Patient created successfully',
    };
    res.status(201).json(response);
  } catch (err) {
    res.status(500).send('Something went wrong!');
  }
});

/**
 * Updates a patient in the system.
 *
 * @param {Request} req - The patient data to be updated.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Object>} Returns the updated patient object.
 */
app.patch(
  '/patients/:id',
  authenticate,
  async (req: Request, res: Response) => {
    console.log('update patient route has been called');
    try {
      const { id } = req.params;
      const updateData = req.body;
      const result = await updatePatient(id, updateData);
      console.log('patient has been updated successfully');
      const response = {
        statusCode: 'UPDATED_SUCCESSFULLY',
        data: result,
        description: 'Patient updated successfully',
      };
      res.status(200).json(response);
    } catch (err) {
      res.status(500).send('Something went wrong!');
    }
  },
);

/**
 * Deletes a patient from the system.
 *
 * @param {Request} req - The patient data to be deleted.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Object>} Returns the deleted patient object.
 */
app.delete(
  '/patients/:id',
  authenticate,
  async (req: Request, res: Response) => {
    console.log('delete patient route has been called');
    try {
      const { id } = req.params;
      const result = await deletePatient(id);
      console.log('patient has been deleted successfully');
      const response = {
        statusCode: 'DELETED_SUCCESSFULLY',
        data: result,
        description: 'Patient deleted successfully',
      };
      res.status(200).json(response);
    } catch (err) {
      res.status(500).send('Something went wrong!');
    }
  },
);

/**
 * Search patients by their physical condition from the AWS Opensearch.
 *
 * @param {Request} req - The patient data to search.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Object>} Returns the patient object.
 */
app.get(
  '/patients/search/condition',
  authenticate,
  async (req: Request, res: Response) => {
    console.log(
      'Search patients by their physical condition route has been called',
    );
    try {
      const { condition } = req.query;
      const result = await searchByCondition(condition as string);
      console.log('patient has been searched successfully');
      const response = {
        statusCode: 'SEARCHED_SUCCESSFULLY',
        data: result,
        description: 'Patient searched successfully',
      };
      res.status(200).json(response);
    } catch (err) {
      res.status(500).send('Something went wrong!');
    }
  },
);

/**
 * Search patients by their address from the AWS Opensearch.
 *
 * @param {Request} req - The patient data to search.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Object>} Returns the patient object.
 */
app.get(
  '/patients/search/address',
  authenticate,
  async (req: Request, res: Response) => {
    console.log('Search patients by their address route has been called');
    try {
      const { address } = req.query;
      const result = await searchByAddress(address as string);
      console.log('patient has been searched successfully');
      const response = {
        statusCode: 'SEARCHED_SUCCESSFULLY',
        data: result,
        description: 'Patient searched successfully',
      };
      res.status(200).json(response);
    } catch (err) {
      res.status(500).send('Something went wrong!');
    }
  },
);

/**
 * Filter patients by their address from the AWS DynamoDB.
 *
 * @param {Request} req - The patient data to fetch.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Object>} Returns the patient object.
 */
app.get(
  '/patients/address',
  authenticate,
  async (req: Request, res: Response) => {
    console.log('Filter patients by their address route has been called');
    try {
      const { address } = req.query;
      const result = await findPatientsByAddress(address as string);
      console.log('patient has been fetched successfully by address');
      const response = {
        statusCode: 'FETCHED_SUCCESSFULLY',
        data: result.Items,
        description: 'Patient fetched successfully',
      };
      res.status(200).json(response);
    } catch (err) {
      res.status(500).send('Something went wrong!');
    }
  },
);

/**
 * Filter patients by their physical condition from the AWS DynamoDB.
 *
 * @param {Request} req - The patient data to fetch.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Object>} Returns the patient object.
 */
app.get(
  '/patients/condition',
  authenticate,
  async (req: Request, res: Response) => {
    console.log(
      'Filter patients by their physical condition route has been called',
    );
    try {
      const { condition } = req.query;
      const result = await findPatientsByCondition(condition as string);
      console.log('patient has been fetched successfully by condition');
      const response = {
        statusCode: 'FETCHED_SUCCESSFULLY',
        data: result.Items,
        description: 'Patient fetched successfully',
      };
      res.status(200).json(response);
    } catch (err) {
      res.status(500).send('Something went wrong!');
    }
  },
);

/**
 * Get patient by id from the AWS DynamoDB.
 *
 * @param {Request} req - The patient data to fetch.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Object>} Returns the patient object.
 */
app.get('/patients/:id', authenticate, async (req: Request, res: Response) => {
  console.log('Get patient by id route has been called');
  try {
    const { id } = req.params;
    const result = await getPatient(id);
    console.log('patient has been fetched successfully by id');
    const response = {
      statusCode: 'FETCHED_SUCCESSFULLY',
      data: result.Item,
      description: 'Patient fetched successfully',
    };
    res.status(200).json(response);
  } catch (err) {
    res.status(500).send('Something went wrong!');
  }
});

const PORT = Configs.server.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
