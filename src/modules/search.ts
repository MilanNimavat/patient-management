import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { fromIni } from '@aws-sdk/credential-providers';
import Configs from '../config';
import { Patient } from './moduls.types';

const MODULE_NAME_FOR_LOG = 'search.ts';

const OpenSearchClient = new Client({
  ...AwsSigv4Signer({
    region: Configs.aws.awsRegion,
    service: 'es',
    getCredentials: fromIni({ profile: 'default' }),
  }),
  node: Configs.aws.openSearchDomain,
});

/**
 * Indexes a patient record into the OpenSearch cluster.
 *
 * @param {Patient} patientData - The patient data to be indexed.
 * @returns {Promise<void>} A promise that resolves when the patient data is indexed.
 */
export const indexPatient = async (patientData: Patient): Promise<void> => {
  console.log(`${MODULE_NAME_FOR_LOG}/indexPatient has been called`);
  try {
    await OpenSearchClient.index({
      index: Configs.aws.openSearchIndexName,
      id: patientData.PatientID,
      body: patientData,
    });
  } catch (error) {
    console.error(
      'Error occurred while indexing the patient in opensearch:',
      error,
    );
    throw new Error('Error occurred while indexing the patient in opensearch');
  }
};

/**
 * Remove patients from the OpenSearch cluster.
 *
 * @param {string} PatientID - The id to delete.
 * @returns {Promise<void>} A promise that resolves with the search results from OpenSearch.
 */
export const removePatientFromOpenSearch = async (
  PatientID: string,
): Promise<void> => {
  console.log(
    `${MODULE_NAME_FOR_LOG}/removePatientFromOpenSearch has been called`,
  );
  try {
    await OpenSearchClient.delete({
      index: Configs.aws.openSearchIndexName, // OpenSearch index name
      id: PatientID, // Use PatientID as the OpenSearch document ID
    });
    console.log('Patient removed from OpenSearch');
  } catch (error) {
    console.error(
      'Error occurred while removing patient from OpenSearch:',
      error,
    );
    throw new Error('Failed to remove patient from OpenSearch');
  }
};

/**
 * Searches for patients by medical condition in the OpenSearch cluster.
 *
 * @param {string} condition - The medical condition to search for.
 * @returns {Promise<any>} A promise that resolves with the search results from OpenSearch.
 */
export const searchByCondition = async (condition: string): Promise<any> => {
  console.log(`${MODULE_NAME_FOR_LOG}/searchByCondition has been called`);
  try {
    const searchResult = await OpenSearchClient.search({
      index: Configs.aws.openSearchIndexName,
      body: {
        query: {
          match: { Conditions: condition },
        },
      },
    });
    return searchResult.body.hits.hits;
  } catch (error) {
    console.error(
      'Error occurred while searching patient by condition from OpenSearch:',
      error,
    );
    throw new Error(
      'Error occurred while searching patient by condition from OpenSearch',
    );
  }
};

/**
 * Searches for patients by address in the OpenSearch cluster.
 *
 * @param {string} address - The address to search for.
 * @returns {Promise<any>} A promise that resolves with the search results from OpenSearch.
 */
export const searchByAddress = async (address: string): Promise<any> => {
  console.log(`${MODULE_NAME_FOR_LOG}/searchByAddress has been called`);
  try {
    const searchResult = await OpenSearchClient.search({
      index: Configs.aws.openSearchIndexName,
      body: {
        query: {
          match: { Address: address },
        },
      },
    });
    return searchResult.body.hits.hits;
  } catch (error) {
    console.error(
      'Error occurred while searching patient by address from OpenSearch:',
      error,
    );
    throw new Error(
      'Error occurred while searching patient by address from OpenSearch',
    );
  }
};
