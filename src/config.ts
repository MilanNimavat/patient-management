import * as dotenv from 'dotenv';
dotenv.config();

const Configs = {
  server: {
    port: process.env.PORT || 3001,
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsRegion: process.env.AWS_REGION as string,
    clientId: process.env.AWS_POOL_CLIENT_ID,
    poolId: process.env.AWS_USER_POOL_ID as string,
    awsTokenIssuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_USER_POOL_ID}`,
    dynamoDBTableName: 'Patients',
    openSearchDomain: process.env.OPENSEARCH_DOMAIN,
    openSearchIndexName: 'patients',
  },
};
export default Configs;
