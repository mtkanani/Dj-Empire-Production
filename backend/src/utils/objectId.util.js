/**
 * Utility helper to validate if a string is a valid MongoDB 24-character hexadecimal ObjectId
 * @param {any} id
 * @returns {boolean}
 */
export const isValidObjectId = (id) => {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
};
