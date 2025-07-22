export async function displayProfile() {
    document.open();
    document.write(`
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>User Profile</title>
        <link rel="icon"
            href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%2210 0 100 100%22><text y=%22.90em%22 font-size=%2290%22>🧠</text></svg>">
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap" rel="stylesheet">
    
        <script src="https://cdn.tailwindcss.com"></script>
        <script type="module">
            import { fetchUserData } from "./js/app.js";
            if (!localStorage.getItem("authToken")) {
                window.location.href = "index.html";
            } else {
                fetchUserData();
            }
        </script>
        <link rel="stylesheet" href="css/style.css">
    </head>
    
    <body class="min-h-screen flex flex-col">
        <header class="p-6 flex justify-between items-center border-b border-white/20">
        <a href="#">
            <div class="relative w-12 h-12 rounded-full border-4 border-green-400 overflow-hidden mr-4">
                <img src="img/zone01-kisumu-a9a10ccd.jpg" alt="Avatar" class="object-cover w-full h-full" />
            </div>
        </a>
    
            <h1 class="neon">Welcome, <span id="welcome" class="text-sky-400"></span></h1>
            <button id="logoutButton"
                class="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700
 text-white px-4 py-2 rounded-lg font-bold hover:scale-105 transition">Logout</button>
        </header>
    
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            <section class="glass p-6 col-span-2 space-y-4 pointer-events-none">
            <h2 class="radar-title text-xl font-bold mb-4">Your Data Summary</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm pointer-events-auto">
                <div class="glass p-3 rounded-lg data-frame">📧 Email: <span id="email" class="font-semibold"></span></div>
                <div class="glass p-3 rounded-lg data-frame">🕒 Login: <span id="login"></span></div>
                <div class="glass p-3 rounded-lg data-frame">Nationality: <img id="flag" class="inline w-6 h-4 ml-2"></div>
                <div class="glass p-3 rounded-lg data-frame">🎓 Campus: <span id="campus"></span></div>
                <div class="glass p-3 rounded-lg data-frame">📊 Audit Ratio: <span id="ratio"></span></div>
                <div class="glass p-3 rounded-lg data-frame">🔥 XP: <span id="xp"></span></div>
            </div>
            </section>

    
            <section class="glass p-6">
                <h2 class="text-xl font-bold mb-4"></h2>
                <div id="radar" class="w-full h-64 flex items-center justify-center">
                    <!-- Radar Chart Placeholder -->
                </div>
            </section>
    
            <section class="glass p-6 col-span-3">
                <h2 class="text-xl font-bold mb-4">📱 Visual Insights</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="mb-2 text-lg">Top 10 Skills</h3>
                        <div id="skills" class="h-64 overflow-y-auto glass p-4"></div>
                    </div>
                    <div>
                        <h3 class="mb-2 text-lg">Audit Breakdown</h3>
                        <div id="pie" class="h-64 flex items-center justify-center glass"></div>
                    </div>
                    <div>
                        <h3 class="mb-2 text-lg">Top Projects</h3>
                        <div id="bar" class="h-64 flex items-center justify-center glass"></div>
                    </div>
                    <div>   
                        <h3 class="mb-2 text-lg">Progression Status</h3>
                        <div
                            class="h-64 flex items-center justify-center text-center border border-white/20 rounded-lg text-white/50">
                            🚧 This feature is not implemented yet
                        </div>
                    </div>
                </div>
            </section>
        </main>
    
        <script src="js/chart.js"></script>
        <script type="module">
            import { logout } from "./js/app.js";
            document.getElementById("logoutButton").addEventListener("click", () => logout());
        </script>
    </body>
    
    </html>
  `);
    document.close();
}
