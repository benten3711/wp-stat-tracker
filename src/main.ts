import { renderScanner } from './components/Scanner';
import { renderSearch } from './components/Search';
import { renderDashboard } from './components/Dashboard';
import { renderLogin, AuthStore } from './components/Login';
import { renderGameExplorer } from './components/GameExplorer';

const app = document.querySelector<HTMLDivElement>('#app')!

// Handle Authentication State
const profile = AuthStore.getProfile();

if (!profile) {
  renderLogin(app);
} else {
  renderLandingPage();
}

function renderLandingPage() {
  const profile = AuthStore.getProfile()!;

  app.innerHTML = `
    <div class="animate-fade-in">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4rem;">
        <div>
          <h1 style="margin: 0;">${profile.organization.toUpperCase()}</h1>
          <p style="color: var(--accent); letter-spacing: 2px;">${profile.teamName} | ${profile.league}</p>
        </div>
        <button id="logout-btn" style="background: transparent; border: 1px solid rgba(255,255,255,0.1); font-size: 0.7rem; padding: 0.5rem 1rem;">Switch Profile</button>
      </div>

      <div class="grid-container" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
        <div class="card glass">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📷</div>
          <h3>Scanner</h3>
          <p style="font-size: 0.8rem; margin-top: 1rem; color: var(--text-secondary);">Upload scoresheet for AI analysis.</p>
          <button id="camera-btn">Start Scanning</button>
        </div>

        <div class="card glass">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🌐</div>
          <h3>Match Explorer</h3>
          <p style="font-size: 0.8rem; margin-top: 1rem; color: var(--text-secondary);">Lookup tournament games to import.</p>
          <button id="explorer-btn" style="background: transparent; border: 1px solid var(--accent);">Browse Games</button>
        </div>

        <div class="card glass">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
          <h3>Analytics</h3>
          <p style="font-size: 0.8rem; margin-top: 1rem; color: var(--text-secondary);">Real-time performance distribution.</p>
          <button id="stats-btn" style="background: transparent; border: 1px solid var(--accent);">View Team Data</button>
        </div>

        <div class="card glass">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3>Registry</h3>
          <p style="font-size: 0.8rem; margin-top: 1rem; color: var(--text-secondary);">Browse historical verified stats.</p>
          <button id="search-btn" style="background: transparent; border: 1px solid var(--accent);">Search Players</button>
        </div>
      </div>
    </div>
  `;

  // Setup simple event listeners for interaction
  document.querySelector('#camera-btn')?.addEventListener('click', () => {
    renderScanner(app);
  });

  document.querySelector('#explorer-btn')?.addEventListener('click', () => {
    renderGameExplorer(app);
  });

  document.querySelector('#search-btn')?.addEventListener('click', () => {
    renderSearch(app);
  });

  document.querySelector('#stats-btn')?.addEventListener('click', () => {
    renderDashboard(app);
  });

  document.querySelector('#logout-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to switch profiles?')) {
      AuthStore.logout();
    }
  });
}
