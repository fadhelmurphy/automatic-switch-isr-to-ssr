export async function getRandomAPI() {
    const res = await fetch('https://api.escuelajs.co/api/v1/products');
    const json = await res.json();
    return {
        name: json[0].title,
        description: json[0].description,
    };
}