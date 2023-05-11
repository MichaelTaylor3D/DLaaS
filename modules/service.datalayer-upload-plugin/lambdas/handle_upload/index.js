exports.handler = async (event, context, callback) => {
  callback(null, {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ handle_upload: true }),
  });
};
