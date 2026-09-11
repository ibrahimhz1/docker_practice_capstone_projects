'use strict';

const form = document.getElementById('form');
const nameEl = document.getElementById('name');
const bodyEl = document.getElementById('body');
const listEl = document.getElementById('list');
const errEl = document.getElementById('err');

function showError(msg) {
  errEl.textContent = msg || '';
  errEl.hidden = !msg;
}

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function render(messages) {
  listEl.innerHTML = '';
  for (const m of messages) {
    const card = document.createElement('div');
    card.className = 'card';

    const head = document.createElement('div');
    head.className = 'card-head';
    const who = document.createElement('span');
    who.className = 'who';
    who.textContent = m.name;
    const when = document.createElement('span');
    when.className = 'when';
    when.textContent = timeAgo(m.created_at);
    head.append(who, when);

    const text = document.createElement('p');
    text.className = 'body';
    text.textContent = m.body;

    card.append(head, text);
    listEl.append(card);
  }
}

async function load() {
  try {
    const res = await fetch('/api/messages');
    if (!res.ok) throw new Error(`load failed (${res.status})`);
    render(await res.json());
    showError('');
  } catch (e) {
    showError(e.message);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = { name: nameEl.value.trim(), body: bodyEl.value.trim() };
  if (!payload.name || !payload.body) return showError('name and message are required');
  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error || `post failed (${res.status})`);
    }
    bodyEl.value = '';
    showError('');
    await load();
  } catch (e) {
    showError(e.message);
  }
});

load();
setInterval(load, 10000);
