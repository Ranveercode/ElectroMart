const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNGU3ZTFjZjg0MmY3ZGY4NWM2NGQwZiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzgzNjEwMzcxLCJleHAiOjE3ODM2MTEyNzF9.ZEACcCjt_vcaIhhVTgLjoSWO-zg8ADcSNEvi1HpimRE";

async function run() {
    try {
        const res = await fetch("http://localhost:5000/api/ai/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `jwt=${token}`
            },
            body: JSON.stringify({
                messages: [{ role: "user", content: "add zenith pro 16 in cart" }]
            })
        });
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Body:", text);
    } catch (e) {
        console.error("Fetch error:", e);
    }
}
run();
