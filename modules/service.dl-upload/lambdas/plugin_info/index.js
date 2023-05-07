const pluginInfo = (event, context, callback) => {
  try {
    const info = {
      name: "S3 Plugin For DLaaS",
      version: "1.0.0",
      description:
        "A plugin to handle upload, for files in Amazon S3",
    };

    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info),
    });
  } catch (err) {
    console.error(`Error retrieving plugin info: ${err.message}`);
    callback(null, {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to retrieve plugin information" }),
    });
  }
};

exports.handler = pluginInfo;
