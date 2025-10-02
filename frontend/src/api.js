const API_BASE = '';   // backend server URL

export async function postJson(path, body, token){
  const res = await fetch(API_BASE + path, {
    method:'POST',
    headers: { 
      'Content-Type':'application/json', 
      ...(token ? { Authorization: `Bearer ${token}` } : {}) 
    },
    body: JSON.stringify(body)
  });
  return res.json();
}

export async function getJson(path, token){
  const res = await fetch(API_BASE + path, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  });
  return res.json();
}

