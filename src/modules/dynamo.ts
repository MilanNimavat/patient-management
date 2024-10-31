import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  GetCommandOutput,
  PutCommandOutput,
  UpdateCommandOutput,
  DeleteCommandOutput,
  QueryCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { indexPatient, removePatientFromOpenSearch } from './search';
import { Patient } from './moduls.types';
import Configs from '../config';

const client = new DynamoDBClient({ region: Configs.aws.awsRegion });
const dynamo = DynamoDBDocumentClient.from(client);
const TableName = Configs.aws.dynamoDBTableName;
const MODULE_NAME_FOR_LOG = 'dynamo.ts';

/**
 * Fetches a patient record by their PatientID from DynamoDB.
 *
 * @param {string} PatientID - The unique ID of the patient to fetch.
 * @returns {Promise<GetCommandOutput>} A promise that resolves with the patient data.
 */
export const getPatient = async (
  PatientID: string,
): Promise<GetCommandOutput> => {
  const result = await dynamo.send(
    new GetCommand({
      TableName,
      Key: { PatientID },
    }),
  );
  return result;
};

/**
 * Creates a new patient record in DynamoDB and indexes the patient into OpenSearch.
 *
 * @param {object} patientData - The patient data to be created.
 * @returns {Promise<Patient>} A promise that resolves when the patient is created and indexed.
 */
export const createPatient = async (patientData: any): Promise<Patient> => {
  console.log(`${MODULE_NAME_FOR_LOG}/createPatient has been called`);
  try {
    await dynamo.send(
      new PutCommand({
        TableName,
        Item: patientData,
      }),
    );

    // Index the patient into OpenSearch
    await indexPatient(patientData);
    return patientData;
  } catch (error) {
    console.error('Error occurred while creating the patient:', error);
    throw new Error('Error occurred while creating the patient');
  }
};

/**
 * Updates an existing patient record in DynamoDB.
 *
 * @param {string} PatientID - The unique ID of the patient to update.
 * @param {Partial<Patient>} updateData - The new data to update for the patient.
 * @returns {Promise<UpdateCommandOutput>} A promise that resolves with the updated patient data.
 */
export const updatePatient = async (
  PatientID: string,
  updateData: Partial<Patient>,
): Promise<UpdateCommandOutput> => {
  console.log(`${MODULE_NAME_FOR_LOG}/updatePatient has been called`);
  try {
    // Update the patient details into dynamodb
    return await dynamo.send(
      new UpdateCommand({
        TableName,
        Key: { PatientID },
        UpdateExpression:
          'SET #name = :name, #address = :address, #conditions = :conditions, #allergies = :allergies',
        ExpressionAttributeNames: {
          '#name': 'Name',
          '#address': 'Address',
          '#conditions': 'Conditions',
          '#allergies': 'Allergies',
        },
        ExpressionAttributeValues: {
          ':name': updateData.Name,
          ':address': updateData.Address,
          ':conditions': updateData.Conditions,
          ':allergies': updateData.Allergies,
        },
      }),
    );
  } catch (error) {
    console.error('Error occurred while updating the patient:', error);
    throw new Error('Error occurred while updating the patient');
  }
};

/**
 * Deletes a patient record from DynamoDB by their PatientID.
 *
 * @param {string} PatientID - The unique ID of the patient to delete.
 * @returns {Promise<DeleteCommandOutput>} A promise that resolves when the patient is deleted.
 */
export const deletePatient = async (
  PatientID: string,
): Promise<DeleteCommandOutput> => {
  console.log(`${MODULE_NAME_FOR_LOG}/deletePatient has been called`);
  try {
    // Remove the patient from dynamodb
    const result = await dynamo.send(
      new DeleteCommand({
        TableName,
        Key: { PatientID },
      }),
    );
    // Remove the patient from OpenSearch
    await removePatientFromOpenSearch(PatientID);
    return result;
  } catch (error) {
    console.error('Error occurred while deleting the patient:', error);
    throw new Error('Error occurred while deleting the patient');
  }
};

/**
 * Queries patients by their address using a Global Secondary Index (GSI) in DynamoDB.
 *
 * @param {string} Address - The address to search for patients.
 * @returns {Promise<QueryCommandOutput>} A promise that resolves with a list of patients matching the address.
 */
export const findPatientsByAddress = async (
  Address: string,
): Promise<QueryCommandOutput> => {
  console.log(`${MODULE_NAME_FOR_LOG}/findPatientsByAddress has been called`);
  try {
    return await dynamo.send(
      new QueryCommand({
        TableName,
        IndexName: 'Address-index', // Using the Address GSI
        KeyConditionExpression: 'Address = :address',
        ExpressionAttributeValues: {
          ':address': Address,
        },
      }),
    );
  } catch (error) {
    console.error(
      'Error occurred while fetching the patient by address:',
      error,
    );
    throw new Error('Error occurred while fetching the patient by address');
  }
};

/**
 * Queries patients by a specific medical condition using a Global Secondary Index (GSI) in DynamoDB.
 *
 * @param {string} input - The medical condition to search for.
 * @returns {Promise<QueryCommandOutput>} A promise that resolves with a list of patients matching the condition.
 */
export const findPatientsByCondition = async (
  input: string,
): Promise<QueryCommandOutput> => {
  console.log(`${MODULE_NAME_FOR_LOG}/findPatientsByCondition has been called`);
  try {
    return await dynamo.send(
      new ScanCommand({
        TableName,
        FilterExpression: 'contains(#Conditions, :condition)',
        ExpressionAttributeNames: {
          '#Conditions': 'Conditions', // Map 'Conditions' to avoid reserved word conflicts
        },
        ExpressionAttributeValues: {
          ':condition': input, // The condition value to search for
        },
      }),
    );
  } catch (error) {
    console.error(
      'Error occurred while fetching the patient by condition:',
      error,
    );
    throw new Error('Error occurred while fetching the patient by condition');
  }
};
