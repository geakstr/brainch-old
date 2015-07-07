export

function cloneAssoc(o) {
  const r = Object.create(null);
  for (let p in o) {
    r[p] = o[p];
  }
  return r;
}