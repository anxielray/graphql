import { getGroups, countInteractions, getCountryCode, getXPS } from "./utils.js";
 import { displayProfile } from "./profile.js";

const graphqlEndpoint = "https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql";

// Function to handle login
export async function login(evt) {
  evt.preventDefault()
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const credentials = btoa(`${username}:${password}`);

  try {
    const response = await fetch("https://learn.zone01kisumu.ke/api/auth/signin", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`
      }
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await response.json();

    // Store the authToken in local storage
    localStorage.setItem("authToken", data);

    // Redirect to the profile page after successful login
    return await displayProfile();
  } catch (error) {
    document.getElementById("error-message").innerText = error.message;
  }
}

// Function to handle logout
export function logout() {
  // Remove the authToken from local storage
  localStorage.removeItem("authToken");

  // Redirect to the login page after logout
  window.location.href = "index.html";
}


// Function to fetch user data using GraphQL query
export async function fetchUserData() {
  const authToken = localStorage.getItem("authToken");
  const response = await fetch(graphqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      query: `{
            user {
              id
              login
              firstName
              lastName
              campus
              auditRatio
              totalUp
              totalDown
              attrs
              groups {
                group {
                  members {
                    user {
                      login
                      }
                      }
                      object {
                        name
                        }
                        auditors(where:{grade: {_is_null: false}}) {
                    auditor {
                      login
                    }
                    grade
                  }
                }
                }
            }
            audits: transaction(
              order_by: {createdAt: asc}
              where: {type: {_regex: "up|down"}}
            ) {
              type
              amount
              path
              createdAt
              }
              xp: transaction(
                where: {
          userId: { _eq: 6868 },
          type: { _eq: "xp" },
          eventId: { _eq: 75 }
          },
          order_by: { createdAt: asc }
          ) {
        amount
        createdAt
        path
        eventId
        }
            skills: transaction(
              order_by: {type: asc, createdAt: desc,amount:desc}
              distinct_on: [type]
              where: {userId: {_eq: 6868}, _and: {type: {_like: "skill_%"}}}
              ) {
                type
                amount
                }
                xpTotal: transaction_aggregate(where: {type: {_eq: "xp"}, userId: {_eq: 6868}}) {
                  aggregate {
                    sum {
                  amount
                  }
                  }
                  }
                  }`
    }),
  });


  if (!response.ok) {
    window.location.href = "index.html"
  }

  const result = (await response.json()).data;
  const currentUserId = result.user[0].id;

  async function getXp(currentUserId) {

    const query = `
      query xpProgression($userId: Int!, $rootEventId: Int!) {
        transaction(
          where: {
            userId: { _eq: $userId },
            type: { _eq: "xp" },
            eventId: { _eq: $rootEventId }
          },
          order_by: { createdAt: asc }
        ) {
          amount
          createdAt
          path
          eventId
        }
      }
      `;

    try {
      const variables = { userId: parseInt(currentUserId), rootEventId: 75 };

      const response = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ query, variables })
      });

      const result = await response.json();

      if (result.errors) {
        console.error('GraphQL Errors fetching XP progression:', result.errors);
        return;
      }

      // Process data for graph (e.g., calculate cumulative XP)
      const xpData = result.data.transaction;
      let cumulativeXp = 0;
      const processedXpData = xpData.map(entry => {
        // console.log(entry)

        cumulativeXp += entry.amount;
        const date = new Date(entry.createdAt);

        // return {
        //   date: date,
        //   xp: cumulativeXp,
        //   path: entry.path
        // };
      });
      return cumulativeXp;
    } catch (error) {
      console.error('Error fetching XP progression:', error);
    }
  }

  const user = {
    id: result.user[0].id,
    login: result.user[0].login,
    email: result.user[0].attrs.email,
    nationality: result.user[0].attrs.country,
    campus: result.user[0].campus,
    ratio: result.user[0].auditRatio,
    firstName: result.user[0].firstName,
    lastName: result.user[0].lastName,

    xp: await getXp(currentUserId)
  }


  const groups = getGroups(result.user[0].groups);
  const interactions = countInteractions(groups, user);
  const xps = getXPS(result.xp, user.xp)
  const audit = result.audits;
  const skills = result.skills.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount)).slice(0, 10);

  if (result.errors) {
    logout();
    throw new Error(result.errors[0]);
  }
  displayUserData(user);
  displayRadarData(interactions);
  displayXp(xps);
  displaySkills(skills);
  displayDownUpRatio(result.user[0].totalUp, result.user[0].totalDown);
}

function displayDownUpRatio(up, down) {
  // Count the number of "down" and "up" transactions
  const downCount = down;
  const upCount = up;

  // Calculate the ratio
  const total = downCount + upCount;
  const downRatio = (downCount / total) * 100;
  const upRatio = (upCount / total) * 100;

  // Display the pie chart
  const dataString = `${downRatio};${upRatio}`;
  const labelsString = `Down - ${downRatio.toFixed(2)};Up - ${upRatio.toFixed(2)}`;
  const colors = getRandomColors(2).join(';');

  document.getElementById("pie").innerHTML = `<pie-chart id="demo" data="${dataString}" gap="0.06" colors="${colors}" donut="0.2" labels="${labelsString}"></pie-chart>`;
}

function displaySkills(data) {
  const skillDiv = document.getElementById("skills");
  skillDiv.innerHTML = ''; // Clear previous

  data.forEach((d) => {
    const skillName = d.type.replace("skill_", "").toUpperCase();
    const amount = Math.min(parseFloat(d.amount), 100); // Ensure max is 100

    const container = document.createElement("div");
    container.className = "skill-container";

    const label = document.createElement("div");
    label.className = "skill-label";
    label.textContent = `${skillName}: ${amount}%`;

    const barBg = document.createElement("div");
    barBg.className = "skill-bar-bg";

    const bar = document.createElement("div");
    bar.className = "skill-bar";
    bar.style.width = `${amount}%`;

    barBg.appendChild(bar);
    container.appendChild(label);
    container.appendChild(barBg);
    skillDiv.appendChild(container);
  });
}


function displayXp(data) {
  // Sorting data by score
  const sortedData = data.sort((a, b) => parseFloat(b.score) - parseFloat(a.score)).slice(0, 10);

  // Creating a color for each bar (you can customize this logic)
  const colors = getRandomColors(sortedData.length);

  // Creating the data string for the bar chart
  const dataString = sortedData.map((entry) => entry.score).join(';');
  const colorsString = colors.join(';');
  const labelsString = sortedData.map((entry) => entry.name).join(';');

  // Displaying the bar chart
  document.getElementById("bar").innerHTML = `<bar-chart data="${dataString}" colors="${colorsString}" labels="${labelsString}"></bar-chart>`;
}

// Function to generate random colors
function getRandomColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const color = getRandomColor();
    colors.push(color);
  }
  return colors;
}

// Function to generate a random color
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function displayRadarData(interactions) {
  const topUsers = Object.entries(interactions)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 10);

  const labels = topUsers.map(([user]) => user);
  const scores = topUsers.map(([, count]) => count);
  const ids = labels.map(label => `input_${label}`);
  const max = Math.max(...scores) + 1;
  const colors = getRandomColors(labels.length).join(';');

  const radarHTML = `
    <div class="radar-chart-wrapper">
      <h2 class="radar-title">🔥 Top Interactions</h2>
      <radar-chart 
        scores="${scores.join(';')}" 
        labels="${labels.join(';')}" 
        colors="${colors}" 
        ids="${ids.join(';')}" 
        max="${max}">
      </radar-chart>
    </div>
  `;

  document.getElementById("radar").innerHTML = radarHTML;
}


function formatByteSize(bytes) {
  const kilobyte = 1000;
  const megabyte = kilobyte * 1000;
  const gigabyte = megabyte * 1000;

  if (bytes >= gigabyte) {
    return (bytes / gigabyte).toFixed() + ' GB';
  } else if (bytes >= megabyte) {
    return (bytes / megabyte).toFixed() + ' MB';
  } else if (bytes >= kilobyte) {
    return (bytes / kilobyte).toFixed() + ' KB';
  } else {
    return bytes + ' Bytes';
  }
}

// Function to display user data on the profile page
function displayUserData(user) {
  const countryCode = getCountryCode(user.nationality)
  document.getElementById("welcome").innerText += ` ${user.firstName} ${user.lastName}`;
  document.getElementById("email").innerText = `📧 ${user.email}`;
  document.getElementById("login").innerText = `👤 ${user.login}`;
  document.getElementById("campus").innerText = `${user.campus}`;
  document.getElementById("ratio").innerText = `🖊️ ${user.ratio.toFixed(1)}`;
  document.getElementById("xp").innerText = `⭐ ${formatByteSize(user.xp)}`;
  document.getElementById("flag").setAttribute("src", `https://flagsapi.com/${countryCode}/flat/32.png`)
}
