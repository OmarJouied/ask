const getEPSGData = async (country) => {
  const data = await fetch('/api', {
    method: "POST",
    body: JSON.stringify({ country })
  });
  return await data.json();
}

export default getEPSGData