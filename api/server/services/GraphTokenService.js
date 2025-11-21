// const client = require('openid-client'); // Disabled for Gemini-only setup
const { logger } = require('@librechat/data-schemas');
// const { CacheKeys } = require('librechat-data-provider');
// const { getOpenIdConfig } = require('~/strategies/openidStrategy');
// const getLogStores = require('~/cache/getLogStores');

/**
 * Get Microsoft Graph API token using existing token exchange mechanism
 * @param {Object} user - User object with OpenID information
 * @param {string} accessToken - Current access token from Authorization header
 * @param {string} scopes - Graph API scopes for the token
 * @param {boolean} fromCache - Whether to try getting token from cache first
 * @returns {Promise<Object>} Graph API token response with access_token and expires_in
 */
async function getGraphApiToken(user, accessToken, scopes, fromCache = true) {
  // Graph API functionality disabled for Gemini-only setup
  logger.warn('[GraphTokenService] Graph API functionality is disabled');
  throw new Error('Graph API functionality is disabled in this configuration');
}

module.exports = {
  getGraphApiToken,
};
