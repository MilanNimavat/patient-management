import { CognitoJwtVerifier } from 'aws-jwt-verify';
import jwt = require('jsonwebtoken');
import Configs from '../config';

const jwksClient = require('jwks-rsa');
const MODULE_NAME_FOR_LOG = 'authentication.middleware';

/**
 * Middleware to authenticate the incoming request using AWS Cognito JWT.
 *
 * @param {Object} req - The request object containing headers and parameters.
 * @param {Object} res - The response object used to send a response back to the client.
 * @param {Function} next - The next middleware function to call.
 * @returns {void} Sends a 401 status if authentication fails, or calls `next` if successful.
 */
export const authenticate = async (req: any, res: any, next: any) => {
  const token = req.headers['authorization'];
  try {
    if (!token) {
      throw new Error('Access denied');
    }

    const fetchJWKS = async () => {
      // validate the token
      const decodedJwt = jwt.decode(token, { complete: true });
      if (!decodedJwt) {
        console.log(
          `Invalid JWT token, Error occurred inside ${MODULE_NAME_FOR_LOG}/fetchJWKS`,
        );
        throw new Error('Access denied');
      }

      const { kid } = decodedJwt.header;
      if (!kid) {
        console.log(
          `Error occurred inside ${MODULE_NAME_FOR_LOG}, No 'kid' found from jwt token`,
        );
        throw new Error('Access denied');
      }

      const client = jwksClient({
        cache: true,
        jwksUri: `https://cognito-idp.${Configs.aws.awsRegion}.amazonaws.com/${Configs.aws.poolId}/.well-known/jwks.json`,
        cacheMaxEntries: 5,
        cacheMaxAge: 600000,
      });

      try {
        const key = await client.getSigningKey(kid);
        return key.getPublicKey();
      } catch (error) {
        console.log(
          `Error occurred inside ${MODULE_NAME_FOR_LOG}, Error fetching jwks.json from aws cognito`,
        );
        throw new Error('Access denied');
      }
    };

    const verifyToken = async (accessToken: string, publicKey: string) => {
      const verifier = CognitoJwtVerifier.create({
        userPoolId: Configs.aws.poolId,
        tokenUse: 'access',
        clientId: Configs.aws.clientId,
        publicKey,
      });

      try {
        const payload = await (
          verifier.verify as (token: string) => Promise<any>
        )(accessToken);
        return payload;
      } catch (error) {
        console.log(
          `Invalid JWT token, Error occurred inside ${MODULE_NAME_FOR_LOG}/verifyToken`,
        );
        throw new Error('Access denied');
      }
    };

    const publicKey = await fetchJWKS();
    const tokenData = await verifyToken(token, publicKey);
    if (!tokenData || !publicKey) {
      throw new Error('Access denied');
    }

    // Since the token is valid, now check for it's expiration, issuer and client ID.
    const currentTimeInSeconds = Math.round(new Date().getTime() / 1000);
    console.log(`Current Time is: ${currentTimeInSeconds}`);
    if (
      tokenData.client_id === Configs.aws.clientId &&
      tokenData.iss === Configs.aws.awsTokenIssuer &&
      currentTimeInSeconds <= tokenData.exp
    ) {
      console.log(
        'All set. The access token is valid. Proceeding with authorization',
      );
      return next();
    } else {
      console.log(
        `Token verification failed. The token is either invalid or has expired, Error occurred inside ${MODULE_NAME_FOR_LOG}`,
      );
      throw new Error('Access denied');
    }
  } catch (error) {
    res.status(401).send('Access denied');
  }
};
