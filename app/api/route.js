export const GET = async (req) => {
    try {
        const { country } = await req.json();

        if (!country) return new Response(JSON.stringify(["World", "Morocco", "Algeria"])); // epsg.map(item => item.country)

        return new Response(JSON.stringify(["1", "2", "3"])); // epsg.filter(item => item.country === country)
    } catch (error) {
        return new Response(error, { status: 500 });
    }
}