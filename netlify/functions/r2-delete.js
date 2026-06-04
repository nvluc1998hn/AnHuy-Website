const {
  handleOptions,
  json,
  parseBody,
  presignR2Delete,
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

    if (!body?.storage_key) {
      return json(400, { error: "Missing storage_key." });
    }

    const deleteUrl = presignR2Delete(body.storage_key);
    const response = await fetch(deleteUrl, { method: "DELETE" });

    if (![200, 204, 404].includes(response.status)) {
      const text = await response.text().catch(() => "");
      throw new Error(`R2 delete failed: ${response.status} ${text}`);
    }

    return json(200, { ok: true });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message });
  }
};
