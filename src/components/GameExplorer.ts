import { Cloud } from '../services/Cloud';
import type { Game } from '../services/Cloud';

export function renderGameExplorer(container: HTMLElement) {
    container.innerHTML = `
    <div class="animate-fade-in">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem;">
        <button id="back-home-btn" style="background: transparent; border: 1px solid rgba(255,255,255,0.1);">← Back</button>
        <h2 style="margin: 0;">TOURNAMENT EXPLORER</h2>
        <div style="width: 80px;"></div>
      </div>

      <div class="card glass" style="margin-bottom: 2rem; padding: 1.5rem;">
        <div style="display: flex; gap: 1rem;">
          <input type="text" id="game-search-input" placeholder="Search tournaments or opponents (e.g. 'Junior Olympics')..." style="flex: 1; margin-bottom: 0;">
          <button id="search-action-btn">Search</button>
        </div>
      </div>

      <div id="games-results-container" class="grid-container" style="text-align: left;">
        <p style="text-align: center; grid-column: 1/-1; opacity: 0.5;">Enter a query to find games in the global database...</p>
      </div>
    </div>
  `;

    const searchInput = container.querySelector('#game-search-input') as HTMLInputElement;
    const resultsContainer = container.querySelector('#games-results-container')!;
    const searchBtn = container.querySelector('#search-action-btn')!;

    const performSearch = async () => {
        const query = searchInput.value;
        if (!query) return;

        resultsContainer.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Searching global registry...</p>';

        const games = await Cloud.searchGlobalGames(query);

        if (games.length === 0) {
            resultsContainer.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No games found.</p>';
            return;
        }

        resultsContainer.innerHTML = games.map(game => `
      <div class="card glass animate-fade-in" style="padding: 1.5rem; border-left: 4px solid var(--accent);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
          <span style="font-size: 0.7rem; color: var(--accent); font-weight: bold; text-transform: uppercase;">${game.tournament}</span>
          <span style="font-size: 0.7rem; opacity: 0.6;">${game.date}</span>
        </div>
        <h3 style="margin-bottom: 0.5rem;">vs ${game.opponent}</h3>
        <p style="font-size: 1.5rem; font-weight: 800; margin-bottom: 1.5rem;">
          ${game.score.us} <span style="opacity: 0.3; font-size: 1rem;">-</span> ${game.score.them}
        </p>
        <button class="import-btn" data-id="${game.id}" style="width: 100%; font-size: 0.8rem; background: rgba(0,243,255,0.1); border: 1px solid var(--accent); color: var(--accent);">
          IMPORT TO TEAM DATA
        </button>
      </div>
    `).join('');

        resultsContainer.querySelectorAll('.import-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const target = e.currentTarget as HTMLButtonElement;
                const id = target.getAttribute('data-id');
                const game = games.find(g => g.id === id);

                if (game) {
                    target.disabled = true;
                    target.innerHTML = 'Importing...';
                    await Cloud.saveGameToAccount(game);
                    target.innerHTML = '✅ Imported';
                    target.style.background = 'rgba(0,255,0,0.1)';
                    target.style.borderColor = '#00ff00';
                    target.style.color = '#00ff00';
                }
            });
        });
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    container.querySelector('#back-home-btn')?.addEventListener('click', () => {
        location.reload(); // Simple way to return to main.ts landing page
    });
}
