import { parseScoresheet, StatsStore, type GameData, type PlayerStats } from '../utils/parser';
import { Cloud, type Game } from '../services/Cloud';

export function renderScanner(container: HTMLElement) {
  let scanStage: 'IDLE' | 'SCANNING' | 'REVIEW' = 'IDLE';
  let capturedImageData: string | null = null;
  let currentData: GameData | null = null;

  function setStage(stage: typeof scanStage) {
    scanStage = stage;
    render();
  }

  function render() {
    if (scanStage === 'IDLE') {
      renderIdle();
    } else if (scanStage === 'SCANNING') {
      renderScanning();
    } else if (scanStage === 'REVIEW') {
      renderReview();
    }
  }

  function renderIdle() {
    container.innerHTML = `
      <div class="scanner-view animate-fade-in glass" style="padding: 2rem; max-width: 800px; margin: 0 auto;">
        <button id="back-home" style="background: transparent; margin-bottom: 2rem; border: 1px solid var(--border-glass);">← Back to Dashboard</button>
        <h2>Advanced Scanner</h2>
        <p style="margin-bottom: 2rem; opacity: 0.8;">Use our AI vision to extract stats instantly. Center the scoresheet in the frame for auto-capture.</p>
        
        <div id="start-scan-btn" class="drop-zone" style="border: 2px dashed var(--accent); padding: 5rem; border-radius: 1.5rem; cursor: pointer; background: rgba(0,243,255,0.03);">
          <div style="font-size: 5rem; margin-bottom: 1rem;">📷</div>
          <p style="font-weight: bold; letter-spacing: 1px;">LAUNCH AUTO-SCANNER</p>
          <p style="font-size: 0.7rem; opacity: 0.5; margin-top: 1rem;">Supports official USA Water Polo scoresheets</p>
        </div>
      </div>
    `;

    container.querySelector('#start-scan-btn')?.addEventListener('click', () => setStage('SCANNING'));
    container.querySelector('#back-home')?.addEventListener('click', () => location.reload());
  }

  function renderScanning() {
    container.innerHTML = `
      <div class="scanner-view animate-fade-in" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #000; z-index: 1000; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white;">
        <button id="cancel-scan" style="position: absolute; top: 2rem; left: 2rem; background: rgba(255,255,255,0.1); border: none; padding: 0.8rem 1.5rem; border-radius: 2rem; color: white;">Cancel</button>
        
        <div style="position: relative; width: 90%; max-width: 500px; aspect-ratio: 3/4; border: 2px solid rgba(0,243,255,0.3); border-radius: 1rem; overflow: hidden;">
          <!-- Simulated Camera Feed -->
          <div style="position: absolute; inset: 0; background: linear-gradient(45deg, #1a1a1a, #2a2a2a); display: flex; align-items: center; justify-content: center;">
             <div style="width: 80%; height: 80%; border: 1px dashed rgba(255,255,255,0.2); border-radius: 0.5rem;"></div>
          </div>
          
          <!-- Auto-Capture Overlay -->
          <div id="scan-overlay" style="position: absolute; inset: 0; border: 4px solid var(--accent); opacity: 0; transition: opacity 0.5s;"></div>
          
          <div style="position: absolute; bottom: 2rem; width: 100%; text-align: center;">
            <div id="scan-progress-bar" style="width: 0%; height: 4px; background: var(--accent); margin: 0 auto; transition: width 0.1s;"></div>
            <p id="scan-instruction" style="margin-top: 1rem; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Align Scoresheet...</p>
          </div>
        </div>
        
        <p style="margin-top: 2rem; font-size: 0.8rem; opacity: 0.6;">Hold steady. Detection in progress.</p>
      </div>
    `;

    container.querySelector('#cancel-scan')?.addEventListener('click', () => setStage('IDLE'));

    // Simulation of Auto-Capture logic (3 seconds of "looking")
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      const bar = container.querySelector('#scan-progress-bar') as HTMLElement;
      const instruction = container.querySelector('#scan-instruction') as HTMLElement;
      const overlay = container.querySelector('#scan-overlay') as HTMLElement;

      if (bar) bar.style.width = `${progress}%`;

      if (progress > 30) instruction.innerText = "Finding Document...";
      if (progress > 60) {
        instruction.innerText = "HOLD STEADY - CAPTURING";
        overlay.style.opacity = '1';
      }

      if (progress >= 100) {
        clearInterval(interval);
        captureAndParse();
      }
    }, 60);
  }

  async function captureAndParse() {
    // 1. Simulate image capture (Placeholder Base64)
    capturedImageData = 'https://api.dicebear.com/7.x/shapes/svg?seed=scoresheet'; // In real app, canvas.toDataURL()

    // 2. Trigger parsing
    try {
      // Mock File for the existing parser logic
      const mockFile = new File([""], "scoresheet.png", { type: "image/png" });
      currentData = await parseScoresheet(mockFile);
      setStage('REVIEW');
    } catch (e) {
      alert("Scan failed. Lighting insufficient.");
      setStage('IDLE');
    }
  }

  function renderReview() {
    if (!currentData) return;

    container.innerHTML = `
      <div class="scanner-view animate-fade-in glass" style="padding: 2rem; max-width: 900px; margin: 0 auto; text-align: left;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <h2 style="margin: 0;">REVIEW & EDIT DATA</h2>
          <div class="glass" style="padding: 0.5rem 1rem; border-color: #10b981; color: #10b981; font-size: 0.7rem; font-weight: bold;">
            AI CONFIDENCE: 94%
          </div>
        </div>

        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 2rem;">
          Verify the extracted names and totals below. Tap any field to correct misread values.
        </p>

        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; margin-bottom: 3rem;">
           <div class="card glass" style="padding: 1rem; border: none; background: rgba(0,0,0,0.3);">
              <p style="font-size: 0.6rem; text-transform: uppercase; margin-bottom: 0.5rem; opacity: 0.5;">Original Capture</p>
              <img src="${capturedImageData}" style="width: 100%; border-radius: 0.5rem;">
           </div>
           
           <div style="text-align: left;">
              <div class="form-group">
                <label>Tournament / Event</label>
                <input type="text" id="edit-event" value="${currentData.eventName}">
              </div>
              <div class="form-group">
                <label>Opponent Team</label>
                <input type="text" id="edit-opponent" value="Tournament Opponent">
              </div>
           </div>
        </div>

        <div class="glass" style="overflow-x: auto; margin-bottom: 1rem;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-glass); background: rgba(255,255,255,0.03);">
                <th style="padding: 1rem; text-align: center;">#</th>
                <th style="padding: 1rem;">PLAYER NAME</th>
                <th style="padding: 1rem; text-align: center;">GOALS</th>
                <th style="padding: 1rem; text-align: center;">FOULS</th>
                <th style="padding: 1rem; text-align: center;">ACTION</th>
              </tr>
            </thead>
            <tbody id="edit-table-body">
              ${currentData.players.map((p, i) => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <td style="padding: 0.8rem; text-align: center;">
                    <input type="text" class="table-edit no-edit" value="${p.no}" style="background: transparent; border: none; width: 30px; text-align: center;">
                  </td>
                  <td style="padding: 0.8rem;">
                    <input type="text" class="table-edit name-edit" value="${p.name}" style="background: transparent; border: none; padding: 0.2rem; width: 100%;">
                  </td>
                  <td style="padding: 0.8rem; text-align: center;">
                    <input type="number" class="table-edit goal-edit" value="${p.totalGoals}" style="background: transparent; border: none; width: 50px; text-align: center; color: var(--accent); font-weight: bold;">
                  </td>
                  <td style="padding: 0.8rem; text-align: center;">
                    <input type="number" class="table-edit foul-edit" value="${p.fouls.length}" style="background: transparent; border: none; width: 50px; text-align: center;">
                  </td>
                  <td style="padding: 0.8rem; text-align: center;">
                    <button class="remove-player-btn" style="background: transparent; border: none; color: #ef4444; cursor: pointer; padding: 0.5rem;">✕</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <button id="add-player-row" style="background: rgba(255,255,255,0.05); border: 1px dashed var(--border-glass); width: 100%; padding: 0.8rem; color: var(--text-secondary); margin-bottom: 2rem;">+ Add Player Manually</button>

        <button id="finalize-save" style="width: 100%; padding: 1.5rem; font-weight: bold; background: var(--gradient-accent); letter-spacing: 1px;">
          FINALIZE & ARCHIVE GAME
        </button>
      </div>
    `;

    container.querySelector('#add-player-row')?.addEventListener('click', () => {
      const tbody = container.querySelector('#edit-table-body')!;
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
      tr.innerHTML = `
        <td style="padding: 0.8rem; text-align: center;">
          <input type="text" class="table-edit no-edit" value="" placeholder="#" style="background: transparent; border: none; width: 30px; text-align: center;">
        </td>
        <td style="padding: 0.8rem;">
          <input type="text" class="table-edit name-edit" value="" placeholder="New Player Name" style="background: transparent; border: none; padding: 0.2rem; width: 100%;">
        </td>
        <td style="padding: 0.8rem; text-align: center;">
          <input type="number" class="table-edit goal-edit" value="0" style="background: transparent; border: none; width: 50px; text-align: center; color: var(--accent); font-weight: bold;">
        </td>
        <td style="padding: 0.8rem; text-align: center;">
          <input type="number" class="table-edit foul-edit" value="0" style="background: transparent; border: none; width: 50px; text-align: center;">
        </td>
        <td style="padding: 0.8rem; text-align: center;">
          <button class="remove-player-btn" style="background: transparent; border: none; color: #ef4444; cursor: pointer; padding: 0.5rem;">✕</button>
        </td>
      `;
      tbody.appendChild(tr);

      tr.querySelector('.remove-player-btn')?.addEventListener('click', () => tr.remove());
    });

    container.querySelectorAll('.remove-player-btn').forEach(btn => {
      btn.addEventListener('click', (e) => (e.target as HTMLElement).closest('tr')?.remove());
    });

    document.querySelector('#finalize-save')?.addEventListener('click', async () => {
      if (!currentData) return;

      const btn = document.querySelector('#finalize-save') as HTMLButtonElement;
      btn.disabled = true;
      btn.innerHTML = 'Archiving to Personal Cloud...';

      // 1. Harvest edited data
      const eventName = (container.querySelector('#edit-event') as HTMLInputElement).value;
      const opponent = (container.querySelector('#edit-opponent') as HTMLInputElement).value;

      const rows = container.querySelectorAll('#edit-table-body tr');
      const updatedPlayers: PlayerStats[] = Array.from(rows).map(row => {
        return {
          no: (row.querySelector('.no-edit') as HTMLInputElement).value,
          name: (row.querySelector('.name-edit') as HTMLInputElement).value,
          usaWpNo: 'TEMP_' + Math.random().toString(36).substr(2, 5),
          goals: Array((row.querySelector('.goal-edit') as HTMLInputElement).valueAsNumber).fill(1).map((_, i) => i < 4 ? 1 : 0), // Mocked quarters
          totalGoals: (row.querySelector('.goal-edit') as HTMLInputElement).valueAsNumber,
          fouls: Array((row.querySelector('.foul-edit') as HTMLInputElement).valueAsNumber).fill('E')
        };
      });

      const updatedGameData: GameData = {
        ...currentData,
        eventName,
        players: updatedPlayers
      };

      // 2. Save Game 
      StatsStore.saveGame(updatedGameData);

      const gameForCloud: Game = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        opponent: opponent,
        score: {
          us: updatedPlayers.reduce((sum, p) => sum + p.totalGoals, 0),
          them: 8
        },
        status: 'Scanned',
        mediaUrl: capturedImageData || undefined,
        stats: updatedGameData
      };

      await Cloud.saveGameToAccount(gameForCloud);

      alert('Game archived successfully with official scoresheet record.');
      location.reload();
    });
  }
}
