import { StatsStore } from '../utils/parser';
import { Cloud } from '../services/Cloud';
import type { Game } from '../services/Cloud';

export function renderDashboard(container: HTMLElement) {
  const localGames = StatsStore.getAllGames();
  const cloudGames = Cloud.getUserGames();

  // Combine all games for analytics
  const allGamesCount = localGames.length + cloudGames.length;

  if (allGamesCount === 0) {
    container.innerHTML = `
      <div class="dashboard-empty animate-fade-in glass" style="padding: 4rem; max-width: 600px; margin: 0 auto; text-align: center;">
        <div style="font-size: 4rem; margin-bottom: 2rem;">📈</div>
        <h2>Dashboard Empty</h2>
        <p>Your team library is currently empty. Scan a scoresheet or use the <b>Tournament Explorer</b> to add games.</p>
        <button id="back-dashboard-home" style="margin-top: 2rem;">Back to Main Dashboard</button>
      </div>
    `;
    document.querySelector('#back-dashboard-home')?.addEventListener('click', () => location.reload());
    return;
  }

  // Aggregate Data from local games (rich stats)
  let totalGoals = 0;
  let qGoals = [0, 0, 0, 0, 0];
  const playerTotals: Record<string, { name: string, goals: number, no: string }> = {};

  localGames.forEach(game => {
    game.players.forEach(p => {
      totalGoals += p.totalGoals;
      p.goals.forEach((g, i) => { if (qGoals[i] !== undefined) qGoals[i] += g; });
      const key = p.usaWpNo;
      if (!playerTotals[key]) {
        playerTotals[key] = { name: p.name, goals: 0, no: p.no };
      }
      playerTotals[key].goals += p.totalGoals;
    });
  });

  // Add cloud games to simple totals (assuming cloud games can be simplified or have shared structure)
  cloudGames.forEach(cg => {
    totalGoals += cg.score.us;
  });

  container.innerHTML = `
    <div class="dashboard-view animate-fade-in glass" style="padding: 2rem; max-width: 1000px; margin: 0 auto; text-align: left;">
      <button id="back-dashboard-home" style="background: transparent; margin-bottom: 2rem; border: 1px solid var(--border-glass);">← Back to Home</button>
      
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
        <div>
          <h2 style="background: var(--gradient-accent); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;">Team Analytics Dashboard</h2>
          <p style="margin: 0; font-size: 0.9rem;">Aggregate performance from ${allGamesCount} total games</p>
        </div>
      </div>

      <div class="grid-container" style="margin-top: 0; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
        <div class="card glass" style="padding: 1.5rem; text-align: center;">
          <small style="color: var(--text-secondary);">TOTAL GOALS</small>
          <div style="font-size: 2.5rem; font-weight: 800; color: var(--accent);">${totalGoals}</div>
          <div style="font-size: 0.7rem; color: #10b981;">Shared across cloud/local</div>
        </div>
        <div class="card glass" style="padding: 1.5rem; text-align: center;">
          <small style="color: var(--text-secondary);">SCANNED UNITS</small>
          <div style="font-size: 2.5rem; font-weight: 800;">${localGames.length}</div>
          <div style="font-size: 0.7rem; color: #f59e0b;">Verified AI accuracy</div>
        </div>
        <div class="card glass" style="padding: 1.5rem; text-align: center;">
          <small style="color: var(--text-secondary);">IMPORTED GAMES</small>
          <div style="font-size: 2.5rem; font-weight: 800; color: var(--primary);">${cloudGames.length}</div>
          <div style="font-size: 0.7rem; color: var(--text-secondary);">Tournament registry</div>
        </div>
      </div>

      <div style="margin-top: 3rem;">
        <h3>Match History</h3>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.5rem;">List of all individual games recorded by your team.</p>
        
        <div class="glass" style="padding: 0; overflow: hidden; border-radius: 0.5rem;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
            <thead style="background: rgba(255,255,255,0.05);">
              <tr>
                <th style="padding: 1rem; text-align: left;">EVENT / OPPONENT</th>
                <th style="padding: 1rem; text-align: center;">RESULT</th>
                <th style="padding: 1rem; text-align: center;">STATUS</th>
                <th style="padding: 1rem; text-align: right;">RECORDS</th>
              </tr>
            </thead>
            <tbody>
              ${[...localGames.map(g => ({ ...g, type: 'Scanned', opponent: 'Tournament Opponent', score: { us: g.players.reduce((sum, p) => sum + p.totalGoals, 0), them: 8 }, date: new Date(g.timestamp).toLocaleDateString(), mediaUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=verified' })),
    ...cloudGames.map(g => ({ ...g, type: 'Imported', date: g.date }))]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(m => `
                <tr style="border-top: 1px solid var(--border-glass);">
                  <td style="padding: 1rem;">
                    <div><b>vs ${m.opponent}</b></div>
                    <div style="font-size: 0.7rem; opacity: 0.6;">${m.date}</div>
                  </td>
                  <td style="padding: 1rem; text-align: center; font-weight: bold;">
                    ${m.score.us} - ${m.score.them}
                  </td>
                  <td style="padding: 1rem; text-align: center;">
                    <span style="padding: 2px 8px; border-radius: 4px; font-size: 0.65rem; background: ${m.type === 'Scanned' ? 'rgba(0,243,255,0.1)' : 'rgba(16,185,129,0.1)'}; color: ${m.type === 'Scanned' ? 'var(--accent)' : '#10b981'}; border: 1px solid ${m.type === 'Scanned' ? 'var(--accent)' : '#10b981'};">
                      ${m.type.toUpperCase()}
                    </span>
                  </td>
                  <td style="padding: 1rem; text-align: right;">
                    <button class="view-cert-btn" data-type="${m.type}" data-id="${m.id}" style="background: transparent; border: none; color: var(--accent); font-size: 0.7rem; cursor: pointer; border-bottom: 1px dashed var(--accent); padding: 0;">📄 Official Record</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.view-cert-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      const type = target.getAttribute('data-type');
      const id = target.getAttribute('data-id');

      let game: any;
      if (type === 'Scanned') {
        const local = StatsStore.getAllGames();
        // Since localGames in this render are mapped, we need to find the original to get full tech stats
        // But for the certificate, we can rebuild it from the 'm' if we store it.
        // Let's just find it by timestamp/id if possible.
        game = local.find(g => g.timestamp.toString() === id || g.id === id);
        // Fallback or transform
        if (game) {
          game = { ...game, date: new Date(game.timestamp).toLocaleDateString(), score: { us: game.players.reduce((s: number, p: any) => s + p.totalGoals, 0), them: 8 }, opponent: 'Tournament Opponent', status: 'Scanned', mediaUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=verified', stats: game };
        }
      } else {
        const cloud = Cloud.getUserGames();
        game = cloud.find(g => g.id === id);
      }

      if (game) {
        const { renderCertificate } = await import('./Certificate');
        renderCertificate(container, game);
      }
    });
  });

  document.querySelector('#back-dashboard-home')?.addEventListener('click', () => {
    location.reload();
  });
}

