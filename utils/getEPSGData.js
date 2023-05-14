const getEPSGData = async (country) => {
  const data = await fetch(`/api?country=${country ?? ""}`);
  return await data.json();
}

export default getEPSGData