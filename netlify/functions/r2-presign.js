const {
  handleOptions,
  json,
  parseBody,
  presignR2Upload,
  requireAuthenticatedUser,
} = require("./_r2-utils");

exports.handler = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  try {
    await requireAuthenticatedUser(event);
    const body = parseBody(event);

    if (!body?.file_name) {
      return json(400, { error: "Missing file_name." });
    }

    return json(200, presignR2Upload({
      fileName: body.file_name,
      folder: body.folder || "products",
    }));
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message });
  }
};
