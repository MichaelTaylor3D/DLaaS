function matchKey(json, string) {
  const data = JSON.parse(json);
  for (const key in data) {
    if (string === key) {
      return true;
    }
  }
  return false;
}
