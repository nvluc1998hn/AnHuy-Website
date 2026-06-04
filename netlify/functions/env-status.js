const { getEnvStatus, handleOptions, json } = require("./_r2-utils");

exports.handler = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  return json(200, getEnvStatus());
};
